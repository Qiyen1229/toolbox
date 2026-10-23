// 年齡與生肖星座計算器邏輯

(function () {
  const birthDateInput = document.getElementById('birth-date');
  const targetDateInput = document.getElementById('target-date');

  const ageExactEl = document.getElementById('age-exact');
  const ageVirtualEl = document.getElementById('age-virtual');
  const nextBirthdayDaysEl = document.getElementById('next-birthday-days');
  const chineseZodiacEl = document.getElementById('chinese-zodiac');
  const westernZodiacEl = document.getElementById('western-zodiac');
  const totalLivedDaysEl = document.getElementById('total-lived-days');

  const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];
  const ZODIAC_EMOJIS = ['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐑', '🐵', '🐔', '🐶', '🐷'];

  const BRANCH_MAP = {
    '子': { animal: '鼠', emoji: '🐭' },
    '丑': { animal: '牛', emoji: '🐮' },
    '寅': { animal: '虎', emoji: '🐯' },
    '卯': { animal: '兔', emoji: '🐰' },
    '辰': { animal: '龍', emoji: '🐲' },
    '巳': { animal: '蛇', emoji: '🐍' },
    '午': { animal: '馬', emoji: '🐴' },
    '未': { animal: '羊', emoji: '🐑' },
    '申': { animal: '猴', emoji: '🐵' },
    '酉': { animal: '雞', emoji: '🐔' },
    '戌': { animal: '狗', emoji: '🐶' },
    '亥': { animal: '豬', emoji: '🐷' },
  };

  function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * 根據出生日期精確計算生肖（以農曆正月初一交界換算，並標註干支年）
   * @param {Date} date 出生日期物件
   * @returns {string} 包含 Emoji、生肖動物與農曆干支年份
   */
  function getChineseZodiac(date) {
    try {
      // 優先使用現代瀏覽器標準農曆曆法（zh-TW-u-ca-chinese）
      const formatter = new Intl.DateTimeFormat('zh-TW-u-ca-chinese', { year: 'numeric' });
      const parts = formatter.formatToParts(date);
      const yearNamePart = parts.find((p) => p.type === 'yearName');
      const relatedYearPart = parts.find((p) => p.type === 'relatedYear');

      if (yearNamePart && yearNamePart.value) {
        const ganzhi = yearNamePart.value;
        const branch = ganzhi.slice(-1);
        if (BRANCH_MAP[branch]) {
          return `${BRANCH_MAP[branch].emoji} ${BRANCH_MAP[branch].animal}（${ganzhi}年）`;
        }
      }

      if (relatedYearPart && relatedYearPart.value) {
        const lYear = parseInt(relatedYearPart.value, 10);
        const idx = ((lYear - 4) % 12 + 12) % 12;
        return `${ZODIAC_EMOJIS[idx]} ${ZODIAC_ANIMALS[idx]}`;
      }
    } catch (e) {
      console.warn('[Zodiac] Fallback to Solar Term:', e);
    }

    // 備援方案：依傳統立春（約 2 月 4 日）交界推算
    let year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if (month < 2 || (month === 2 && day < 4)) {
      year -= 1;
    }
    const idx = ((year - 4) % 12 + 12) % 12;
    return `${ZODIAC_EMOJIS[idx]} ${ZODIAC_ANIMALS[idx]}`;
  }

  /**
   * 根據月、日精確換算西洋十二星座
   * @param {number} month 月份 (1~12)
   * @param {number} day 日期 (1~31)
   * @returns {string} 包含星座符號與星座名稱
   */
  function getWesternZodiac(month, day) {
    const md = month * 100 + day;

    if (md >= 120 && md <= 218) {
      return '♒ 水瓶座';
    } else if (md >= 219 && md <= 320) {
      return '♓ 雙魚座';
    } else if (md >= 321 && md <= 419) {
      return '♈ 牡羊座';
    } else if (md >= 420 && md <= 520) {
      return '♉ 金牛座';
    } else if (md >= 521 && md <= 621) {
      return '♊ 雙子座';
    } else if (md >= 622 && md <= 722) {
      return '♋ 巨蟹座';
    } else if (md >= 723 && md <= 822) {
      return '♌ 獅子座';
    } else if (md >= 823 && md <= 922) {
      return '♍ 處女座';
    } else if (md >= 923 && md <= 1023) {
      return '♎ 天秤座';
    } else if (md >= 1024 && md <= 1122) {
      return '♏ 天蠍座';
    } else if (md >= 1123 && md <= 1221) {
      return '♐ 射手座';
    } else {
      // 12 月 22 日 ～ 1 月 19 日（包含跨年 12/22~12/31 與 1/1~1/19）
      return '♑ 摩羯座';
    }
  }

  function calculate() {
    if (!birthDateInput.value) return;

    const bParts = birthDateInput.value.split('-').map(Number);
    const bDate = new Date(bParts[0], bParts[1] - 1, bParts[2], 12, 0, 0);

    const tParts = targetDateInput.value ? targetDateInput.value.split('-').map(Number) : null;
    const tDate = tParts ? new Date(tParts[0], tParts[1] - 1, tParts[2], 12, 0, 0) : new Date();

    if (bDate > tDate) {
      ageExactEl.textContent = '出生日晚於計算日';
      return;
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.floor((tDate - bDate) / msPerDay);
    totalLivedDaysEl.textContent = `${totalDays.toLocaleString()} 天`;

    // 實歲 (年、月、日)
    let y = tDate.getFullYear() - bDate.getFullYear();
    let m = tDate.getMonth() - bDate.getMonth();
    let d = tDate.getDate() - bDate.getDate();

    if (d < 0) {
      m -= 1;
      const prevMonth = new Date(tDate.getFullYear(), tDate.getMonth(), 0);
      d += prevMonth.getDate();
    }
    if (m < 0) {
      y -= 1;
      m += 12;
    }

    ageExactEl.textContent = `${y} 歲 ${m} 個月 ${d} 天`;

    // 虛歲（傳統華人習俗：出生即 1 歲，每過一個農曆新年/元旦長一歲）
    const virtualAge = (tDate.getFullYear() - bDate.getFullYear()) + 1;
    ageVirtualEl.textContent = `${virtualAge} 歲`;

    // 生肖與星座
    chineseZodiacEl.textContent = getChineseZodiac(bDate);
    westernZodiacEl.textContent = getWesternZodiac(bParts[1], bParts[2]);

    // 下次生日倒數
    const thisYearBday = new Date(tDate.getFullYear(), bDate.getMonth(), bDate.getDate());
    let nextBday = thisYearBday;
    if (thisYearBday < tDate) {
      nextBday = new Date(tDate.getFullYear() + 1, bDate.getMonth(), bDate.getDate());
    }

    const diffToBday = Math.ceil((nextBday - tDate) / msPerDay);
    if (diffToBday === 0) {
      nextBirthdayDaysEl.textContent = '🎉 今天就是生日！';
    } else {
      nextBirthdayDaysEl.textContent = `還有 ${diffToBday} 天`;
    }
  }

  targetDateInput.value = formatDate(new Date());

  birthDateInput.addEventListener('change', calculate);
  targetDateInput.addEventListener('change', calculate);

  calculate();
})();
