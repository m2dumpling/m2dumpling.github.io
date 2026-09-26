// terminal-stream.jsx — One continuous Linux session.
// Boot logs → login → MOTD → commands typed inline → each output is a section.
//
// Drives all state for the animation; sections are passed in as a map so this
// component owns the visual flow, not the data.

const { useState: tsUseState, useEffect: tsUseEffect, useRef: tsUseRef } = React;

const STREAM_SEEN_KEY = "dumpling-profile.stream-seen.v3";

const STREAM_COMMANDS = [
  { id: "00", cmd: "cat identity.toml" },
  { id: "01", cmd: "cat .signatures" },
  { id: "02", cmd: "stack --rated" },
  { id: "03", cmd: "gh repo list --pinned m2dumpling" },
  { id: "04", cmd: "gh repo list m2dumpling --limit 3" },
  { id: "05", cmd: "contrib --weeks 13" },
  { id: "08", cmd: "cat .contact" },
];

// Phases of the stream, in order. Each maps to a discrete progress value.
const PHASE_PRE_BOOT  = "pre-boot";   // nothing shown yet
const PHASE_BIOS      = "bios";       // streaming BIOS lines
const PHASE_SYSTEMD   = "systemd";    // streaming systemd OK lines
const PHASE_PROFILE   = "profile";    // cache/API hydration before login
const PHASE_LOGIN     = "login";      // login + password typing
const PHASE_MOTD      = "motd";       // motd appears
const PHASE_COMMANDS  = "commands";   // shell commands + sections
const PHASE_DONE      = "done";       // final prompt with cursor

// Pull a previous-visit timestamp from localStorage; format it like a real
// `last login` line. Omitted on first visit.
const LAST_VISIT_KEY = "dumpling-profile.last-visit";
function formatLastLogin(date) {
  return tx(date.toLocaleString("en-US"), date.toLocaleString("zh-CN"));
}
function buildMotdLines() {
  let priorVisit = null;
  try {
    const raw = localStorage.getItem(LAST_VISIT_KEY);
    if (raw) priorVisit = new Date(raw);
  } catch (e) {}

  // Pull env / identity values from profile-data.js so editing the data
  // file updates the welcome banner without touching this file.
  const id  = (window.PROFILE_DATA && window.PROFILE_DATA.identity) || {};
  const env = (window.PROFILE_DATA && window.PROFILE_DATA.shellEnv) || {};
  const rule = "─".repeat(45);
  const greeting = priorVisit ? tx("Welcome back to", "欢迎回来") : tx("Welcome to", "欢迎来到");
  const ghUid = id.ghUid || id.uid || "unknown";
  const user = env.unixUser || id.handle || "dumpling";
  const lines = [
    `${greeting} ${tx("m2dumpling's terminal portfolio", "m2dumpling 的终端式个人主页")} ${rule}`,
    `  ${tx("terminal  interactive demo   data  GitHub public API", "终端  交互演示   数据  GitHub 公开接口")}`,
    `  GitHub ID  ${ghUid}   ${tx("handle", "用户名")}  ${id.handle || user}`,
    "─".repeat(60),
  ];
  if (priorVisit) {
    lines.push(tx("Last visit: ", "上次访问：") + formatLastLogin(priorVisit));
  }
  lines.push("", tx("🥟 Welcome! Scroll to explore, or type 'help' in the shell below.", "🥟 欢迎！向下滚动浏览，或在下方终端输入 help 查看命令。"));
  return lines;
}

function PromptLine({ accent, cmd, typing }) {
  const typed = useTypewriter(cmd, 26, typing);
  const done = !typing || typed === cmd;
  return (
    <div className="ts-prompt">
      <span style={{ color: accent }}>m2dumpling@demo</span>
      <span className="dim">:</span>
      <span style={{ color: "#9ab" }}>~</span>
      <span className="dim">$ </span>
      <span className="ts-cmd-text">{typed}</span>
      {!done && <Cursor accent={accent} />}
    </div>
  );
}

function TerminalStream({ accent, sections, profileLoad, skipped, onSkip, onComplete, mode, locale }) {
  // Granular progress trackers. When `skipped`, every list is fully populated.
  const [biosIdx,   setBiosIdx]   = tsUseState(0);
  const [sysIdx,    setSysIdx]    = tsUseState(0);
  const [phase,     setPhase]     = tsUseState(PHASE_PRE_BOOT);
  const [loginType, setLoginType] = tsUseState(false);
  const [pwdType,   setPwdType]   = tsUseState(false);
  const [profileIdx, setProfileIdx] = tsUseState(0);
  const [showMotd,  setShowMotd]  = tsUseState(false);
  const [cmdIdx,    setCmdIdx]    = tsUseState(0);     // # of commands STARTED typing
  const [outputIdx, setOutputIdx] = tsUseState(0);     // # of outputs SHOWN
  const containerRef = tsUseRef(null);
  const profileLoadRef = tsUseRef(profileLoad || { ready: true, lines: [] });

  tsUseEffect(() => {
    profileLoadRef.current = profileLoad || { ready: true, lines: [] };
  }, [profileLoad]);

  // If the visit is being skipped (or replayed-as-skipped), jump straight to
  // the "already-booted" state: NO BIOS, NO systemd, NO login — just MOTD
  // + commands + outputs, like opening a new shell on a system that's already
  // running. Avoids replaying the kernel ceremony every page load.
  tsUseEffect(() => {
    if (!skipped) return;
    setBiosIdx(0);
    setSysIdx(0);
    setLoginType(false);
    setPwdType(false);
    setProfileIdx((profileLoadRef.current.lines || []).length);
    setShowMotd(true);
    setCmdIdx(STREAM_COMMANDS.length);
    setOutputIdx(STREAM_COMMANDS.length);
    setPhase(PHASE_DONE);
    onComplete && onComplete();
  }, [skipped]);

  // MOTD content with dynamic "Last login" stamp, computed once per mount.
  const motdLines = React.useMemo(buildMotdLines, [locale]);

  // Auto-scroll the window to follow new lines (only during the live run).
  tsUseEffect(() => {
    if (skipped) return;
    if (phase === PHASE_DONE || phase === PHASE_PRE_BOOT) return;
    // Smoothly scroll the page so the latest line stays in view.
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }, [biosIdx, sysIdx, loginType, pwdType, profileIdx, showMotd, cmdIdx, outputIdx, phase, skipped]);

  // Drive the live animation.
  tsUseEffect(() => {
    if (skipped) return;
    // Reset everything to pre-boot state — critical when this effect re-fires
    // because the user clicked Replay (skipped flipped from true → false),
    // otherwise the previously "fully populated" state would still be visible.
    setBiosIdx(0);
    setSysIdx(0);
    setLoginType(false);
    setPwdType(false);
    setProfileIdx(0);
    setShowMotd(false);
    setCmdIdx(0);
    setOutputIdx(0);
    setPhase(PHASE_PRE_BOOT);

    let cancel = false;
    const timers = [];
    const wait = (ms) => new Promise(res => {
      const t = setTimeout(() => { if (!cancel) res(); }, ms);
      timers.push(t);
    });

    (async () => {
      // Initial pause so the page can paint blank for a beat.
      await wait(200);

      setPhase(PHASE_BIOS);
      for (let i = 0; i < BIOS_LINES.length; i++) {
        await wait(BIOS_LINES[i].d);
        if (cancel) return;
        setBiosIdx(i + 1);
      }
      await wait(280);

      setPhase(PHASE_SYSTEMD);
      for (let i = 0; i < SYSTEMD_LINES.length; i++) {
        await wait(SYSTEMD_LINES[i].d);
        if (cancel) return;
        setSysIdx(i + 1);
      }
      await wait(380);

      setPhase(PHASE_PROFILE);
      let shownProfileLines = 0;
      const profileStepMs = 240;
      const profilePollMs = 140;
      while (!cancel) {
        const current = profileLoadRef.current || { ready: true, lines: [] };
        const lines = current.lines || [];
        if (shownProfileLines < lines.length) {
          shownProfileLines += 1;
          setProfileIdx(shownProfileLines);
          await wait(profileStepMs);
          continue;
        }
        if (current.ready) break;
        await wait(profilePollMs);
      }
      await wait(360);

      setPhase(PHASE_LOGIN);
      await wait(220);
      setLoginType(true);
      await wait(620);
      setPwdType(true);
      await wait(900);

      setPhase(PHASE_MOTD);
      setShowMotd(true);
      await wait(620);

      setPhase(PHASE_COMMANDS);
      for (let i = 0; i < STREAM_COMMANDS.length; i++) {
        // Start typing command i
        setCmdIdx(i + 1);
        // Typing duration ~ chars * speed (matches PromptLine's speed of 26ms)
        const typingMs = STREAM_COMMANDS[i].cmd.length * 26 + 220;
        await wait(typingMs);
        if (cancel) return;
        // Reveal output
        setOutputIdx(i + 1);
        // Pause before next command starts — long enough to register the
        // printed-out content (max child stagger ~720ms for 12 children).
        await wait(1200);
      }

      await wait(400);
      setPhase(PHASE_DONE);
      // Stamp this visit so next time's MOTD shows a real "Last login".
      try { localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString()); } catch (e) {}
      onComplete && onComplete();
    })();

    return () => {
      cancel = true;
      timers.forEach(clearTimeout);
    };
  }, [skipped]);

  const bootCleared = phase === PHASE_MOTD || phase === PHASE_COMMANDS || phase === PHASE_DONE;
  const profileLines = (profileLoad?.lines || []).slice(0, profileIdx);

  return (
    <div className="ts" ref={containerRef}>
      {/* BIOS phase — cleared after login */}
      {!bootCleared && BIOS_LINES.slice(0, biosIdx).map((l, i) => (
        <BiosLine key={"b" + i} line={l} accent={accent} />
      ))}

      {/* systemd phase — cleared after login */}
      {!bootCleared && SYSTEMD_LINES.slice(0, sysIdx).map((l, i) => (
        <SystemdLine key={"s" + i} line={l} accent={accent} />
      ))}

      {!bootCleared && profileLines.map((line, i) => (
        <SystemdLine key={"p" + i} line={line} accent={accent} />
      ))}

      {/* login + password — only visible during the LOGIN phase itself */}
      {!skipped && phase === PHASE_LOGIN && (
        <LoginBlock loginTyping={loginType} passwordTyping={pwdType} accent={accent} />
      )}

      {/* MOTD — brief greeting; shown on every visit */}
      {showMotd && (
        <pre className="ts-motd">{motdLines.join("\n")}</pre>
      )}

      {/* Commands + outputs */}
      {STREAM_COMMANDS.filter(c => sections[c.id]).slice(0, cmdIdx).map((c, i) => {
        const typing = i === cmdIdx - 1 && outputIdx < cmdIdx && !skipped;
        const showOutput = i < outputIdx;
        return (
          <div className="ts-cmd-block" key={c.id}>
            <PromptLine accent={accent} cmd={c.cmd} typing={typing} />
            {showOutput && (
              <div className="ts-output">
                {sections[c.id]}
              </div>
            )}
          </div>
        );
      })}

      {/* Final live prompt (only after everything has run) */}
      {phase === PHASE_DONE && window.InteractiveShell && (
        <InteractiveShell key={locale} accent={accent} sections={sections} />
      )}
    </div>
  );
}

window.TerminalStream = TerminalStream;
window.STREAM_COMMANDS = STREAM_COMMANDS;
window.STREAM_SEEN_KEY = STREAM_SEEN_KEY;
window.PHASE_DONE = PHASE_DONE;
