/**
 * PDF Splitter — 工具邏輯
 * 功能：解析 PDF 頁數，支援自訂頁碼範圍萃取與全部拆解為 ZIP
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('pdf-splitter'); } catch (_) {}

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const splitOptions = document.getElementById('split-options');
  const pdfInfoName = document.getElementById('pdf-info-name');
  const pdfInfoPages = document.getElementById('pdf-info-pages');
  const pdfInfoSize = document.getElementById('pdf-info-size');
  const rangeWrapper = document.getElementById('range-wrapper');
  const pageRangeInput = document.getElementById('page-range-input');
  const btnDoSplit = document.getElementById('btn-do-split');
  const btnReupload = document.getElementById('btn-reupload');
  const modeRadios = document.querySelectorAll('input[name="split-mode"]');

  let currentFile = null;
  let pdfDoc = null;
  let totalPages = 0;
  let pdfBuffer = null;

  dropZone.addEventListener('click', () => fileInput.click());
  btnReupload.addEventListener('click', () => {
    fileInput.value = '';
    fileInput.click();
  });

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
      handlePdfFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      handlePdfFile(fileInput.files[0]);
    }
  });

  modeRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      const mode = document.querySelector('input[name="split-mode"]:checked').value;
      rangeWrapper.style.display = mode === 'range' ? 'block' : 'none';
      btnDoSplit.textContent = mode === 'range' ? '立即擷取並下載 PDF' : '拆解為單頁並下載 ZIP';
    });
  });

  async function handlePdfFile(file) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      Utils.showToast('請選取有效的 PDF 檔案', 'error');
      return;
    }

    if (typeof PDFLib === 'undefined') {
      Utils.showToast('PDF 引擎尚未載入完成，請稍候重試', 'error');
      return;
    }

    currentFile = file;
    pdfInfoName.textContent = file.name;
    pdfInfoSize.textContent = Utils.formatFileSize(file.size);
    pdfInfoPages.textContent = '讀取中…';
    splitOptions.style.display = 'block';

    try {
      pdfBuffer = await file.arrayBuffer();
      const { PDFDocument } = PDFLib;
      pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      totalPages = pdfDoc.getPageCount();

      pdfInfoPages.textContent = `${totalPages} 頁`;
      pageRangeInput.placeholder = `例如：1-${Math.min(3, totalPages)}`;
      pageRangeInput.value = `1-${totalPages}`;
      Utils.showToast(`成功解析 PDF，共 ${totalPages} 頁`, 'success');
    } catch (err) {
      console.error(err);
      Utils.showToast(`解析 PDF 失敗：${err.message}`, 'error');
    }
  }

  /* ================================================================
     解析使用者輸入的頁碼 (支援 1-based index)
     ================================================================ */

  function parsePageRanges(inputStr, maxPage) {
    const pages = new Set();
    const parts = inputStr.split(',');

    for (let part of parts) {
      part = part.trim();
      if (!part) continue;

      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        if (isNaN(start) || isNaN(end)) continue;
        const low = Math.max(1, Math.min(start, end));
        const high = Math.min(maxPage, Math.max(start, end));

        for (let i = low; i <= high; i++) {
          pages.add(i);
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= maxPage) {
          pages.add(p);
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  }

  /* ================================================================
     分割邏輯
     ================================================================ */

  btnDoSplit.addEventListener('click', async () => {
    if (!pdfDoc || totalPages === 0 || !currentFile) {
      Utils.showToast('請先上傳有效的 PDF 檔案', 'warning');
      return;
    }

    const { PDFDocument } = PDFLib;
    const mode = document.querySelector('input[name="split-mode"]:checked').value;
    const baseName = currentFile.name.replace(/\.pdf$/i, '');

    btnDoSplit.disabled = true;

    try {
      if (mode === 'range') {
        // 模式 A：擷取指定頁面
        const targetPages = parsePageRanges(pageRangeInput.value, totalPages);
        if (targetPages.length === 0) {
          Utils.showToast(`請輸入有效的頁碼範圍 (1~${totalPages})`, 'warning');
          btnDoSplit.disabled = false;
          return;
        }

        btnDoSplit.textContent = '📄 正在建立新 PDF…';
        const newPdf = await PDFDocument.create();
        const pageIndices = targetPages.map((p) => p - 1); // 0-based
        const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);

        copiedPages.forEach((page) => newPdf.addPage(page));

        const newBytes = await newPdf.save();
        const blob = new Blob([newBytes], { type: 'application/pdf' });
        const outName = `${baseName}_extracted.pdf`;

        Utils.downloadBlob(blob, outName);
        Utils.showToast(`已成功擷取 ${targetPages.length} 頁並下載！`, 'success');
      } else {
        // 模式 B：拆解為單頁 PDF 打包 ZIP
        if (typeof JSZip === 'undefined') {
          Utils.showToast('ZIP 模組尚未就緒，請稍候重試', 'error');
          btnDoSplit.disabled = false;
          return;
        }

        btnDoSplit.textContent = '📦 正在拆解每頁並打包 ZIP…';
        const zip = new JSZip();

        for (let i = 0; i < totalPages; i++) {
          const singlePdf = await PDFDocument.create();
          const [singlePage] = await singlePdf.copyPages(pdfDoc, [i]);
          singlePdf.addPage(singlePage);

          const singleBytes = await singlePdf.save();
          const padNum = (i + 1).toString().padStart(3, '0');
          zip.file(`${baseName}_page_${padNum}.pdf`, singleBytes);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        Utils.downloadBlob(zipBlob, `${baseName}_split_pages.zip`);
        Utils.showToast(`已成功拆解 ${totalPages} 頁並下載 ZIP！`, 'success');
      }
    } catch (err) {
      console.error(err);
      Utils.showToast(`分割失敗：${err.message}`, 'error');
    } finally {
      btnDoSplit.disabled = false;
      const currentMode = document.querySelector('input[name="split-mode"]:checked').value;
      btnDoSplit.textContent = currentMode === 'range' ? '立即擷取並下載 PDF' : '拆解為單頁並下載 ZIP';
    }
  });
});
