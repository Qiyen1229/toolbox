// 隨機抽籤器邏輯

(function() {
  const PRESETS = {
    lunch: ['牛肉麵', '健康餐盒', '韓式炸雞', '日式豚骨拉麵', '麥當勞', '滷肉飯便當', '義大利麵', '壽司', '小火鍋', '港式燒臘', '鐵板燒'],
    activity: ['真心話：說出最近一次說謊是什麼時候？', '大冒險：模仿一種動物叫聲 10 秒', '大冒險：做 15 下伏地挺身', '真心話：最尷尬的一段出糗經歷', '懲罰：喝下一整杯水', '真心話：在場第一印象最好的人是誰？'],
    yesno: ['是 (Yes)', '否 (No)', '命運未定，再抽一次', '勇敢去做！', '最好再想一想']
  };

  const itemsInput = document.getElementById('items-input');
  const pickCountInput = document.getElementById('pick-count');
  const noReplaceCheckbox = document.getElementById('no-replace');
  const btnSpin = document.getElementById('btn-spin');
  const winnerDisplay = document.getElementById('winner-display');
  const historyBox = document.getElementById('history-box');
  const historyList = document.getElementById('history-list');
  const btnClearHistory = document.getElementById('btn-clear-history');
  const presetBtns = document.querySelectorAll('.btn-preset-list');

  let isSpinning = false;
  let historyRecords = [];

  function getItems() {
    return itemsInput.value
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  function spin() {
    if (isSpinning) return;
    const items = getItems();
    if (items.length === 0) {
      if (window.ToolboxApp && window.ToolboxApp.showToast) {
        window.ToolboxApp.showToast('請先輸入至少一個候選項目！', 'warning');
      }
      return;
    }

    const count = Math.min(items.length, Math.max(1, parseInt(pickCountInput.value, 10) || 1));
    isSpinning = true;
    btnSpin.disabled = true;

    let elapsed = 0;
    const duration = 1200; // 1.2 秒滾動動畫
    const interval = 60;

    const timer = setInterval(() => {
      elapsed += interval;
      const randIdx = Math.floor(Math.random() * items.length);
      winnerDisplay.textContent = items[randIdx];
      winnerDisplay.style.transform = 'scale(0.95)';

      if (elapsed >= duration) {
        clearInterval(timer);
        finalizePick(items, count);
      }
    }, interval);
  }

  function finalizePick(items, count) {
    // 隨機選出 count 個
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    const winners = shuffled.slice(0, count);

    winnerDisplay.textContent = winners.join('、');
    winnerDisplay.style.transform = 'scale(1.05)';
    winnerDisplay.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    // 若勾選抽後不放回
    if (noReplaceCheckbox.checked) {
      const remaining = items.filter(item => !winners.includes(item));
      itemsInput.value = remaining.join('\n');
    }

    // 紀錄歷史
    historyRecords.unshift({
      time: new Date().toLocaleTimeString(),
      winners: winners.join('、')
    });
    renderHistory();

    isSpinning = false;
    btnSpin.disabled = false;
  }

  function renderHistory() {
    if (historyRecords.length > 0) {
      historyBox.style.display = 'block';
      historyList.innerHTML = historyRecords.map(r => `<div>[${r.time}] <strong>${r.winners}</strong></div>`).join('');
    } else {
      historyBox.style.display = 'none';
    }
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const p = PRESETS[btn.dataset.preset];
      if (p) {
        itemsInput.value = p.join('\n');
        winnerDisplay.textContent = '準備就緒！點擊開始';
      }
    });
  });

  btnSpin.addEventListener('click', spin);

  btnClearHistory.addEventListener('click', () => {
    historyRecords = [];
    renderHistory();
  });

  // 預設午餐
  itemsInput.value = PRESETS.lunch.join('\n');
})();
