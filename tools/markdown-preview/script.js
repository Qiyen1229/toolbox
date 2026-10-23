/**
 * Markdown Preview 實作腳本
 */
document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('markdown-preview'); } catch (_) {}

  const mdInput = document.getElementById('md-input');
  const mdPreview = document.getElementById('md-preview');
  const btnDemo = document.getElementById('btn-demo');
  const btnClear = document.getElementById('btn-clear');
  const btnCopyHtml = document.getElementById('btn-copy-html');
  const btnDownload = document.getElementById('btn-download');

  // 輕量純前端 Markdown 解析器
  function parseMarkdown(md) {
    if (!md) return '';
    let html = Utils.escapeHtml(String(md)) || String(md);
    if (!html) return '';

    // 程式碼區塊 ```code```
    html = html.replace(/```([a-zA-Z0-9_]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre style="background: var(--color-bg); padding: 12px; border-radius: 6px; border: 1px solid var(--color-border); overflow-x: auto; margin: 12px 0;"><code>${code}</code></pre>`;
    });

    // 行內程式碼 `code`
    html = html.replace(/`([^`]+)`/g, '<code style="background: var(--color-bg); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono, monospace); font-size: 0.85em; border: 1px solid var(--color-border);">$1</code>');

    // 標題 (# ~ ######)
    html = html.replace(/^###### (.*$)/gim, '<h6 style="font-size: 1rem; margin: 12px 0 6px;">$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5 style="font-size: 1.1rem; margin: 14px 0 6px;">$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4 style="font-size: 1.25rem; margin: 16px 0 8px;">$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1.4rem; margin: 18px 0 8px; border-bottom: 1px solid var(--color-border); padding-bottom: 4px;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 1.6rem; margin: 20px 0 10px; border-bottom: 1px solid var(--color-border); padding-bottom: 4px;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 1.85rem; margin: 22px 0 12px; border-bottom: 2px solid var(--color-accent); padding-bottom: 6px;">$1</h1>');

    // 粗體與斜體
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // 引用區塊 >
    html = html.replace(/^\> (.*$)/gim, '<blockquote style="border-left: 4px solid var(--color-accent); padding: 6px 16px; margin: 12px 0; background: var(--color-accent-subtle); color: var(--color-text-secondary); border-radius: 0 4px 4px 0;">$1</blockquote>');

    // 分隔線 ---
    html = html.replace(/^---$/gim, '<hr style="border: none; border-top: 1px solid var(--color-border); margin: 20px 0;">');

    // 超連結 [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--color-accent); text-decoration: underline;">$1</a>');

    // 清單項目 -
    html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li style="margin-left: 20px; list-style-type: disc;">$1</li>');

    // 換行
    html = html.replace(/\n\n/g, '<p style="margin-bottom: 12px;"></p>');

    return html;
  }

  function render() {
    const raw = mdInput.value;
    mdPreview.innerHTML = parseMarkdown(raw);
  }

  mdInput.addEventListener('input', render);

  btnDemo.addEventListener('click', () => {
    mdInput.value = `# Qiyen Toolbox 專案說明書

> 這是一個集結 34 款實用小工具與開發者專屬套件的現代化前端網站。

---

## 🛠️ 核心特色
- **100% 本地執行**：所有計算皆在瀏覽器內部完成，隱私安全無虞。
- **支援 PWA**：可一鍵加入 iPhone / iPad 主畫面，支援離線快取。
- **Developer Mode**：專為工程師量身打造的高階模式。

### 💻 範例代碼
\`\`\`javascript
const greeting = "Hello, Qiyen Toolbox!";
console.log(greeting);
\`\`\`

---
*由 Qiyen 開發並維護 · 2026*`;
    render();
  });

  btnClear.addEventListener('click', () => {
    mdInput.value = '';
    mdPreview.innerHTML = '';
    mdInput.focus();
  });

  btnCopyHtml.addEventListener('click', () => {
    if (!mdPreview.innerHTML) return;
    Utils.copyToClipboard(mdPreview.innerHTML, '已複製渲染後的 HTML 代碼');
  });

  btnDownload.addEventListener('click', () => {
    const content = mdInput.value;
    if (!content.trim()) {
      Utils.showToast('內容為空，無法下載', 'warning');
      return;
    }
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
    Utils.showToast('已下載 document.md', 'success');
  });

  btnDemo.click();
});
