// 聚餐分帳計算器邏輯

(function() {
  const billTotalInput = document.getElementById('bill-total');
  const peopleCountInput = document.getElementById('people-count');
  const serviceFeeSelect = document.getElementById('service-fee');
  const roundRuleSelect = document.getElementById('round-rule');
  const perPersonAmountEl = document.getElementById('per-person-amount');
  const summaryRawEl = document.getElementById('summary-raw');
  const summaryServiceEl = document.getElementById('summary-service');
  const summaryFinalEl = document.getElementById('summary-final');
  const summaryCollectedEl = document.getElementById('summary-collected');
  const memberBreakdownEl = document.getElementById('member-breakdown');
  const btnCopyBill = document.getElementById('btn-copy-bill');
  const btnAddMember = document.getElementById('btn-add-member');
  const membersListEl = document.getElementById('members-list');

  let customMembers = [];

  function applyRounding(val, rule) {
    if (rule === 'ceil-1') return Math.ceil(val);
    if (rule === 'ceil-10') return Math.ceil(val / 10) * 10;
    if (rule === 'ceil-50') return Math.ceil(val / 50) * 50;
    if (rule === 'ceil-100') return Math.ceil(val / 100) * 100;
    return Math.round(val);
  }

  function calculate() {
    const rawBill = parseFloat(billTotalInput.value) || 0;
    const people = Math.max(1, parseInt(peopleCountInput.value, 10) || 1);
    const serviceRate = (parseFloat(serviceFeeSelect.value) || 0) / 100;
    const roundRule = roundRuleSelect.value;

    const serviceAmt = rawBill * serviceRate;
    const totalWithService = rawBill + serviceAmt;

    // 計算自訂成員加減額
    let extraSum = 0;
    customMembers.forEach(m => {
      extraSum += (m.extra || 0);
    });

    const sharedBase = Math.max(0, totalWithService - extraSum);
    const perPersonBase = sharedBase / people;
    const roundedPerPerson = applyRounding(perPersonBase, roundRule);

    perPersonAmountEl.textContent = `NT$ ${roundedPerPerson.toLocaleString()}`;
    summaryRawEl.textContent = `NT$ ${Math.round(rawBill).toLocaleString()}`;
    summaryServiceEl.textContent = `NT$ ${Math.round(serviceAmt).toLocaleString()}`;
    summaryFinalEl.textContent = `NT$ ${Math.round(totalWithService).toLocaleString()}`;
    summaryCollectedEl.textContent = `NT$ ${(roundedPerPerson * people + extraSum).toLocaleString()}`;

    if (customMembers.length > 0) {
      memberBreakdownEl.style.display = 'block';
      let html = '<div style="font-weight: 700; margin-bottom: 6px;">成員應付清單：</div>';
      customMembers.forEach((m, idx) => {
        const mTotal = roundedPerPerson + (m.extra || 0);
        html += `<div style="display: flex; justify-content: space-between; padding: 2px 0;">
          <span>${m.name || ('成員 ' + (idx + 1))}：</span>
          <strong style="color: var(--color-accent);">NT$ ${mTotal.toLocaleString()}</strong>
        </div>`;
      });
      memberBreakdownEl.innerHTML = html;
    } else {
      memberBreakdownEl.style.display = 'none';
    }
  }

  function renderMembers() {
    membersListEl.innerHTML = '';
    customMembers.forEach((m, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; gap: var(--space-xs); align-items: center;';
      row.innerHTML = `
        <input type="text" class="form-input mem-name" placeholder="姓名/代稱" value="${m.name}" style="flex: 1;">
        <input type="number" class="form-input mem-extra" placeholder="額外加點(可負)" value="${m.extra || ''}" style="width: 140px;">
        <button class="btn btn--xs btn--ghost btn-del-mem" style="color: var(--color-danger);">✕</button>
      `;
      row.querySelector('.mem-name').addEventListener('input', (e) => {
        m.name = e.target.value;
        calculate();
      });
      row.querySelector('.mem-extra').addEventListener('input', (e) => {
        m.extra = parseFloat(e.target.value) || 0;
        calculate();
      });
      row.querySelector('.btn-del-mem').addEventListener('click', () => {
        customMembers.splice(idx, 1);
        renderMembers();
        calculate();
      });
      membersListEl.appendChild(row);
    });
  }

  btnAddMember.addEventListener('click', () => {
    customMembers.push({ name: `成員 ${customMembers.length + 1}`, extra: 0 });
    renderMembers();
    calculate();
  });

  [billTotalInput, peopleCountInput, serviceFeeSelect, roundRuleSelect].forEach(el => {
    el.addEventListener('input', calculate);
    el.addEventListener('change', calculate);
  });

  btnCopyBill.addEventListener('click', () => {
    const rawBill = summaryRawEl.textContent;
    const finalTotal = summaryFinalEl.textContent;
    const people = peopleCountInput.value;
    const perPerson = perPersonAmountEl.textContent;

    let text = `【聚餐分帳明細】
消費總額：${rawBill}
含服務費：${finalTotal}
分攤人數：${people} 人
每人均分：${perPerson}`;

    if (customMembers.length > 0) {
      text += '\n─────────────\n個別應付：';
      customMembers.forEach(m => {
        const perBase = parseInt(perPerson.replace(/\D/g, ''), 10) || 0;
        text += `\n• ${m.name}：NT$ ${(perBase + (m.extra || 0)).toLocaleString()}`;
      });
    }

    text += '\n感謝大家！辛苦主辦與算錢囉 😊';

    if (window.ToolboxApp && window.ToolboxApp.copyToClipboard) {
      window.ToolboxApp.copyToClipboard(text, '分帳明細已複製，可直接貼到 LINE！');
    } else {
      navigator.clipboard.writeText(text);
    }
  });

  calculate();
})();
