/**
 * Text Diff — 工具邏輯
 * 功能：使用 LCS 演算法進行純前端逐行與逐字文字差異比對
 */

document.addEventListener('DOMContentLoaded', () => {
  // 記錄使用紀錄
  try { StorageManager?.addRecent?.('text-diff'); } catch (_) {}

  // DOM 元素
  const diffOrig = document.getElementById('diff-orig');
  const diffMod = document.getElementById('diff-mod');
  const btnCompare = document.getElementById('btn-compare');
  const btnClear = document.getElementById('btn-clear');
  const btnSample = document.getElementById('btn-sample');
  const btnSwap = document.getElementById('btn-swap');
  const diffMode = document.getElementById('diff-mode');
  const diffResultSection = document.getElementById('diff-result-section');
  const diffOutput = document.getElementById('diff-output');
  const badgeAdded = document.getElementById('badge-added');
  const badgeRemoved = document.getElementById('badge-removed');

  /* ================================================================
     LCS 演算法核心比對
     ================================================================ */

  /**
   * 計算最長公共子序列（LCS）並回傳 diff 清單
   * @param {string[]} a — 原始序列
   * @param {string[]} b — 目標序列
   * @returns {Array<{ type: 'common'|'add'|'del', value: string }>}
   */
  function computeDiff(a, b) {
    const n = a.length;
    const m = b.length;
    // 建立二維 DP 表格
    const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (a[i] === b[j]) {
          dp[i + 1][j + 1] = dp[i][j] + 1;
        } else {
          dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
      }
    }

    // 回溯尋找差異
    let i = n;
    let j = m;
    const diff = [];

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
        diff.unshift({ type: 'common', value: a[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        diff.unshift({ type: 'add', value: b[j - 1] });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        diff.unshift({ type: 'del', value: a[i - 1] });
        i--;
      }
    }

    return diff;
  }

  /* ================================================================
     執行比對並渲染結果
     ================================================================ */

  function performDiff() {
    const textA = diffOrig.value;
    const textB = diffMod.value;

    if (!textA && !textB) {
      diffResultSection.style.display = 'none';
      Utils.showToast('請先輸入要比較的文字', 'warning');
      return;
    }

    const mode = diffMode.value;
    let itemsA = [];
    let itemsB = [];

    if (mode === 'line') {
      itemsA = textA.split('\n');
      itemsB = textB.split('\n');
    } else {
      // 逐字元/詞彙比對
      itemsA = textA.match(/[\s\S]/gu) || [];
      itemsB = textB.match(/[\s\S]/gu) || [];
    }

    const diffResults = computeDiff(itemsA, itemsB);

    // 統計新增與刪除數量
    let addCount = 0;
    let delCount = 0;

    diffResults.forEach((item) => {
      if (item.type === 'add') addCount++;
      if (item.type === 'del') delCount++;
    });

    badgeAdded.textContent = `+${addCount} ${mode === 'line' ? '行新增' : '處新增'}`;
    badgeRemoved.textContent = `-${delCount} ${mode === 'line' ? '行刪除' : '處刪除'}`;

    // 渲染 HTML
    if (mode === 'line') {
      let origLineNum = 1;
      let modLineNum = 1;

      diffOutput.innerHTML = diffResults
        .map((item) => {
          let bg = 'transparent';
          let sign = ' ';
          let color = 'inherit';
          let lCol = '';
          let rCol = '';

          if (item.type === 'add') {
            bg = 'var(--color-success-light)';
            color = 'var(--color-success)';
            sign = '+';
            rCol = modLineNum++;
          } else if (item.type === 'del') {
            bg = 'var(--color-error-light)';
            color = 'var(--color-error)';
            sign = '-';
            lCol = origLineNum++;
          } else {
            sign = ' ';
            lCol = origLineNum++;
            rCol = modLineNum++;
          }

          return `
            <div style="display: flex; padding: 2px 8px; background: ${bg}; color: ${color}; white-space: pre-wrap; word-break: break-all;">
              <span style="width: 35px; user-select: none; color: var(--color-text-tertiary); text-align: right; margin-right: 8px;">${lCol}</span>
              <span style="width: 35px; user-select: none; color: var(--color-text-tertiary); text-align: right; margin-right: 12px;">${rCol}</span>
              <span style="width: 20px; user-select: none; font-weight: 700;">${sign}</span>
              <span style="flex: 1;">${Utils.escapeHtml(item.value) || '&nbsp;'}</span>
            </div>
          `;
        })
        .join('');
    } else {
      // 逐字渲染
      let html = '<div style="padding: var(--space-md); white-space: pre-wrap; word-break: break-all; line-height: 1.8;">';
      diffResults.forEach((item) => {
        const text = Utils.escapeHtml(item.value);
        if (item.type === 'add') {
          html += `<ins style="background: var(--color-success-light); color: var(--color-success); text-decoration: none; font-weight: 600; padding: 1px 2px; border-radius: 2px;">${text}</ins>`;
        } else if (item.type === 'del') {
          html += `<del style="background: var(--color-error-light); color: var(--color-error); text-decoration: line-through; padding: 1px 2px; border-radius: 2px;">${text}</del>`;
        } else {
          html += text;
        }
      });
      html += '</div>';
      diffOutput.innerHTML = html;
    }

    diffResultSection.style.display = 'block';
  }

  /* ================================================================
     事件綁定
     ================================================================ */

  btnCompare.addEventListener('click', performDiff);
  diffMode.addEventListener('change', performDiff);

  btnSwap.addEventListener('click', () => {
    const temp = diffOrig.value;
    diffOrig.value = diffMod.value;
    diffMod.value = temp;
    performDiff();
    Utils.showToast('已左右對調內容', 'info');
  });

  btnSample.addEventListener('click', () => {
    diffOrig.value = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`;

    diffMod.value = `// 使用 Array.reduce 重構以提高可讀性
function calculateTotal(items) {
  if (!items || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + item.price, 0);
}`;

    performDiff();
  });

  btnClear.addEventListener('click', () => {
    diffOrig.value = '';
    diffMod.value = '';
    diffResultSection.style.display = 'none';
    Utils.showToast('已清空內容', 'info');
  });
});
