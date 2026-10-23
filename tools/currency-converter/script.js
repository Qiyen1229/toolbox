// 匯率換算器邏輯

(function() {
  // 以 USD 為基準之基準匯率
  let rates = {
    USD: 1.0,
    TWD: 32.25,
    JPY: 153.4,
    EUR: 0.925,
    GBP: 0.788,
    CNY: 7.24,
    KRW: 1385.0,
    HKD: 7.82,
    SGD: 1.345,
    AUD: 1.535,
    CAD: 1.382,
    THB: 36.45,
    VND: 25420.0,
    MYR: 4.45,
    PHP: 58.60,
    IDR: 16250.0,
    CHF: 0.885,
    NZD: 1.715,
    MOP: 8.05,
    SEK: 10.82
  };

  const CURRENCY_NAMES = {
    TWD: { flag: '🇹🇼', name: '新台幣' },
    USD: { flag: '🇺🇸', name: '美元' },
    JPY: { flag: '🇯🇵', name: '日圓' },
    EUR: { flag: '🇪🇺', name: '歐元' },
    GBP: { flag: '🇬🇧', name: '英鎊' },
    CNY: { flag: '🇨🇳', name: '人民幣' },
    KRW: { flag: '🇰🇷', name: '韓元' },
    HKD: { flag: '🇭🇰', name: '港幣' },
    SGD: { flag: '🇸🇬', name: '新加坡幣' },
    AUD: { flag: '🇦🇺', name: '澳幣' },
    CAD: { flag: '🇨🇦', name: '加拿大幣' },
    THB: { flag: '🇹🇭', name: '泰銖' },
    VND: { flag: '🇻🇳', name: '越南盾' },
    MYR: { flag: '🇲🇾', name: '馬來西亞令吉' },
    PHP: { flag: '🇵🇭', name: '菲律賓披索' },
    IDR: { flag: '🇮🇩', name: '印尼盾' },
    CHF: { flag: '🇨🇭', name: '瑞士法郎' },
    NZD: { flag: '🇳🇿', name: '紐西蘭幣' },
    MOP: { flag: '🇲🇴', name: '澳門幣' },
    SEK: { flag: '🇸🇪', name: '瑞典克朗' }
  };

  const fromCurrSelect = document.getElementById('from-currency');
  const toCurrSelect = document.getElementById('to-currency');
  const fromAmtInput = document.getElementById('from-amount');
  const toAmtInput = document.getElementById('to-amount');
  const btnSwap = document.getElementById('btn-swap');
  const rateDisplay = document.getElementById('rate-display');
  const btnRefreshRate = document.getElementById('btn-refresh-rate');
  const currenciesGrid = document.getElementById('currencies-grid');

  function calculate() {
    const from = fromCurrSelect.value;
    const to = toCurrSelect.value;
    const amt = parseFloat(fromAmtInput.value) || 0;

    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;

    // 先轉 USD 再轉目標幣
    const amtInUSD = amt / fromRate;
    const converted = amtInUSD * toRate;

    const singleFromInTo = (1 / fromRate) * toRate;

    toAmtInput.value = converted < 10 ? converted.toFixed(4) : converted.toFixed(2);
    rateDisplay.textContent = `匯率參考：1 ${from} ≈ ${singleFromInTo < 1 ? singleFromInTo.toFixed(4) : singleFromInTo.toFixed(2)} ${to}`;

    renderOtherCurrencies(amtInUSD, from);
  }

  function renderOtherCurrencies(amtInUSD, currentFrom) {
    currenciesGrid.innerHTML = '';
    for (const [code, info] of Object.entries(CURRENCY_NAMES)) {
      if (code === currentFrom) continue;
      const rate = rates[code] || 1;
      const val = amtInUSD * rate;
      const formattedVal = val < 10 ? val.toFixed(3) : val.toLocaleString(undefined, { maximumFractionDigits: 2 });

      const card = document.createElement('div');
      card.style.cssText = 'background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 10px 12px;';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 2px;">
          <span>${info.flag} ${code}</span>
          <span>${info.name}</span>
        </div>
        <div style="font-weight: 700; font-size: 1.0625rem; color: var(--color-text-primary);">
          ${formattedVal}
        </div>
      `;
      currenciesGrid.appendChild(card);
    }
  }

  btnSwap.addEventListener('click', () => {
    const temp = fromCurrSelect.value;
    fromCurrSelect.value = toCurrSelect.value;
    toCurrSelect.value = temp;
    calculate();
  });

  fromCurrSelect.addEventListener('change', calculate);
  toCurrSelect.addEventListener('change', calculate);
  fromAmtInput.addEventListener('input', calculate);

  async function fetchLiveRates() {
    btnRefreshRate.disabled = true;
    btnRefreshRate.textContent = '更新中...';
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error('API 失敗');
      const data = await res.json();
      if (data && data.rates) {
        for (const code of Object.keys(rates)) {
          if (data.rates[code]) {
            rates[code] = data.rates[code];
          }
        }
        btnRefreshRate.textContent = '已更新至最新匯率 ✓';
        calculate();
      }
    } catch (e) {
      btnRefreshRate.textContent = '更新失敗，使用離線基準';
    } finally {
      setTimeout(() => {
        btnRefreshRate.disabled = false;
        btnRefreshRate.textContent = '更新即時匯率';
      }, 3000);
    }
  }

  btnRefreshRate.addEventListener('click', fetchLiveRates);

  calculate();
})();
