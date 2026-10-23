// 隨機數字產生器邏輯 (Web Crypto API)

(function() {
  const randMinInput = document.getElementById('rand-min');
  const randMaxInput = document.getElementById('rand-max');
  const randCountInput = document.getElementById('rand-count');
  const randSortSelect = document.getElementById('rand-sort');
  const randUniqueCheckbox = document.getElementById('rand-unique');
  const btnGenerate = document.getElementById('btn-generate');
  const resultsContainer = document.getElementById('results-container');
  const btnCopy = document.getElementById('btn-copy');

  const statCount = document.getElementById('stat-count');
  const statSum = document.getElementById('stat-sum');
  const statAvg = document.getElementById('stat-avg');

  let currentResults = [];

  function getSecureRandomInt(min, max) {
    const range = max - min + 1;
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return min + (array[0] % range);
  }

  function generate() {
    let min = parseInt(randMinInput.value, 10);
    let max = parseInt(randMaxInput.value, 10);
    let count = parseInt(randCountInput.value, 10) || 1;
    const isUnique = randUniqueCheckbox.checked;
    const sort = randSortSelect.value;

    if (isNaN(min) || isNaN(max)) return;
    if (min > max) {
      const temp = min;
      min = max;
      max = temp;
      randMinInput.value = min;
      randMaxInput.value = max;
    }

    const range = max - min + 1;
    if (isUnique && count > range) {
      count = range;
      randCountInput.value = count;
      if (window.ToolboxApp && window.ToolboxApp.showToast) {
        window.ToolboxApp.showToast(`範圍內僅有 ${range} 個不重複數字，已自動調整為 ${range}`, 'warning');
      }
    }

    let numbers = [];
    if (isUnique) {
      const set = new Set();
      while (set.size < count) {
        set.add(getSecureRandomInt(min, max));
      }
      numbers = Array.from(set);
    } else {
      for (let i = 0; i < count; i++) {
        numbers.push(getSecureRandomInt(min, max));
      }
    }

    if (sort === 'asc') {
      numbers.sort((a, b) => a - b);
    } else if (sort === 'desc') {
      numbers.sort((a, b) => b - a);
    }

    currentResults = numbers;

    // 渲染數字卡片
    resultsContainer.innerHTML = '';
    numbers.forEach(num => {
      const chip = document.createElement('div');
      chip.style.cssText = 'background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%); border: 1px solid var(--color-accent); color: var(--color-accent); font-weight: 800; font-family: var(--font-mono, monospace); font-size: 1.25rem; padding: 10px 18px; border-radius: var(--radius-md); min-width: 50px; text-align: center; animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);';
      chip.textContent = num;
      resultsContainer.appendChild(chip);
    });

    // 統計數據
    const sum = numbers.reduce((acc, cur) => acc + cur, 0);
    const avg = numbers.length > 0 ? (sum / numbers.length).toFixed(2) : 0;
    statCount.textContent = numbers.length;
    statSum.textContent = sum.toLocaleString();
    statAvg.textContent = avg;
  }

  btnGenerate.addEventListener('click', generate);

  btnCopy.addEventListener('click', () => {
    if (currentResults.length === 0) return;
    const text = currentResults.join(', ');
    if (window.ToolboxApp && window.ToolboxApp.copyToClipboard) {
      window.ToolboxApp.copyToClipboard(text, '隨機數字已複製');
    } else {
      navigator.clipboard.writeText(text);
    }
  });

  generate();
})();
