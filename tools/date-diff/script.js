// 兩日期差計算器邏輯

(function() {
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const includeEndDayCheckbox = document.getElementById('include-end-day');

  const diffDaysLargeEl = document.getElementById('diff-days-large');
  const diffYmdEl = document.getElementById('diff-ymd');
  const diffWeeksEl = document.getElementById('diff-weeks');
  const diffWorkdaysEl = document.getElementById('diff-workdays');

  function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function calculate() {
    if (!startDateInput.value || !endDateInput.value) {
      diffDaysLargeEl.textContent = '- 天';
      return;
    }

    const d1 = new Date(startDateInput.value + 'T00:00:00');
    const d2 = new Date(endDateInput.value + 'T00:00:00');

    let isReversed = d1 > d2;
    let start = isReversed ? d2 : d1;
    let end = isReversed ? d1 : d2;

    const msPerDay = 1000 * 60 * 60 * 24;
    let diffDays = Math.round((end - start) / msPerDay);
    if (includeEndDayCheckbox.checked) {
      diffDays += 1;
    }

    diffDaysLargeEl.textContent = `${diffDays.toLocaleString()} 天${isReversed ? ' (倒算)' : ''}`;

    // 週數
    const weeks = Math.floor(diffDays / 7);
    const remDays = diffDays % 7;
    diffWeeksEl.textContent = `${weeks} 週 ${remDays} 天`;

    // 年月日換算
    let y = end.getFullYear() - start.getFullYear();
    let m = end.getMonth() - start.getMonth();
    let d = end.getDate() - start.getDate();

    if (d < 0) {
      m -= 1;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      d += prevMonth.getDate();
    }
    if (m < 0) {
      y -= 1;
      m += 12;
    }

    let ymdStr = '';
    if (y > 0) ymdStr += `${y} 年 `;
    if (m > 0 || y > 0) ymdStr += `${m} 個月 `;
    ymdStr += `${d} 天`;
    diffYmdEl.textContent = ymdStr || '0 天';

    // 工作天（排除週六日）
    let workdays = 0;
    let cur = new Date(start);
    let countLimit = includeEndDayCheckbox.checked ? end : new Date(end.getTime() - msPerDay);

    while (cur <= countLimit) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workdays++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    diffWorkdaysEl.textContent = `${workdays.toLocaleString()} 工作天`;
  }

  // 預設日期：今天與 30 天後
  const today = new Date();
  startDateInput.value = formatDate(today);
  const nextMonth = new Date(today);
  nextMonth.setDate(nextMonth.getDate() + 30);
  endDateInput.value = formatDate(nextMonth);

  startDateInput.addEventListener('change', calculate);
  endDateInput.addEventListener('change', calculate);
  includeEndDayCheckbox.addEventListener('change', calculate);

  // 快捷按鈕
  document.querySelectorAll('.btn-start-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = new Date();
      if (btn.dataset.type === 'today') {
        startDateInput.value = formatDate(t);
      } else if (btn.dataset.type === 'year-start') {
        startDateInput.value = `${t.getFullYear()}-01-01`;
      }
      calculate();
    });
  });

  document.querySelectorAll('.btn-end-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = new Date();
      if (btn.dataset.type === 'today') {
        endDateInput.value = formatDate(t);
      } else if (btn.dataset.type === 'year-end') {
        endDateInput.value = `${t.getFullYear()}-12-31`;
      } else if (btn.dataset.type === 'plus-100') {
        const s = startDateInput.value ? new Date(startDateInput.value + 'T00:00:00') : new Date();
        s.setDate(s.getDate() + 100);
        endDateInput.value = formatDate(s);
      }
      calculate();
    });
  });

  calculate();
})();
