// profile-data.js
// ─────────────────────────────────────────────────────────────────────────
// Single source of truth for everything shown on the profile page.
// Edit this file to update Dumpling's data.
// ─────────────────────────────────────────────────────────────────────────

window.PROFILE_DATA = {

  // basic identity from github.com/poetpoet7
  identity: {
    handle:   "poetpoet7",
    name:     "Dumpling",
    location: "Hangzhou, CN",
    motto:    "Stay hungry, stay foolish.",
    mottoEn:  "Stay hungry, stay foolish. — Steve Jobs",
    homepage: "github.com/poetpoet7",
    uid:      "poetpoet7",
    unixUid:  "1000",
    ghUid:    "poetpoet7",
    role:     "full-stack developer",
    tags:     ["javascript", "typescript", "react", "node", "fullstack"],
  },

  // public counts
  stats: {
    repos:     15,
    followers: 42,
    starred:   88,
    following: 23,
  },

  // featured repos
  pinned: [
    { name: "terminal-portfolio",  owner: "poetpoet7", lang: "TypeScript", stars: 1, forks: 0, desc: "Terminal-style personal portfolio website. Built with love.", role: "author" },
    { name: "dotfiles",            owner: "poetpoet7", lang: "Shell",      stars: 3, forks: 1, desc: "Personal dev environment configuration and setup scripts.", role: "author" },
    { name: "react",               owner: "facebook",  lang: "JavaScript", stars: 230000, forks: 47000, desc: "The library for web and native user interfaces.", role: "contributor" },
    { name: "vite",                owner: "vitejs",    lang: "TypeScript", stars: 72000,  forks: 6400, desc: "Next generation frontend tooling. It's fast!", role: "contributor" },
  ],

  // own repositories worth highlighting
  ownRepos: [
    { name: "terminal-portfolio", desc: "Terminal-themed personal website" },
    { name: "dotfiles",           desc: "Dev environment configuration files" },
    { name: "blog",               desc: "Personal tech blog built with Next.js" },
    { name: "awesome-lists",      desc: "Curated collection of awesome resources" },
  ],

  // organizations
  orgs: [
    { handle: "poetpoet7", name: "Personal", note: "Personal projects" },
  ],

  // GitHub achievements
  achievements: [
    { code: "YOLO",         count: 2, label: "YOLO"                },
    { code: "QUICKDRAW",    count: 1, label: "Quickdraw"           },
    { code: "STARSTRUCK",   count: 1, label: "Starstruck"          },
  ],

  // self-rated tech stack (1-5)
  tech: [
    { k: "languages",      v: ["TypeScript", "JavaScript", "Python", "Go"],                       level: 4 },
    { k: "frontend",       v: ["React", "Vue 3", "Next.js", "Tailwind CSS"],                      level: 4 },
    { k: "backend",        v: ["Node.js", "Express", "FastAPI", "Gin"],                           level: 3 },
    { k: "databases",      v: ["PostgreSQL", "Redis", "MongoDB"],                                 level: 3 },
    { k: "devops",         v: ["Docker", "Git", "GitHub Actions", "Linux"],                       level: 3 },
    { k: "tools",          v: ["VS Code", "Figma", "Postman", "Vercel"],                          level: 4 },
  ],

  // thematic "signature areas"
  signatures: [
    { tag: "🥟 full-stack",   note: "Building complete web apps — from database schema to pixel-perfect UI" },
    { tag: "terminal-ux",     note: "Crafting CLI tools and terminal experiences that feel like home" },
    { tag: "open-source",     note: "Contributing back to the tools that make modern dev possible" },
    { tag: "creative-code",   note: "Where engineering meets art — interactive, beautiful software" },
  ],

  // recent commits
  commits: [
    { repo: "poetpoet7/terminal-portfolio", hash: "a1b2c3d", tag: "feat", scope: "site",     msg: "add interactive terminal shell experience",           time: "2h"  },
    { repo: "poetpoet7/dotfiles",          hash: "e4f5g6h", tag: "feat", scope: "nvim",     msg: "configure LSP and autocomplete for TypeScript",       time: "1d"  },
    { repo: "poetpoet7/blog",              hash: "i7j8k9l", tag: "post", scope: "content",   msg: "new article: building a terminal portfolio",          time: "3d"  },
    { repo: "poetpoet7/awesome-lists",     hash: "m0n1o2p", tag: "docs", scope: "readme",    msg: "add frontend resources section",                      time: "1w"  },
  ],

  // terminal session details
  shellEnv: {
    unixUser: "dumpling",
    kernel:   "6.6.10-arch1-1",
    shell:    "zsh 5.9",
    tmux:     "3.4",
    distro:   "Arch Linux",
    goVer:    "go1.22.4",
    timezone: "Hangzhou · UTC+8",
  },
};
