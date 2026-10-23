/**
 * Image to PDF — 工具邏輯
 * 功能：多圖排序、版面邊距自訂，使用 pdf-lib 本地合成標準 PDF
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('image-to-pdf'); } catch (_) {}

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const optionsSection = document.getElementById('options-section');
  const imagesSection = document.getElementById('images-section');
  const imagesGrid = document.getElementById('images-grid');
  const imgCountTitle = document.getElementById('img-count-title');
  const pageSize = document.getElementById('page-size');
  const pageMargin = document.getElementById('page-margin');
  const pdfFilename = document.getElementById('pdf-filename');
  const btnAddMore = document.getElementById('btn-add-more');
  const btnClearImages = document.getElementById('btn-clear-images');
  const btnGeneratePdf = document.getElementById('btn-generate-pdf');

  /** 圖片陣列：{ file: File, dataUrl: string, width: number, height: number } */
  let imageList = [];

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
      loadFiles(Array.from(e.dataTransfer.files));
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      loadFiles(Array.from(fileInput.files));
    }
  });

  function loadFiles(files) {
    const valid = files.filter((f) => f.type.startsWith('image/'));
    if (valid.length === 0) {
      Utils.showToast('請選取圖片檔案 (JPG, PNG, WEBP 等)', 'warning');
      return;
    }

    let loaded = 0;
    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          imageList.push({
            file,
            dataUrl: e.target.result,
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
          loaded++;
          if (loaded === valid.length) {
            renderGrid();
            Utils.showToast(`已載入 ${valid.length} 張圖片`, 'success');
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function renderGrid() {
    if (imageList.length === 0) {
      optionsSection.style.display = 'none';
      imagesSection.style.display = 'none';
      return;
    }

    optionsSection.style.display = 'block';
    imagesSection.style.display = 'block';
    imgCountTitle.textContent = `已加入圖片 (${imageList.length} 張)`;

    imagesGrid.innerHTML = imageList
      .map((item, idx) => `
        <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column;">
          <div style="height: 140px; background: var(--color-bg); display: flex; align-items: center; justify-content: center; position: relative;">
            <img src="${item.dataUrl}" style="max-height: 100%; max-width: 100%; object-fit: contain;" alt="預覽">
            <span style="position: absolute; top: 6px; left: 6px; background: rgba(0,0,0,0.65); color: #fff; padding: 2px 8px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 700;">
              第 ${idx + 1} 頁
            </span>
          </div>
          <div style="padding: 10px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 0.8125rem; font-weight: 600; word-break: break-all; margin-bottom: 4px;">
              ${Utils.escapeHtml(item.file.name)}
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-tertiary); margin-bottom: 8px;">
              ${item.width} × ${item.height} px
            </div>
            <div style="display: flex; justify-content: space-between; gap: 4px;">
              <button class="btn btn--sm btn--ghost" data-action="up" data-idx="${idx}" ${idx === 0 ? 'disabled style="opacity:0.3;"' : ''}>▲ 上移</button>
              <button class="btn btn--sm btn--ghost" data-action="down" data-idx="${idx}" ${idx === imageList.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>▼ 下移</button>
              <button class="btn btn--sm btn--ghost" data-action="del" data-idx="${idx}" style="color: var(--color-error);">刪除</button>
            </div>
          </div>
        </div>
      `)
      .join('');
  }

  imagesGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const idx = parseInt(btn.dataset.idx, 10);

    if (action === 'up' && idx > 0) {
      const temp = imageList[idx];
      imageList[idx] = imageList[idx - 1];
      imageList[idx - 1] = temp;
      renderGrid();
    } else if (action === 'down' && idx < imageList.length - 1) {
      const temp = imageList[idx];
      imageList[idx] = imageList[idx + 1];
      imageList[idx + 1] = temp;
      renderGrid();
    } else if (action === 'del') {
      imageList.splice(idx, 1);
      renderGrid();
      Utils.showToast('已移除該張圖片', 'info');
    }
  });

  btnClearImages.addEventListener('click', () => {
    imageList = [];
    fileInput.value = '';
    renderGrid();
    Utils.showToast('已清空圖片清單', 'info');
  });

  /* ================================================================
     PDF 合成
     ================================================================ */

  async function convertToStandardBytes(item) {
    // 若為 PNG 或 JPEG 直接傳回 ArrayBuffer；若為 WEBP 或其他轉為 JPEG
    const type = item.file.type;
    if (type === 'image/jpeg' || type === 'image/jpg') {
      const buf = await item.file.arrayBuffer();
      return { bytes: buf, isJpg: true };
    }
    if (type === 'image/png') {
      const buf = await item.file.arrayBuffer();
      return { bytes: buf, isJpg: false };
    }

    // 透過 Canvas 轉為 JPEG
    const canvas = document.createElement('canvas');
    canvas.width = item.width;
    canvas.height = item.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, item.width, item.height);

    const img = new Image();
    img.src = item.dataUrl;
    await new Promise((res) => { img.onload = res; });
    ctx.drawImage(img, 0, 0);

    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.95));
    const buf = await blob.arrayBuffer();
    return { bytes: buf, isJpg: true };
  }

  btnGeneratePdf.addEventListener('click', async () => {
    if (imageList.length === 0) return;

    if (typeof PDFLib === 'undefined') {
      Utils.showToast('PDF 引擎尚未載入完成，請稍候重試', 'error');
      return;
    }

    btnGeneratePdf.disabled = true;
    btnGeneratePdf.textContent = '📄 正在合成 PDF，請稍候…';

    try {
      const { PDFDocument } = PDFLib;
      const pdfDoc = await PDFDocument.create();

      const sizeMode = pageSize.value;
      const marginMode = pageMargin.value;

      // 72 points per inch; A4 = 595.28 x 841.89 points
      const A4_W = 595.28;
      const A4_H = 841.89;

      let marginPts = 0;
      if (marginMode === 'small') marginPts = 28.35; // 10mm
      else if (marginMode === 'normal') marginPts = 56.7; // 20mm

      for (const item of imageList) {
        const { bytes, isJpg } = await convertToStandardBytes(item);
        const embeddedImg = isJpg ? await pdfDoc.embedJpg(bytes) : await pdfDoc.embedPng(bytes);

        let pWidth = A4_W;
        let pHeight = A4_H;

        if (sizeMode === 'a4-landscape') {
          pWidth = A4_H;
          pHeight = A4_W;
        } else if (sizeMode === 'fit') {
          pWidth = item.width;
          pHeight = item.height;
          marginPts = 0;
        }

        const page = pdfDoc.addPage([pWidth, pHeight]);

        // 計算圖片縮放與居中
        const availW = Math.max(10, pWidth - marginPts * 2);
        const availH = Math.max(10, pHeight - marginPts * 2);

        const imgRatio = item.width / item.height;
        const availRatio = availW / availH;

        let drawW = availW;
        let drawH = availH;

        if (imgRatio > availRatio) {
          drawW = availW;
          drawH = availW / imgRatio;
        } else {
          drawH = availH;
          drawW = availH * imgRatio;
        }

        const drawX = (pWidth - drawW) / 2;
        const drawY = (pHeight - drawH) / 2;

        page.drawImage(embeddedImg, {
          x: drawX,
          y: drawY,
          width: drawW,
          height: drawH,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      let fname = (pdfFilename.value || 'images.pdf').trim();
      if (!fname.endsWith('.pdf')) fname += '.pdf';

      Utils.downloadBlob(blob, fname);
      Utils.showToast(`已成功合成並下載 ${fname}`, 'success');
    } catch (err) {
      console.error(err);
      Utils.showToast(`合成失敗：${err.message}`, 'error');
    } finally {
      btnGeneratePdf.disabled = false;
      btnGeneratePdf.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        立即合成並下載 PDF
      `;
    }
  });
});
