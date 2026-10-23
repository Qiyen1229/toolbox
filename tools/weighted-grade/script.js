// 加權成績計算器邏輯

(function() {
  const DEFAULT_ITEMS = [
    { name: '課堂出席與討論', score: 95, weight: 10 },
    { name: '平時作業 / 小考', score: 85, weight: 30 },
    { name: '期中考成績', score: 78, weight: 30 },
    { name: '期末專案 / 報告', score: 88, weight: 30 }
  ];

  let items = [...DEFAULT_ITEMS];

  const totalWeightDisplay = document.getElementById('total-weight-display');
  const btnAddItem = document.getElementById('btn-add-item');
  const gradeRows = document.getElementById('grade-rows');
  const finalScoreEl = document.getElementById('final-score');
  const passStatusEl = document.getElementById('pass-status');

  function calculate() {
    let totalWeight = 0;
    let weightedSum = 0;

    items.forEach(it => {
      const s = parseFloat(it.score) || 0;
      const w = parseFloat(it.weight) || 0;
      totalWeight += w;
      weightedSum += (s * (w / 100));
    });

    totalWeightDisplay.textContent = `${totalWeight}%`;
    if (Math.abs(totalWeight - 100) < 0.01) {
      totalWeightDisplay.style.color = 'var(--color-success)';
    } else {
      totalWeightDisplay.style.color = 'var(--color-warning)';
      totalWeightDisplay.textContent += ` (未滿 100%，依現有權重歸一化)`;
    }

    // 若權重不等於 100%，以現有權重比例歸一化
    const finalScore = totalWeight > 0 ? (weightedSum / (totalWeight / 100)) : 0;
    const formatted = finalScore.toFixed(1);

    finalScoreEl.textContent = `${formatted} 分`;

    if (finalScore >= 60) {
      passStatusEl.textContent = '✓ 及格通過';
      passStatusEl.style.color = 'var(--color-success)';
      finalScoreEl.style.color = 'var(--color-success)';
    } else {
      passStatusEl.textContent = '✕ 未達及格標準 (60分)';
      passStatusEl.style.color = 'var(--color-danger)';
      finalScoreEl.style.color = 'var(--color-danger)';
    }
  }

  function renderTable() {
    gradeRows.innerHTML = '';
    items.forEach((it, idx) => {
      const tr = document.createElement('tr');
      tr.style.cssText = 'border-bottom: 1px solid var(--color-border);';

      tr.innerHTML = `
        <td style="padding: 6px 8px;">
          <input type="text" class="form-input it-name" value="${it.name}" placeholder="項目名稱" style="padding: 4px 8px;">
        </td>
        <td style="padding: 6px 8px;">
          <input type="number" class="form-input it-score" value="${it.score}" min="0" max="100" step="0.5" style="padding: 4px 8px;">
        </td>
        <td style="padding: 6px 8px;">
          <input type="number" class="form-input it-weight" value="${it.weight}" min="0" max="100" step="1" style="padding: 4px 8px; font-weight: 700;">
        </td>
        <td style="padding: 6px 8px; text-align: center;">
          <button class="btn btn--xs btn--ghost btn-del-it" style="color: var(--color-danger); padding: 4px 8px;">✕</button>
        </td>
      `;

      tr.querySelector('.it-name').addEventListener('input', (e) => {
        it.name = e.target.value;
      });
      tr.querySelector('.it-score').addEventListener('input', (e) => {
        it.score = parseFloat(e.target.value) || 0;
        calculate();
      });
      tr.querySelector('.it-weight').addEventListener('input', (e) => {
        it.weight = parseFloat(e.target.value) || 0;
        calculate();
      });
      tr.querySelector('.btn-del-it').addEventListener('click', () => {
        items.splice(idx, 1);
        renderTable();
        calculate();
      });

      gradeRows.appendChild(tr);
    });
  }

  btnAddItem.addEventListener('click', () => {
    items.push({ name: `評分項目 ${items.length + 1}`, score: 80, weight: 10 });
    renderTable();
    calculate();
  });

  renderTable();
  calculate();
})();
