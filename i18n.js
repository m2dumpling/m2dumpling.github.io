// The shell commands and repository names stay in their original form.
// All surrounding interface copy follows the selected language.
(function () {
  const storageKey = "dumpling-profile.language.v1";
  let language = "zh";
  try {
    language = localStorage.getItem(storageKey) === "en" ? "en" : "zh";
  } catch (e) {}

  window.siteLanguage = () => language;
  window.setSiteLanguage = (next) => {
    language = next === "en" ? "en" : "zh";
    try { localStorage.setItem(storageKey, language); } catch (e) {}
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title = language === "zh"
      ? "m2dumpling · 终端式个人主页"
      : "m2dumpling · terminal portfolio";
  };
  window.tx = (english, chinese) => language === "zh" ? chinese : english;
  window.repoDescription = (repo) => language === "zh" && repo.descZh
    ? repo.descZh : (repo.desc || "");
  window.localizeProfileStatus = (message) => {
    const fixed = {
      "GitHub snapshot": "GitHub 资料快照",
      "Static Profile Data": "静态资料",
      "local GitHub profile cache": "本地 GitHub 资料缓存",
      "fresh GitHub profile cache": "有效的 GitHub 资料缓存",
      "GitHub public API fetch": "获取 GitHub 公开数据",
      "GitHub profile cache snapshot": "GitHub 资料缓存快照",
      "stale GitHub profile cache": "过期的 GitHub 资料缓存",
      "static profile fallback": "使用静态资料快照",
      "Profile Data Ready": "个人资料已就绪",
      "profile data refresh": "刷新个人资料",
    };
    if (fixed[message]) return fixed[message];
    return String(message)
      .replace(/ account index$/, " 账户索引")
      .replace(/^(\d+) repositories · (\d+) orgs$/, "$1 个仓库 · $2 个组织")
      .replace(/^(\d+) pinned project cards$/, "$1 张置顶项目卡片")
      .replace(/^(\d+) selected own repositories$/, "$1 个精选个人仓库")
      .replace(/^(\d+) public activity events$/, "$1 条公开动态")
      .replace(/^(\d+) recent commit rows$/, "$1 条近期提交");
  };
  window.setSiteLanguage(language);
})();
