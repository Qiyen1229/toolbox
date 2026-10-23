// 複利計算器邏輯

(function() {
  const initCapitalInput = document.getElementById('init-capital');
  const monthlyDepositInput = document.getElementById('monthly-deposit');
  const investYearsInput = document.getElementById('invest-years');
  const annualReturnInput = document.getElementById('annual-return');

  const finalBalanceEl = document.getElementById('final-balance');
  const totalProfitEl = document.getElementById('total-profit');
  const totalPrincipalEl = document.getElementById('total-principal');
  const totalMonthsEl = document.getElementById('total-months');
  const barPrincipal = document.getElementById('bar-principal');
  const barProfit = document.getElementById('bar-profit');
  const barPrincipalPct = document.getElementById('bar-principal-pct');
  const barProfitPct = document.getElementById('bar-profit-pct');

  function calculate() {
    const initCap = parseFloat(initCapitalInput.value) || 0;
    const monthlyDep = parseFloat(monthlyDepositInput.value) || 0;
    const years = parseInt(investYearsInput.value, 10) || 1;
    const annualRate = (parseFloat(annualReturnInput.value) || 0) / 100;

    const totalMonths = years * 12;
    const monthlyRate = annualRate / 12;

    const totalPrincipal = initCap + (monthlyDep * totalMonths);

    let finalBal = initCap;
    if (monthlyRate > 0) {
      // 初始本金複利
      finalBal = initCap * Math.pow(1 + monthlyRate, totalMonths);
      // 定期定額年金終值
      const annuityFV = monthlyDep * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
      finalBal += annuityFV;
    } else {
      finalBal = totalPrincipal;
    }

    const profit = Math.max(0, finalBal - totalPrincipal);
    const profitPct = totalPrincipal > 0 ? ((profit / totalPrincipal) * 100).toFixed(1) : 0;

    finalBalanceEl.textContent = `NT$ ${Math.round(finalBal).toLocaleString()}`;
    totalProfitEl.textContent = `NT$ ${Math.round(profit).toLocaleString()} (+${profitPct}%)`;
    totalPrincipalEl.textContent = `NT$ ${Math.round(totalPrincipal).toLocaleString()}`;
    totalMonthsEl.textContent = `${totalMonths} 個月 (${years} 年)`;

    const pPct = finalBal > 0 ? Math.round((totalPrincipal / finalBal) * 100) : 100;
    const prPct = 100 - pPct;

    barPrincipal.style.width = `${pPct}%`;
    barProfit.style.width = `${prPct}%`;
    barPrincipalPct.textContent = `${pPct}%`;
    barProfitPct.textContent = `${prPct}%`;
  }

  [initCapitalInput, monthlyDepositInput, investYearsInput, annualReturnInput].forEach(el => {
    el.addEventListener('input', calculate);
  });

  calculate();
})();
