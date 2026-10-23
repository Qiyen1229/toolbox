// Markdown 筆記工具邏輯與 LocalStorage 本地存檔

(function() {
  const STORAGE_KEY = 'qiyen_toolbox_saved_note';
  const mdEditor = document.getElementById('md-editor');
  const previewPane = document.getElementById('preview-pane');
  const saveStatus = document.getElementById('save-status');
  const statWords = document.getElementById('stat-words');
  const statChars = document.getElementById('stat-chars');
  const statReadTime = document.getElementById('stat-read-time');
  const btnExportMd = document.getElementById('btn-export-md');
  const btnClear = document.getElementById('btn-clear');
  const btnCopyRaw = document.getElementById('btn-copy-raw');

  let saveTimeout = null;

  // 輕量 GFM 解析器
  function parseMarkdown(md) {
    if (!md) return '<p style="color: var(--color-text-tertiary); font-style: italic;">尚未輸入內容...</p>';

    let text = md.replace(/\r\n/g, '\n');

    // 程式碼區塊 ```
    text = text.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre style="background: var(--color-bg-secondary); padding: 12px; border-radius: 6px; overflow-x: auto; font-family: var(--font-mono, monospace); font-size: 0.875rem;"><code>${escaped}</code></pre>`;
    });

    // 行內行代碼 `
    text = text.replace(/`([^`\n]+)`/g, '<code style="background: var(--color-bg-secondary); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono, monospace); font-size: 0.875em;">$1</code>');

    // 標題
    text = text.replace(/^###### (.*$)/gim, '<h6 style="margin: 1em 0 0.5em; font-size: 0.875rem; font-weight: 700;">$1</h6>');
    text = text.replace(/^##### (.*$)/gim, '<h5 style="margin: 1.1em 0 0.5em; font-size: 1rem; font-weight: 700;">$1</h5>');
    text = text.replace(/^#### (.*$)/gim, '<h4 style="margin: 1.2em 0 0.5em; font-size: 1.125rem; font-weight: 700;">$1</h4>');
    text = text.replace(/^### (.*$)/gim, '<h3 style="margin: 1.3em 0 0.5em; font-size: 1.25rem; font-weight: 700;">$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2 style="margin: 1.4em 0 0.5em; font-size: 1.5rem; font-weight: 700; border-bottom: 1px solid var(--color-border); padding-bottom: 4px;">$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1 style="margin: 1.5em 0 0.6em; font-size: 1.85rem; font-weight: 800; border-bottom: 2px solid var(--color-border); padding-bottom: 6px;">$1</h1>');

    // 粗體與斜體
    text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // 引用 blockquote
    text = text.replace(/^\> (.*$)/gim, '<blockquote style="border-left: 4px solid var(--color-accent); margin: 0.8em 0; padding: 4px 12px; color: var(--color-text-secondary);">$1</blockquote>');

    // 水平分隔線
    text = text.replace(/^(-{3,}|\*{3,}|_{3,})$/gim, '<hr style="border: none; border-top: 1px solid var(--color-border); margin: 1.5em 0;">');

    // 連結與圖片
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 6px; margin: 8px 0;">');
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--color-accent); text-decoration: underline;">$1</a>');

    // 無序清單與有序清單
    text = text.replace(/^\s*[-*+]\s+(.*$)/gim, '<li style="margin-left: 1.5em; list-style-type: disc;">$1</li>');
    text = text.replace(/^\s*\d+\.\s+(.*$)/gim, '<li style="margin-left: 1.5em; list-style-type: decimal;">$1</li>');

    // 段落換行
    const paragraphs = text.split(/\n\n+/);
    text = paragraphs.map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<blockquote') || p.startsWith('<hr') || p.startsWith('<li')) {
        return p;
      }
      return `<p style="margin: 0.8em 0; line-height: 1.7;">${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return text;
  }

  function updateStats(content) {
    const chars = content.length;
    // 統計中文字符與英文單詞
    const cjkMatches = content.match(/[\u4e00-\u9fa5]/g) || [];
    const engMatches = content.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z0-9_\-]+/g) || [];
    const totalWords = cjkMatches.length + engMatches.length;

    statChars.textContent = chars.toLocaleString();
    statWords.textContent = totalWords.toLocaleString();

    // 假設每分鐘閱讀 300 字
    const mins = Math.max(1, Math.ceil(totalWords / 300));
    statReadTime.textContent = `${mins} 分鐘`;
  }

  function render() {
    const val = mdEditor.value;
    previewPane.innerHTML = parseMarkdown(val);
    updateStats(val);

    // 儲存到 LocalStorage
    saveStatus.textContent = '○ 儲存中...';
    saveStatus.style.color = 'var(--color-warning)';

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, val);
        saveStatus.textContent = '● 已自動儲存';
        saveStatus.style.color = 'var(--color-success)';
      } catch (e) {
        saveStatus.textContent = '✕ 儲存失敗';
        saveStatus.style.color = 'var(--color-danger)';
      }
    }, 400);
  }

  // 載入儲存內容或範例
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    mdEditor.value = saved;
  } else {
    mdEditor.value = `# 歡迎使用 Markdown 即時筆記

這是一款純前端、自動儲存在本地瀏覽器的輕量級筆記工具。

### 特色功能：
- **即時預覽**：左邊編輯、右邊立刻渲染效果
- **本地自動存檔**：不怕突然重整或瀏覽器關閉
- **隨時匯出**：點擊右上角隨時下載 \`.md\` 檔案

### 快速代碼範例：
\`\`\`javascript
function greet(name) {
  console.log("Hello, " + name);
}
greet("Qiyen");
\`\`\`

> *「紙上得來終覺淺，絕知此事要躬行。」*
`;
  }

  render();

  mdEditor.addEventListener('input', render);

  btnCopyRaw.addEventListener('click', () => {
    const val = mdEditor.value;
    if (window.ToolboxApp && window.ToolboxApp.copyToClipboard) {
      window.ToolboxApp.copyToClipboard(val, 'Markdown 源代碼已複製');
    } else {
      navigator.clipboard.writeText(val);
    }
  });

  btnExportMd.addEventListener('click', () => {
    const val = mdEditor.value;
    const blob = new Blob([val], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  });

  btnClear.addEventListener('click', () => {
    if (confirm('確定要清空整份筆記嗎？此操作無法撤銷。')) {
      mdEditor.value = '';
      render();
    }
  });
})();
