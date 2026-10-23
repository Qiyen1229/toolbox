// BMI 計算器邏輯

(function () {
  const heightInput = document.getElementById('height-input');
  const weightInput = document.getElementById('weight-input');
  const bmiValEl = document.getElementById('bmi-val');
  const bmiCategoryEl = document.getElementById('bmi-category');
  const idealWeightRangeEl = document.getElementById('ideal-weight-range');
  const healthAdviceEl = document.getElementById('health-advice');

  function calculate() {
    const heightCm = parseFloat(heightInput.value) || 0;
    const weightKg = parseFloat(weightInput.value) || 0;

    if (heightCm <= 0 || weightKg <= 0) {
      bmiValEl.textContent = '-';
      bmiCategoryEl.textContent = '請輸入身高與體重';
      return;
    }

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const bmiFormatted = bmi.toFixed(1);

    bmiValEl.textContent = bmiFormatted;

    // 理想體重
    const minIdeal = (18.5 * heightM * heightM).toFixed(1);
    const maxIdeal = (24.0 * heightM * heightM).toFixed(1);
    idealWeightRangeEl.textContent = `${minIdeal} ~ ${maxIdeal} kg`;

    if (bmi < 18.5) {
      bmiCategoryEl.textContent = '體重過輕';
      bmiCategoryEl.style.color = '#38bdf8';
      bmiValEl.style.color = '#38bdf8';
      healthAdviceEl.textContent = '體重偏輕，建議適度加強蛋白質與熱量攝取，並搭配阻力運動增肌。';
    } else if (bmi < 24) {
      bmiCategoryEl.textContent = '標準體重';
      bmiCategoryEl.style.color = 'var(--color-success)';
      bmiValEl.style.color = 'var(--color-success)';
      healthAdviceEl.textContent = '太棒了！您的體態維持在非常標準的健康區間，請繼續維持規律作息與運動。';
    } else if (bmi < 27) {
      bmiCategoryEl.textContent = '異常過重';
      bmiCategoryEl.style.color = 'var(--color-warning)';
      bmiValEl.style.color = 'var(--color-warning)';
      healthAdviceEl.textContent = '體重稍重，建議注意飲食熱量攝取，少油少糖並維持每週 150 分鐘中度運動。';
    } else if (bmi < 30) {
      bmiCategoryEl.textContent = '輕度肥胖';
      bmiCategoryEl.style.color = '#f97316';
      bmiValEl.style.color = '#f97316';
      healthAdviceEl.textContent = '已達輕度肥胖，建議開始擬定減重計畫，諮詢營養師或醫師以防代謝症候群。';
    } else if (bmi < 35) {
      bmiCategoryEl.textContent = '中度肥胖';
      bmiCategoryEl.style.color = 'var(--color-danger)';
      bmiValEl.style.color = 'var(--color-danger)';
      healthAdviceEl.textContent = '中度肥胖對心血管負擔較大，建議積極尋求專業醫療與運動指導減重。';
    } else {
      bmiCategoryEl.textContent = '重度肥胖';
      bmiCategoryEl.style.color = 'var(--color-danger)';
      bmiValEl.style.color = 'var(--color-danger)';
      healthAdviceEl.textContent = '重度肥胖可能引發多項慢性病，強烈建議儘速至減重或家醫門診評估健康狀況。';
    }
  }

  heightInput.addEventListener('input', calculate);
  weightInput.addEventListener('input', calculate);

  calculate();
})();
