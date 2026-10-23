/**
 * Countdown Timer — 工具邏輯
 * 功能：具備 SVG 圓形進度環與 Web Audio API 合成提醒鈴聲的倒數計時器
 */

document.addEventListener('DOMContentLoaded', () => {
  // 記錄使用紀錄
  try { StorageManager?.addRecent?.('countdown-timer'); } catch (_) {}

  // DOM 元素
  const timerDisplay = document.getElementById('timer-display');
  const timerStatus = document.getElementById('timer-status');
  const progressRing = document.getElementById('progress-ring');
  const inputHours = document.getElementById('input-hours');
  const inputMinutes = document.getElementById('input-minutes');
  const inputSeconds = document.getElementById('input-seconds');
  const btnStart = document.getElementById('btn-start');
  const btnAddMinute = document.getElementById('btn-add-minute');
  const btnReset = document.getElementById('btn-reset');
  const presetButtons = document.querySelectorAll('.btn-preset');

  // 圓環周長: 2 * PI * 44 ≈ 276.46
  const CIRCLE_CIRCUMFERENCE = 276.46;

  /** 狀態變數 */
  let totalTime = 300; // 預設 5 分鐘 (300 秒)
  let remainingTime = 300;
  let isRunning = false;
  let timerId = null;
  let endTime = 0;

  /* ================================================================
     Web Audio API 合成提示音
     ================================================================ */

  function playAlertChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // 播放清脆的兩段和弦提示 (C5 -> G5)
      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      playTone(523.25, 0, 0.4);   // C5
      playTone(659.25, 0.15, 0.4); // E5
      playTone(783.99, 0.3, 0.6);  // G5
      playTone(1046.5, 0.5, 0.8);  // C6
    } catch (e) {
      console.log('Audio playback not allowed or supported', e);
    }
  }

  /* ================================================================
     計時格式化與顯示更新
     ================================================================ */

  function formatTime(totalSec) {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad = (n) => n.toString().padStart(2, '0');

    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  }

  function updateDisplay() {
    timerDisplay.textContent = formatTime(remainingTime);

    // 更新進度圓環
    const progress = totalTime > 0 ? (remainingTime / totalTime) : 0;
    const offset = CIRCLE_CIRCUMFERENCE * (1 - progress);
    progressRing.style.strokeDashoffset = offset.toString();

    // 依進度改變顏色
    if (progress < 0.1) {
      progressRing.style.stroke = 'var(--color-error)';
    } else if (progress < 0.25) {
      progressRing.style.stroke = 'var(--color-warning)';
    } else {
      progressRing.style.stroke = 'var(--color-accent)';
    }
  }

  /* ================================================================
     計時器控制邏輯
     ================================================================ */

  function getTimeFromInputs() {
    const h = parseInt(inputHours.value, 10) || 0;
    const m = parseInt(inputMinutes.value, 10) || 0;
    const s = parseInt(inputSeconds.value, 10) || 0;
    return Math.max(0, h * 3600 + m * 60 + s);
  }

  function setInputsFromTime(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    inputHours.value = h;
    inputMinutes.value = m;
    inputSeconds.value = s;
  }

  function start() {
    if (remainingTime <= 0) {
      const fromInput = getTimeFromInputs();
      if (fromInput <= 0) {
        Utils.showToast('請先設定倒數時間', 'warning');
        return;
      }
      totalTime = fromInput;
      remainingTime = fromInput;
    }

    isRunning = true;
    endTime = Date.now() + remainingTime * 1000;
    timerStatus.textContent = '倒數計時中…';
    btnStart.textContent = '暫停';
    btnStart.className = 'btn btn--lg btn--secondary';

    timerId = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.round((endTime - now) / 1000));
      remainingTime = diff;
      updateDisplay();

      if (remainingTime <= 0) {
        finish();
      }
    }, 250);
  }

  function pause() {
    if (!isRunning) return;
    isRunning = false;
    clearInterval(timerId);
    timerStatus.textContent = '已暫停';
    btnStart.textContent = '繼續';
    btnStart.className = 'btn btn--lg btn--primary';
  }

  function finish() {
    clearInterval(timerId);
    isRunning = false;
    remainingTime = 0;
    updateDisplay();
    timerStatus.textContent = '🔔 時間到！';
    btnStart.textContent = '重新開始';
    btnStart.className = 'btn btn--lg btn--primary';

    playAlertChime();
    Utils.showToast('⏰ 倒數計時結束！', 'success');
  }

  function reset() {
    pause();
    const fromInput = getTimeFromInputs();
    totalTime = fromInput > 0 ? fromInput : 300;
    remainingTime = totalTime;
    updateDisplay();
    timerStatus.textContent = '準備就緒';
    btnStart.textContent = '開始倒數';
    btnStart.className = 'btn btn--lg btn--primary';
  }

  /* ================================================================
     事件綁定
     ================================================================ */

  btnStart.addEventListener('click', () => {
    if (isRunning) pause();
    else start();
  });

  btnReset.addEventListener('click', reset);

  btnAddMinute.addEventListener('click', () => {
    remainingTime += 60;
    totalTime += 60;
    if (isRunning) {
      endTime += 60 * 1000;
    }
    updateDisplay();
    Utils.showToast('已增加 1 分鐘', 'info');
  });

  // 輸入框變更
  [inputHours, inputMinutes, inputSeconds].forEach((inp) => {
    inp.addEventListener('input', () => {
      if (!isRunning) {
        const sec = getTimeFromInputs();
        totalTime = sec;
        remainingTime = sec;
        updateDisplay();
      }
    });
  });

  // 快捷時間預設
  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      pause();
      const sec = parseInt(btn.dataset.seconds, 10);
      setInputsFromTime(sec);
      totalTime = sec;
      remainingTime = sec;
      updateDisplay();
      timerStatus.textContent = '準備就緒';
      btnStart.textContent = '開始倒數';
      btnStart.className = 'btn btn--lg btn--primary';
    });
  });

  // 初始化
  updateDisplay();
});
