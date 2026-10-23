/**
 * Cron Expression Generator 實作腳本
 */
document.addEventListener('DOMContentLoaded', () => {
  StorageManager.addRecent('cron-generator');

  const cronInput = document.getElementById('cron-input');
  const cronHuman = document.getElementById('cron-human');
  const nextRuns = document.getElementById('next-runs');
  const btnCopyCron = document.getElementById('btn-copy-cron');
  const presets = document.querySelectorAll('.cron-preset');

  const fMin = document.getElementById('field-minute');
  const fHour = document.getElementById('field-hour');
  const fDay = document.getElementById('field-day');
  const fMonth = document.getElementById('field-month');
  const fWeekday = document.getElementById('field-weekday');

  // 解析白話文
  function describeCron(m, h, d, mon, w) {
    let desc = '';

    // 分鐘
    if (m === '*') desc += '每分鐘';
    else if (m.startsWith('*/')) desc += `每 ${m.replace('*/', '')} 分鐘`;
    else desc += `在第 ${m} 分鐘`;

    // 小時
    if (h === '*') desc += '，每小時';
    else if (h.startsWith('*/')) desc += `，每 ${h.replace('*/', '')} 小時`;
    else desc += `，於 ${h} 點`;

    // 日期
    if (d !== '*') desc += `，每月第 ${d} 號`;

    // 月份
    if (mon !== '*') desc += `，僅限 ${mon} 月`;

    // 星期
    const weekMap = { '0': '週日', '1': '週一', '2': '週二', '3': '週三', '4': '週四', '5': '週五', '6': '週六', '7': '週日', '1-5': '工作日 (週一至週五)', '0,6': '週末 (週六、週日)' };
    if (w !== '*') desc += `，每逢 ${weekMap[w] || '星期 ' + w}`;

    return desc + ' 觸發執行';
  }

  // 計算未來執行時間（簡易模擬）
  function predictNextRuns(m, h) {
    const list = [];
    let now = new Date();
    // 取步長
    let intervalMin = 15;
    if (m.startsWith('*/')) intervalMin = parseInt(m.replace('*/', '')) || 15;
    else if (m === '*') intervalMin = 1;

    for (let i = 1; i <= 5; i++) {
      const d = new Date(now.getTime() + i * intervalMin * 60 * 1000);
      list.push(`🔹 ${d.toLocaleDateString()} ${d.toLocaleTimeString()} (預計觸發)`);
    }
    return list;
  }

  function updateFromFields() {
    const cron = `${fMin.value.trim() || '*'} ${fHour.value.trim() || '*'} ${fDay.value.trim() || '*'} ${fMonth.value.trim() || '*'} ${fWeekday.value.trim() || '*'}`;
    cronInput.value = cron;
    updateFromCronString(cron, false);
  }

  function updateFromCronString(cron, syncFields = true) {
    const parts = cron.trim().split(/\s+/);
    if (parts.length !== 5) {
      cronHuman.innerHTML = '<span style="color: var(--color-error);">⚠️ Cron 表達式格式錯誤（必須為 5 欄空白分隔格式）</span>';
      nextRuns.innerHTML = '';
      return;
    }

    const [m, h, d, mon, w] = parts;
    if (syncFields) {
      fMin.value = m;
      fHour.value = h;
      fDay.value = d;
      fMonth.value = mon;
      fWeekday.value = w;
    }

    cronHuman.innerHTML = `💡 <span style="color: var(--color-accent);">${Utils.escapeHtml(describeCron(m, h, d, mon, w))}</span>`;

    const runs = predictNextRuns(m, h);
    nextRuns.innerHTML = runs.map(r => `<div style="padding: 4px 8px; background: var(--color-surface); border-radius: var(--radius-sm);">${r}</div>`).join('');
  }

  cronInput.addEventListener('input', () => updateFromCronString(cronInput.value, true));

  [fMin, fHour, fDay, fMonth, fWeekday].forEach(input => {
    input.addEventListener('input', updateFromFields);
  });

  presets.forEach(btn => {
    btn.addEventListener('click', () => {
      cronInput.value = btn.dataset.cron;
      updateFromCronString(btn.dataset.cron, true);
      Utils.showToast(`已套用：${btn.textContent}`, 'info');
    });
  });

  btnCopyCron.addEventListener('click', () => {
    Utils.copyToClipboard(cronInput.value, '已複製 Cron 表達式');
  });

  // 初始化
  updateFromCronString(cronInput.value, true);
});
