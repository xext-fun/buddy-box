(() => {
  const api = globalThis.browser || globalThis.chrome;
  const host = location.hostname.toLowerCase().replace(/^www\./, "");
  const site = host === "x.com" || host === "twitter.com" ? "x" :
    host === "instagram.com" ? "instagram" :
    host === "facebook.com" || host === "m.facebook.com" ? "facebook" :
    host === "tiktok.com" || host === "m.tiktok.com" ? "tiktok" : null;
  if (!site) return;
  let handles = new Set();
  let scheduled = false;

  const selectors = {
    x: ['article[data-testid="tweet"]', '[data-testid="cellInnerDiv"] article'],
    instagram: ['article', '[role="article"]', 'article ul li', '[role="article"] ul li'],
    facebook: ['[role="article"]', '[data-pagelet^="FeedUnit"]', '[role="listitem"]'],
    tiktok: ['[data-e2e="recommend-list-item-container"]', '[data-e2e="comment-item"]', '[data-e2e="search_top-item"]', 'article']
  };

  function handleFromUrl(href) {
    try {
      const url = new URL(href, location.href);
      const domain = url.hostname.toLowerCase().replace(/^www\./, "");
      if (!(["x.com", "twitter.com", "instagram.com", "facebook.com", "m.facebook.com", "tiktok.com", "m.tiktok.com"].includes(domain))) return null;
      const parts = url.pathname.split("/").filter(Boolean);
      if (domain.includes("facebook")) {
        if (parts[0] === "profile.php") return url.searchParams.get("id")?.toLowerCase() || null;
        if (["people", "pages"].includes(parts[0])) return null;
      }
      const first = (parts[0] || "").replace(/^@/, "").toLowerCase();
      if (!first || ["home", "explore", "search", "watch", "groups", "reel", "reels", "p", "stories", "video", "videos", "photo", "hashtag", "tag", "share", "login", "messages", "notifications"].includes(first)) return null;
      return /^[a-z0-9][a-z0-9._-]{0,63}$/.test(first) ? first : null;
    } catch (_) { return null; }
  }

  function firstProfileLink(node, scope) {
    for (const link of node.querySelectorAll(scope)) {
      const handle = handleFromUrl(link.getAttribute("href"));
      if (handle) return handle;
    }
    return null;
  }

  function author(node) {
    if (site === "x") {
      const label = node.querySelector('[data-testid="User-Name"]');
      return label ? firstProfileLink(label, 'a[href]') : null;
    }
    if (site === "instagram") {
      const header = node.matches("li") ? node : node.querySelector("header") || node;
      return firstProfileLink(header, 'a[href]');
    }
    if (site === "facebook") {
      const header = node.querySelector('h2, h3, [data-ad-preview="message"]')?.parentElement || node;
      return firstProfileLink(header, 'a[href]') || firstProfileLink(node, 'a[role="link"][href]');
    }
    if (site === "tiktok") {
      const named = node.querySelector('[data-e2e="browse-username"], [data-e2e="video-author-uniqueid"], [data-e2e="comment-username"]');
      if (named) {
        const link = named.closest("a[href]") || named.querySelector("a[href]");
        return link ? handleFromUrl(link.getAttribute("href")) : named.textContent.trim().replace(/^@/, "").toLowerCase();
      }
      return firstProfileLink(node, 'a[href^="/@"]');
    }
    return null;
  }

  function scan() {
    scheduled = false;
    const nodes = new Set(selectors[site].flatMap(selector => [...document.querySelectorAll(selector)]));
    for (const node of nodes) {
      const matched = handles.has(author(node));
      node.classList.toggle("buddy-box-match", matched);
    }
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(scan, 120);
  }
  api.storage.local.get("handles").then(result => {
    handles = new Set(result.handles || []);
    scan();
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  });
  api.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.handles) { handles = new Set(changes.handles.newValue || []); schedule(); }
  });
})();
