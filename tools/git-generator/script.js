/**
 * Git Command Generator 實作腳本
 */
document.addEventListener('DOMContentLoaded', () => {
  StorageManager.addRecent('git-generator');

  const tabButtons = document.querySelectorAll('.git-tab');
  const actionSelect = document.getElementById('action-select');
  const dynamicFields = document.getElementById('dynamic-fields');
  const commandOutput = document.getElementById('command-output');
  const commandExplain = document.getElementById('command-explain');
  const btnCopyCommand = document.getElementById('btn-copy-command');

  const SCENARIOS = {
    branch: [
      {
        id: 'new-branch',
        name: '建立並切換至新分支',
        fields: [{ id: 'branchName', label: '新分支名稱', default: 'feature/login' }],
        template: (f) => `git checkout -b ${f.branchName || 'feature-branch'}`,
        explain: '建立指定名稱的全新分支，並立刻切換至該分支進行後續開發。'
      },
      {
        id: 'switch-branch',
        name: '切換至現有分支',
        fields: [{ id: 'branchName', label: '目標分支名稱', default: 'main' }],
        template: (f) => `git switch ${f.branchName || 'main'}`,
        explain: '切換當前工作目錄到指定的現有分支。'
      },
      {
        id: 'del-branch-local',
        name: '安全刪除本地分支',
        fields: [{ id: 'branchName', label: '欲刪除的分支', default: 'feature/old' }],
        template: (f) => `git branch -d ${f.branchName || 'old-branch'}`,
        explain: '若分支已經合併則正常刪除；若尚未合併且確定要強制刪除，請使用 -D。'
      },
      {
        id: 'del-branch-remote',
        name: '刪除遠端 GitHub / GitLab 分支',
        fields: [{ id: 'remoteName', label: '遠端名稱', default: 'origin' }, { id: 'branchName', label: '遠端分支名稱', default: 'feature/old' }],
        template: (f) => `git push ${f.remoteName || 'origin'} --delete ${f.branchName || 'feature/old'}`,
        explain: '⚠️ 注意：此操作會刪除遠端伺服器上的分支，團隊協作時請確認該分支已無人在使用。'
      }
    ],
    commit: [
      {
        id: 'add-commit',
        name: '暫存所有修改並提交 (Conventional Commits)',
        fields: [{ id: 'type', label: '類型 (feat/fix/docs...)', default: 'feat' }, { id: 'msg', label: '提交訊息', default: 'add new developer tools' }],
        template: (f) => `git add .\ngit commit -m "${f.type || 'feat'}: ${f.msg || 'update'}"`,
        explain: '將當前工作目錄中所有修改加入暫存區，並依照規範建立一筆新的 Git 提交紀錄。'
      },
      {
        id: 'amend-commit',
        name: '修改上一次 Commit 訊息 (未 push 前)',
        fields: [{ id: 'newMsg', label: '新提交訊息', default: 'fix(core): correct typo' }],
        template: (f) => `git commit --amend -m "${f.newMsg || 'updated commit message'}"`,
        explain: '替換最後一次提交的訊息，若有尚未包含的微小修改也可以先 git add 再執行本指令。'
      }
    ],
    undo: [
      {
        id: 'discard-local',
        name: '放棄工作區中所有未暫存修改',
        fields: [],
        template: () => `git restore .`,
        explain: '⚠️ 警告：這將永久丟棄所有尚未加入暫存區 (git add) 的本機改動，不可撤銷！'
      },
      {
        id: 'soft-reset',
        name: '撤銷最近一次 Commit (保留修改在暫存區)',
        fields: [],
        template: () => `git reset --soft HEAD~1`,
        explain: '撤銷上一次 commit，但你寫的程式碼會完好保存在暫存區中，適合重新調整提交訊息。'
      },
      {
        id: 'revert-commit',
        name: '以新提交安全反轉某次 Commit (適合已 push)',
        fields: [{ id: 'commitHash', label: 'Commit Hash (雜湊碼)', default: 'a1b2c3d' }],
        template: (f) => `git revert ${f.commitHash || 'HEAD'}`,
        explain: '產生一筆新的反向提交來抵消指定 commit 的修改，完全不會改寫 Git 歷史，安全適合多人協作。'
      }
    ],
    remote: [
      {
        id: 'push-upstream',
        name: '首次推送並綁定遠端分支',
        fields: [{ id: 'remoteName', label: '遠端', default: 'origin' }, { id: 'branchName', label: '分支名稱', default: 'main' }],
        template: (f) => `git push -u ${f.remoteName || 'origin'} ${f.branchName || 'main'}`,
        explain: '將本地分支推送到遠端並設定 upstream 追蹤關聯，以後只要輸入 git push 即可。'
      },
      {
        id: 'pull-rebase',
        name: '拉取遠端最新代碼並 Rebase (保持乾淨線性歷史)',
        fields: [{ id: 'remoteName', label: '遠端', default: 'origin' }, { id: 'branchName', label: '分支名稱', default: 'main' }],
        template: (f) => `git pull --rebase ${f.remoteName || 'origin'} ${f.branchName || 'main'}`,
        explain: '拉取遠端最新變更，並將你本地的新提交平滑移植到最頂端，避免產生多餘的 Merge Commit。'
      }
    ],
    stash: [
      {
        id: 'stash-push',
        name: '暫存當前工作進度 (包含未追蹤檔案)',
        fields: [{ id: 'msg', label: '暫存備註訊息', default: 'wip: feature incomplete' }],
        template: (f) => `git stash push -u -m "${f.msg || 'wip'}"`,
        explain: '將目前手邊尚未完成的程式碼收入暫存箱，讓工作目錄回到乾淨狀態以方便切換其他分支。'
      },
      {
        id: 'stash-pop',
        name: '恢復並刪除最近一次暫存 (Stash Pop)',
        fields: [],
        template: () => `git stash pop`,
        explain: '將最近一次存入暫存箱的代碼恢復至當前分支的工作目錄，並從暫存清單中移除。'
      }
    ],
    log: [
      {
        id: 'log-graph',
        name: '高質感終端 ASCII 分支線圖紀錄',
        fields: [],
        template: () => `git log --graph --oneline --decorate --all`,
        explain: '在終端機中以彩色分支線圖方式展示所有分支的提交歷史與標籤位置。'
      }
    ]
  };

  let currentCategory = 'branch';

  function renderCategory() {
    const list = SCENARIOS[currentCategory] || [];
    actionSelect.innerHTML = list.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
    renderFields();
  }

  function renderFields() {
    const list = SCENARIOS[currentCategory] || [];
    const item = list.find(x => x.id === actionSelect.value) || list[0];
    if (!item) return;

    dynamicFields.innerHTML = item.fields.map(f => `
      <div style="flex: 1; min-width: 180px;">
        <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">${f.label}</label>
        <input type="text" class="form-input git-field-input" data-field-id="${f.id}" value="${f.default}" style="font-family: var(--font-mono, monospace);">
      </div>
    `).join('');

    dynamicFields.querySelectorAll('.git-field-input').forEach(input => {
      input.addEventListener('input', updateCommand);
    });

    updateCommand();
  }

  function updateCommand() {
    const list = SCENARIOS[currentCategory] || [];
    const item = list.find(x => x.id === actionSelect.value) || list[0];
    if (!item) return;

    const values = {};
    if (dynamicFields) {
      dynamicFields.querySelectorAll('.git-field-input').forEach(input => {
        const fid = input.dataset?.fieldId || input.getAttribute('data-field-id');
        if (fid) values[fid] = String(input.value || '').trim();
      });
    }

    commandOutput.textContent = item.template(values);
    commandExplain.innerHTML = `📌 <strong>說明：</strong>${Utils.escapeHtml(item.explain)}`;
  }

  actionSelect.addEventListener('change', renderFields);

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.className = 'btn btn--sm btn--ghost git-tab');
      btn.className = 'btn btn--sm btn--primary git-tab';
      currentCategory = btn.dataset.cat;
      renderCategory();
    });
  });

  btnCopyCommand.addEventListener('click', () => {
    Utils.copyToClipboard(commandOutput.textContent, '已複製 Git 指令');
  });

  renderCategory();
});
