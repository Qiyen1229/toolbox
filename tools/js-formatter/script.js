/**
 * JS Formatter 實作腳本
 */
document.addEventListener('DOMContentLoaded', () => {
  StorageManager.addRecent('js-formatter');

  const jsInput = document.getElementById('js-input');
  const jsOutput = document.getElementById('js-output');
  const indentSelect = document.getElementById('indent-select');
  const btnFormat = document.getElementById('btn-format');
  const btnMinify = document.getElementById('btn-minify');
  const btnDemo = document.getElementById('btn-demo');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');

  // 純前端輕量 Token-based JS 格式化美化演算法
  function formatJs(code, indentSize = 2) {
    const tab = ' '.repeat(indentSize);
    let indentLevel = 0;
    let formatted = '';
    let inString = false;
    let stringChar = '';
    let inComment = false;

    // 預先在關鍵符號前後標準化處理
    const trimmed = code.trim();

    for (let i = 0; i < trimmed.length; i++) {
      const c = trimmed[i];
      const prev = trimmed[i - 1];
      const next = trimmed[i + 1];

      // 字串處理
      if ((c === '"' || c === "'" || c === '`') && prev !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = c;
        } else if (stringChar === c) {
          inString = false;
        }
      }

      if (inString) {
        formatted += c;
        continue;
      }

      // 括號與分號排版
      if (c === '{' || c === '[') {
        indentLevel++;
        formatted += c + '\n' + tab.repeat(indentLevel);
      } else if (c === '}' || c === ']') {
        indentLevel = Math.max(0, indentLevel - 1);
        formatted += '\n' + tab.repeat(indentLevel) + c;
      } else if (c === ';') {
        formatted += c + '\n' + tab.repeat(indentLevel);
      } else if (c === '\n') {
        // 合併連續換行
        if (!formatted.endsWith('\n')) {
          formatted += '\n' + tab.repeat(indentLevel);
        }
      } else {
        formatted += c;
      }
    }

    // 清理可能產生的空白行
    return formatted
      .split('\n')
      .map(line => line.trimEnd())
      .filter((line, idx, arr) => line || (arr[idx - 1] && arr[idx - 1].trim()))
      .join('\n')
      .trim();
  }

  function minifyJs(code) {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除區塊註解
      .replace(/\/\/[^\n]*/g, '')        // 移除單行註解
      .replace(/\s+/g, ' ')             // 合併空白
      .replace(/\s*([=+\-*/%&|!<>?:;,{}()[\]])\s*/g, '$1') // 移除符號旁空白
      .trim();
  }

  btnFormat.addEventListener('click', () => {
    const raw = jsInput.value;
    if (!raw.trim()) {
      Utils.showToast('請輸入 JavaScript 程式碼', 'warning');
      return;
    }
    jsOutput.textContent = formatJs(raw, parseInt(indentSelect.value));
    Utils.showToast('JS 格式化完成', 'success');
  });

  btnMinify.addEventListener('click', () => {
    const raw = jsInput.value;
    if (!raw.trim()) return;
    jsOutput.textContent = minifyJs(raw);
    Utils.showToast('已完成單行壓縮', 'info');
  });

  btnDemo.addEventListener('click', () => {
    jsInput.value = `function calculateTotal(items, taxRate = 0.05) { const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0); const tax = subtotal * taxRate; return { subtotal, tax, total: subtotal + tax, isEligible: subtotal > 1000 }; } const cart = [{ name: "Keyboard", price: 1200, quantity: 1 }, { name: "Mouse", price: 450, quantity: 2 }]; console.log(calculateTotal(cart));`;
    btnFormat.click();
  });

  btnClear.addEventListener('click', () => {
    jsInput.value = '';
    jsOutput.textContent = '';
    jsInput.focus();
  });

  btnCopy.addEventListener('click', () => {
    if (!jsOutput.textContent) {
      Utils.showToast('目前無可複製內容', 'warning');
      return;
    }
    Utils.copyToClipboard(jsOutput.textContent, '已複製 JS 結果');
  });

  indentSelect.addEventListener('change', () => {
    if (jsInput.value.trim()) btnFormat.click();
  });

  btnDemo.click();
});
