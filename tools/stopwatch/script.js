/**
 * Stopwatch — 工具邏輯
 * 功能：使用 performance.now() 實現極低飄移、高精準度碼表，支援單圈計次與最快/慢圈高亮
 */

document.addEventListener('DOMContentLoaded', () => {
  // 記錄使用紀錄
  try { StorageManager?.addRecent?.('stopwatch'); } catch (_) {}

  // 跨環境高精準計時器
  const getNow = () => (typeof window !== 'undefined' && window.performance && window.performance.now ? window.performance.now() : Date.now());

  // DOM 元素
  const displayTime = document.getElementById('display-time');
  const btnStart = document.getElementById('btn-start');
  const btnLap = document.getElementById('btn-lap');
  const btnReset = document.getElementById('btn-reset');
  const lapSection = document.getElementById('lap-section');
  const lapList = document.getElementById('lap-list');
  const btnCopyLaps = document.getElementById('btn-copy-laps');

  /** 狀態變數 */
  let isRunning = false;
  let startTime = 0;
  let elapsedTime = 0;
  let animFrameId = null;
  let lastLapTime = 0;
  let laps = []; // { id, splitMs, totalMs }

  /* ================================================================
     時間格式化
     ================================================================ */

  /**
   * 將毫秒轉為 HH:MM:SS.ss 格式
   * @param {number} ms
   * @param {boolean} withHtmlTag - 是否將小數點後放入 span 以便樣式化
   * @returns {string}
   */
  function formatTime(ms, withHtmlTag = false) {
    const totalHundredths = Math.floor(ms / 10);
    const hundredths = totalHundredths % 100;
    const totalSec = Math.floor(totalHundredths / 100);
    const sec = totalSec % 60;
    const totalMin = Math.floor(totalSec / 60);
    const min = totalMin % 60;
    const hours = Math.floor(totalMin / 60);

    const pad = (n) => n.toString().padStart(2, '0');
    const timeStr = `${pad(hours)}:${pad(min)}:${pad(sec)}`;
    const fracStr = `.${pad(hundredths)}`;

    if (withHtmlTag) {
      return `${timeStr}<span style="font-size: 0.55em; color: var(--color-accent); margin-left: 4px;">${fracStr}</span>`;
    }
    return `${timeStr}${fracStr}`;
  }

  /* ================================================================
     核心計時迴圈
     ================================================================ */

  function update() {
    if (!isRunning) return;
    const now = getNow();
    const currentElapsed = elapsedTime + (now - startTime);
    displayTime.innerHTML = formatTime(currentElapsed, true);
    animFrameId = requestAnimationFrame(update);
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    startTime = getNow();
    animFrameId = requestAnimationFrame(update);

    btnStart.textContent = '暫停 (Pause)';
    btnStart.className = 'btn btn--lg btn--secondary';
    btnLap.disabled = false;
    btnReset.disabled = false;
  }

  function pause() {
    if (!isRunning) return;
    isRunning = false;
    elapsedTime += getNow() - startTime;
    cancelAnimationFrame(animFrameId);

    btnStart.textContent = '繼續 (Resume)';
    btnStart.className = 'btn btn--lg btn--primary';
    btnLap.disabled = true;
  }

  function reset() {
    pause();
    elapsedTime = 0;
    lastLapTime = 0;
    laps = [];

    displayTime.innerHTML = '00:00:00<span style="font-size: 0.55em; color: var(--color-accent); margin-left: 4px;">.00</span>';
    btnStart.textContent = '開始 (Start)';
    btnStart.className = 'btn btn--lg btn--primary';
    btnLap.disabled = true;
    btnReset.disabled = true;
    lapSection.style.display = 'none';
    lapList.innerHTML = '';
  }

  function recordLap() {
    if (!isRunning) return;
    const currentTotal = elapsedTime + (getNow() - startTime);
    const split = currentTotal - lastLapTime;
    lastLapTime = currentTotal;

    const lapItem = {
      id: laps.length + 1,
      splitMs: split,
      totalMs: currentTotal
    };

    laps.unshift(lapItem); // 最新的排最前
    renderLaps();
  }

  /* ================================================================
     渲染計次列表與最快/最慢圈高亮
     ================================================================ */

  function renderLaps() {
    if (laps.length === 0) {
      lapSection.style.display = 'none';
      return;
    }

    lapSection.style.display = 'block';

    // 找出最快與最慢單圈
    let minSplit = Infinity;
    let maxSplit = -Infinity;
    if (laps.length >= 2) {
      laps.forEach((l) => {
        if (l.splitMs < minSplit) minSplit = l.splitMs;
        if (l.splitMs > maxSplit) maxSplit = l.splitMs;
      });
    }

    lapList.innerHTML = laps
      .map((lap) => {
        let badge = '';
        let rowStyle = 'display: grid; grid-template-columns: 80px 1fr 1fr; padding: 10px 16px; border-bottom: 1px solid var(--color-border); font-family: var(--font-mono, monospace); font-size: 0.875rem; align-items: center;';

        if (laps.length >= 2) {
          if (lap.splitMs === minSplit) {
            badge = `<span style="font-size: 0.75rem; color: var(--color-success); font-weight: 700; margin-left: 8px;">(最快)</span>`;
            rowStyle += ' background: var(--color-success-light);';
          } else if (lap.splitMs === maxSplit) {
            badge = `<span style="font-size: 0.75rem; color: var(--color-error); font-weight: 700; margin-left: 8px;">(最慢)</span>`;
            rowStyle += ' background: var(--color-error-light);';
          }
        }

        return `
          <div style="${rowStyle}">
            <span style="font-weight: 600;">#${lap.id}</span>
            <span>${formatTime(lap.splitMs)}${badge}</span>
            <span style="color: var(--color-text-secondary);">${formatTime(lap.totalMs)}</span>
          </div>
        `;
      })
      .join('');
  }

  /* ================================================================
     事件綁定與鍵盤快速鍵
     ================================================================ */

  btnStart.addEventListener('click', () => {
    if (isRunning) pause();
    else start();
  });

  btnLap.addEventListener('click', recordLap);
  btnReset.addEventListener('click', reset);

  btnCopyLaps.addEventListener('click', () => {
    if (laps.length === 0) return;
    const lines = laps.map((l) => `圈數 #${l.id}: 單圈 ${formatTime(l.splitMs)} | 累計 ${formatTime(l.totalMs)}`);
    Utils.copyToClipboard(lines.join('\n'));
  });

  // 全域鍵盤快速鍵
  window.addEventListener('keydown', (e) => {
    // 若在輸入框內不觸發快捷鍵
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.code === 'Space') {
      e.preventDefault();
      if (isRunning) pause();
      else start();
    } else if (e.key === 'l' || e.key === 'L') {
      if (isRunning) recordLap();
    } else if (e.key === 'r' || e.key === 'R') {
      reset();
    }
  });
});
