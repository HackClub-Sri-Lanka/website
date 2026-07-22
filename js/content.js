/* =========================================================
   HCSL CONTENT LOADER
   Tiny frontmatter + markdown reader for the site's file-based
   CMS. Every collection (team, projects, workshops, faq) lives
   under /content/<collection>/ as plain .md files, listed in
   that folder's _manifest.json so the browser knows what to
   fetch (static hosts like GitHub Pages / Vercel can't list a
   directory on their own).
   ========================================================= */

window.HCSLContent = (function () {

  /**
   * Splits a markdown file into { data, body }.
   * Supports: strings, quoted strings, booleans, and simple
   * inline arrays like tags: [A, B, C].
   */
  function parseFrontmatter(raw) {
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (!match) return { data: {}, body: raw.trim() };

    const [, fm, body] = match;
    const data = {};

    fm.split('\n').forEach(line => {
      if (!line.trim()) return;
      const idx = line.indexOf(':');
      if (idx === -1) return;

      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      } else if (value.startsWith('[') && value.endsWith(']')) {
        value = value
          .slice(1, -1)
          .split(',')
          .map(s => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      } else if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      } else if (value !== '' && !isNaN(Number(value))) {
        value = Number(value);
      }

      data[key] = value;
    });

    return { data, body: body.trim() };
  }

  async function fetchText(path) {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to fetch ${path} (${res.status})`);
    return res.text();
  }

  async function fetchManifest(folder) {
    const text = await fetchText(`${folder}/_manifest.json`);
    return JSON.parse(text);
  }

  /** Renders markdown body text to safe-ish HTML. Uses marked.js if it
   *  loaded from the CDN; otherwise falls back to plain paragraphs so
   *  the page never breaks if the CDN is unreachable. */
  function renderMarkdown(md) {
    if (!md) return '';
    if (window.marked && typeof window.marked.parse === 'function') {
      return window.marked.parse(md);
    }
    const escape = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    return md
      .split(/\n\n+/)
      .map(p => `<p>${escape(p)}</p>`)
      .join('');
  }

  async function loadCollection(folder) {
    const files = await fetchManifest(folder);
    const entries = await Promise.all(files.map(async file => {
      const raw = await fetchText(`${folder}/${file}`);
      const { data, body } = parseFrontmatter(raw);
      return { ...data, body, bodyHtml: renderMarkdown(body), _file: file };
    }));
    entries.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return entries;
  }

  async function loadSingle(path) {
    const raw = await fetchText(path);
    const { data, body } = parseFrontmatter(raw);
    return { ...data, body, bodyHtml: renderMarkdown(body) };
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  return { parseFrontmatter, fetchText, fetchManifest, loadCollection, loadSingle, renderMarkdown, escapeHtml };
})();
