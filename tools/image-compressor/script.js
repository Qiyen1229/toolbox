/**
 * Image Compressor — 工具邏輯
 * 功能：使用 HTML5 Canvas API 本地壓縮圖片，支援品質調節、自訂格式與最大尺寸限制
 */

document.addEventListener('DOMContentLoaded', () => {
  // 記錄使用紀錄
  try { StorageManager?.addRecent?.('image-compressor'); } catch (_) {}

  // DOM 元素
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const optionsSection = document.getElementById('options-section');
  const compareSection = document.getElementById('compare-section');
  const qualityRange = document.getElementById('quality-range');
  const qualityValue = document.getElementById('quality-value');
  const outputFormat = document.getElementById('output-format');
  const maxDimension = document.getElementById('max-dimension');
  const previewOriginal = document.getElementById('preview-original');
  const previewCompressed = document.getElementById('preview-compressed');
  const infoOriginal = document.getElementById('info-original');
  const infoCompressed = document.getElementById('info-compressed');
  const savingsBadge = document.getElementById('savings-badge');
  const btnDownload = document.getElementById('btn-download');
  const btnReupload = document.getElementById('btn-reupload');

  /** 目前載入的原始圖片物件與檔案資訊 */
  let currentFile = null;
  let loadedImage = null;
  let compressedBlob = null;

  /* ================================================================
     拖曳與檔案選取處理
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
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelected(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleFileSelected(fileInput.files[0]);
    }
  });

  btnReupload.addEventListener('click', () => {
    fileInput.value = '';
    fileInput.click();
  });

  /**
   * 處理使用者選擇的圖片檔案
   * @param {File} file
   */
  function handleFileSelected(file) {
    if (!file.type.startsWith('image/')) {
      Utils.showToast('請選取有效的圖片檔案 (JPG, PNG, WEBP)', 'error');
      return;
    }

    currentFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        loadedImage = img;
        previewOriginal.src = e.target.result;
        infoOriginal.textContent = `解析度：${img.naturalWidth} × ${img.naturalHeight} · 大小：${Utils.formatFileSize(file.size)}`;

        optionsSection.style.display = 'block';
        compareSection.style.display = 'block';

        // 執行初次壓縮
        compressImage();
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  /* ================================================================
     Canvas 圖片壓縮核心邏輯
     ================================================================ */

  /**
   * 根據設定進行 Canvas 縮放與壓縮輸出
   */
  function compressImage() {
    if (!loadedImage) return;

    const quality = parseInt(qualityRange.value, 10) / 100;
    const format = outputFormat.value;
    const maxDimSetting = maxDimension.value;

    let targetWidth = loadedImage.naturalWidth;
    let targetHeight = loadedImage.naturalHeight;

    // 計算等比例縮放尺寸
    if (maxDimSetting !== 'original') {
      const maxLimit = parseInt(maxDimSetting, 10);
      if (targetWidth > maxLimit || targetHeight > maxLimit) {
        if (targetWidth > targetHeight) {
          targetHeight = Math.round((targetHeight * maxLimit) / targetWidth);
          targetWidth = maxLimit;
        } else {
          targetWidth = Math.round((targetWidth * maxLimit) / targetHeight);
          targetHeight = maxLimit;
        }
      }
    }

    // 建立 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    // 若輸出為 JPEG 且原始為透明圖，填入白色背景避免變黑底
    if (format === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    ctx.drawImage(loadedImage, 0, 0, targetWidth, targetHeight);

    // 輸出 Blob
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          Utils.showToast('壓縮圖片時發生錯誤', 'error');
          return;
        }

        compressedBlob = blob;
        const blobUrl = URL.createObjectURL(blob);
        previewCompressed.src = blobUrl;

        // 計算節省百分比
        const origSize = currentFile.size;
        const compSize = blob.size;
        const savings = Math.max(0, ((origSize - compSize) / origSize) * 100);

        infoCompressed.textContent = `解析度：${targetWidth} × ${targetHeight} · 大小：${Utils.formatFileSize(compSize)}`;

        if (compSize < origSize) {
          savingsBadge.textContent = `節省 ${savings.toFixed(1)}%`;
          savingsBadge.style.background = 'var(--color-success-light)';
          savingsBadge.style.color = 'var(--color-success)';
        } else {
          savingsBadge.textContent = `體積相近 (+${Math.abs(savings).toFixed(1)}%)`;
          savingsBadge.style.background = 'var(--color-warning-light)';
          savingsBadge.style.color = 'var(--color-warning)';
        }
      },
      format,
      quality
    );
  }

  /* ================================================================
     事件綁定
     ================================================================ */

  // 滑桿數值顯示與防抖即時壓縮
  const debouncedCompress = Utils.debounce(compressImage, 150);

  qualityRange.addEventListener('input', () => {
    qualityValue.textContent = `${qualityRange.value}%`;
    debouncedCompress();
  });

  outputFormat.addEventListener('change', compressImage);
  maxDimension.addEventListener('change', compressImage);

  // 下載按鈕
  btnDownload.addEventListener('click', () => {
    if (!compressedBlob || !currentFile) return;

    // 決定副檔名
    let ext = '.jpg';
    if (outputFormat.value === 'image/webp') ext = '.webp';
    if (outputFormat.value === 'image/png') ext = '.png';

    const baseName = currentFile.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}-compressed${ext}`;

    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    Utils.showToast(`已成功下載 ${filename}`, 'success');
  });
});
