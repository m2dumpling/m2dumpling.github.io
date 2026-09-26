// shell-commands.js — pure command logic for the interactive shell.

(function () {
  const FALLBACK_HANDLE = "m2dumpling";
  const FILES = ["identity.toml", ".signatures", ".contact", "README.md", "tech.json", "stack.md"];
  const DIRS = ["projects/", "talks/", "orgs/"];
  const HIDDEN = [".zshrc", ".bashrc", ".gitconfig"];

  function data() {
    return window.PROFILE_DATA || {};
  }

  function identity() {
    return data().identity || {};
  }

  function stats() {
    return data().stats || {};
  }

  function shellEnv() {
    return data().shellEnv || {};
  }

  function handle() {
    return identity().handle || FALLBACK_HANDLE;
  }

  function unixUser() {
    return shellEnv().unixUser || "dumpling";
  }

  function githubUid() {
    return identity().ghUid || identity().uid || "unknown";
  }

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function nowStr() {
    const now = new Date();
    const local = now;
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const pad = (n) => String(n).padStart(2, "0");
    return tx(`${days[local.getDay()]} ${months[local.getMonth()]} ${pad(local.getDate())} ${pad(local.getHours())}:${pad(local.getMinutes())}:${pad(local.getSeconds())} ${local.getFullYear()} (local)`, `${local.getFullYear()}年${local.getMonth()+1}月${local.getDate()}日 ${pad(local.getHours())}:${pad(local.getMinutes())}:${pad(local.getSeconds())}（本地时间）`);
  }

  function uptimeStr() {
    const now = new Date();
    const local = now;
    const pad = (n) => String(n).padStart(2, "0");
    return tx(` ${pad(local.getHours())}:${pad(local.getMinutes())}:${pad(local.getSeconds())}  browser demo (host uptime unavailable)`, ` ${pad(local.getHours())}:${pad(local.getMinutes())}:${pad(local.getSeconds())}  浏览器演示（无法获取设备运行时间）`);
  }

  function helpText() {
    return [
      tx("available commands:", "可用命令："),
      "",
      tx("  info     whoami  id  pwd  date  uptime  uname  bin", "  信息    whoami  id  pwd  date  uptime  uname  bin"),
      tx("  files    ls  ll  cat  tree  history", "  文件    ls  ll  cat  tree  history"),
      tx("  shell    echo  clear  exit  fortune  sl  coffee", "  终端    echo  clear  exit  fortune  sl  coffee"),
      tx("  system   ps  top  neofetch  man", "  系统    ps  top  neofetch  man"),
      tx("  dev      git  gh  go  vim  ssh  curl", "  开发    git  gh  go  vim  ssh  curl"),
      tx("  profile  stack  orgs  contrib  repos", "  资料    stack  orgs  contrib  repos"),
      "",
      tx("  exact stream commands replay the rich sections above", "  输入上方展示过的完整命令，可再次查看对应区块"),
      tx("  Up/Down recalls history    Tab completes    Ctrl+L clears", "  上/下键查看历史    Tab 补全    Ctrl+L 清屏"),
    ].join("\n");
  }

  function lsCmd(args) {
    const showHidden = args.some((arg) => /^-.*a/.test(arg));
    const long = args.some((arg) => /^-.*l/.test(arg));
    const entries = [
      ...DIRS.map((name) => ({ name, kind: "d" })),
      ...FILES.map((name) => ({ name, kind: "f" })),
      ...(showHidden ? HIDDEN.map((name) => ({ name, kind: "f" })) : []),
    ];

    if (!long) return entries.map((entry) => entry.name).join("  ");

    return entries.map((entry) => {
      const perm = entry.kind === "d" ? "drwxr-xr-x" : "-rw-r--r--";
      const size = entry.kind === "d" ? "  4096" : String(120 + entry.name.length * 17).padStart(6, " ");
      return `${perm}  1 ${unixUser()} ${unixUser()} ${size} ${tx("demo", "演示")} ${entry.name}`;
    }).join("\n");
  }

  function fileContent(name) {
    const id = identity();
    const s = stats();
    const pd = data();
    const files = {
      "identity.toml": () => [
        "# identity.toml",
        `name      = "${id.name || handle()}"`,
        `handle    = "${handle()}"`,
        ...(id.role ? [`role      = "${id.role}"`] : []),
        ...(id.location ? [`location  = "${id.location}"`] : []),
        `homepage  = "${id.homepage || "https://github.com/" + handle()}"`,
        ...(id.motto ? [`bio       = "${id.motto}"`] : []),
        `github_id = "${githubUid()}"`,
        ...(list(id.tags).length ? [`tags      = [${list(id.tags).map((tag) => `"${tag}"`).join(", ")}]`] : []),
      ].join("\n"),

      ".signatures": () => list(pd.signatures).map(
        (sig, i) => `${String(i + 1).padStart(2, "0")}. ${sig.tag}\n    ${sig.note}`
      ).join("\n") || tx("(no signatures configured)", "（暂无个人特色资料）"),

      ".contact": () => [
        `github   github.com/${handle()}`,
        ...(id.homepage && id.homepage !== `https://github.com/${handle()}` ? [`website  ${id.homepage}`] : []),
        ...(id.location ? [`region   ${id.location}`] : []),
      ].join("\n"),

      "README.md": () => [
        `# ${id.name || handle()}`,
        "",
        ...(id.role ? [id.role, ""] : []),
        ...(id.location ? [tx(`Location: ${id.location}`, `所在地：${id.location}`), ""] : []),
        tx("## stats", "## 统计"),
        tx(`- ${s.repos ?? 0} repositories`, `- ${s.repos ?? 0} 个公开仓库`),
        tx(`- ${s.followers ?? 0} followers`, `- ${s.followers ?? 0} 位关注者`),
        tx(`- ${s.starred ?? 0} stars given`, `- 已标星 ${s.starred ?? 0} 个项目`),
        tx(`- ${list(pd.orgs).length} organizations`, `- ${list(pd.orgs).length} 个组织`),
        "",
        ...(id.motto ? [`> ${id.motto}`] : []),
      ].join("\n"),

      "tech.json": () => JSON.stringify(
        list(pd.tech).map((item) => ({ k: item.k, level: item.level })),
        null,
        2
      ),

      "stack.md": () => list(pd.tech).map(
        (item) => `- ${item.k} [${item.level}/5] - ${list(item.v).join(", ")}`
      ).join("\n") || tx("(no stack configured)", "（暂无技术栈资料）"),

      ".zshrc": () => tx("(browser demo: local shell configuration is unavailable)", "（浏览器演示：无法读取本地终端配置）"),
      ".bashrc": () => tx("(browser demo: local shell configuration is unavailable)", "（浏览器演示：无法读取本地终端配置）"),
      ".gitconfig": () => tx("(browser demo: local Git configuration is unavailable)", "（浏览器演示：无法读取本地 Git 配置）"),
    };
    return files[name] ? files[name]() : null;
  }

  function catCmd(args) {
    if (args.length === 0) return tx("cat: missing operand. try 'cat README.md'.", "cat：缺少文件名，可试试 cat README.md。");
    return args.map((name) => {
      const clean = name.replace(/^\.\//, "");
      const content = fileContent(clean);
      if (content != null) return content;
      if (DIRS.includes(clean) || DIRS.includes(clean + "/")) return tx(`cat: ${name}: Is a directory`, `cat：${name} 是目录`);
      return tx(`cat: ${name}: No such file or directory`, `cat：找不到 ${name}`);
    }).join("\n");
  }

  function uniqueProjects() {
    const pd = data();
    const seen = new Set();
    const projects = [];
    const push = (repo, source) => {
      if (!repo || !repo.name) return;
      const owner = repo.owner || handle();
      const key = `${owner}/${repo.name}`.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      projects.push({ ...repo, owner, source });
    };
    list(pd.pinned).forEach((repo) => push(repo, "pinned"));
    list(pd.ownRepos).forEach((repo) => push(repo, "own"));
    return projects;
  }

  function branchLines(items, prefix) {
    if (items.length === 0) return [`${prefix}└── ${tx("(empty)", "（空）")}`];
    return items.map((item, index) => {
      const marker = index === items.length - 1 ? "└── " : "├── ";
      return `${prefix}${marker}${item}`;
    });
  }

  function treeOutput() {
    const projects = uniqueProjects().slice(0, 10).map((repo) => {
      const target = repo.owner && repo.owner !== handle() ? ` -> ${repo.owner}/${repo.name}` : "/";
      return `${repo.name}${target}`;
    });
    const orgs = list(data().orgs).slice(0, 10).map((org) => `${org.handle || org.name}/`);
    const lines = [
      ".",
      "├── identity.toml",
      "├── .signatures",
      "├── .contact",
      "├── README.md",
      "├── tech.json",
      "├── stack.md",
      "├── projects/",
      ...branchLines(projects, "│   "),
      "├── talks/",
      "└── orgs/",
      ...branchLines(orgs, "    "),
      "",
      tx(`${3 + projects.length + orgs.length} directories, ${FILES.length} files`, `${3 + projects.length + orgs.length} 个目录，${FILES.length} 个文件`),
    ];
    return lines.join("\n");
  }

  function buildProcessTable() {
    return [
      tx("(simulated process list)", "（模拟进程列表）"),
      "  PID USER     %CPU  %MEM  COMMAND",
      `    1 ${unixUser().padEnd(8)} 0.0   0.1  /sbin/init`,
      `  421 ${unixUser().padEnd(8)} 1.8   3.2  tmux: server`,
      `  892 ${unixUser().padEnd(8)} 12.4  8.7  go test ./...`,
      ` 1024 ${unixUser().padEnd(8)} 6.1   2.4  nvim app.jsx`,
      ` 1337 ${unixUser().padEnd(8)} 2.1   1.4  pprof -http=:6060`,
      ` 8086 ${unixUser().padEnd(8)} 0.5   0.2  /bin/zsh`,
    ].join("\n");
  }

  function buildNeofetch() {
    const s = stats();
    const info = [
      `${handle()}@github`,
      "-----------------",
      tx("Runtime:  browser demo", "运行环境：浏览器演示"),
      tx("Source:   GitHub public API", "数据来源：GitHub 公开接口"),
      tx(`Repos:    ${s.repos ?? 0}`, `公开仓库：${s.repos ?? 0}`),
      tx(`Followers: ${s.followers ?? 0}`, `关注者：${s.followers ?? 0}`),
      tx(`Orgs:     ${list(data().orgs).length}`, `组织：${list(data().orgs).length}`),
    ];
    return info.join("\n");
  }

  const FORTUNES = [
    () => identity().motto || tx("Keep building.", "继续创造。"),
    () => tx("Talk is cheap. Show me the code. — Linus Torvalds", "空谈无益，拿代码来。— Linus Torvalds"),
    () => tx("First, solve the problem. Then, write the code. — John Johnson", "先解决问题，再编写代码。— John Johnson"),
    () => tx("Simplicity is the soul of efficiency. — Austin Freeman", "简洁是效率的灵魂。— Austin Freeman"),
    () => tx("Make it work, make it right, make it fast. — Kent Beck", "先让它运行，再让它正确，最后让它更快。— Kent Beck"),
    () => tx("The only way to do great work is to love what you do. — Steve Jobs", "成就出色工作的方法，是热爱自己所做的事。— Steve Jobs"),
    () => tx("Code is like dumplings — wrap it well, and it holds together. — 🥟", "代码就像饺子，包得扎实才不会散。— 🥟"),
  ];

  function slTrain() {
    return [
      "                                     ____",
      "  ====        ________                ___________________",
      "  _D _|  |_______/        \\__I_I_____===__|________________|_",
      "   |(_)---  |   H\\________/ |   |        =|___ ___|      _________",
      "  | ________|___H__/__|_____/[][]~\\_______|       |   -|_________|",
      "__/ =| o |=-O=====O=====O=====O \\ ____Y___________|__|____________",
      " |/-=|___|=    ||    ||    ||    |_____/~\\___/",
    ].join("\n");
  }

  function formatCommit(commit) {
    const tag = (commit.tag || "commit").padEnd(6, " ");
    const scope = commit.scope || "core";
    return `${commit.hash || "-------"}  ${tag} (${scope}) ${commit.msg || tx("update", "更新")}  [${commit.repo || handle()}, ${commit.time || tx("recent", "近期")}]`;
  }

  function gitCmd(args) {
    const sub = args[0];
    if (sub === "status") return tx("(browser demo: local Git status unavailable)", "（浏览器演示：无法读取本地 Git 状态）");
    if (sub === "log") {
      const commits = list(data().commits);
      return commits.length ? commits.slice(0, 10).map(formatCommit).join("\n") : tx("(no public commit sample loaded)", "（暂无公开提交样本）");
    }
    if (sub === "branch") return tx("(browser demo: branch list unavailable)", "（浏览器演示：无法读取分支列表）");
    if (sub === "remote") return `origin\thttps://github.com/${handle()}/${handle()}.github.io.git (fetch)\norigin\thttps://github.com/${handle()}/${handle()}.github.io.git (push)`;
    if (sub === "config") return tx("(browser demo: local Git configuration is unavailable)", "（浏览器演示：无法读取本地 Git 配置）");
    if (!sub) return tx("usage: git <command>\n  git status | log | branch | remote | config", "用法：git <命令>\n  git status | log | branch | remote | config");
    return tx(`git: '${sub}': not handled by this profile shell.`, `git：此演示终端不支持 ${sub}。`);
  }

  function repoListText(repos) {
    return repos.map((repo) => {
      const name = repo.owner ? `${repo.owner}/${repo.name}` : repo.name;
      const role = repo.role ? tx(repo.role, ({author:"作者",maintainer:"维护者",contributor:"贡献者"})[repo.role] || repo.role) : null;
      const meta = [repo.lang, repo.stars != null ? tx(`${repo.stars} stars`, `${repo.stars} 星`) : null, role].filter(Boolean).join(" · ");
      return `${name.padEnd(38, " ")} ${meta}${meta ? "  " : ""}${repoDescription(repo)}`;
    }).join("\n");
  }

  function ghCmd(args) {
    if (args[0] === "org" && args[1] === "list") return orgsText();
    if (args[0] === "repo" && args[1] === "list") {
      if (args.includes("--pinned")) return repoListText(list(data().pinned));
      const limitIndex = args.indexOf("--limit");
      const limit = limitIndex >= 0 ? Number(args[limitIndex + 1]) || 3 : 3;
      return repoListText(list(data().ownRepos).slice(0, limit));
    }
    return tx("usage: gh repo list [--pinned] [--limit n] | gh org list", "用法：gh repo list [--pinned] [--limit n] | gh org list");
  }

  function goCmd(args) {
    const sub = args[0];
    if (sub === "version" || sub === "env") return tx("Go environment unavailable in browser demo", "浏览器演示中无法获取 Go 环境");
    if (sub === "build" || sub === "test" || sub === "run") return tx(`go ${sub}: ok (simulated)`, `go ${sub}：完成（模拟）`);
    return tx("usage: go <command>\n  go version | go env | go build | go test | go run", "用法：go <命令>\n  go version | go env | go build | go test | go run");
  }

  function manFor(cmd) {
    const pages = {
      whoami: tx("WHOAMI(1)  Print the current user name.", "WHOAMI(1)  显示当前用户名。"),
      ls: tx("LS(1)      List files. -a: hidden files  -l: details", "LS(1)      列出文件。-a：含隐藏文件  -l：详细信息"),
      cat: tx("CAT(1)     Print file contents.", "CAT(1)     显示文件内容。"),
      git: tx("GIT(1)     Git command demo. Try: git log", "GIT(1)     Git 命令演示。试试 git log"),
      gh: tx("GH(1)      GitHub CLI demo. Try: gh repo list --pinned", "GH(1)      GitHub CLI 演示。试试 gh repo list --pinned"),
      go: tx("GO(1)      Go command demo. Try: go version", "GO(1)      Go 命令演示。试试 go version"),
    };
    return pages[cmd] || tx(`No manual entry for ${cmd}`, `没有 ${cmd} 的帮助条目`);
  }

  function contribSummary() {
    const counts = data().heatmap && data().heatmap.counts;
    if (!Array.isArray(counts)) {
      return [
        tx("public activity summary:", "公开动态摘要："),
        "",
        tx("  live public-events sample not loaded yet", "  尚未加载公开动态样本"),
        tx(`  commit rows available .... ${list(data().commits).length}`, `  可用提交记录：${list(data().commits).length}`),
        "",
        tx("reload later or use cached data after GitHub public REST succeeds", "请稍后刷新，或使用已缓存的 GitHub 公开数据"),
      ].join("\n");
    }

    const flat = counts.flat();
    const total = flat.reduce((sum, n) => sum + n, 0);
    const sampledDays = flat.filter((n) => n > 0).length;

    return [
      tx("public events sample (up to 100 latest events):", "公开动态样本（最多最近 100 条）："),
      "",
      tx(`  sampled events ... ${total}`, `  采样事件：${total}`),
      tx(`  sampled days ..... ${sampledDays}`, `  采样日期：${sampledDays}`),
      tx(`  commit sample .... ${list(data().commits).length}`, `  提交样本：${list(data().commits).length}`),
      "",
      tx("source: GitHub public events API; older activity is not covered", "来源：GitHub 公开动态接口；不包含更早的活动"),
    ].join("\n");
  }

  function orgsText() {
    const orgs = list(data().orgs);
    return orgs.length
      ? orgs.map((org) => `@${(org.handle || org.name || "").padEnd(38, " ")} ${org.note || org.name || ""}`).join("\n")
      : tx("(no public organizations loaded)", "（暂无公开组织资料）");
  }

  function runCommand(raw, ctx) {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case "help": case "?": return helpText();
      case "whoami": return unixUser();
      case "id": return tx(`github_id=${githubUid()} handle=${handle()} (browser demo)`, `GitHub ID=${githubUid()} 用户名=${handle()}（浏览器演示）`);
      case "pwd": return "/home/dumpling";
      case "ls": return lsCmd(args);
      case "ll": return lsCmd(["-l", ...args]);
      case "la": return lsCmd(["-la", ...args]);
      case "cat": return catCmd(args);
      case "echo": return args.join(" ");
      case "clear": case "cls": ctx.clearScreen(); return null;
      case "history": return ctx.history.length === 0 ? tx("(no history yet)", "（暂无历史命令）") : ctx.history.map((h, i) => `${String(i + 1).padStart(4, " ")}  ${h}`).join("\n");
      case "date": return nowStr();
      case "uname":
        return tx("browser demo: host kernel unavailable", "浏览器演示：无法获取设备内核信息");
      case "uptime": return uptimeStr();
      case "ps": return buildProcessTable();
      case "top": return buildProcessTable() + tx("\n\n(simulated output; press q to leave.)", "\n\n（模拟输出；按 q 退出。）");
      case "tree": return treeOutput();
      case "neofetch": case "fastfetch": return buildNeofetch();
      case "fortune": return FORTUNES[Math.floor(Math.random() * FORTUNES.length)]();
      case "git": return gitCmd(args);
      case "gh": return ghCmd(args);
      case "go": return goCmd(args);
      case "sudo": return tx("sudo is unavailable in this browser demo.", "此浏览器演示不支持 sudo。 ");
      case "vim": case "vi": case "nvim": return tx(`${cmd}: no TTY in this browser. Type ':q' to exit.`, `${cmd}：浏览器中没有 TTY。输入 :q 退出。`);
      case ":q": case ":q!": case ":wq": return tx("Vim closed.", "已退出 Vim。");
      case "nano": return tx("nano: editor unavailable in browser. Try 'cat <file>'.", "nano：浏览器中无法打开编辑器。可试试 cat <文件名>。 ");
      case "ssh": return args[0] ? tx(`ssh: cannot connect to ${args[0]} from this static page.`, `ssh：静态页面无法连接到 ${args[0]}。`) : tx("usage: ssh [-l login_name] hostname", "用法：ssh [-l 用户名] 主机名");
      case "curl": case "wget": return tx(`${cmd}: this browser demo cannot open arbitrary sockets. Try https://github.com/${handle()}`, `${cmd}：浏览器演示无法建立任意网络连接。可访问 https://github.com/${handle()}`);
      case "rm": return tx("rm: read-only profile filesystem", "rm：资料文件系统为只读");
      case "mkdir": case "touch": case "mv": case "cp": return tx(`${cmd}: read-only filesystem`, `${cmd}：文件系统为只读`);
      case "exit": case "logout": ctx.exit(); return null;
      case "man": return args[0] ? manFor(args[0]) : tx("Which manual page? Try: man ls", "要查看哪个命令的帮助？试试 man ls");
      case "sl": return slTrain();
      case "coffee": return "HTTP/1.1 418";
      case "yes": return Array(20).fill(args.join(" ") || "y").join("\n") + tx("\n(stopped after 20 lines)", "\n（输出 20 行后自动停止）");
      case "bin":
        if (args[0] === "--version" || args[0] === "-v") return tx("dumpling terminal portfolio (browser demo)", "dumpling 终端式个人主页（浏览器演示）");
        return tx(`GitHub profile: https://github.com/${handle()}`, `GitHub 主页：https://github.com/${handle()}`);
      case "open": case "xdg-open": return tx(`would open: ${args.join(" ") || "(nothing)"}`, `将打开：${args.join(" ") || "（无）"}`);
      case "stack": return list(data().tech).length ? list(data().tech).map((item) => `${item.k.padEnd(14, " ")} ${list(item.v).join(", ")}`).join("\n") : tx("No self-reported tech stack is published.", "未公开自述技术栈。");
      case "orgs": return orgsText();
      case "repos": return repoListText(list(data().ownRepos));
      case "contrib": return contribSummary();
      default: return tx(`${cmd}: command not found. Try 'help'.`, `找不到命令 ${cmd}。输入 help 查看可用命令。`);
    }
  }

  const COMMAND_NAMES = [
    "help", "whoami", "id", "pwd", "ls", "ll", "la", "cat", "echo", "clear", "history",
    "date", "uname", "uptime", "ps", "top", "tree", "neofetch", "fortune", "git", "gh",
    "go", "sudo", "vim", "nvim", "nano", "ssh", "curl", "rm", "exit", "logout", "man",
    "sl", "coffee", "yes", "bin", "stack", "orgs", "repos", "contrib",
  ];

  const SUBCOMMANDS = {
    git: ["status", "log", "branch", "remote", "config"],
    gh: ["repo", "org"],
    go: ["version", "env", "build", "test", "run"],
    bin: ["--version", "-v"],
    uname: ["-a", "-r"],
    ls: ["-l", "-a", "-la"],
  };

  const FILE_TAKERS = new Set(["cat", "man", "ls", "ll", "la", "rm", "tree", "open", "xdg-open"]);

  function commonPrefix(values) {
    if (values.length === 0) return "";
    let prefix = values[0];
    for (let i = 1; i < values.length; i++) {
      while (values[i].indexOf(prefix) !== 0) {
        prefix = prefix.slice(0, -1);
        if (!prefix) return "";
      }
    }
    return prefix;
  }

  function completeFor(text) {
    if (text.trim() === "") return { replace: null, list: COMMAND_NAMES };
    const endsWithSpace = /\s$/.test(text);
    const parts = text.split(/\s+/).filter(Boolean);
    const cmd = parts[0];

    if (parts.length <= 1 && !endsWithSpace) {
      const token = parts[0] || "";
      const matches = COMMAND_NAMES.filter((name) => name.startsWith(token));
      if (matches.length === 0) return { replace: null, list: [] };
      if (matches.length === 1) return { replace: matches[0] + " ", list: matches };
      const prefix = commonPrefix(matches);
      return { replace: prefix.length > token.length ? prefix : null, list: matches };
    }

    const token = endsWithSpace ? "" : parts[parts.length - 1];
    const head = endsWithSpace ? parts : parts.slice(0, -1);
    let pool = [];
    if (head.length === 1 && SUBCOMMANDS[cmd]) pool = SUBCOMMANDS[cmd];
    if (FILE_TAKERS.has(cmd)) pool = pool.concat(FILES, HIDDEN, DIRS);
    pool = Array.from(new Set(pool));

    const matches = pool.filter((item) => item.startsWith(token));
    if (matches.length === 0) return { replace: null, list: [] };
    if (matches.length === 1) return { replace: [...head, matches[0]].join(" ") + " ", list: matches };
    const prefix = commonPrefix(matches);
    if (prefix.length > token.length) return { replace: [...head, prefix].join(" "), list: matches };
    return { replace: null, list: matches };
  }

  window.SHELL = { runCommand, completeFor, COMMAND_NAMES };
})();
