// app.jsx — Dumpling's terminal-profile (orchestrates the terminal stream).
//
// All data (identity, repos, orgs, commits, tech stack, ...) lives in
// profile-data.js and is loaded through profile-source.js.

const { useState, useEffect, useMemo, useRef } = React;

// ─── Data binding ────────────────────────────────────────────────────────
const DEFAULT_PROFILE_DATA = window.PROFILE_DATA || {};

let PROFILE;
let PINNED;
let OWN_REPOS;
let ORGS;
let ACHIEVEMENTS;
let TECH;
let SIGNATURES;
let COMMITS;
let HEATMAP;
let HEATMAP_COUNTS;
let HEATMAP_MONTHS;
let PROFILE_SOURCE;

function applyProfileData(data) {
  const PD = data || DEFAULT_PROFILE_DATA;
  PROFILE      = { ...(PD.identity || {}), stats: PD.stats || {} };
  PINNED       = PD.pinned || [];
  OWN_REPOS    = PD.ownRepos || [];
  ORGS         = PD.orgs || [];
  ACHIEVEMENTS = PD.achievements || [];
  TECH         = PD.tech || [];
  SIGNATURES   = PD.signatures || [];
  COMMITS      = PD.commits || [];
  HEATMAP      = PD.heatmap?.weeks || [];
  HEATMAP_COUNTS = PD.heatmap?.counts || null;
  HEATMAP_MONTHS = PD.heatmap?.months || [];
  PROFILE_SOURCE = PD.source || { kind: "snapshot", asOf: "unknown" };
}

applyProfileData(DEFAULT_PROFILE_DATA);

const INITIAL_PROFILE_BOOT = [
  { ok: true, s: "Mounted", m: "GitHub snapshot" },
];

// ─── Defaults persisted via tweaks ───────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mode": "auto",
  "accent": "amber",
  "density": "compact",
  "showCursor": true,
  "showAscii": true,
  "replayBoot": false,
  "showParticles": false
}/*EDITMODE-END*/;

// Per-mode metadata: which accent variant + heatmap base color
const MODE_META = {
  noir:  { isLight: false, hmBase: "#1a1c1f" },
  slate: { isLight: false, hmBase: "#2b313b" },
  solar: { isLight: false, hmBase: "#184049" },
  paper: { isLight: true,  hmBase: "#e8e5dc" },
  // legacy aliases
  dark:  { isLight: false, hmBase: "#1a1c1f" },
  light: { isLight: true,  hmBase: "#e8e5dc" },
};

const ACCENTS = {
  // Dark-mode accents (and their light-mode counterparts)
  amber: { c: "#e5a648", dim: "#7a5a26", glow: "rgba(229,166,72,0.18)",
           lc: "#a8721f", ldim: "#c79352", lglow: "rgba(168,114,31,0.10)",  name: "amber" },
  mint:  { c: "#5feab6", dim: "#2f7a5e", glow: "rgba(95,234,182,0.18)",
           lc: "#1f7a52", ldim: "#4ea888", lglow: "rgba(31,122,82,0.10)",   name: "mint"  },
  cyan:  { c: "#66c4d9", dim: "#36697a", glow: "rgba(102,196,217,0.18)",
           lc: "#246a7a", ldim: "#5a9aac", lglow: "rgba(36,106,122,0.10)",  name: "cyan"  },
  mono:  { c: "#d9dadd", dim: "#6e7177", glow: "rgba(217,218,221,0.10)",
           lc: "#1a1c1f", ldim: "#6e7177", lglow: "rgba(26,28,31,0.05)",    name: "mono"  },
};

// ─── Utilities ───────────────────────────────────────────────────────────
const formatStars = (n) => n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/,"") + "k" : String(n);
const ASCII_NAME = [
  "   ____                            __  __   ",
  "  / __ \\__  ______ ___  ____  ____/ /_/ /__ ",
  " / / / / / / / __ `__ \\/ __ \\/ __  / //_/ / ",
  "/ /_/ / /_/ / / / / / / /_/ / /_/ /  <  / /  ",
  "/_____/\\__,_/_/ /_/ /_/ .___/\\__,_/ /_/ /_/   ",
  "                     /_/                    ",
  "        ── the terminal portfolio ──        ",
];

// ─── BlinkingCursor ──────────────────────────────────────────────────────
// Local stub — actual Cursor lives in boot-sequence.jsx so that file can use it
// without depending on app.jsx's evaluation order. Re-export for local readability.
const Cursor = window.Cursor;

// ─── Starfield particle background ──────────────────────────────────────
function Starfield() {
  const stars = useMemo(() => {
    const s = [];
    for (let i = 0; i < 80; i++) {
      const x = (Math.sin(i * 12.9898) * 43758.5453) % 1 * 100;
      const y = (Math.cos(i * 78.233) * 43758.5453) % 1 * 100;
      const size = ((i * 7) % 20) / 10 + 0.6;
      const alpha = ((i * 3) % 30) / 100 + 0.08;
      s.push(`${x.toFixed(1)}vw ${y.toFixed(1)}vh 0 ${size}px rgba(255,255,255,${alpha.toFixed(2)})`);
    }
    return s.join(',');
  }, []);
  return (<div className="starfield" aria-hidden="true"><style>{`.starfield::after{box-shadow:${stars};}`}</style></div>);
}

// ─── Boot sequence at top of page ────────────────────────────────────────
function BootLine({ k, v, accent }) {
  return (
    <div className="boot-line">
      <span className="dim">[</span>
      <span style={{ color: accent }}>OK</span>
      <span className="dim">]</span>
      <span style={{ marginLeft: 10 }} className="dim">{k}</span>
      <span style={{ marginLeft: 6 }}>{v}</span>
    </div>
  );
}

// ─── Status bar (tmux-like) ──────────────────────────────────────────────
function StatusBar({ accent, mode, themeLabel, locale, onLanguageChange }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = String(time.getHours()).padStart(2,"0");
  const mm = String(time.getMinutes()).padStart(2,"0");
  const ss = String(time.getSeconds()).padStart(2,"0");
  const fgOnAccent = (mode === "light" || mode === "paper") ? "#fbf7ea" : "#0a0b0d";
  return (
    <div className="statusbar">
      <div className="sb-left">
        <span className="sb-cell" style={{ background: accent, color: fgOnAccent }}>● m2dumpling@demo</span>
        <span className="sb-cell">~/profile</span>
        <span className="sb-cell dim">{tx("terminal simulation", "终端模拟")}</span>
      </div>
      <div className="sb-right">
        <span className="sb-cell dim">{PROFILE_SOURCE.kind === "github" ? tx(`GitHub API · ${PROFILE_SOURCE.asOf.slice(0, 10)}`, `GitHub 数据 · ${PROFILE_SOURCE.asOf.slice(0, 10)}`) : tx(`GitHub snapshot · ${PROFILE_SOURCE.asOf}`, `GitHub 快照 · ${PROFILE_SOURCE.asOf}`)}</span>
        <span className="sb-cell dim">{`${hh}:${mm}:${ss} ${tx("local", "本地")}`}</span>
        <span className="sb-cell" style={{ background: accent, color: fgOnAccent }}>
          {themeLabel}
        </span>
        <button className="sb-cell lang-switch" type="button"
                onClick={() => onLanguageChange(locale === "zh" ? "en" : "zh")}
                aria-label={tx("Switch to Chinese", "切换到英文")}
                title={tx("Switch to Chinese", "切换到英文")}>
          {locale === "zh" ? "EN" : "中文"}
        </button>
      </div>
    </div>
  );
}

// ─── Section frame ───────────────────────────────────────────────────────
function Section({ id, title, count, children, accent }) {
  return (
    <section className="section" id={"sec-" + id}>
      <header className="section-head">
        <span className="section-marker" style={{ color: accent }}>§</span>
        <span className="section-id">{id}</span>
        <span className="section-title">{title}</span>
        <span className="section-rule" />
        {count != null && <span className="section-count">[{count}]</span>}
      </header>
      <div className="section-body">{children}</div>
    </section>
  );
}

// Wrapper that fades in when its `id` is in the revealed set.
function RevealSection({ id, revealed, ...rest }) {
  const isVisible = revealed.has(id);
  return (
    <div className={"reveal " + (isVisible ? "reveal-on" : "reveal-off")}
         data-section-id={id}>
      <Section id={id} {...rest} />
    </div>
  );
}

// ─── Identity card ───────────────────────────────────────────────────────
function Identity({ accent, accentName, showAscii }) {
  return (
    <div className="identity">
      <div className="identity-left">
        {showAscii && (
          <pre className="ascii-name line-by-line" style={{ color: accent }}>
            {ASCII_NAME.map((line, i) => (
              <span key={i}>{i === ASCII_NAME.length - 1 ? tx(line, "        ── 终端式个人主页 ──        ") : line}</span>
            ))}
          </pre>
        )}
        <div className="who">
          <div className="who-section"># [{tx("identity", "身份")}]</div>
          <div className="who-out">
            <span className="kv-k">{tx("name", "名称")}</span>
            <span className="kv-eq">=</span>
            <span className="kv-v">"{PROFILE.name}" </span>
            <span className="dim">// {PROFILE.handle}</span>
          </div>
          {PROFILE.role && <div className="who-out">
            <span className="kv-k">{tx("role", "角色")}</span>
            <span className="kv-eq">=</span>
            <span className="kv-v">"{PROFILE.role}"</span>
          </div>}
          {PROFILE.location && <div className="who-out">
            <span className="kv-k">{tx("loc ", "位置")}</span>
            <span className="kv-eq">=</span>
            <span className="kv-v">"{PROFILE.location}"</span>
          </div>}
          {PROFILE.tags?.length > 0 && <div className="who-out">
            <span className="kv-k">{tx("tags", "标签")}</span>
            <span className="kv-eq">=</span>
            <span className="kv-v">[{(PROFILE.tags || []).join(", ")}]</span>
          </div>}
          {PROFILE.motto && <div className="motto">
            <span className="quote-mark" style={{ color: accent }}>“</span>
            <span className="motto-zh">{PROFILE.motto}</span>
            <span className="quote-mark" style={{ color: accent }}>”</span>
            {PROFILE.mottoEn && <span className="motto-en"> — {PROFILE.mottoEn}</span>}
          </div>}
        </div>
      </div>

      <div className="identity-right">
        <div className="stat-grid">
          <div className="stat-cell">
            <div className="stat-n" style={{ color: accent }}>{PROFILE.stats.repos}</div>
            <div className="stat-l">{tx("REPOSITORIES", "公开仓库")}</div>
          </div>
          <div className="stat-cell">
            <div className="stat-n" style={{ color: accent }}>{PROFILE.stats.followers}</div>
            <div className="stat-l">{tx("FOLLOWERS", "关注者")}</div>
          </div>
          <div className="stat-cell">
            <div className="stat-n" style={{ color: accent }}>{PROFILE.stats.starred ?? "—"}</div>
            <div className="stat-l">{tx("STARS GIVEN", "已标星")}</div>
          </div>
          <div className="stat-cell">
            <div className="stat-n" style={{ color: accent }}>{ORGS.length}</div>
            <div className="stat-l">{tx("ORGS", "组织")}</div>
          </div>
        </div>
        {ACHIEVEMENTS.length > 0 && <div className="achievements">
          <div className="ach-label"># [{tx("achievements", "成就")}]</div>
          {ACHIEVEMENTS.map(a => (
            <div className="ach-row" key={a.code}>
              <span className="ach-code" style={{ color: accent }}>▮</span>
              <span className="ach-name">{a.code.padEnd(14, " ")}</span>
              <span className="dim">×{a.count}</span>
              <span className="dim" style={{ marginLeft: 10 }}>{a.label}</span>
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
}

// ─── Tech stack ──────────────────────────────────────────────────────────
function TechBar({ level, accent }) {
  const cells = [0,1,2,3,4];
  return (
    <div className="tech-bar" title={tx(`level ${level}/5`, `等级 ${level}/5`)}>
      {cells.map(i => (
        <span key={i} className="tech-bar-cell"
              style={{ background: i < level ? accent : "transparent",
                       borderColor: i < level ? accent : "var(--border-2)" }} />
      ))}
      <span className="tech-bar-num dim">{level}/5</span>
    </div>
  );
}

function TechStack({ accent }) {
  return (
    <div className="techstack">
      {TECH.map(({ k, v, level }) => (
        <div className="tech-row" key={k}>
          <div className="tech-k" style={{ color: accent }}>{k.padEnd(14, ".")}</div>
          <div className="tech-v">
            {v.map((it, i) => (
              <React.Fragment key={it}>
                <span className="tech-tok">{it}</span>
                {i < v.length - 1 && <span className="tech-sep dim"> · </span>}
              </React.Fragment>
            ))}
          </div>
          <TechBar level={level} accent={accent} />
        </div>
      ))}
    </div>
  );
}

// ─── Signature themes ────────────────────────────────────────────────────
function Signatures({ accent }) {
  return (
    <div className="sigs">
      {SIGNATURES.map((s, i) => (
        <div className="sig" key={s.tag}>
          <div className="sig-num" style={{ color: accent }}>0{i+1}</div>
          <div className="sig-body">
            <div className="sig-tag">{s.tag}</div>
            <div className="sig-note dim">{s.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Pinned projects ─────────────────────────────────────────────────────
const ROLE_GLYPH = { author: "✎", maintainer: "★", contributor: "↗" };

function ProjectCard({ p, accent }) {
  return (
    <div className="proj">
      <div className="proj-head">
        <span className="proj-stripe" style={{ background: accent }} />
        <span className="proj-title">
          <span className="proj-owner dim">{p.owner}</span>
          <span className="dim"> / </span>
          <span className="proj-name">{p.name}</span>
        </span>
        <span className="proj-role" title={tx(p.role, ({ author: "作者", maintainer: "维护者", contributor: "贡献者" })[p.role] || p.role)} style={{ color: accent }}>{ROLE_GLYPH[p.role]}</span>
      </div>
      <div className="proj-desc">{repoDescription(p)}</div>
      <div className="proj-meta">
        <span className="meta-pill">{p.lang}</span>
        <span className="meta-pair"><span className="dim">★</span>{formatStars(p.stars)}</span>
        <span className="meta-pair"><span className="dim">⑂</span>{formatStars(p.forks)}</span>
        <span className="meta-pair dim role-tag">{tx(p.role, ({ author: "作者", maintainer: "维护者", contributor: "贡献者" })[p.role] || p.role)}</span>
      </div>
    </div>
  );
}

function Pinned({ accent }) {
  return (
    <div className="pinned-grid">
      {PINNED.map(p => <ProjectCard key={p.owner + "/" + p.name} p={p} accent={accent} />)}
    </div>
  );
}

// ─── Own repos (compact) ─────────────────────────────────────────────────
function OwnRepos({ accent, handle }) {
  return (
    <div className="own-list">
      <div className="own-head dim">
        <span style={{ width: 26 }}>{tx("idx", "序号")}</span>
        <span style={{ flex: "0 0 240px" }}>{tx("repo", "仓库")}</span>
        <span style={{ flex: 1 }}>{tx("description", "简介")}</span>
      </div>
      {OWN_REPOS.slice(0, 3).map((r, i) => (
        <div className="own-row" key={r.name}>
          <span className="dim own-idx">{String(i+1).padStart(2,"0")}</span>
          <span className="own-name">{handle}/<span style={{ color: accent }}>{r.name}</span></span>
          <span className="own-desc dim">{repoDescription(r)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Orgs ────────────────────────────────────────────────────────────────
function Orgs({ accent }) {
  return (
    <div className="orgs-grid">
      {ORGS.map(o => (
        <div className="org-card" key={o.handle}>
          <div className="org-badge" style={{ borderColor: accent }}>
            <span style={{ color: accent }}>@</span>
          </div>
          <div className="org-text">
            <div className="org-name">{o.name}</div>
            <div className="org-handle dim">@{o.handle}</div>
            <div className="org-note dim">{o.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Contribution heatmap ────────────────────────────────────────────────
function Heatmap({ accent, mode, hmBase }) {
  const base = hmBase || (mode === "light" || mode === "paper" ? "#ece9e0" : "#1a1c1f");
  const colors = [
    base,
    `color-mix(in oklab, ${accent} 25%, ${base})`,
    `color-mix(in oklab, ${accent} 50%, ${base})`,
    `color-mix(in oklab, ${accent} 75%, ${base})`,
    accent,
  ];
  return (
    <div className="heatmap-wrap">
      <div className="heatmap-months">
        {HEATMAP_MONTHS.map(m => (
          <span key={m.label} className="dim" style={{ gridColumn: m.col }}>{tx(m.label, ({ Jan: "1月", Feb: "2月", Mar: "3月", Apr: "4月", May: "5月", Jun: "6月", Jul: "7月", Aug: "8月", Sep: "9月", Oct: "10月", Nov: "11月", Dec: "12月" })[m.label] || m.label)}</span>
        ))}
      </div>
      <div className="heatmap">
        <div className="heatmap-days dim">
          <span>{tx("Mon", "周一")}</span><span>{tx("Wed", "周三")}</span><span>{tx("Fri", "周五")}</span>
        </div>
        <div className="heatmap-grid">
          {HEATMAP.map((col, w) => (
            <div className="hm-col" key={w}>
              {col.map((v, d) => {
                const count = HEATMAP_COUNTS?.[w]?.[d];
                const title = count == null
                  ? tx(`week ${w+1} day ${d+1}: ${v}`, `第 ${w+1} 周第 ${d+1} 天：${v}`)
                  : tx(`week ${w+1} day ${d+1}: ${count} sampled public events`, `第 ${w+1} 周第 ${d+1} 天：采样到 ${count} 条公开事件`);
                return <div key={d} className="hm-cell" style={{ background: colors[v] }} title={title} />;
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="heatmap-legend dim">
        <span>{tx("less", "较少")}</span>
        {colors.map((c,i) => <div key={i} className="hm-cell" style={{ background: c }} />)}
        <span>{tx("more", "较多")}</span>
      </div>
    </div>
  );
}

// ─── Activity log ────────────────────────────────────────────────────────
const TAG_COLORS = {
  feat: { fg: "#88d18a" },
  fix:  { fg: "#e07a5f" },
  perf: { fg: "#d4a85a" },
  ref:  { fg: "#9aa3d4" },
  docs: { fg: "#7aa2c2" },
  chore:{ fg: "#b8a0d9" },
  push: { fg: "#d4a85a" },
  commit:{ fg: "#9aa3ad" },
};

function Activity({ accent }) {
  return (
    <div className="git-log">
      {COMMITS.map((c, i) => {
        const tc = TAG_COLORS[c.tag] || { fg: accent };
        return (
          <div className="log-row" key={c.hash}>
            <span className="log-graph" style={{ color: accent }}>{i === 0 ? "●" : "│"}</span>
            <span className="log-hash" style={{ color: accent }}>{c.hash}</span>
            <span className="log-repo dim">{c.repo}</span>
            <span className="log-tag" style={{ color: tc.fg, borderColor: tc.fg }}>{c.tag}</span>
            <span className="log-scope dim">({c.scope})</span>
            <span className="log-msg">{c.msg}</span>
            <span className="log-time dim">{c.time}</span>
          </div>
        );
      })}
      <div className="log-row log-row-end" style={{ opacity: 0.5 }}>
        <span className="log-graph">│</span>
        <span className="dim" style={{ gridColumn: "2 / -1" }}>{tx(`…older commits truncated. Public REST sample across ${PROFILE.stats.repos || "all"} repos.`, `…更早的提交已省略。GitHub 公开接口采样了 ${PROFILE.stats.repos || "全部"} 个仓库。`)}</span>
      </div>
    </div>
  );
}

// ─── Contact / CLI flags ─────────────────────────────────────────────────
function Contact({ accent }) {
  const flags = [
    { f: "--github",   v: "github.com/" + PROFILE.handle },
    { f: "--website",  v: PROFILE.homepage === `https://github.com/${PROFILE.handle}` ? null : PROFILE.homepage },
    { f: "--region",   v: PROFILE.location },
  ].filter(x => x.v);
  return (
    <div className="contact">
      <pre className="contact-table">
{tx(`# ${PROFILE.handle}'s contact card · last updated ${new Date().getFullYear()}`, `# ${PROFILE.handle} 的联系信息 · 更新于 ${new Date().getFullYear()} 年`) + "\n\n" +
 flags.map(x => `${x.f.padEnd(14)}  ${x.v}`).join("\n")}
      </pre>
    </div>
  );
}

// ─── Footer prompt ───────────────────────────────────────────────────────
function FooterPrompt({ accent, showCursor }) {
  return (
    <div className="footer-prompt">
      <span className="prompt" style={{ color: accent }}>m2dumpling@demo</span>
      <span className="dim">:</span>
      <span style={{ color: "#9ab" }}>~/profile</span>
      <span className="dim">{"$ that's a wrap. "}</span>
      <kbd>↑</kbd>
      <span className="dim">{" history, "}</span>
      <kbd>R</kbd>
      <span className="dim">{" replay, "}</span>
      <kbd>↓</kbd>
      <span className="dim">{" type a command!"}</span>
    </div>
  );
}

// ─── Tweaks panel content ────────────────────────────────────────────────
function Tweaks({ t, setTweak }) {
  return (
    <TweaksPanel title={tx("Tweaks", "外观设置")}>
      <TweakSection label={tx("Theme", "主题")} />
      <TweakSelect label={tx("Mode", "外观模式")} value={t.mode}
                   options={[{value:"auto",label:tx("Follow system","跟随系统")},{value:"noir",label:tx("Black","纯黑")},{value:"slate",label:tx("Dark","深色")},{value:"solar",label:tx("Teal","青绿")},{value:"paper",label:tx("Light","浅色")}]}
                   onChange={(v) => setTweak("mode", v)} />
      <TweakRadio  label={tx("Accent", "强调色")} value={t.accent}
                   options={[{value:"amber",label:tx("amber","琥珀")},{value:"mint",label:tx("mint","薄荷")},{value:"cyan",label:tx("cyan","青色")},{value:"mono",label:tx("mono","单色")}]}
                   onChange={(v) => setTweak("accent", v)} />
      <TweakRadio  label={tx("Density", "密度")} value={t.density}
                   options={[{value:"compact",label:tx("compact","紧凑")},{value:"comfy",label:tx("comfy","宽松")}]}
                   onChange={(v) => setTweak("density", v)} />
      <TweakSection label={tx("Decor", "装饰")} />
      <TweakToggle label={tx("ASCII banner", "ASCII 横幅")} value={t.showAscii}
                   onChange={(v) => setTweak("showAscii", v)} />
      <TweakToggle label={tx("Blinking cursor", "闪烁光标")} value={t.showCursor}
                   onChange={(v) => setTweak("showCursor", v)} />
      <TweakSection label={tx("Effects", "特效")} />
      <TweakToggle label={tx("Starfield particles", "星空粒子")} value={t.showParticles}
                   onChange={(v) => setTweak("showParticles", v)} />
      <TweakSection label={tx("Boot", "启动")} />
      <TweakButton label={tx("Replay boot sequence", "重播启动动画")}
                   onClick={() => setTweak("replayBoot", true)} />
    </TweaksPanel>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [locale, setLocale] = useState(() => siteLanguage());
  const changeLanguage = (next) => {
    setSiteLanguage(next);
    setLocale(next);
  };
  const [, setDataVersion] = useState(0);
  const [profileLoad, setProfileLoad] = useState(() => ({
    ready: typeof window.loadProfileData !== "function",
    lines: INITIAL_PROFILE_BOOT,
  }));
  const A = ACCENTS[t.accent] || ACCENTS.amber;

  useEffect(() => {
    if (typeof window.loadProfileData !== "function") return;
    let alive = true;

    const pushProfileStatus = (line) => {
      if (!alive || !line) return;
      const next = {
        ok: line.ok !== false,
        s: line.s || "Loaded",
        m: line.m || line.message || "",
      };
      setProfileLoad(prev => {
        const exists = prev.lines.some(l => l.ok === next.ok && l.s === next.s && l.m === next.m);
        if (exists) return prev;
        return { ...prev, lines: [...prev.lines, next] };
      });
    };

    window.loadProfileData({
      mode: window.PROFILE_DATA_SOURCE || "github",
      onStatus: pushProfileStatus,
    })
      .then((data) => {
        if (!alive || !data) return;
        window.PROFILE_DATA = data;
        applyProfileData(data);
        pushProfileStatus({ ok: true, s: "Reached target", m: "Profile Data Ready" });
        setProfileLoad(prev => ({ ...prev, ready: true }));
        setDataVersion(v => v + 1);
      })
      .catch((err) => {
        console.warn("[app] profile data refresh failed:", err);
        pushProfileStatus({ ok: false, s: "Failed", m: "profile data refresh" });
        pushProfileStatus({ ok: true, s: "Mounted", m: "static profile fallback" });
        setProfileLoad(prev => ({ ...prev, ready: true }));
      });
    return () => { alive = false; };
  }, []);

  // Detect system preference, live-update.
  const [sysLight, setSysLight] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-color-scheme: light)").matches;
  });
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e) => setSysLight(e.matches);
    mql.addEventListener ? mql.addEventListener("change", handler)
                         : mql.addListener(handler);
    return () => {
      mql.removeEventListener ? mql.removeEventListener("change", handler)
                              : mql.removeListener(handler);
    };
  }, []);

  const resolvedMode = t.mode === "auto" ? (sysLight ? "paper" : "slate") : t.mode;
  const M = MODE_META[resolvedMode] || MODE_META.slate;
  const isLight = M.isLight;
  const accentC   = isLight ? A.lc   : A.c;
  const accentDim = isLight ? A.ldim : A.dim;
  const accentGlow= isLight ? A.lglow: A.glow;
  const themeNames = {
    noir: ["Black", "纯黑"],
    slate: ["Dark", "深色"],
    solar: ["Teal", "青绿"],
    paper: ["Light", "浅色"],
  };
  const [themeEn, themeZh] = themeNames[resolvedMode] || themeNames.slate;
  const themeLabel = t.mode === "auto"
    ? tx(`System · ${themeEn}`, `跟随系统 · ${themeZh}`)
    : tx(`${themeEn} theme`, `${themeZh}模式`);

  useEffect(() => {
    const el = document.documentElement;
    ["mode-noir","mode-slate","mode-solar","mode-paper","mode-dark","mode-light"]
      .forEach(c => el.classList.remove(c));
    el.classList.add("mode-" + resolvedMode);
    return () => { el.classList.remove("mode-" + resolvedMode); };
  }, [resolvedMode]);

  // ─── Stream state ────────────────────────────────────────────────────
  const seenStream = (() => {
    try { return !!localStorage.getItem(STREAM_SEEN_KEY); } catch (e) { return false; }
  })();
  const [skipped,    setSkipped]    = useState(seenStream);
  const [streamDone, setStreamDone] = useState(seenStream);
  // Incrementing key force-remounts TerminalStream so internal progress
  // state is fully reset on Replay — even when skipped is already false.
  const [replayKey,  setReplayKey]  = useState(0);

  useEffect(() => {
    if (t.replayBoot) {
      try { localStorage.removeItem(STREAM_SEEN_KEY); } catch (e) {}
      setSkipped(false);
      setStreamDone(false);
      setReplayKey(k => k + 1);
      window.scrollTo(0, 0);
      setTimeout(() => setTweak("replayBoot", false), 50);
    }
  }, [t.replayBoot]);

  const handleStreamComplete = () => {
    try { localStorage.setItem(STREAM_SEEN_KEY, "1"); } catch (e) {}
    setStreamDone(true);
  };

  useEffect(() => {
    if (streamDone) {
      const onKey = (e) => {
        if (e.key !== "r" && e.key !== "R") return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const target = e.target;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
        setTweak("replayBoot", true);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "s" || e.key === "S") setSkipped(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [streamDone]);

  // density via CSS variables
  const densityVars = t.density === "comfy"
    ? { "--row-gap": "16px", "--block-pad": "28px" }
    : { "--row-gap": "10px", "--block-pad": "20px" };

  const cssVars = {
    "--accent": accentC,
    "--accent-dim": accentDim,
    "--accent-glow": accentGlow,
    ...densityVars,
  };

  // Each command's "output" is a Section wrapping the relevant block.
  const sectionConfigs = [
    { id: "00", title: tx("🥟 identity.toml", "🥟 身份资料 · identity.toml"), count: null, body: <Identity accent={accentC} accentName={A.name} showAscii={t.showAscii} /> },
    { id: "01", title: tx("signature flavors", "个人特色"), count: SIGNATURES.length, body: <Signatures accent={accentC} />, show: SIGNATURES.length > 0 },
    { id: "02", title: tx("tech stack · self-rated", "技术栈 · 自评"), count: TECH.reduce((n, r) => n + r.v.length, 0), body: <TechStack accent={accentC} />, show: TECH.length > 0 },
    { id: "03", title: tx("pinned repositories · snapshot", "置顶仓库 · 快照"), count: PINNED.length, body: <Pinned accent={accentC} />, show: PINNED.length > 0 },
    { id: "04", title: tx("home-cooked repos · selected", "个人仓库 · 精选"), count: Math.min(3, OWN_REPOS.length), body: <OwnRepos accent={accentC} handle={PROFILE.handle} />, show: OWN_REPOS.length > 0 },
    { id: "05", title: tx("public events · latest 100 sample", "公开动态 · 最近 100 条样本"), count: null, body: <Heatmap accent={accentC} mode={resolvedMode} hmBase={M.hmBase} />, show: HEATMAP.length > 0 },
    { id: "08", title: tx("📬 contact card", "📬 联系方式"), count: null, body: <Contact accent={accentC} /> },
  ].filter(s => s.show !== false);
  const wrappedSections = {};
  sectionConfigs.forEach(s => {
    wrappedSections[s.id] = (
      <Section id={s.id} title={s.title} count={s.count} accent={accentC}>
        {s.body}
      </Section>
    );
  });

  return (
    <div className={"root mode-" + resolvedMode + (streamDone ? " stream-done" : " streaming") + (t.showParticles ? " has-particles" : "")}
         style={cssVars}>
      <StatusBar accent={accentC} mode={resolvedMode} themeLabel={themeLabel}
                 locale={locale} onLanguageChange={changeLanguage} />

      <main className="page">
        <TerminalStream
          key={replayKey}
          accent={accentC}
          mode={resolvedMode}
          sections={wrappedSections}
          profileLoad={profileLoad}
          locale={locale}
          skipped={skipped}
          onComplete={handleStreamComplete}
        />
        {/* Footer removed — the final live prompt acts as the natural end
            marker, and Replay is available via the Tweaks panel. */}
      </main>

      {!streamDone && (
        <button className="boot-skip" onClick={() => setSkipped(true)}>
          <span>{tx("skip animation", "跳过动画")}</span>
          <kbd>ESC</kbd>
        </button>
      )}

      <Tweaks t={t} setTweak={setTweak} />
      {t.showParticles && <Starfield />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
