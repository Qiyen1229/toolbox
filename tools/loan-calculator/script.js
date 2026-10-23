// 貸款計算器邏輯

(function() {
  const loanAmountInput = document.getElementById('loan-amount');
  const loanYearsInput = document.getElementById('loan-years');
  const loanRateInput = document.getElementById('loan-rate');
  const repayMethodSelect = document.getElementById('repay-method');
  const gracePeriodSelect = document.getElementById('grace-period');

  const monthlyPaymentEl = document.getElementById('monthly-payment');
  const totalInterestEl = document.getElementById('total-interest');
  const summaryPrincipalEl = document.getElementById('summary-principal');
  const summaryTotalRepaidEl = document.getElementById('summary-total-repaid');
  const summaryMonthsEl = document.getElementById('summary-months');

  function calculate() {
    const pWan = parseFloat(loanAmountInput.value) || 0;
    const p = pWan * 10000;
    const years = parseInt(loanYearsInput.value, 10) || 1;
    const annualRate = (parseFloat(loanRateInput.value) || 0) / 100;
    const method = repayMethodSelect.value;
    const graceYears = parseInt(gracePeriodSelect.value, 10) || 0;

    const totalMonths = years * 12;
    const graceMonths = Math.min(totalMonths - 1, graceYears * 12);
    const repayMonths = totalMonths - graceMonths;
    const r = annualRate / 12;

    summaryPrincipalEl.textContent = `NT$ ${Math.round(p).toLocaleString()}`;
    summaryMonthsEl.textContent = `${totalMonths} 期 (${years} 年${graceYears > 0 ? '，含寬限期 ' + graceYears + ' 年' : ''})`;

    if (p <= 0 || totalMonths <= 0) {
      monthlyPaymentEl.textContent = 'NT$ 0';
      totalInterestEl.textContent = 'NT$ 0';
      summaryTotalRepaidEl.textContent = 'NT$ 0';
      return;
    }

    let graceMonthlyInterest = Math.round(p * r);
    let totalInterest = 0;
    let totalRepaid = 0;

    if (method === 'annuity') {
      // 本息均攤
      let postGracePayment = 0;
      if (r > 0 && repayMonths > 0) {
        postGracePayment = Math.round(p * (r * Math.pow(1 + r, repayMonths)) / (Math.pow(1 + r, repayMonths) - 1));
      } else if (repayMonths > 0) {
        postGracePayment = Math.round(p / repayMonths);
      }

      totalRepaid = (graceMonthlyInterest * graceMonths) + (postGracePayment * repayMonths);
      totalInterest = Math.max(0, totalRepaid - p);

      if (graceMonths > 0) {
        monthlyPaymentEl.textContent = `NT$ ${graceMonthlyInterest.toLocaleString()} (寬限期) / ${postGracePayment.toLocaleString()}`;
      } else {
        monthlyPaymentEl.textContent = `NT$ ${postGracePayment.toLocaleString()}`;
      }
    } else {
      // 本金均攤
      const monthlyPrincipal = p / repayMonths;
      const firstMonthRepay = Math.round(monthlyPrincipal + (p * r));
      const lastMonthRepay = Math.round(monthlyPrincipal + (monthlyPrincipal * r));

      let repayInterestSum = 0;
      for (let i = 0; i < repayMonths; i++) {
        let remainingP = p - (monthlyPrincipal * i);
        repayInterestSum += (remainingP * r);
      }
      totalInterest = Math.round((graceMonthlyInterest * graceMonths) + repayInterestSum);
      totalRepaid = Math.round(p + totalInterest);

      if (graceMonths > 0) {
        monthlyPaymentEl.textContent = `NT$ ${graceMonthlyInterest.toLocaleString()} (寬限期) / 首期 ${firstMonthRepay.toLocaleString()} (逐月遞減)`;
      } else {
        monthlyPaymentEl.textContent = `首期 NT$ ${firstMonthRepay.toLocaleString()} (逐月遞減至 ${lastMonthRepay.toLocaleString()})`;
      }
    }

    totalInterestEl.textContent = `NT$ ${Math.round(totalInterest).toLocaleString()}`;
    summaryTotalRepaidEl.textContent = `NT$ ${Math.round(totalRepaid).toLocaleString()}`;
  }

  [loanAmountInput, loanYearsInput, loanRateInput, repayMethodSelect, gracePeriodSelect].forEach(el => {
    el.addEventListener('input', calculate);
    el.addEventListener('change', calculate);
  });

  calculate();
})();
