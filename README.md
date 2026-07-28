# 🥟 dumpling · terminal portfolio

> A terminal emulator that happens to be a personal website. Boots like Arch Linux, runs like a shell, looks like a CRT monitor.

**[m2dumpling.github.io](https://m2dumpling.github.io)**

---

## What is this?

Open the page and watch it boot — BIOS POST → systemd services → login → MOTD welcome banner. Then commands auto-type one by one, revealing my profile section by section. At the bottom sits a real interactive shell. Type `help`, `neofetch`, or `sl` and see what happens.

No frameworks. No bundler. No API keys. No tracking. Just a single HTML file, some CSS, and React loaded from a CDN.

---

## Features

**The Terminal Experience**
- Full boot sequence — BIOS, systemd, login, MOTD, then an auto-typing shell session
- 40+ interactive commands — `whoami`, `neofetch`, `fortune`, `sl`, `cat`, `tree`, `gh`, `git`…
- Tab autocomplete, command history (`↑`/`↓`), `Ctrl+L` clear, `Ctrl+C` cancel
- Stream sections replayable — type `cat identity.toml` and the full identity card renders inline

**Visual Polish**
- CRT scanlines and vignette — subtle, like a real monitor
- Starfield particle background — toggle it on in the Tweaks panel
- 4 color modes × 4 accent colors — auto / noir / slate / solar / paper
- Dot-grid blueprint background with phosphor glow
- ASCII banner with line-by-line typewriter fade-in
- Responsive — reads well on phones, tablets, and ultrawide monitors

**Under the Hood**
- Zero build step — plain `.html` + `.css` + `.js`, serve from anywhere
- React 18 via CDN, Babel Standalone for JSX — no `node_modules`, no `package.json`
- ~40 KB of hand-written CSS, GPU-animated, 60 fps
- Privacy-first — no analytics, no cookies, no external API calls (static mode)

---

## Quick start

```bash
git clone https://github.com/m2dumpling/terminal-portfolio.git
cd terminal-portfolio

# Any HTTP server works
python3 -m http.server 4186

# Open http://localhost:4186
```

**Want to use this as your own portfolio?** Edit `profile-data.js` — change the name, stats, signatures, tech stack, and shell env. Everything is in that one file. The website reads it at boot and renders accordingly.

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

## Screenshot

![screenshot](./final-preview.png)

---

## Tech

HTML · CSS · JavaScript · [React 18](https://react.dev) (CDN) · [Babel Standalone](https://babeljs.io) · [JetBrains Mono](https://www.jetbrains.com/lp/mono/)

## License

MIT
