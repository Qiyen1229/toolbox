/**
 * HTML Formatter 實作腳本
 */
document.addEventListener('DOMContentLoaded', () => {
  StorageManager.addRecent('html-formatter');

  const htmlInput = document.getElementById('html-input');
  const htmlOutput = document.getElementById('html-output');
  const indentSelect = document.getElementById('indent-select');
  const btnFormat = document.getElementById('btn-format');
  const btnMinify = document.getElementById('btn-minify');
  const btnDemo = document.getElementById('btn-demo');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');

  // 純前端輕量 HTML 格式化演算法
  function formatHtml(html, indentSize = 2) {
    const tab = ' '.repeat(indentSize);
    let result = '';
    let indent = '';

    // 拆分標籤與文字
    const tokens = html.replace(/>\s*</g, '><').split(/(<[^>]+>)/g).filter(Boolean);

    // 自閉合標籤清單
    const selfClosing = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/i;

    tokens.forEach(token => {
      if (token.startsWith('</')) {
        // 閉合標籤：縮排減一
        indent = indent.slice(tab.length);
        result += '\n' + indent + token;
      } else if (token.startsWith('<') && !token.startsWith('<!') && !token.endsWith('/>')) {
        const tagName = token.match(/<([a-zA-Z0-9]+)/)?.[1];
        if (tagName && selfClosing.test(tagName)) {
          // 自閉合標籤不增加縮排
          result += (result ? '\n' : '') + indent + token;
        } else {
          // 開啟標籤
          result += (result ? '\n' : '') + indent + token;
          indent += tab;
        }
      } else if (token.startsWith('<!') || token.endsWith('/>')) {
        result += (result ? '\n' : '') + indent + token;
      } else {
        // 純文字內容
        const text = token.trim();
        if (text) {
          result += (result ? '\n' : '') + indent + text;
        }
      }
    });

    return result.trim();
  }

  function minifyHtml(html) {
    return html
      .replace(/<!--[\s\S]*?-->/g, '') // 移除註解
      .replace(/>\s+</g, '><')         // 移除標籤間空白
      .replace(/\s{2,}/g, ' ')         // 多重空白轉單一空白
      .trim();
  }

  btnFormat.addEventListener('click', () => {
    const raw = htmlInput.value;
    if (!raw.trim()) {
      Utils.showToast('請輸入 HTML 程式碼', 'warning');
      return;
    }
    htmlOutput.textContent = formatHtml(raw, parseInt(indentSelect.value));
    Utils.showToast('HTML 格式化完成', 'success');
  });

  btnMinify.addEventListener('click', () => {
    const raw = htmlInput.value;
    if (!raw.trim()) return;
    htmlOutput.textContent = minifyHtml(raw);
    Utils.showToast('已完成單行壓縮', 'info');
  });

  btnDemo.addEventListener('click', () => {
    htmlInput.value = `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="UTF-8"><title>Demo</title><link rel="stylesheet" href="style.css"></head><body><header class="header"><h1>Hello World</h1><nav><ul><li><a href="#home">Home</a></li><li><a href="#about">About</a></li></ul></nav></header><main><article><p>This is a paragraph.</p></article></main></body></html>`;
    btnFormat.click();
  });

  btnClear.addEventListener('click', () => {
    htmlInput.value = '';
    htmlOutput.textContent = '';
    htmlInput.focus();
  });

  btnCopy.addEventListener('click', () => {
    if (!htmlOutput.textContent) {
      Utils.showToast('目前無可複製內容', 'warning');
      return;
    }
    Utils.copyToClipboard(htmlOutput.textContent, '已複製 HTML 結果');
  });

  indentSelect.addEventListener('change', () => {
    if (htmlInput.value.trim()) btnFormat.click();
  });

  btnDemo.click();
});
