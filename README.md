# 🥟 dumpling · terminal portfolio

> A terminal themed personal website backed by m2dumpling's public GitHub data. The boot and shell interface are simulations.

**[m2dumpling.github.io](https://m2dumpling.github.io/)**

---

## What is this?

Open the page and watch it boot — BIOS POST → systemd services → login → MOTD welcome banner. Then commands auto-type one by one, revealing my profile section by section. At the bottom sits a real interactive shell. Type `help`, `neofetch`, or `sl` and see what happens.

No bundler or API key is needed. The page uses several local source files and React loaded from a CDN.

---

## Features

**The Terminal Experience**
- Full boot sequence — BIOS, systemd, login, MOTD, then an auto-typing shell session
- 40 interactive commands — `whoami`, `neofetch`, `fortune`, `sl`, `cat`, `tree`, `gh`, `git`…
- Tab autocomplete, command history (`↑`/`↓`), `Ctrl+L` clear, `Ctrl+C` cancel
- Stream sections replayable — type `cat identity.toml` and the full identity card renders inline
- Chinese and English interface switch in the top status bar; the choice is saved in this browser

**Visual Polish**
- CRT scanlines and vignette — subtle, like a real monitor
- Starfield particle background — toggle it on in the Tweaks panel
- 4 color modes and an automatic mode × 4 accent colors — auto / noir / slate / solar / paper
- Dot-grid blueprint background with phosphor glow
- ASCII banner with line-by-line typewriter fade-in
- Responsive — reads well on phones, tablets, and ultrawide monitors

**Under the Hood**
- Zero build step — plain `.html` + `.css` + `.js`, serve from anywhere
- React 18 via CDN, Babel Standalone for JSX — no `node_modules`, no `package.json`
- Hand-written CSS with responsive layouts and animations
- No analytics or cookies; GitHub public REST is used to refresh profile data

---

## Quick start

```bash
git clone https://github.com/m2dumpling/m2dumpling.github.io.git
cd m2dumpling.github.io

# Any HTTP server works
python3 -m http.server 4186

# Open http://localhost:4186
```

`profile-data.js` contains a dated public snapshot used before the GitHub API responds or when it is unavailable. `index.html` enables live mode. Repository pin choices are from the snapshot; their stars, forks, and descriptions refresh through the API. Unverified personal details are omitted.

The interface defaults to Chinese. Terminal commands and repository names remain in their original form. The featured `gh repo list m2dumpling --limit 3` section shows three repositories.

---

## Commands

| Category | Commands |
|----------|----------|
| **Files** | `ls`, `ll`, `la`, `cat`, `tree` |
| **Identity** | `whoami`, `id`, `pwd`, `bin`, `stack`, `neofetch`, `fastfetch` |
| **System** | `date`, `uptime`, `uname`, `ps`, `top` |
| **Git / GitHub** | `git status`, `git log`, `gh repo list` |
| **Utils** | `echo`, `clear`, `history`, `help`, `man`, `fortune` |
| **Easter eggs** | `sl` (train), `coffee` (418), `sudo`, `vim`, `:q`, `yes` |

---

## Tech

HTML · CSS · JavaScript · [React 18](https://react.dev) (CDN) · [Babel Standalone](https://babeljs.io) · [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
