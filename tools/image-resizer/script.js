/**
 * Image Resizer — 工具邏輯
 * 功能：提供高畫質圖片尺寸調整、等比例維持與常用尺寸預設
 */

document.addEventListener('DOMContentLoaded', () => {
  // 記錄使用紀錄
  try { StorageManager?.addRecent?.('image-resizer'); } catch (_) {}

  // DOM 元素
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const resizeOptions = document.getElementById('resize-options');
  const previewSection = document.getElementById('preview-section');
  const inputWidth = document.getElementById('input-width');
  const inputHeight = document.getElementById('input-height');
  const optLockAspect = document.getElementById('opt-lock-aspect');
  const dimBadge = document.getElementById('dim-badge');
  const resizeCanvas = document.getElementById('resize-canvas');
  const btnDownload = document.getElementById('btn-download');
  const btnReupload = document.getElementById('btn-reupload');
  const presetButtons = document.querySelectorAll('.btn-preset');
  const presetFixedButtons = document.querySelectorAll('.btn-preset-fixed');

  let currentFile = null;
  let loadedImage = null;
  let originalWidth = 0;
  let originalHeight = 0;
  let aspectRatio = 1;

  /* ================================================================
     檔案選取與載入
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
    if (e.dataTransfer.files.length > 0) {
      loadFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      loadFile(fileInput.files[0]);
    }
  });

  btnReupload.addEventListener('click', () => {
    fileInput.value = '';
    fileInput.click();
  });

  function loadFile(file) {
    if (!file.type.startsWith('image/')) {
      Utils.showToast('請選取有效的圖片檔案', 'error');
      return;
    }

    currentFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        loadedImage = img;
        originalWidth = img.naturalWidth;
        originalHeight = img.naturalHeight;
        aspectRatio = originalWidth / originalHeight;

        inputWidth.value = originalWidth;
        inputHeight.value = originalHeight;

        resizeOptions.style.display = 'block';
        previewSection.style.display = 'block';

        renderCanvas();
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  /* ================================================================
     尺寸聯動與渲染
     ================================================================ */

  inputWidth.addEventListener('input', () => {
    const w = parseInt(inputWidth.value, 10);
    if (!w || w <= 0) return;

    if (optLockAspect.checked) {
      const h = Math.round(w / aspectRatio);
      inputHeight.value = h;
    }
    debouncedRender();
  });

  inputHeight.addEventListener('input', () => {
    const h = parseInt(inputHeight.value, 10);
    if (!h || h <= 0) return;

    if (optLockAspect.checked) {
      const w = Math.round(h * aspectRatio);
      inputWidth.value = w;
    }
    debouncedRender();
  });

  // 百分比預設尺寸
  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!loadedImage) return;
      const scale = parseFloat(btn.dataset.scale);
      inputWidth.value = Math.round(originalWidth * scale);
      inputHeight.value = Math.round(originalHeight * scale);
      renderCanvas();
    });
  });

  // 固定解析度預設
  presetFixedButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!loadedImage) return;
      inputWidth.value = btn.dataset.w;
      inputHeight.value = btn.dataset.h;
      renderCanvas();
    });
  });

  const debouncedRender = Utils.debounce(renderCanvas, 120);

  function renderCanvas() {
    if (!loadedImage) return;

    const w = parseInt(inputWidth.value, 10);
    const h = parseInt(inputHeight.value, 10);

    if (!w || !h || w <= 0 || h <= 0) return;

    resizeCanvas.width = w;
    resizeCanvas.height = h;
    const ctx = resizeCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(loadedImage, 0, 0, w, h);

    dimBadge.textContent = `原始：${originalWidth}×${originalHeight} ➔ 新尺寸：${w}×${h} px`;
  }

  /* ================================================================
     下載按鈕
     ================================================================ */

  btnDownload.addEventListener('click', () => {
    if (!loadedImage || !currentFile) return;

    const format = currentFile.type || 'image/png';
    const ext = format === 'image/jpeg' ? '.jpg' : format === 'image/webp' ? '.webp' : '.png';

    const baseName = currentFile.name.replace(/\.[^/.]+$/, '');
    const w = inputWidth.value;
    const h = inputHeight.value;
    const filename = `${baseName}_${w}x${h}${ext}`;

    resizeCanvas.toBlob((blob) => {
      if (!blob) {
        Utils.showToast('圖片匯出失敗', 'error');
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      Utils.showToast(`已成功下載 ${filename}`, 'success');
    }, format);
  });
});
