/* Shared by the sidebar and the Node tests. */
(function (root) {
  const HANDLE_HEADERS = new Set([
    "handle", "handles", "username", "user name", "user_name", "screen name",
    "screen_name", "account", "account name", "account_name", "profile", "profile url", "profile_url"
  ]);

  function parseCsv(input) {
    const rows = [];
    let row = [], field = "", quoted = false;
    const text = input.replace(/^\uFEFF/, "");
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (quoted) {
        if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (char === '"') quoted = false;
        else field += char;
      } else if (char === '"') quoted = true;
      else if (char === ",") { row.push(field); field = ""; }
      else if (char === "\n" || char === "\r") {
        if (char === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        if (row.some(cell => cell.trim())) rows.push(row);
        row = []; field = "";
      } else field += char;
    }
    if (quoted) throw new Error("The CSV has an unclosed quoted field.");
    row.push(field);
    if (row.some(cell => cell.trim())) rows.push(row);
    return rows;
  }

  function normalizeHandle(value) {
    let text = String(value || "").trim();
    if (!text) return null;
    try {
      const url = new URL(text);
      const host = url.hostname.toLowerCase().replace(/^www\./, "");
      if (!["x.com", "twitter.com", "instagram.com", "facebook.com", "fb.com", "tiktok.com", "m.tiktok.com"].includes(host)) return null;
      text = decodeURIComponent(url.pathname.split("/").filter(Boolean)[0] || "");
    } catch (_) { /* Plain handle. */ }
    text = text.replace(/^@+/, "").trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9._-]{0,63}$/.test(text)) return null;
    if (["home", "explore", "reels", "reel", "videos", "watch", "groups", "profile.php", "login", "search"].includes(text)) return null;
    return text;
  }

  function extractHandles(input) {
    const rows = parseCsv(input);
    if (!rows.length) return { handles: [], column: null, rows: 0 };
    const header = rows[0].map(cell => cell.trim().toLowerCase().replace(/[-\s]+/g, " "));
    let column = header.findIndex(cell => HANDLE_HEADERS.has(cell) || /(?:^| )(?:handle|username|user name|screen name|profile url)(?:$| )/.test(cell));
    let start = 1;
    if (column < 0) {
      // Headerless one-column CSVs are common. For wider files, require a clear header.
      if (rows.every(row => row.length === 1)) { column = 0; start = 0; }
      else throw new Error("Could not find a handle column. Name it handle, username, account, or profile URL.");
    }
    const handles = [];
    for (const row of rows.slice(start)) {
      const handle = normalizeHandle(row[column]);
      if (handle) handles.push(handle);
    }
    return { handles: [...new Set(handles)], column: column + 1, rows: rows.length - start };
  }

  function toCsv(handles) {
    return "handle\r\n" + [...new Set(handles)].sort().map(handle => '"' + handle.replace(/"/g, '""') + '"').join("\r\n") + "\r\n";
  }

  const api = { parseCsv, normalizeHandle, extractHandles, toCsv };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.BuddyHandles = api;
})(globalThis);
