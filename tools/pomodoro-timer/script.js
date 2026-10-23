// 番茄工作法計時器邏輯

(function() {
  const CIRCLE_RADIUS = 115;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ~722.57

  const timerModes = document.getElementById('timer-modes');
  const progressCircle = document.getElementById('progress-circle');
  const timeDisplay = document.getElementById('time-display');
  const modeText = document.getElementById('mode-text');
  const btnToggle = document.getElementById('btn-toggle');
  const btnReset = document.getElementById('btn-reset');
  const tomatoCountDisplay = document.getElementById('tomato-count-display');
  const tomatoIcons = document.getElementById('tomato-icons');

  let currentMode = 'work';
  let totalSeconds = 25 * 60;
  let remainingSeconds = totalSeconds;
  let timerId = null;
  let isRunning = false;
  let completedTomatoes = parseInt(localStorage.getItem('qiyen_pomodoro_count') || '0', 10);

  function playChime() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        const start = ctx.currentTime + idx * 0.15;
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.2, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.8);
      });
    } catch (e) {}
  }

  function updateDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    timeDisplay.textContent = timeStr;

    // 圓環進度 (倒扣)
    const progress = remainingSeconds / totalSeconds;
    const offset = CIRCLE_CIRCUMFERENCE * (1 - progress);
    progressCircle.style.strokeDashoffset = offset;

    // 頁籤標題
    if (isRunning) {
      document.title = `(${timeStr}) ${currentMode === 'work' ? '專注中' : '休息中'} — 番茄鐘`;
    } else {
      document.title = '番茄鐘 (Pomodoro Timer) — Qiyen Toolbox';
    }
  }

  function renderTomatoes() {
    tomatoCountDisplay.textContent = `${completedTomatoes} 顆`;
    let icons = '';
    for (let i = 0; i < Math.min(completedTomatoes, 10); i++) {
      icons += '🍅 ';
    }
    tomatoIcons.textContent = icons;
    localStorage.setItem('qiyen_pomodoro_count', completedTomatoes);
  }

  function switchMode(mode, mins) {
    currentMode = mode;
    totalSeconds = mins * 60;
    remainingSeconds = totalSeconds;
    pause();

    timerModes.querySelectorAll('.pomodoro-mode-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });

    if (mode === 'work') {
      modeText.textContent = '🎯 專注時間';
      progressCircle.style.stroke = 'var(--color-accent)';
      btnToggle.textContent = '開始專注';
    } else if (mode === 'short-break') {
      modeText.textContent = '☕ 短暫休息';
      progressCircle.style.stroke = 'var(--color-success)';
      btnToggle.textContent = '開始休息';
    } else {
      modeText.textContent = '🌴 充分放鬆長休息';
      progressCircle.style.stroke = 'var(--color-primary, #3b82f6)';
      btnToggle.textContent = '開始休息';
    }

    updateDisplay();
  }

  function tick() {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateDisplay();
    } else {
      // 完成
      pause();
      playChime();
      if (currentMode === 'work') {
        completedTomatoes++;
        renderTomatoes();
        if (window.ToolboxApp && window.ToolboxApp.showToast) {
          window.ToolboxApp.showToast('🎉 恭喜完成一個番茄鐘！休息一下吧！', 'success');
        }
        // 自動切換為短休息
        switchMode('short-break', 5);
      } else {
        if (window.ToolboxApp && window.ToolboxApp.showToast) {
          window.ToolboxApp.showToast('休息結束，準備開始下一個專注週期！', 'info');
        }
        switchMode('work', 25);
      }
    }
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    btnToggle.textContent = '暫停計時';
    btnToggle.classList.remove('btn--primary');
    btnToggle.classList.add('btn--secondary');
    timerId = setInterval(tick, 1000);
  }

  function pause() {
    if (!isRunning) return;
    isRunning = false;
    btnToggle.textContent = currentMode === 'work' ? '繼續專注' : '繼續休息';
    btnToggle.classList.remove('btn--secondary');
    btnToggle.classList.add('btn--primary');
    clearInterval(timerId);
    timerId = null;
  }

  btnToggle.addEventListener('click', () => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  });

  btnReset.addEventListener('click', () => {
    pause();
    remainingSeconds = totalSeconds;
    btnToggle.textContent = currentMode === 'work' ? '開始專注' : '開始休息';
    updateDisplay();
  });

  timerModes.addEventListener('click', (e) => {
    const btn = e.target.closest('.pomodoro-mode-btn');
    if (btn && btn.dataset.mode) {
      switchMode(btn.dataset.mode, parseInt(btn.dataset.mins, 10));
    }
  });

  renderTomatoes();
  updateDisplay();
})();
