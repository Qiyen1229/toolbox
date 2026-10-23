/**
 * Batch File Renamer — 工具邏輯
 * 功能：多檔案批次改名、字串尋找取代、序號追加與打包 ZIP 下載
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('batch-renamer'); } catch (_) { }

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const rulesSection = document.getElementById('rules-section');
  const tableSection = document.getElementById('table-section');
  const filesTbody = document.getElementById('files-tbody');
  const fileCountTitle = document.getElementById('file-count-title');
  const rulePrefix = document.getElementById('rule-prefix');
  const ruleSuffix = document.getElementById('rule-suffix');
  const ruleFind = document.getElementById('rule-find');
  const ruleReplace = document.getElementById('rule-replace');
  const ruleNumbering = document.getElementById('rule-numbering');
  const ruleCase = document.getElementById('rule-case');
  const btnDownloadZip = document.getElementById('btn-download-zip');
  const btnExportList = document.getElementById('btn-export-list');
  const btnClearAll = document.getElementById('btn-clear-all');

  /** 檔案清單：Array of { file: File, origName: string, newName: string } */
  let fileList = [];

  /* ================================================================
     檔案上傳事件
     ================================================================ */

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('file-drop-zone--active');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('file-drop-zone--active');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('file-drop-zone--active');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      appendFiles(Array.from(e.dataTransfer.files));
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      appendFiles(Array.from(fileInput.files));
    }
  });

  function appendFiles(newFiles) {
    newFiles.forEach((f) => {
      fileList.push({
        file: f,
        origName: f.name,
        newName: f.name,
      });
    });

    if (fileList.length > 0) {
      rulesSection.style.display = 'block';
      tableSection.style.display = 'block';
      updateRenamedList();
      Utils.showToast(`已載入 ${newFiles.length} 個檔案`, 'success');
    }
  }

  /* ================================================================
     重新命名核心運算
     ================================================================ */

  function computeNewName(origName, index) {
    const lastDot = origName.lastIndexOf('.');
    let base = lastDot !== -1 ? origName.substring(0, lastDot) : origName;
    let ext = lastDot !== -1 ? origName.substring(lastDot) : '';

    const prefix = rulePrefix.value || '';
    const suffix = ruleSuffix.value || '';
    const findStr = ruleFind.value || '';
    const replaceStr = ruleReplace.value || '';
    const numbering = ruleNumbering.value;
    const caseMode = ruleCase.value;

    // 1. 尋找與取代
    if (findStr) {
      base = base.replaceAll(findStr, replaceStr);
    }

    // 2. 大小寫轉換
    if (caseMode === 'lower') {
      base = base.toLowerCase();
      ext = ext.toLowerCase();
    } else if (caseMode === 'upper') {
      base = base.toUpperCase();
      ext = ext.toUpperCase();
    }

    // 3. 序號編排
    const num1 = index + 1;
    const pad2 = num1.toString().padStart(2, '0');
    const pad3 = num1.toString().padStart(3, '0');

    if (numbering === 'end-3') {
      base = `${base}_${pad3}`;
    } else if (numbering === 'end-2') {
      base = `${base}_${pad2}`;
    } else if (numbering === 'start-3') {
      base = `${pad3}_${base}`;
    } else if (numbering === 'replace') {
      base = pad3;
    }

    // 4. 前綴與後綴
    return `${prefix}${base}${suffix}${ext}`;
  }

  function updateRenamedList() {
    fileCountTitle.textContent = `檔案列表預覽 (${fileList.length} 個檔案)`;

    filesTbody.innerHTML = fileList
      .map((item, idx) => {
        item.newName = computeNewName(item.origName, idx);
        const isChanged = item.newName !== item.origName;

        return `
          <tr style="border-bottom: 1px solid var(--color-border);">
            <td style="padding: 10px 14px; color: var(--color-text-tertiary);">${idx + 1}</td>
            <td style="padding: 10px 14px; word-break: break-all;">${Utils.escapeHtml(item.origName)}</td>
            <td style="padding: 10px 14px; color: var(--color-text-tertiary); white-space: nowrap;">${Utils.formatFileSize(item.file.size)}</td>
            <td style="padding: 10px 14px; word-break: break-all; font-weight: ${isChanged ? '700' : '400'}; color: ${isChanged ? 'var(--color-accent)' : 'inherit'};">
              ${Utils.escapeHtml(item.newName)}
            </td>
          </tr>
        `;
      })
      .join('');
  }

  // 監聽所有規則變更
  [rulePrefix, ruleSuffix, ruleFind, ruleReplace].forEach((inp) => {
    inp.addEventListener('input', updateRenamedList);
  });
  [ruleNumbering, ruleCase].forEach((sel) => {
    sel.addEventListener('change', updateRenamedList);
  });

  // 清空全部
  btnClearAll.addEventListener('click', () => {
    fileList = [];
    fileInput.value = '';
    rulesSection.style.display = 'none';
    tableSection.style.display = 'none';
    Utils.showToast('已清空所有檔案', 'info');
  });

  // 匯出清單 TXT
  btnExportList.addEventListener('click', () => {
    if (fileList.length === 0) return;
    const lines = fileList.map((item) => `${item.origName} -> ${item.newName}`);
    Utils.downloadText(lines.join('\n'), 'rename-mapping.txt', 'text/plain');
    Utils.showToast('已匯出對照清單 TXT', 'success');
  });

  // 打包下載 ZIP
  btnDownloadZip.addEventListener('click', async () => {
    if (fileList.length === 0) return;

    if (typeof JSZip === 'undefined') {
      Utils.showToast('ZIP 模組尚未就緒，請稍候重試', 'error');
      return;
    }

    const zip = new JSZip();
    btnDownloadZip.disabled = true;
    btnDownloadZip.textContent = '📦 正在壓縮檔案中…';

    try {
      for (const item of fileList) {
        zip.file(item.newName, item.file);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      Utils.downloadBlob(zipBlob, 'renamed_files.zip');
      Utils.showToast('已成功下載重新命名 ZIP 壓縮檔！', 'success');
    } catch (err) {
      console.error(err);
      Utils.showToast(`壓縮失敗：${err.message}`, 'error');
    } finally {
      btnDownloadZip.disabled = false;
      btnDownloadZip.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        一鍵打包下載重新命名後的檔案 (ZIP)
      `;
    }
  });
});
