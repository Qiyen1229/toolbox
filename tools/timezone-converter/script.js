// 跨國時區轉換器邏輯

(function() {
  const CITIES = [
    { id: 'taipei', name: '台北 (Taipei)', flag: '🇹🇼', tz: 'Asia/Taipei', desc: 'UTC+8 基準' },
    { id: 'tokyo', name: '東京 (Tokyo)', flag: '🇯🇵', tz: 'Asia/Tokyo', desc: 'UTC+9 快 1 小時' },
    { id: 'london', name: '倫敦 (London)', flag: '🇬🇧', tz: 'Europe/London', desc: 'GMT / BST' },
    { id: 'newyork', name: '紐約 (New York)', flag: '🇺🇸', tz: 'America/New_York', desc: 'EDT / EST 美東' },
    { id: 'losangeles', name: '舊金山 / 洛杉磯', flag: '🇺🇸', tz: 'America/Los_Angeles', desc: 'PDT / PST 美西' },
    { id: 'sydney', name: '雪梨 (Sydney)', flag: '🇦🇺', tz: 'Australia/Sydney', desc: 'AEST / AEDT' }
  ];

  const hourSlider = document.getElementById('hour-slider');
  const baseDatetimeLabel = document.getElementById('base-datetime-label');
  const btnNow = document.getElementById('btn-now');
  const cityCardsList = document.getElementById('city-cards-list');

  let currentBaseDate = new Date();

  function render() {
    const selectedHour = parseInt(hourSlider.value, 10);
    const dateObj = new Date(currentBaseDate.getTime());
    dateObj.setHours(selectedHour, 0, 0, 0);

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hourStr = String(selectedHour).padStart(2, '0');
    baseDatetimeLabel.textContent = `${year}-${month}-${day} ${hourStr}:00 (台北時間)`;

    cityCardsList.innerHTML = '';

    CITIES.forEach(c => {
      const dtf = new Intl.DateTimeFormat('zh-TW', {
        timeZone: c.tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        weekday: 'short'
      });

      const parts = dtf.formatToParts(dateObj);
      let pMap = {};
      parts.forEach(p => pMap[p.type] = p.value);

      const localHour = parseInt(pMap.hour, 10);
      let statusBadge = '';
      let bgStyle = 'background: var(--color-surface);';

      if (localHour >= 9 && localHour < 18) {
        statusBadge = '<span style="background: rgba(16, 185, 129, 0.15); color: var(--color-success); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">💼 上班中</span>';
      } else if (localHour >= 23 || localHour < 7) {
        statusBadge = '<span style="background: rgba(148, 163, 184, 0.15); color: var(--color-text-secondary); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">🌙 睡眠休息</span>';
      } else {
        statusBadge = '<span style="background: rgba(245, 158, 11, 0.15); color: var(--color-warning); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">☕ 非工作時段</span>';
      }

      const card = document.createElement('div');
      card.style.cssText = `${bgStyle} border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;`;

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.5rem;">${c.flag}</span>
          <div>
            <div style="font-weight: 700; font-size: 1rem;">${c.name}</div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">${c.desc}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          ${statusBadge}
          <div style="text-align: right;">
            <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-text-primary);">
              ${pMap.hour}:${pMap.minute}
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">
              ${pMap.month}/${pMap.day} (${pMap.weekday})
            </div>
          </div>
        </div>
      `;

      cityCardsList.appendChild(card);
    });
  }

  function setNow() {
    currentBaseDate = new Date();
    hourSlider.value = currentBaseDate.getHours();
    render();
  }

  hourSlider.addEventListener('input', render);
  btnNow.addEventListener('click', setNow);

  setNow();
})();
