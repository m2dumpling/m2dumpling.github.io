// profile-data.js
// ─────────────────────────────────────────────────────────────────────────
// Single source of truth for everything shown on the profile page.
// Edit this file to update Dumpling's data.
// ─────────────────────────────────────────────────────────────────────────

window.PROFILE_DATA = {

  // basic identity from github.com/m2dumpling
  identity: {
    handle:   "m2dumpling",
    name:     "Dumpling",
    location: "Hangzhou, CN",
    motto:    "Stay hungry, stay foolish.",
    mottoEn:  "Stay hungry, stay foolish. — Steve Jobs",
    homepage: "github.com/m2dumpling",
    uid:      "m2dumpling",
    unixUid:  "1000",
    ghUid:    "m2dumpling",
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
  pinned: [],

  // own repositories worth highlighting
  ownRepos: [],

  // organizations
  orgs: [],

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
  commits: [],

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
