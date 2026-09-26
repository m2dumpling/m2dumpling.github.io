// boot-sequence.jsx — BIOS → systemd → login → shell intro.
const { useState: bsUseState, useEffect: bsUseEffect } = React;

const BootStages = {
  BIOS: "bios",
  SYSTEMD: "systemd",
  LOGIN: "login",
  MOTD: "motd",
  SHELL: "shell",
  DONE: "done",
};

// Phase 1 — BIOS / kernel
const BIOS_LINES = [
  { d: 80,  t: "DEMO",   m: "starting terminal portfolio interface", mZh: "正在启动终端式个人主页" },
  { d: 60,  t: "DATA",   m: "loading public GitHub profile snapshot", mZh: "正在加载 GitHub 公开资料快照" },
  { d: 80,  t: "UI",     m: "preparing interactive shell", mZh: "正在准备交互终端" },
];

const SYSTEMD_LINES = [
  { d: 40, ok: true,  s: "Loaded",  m: "Terminal UI", mZh: "终端界面" },
  { d: 60, ok: true,  s: "Loaded",  m: "Profile snapshot", mZh: "资料快照" },
  { d: 50, ok: true,  s: "Started", m: "GitHub data refresh", mZh: "GitHub 数据刷新" },
  { d: 80, ok: true,  s: "Started", m: "Interactive shell demo", mZh: "交互终端模拟" },
];

// MOTD content is built dynamically per visit in terminal-stream.jsx.

function useTypewriter(text, speed = 18, run = true) {
  // When `run` is false (e.g. subsequent visits, skipped mode), short-circuit
  // BEFORE first paint so the user never sees a half-typed string flash.
  const [out, setOut] = bsUseState(run ? "" : text);
  bsUseEffect(() => {
    if (!run) { setOut(text); return; }
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, run]);
  return out;
}

// ─── BIOS line ─────────────────────────────────────────────────────────
function BiosLine({ line, accent }) {
  return (
    <div className="bs-line">
      <span className="bs-tag" style={{ color: accent }}>{line.t.padEnd(5)}</span>
      <span className="bs-msg">{tx(line.m, line.mZh || line.m)}</span>
    </div>
  );
}

// ─── systemd-style [ OK ] line ─────────────────────────────────────────
function SystemdLine({ line, accent }) {
  return (
    <div className="bs-line">
      <span className="bs-bracket">[  </span>
      <span style={{ color: line.ok ? "#5feab6" : "#e07a5f" }}>{line.ok ? tx("OK", "完成") : tx("FAIL", "失败")}</span>
      <span className="bs-bracket">  ]</span>
      <span style={{ marginLeft: 10 }}>{tx(line.s, ({Loaded:"已加载",Started:"已启动",Mounted:"已挂载",Checking:"检查中",Resolving:"解析中",Resolved:"已解析",Wrote:"已写入",Failed:"失败", "Reached target":"已就绪"})[line.s] || line.s)}</span>
      <span style={{ marginLeft: 6 }}>{tx(line.m, line.mZh || localizeProfileStatus(line.m))}.</span>
    </div>
  );
}

window.BootStages = BootStages;
window.BIOS_LINES = BIOS_LINES;
window.SYSTEMD_LINES = SYSTEMD_LINES;
window.useTypewriter = useTypewriter;
window.BiosLine = BiosLine;
window.SystemdLine = SystemdLine;

// ─── Login block ───────────────────────────────────────────────────────
function LoginBlock({ loginTyping, passwordTyping, accent }) {
  const user = useTypewriter("m2dumpling", 90, loginTyping);
  const pwDots = useTypewriter("••••••••••", 75, passwordTyping);
  return (
    <div className="bs-login">
      <div style={{ marginTop: 14 }}>
        <span className="bs-host">m2dumpling@demo</span>
        <span className="dim"> tty1 </span>
        <span style={{ color: accent }}>{tx("login: ", "登录：")}</span>
        <span>{user}</span>
        {loginTyping && !passwordTyping && <Cursor accent={accent} />}
      </div>
      {passwordTyping && (
        <div>
          <span style={{ color: accent }}>{tx("Password: ", "密码：")}</span>
          <span style={{ color: "#5feab6" }}>{pwDots}</span>
          {pwDots.length < 10 && <Cursor accent={accent} />}
        </div>
      )}
    </div>
  );
}
window.LoginBlock = LoginBlock;

// ─── Cursor (re-exported here for terminal-stream to use even though app.jsx
// also defines one; this avoids ordering dependencies across script files) ─
function Cursor({ accent }) {
  const [on, setOn] = bsUseState(true);
  bsUseEffect(() => {
    const t = setInterval(() => setOn(o => !o), 530);
    return () => clearInterval(t);
  }, []);
  return <span style={{
    display: "inline-block",
    width: "0.55em",
    height: "1em",
    background: on ? accent : "transparent",
    verticalAlign: "-2px",
    marginLeft: "2px",
    boxShadow: on ? `0 0 8px ${accent}, 0 0 2px ${accent}` : "none",
    transition: "box-shadow 0.15s ease",
  }} />;
}
window.Cursor = Cursor;
