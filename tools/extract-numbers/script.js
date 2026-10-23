/**
 * Extract Numbers — 工具邏輯
 * 功能：正規表達式提取數字、支援千分位/小數/負數與自動計算統計數值
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('extract-numbers'); } catch (_) {}

  const inputRaw = document.getElementById('input-raw');
  const outputNumbers = document.getElementById('output-numbers');
  const statsSection = document.getElementById('stats-section');
  const statCount = document.getElementById('stat-count');
  const statSum = document.getElementById('stat-sum');
  const statAvg = document.getElementById('stat-avg');
  const statMin = document.getElementById('stat-min');
  const statMax = document.getElementById('stat-max');
  const optDecimals = document.getElementById('opt-decimals');
  const optNegative = document.getElementById('opt-negative');
  const optUnique = document.getElementById('opt-unique');
  const optSort = document.getElementById('opt-sort');
  const btnSample = document.getElementById('btn-sample');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');
  const btnCopyStats = document.getElementById('btn-copy-stats');

  let currentStatsText = '';

  function extractNumbers() {
    const raw = inputRaw.value;
    if (!raw) {
      outputNumbers.value = '';
      statsSection.style.display = 'none';
      return;
    }

    // 支援處理含千分位逗號的數字，先將如 1,234.56 轉為 1234.56
    let normalized = raw.replace(/(\d),(\d{3})/g, '$1$2');

    let pattern;
    if (optDecimals.checked && optNegative.checked) {
      pattern = /-?\b\d+(\.\d+)?\b/g;
    } else if (optDecimals.checked && !optNegative.checked) {
      pattern = /\b\d+(\.\d+)?\b/g;
    } else if (!optDecimals.checked && optNegative.checked) {
      pattern = /-?\b\d+\b/g;
    } else {
      pattern = /\b\d+\b/g;
    }

    const matches = normalized.match(pattern) || [];
    let numbers = matches.map((n) => parseFloat(n)).filter((n) => !isNaN(n));

    if (numbers.length === 0) {
      outputNumbers.value = '（未找到符合條件的數值）';
      statsSection.style.display = 'none';
      return;
    }

    if (optUnique.checked) {
      numbers = Array.from(new Set(numbers));
    }

    if (optSort.checked) {
      numbers.sort((a, b) => a - b);
    }

    outputNumbers.value = numbers.join('\n');

    // 計算統計
    const count = numbers.length;
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    const avg = sum / count;
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);

    statCount.textContent = count.toLocaleString();
    statSum.textContent = parseFloat(sum.toFixed(4)).toLocaleString();
    statAvg.textContent = parseFloat(avg.toFixed(4)).toLocaleString();
    statMin.textContent = parseFloat(min.toFixed(4)).toLocaleString();
    statMax.textContent = parseFloat(max.toFixed(4)).toLocaleString();
    statsSection.style.display = 'block';

    currentStatsText = `【數值統計摘要】
提取數量：${count} 個
數值總和：${sum}
平均數值：${avg.toFixed(4)}
最小值：${min}
最大值：${max}`;
  }

  const debouncedExtract = Utils.debounce(extractNumbers, 120);
  inputRaw.addEventListener('input', debouncedExtract);

  [optDecimals, optNegative, optUnique, optSort].forEach((el) => {
    el.addEventListener('change', extractNumbers);
  });

  btnSample.addEventListener('click', () => {
    inputRaw.value = `本月份財務報表與氣溫紀錄：
北部地區第一週營業額為 128,500 元，成本支出為 45,200.5 元。
第二週平均客單價 350 元，訂單數達 1,420 筆。
第三週受冷氣團影響，最低溫驟降至 -3.5 度，營業額下滑至 89,000 元。
昨日盤點庫存虧損 -150 件，目前備貨總量 2,500 件。`;
    extractNumbers();
    Utils.showToast('已載入範例數值文字', 'info');
  });

  btnClear.addEventListener('click', () => {
    inputRaw.value = '';
    outputNumbers.value = '';
    statsSection.style.display = 'none';
    Utils.showToast('已清空內容', 'info');
  });

  btnCopy.addEventListener('click', () => {
    const text = outputNumbers.value;
    if (!text) return;
    Utils.copyToClipboard(text, '已複製數值列表！');
  });

  btnCopyStats.addEventListener('click', () => {
    if (!currentStatsText) return;
    Utils.copyToClipboard(currentStatsText, '已複製統計摘要報告！');
  });

  // 初始載入範例
  btnSample.click();
});
