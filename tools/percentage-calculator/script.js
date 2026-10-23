// 百分比計算器邏輯

(function() {
  function formatNum(num) {
    if (isNaN(num) || !isFinite(num)) return '無效';
    return Number(num.toFixed(4).replace(/\.?0+$/, '')).toLocaleString();
  }

  // 1. A 的 P% 是多少
  const m1Val = document.getElementById('m1-val');
  const m1Pct = document.getElementById('m1-pct');
  const m1Res = document.getElementById('m1-res');

  function calcM1() {
    const val = parseFloat(m1Val.value);
    const pct = parseFloat(m1Pct.value);
    if (isNaN(val) || isNaN(pct)) {
      m1Res.textContent = '-';
      return;
    }
    m1Res.textContent = formatNum((val * pct) / 100);
  }

  // 2. A 是 B 的百分之幾
  const m2A = document.getElementById('m2-a');
  const m2B = document.getElementById('m2-b');
  const m2Res = document.getElementById('m2-res');

  function calcM2() {
    const a = parseFloat(m2A.value);
    const b = parseFloat(m2B.value);
    if (isNaN(a) || isNaN(b) || b === 0) {
      m2Res.textContent = b === 0 ? '除數不可為 0' : '-';
      return;
    }
    const pct = (a / b) * 100;
    m2Res.textContent = pct.toFixed(2).replace(/\.?0+$/, '') + '%';
  }

  // 3. A 增減 P%
  const m3Val = document.getElementById('m3-val');
  const m3Op = document.getElementById('m3-op');
  const m3Pct = document.getElementById('m3-pct');
  const m3Res = document.getElementById('m3-res');

  function calcM3() {
    const val = parseFloat(m3Val.value);
    const pct = parseFloat(m3Pct.value);
    const op = m3Op.value;
    if (isNaN(val) || isNaN(pct)) {
      m3Res.textContent = '-';
      return;
    }
    const delta = (val * pct) / 100;
    const res = op === 'add' ? (val + delta) : (val - delta);
    m3Res.textContent = formatNum(res);
  }

  // 4. A 變到 B 變化率
  const m4From = document.getElementById('m4-from');
  const m4To = document.getElementById('m4-to');
  const m4Res = document.getElementById('m4-res');

  function calcM4() {
    const from = parseFloat(m4From.value);
    const to = parseFloat(m4To.value);
    if (isNaN(from) || isNaN(to) || from === 0) {
      m4Res.textContent = from === 0 ? '原值不可為 0' : '-';
      return;
    }
    const diff = to - from;
    const rate = (diff / from) * 100;
    const prefix = rate > 0 ? '+' : '';
    m4Res.textContent = prefix + rate.toFixed(2) + '%';
    if (rate > 0) {
      m4Res.style.color = 'var(--color-success)';
    } else if (rate < 0) {
      m4Res.style.color = 'var(--color-danger)';
    } else {
      m4Res.style.color = 'var(--color-text-secondary)';
    }
  }

  m1Val.addEventListener('input', calcM1);
  m1Pct.addEventListener('input', calcM1);

  m2A.addEventListener('input', calcM2);
  m2B.addEventListener('input', calcM2);

  m3Val.addEventListener('input', calcM3);
  m3Op.addEventListener('change', calcM3);
  m3Pct.addEventListener('input', calcM3);

  m4From.addEventListener('input', calcM4);
  m4To.addEventListener('input', calcM4);

  calcM1();
  calcM2();
  calcM3();
  calcM4();
})();
