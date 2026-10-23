/**
 * CSS Formatter 實作腳本
 */
document.addEventListener('DOMContentLoaded', () => {
  StorageManager.addRecent('css-formatter');

  const cssInput = document.getElementById('css-input');
  const cssOutput = document.getElementById('css-output');
  const indentSelect = document.getElementById('indent-select');
  const btnFormat = document.getElementById('btn-format');
  const btnMinify = document.getElementById('btn-minify');
  const btnDemo = document.getElementById('btn-demo');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');

  function formatCss(css, indentSize = 2) {
    const tab = ' '.repeat(indentSize);
    // 移除現有多餘空白
    let clean = css.replace(/\s+/g, ' ').replace(/\s*{\s*/g, ' {\n').replace(/;\s*/g, ';\n').replace(/\s*}\s*/g, '\n}\n');

    const lines = clean.split('\n');
    let formatted = '';
    let indentLevel = 0;

    lines.forEach(line => {
      let trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.endsWith('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
        formatted += tab.repeat(indentLevel) + trimmed + '\n\n';
      } else if (trimmed.endsWith('{')) {
        formatted += tab.repeat(indentLevel) + trimmed + '\n';
        indentLevel++;
      } else {
        formatted += tab.repeat(indentLevel) + trimmed + '\n';
      }
    });

    return formatted.trim();
  }

  function minifyCss(css) {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除註解
      .replace(/\s+/g, ' ')             // 多空白轉單一空白
      .replace(/\s*([:;{}])\s*/g, '$1') // 移除符號周圍空白
      .replace(/;}/g, '}')              // 移除最後分號
      .trim();
  }

  btnFormat.addEventListener('click', () => {
    const raw = cssInput.value;
    if (!raw.trim()) {
      Utils.showToast('請輸入 CSS 樣式代碼', 'warning');
      return;
    }
    cssOutput.textContent = formatCss(raw, parseInt(indentSelect.value));
    Utils.showToast('CSS 格式化完成', 'success');
  });

  btnMinify.addEventListener('click', () => {
    const raw = cssInput.value;
    if (!raw.trim()) return;
    cssOutput.textContent = minifyCss(raw);
    Utils.showToast('已完成單行壓縮', 'info');
  });

  btnDemo.addEventListener('click', () => {
    cssInput.value = `.hero-section{position:relative;text-align:center;padding:56px 24px;border-radius:20px;background:#0b1120;color:#fff}.hero-section .title{font-size:2.5rem;font-weight:800;letter-spacing:-0.02em}.hero-section .btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(59,130,246,0.3)}`;
    btnFormat.click();
  });

  btnClear.addEventListener('click', () => {
    cssInput.value = '';
    cssOutput.textContent = '';
    cssInput.focus();
  });

  btnCopy.addEventListener('click', () => {
    if (!cssOutput.textContent) {
      Utils.showToast('目前無可複製內容', 'warning');
      return;
    }
    Utils.copyToClipboard(cssOutput.textContent, '已複製 CSS 結果');
  });

  indentSelect.addEventListener('change', () => {
    if (cssInput.value.trim()) btnFormat.click();
  });

  btnDemo.click();
});
