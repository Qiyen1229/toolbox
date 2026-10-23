// 薪水計算器邏輯

(function() {
  const baseWageInput = document.getElementById('base-wage');
  const baseHoursInput = document.getElementById('base-hours');
  const ot1HoursInput = document.getElementById('ot1-hours');
  const ot1RateInput = document.getElementById('ot1-rate');
  const ot2HoursInput = document.getElementById('ot2-hours');
  const ot2RateInput = document.getElementById('ot2-rate');
  const ot3HoursInput = document.getElementById('ot3-hours');
  const ot3RateInput = document.getElementById('ot3-rate');
  const bonusInput = document.getElementById('bonus-amount');
  const deductInput = document.getElementById('deduct-amount');

  const netSalaryEl = document.getElementById('net-salary');
  const summaryBaseEl = document.getElementById('summary-base');
  const summaryOtEl = document.getElementById('summary-ot');
  const summaryHoursEl = document.getElementById('summary-hours');
  const summaryGrossEl = document.getElementById('summary-gross');
  const btnCopySummary = document.getElementById('btn-copy-summary');

  function calculate() {
    const baseWage = parseFloat(baseWageInput.value) || 0;
    const baseHours = parseFloat(baseHoursInput.value) || 0;

    const ot1Hours = parseFloat(ot1HoursInput.value) || 0;
    const ot1Rate = parseFloat(ot1RateInput.value) || 1;

    const ot2Hours = parseFloat(ot2HoursInput.value) || 0;
    const ot2Rate = parseFloat(ot2RateInput.value) || 1;

    const ot3Hours = parseFloat(ot3HoursInput.value) || 0;
    const ot3Rate = parseFloat(ot3RateInput.value) || 1;

    const bonus = parseFloat(bonusInput.value) || 0;
    const deduct = parseFloat(deductInput.value) || 0;

    const basePay = Math.round(baseWage * baseHours);
    const ot1Pay = Math.round(baseWage * ot1Rate * ot1Hours);
    const ot2Pay = Math.round(baseWage * ot2Rate * ot2Hours);
    const ot3Pay = Math.round(baseWage * ot3Rate * ot3Hours);
    const totalOtPay = ot1Pay + ot2Pay + ot3Pay;
    const totalHours = baseHours + ot1Hours + ot2Hours + ot3Hours;

    const grossPay = basePay + totalOtPay + bonus;
    const netPay = Math.max(0, grossPay - deduct);

    netSalaryEl.textContent = `NT$ ${netPay.toLocaleString()}`;
    summaryBaseEl.textContent = `NT$ ${basePay.toLocaleString()}`;
    summaryOtEl.textContent = `NT$ ${totalOtPay.toLocaleString()}`;
    summaryHoursEl.textContent = `${totalHours} 小時`;
    summaryGrossEl.textContent = `NT$ ${grossPay.toLocaleString()}`;
  }

  [baseWageInput, baseHoursInput, ot1HoursInput, ot1RateInput, ot2HoursInput, ot2RateInput, ot3HoursInput, ot3RateInput, bonusInput, deductInput].forEach(el => {
    el.addEventListener('input', calculate);
  });

  btnCopySummary.addEventListener('click', () => {
    const baseWage = parseFloat(baseWageInput.value) || 0;
    const baseHours = parseFloat(baseHoursInput.value) || 0;
    const totalHours = summaryHoursEl.textContent;
    const basePay = summaryBaseEl.textContent;
    const otPay = summaryOtEl.textContent;
    const gross = summaryGrossEl.textContent;
    const net = netSalaryEl.textContent;
    const bonus = parseFloat(bonusInput.value) || 0;
    const deduct = parseFloat(deductInput.value) || 0;

    const text = `【薪資試算明細】
基本時薪：NT$ ${baseWage}
常規工時：${baseHours} 小時 (工資：${basePay})
總加班工資：${otPay}
其他津貼/獎金：NT$ ${bonus}
各項扣除款：NT$ ${deduct}
──────────────────
總工時：${totalHours}
應發總額：${gross}
實領金額：${net}`;

    if (window.ToolboxApp && window.ToolboxApp.copyToClipboard) {
      window.ToolboxApp.copyToClipboard(text, '薪資明細已複製');
    } else {
      navigator.clipboard.writeText(text);
    }
  });

  calculate();
})();
