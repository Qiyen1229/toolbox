/**
 * PDF Merger — 工具邏輯
 * 功能：多 PDF 檔案載入、自訂上下排序、透過 pdf-lib 本地快速合併匯出
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('pdf-merger'); } catch (_) {}

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const mergeSection = document.getElementById('merge-section');
  const mergeTitle = document.getElementById('merge-title');
  const pdfTbody = document.getElementById('pdf-tbody');
  const outFilename = document.getElementById('out-filename');
  const btnAddMore = document.getElementById('btn-add-more');
  const btnClearAll = document.getElementById('btn-clear-all');
  const btnDoMerge = document.getElementById('btn-do-merge');

  /** 檔案清單：Array of { file: File, buffer: ArrayBuffer, pageCount: number } */
  let pdfList = [];

  dropZone.addEventListener('click', () => fileInput.click());
  btnAddMore.addEventListener('click', () => fileInput.click());

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
      appendPdfFiles(Array.from(e.dataTransfer.files));
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      appendPdfFiles(Array.from(fileInput.files));
    }
  });

  async function appendPdfFiles(files) {
    const valid = files.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (valid.length === 0) {
      Utils.showToast('請選取 PDF 格式的檔案', 'warning');
      return;
    }

    if (typeof PDFLib === 'undefined') {
      Utils.showToast('PDF 引擎尚未載入完成，請稍候重試', 'error');
      return;
    }

    const { PDFDocument } = PDFLib;

    for (const f of valid) {
      try {
        const buf = await f.arrayBuffer();
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const pages = doc.getPageCount();
        pdfList.push({
          file: f,
          buffer: buf,
          pageCount: pages,
        });
      } catch (err) {
        console.error('Error reading PDF:', f.name, err);
        Utils.showToast(`無法讀取 ${f.name}：${err.message}`, 'error');
      }
    }

    renderTable();
    if (pdfList.length > 0) {
      Utils.showToast(`已載入 ${valid.length} 份 PDF 檔案`, 'success');
    }
  }

  function renderTable() {
    if (pdfList.length === 0) {
      mergeSection.style.display = 'none';
      return;
    }

    mergeSection.style.display = 'block';
    const totalPages = pdfList.reduce((sum, item) => sum + item.pageCount, 0);
    mergeTitle.textContent = `已加入 PDF (${pdfList.length} 份 · 共 ${totalPages} 頁)`;

    pdfTbody.innerHTML = pdfList
      .map((item, idx) => `
        <tr style="border-bottom: 1px solid var(--color-border);">
          <td style="padding: 10px 14px; color: var(--color-text-tertiary); font-weight: 700;">#${idx + 1}</td>
          <td style="padding: 10px 14px; word-break: break-all; font-weight: 600;">
            ${Utils.escapeHtml(item.file.name)}
          </td>
          <td style="padding: 10px 14px; color: var(--color-text-tertiary);">${Utils.formatFileSize(item.file.size)}</td>
          <td style="padding: 10px 14px; color: var(--color-accent); font-weight: 700;">${item.pageCount} 頁</td>
          <td style="padding: 10px 14px; text-align: center;">
            <button class="btn btn--sm btn--ghost" data-action="up" data-idx="${idx}" ${idx === 0 ? 'disabled style="opacity:0.3;"' : ''}>▲</button>
            <button class="btn btn--sm btn--ghost" data-action="down" data-idx="${idx}" ${idx === pdfList.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>▼</button>
            <button class="btn btn--sm btn--ghost" data-action="del" data-idx="${idx}" style="color: var(--color-error); margin-left: 6px;">✕</button>
          </td>
        </tr>
      `)
      .join('');
  }

  pdfTbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const idx = parseInt(btn.dataset.idx, 10);

    if (action === 'up' && idx > 0) {
      const temp = pdfList[idx];
      pdfList[idx] = pdfList[idx - 1];
      pdfList[idx - 1] = temp;
      renderTable();
    } else if (action === 'down' && idx < pdfList.length - 1) {
      const temp = pdfList[idx];
      pdfList[idx] = pdfList[idx + 1];
      pdfList[idx + 1] = temp;
      renderTable();
    } else if (action === 'del') {
      pdfList.splice(idx, 1);
      renderTable();
      Utils.showToast('已移除該檔案', 'info');
    }
  });

  btnClearAll.addEventListener('click', () => {
    pdfList = [];
    fileInput.value = '';
    renderTable();
    Utils.showToast('已清空所有 PDF', 'info');
  });

  btnDoMerge.addEventListener('click', async () => {
    if (pdfList.length < 2) {
      Utils.showToast('請至少加入 2 份 PDF 檔案進行合併', 'warning');
      return;
    }

    if (typeof PDFLib === 'undefined') {
      Utils.showToast('PDF 引擎尚未載入完成，請稍候重試', 'error');
      return;
    }

    const { PDFDocument } = PDFLib;
    btnDoMerge.disabled = true;
    btnDoMerge.textContent = '📑 正在合併中，請稍候…';

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of pdfList) {
        const doc = await PDFDocument.load(item.buffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      let fname = (outFilename.value || 'merged-document.pdf').trim();
      if (!fname.endsWith('.pdf')) fname += '.pdf';

      Utils.downloadBlob(blob, fname);
      Utils.showToast(`成功合併 ${pdfList.length} 份文件並下載！`, 'success');
    } catch (err) {
      console.error(err);
      Utils.showToast(`合併失敗：${err.message}`, 'error');
    } finally {
      btnDoMerge.disabled = false;
      btnDoMerge.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        立即合併並下載新 PDF
      `;
    }
  });
});
