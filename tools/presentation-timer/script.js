// 演講與報告計時器邏輯

(function() {
  const targetMinutesInput = document.getElementById('target-minutes');
  const minPresets = document.querySelectorAll('.btn-min-preset');
  const timerBoard = document.getElementById('timer-board');
  const statusTag = document.getElementById('status-tag');
  const bigTimerDisplay = document.getElementById('big-timer-display');
  const btnToggle = document.getElementById('btn-timer-toggle');
  const btnReset = document.getElementById('btn-timer-reset');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  let totalSeconds = 10 * 60;
  let remainingSeconds = totalSeconds;
  let isRunning = false;
  let timerId = null;
  let warned2Min = false;
  let warnedTimesUp = false;

  function playBeep(freq = 660, count = 1) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      for (let i = 0; i < count; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        const start = ctx.currentTime + (i * 0.25);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.2, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.2);
      }
    } catch (e) {}
  }

  function updateDisplay() {
    const isOvertime = remainingSeconds < 0;
    const absSecs = Math.abs(remainingSeconds);
    const m = Math.floor(absSecs / 60);
    const s = absSecs % 60;
    const timeStr = `${isOvertime ? '-' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    bigTimerDisplay.textContent = timeStr;

    if (!isRunning && remainingSeconds === totalSeconds) {
      statusTag.textContent = '準備開始';
      statusTag.style.color = 'var(--color-success)';
      statusTag.style.background = 'rgba(16, 185, 129, 0.1)';
      bigTimerDisplay.style.color = 'var(--color-text-primary)';
      timerBoard.style.borderColor = 'var(--color-border)';
      return;
    }

    if (isOvertime) {
      statusTag.textContent = '⚠️ 已超時！請儘速結尾';
      statusTag.style.color = 'var(--color-danger)';
      statusTag.style.background = 'rgba(239, 68, 68, 0.15)';
      bigTimerDisplay.style.color = 'var(--color-danger)';
      timerBoard.style.borderColor = 'var(--color-danger)';
    } else if (remainingSeconds <= 30) {
      statusTag.textContent = '⏳ 倒數最後 30 秒';
      statusTag.style.color = '#f97316';
      statusTag.style.background = 'rgba(249, 115, 22, 0.15)';
      bigTimerDisplay.style.color = '#f97316';
      timerBoard.style.borderColor = '#f97316';
    } else if (remainingSeconds <= 120) {
      statusTag.textContent = '⚠️ 剩餘 2 分鐘（建議開始總結）';
      statusTag.style.color = 'var(--color-warning)';
      statusTag.style.background = 'rgba(245, 158, 11, 0.15)';
      bigTimerDisplay.style.color = 'var(--color-warning)';
      timerBoard.style.borderColor = 'var(--color-warning)';
    } else {
      statusTag.textContent = '進行中';
      statusTag.style.color = 'var(--color-success)';
      statusTag.style.background = 'rgba(16, 185, 129, 0.1)';
      bigTimerDisplay.style.color = 'var(--color-text-primary)';
      timerBoard.style.borderColor = 'var(--color-border)';
    }
  }

  function tick() {
    remainingSeconds--;

    if (remainingSeconds === 120 && !warned2Min) {
      warned2Min = true;
      playBeep(587.33, 1); // 2 分鐘一聲叮
    }

    if (remainingSeconds === 0 && !warnedTimesUp) {
      warnedTimesUp = true;
      playBeep(880, 3); // 時間到三聲急促鈴聲
    }

    updateDisplay();
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    btnToggle.textContent = '暫停';
    btnToggle.classList.remove('btn--primary');
    btnToggle.classList.add('btn--secondary');
    timerId = setInterval(tick, 1000);
    updateDisplay();
  }

  function pause() {
    if (!isRunning) return;
    isRunning = false;
    btnToggle.textContent = '繼續計時';
    btnToggle.classList.remove('btn--secondary');
    btnToggle.classList.add('btn--primary');
    clearInterval(timerId);
    timerId = null;
    updateDisplay();
  }

  function reset() {
    pause();
    const mins = parseInt(targetMinutesInput.value, 10) || 10;
    totalSeconds = mins * 60;
    remainingSeconds = totalSeconds;
    warned2Min = false;
    warnedTimesUp = false;
    btnToggle.textContent = '開始計時';
    updateDisplay();
  }

  btnToggle.addEventListener('click', () => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  });

  btnReset.addEventListener('click', reset);

  targetMinutesInput.addEventListener('change', reset);

  minPresets.forEach(btn => {
    btn.addEventListener('click', () => {
      targetMinutesInput.value = btn.dataset.m;
      reset();
    });
  });

  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      timerBoard.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  reset();
})();
