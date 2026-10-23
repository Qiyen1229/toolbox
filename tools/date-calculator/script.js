// 日期加減計算器邏輯

(function() {
  const baseDateInput = document.getElementById('base-date');
  const calcOpSelect = document.getElementById('calc-op');
  const offsetNumInput = document.getElementById('offset-num');
  const offsetUnitSelect = document.getElementById('offset-unit');
  const btnSetToday = document.getElementById('btn-set-today');
  const quickOffsetBtns = document.querySelectorAll('.btn-quick-offset');

  const targetDateDisplay = document.getElementById('target-date-display');
  const targetDayOfWeek = document.getElementById('target-dayofweek');
  const targetIso = document.getElementById('target-iso');
  const targetWeekNum = document.getElementById('target-weeknum');
  const btnCopyDate = document.getElementById('btn-copy-date');

  const WEEKDAY_NAMES = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getWeekNumber(d) {
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
  }

  function calculate() {
    if (!baseDateInput.value) return;

    const base = new Date(baseDateInput.value + 'T00:00:00');
    const op = calcOpSelect.value;
    const num = parseInt(offsetNumInput.value, 10) || 0;
    const unit = offsetUnitSelect.value;

    const sign = op === 'add' ? 1 : -1;
    const target = new Date(base.getTime());

    if (unit === 'days') {
      target.setDate(target.getDate() + (num * sign));
    } else if (unit === 'weeks') {
      target.setDate(target.getDate() + (num * 7 * sign));
    } else if (unit === 'months') {
      target.setMonth(target.getMonth() + (num * sign));
    } else if (unit === 'years') {
      target.setFullYear(target.getFullYear() + (num * sign));
    }

    const y = target.getFullYear();
    const m = target.getMonth() + 1;
    const day = target.getDate();
    const iso = formatDate(target);

    targetDateDisplay.textContent = `${y} 年 ${m} 月 ${day} 日`;
    targetDayOfWeek.textContent = WEEKDAY_NAMES[target.getDay()];
    targetIso.textContent = iso;
    targetWeekNum.textContent = `第 ${getWeekNumber(target)} 週`;
  }

  // 預設今天
  const today = new Date();
  baseDateInput.value = formatDate(today);

  btnSetToday.addEventListener('click', () => {
    baseDateInput.value = formatDate(new Date());
    calculate();
  });

  quickOffsetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      calcOpSelect.value = btn.dataset.op;
      offsetNumInput.value = btn.dataset.num;
      offsetUnitSelect.value = btn.dataset.unit;
      calculate();
    });
  });

  [baseDateInput, calcOpSelect, offsetNumInput, offsetUnitSelect].forEach(el => {
    el.addEventListener('input', calculate);
    el.addEventListener('change', calculate);
  });

  btnCopyDate.addEventListener('click', () => {
    const iso = targetIso.textContent;
    if (window.ToolboxApp && window.ToolboxApp.copyToClipboard) {
      window.ToolboxApp.copyToClipboard(iso, '日期已複製：' + iso);
    } else {
      navigator.clipboard.writeText(iso);
    }
  });

  calculate();
})();
