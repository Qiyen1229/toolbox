/**
 * Regex Tester 實作腳本
 */
document.addEventListener('DOMContentLoaded', () => {
  StorageManager.addRecent('regex-tester');

  const patternInput = document.getElementById('regex-pattern');
  const flagsInput = document.getElementById('regex-flags');
  const testString = document.getElementById('test-string');
  const matchHighlight = document.getElementById('match-highlight');
  const matchCount = document.getElementById('match-count');
  const replaceInput = document.getElementById('replace-input');
  const replacePreview = document.getElementById('replace-preview');
  const btnCopyReplaced = document.getElementById('btn-copy-replaced');
  const presetButtons = document.querySelectorAll('.regex-preset');

  // 執行比對與高亮
  function runRegex() {
    const pStr = patternInput.value;
    const fStr = flagsInput.value;
    const text = testString.value;

    if (!pStr || !text) {
      matchHighlight.textContent = text ? text : '比對結果將在此處高亮顯示...';
      matchCount.textContent = '0 次匹配';
      replacePreview.textContent = text;
      return;
    }

    try {
      const regex = new RegExp(pStr, fStr);
      let count = 0;
      let lastIndex = 0;
      let html = '';

      // 若有 g flag 則迴圈匹配，若無則只配第一個
      if (fStr.includes('g')) {
        let match;
        // 避免死循環（例如零寬匹配）
        let maxLoops = 1000;
        while ((match = regex.exec(text)) !== null && maxLoops-- > 0) {
          count++;
          const matchStart = match.index;
          const matchEnd = matchStart + match[0].length;

          // 前段普通文字
          html += Utils.escapeHtml(text.substring(lastIndex, matchStart));
          // 匹配高亮標記
          html += `<mark style="background: rgba(59, 130, 246, 0.25); color: inherit; border-radius: 2px; padding: 1px 3px; border-bottom: 2px solid var(--color-accent); font-weight: 600;">${Utils.escapeHtml(match[0])}</mark>`;
          lastIndex = matchEnd;

          if (match[0].length === 0) {
            regex.lastIndex++; // 避免空字串死循環
          }
        }
        html += Utils.escapeHtml(text.substring(lastIndex));
      } else {
        const match = regex.exec(text);
        if (match) {
          count = 1;
          const matchStart = match.index;
          const matchEnd = matchStart + match[0].length;
          html += Utils.escapeHtml(text.substring(0, matchStart));
          html += `<mark style="background: rgba(59, 130, 246, 0.25); color: inherit; border-radius: 2px; padding: 1px 3px; border-bottom: 2px solid var(--color-accent); font-weight: 600;">${Utils.escapeHtml(match[0])}</mark>`;
          html += Utils.escapeHtml(text.substring(matchEnd));
        } else {
          html = Utils.escapeHtml(text);
        }
      }

      matchCount.textContent = `${count} 次匹配`;
      matchHighlight.innerHTML = html;

      // 替換
      const repVal = replaceInput.value;
      const replaced = text.replace(regex, repVal);
      replacePreview.textContent = replaced;
    } catch (err) {
      matchCount.textContent = '語法錯誤';
      matchHighlight.innerHTML = `<span style="color: var(--color-error); font-weight: 600;">⚠️ 正規表達式錯誤：${Utils.escapeHtml(err.message)}</span>`;
      replacePreview.textContent = text;
    }
  }

  patternInput.addEventListener('input', runRegex);
  flagsInput.addEventListener('input', runRegex);
  testString.addEventListener('input', runRegex);
  replaceInput.addEventListener('input', runRegex);

  // 常用範本點擊
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      patternInput.value = btn.dataset.pattern;
      flagsInput.value = btn.dataset.flags;
      runRegex();
      Utils.showToast(`已載入 ${btn.textContent} 範本`, 'info');
    });
  });

  btnCopyReplaced.addEventListener('click', () => {
    Utils.copyToClipboard(replacePreview.textContent, '已複製替換後結果');
  });

  // 預設示範文字
  patternInput.value = '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})';
  flagsInput.value = 'g';
  testString.value = `歡迎使用 Qiyen Toolbox 測試字串！
聯絡信箱 1: dev@example.com
聯絡信箱 2: support@company.org
非信箱測試: not-an-email, user@, @domain.com`;
  replaceInput.value = 'HIDDEN_EMAIL';
  runRegex();
});
