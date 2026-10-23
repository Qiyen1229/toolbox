/**
 * Image Converter — 工具邏輯
 * 功能：提供 PNG、JPG、WEBP 格式轉換
 */

document.addEventListener('DOMContentLoaded', () => {
  // 記錄使用紀錄
  try { StorageManager?.addRecent?.('image-converter'); } catch (_) {}

  // DOM 元素
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const convertOptions = document.getElementById('convert-options');
  const resultSection = document.getElementById('result-section');
  const targetFormat = document.getElementById('target-format');
  const qualityWrapper = document.getElementById('quality-wrapper');
  const convQuality = document.getElementById('conv-quality');
  const convQualityVal = document.getElementById('conv-quality-val');
  const btnDoConvert = document.getElementById('btn-do-convert');
  const imgOrig = document.getElementById('img-orig');
  const imgConverted = document.getElementById('img-converted');
  const infoOrig = document.getElementById('info-orig');
  const infoConverted = document.getElementById('info-converted');
  const btnDownload = document.getElementById('btn-download');
  const btnReupload = document.getElementById('btn-reupload');

  let currentFile = null;
  let loadedImage = null;
  let convertedBlob = null;

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
    if (!file.type.startsWith('image/') && !file.name.endsWith('.svg')) {
      Utils.showToast('請選取圖片檔案', 'error');
      return;
    }

    currentFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        loadedImage = img;
        imgOrig.src = e.target.result;
        infoOrig.textContent = `格式：${file.type || 'image'} · ${img.naturalWidth}×${img.naturalHeight} · ${Utils.formatFileSize(file.size)}`;

        convertOptions.style.display = 'block';
        updateQualityVisibility();
        doConvert();
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  const icoSizeWrapper = document.getElementById('ico-size-wrapper');
  const icoSize = document.getElementById('ico-size');

  function updateQualityVisibility() {
    const fmt = targetFormat.value;
    qualityWrapper.style.display = (fmt === 'image/jpeg' || fmt === 'image/webp' || fmt === 'image/avif') ? 'block' : 'none';
    if (icoSizeWrapper) {
      icoSizeWrapper.style.display = fmt === 'image/x-icon' ? 'block' : 'none';
    }
  }

  targetFormat.addEventListener('change', () => {
    updateQualityVisibility();
    doConvert();
  });

  if (icoSize) {
    icoSize.addEventListener('change', doConvert);
  }

  convQuality.addEventListener('input', () => {
    convQualityVal.textContent = `${convQuality.value}%`;
  });

  convQuality.addEventListener('change', doConvert);
  btnDoConvert.addEventListener('click', doConvert);

  /* ================================================================
     BMP 與 ICO 編碼函式 (純前端原生支援)
     ================================================================ */

  function createBmpBlob(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const extraBytes = (width * 3) % 4;
    const padding = extraBytes ? (4 - extraBytes) : 0;
    const rowBytes = width * 3 + padding;
    const imageSize = rowBytes * height;
    const headerSize = 54;
    const fileSize = headerSize + imageSize;

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    // BITMAPFILEHEADER
    view.setUint16(0, 0x4D42, false); // 'BM'
    view.setUint32(2, fileSize, true);
    view.setUint32(6, 0, true);
    view.setUint32(10, headerSize, true);

    // BITMAPINFOHEADER
    view.setUint32(14, 40, true);
    view.setInt32(18, width, true);
    view.setInt32(22, height, true);
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true);
    view.setUint32(30, 0, true);
    view.setUint32(34, imageSize, true);
    view.setInt32(38, 2835, true);
    view.setInt32(42, 2835, true);
    view.setUint32(46, 0, true);
    view.setUint32(50, 0, true);

    const bytes = new Uint8Array(buffer);
    let offset = headerSize;

    for (let y = height - 1; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        bytes[offset++] = data[idx + 2]; // Blue
        bytes[offset++] = data[idx + 1]; // Green
        bytes[offset++] = data[idx];     // Red
      }
      for (let p = 0; p < padding; p++) {
        bytes[offset++] = 0;
      }
    }

    return new Blob([buffer], { type: 'image/bmp' });
  }

  async function createIcoBlob(canvas) {
    const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    const pngBuffer = await pngBlob.arrayBuffer();
    const pngSize = pngBuffer.byteLength;

    const w = canvas.width >= 256 ? 0 : canvas.width;
    const h = canvas.height >= 256 ? 0 : canvas.height;

    const icoHeaderSize = 6;
    const icoDirEntrySize = 16;
    const totalSize = icoHeaderSize + icoDirEntrySize + pngSize;

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);

    // ICONDIR
    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true); // ICO format
    view.setUint16(4, 1, true); // 1 icon

    // ICONDIRENTRY
    view.setUint8(6, w);
    view.setUint8(7, h);
    view.setUint8(8, 0);
    view.setUint8(9, 0);
    view.setUint16(10, 1, true);
    view.setUint16(12, 32, true);
    view.setUint32(14, pngSize, true);
    view.setUint32(18, icoHeaderSize + icoDirEntrySize, true);

    new Uint8Array(buffer, icoHeaderSize + icoDirEntrySize).set(new Uint8Array(pngBuffer));
    return new Blob([buffer], { type: 'image/x-icon' });
  }

  /* ================================================================
     格式轉換邏輯
     ================================================================ */

  async function doConvert() {
    if (!loadedImage) return;

    const format = targetFormat.value;
    const quality = parseInt(convQuality.value, 10) / 100;
    let targetW = loadedImage.naturalWidth;
    let targetH = loadedImage.naturalHeight;

    // ICO 尺寸調整
    if (format === 'image/x-icon' && icoSize && icoSize.value !== 'original') {
      const dim = parseInt(icoSize.value, 10) || 32;
      targetW = dim;
      targetH = dim;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 若輸出為 JPG 或 BMP，填滿白底避免原本透明區域轉黑
    if (format === 'image/jpeg' || format === 'image/bmp') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetW, targetH);
    }

    ctx.drawImage(loadedImage, 0, 0, targetW, targetH);

    try {
      let blob = null;

      if (format === 'image/bmp') {
        blob = createBmpBlob(canvas);
      } else if (format === 'image/x-icon') {
        blob = await createIcoBlob(canvas);
      } else {
        blob = await new Promise((resolve) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else canvas.toBlob(resolve, 'image/png'); // fallback
          }, format, quality);
        });
      }

      if (!blob) {
        Utils.showToast('格式轉換失敗', 'error');
        return;
      }

      convertedBlob = blob;
      imgConverted.src = URL.createObjectURL(blob);
      let fmtLabel = 'PNG';
      if (format === 'image/jpeg') fmtLabel = 'JPG';
      else if (format === 'image/webp') fmtLabel = 'WEBP';
      else if (format === 'image/avif') fmtLabel = 'AVIF';
      else if (format === 'image/bmp') fmtLabel = 'BMP';
      else if (format === 'image/x-icon') fmtLabel = 'ICO';
      else if (format === 'image/gif') fmtLabel = 'GIF';

      infoConverted.textContent = `格式：${fmtLabel} · ${targetW}×${targetH} · ${Utils.formatFileSize(blob.size)}`;
      resultSection.style.display = 'block';
    } catch (err) {
      console.error('Conversion error:', err);
      Utils.showToast(`轉換失敗：${err.message}`, 'error');
    }
  }

  /* ================================================================
     下載按鈕
     ================================================================ */

  btnDownload.addEventListener('click', () => {
    if (!convertedBlob || !currentFile) return;

    let ext = '.png';
    const fmt = targetFormat.value;
    if (fmt === 'image/jpeg') ext = '.jpg';
    else if (fmt === 'image/webp') ext = '.webp';
    else if (fmt === 'image/avif') ext = '.avif';
    else if (fmt === 'image/bmp') ext = '.bmp';
    else if (fmt === 'image/x-icon') ext = '.ico';
    else if (fmt === 'image/gif') ext = '.gif';

    const baseName = currentFile.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}-converted${ext}`;

    const url = URL.createObjectURL(convertedBlob);
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
