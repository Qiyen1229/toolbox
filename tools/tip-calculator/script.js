// 小費計算器邏輯

(function() {
  const billAmountInput = document.getElementById('bill-amount');
  const splitCountInput = document.getElementById('split-count');
  const customTipInput = document.getElementById('custom-tip');
  const tipBtns = document.querySelectorAll('.btn-tip');

  const totalWithTipEl = document.getElementById('total-with-tip');
  const perPersonTotalEl = document.getElementById('per-person-total');
  const totalTipValEl = document.getElementById('total-tip-val');
  const perPersonTipEl = document.getElementById('per-person-tip');

  let currentTipPct = 18;

  function calculate() {
    const bill = parseFloat(billAmountInput.value) || 0;
    const people = Math.max(1, parseInt(splitCountInput.value, 10) || 1);
    const tipPct = parseFloat(customTipInput.value) || 0;

    const totalTip = (bill * tipPct) / 100;
    const totalBill = bill + totalTip;
    const perPersonBill = totalBill / people;
    const perPersonTip = totalTip / people;

    totalWithTipEl.textContent = `$ ${totalBill.toFixed(2)}`;
    perPersonTotalEl.textContent = `$ ${perPersonBill.toFixed(2)}`;
    totalTipValEl.textContent = `$ ${totalTip.toFixed(2)}`;
    perPersonTipEl.textContent = `$ ${perPersonTip.toFixed(2)}`;
  }

  tipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tipBtns.forEach(b => {
        b.classList.remove('btn--primary');
        b.classList.add('btn--secondary');
      });
      btn.classList.add('btn--primary');
      btn.classList.remove('btn--secondary');

      currentTipPct = parseFloat(btn.dataset.pct);
      customTipInput.value = currentTipPct;
      calculate();
    });
  });

  customTipInput.addEventListener('input', () => {
    tipBtns.forEach(b => {
      b.classList.toggle('btn--primary', b.dataset.pct === customTipInput.value);
      b.classList.toggle('btn--secondary', b.dataset.pct !== customTipInput.value);
    });
    calculate();
  });

  billAmountInput.addEventListener('input', calculate);
  splitCountInput.addEventListener('input', calculate);

  calculate();
})();
