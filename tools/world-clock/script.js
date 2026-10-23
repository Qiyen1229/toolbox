// 世界時鐘邏輯

(function() {
  const CITIES = [
    { name: '台北 (Taipei)', country: '台灣', flag: '🇹🇼', tz: 'Asia/Taipei' },
    { name: '東京 (Tokyo)', country: '日本', flag: '🇯🇵', tz: 'Asia/Tokyo' },
    { name: '首爾 (Seoul)', country: '韓國', flag: '🇰🇷', tz: 'Asia/Seoul' },
    { name: '香港 (Hong Kong)', country: '香港', flag: '🇭🇰', tz: 'Asia/Hong_Kong' },
    { name: '新加坡 (Singapore)', country: '新加坡', flag: '🇸🇬', tz: 'Asia/Singapore' },
    { name: '曼谷 (Bangkok)', country: '泰國', flag: '🇹🇭', tz: 'Asia/Bangkok' },
    { name: '杜拜 (Dubai)', country: '阿聯酋', flag: '🇦🇪', tz: 'Asia/Dubai' },
    { name: '倫敦 (London)', country: '英國', flag: '🇬🇧', tz: 'Europe/London' },
    { name: '巴黎 (Paris)', country: '法國', flag: '🇫🇷', tz: 'Europe/Paris' },
    { name: '紐約 (New York)', country: '美國', flag: '🇺🇸', tz: 'America/New_York' },
    { name: '舊金山 (San Francisco)', country: '美國', flag: '🇺🇸', tz: 'America/Los_Angeles' },
    { name: '雪梨 (Sydney)', country: '澳洲', flag: '🇦🇺', tz: 'Australia/Sydney' }
  ];

  let is24Hour = true;
  let filterText = '';

  const clocksGrid = document.getElementById('clocks-grid');
  const searchCity = document.getElementById('search-city');
  const formatToggle = document.getElementById('format-toggle');

  function updateClocks() {
    const now = new Date();
    const query = filterText.toLowerCase().trim();

    const filtered = CITIES.filter(c => {
      return !query || c.name.toLowerCase().includes(query) || c.country.toLowerCase().includes(query);
    });

    clocksGrid.innerHTML = '';

    filtered.forEach(c => {
      const dtf = new Intl.DateTimeFormat('zh-TW', {
        timeZone: c.tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: !is24Hour,
        weekday: 'short'
      });

      const parts = dtf.formatToParts(now);
      let pMap = {};
      parts.forEach(p => pMap[p.type] = p.value);

      // 取 24 小時制的數字判斷晝夜
      const rawHour = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: c.tz, hour: 'numeric', hour12: false }).format(now), 10);
      const isDay = rawHour >= 6 && rawHour < 18;
      const dayNightIcon = isDay ? '☀️' : '🌙';

      const card = document.createElement('div');
      card.style.cssText = 'background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); display: flex; flex-direction: column; justify-content: space-between; gap: 12px; transition: transform 0.2s ease;';

      let timeDisplay = '';
      if (is24Hour) {
        timeDisplay = `${pMap.hour}:${pMap.minute}:${pMap.second}`;
      } else {
        timeDisplay = `${pMap.dayPeriod || ''} ${pMap.hour}:${pMap.minute}:${pMap.second}`;
      }

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 1.25rem;">${c.flag}</span>
              <span style="font-weight: 700; font-size: 1rem;">${c.name}</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">
              ${c.country}
            </div>
          </div>
          <span style="font-size: 1.25rem;" title="${isDay ? '白天' : '夜晚'}">${dayNightIcon}</span>
        </div>

        <div>
          <div style="font-size: 1.85rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-accent); line-height: 1.1;">
            ${timeDisplay}
          </div>
          <div style="font-size: 0.8125rem; color: var(--color-text-secondary); margin-top: 6px;">
            ${pMap.year}/${pMap.month}/${pMap.day} (${pMap.weekday})
          </div>
        </div>
      `;

      clocksGrid.appendChild(card);
    });
  }

  formatToggle.addEventListener('click', (e) => {
    const btn = e.target.closest('.time-format-btn');
    if (btn && btn.dataset.fmt) {
      is24Hour = btn.dataset.fmt === '24';
      formatToggle.querySelectorAll('.time-format-btn').forEach(b => {
        b.classList.toggle('active', b === btn);
      });
      updateClocks();
    }
  });

  searchCity.addEventListener('input', (e) => {
    filterText = e.target.value;
    updateClocks();
  });

  updateClocks();
  setInterval(updateClocks, 1000);
})();
