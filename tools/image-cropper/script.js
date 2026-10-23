/**
 * Image Cropper — 工具邏輯
 * 功能：互動式畫布拖曳選取、自訂比例與圓形頭像裁切匯出
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('image-cropper'); } catch (_) {}

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const cropperSection = document.getElementById('cropper-section');
  const cropCanvas = document.getElementById('crop-canvas');
  const resultCanvas = document.getElementById('result-canvas');
  const cropDimBadge = document.getElementById('crop-dim-badge');
  const btnDownloadCrop = document.getElementById('btn-download-crop');
  const ratioButtons = document.querySelectorAll('.btn-ratio');

  let currentFile = null;
  let loadedImage = null;
  let currentRatio = 'free'; // 'free' | '1:1' | '4:3' | '16:9' | 'circle'

  /** 裁切框在原始圖片中的座標 (px) */
  let cropRect = { x: 0, y: 0, w: 100, h: 100 };
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };

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
      loadImage(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      loadImage(fileInput.files[0]);
    }
  });

  function loadImage(file) {
    if (!file.type.startsWith('image/')) {
      Utils.showToast('請選取圖片檔案', 'error');
      return;
    }

    currentFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        loadedImage = img;
        cropperSection.style.display = 'block';

        // 初始化裁切框為圖片中央 80%
        const initW = Math.round(img.naturalWidth * 0.7);
        const initH = currentRatio === '1:1' || currentRatio === 'circle' ? initW : Math.round(img.naturalHeight * 0.7);
        cropRect = {
          x: Math.round((img.naturalWidth - initW) / 2),
          y: Math.round((img.naturalHeight - initH) / 2),
          w: initW,
          h: initH,
        };

        initCanvasSize();
        drawCropper();
        updateResult();
        Utils.showToast('圖片已載入，可拖曳自訂裁切範圍', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function initCanvasSize() {
    cropCanvas.width = loadedImage.naturalWidth;
    cropCanvas.height = loadedImage.naturalHeight;
  }

  /* ================================================================
     畫布互動繪製
     ================================================================ */

  function drawCropper() {
    if (!loadedImage) return;
    const ctx = cropCanvas.getContext('2d');
    const w = cropCanvas.width;
    const h = cropCanvas.height;

    // 繪製原圖
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(loadedImage, 0, 0);

    // 繪製半透明遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, w, h);

    // 挖出裁切區域
    ctx.save();
    if (currentRatio === 'circle') {
      ctx.beginPath();
      const r = Math.min(cropRect.w, cropRect.h) / 2;
      ctx.arc(cropRect.x + r, cropRect.y + r, r, 0, Math.PI * 2);
      ctx.clip();
    } else {
      ctx.beginPath();
      ctx.rect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
      ctx.clip();
    }

    // 重繪清晰原圖
    ctx.drawImage(loadedImage, 0, 0);
    ctx.restore();

    // 繪製裁切框白邊
    ctx.lineWidth = Math.max(2, Math.round(w / 350));
    ctx.strokeStyle = '#ffffff';
    ctx.setLineDash([6, 4]);

    if (currentRatio === 'circle') {
      ctx.beginPath();
      const r = Math.min(cropRect.w, cropRect.h) / 2;
      ctx.arc(cropRect.x + r, cropRect.y + r, r, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);

      // 三分法則九宮格線
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(cropRect.x + cropRect.w / 3, cropRect.y);
      ctx.lineTo(cropRect.x + cropRect.w / 3, cropRect.y + cropRect.h);
      ctx.moveTo(cropRect.x + (cropRect.w * 2) / 3, cropRect.y);
      ctx.lineTo(cropRect.x + (cropRect.w * 2) / 3, cropRect.y + cropRect.h);
      ctx.moveTo(cropRect.x, cropRect.y + cropRect.h / 3);
      ctx.lineTo(cropRect.x + cropRect.w, cropRect.y + cropRect.h / 3);
      ctx.moveTo(cropRect.x, cropRect.y + (cropRect.h * 2) / 3);
      ctx.lineTo(cropRect.x + cropRect.w, cropRect.y + (cropRect.h * 2) / 3);
      ctx.stroke();
    }
  }

  function updateResult() {
    if (!loadedImage) return;
    const finalW = Math.max(10, Math.round(cropRect.w));
    const finalH = Math.max(10, Math.round(cropRect.h));

    resultCanvas.width = finalW;
    resultCanvas.height = finalH;
    const ctx = resultCanvas.getContext('2d');
    ctx.clearRect(0, 0, finalW, finalH);

    if (currentRatio === 'circle') {
      ctx.save();
      ctx.beginPath();
      const r = Math.min(finalW, finalH) / 2;
      ctx.arc(finalW / 2, finalH / 2, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(loadedImage, cropRect.x, cropRect.y, cropRect.w, cropRect.h, 0, 0, finalW, finalH);
      ctx.restore();
    } else {
      ctx.drawImage(loadedImage, cropRect.x, cropRect.y, cropRect.w, cropRect.h, 0, 0, finalW, finalH);
    }

    cropDimBadge.textContent = `尺寸：${finalW} × ${finalH} px`;
  }

  /* ================================================================
     滑鼠/觸控拖曳事件
     ================================================================ */

  function getCanvasCoords(e) {
    const rect = cropCanvas.getBoundingClientRect();
    const scaleX = cropCanvas.width / rect.width;
    const scaleY = cropCanvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  const startDrag = (e) => {
    if (!loadedImage) return;
    isDragging = true;
    dragStart = getCanvasCoords(e);
  };

  const moveDrag = (e) => {
    if (!isDragging) return;
    const current = getCanvasCoords(e);
    let x = Math.min(dragStart.x, current.x);
    let y = Math.min(dragStart.y, current.y);
    let w = Math.abs(current.x - dragStart.x);
    let h = Math.abs(current.y - dragStart.y);

    // 比例約束
    if (currentRatio === '1:1' || currentRatio === 'circle') {
      const size = Math.min(w, h);
      w = size;
      h = size;
    } else if (currentRatio === '4:3') {
      h = Math.round((w * 3) / 4);
    } else if (currentRatio === '16:9') {
      h = Math.round((w * 9) / 16);
    }

    // 邊界防護
    x = Math.max(0, Math.min(x, cropCanvas.width - 20));
    y = Math.max(0, Math.min(y, cropCanvas.height - 20));
    w = Math.min(w, cropCanvas.width - x);
    h = Math.min(h, cropCanvas.height - y);

    if (w > 20 && h > 20) {
      cropRect = { x, y, w, h };
      drawCropper();
      updateResult();
    }
  };

  const endDrag = () => {
    isDragging = false;
  };

  cropCanvas.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', moveDrag);
  window.addEventListener('mouseup', endDrag);

  cropCanvas.addEventListener('touchstart', startDrag, { passive: true });
  window.addEventListener('touchmove', moveDrag, { passive: true });
  window.addEventListener('touchend', endDrag);

  /* ================================================================
     比例切換按鈕
     ================================================================ */

  ratioButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      ratioButtons.forEach((b) => {
        b.classList.remove('btn--primary');
        b.classList.add('btn--secondary');
      });
      btn.classList.remove('btn--secondary');
      btn.classList.add('btn--primary');

      currentRatio = btn.dataset.ratio;

      if (loadedImage) {
        let w = cropRect.w;
        let h = cropRect.h;

        if (currentRatio === '1:1' || currentRatio === 'circle') {
          const s = Math.min(w, h);
          cropRect.w = s;
          cropRect.h = s;
        } else if (currentRatio === '4:3') {
          cropRect.h = Math.round((w * 3) / 4);
        } else if (currentRatio === '16:9') {
          cropRect.h = Math.round((w * 9) / 16);
        }

        drawCropper();
        updateResult();
      }
    });
  });

  /* ================================================================
     下載
     ================================================================ */

  btnDownloadCrop.addEventListener('click', () => {
    if (!resultCanvas) return;
    resultCanvas.toBlob((blob) => {
      if (blob) {
        const base = currentFile ? currentFile.name.replace(/\.[^/.]+$/, '') : 'cropped';
        Utils.downloadBlob(blob, `${base}_cropped.png`);
        Utils.showToast('已成功下載裁切圖片！', 'success');
      }
    }, 'image/png');
  });
});
