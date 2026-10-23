/**
 * Timestamp Converter — 工具邏輯
 * 功能：Unix 時間戳與日期時間即時互轉
 */

document.addEventListener('DOMContentLoaded', () => {
  // 記錄使用紀錄
  try { StorageManager?.addRecent?.('timestamp-converter'); } catch (_) {}

  // DOM 元素
  const currentSecEl = document.getElementById('current-timestamp-sec');
  const currentMsEl = document.getElementById('current-timestamp-ms');
  const btnCopyCurrSec = document.getElementById('btn-copy-curr-sec');
  const btnCopyCurrMs = document.getElementById('btn-copy-curr-ms');
  const btnPauseClock = document.getElementById('btn-pause-clock');

  // 時間戳轉日期
  const tsInput = document.getElementById('ts-input');
  const tsUnitSelect = document.getElementById('ts-unit-select');
  const btnConvertTs = document.getElementById('btn-convert-ts');
  const btnTsNow = document.getElementById('btn-ts-now');
  const tsResultBox = document.getElementById('ts-result-box');
  const resLocal = document.getElementById('res-local');
  const resUtc = document.getElementById('res-utc');
  const resIso = document.getElementById('res-iso');
  const resRelative = document.getElementById('res-relative');

  // 日期轉時間戳
  const dateInput = document.getElementById('date-input');
  const btnConvertDate = document.getElementById('btn-convert-date');
  const btnDateNow = document.getElementById('btn-date-now');
  const btnDateToday = document.getElementById('btn-date-today');
  const dateResultBox = document.getElementById('date-result-box');
  const resSec = document.getElementById('res-sec');
  const resMs = document.getElementById('res-ms');

  /* ================================================================
     即時時鐘跑馬
     ================================================================ */
  let isClockRunning = true;
  let clockTimer = null;

  function updateLiveClock() {
    if (!isClockRunning) return;
    const now = Date.now();
    currentSecEl.textContent = Math.floor(now / 1000);
    currentMsEl.textContent = now;
  }

  clockTimer = setInterval(updateLiveClock, 200);
  updateLiveClock();

  btnPauseClock.addEventListener('click', () => {
    isClockRunning = !isClockRunning;
    btnPauseClock.textContent = isClockRunning ? '暫停' : '繼續';
    if (isClockRunning) updateLiveClock();
  });

  btnCopyCurrSec.addEventListener('click', () => {
    Utils.copyToClipboard(currentSecEl.textContent);
  });

  btnCopyCurrMs.addEventListener('click', () => {
    Utils.copyToClipboard(currentMsEl.textContent);
  });

  /* ================================================================
     輔助函式：格式化日期時間
     ================================================================ */

  /**
   * 補零
   * @param {number} n
   * @returns {string}
   */
  function pad2(n) {
    return n.toString().padStart(2, '0');
  }

  /**
   * 格式化為本地時間字串 YYYY-MM-DD HH:mm:ss
   * @param {Date} d
   * @returns {string}
   */
  function formatLocal(d) {
    const y = d.getFullYear();
    const m = pad2(d.getMonth() + 1);
    const day = pad2(d.getDate());
    const h = pad2(d.getHours());
    const min = pad2(d.getMinutes());
    const s = pad2(d.getSeconds());
    const weekDays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const week = weekDays[d.getDay()];
    return `${y}-${m}-${day} ${h}:${min}:${s} (${week})`;
  }

  /**
   * 格式化為 UTC 時間字串 YYYY-MM-DD HH:mm:ss UTC
   * @param {Date} d
   * @returns {string}
   */
  function formatUtc(d) {
    const y = d.getUTCFullYear();
    const m = pad2(d.getUTCMonth() + 1);
    const day = pad2(d.getUTCDate());
    const h = pad2(d.getUTCHours());
    const min = pad2(d.getUTCMinutes());
    const s = pad2(d.getUTCSeconds());
    return `${y}-${m}-${day} ${h}:${min}:${s} UTC`;
  }

  /**
   * 計算相對時間（如「3 分鐘前」、「2 天後」）
   * @param {number} timestampMs
   * @returns {string}
   */
  function formatRelative(timestampMs) {
    const diff = timestampMs - Date.now();
    const isFuture = diff > 0;
    const absSec = Math.floor(Math.abs(diff) / 1000);

    if (absSec < 5) return '剛剛';
    if (absSec < 60) return `${absSec} 秒${isFuture ? '後' : '前'}`;
    const min = Math.floor(absSec / 60);
    if (min < 60) return `${min} 分鐘${isFuture ? '後' : '前'}`;
    const hours = Math.floor(min / 60);
    if (hours < 24) return `${hours} 小時${isFuture ? '後' : '前'}`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} 天${isFuture ? '後' : '前'}`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} 個月${isFuture ? '後' : '前'}`;
    const years = Math.floor(days / 365);
    return `${years} 年${isFuture ? '後' : '前'}`;
  }

  /* ================================================================
     時間戳 ➔ 日期時間
     ================================================================ */

  function convertTimestampToDate() {
    if (!tsInput) return;
    const raw = String(tsInput.value || '').trim();
    if (!raw) {
      if (tsResultBox) tsResultBox.style.display = 'none';
      return;
    }

    let val = Number(raw);
    if (isNaN(val)) {
      Utils.showToast('請輸入合法的數字時間戳', 'error');
      return;
    }

    const unit = tsUnitSelect.value;
    let ms = val;

    if (unit === 'auto') {
      // 10 位數一般為秒，13 位數為毫秒
      if (raw.length <= 10) {
        ms = val * 1000;
      }
    } else if (unit === 'sec') {
      ms = val * 1000;
    }

    const d = new Date(ms);
    if (isNaN(d.getTime())) {
      Utils.showToast('無法解析此時間戳，可能數值過大或無效', 'error');
      return;
    }

    resLocal.textContent = formatLocal(d);
    resUtc.textContent = formatUtc(d);
    resIso.textContent = d.toISOString();
    resRelative.textContent = formatRelative(ms);
    tsResultBox.style.display = 'block';
  }

  btnConvertTs.addEventListener('click', convertTimestampToDate);
  tsInput.addEventListener('input', Utils.debounce(convertTimestampToDate, 120));
  tsUnitSelect.addEventListener('change', convertTimestampToDate);

  btnTsNow.addEventListener('click', () => {
    tsInput.value = Math.floor(Date.now() / 1000);
    tsUnitSelect.value = 'sec';
    convertTimestampToDate();
  });

  /* ================================================================
     日期時間 ➔ 時間戳
     ================================================================ */

  /**
   * 格式化 Date 為 datetime-local 接受的字串 YYYY-MM-DDTHH:mm:ss
   * @param {Date} d
   * @returns {string}
   */
  function toDatetimeLocalString(d) {
    const y = d.getFullYear();
    const m = pad2(d.getMonth() + 1);
    const day = pad2(d.getDate());
    const h = pad2(d.getHours());
    const min = pad2(d.getMinutes());
    const s = pad2(d.getSeconds());
    return `${y}-${m}-${day}T${h}:${min}:${s}`;
  }

  function convertDateToTimestamp() {
    const val = dateInput.value;
    if (!val) {
      dateResultBox.style.display = 'none';
      return;
    }

    const d = new Date(val);
    if (isNaN(d.getTime())) {
      Utils.showToast('日期格式不正確', 'error');
      return;
    }

    const ms = d.getTime();
    const sec = Math.floor(ms / 1000);

    resSec.textContent = sec;
    resMs.textContent = ms;
    dateResultBox.style.display = 'block';
  }

  btnConvertDate.addEventListener('click', convertDateToTimestamp);
  dateInput.addEventListener('input', convertDateToTimestamp);

  btnDateNow.addEventListener('click', () => {
    dateInput.value = toDatetimeLocalString(new Date());
    convertDateToTimestamp();
  });

  btnDateToday.addEventListener('click', () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    dateInput.value = toDatetimeLocalString(now);
    convertDateToTimestamp();
  });

  /* ================================================================
     表格單列複製按鈕委派
     ================================================================ */
  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.btn-copy-row');
    if (!copyBtn) return;
    const targetId = copyBtn.dataset.target;
    const targetEl = document.getElementById(targetId);
    if (targetEl && targetEl.textContent) {
      Utils.copyToClipboard(targetEl.textContent);
    }
  });

  // 預設初始化
  const initialDate = new Date();
  if (dateInput) dateInput.value = toDatetimeLocalString(initialDate);
  if (tsInput) tsInput.value = String(Math.floor(initialDate.getTime() / 1000));
  convertTimestampToDate();
  convertDateToTimestamp();
});
