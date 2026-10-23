// 隨機分組器邏輯

(function() {
  const SAMPLE_MEMBERS = [
    '陳大明', '李小華', '張志豪', '王美玲', '林俊傑', '周子瑜',
    '黃國倫', '吳宗憲', '蔡依林', '徐若瑄', '柯有倫', '楊丞琳'
  ];

  const membersInput = document.getElementById('members-input');
  const btnLoadSample = document.getElementById('btn-load-sample');
  const groupModeSelect = document.getElementById('group-mode-select');
  const groupValLabel = document.getElementById('group-val-label');
  const groupValInput = document.getElementById('group-val');
  const assignLeaderCheckbox = document.getElementById('assign-leader');
  const btnGenerateTeams = document.getElementById('btn-generate-teams');
  const teamsGrid = document.getElementById('teams-grid');
  const btnCopyTeams = document.getElementById('btn-copy-teams');

  let currentMode = 'by-groups';
  let generatedTeams = [];

  function shuffle(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function generateTeams() {
    const raw = membersInput.value
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (raw.length === 0) {
      if (window.ToolboxApp && window.ToolboxApp.showToast) {
        window.ToolboxApp.showToast('請先輸入成員名單！', 'warning');
      }
      return;
    }

    const val = parseInt(groupValInput.value, 10) || 1;
    let teamCount = 1;

    if (currentMode === 'by-groups') {
      teamCount = Math.max(1, Math.min(val, raw.length));
    } else {
      teamCount = Math.max(1, Math.ceil(raw.length / Math.max(1, val)));
    }

    const shuffled = shuffle(raw);
    const teams = Array.from({ length: teamCount }, () => []);

    shuffled.forEach((person, idx) => {
      teams[idx % teamCount].push(person);
    });

    const assignLeader = assignLeaderCheckbox.checked;
    generatedTeams = teams.map((members, idx) => {
      let leader = null;
      if (assignLeader && members.length > 0) {
        leader = members[0]; // 洗牌後的第一個為組長
      }
      return {
        name: `第 ${idx + 1} 組`,
        leader: leader,
        members: members
      };
    });

    renderTeams();
  }

  function renderTeams() {
    teamsGrid.innerHTML = '';
    generatedTeams.forEach(t => {
      const card = document.createElement('div');
      card.style.cssText = 'background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); display: flex; flex-direction: column; gap: 8px; box-shadow: var(--shadow-sm);';

      let listHtml = t.members.map(m => {
        const isLeader = t.leader === m;
        return `<li style="padding: 3px 0; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--color-border-subtle, rgba(255,255,255,0.05)); font-size: 0.875rem;">
          <span>${m}</span>
          ${isLeader ? '<span style="color: #f59e0b; font-size: 0.75rem; font-weight: 700; background: rgba(245,158,11,0.15); padding: 1px 6px; border-radius: 4px;">👑 組長</span>' : ''}
        </li>`;
      }).join('');

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--color-accent); padding-bottom: 6px;">
          <strong style="color: var(--color-accent); font-size: 1rem;">${t.name}</strong>
          <span style="font-size: 0.75rem; color: var(--color-text-secondary);">${t.members.length} 人</span>
        </div>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${listHtml}
        </ul>
      `;

      teamsGrid.appendChild(card);
    });
  }

  groupModeSelect.addEventListener('click', (e) => {
    const btn = e.target.closest('.segmented-control__item');
    if (btn && btn.dataset.mode) {
      currentMode = btn.dataset.mode;
      groupModeSelect.querySelectorAll('.segmented-control__item').forEach(b => {
        b.classList.toggle('active', b === btn);
      });
      groupValLabel.textContent = currentMode === 'by-groups' ? '分成幾組：' : '每組幾人：';
    }
  });

  btnLoadSample.addEventListener('click', () => {
    membersInput.value = SAMPLE_MEMBERS.join('\n');
    generateTeams();
  });

  btnGenerateTeams.addEventListener('click', generateTeams);

  btnCopyTeams.addEventListener('click', () => {
    if (generatedTeams.length === 0) return;
    let text = '【隨機分組名單】\n';
    generatedTeams.forEach(t => {
      text += `\n${t.name} (${t.members.length} 人)：\n`;
      t.members.forEach(m => {
        text += `• ${m}${t.leader === m ? ' (👑組長)' : ''}\n`;
      });
    });

    if (window.ToolboxApp && window.ToolboxApp.copyToClipboard) {
      window.ToolboxApp.copyToClipboard(text, '分組結果已複製');
    } else {
      navigator.clipboard.writeText(text);
    }
  });

  // 初始範例
  membersInput.value = SAMPLE_MEMBERS.join('\n');
  generateTeams();
})();
