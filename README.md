# 🥟 dumpling · terminal portfolio

My personal terminal-style portfolio — inspired by the command line, built for developers.

**[poetpoet7.github.io](https://poetpoet7.github.io)**

## What is this?

A single-page terminal experience that boots like a real Linux system, then presents my profile through auto-typing commands. It includes an interactive shell where visitors can explore via CLI commands.

## Features

- **Boot animation** — BIOS → systemd → login → auto-typing shell session
- **41 built-in commands** — `whoami`, `neofetch`, `git log`, `gh repo list`, `cat`, `fortune`, `sl`, and more
- **6 themes** — auto / dark / slate / solar / paper / light
- **Tab autocomplete**, command history, Ctrl+L clear
- **Responsive** — works on mobile, tablet, and desktop
- **Zero build step** — plain HTML + CSS + JS, serve anywhere

## Run locally

```bash
# Start any HTTP server
python3 -m http.server 4186

# Then open
open http://localhost:4186
```

## Customize

Edit `profile-data.js` to change all content — name, stats, projects, tech stack, social links, etc.

## Tech

Vanilla HTML + CSS + React (loaded via CDN, no bundler needed).

## License

MIT
