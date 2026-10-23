/**
 * Markdown to HTML — 工具邏輯
 * 功能：輕量且完整的純前端 Markdown 解析器、HTML 產出與富文本複製
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('markdown-to-html'); } catch (_) {}

  const mdInput = document.getElementById('md-input');
  const mdStats = document.getElementById('md-stats');
  const btnSample = document.getElementById('btn-sample');
  const btnClear = document.getElementById('btn-clear');
  const viewPreview = document.getElementById('view-preview');
  const viewCode = document.getElementById('view-code');
  const previewContainer = document.getElementById('preview-container');
  const htmlCodeContainer = document.getElementById('html-code-container');
  const btnCopyHtml = document.getElementById('btn-copy-html');
  const btnCopyRich = document.getElementById('btn-copy-rich');
  const btnDownloadHtml = document.getElementById('btn-download-html');

  /* ================================================================
     純 JavaScript Markdown 轉譯器
     ================================================================ */

  function parseMarkdown(md) {
    if (!md) return '';

    // 1. 暫存代碼塊，避免其內部語法被誤解析
    const codeBlocks = [];
    let text = md.replace(/```([\s\S]*?)```/g, (_, code) => {
      const idx = codeBlocks.length;
      codeBlocks.push(code);
      return `@@CODEBLOCK_${idx}@@`;
    });

    // 2. 轉譯標題
    text = text.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    text = text.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    text = text.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // 3. 分隔線
    text = text.replace(/^\s*[-*_]{3,}\s*$/gim, '<hr>');

    // 4. 引用塊
    text = text.replace(/^\> (.*$)/gim, '<blockquote style="border-left: 4px solid var(--color-accent); padding-left: 12px; margin: 8px 0; color: var(--color-text-secondary);">$1</blockquote>');

    // 5. 粗體、斜體、刪除線
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');
    text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // 6. 行內代碼
    text = text.replace(/`([^`]+)`/g, '<code style="background: var(--color-bg); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono, monospace); font-size: 0.875em;">$1</code>');

    // 7. 圖片與連結
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 6px;">');
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--color-accent); text-decoration: underline;">$1</a>');

    // 8. 無序清單與有序清單
    text = text.replace(/^\s*[\-\*]\s+(.*$)/gim, '<li>$1</li>');
    text = text.replace(/(<li>[\s\S]*?<\/li>)/gm, '<ul style="margin: 8px 0; padding-left: 24px;">$1</ul>');

    // 9. 簡單表格解析
    const lines = text.split('\n');
    let inTable = false;
    const processedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line.slice(1, -1).split('|').map((c) => c.trim());
        if (cells.every((c) => /^:?-+:?$/.test(c))) {
          // 分隔行跳過
          continue;
        }
        if (!inTable) {
          inTable = true;
          processedLines.push('<table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid var(--color-border); font-size: 0.875rem;">');
          processedLines.push('<tr style="background: var(--color-surface); font-weight: 700;">' + cells.map((c) => `<th style="border: 1px solid var(--color-border); padding: 8px 12px;">${c}</th>`).join('') + '</tr>');
        } else {
          processedLines.push('<tr>' + cells.map((c) => `<td style="border: 1px solid var(--color-border); padding: 8px 12px;">${c}</td>`).join('') + '</tr>');
        }
      } else {
        if (inTable) {
          inTable = false;
          processedLines.push('</table>');
        }
        processedLines.push(lines[i]);
      }
    }
    if (inTable) processedLines.push('</table>');
    text = processedLines.join('\n');

    // 10. 段落換行
    text = text.replace(/\n\s*\n/g, '</p><p style="margin: 10px 0;">');
    text = `<p style="margin: 10px 0;">${text}</p>`;

    // 清理標籤內包裹的多餘段落
    text = text.replace(/<p style="margin: 10px 0;"><h([1-6])>/g, '<h$1>');
    text = text.replace(/<\/h([1-6])><\/p>/g, '</h$1>');
    text = text.replace(/<p style="margin: 10px 0;"><hr><\/p>/g, '<hr>');
    text = text.replace(/<p style="margin: 10px 0;"><table/g, '<table');
    text = text.replace(/<\/table><\/p>/g, '</table>');
    text = text.replace(/<p style="margin: 10px 0;"><ul/g, '<ul');
    text = text.replace(/<\/ul><\/p>/g, '</ul>');

    // 11. 還原代碼塊
    text = text.replace(/@@CODEBLOCK_(\d+)@@/g, (_, idx) => {
      const rawCode = codeBlocks[parseInt(idx, 10)] || '';
      const lines = rawCode.split('\n');
      const firstLine = lines[0].trim();
      const codeContent = (firstLine && !rawCode.startsWith('\n')) ? lines.slice(1).join('\n') : rawCode;

      return `<pre style="background: #0f172a; color: #f8fafc; padding: 14px; border-radius: 8px; overflow-x: auto; font-family: var(--font-mono, monospace); font-size: 0.8125rem; margin: 12px 0;"><code>${Utils.escapeHtml(codeContent.trim())}</code></pre>`;
    });

    return text;
  }

  function updateConversion() {
    const raw = mdInput.value;
    mdStats.textContent = `字數：${raw.replace(/\s+/g, '').length} · 行數：${raw ? raw.split('\n').length : 0}`;

    const html = parseMarkdown(raw);
    previewContainer.innerHTML = html;
    htmlCodeContainer.value = html;
  }

  const debouncedConvert = Utils.debounce(updateConversion, 120);
  mdInput.addEventListener('input', debouncedConvert);

  // 視圖切換
  viewPreview.addEventListener('click', () => {
    viewPreview.className = 'btn btn--sm btn--primary';
    viewCode.className = 'btn btn--sm btn--ghost';
    previewContainer.style.display = 'block';
    htmlCodeContainer.style.display = 'none';
  });

  viewCode.addEventListener('click', () => {
    viewCode.className = 'btn btn--sm btn--primary';
    viewPreview.className = 'btn btn--sm btn--ghost';
    previewContainer.style.display = 'none';
    htmlCodeContainer.style.display = 'block';
  });

  // 載入範例
  btnSample.addEventListener('click', () => {
    mdInput.value = `# Qiyen Toolbox 專案介紹

這是一個專為日常學習、開發與文件設計的 **個人工具箱**。

## 核心特色
- **100% 本地運算**：所有功能均在瀏覽器端極速執行
- **資料高度隱私**：絕不上傳敏感檔案至第三方伺服器
- **現代化設計**：支援深色/淺色主題與極簡微動畫

### 功能分類對照表
| 分類 | 代表工具 | 說明 |
| :--- | :--- | :--- |
| 圖片視覺 | 圖片壓縮、格式互轉 | 本地 Canvas 處理 |
| 開發程式 | JSON 格式化、API Tester | 提升工程師工作流 |
| 檔案處理 | 批次改名、PDF 合併 | 多檔案一鍵打包 |

### 快速開始代碼範例
\`\`\`bash
# 啟動本地開發環境
npm run dev
\`\`\`

> *「精益求精，持續打造最順手的數位生產力工具。」* — Qiyen`;
    updateConversion();
    Utils.showToast('已載入範例 Markdown', 'info');
  });

  // 清空
  btnClear.addEventListener('click', () => {
    mdInput.value = '';
    updateConversion();
    Utils.showToast('已清空內容', 'info');
  });

  // 複製 HTML
  btnCopyHtml.addEventListener('click', () => {
    const html = htmlCodeContainer.value;
    if (!html) return;
    Utils.copyToClipboard(html, '已複製 HTML 程式碼');
  });

  // 複製富文本
  btnCopyRich.addEventListener('click', async () => {
    try {
      const html = previewContainer.innerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([previewContainer.innerText], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': blob,
        'text/plain': textBlob,
      });
      await navigator.clipboard.write([item]);
      Utils.showToast('已複製富文本格式，可直接貼入 Word 或 Google 文件！', 'success');
    } catch {
      Utils.copyToClipboard(htmlCodeContainer.value, '已回退複製純文字 HTML');
    }
  });

  // 下載完整 HTML 文件
  btnDownloadHtml.addEventListener('click', () => {
    const bodyContent = htmlCodeContainer.value;
    if (!bodyContent) return;

    const fullDoc = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>匯出的 Markdown 文件</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.7; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    code { font-family: Consolas, Monaco, monospace; }
  </style>
</head>
<body>
${bodyContent}
</body>
</html>`;

    Utils.downloadText(fullDoc, 'document.html', 'text/html');
    Utils.showToast('已下載完整 HTML 文件！', 'success');
  });

  // 初始載入
  btnSample.click();
});
