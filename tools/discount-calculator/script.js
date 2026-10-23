// 折扣計算器邏輯

(function() {
  const origPriceInput = document.getElementById('orig-price');
  const discountTypeSelect = document.getElementById('discount-type');
  const discountValInput = document.getElementById('discount-val');
  const discountValLabel = document.getElementById('discount-val-label');
  const extraCouponInput = document.getElementById('extra-coupon');
  const finalPriceEl = document.getElementById('final-price');
  const totalSavedEl = document.getElementById('total-saved');
  const quickTags = document.querySelectorAll('.btn-tag');

  function updateLabel() {
    const type = discountTypeSelect.value;
    if (type === 'tw') {
      discountValLabel.textContent = '台灣折數（例如 8.5 代表 85 折，7 代表 7 折）：';
    } else if (type === 'off') {
      discountValLabel.textContent = '折抵百分比（例如 20 代表 20% OFF）：';
    } else {
      discountValLabel.textContent = '直接減免金額（NT$）：';
    }
  }

  function calculate() {
    const orig = parseFloat(origPriceInput.value) || 0;
    const type = discountTypeSelect.value;
    const val = parseFloat(discountValInput.value) || 0;
    const extra = parseFloat(extraCouponInput.value) || 0;

    let discounted = orig;

    if (type === 'tw') {
      // 8.5 -> 0.85; 8 -> 0.8; 7 -> 0.7; 5 -> 0.5; 如果輸入 85 則自動轉 0.85
      let rate = val;
      if (rate >= 10) {
        rate = rate / 100;
      } else {
        rate = rate / 10;
      }
      discounted = orig * rate;
    } else if (type === 'off') {
      discounted = orig * (1 - (val / 100));
    } else if (type === 'minus') {
      discounted = orig - val;
    }

    let finalPrice = Math.max(0, discounted - extra);
    let totalSaved = Math.max(0, orig - finalPrice);
    let savedPct = orig > 0 ? ((totalSaved / orig) * 100).toFixed(1) : 0;

    finalPriceEl.textContent = `NT$ ${Math.round(finalPrice).toLocaleString()}`;
    totalSavedEl.textContent = `NT$ ${Math.round(totalSaved).toLocaleString()} (-${savedPct}%)`;
  }

  discountTypeSelect.addEventListener('change', () => {
    updateLabel();
    calculate();
  });

  origPriceInput.addEventListener('input', calculate);
  discountValInput.addEventListener('input', calculate);
  extraCouponInput.addEventListener('input', calculate);

  quickTags.forEach(tag => {
    tag.addEventListener('click', () => {
      discountTypeSelect.value = 'tw';
      updateLabel();
      discountValInput.value = tag.dataset.val;
      calculate();
    });
  });

  updateLabel();
  calculate();
})();
