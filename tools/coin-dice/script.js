// 拋硬幣與擲骰子邏輯

(function() {
  const gameModes = document.getElementById('game-modes');
  const coinSection = document.getElementById('coin-section');
  const diceSection = document.getElementById('dice-section');

  // 硬幣元素
  const coinEl = document.getElementById('coin-element');
  const coinResultText = document.getElementById('coin-result-text');
  const btnFlipCoin = document.getElementById('btn-flip-coin');
  const statHeads = document.getElementById('stat-heads');
  const statTails = document.getElementById('stat-tails');
  const statTotalFlips = document.getElementById('stat-total-flips');

  let headsCount = 0;
  let tailsCount = 0;
  let isFlipping = false;

  // 骰子元素
  const diceCountSelect = document.getElementById('dice-count');
  const diceContainer = document.getElementById('dice-container');
  const diceSumDisplay = document.getElementById('dice-sum-display');
  const btnRollDice = document.getElementById('btn-roll-dice');
  let isRolling = false;

  const DICE_UNICODE = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  function flipCoin() {
    if (isFlipping) return;
    isFlipping = true;
    coinEl.classList.add('flipping');
    coinResultText.textContent = '拋擲中...';

    setTimeout(() => {
      const isHead = Math.random() >= 0.5;
      coinEl.classList.remove('flipping');

      if (isHead) {
        headsCount++;
        coinEl.textContent = '正面';
        coinEl.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        coinResultText.textContent = '🎉 結果是：正面！';
      } else {
        tailsCount++;
        coinEl.textContent = '反面';
        coinEl.style.background = 'linear-gradient(135deg, #64748b 0%, #475569 100%)';
        coinResultText.textContent = '✨ 結果是：反面！';
      }

      statHeads.textContent = headsCount;
      statTails.textContent = tailsCount;
      statTotalFlips.textContent = headsCount + tailsCount;
      isFlipping = false;
    }, 800);
  }

  function rollDice() {
    if (isRolling) return;
    isRolling = true;
    const count = parseInt(diceCountSelect.value, 10) || 2;

    const diceEls = diceContainer.querySelectorAll('.die');
    diceEls.forEach(d => d.classList.add('rolling'));
    diceSumDisplay.textContent = '滾動中...';

    setTimeout(() => {
      let sum = 0;
      diceContainer.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const val = Math.floor(Math.random() * 6) + 1;
        sum += val;
        const die = document.createElement('div');
        die.className = 'die';
        die.textContent = DICE_UNICODE[val];
        diceContainer.appendChild(die);
      }
      diceSumDisplay.textContent = `總點數：${sum}`;
      isRolling = false;
    }, 600);
  }

  // 切換模式
  gameModes.addEventListener('click', (e) => {
    const btn = e.target.closest('.game-switch-btn');
    if (btn && btn.dataset.mode) {
      gameModes.querySelectorAll('.game-switch-btn').forEach(b => {
        b.classList.toggle('active', b === btn);
      });
      if (btn.dataset.mode === 'coin') {
        coinSection.style.display = 'flex';
        diceSection.style.display = 'none';
      } else {
        coinSection.style.display = 'none';
        diceSection.style.display = 'flex';
        if (diceContainer.children.length === 0) {
          rollDice();
        }
      }
    }
  });

  coinEl.addEventListener('click', flipCoin);
  btnFlipCoin.addEventListener('click', flipCoin);
  btnRollDice.addEventListener('click', rollDice);
  diceCountSelect.addEventListener('change', rollDice);
})();
