/**
 * Image Watermark — 工具邏輯
 * 功能：全圖斜向重複平鋪防盜印或角落單一浮水印，自訂顏色透明度與字體大小
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('image-watermark'); } catch (_) {}

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const optionsSection = document.getElementById('options-section');
  const previewSection = document.getElementById('preview-section');
  const wmCanvas = document.getElementById('wm-canvas');
  const wmText = document.getElementById('wm-text');
  const wmMode = document.getElementById('wm-mode');
  const wmOpacity = document.getElementById('wm-opacity');
  const labelOpacity = document.getElementById('label-opacity');
  const wmColor = document.getElementById('wm-color');
  const wmSize = document.getElementById('wm-size');
  const btnDownloadWm = document.getElementById('btn-download-wm');

  let currentFile = null;
  let loadedImage = null;

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
        optionsSection.style.display = 'block';
        previewSection.style.display = 'block';
        drawWatermark();
        Utils.showToast('圖片載入成功', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function drawWatermark() {
    if (!loadedImage) return;

    const w = loadedImage.naturalWidth;
    const h = loadedImage.naturalHeight;

    wmCanvas.width = w;
    wmCanvas.height = h;
    const ctx = wmCanvas.getContext('2d');

    // 繪製原圖
    ctx.drawImage(loadedImage, 0, 0, w, h);

    const text = wmText.value.trim();
    if (!text) return;

    const opacity = parseInt(wmOpacity.value, 10) / 100;
    const color = wmColor.value;
    const scaleFactor = parseFloat(wmSize.value) || 0.045;
    const fontSize = Math.max(16, Math.round(w * scaleFactor));
    const mode = wmMode.value;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;

    if (mode === 'tile') {
      // 斜向平鋪防盜印
      const angle = -28 * (Math.PI / 180);
      const textMetrics = ctx.measureText(text);
      const stepX = textMetrics.width + fontSize * 3;
      const stepY = fontSize * 5;

      // 擴大旋轉畫布覆蓋範圍
      const diag = Math.sqrt(w * w + h * h);
      ctx.translate(w / 2, h / 2);
      ctx.rotate(angle);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let y = -diag; y < diag; y += stepY) {
        for (let x = -diag; x < diag; x += stepX) {
          ctx.fillText(text, x, y);
        }
      }
    } else {
      // 單點放置
      const padding = Math.max(20, Math.round(w * 0.03));

      if (mode === 'bottom-right') {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(text, w - padding, h - padding);
      } else if (mode === 'bottom-left') {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(text, padding, h - padding);
      } else if (mode === 'top-right') {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(text, w - padding, padding);
      } else if (mode === 'center') {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, w / 2, h / 2);
      }
    }

    ctx.restore();
  }

  // 監聽所有參數輸入
  wmText.addEventListener('input', drawWatermark);
  wmMode.addEventListener('change', drawWatermark);
  wmColor.addEventListener('change', drawWatermark);
  wmSize.addEventListener('change', drawWatermark);
  wmOpacity.addEventListener('input', () => {
    labelOpacity.textContent = `${wmOpacity.value}%`;
    drawWatermark();
  });

  btnDownloadWm.addEventListener('click', () => {
    if (!wmCanvas || !currentFile) return;

    wmCanvas.toBlob((blob) => {
      if (blob) {
        const base = currentFile.name.replace(/\.[^/.]+$/, '');
        Utils.downloadBlob(blob, `${base}_watermarked.png`);
        Utils.showToast('已成功下載加水印圖片！', 'success');
      }
    }, 'image/png');
  });
});
