/**
 * Favicon Generator — 工具邏輯
 * 功能：生成全套網頁 Favicon (16/32/48/180/192/512)、.ico 圖示與打包 ZIP
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('favicon-generator'); } catch (_) {}

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const resultSection = document.getElementById('result-section');
  const previewCards = document.getElementById('preview-cards');
  const outputHtmlTags = document.getElementById('output-html-tags');
  const btnDownloadZip = document.getElementById('btn-download-zip');
  const btnCopyHtmlTags = document.getElementById('btn-copy-html-tags');

  const SIZES = [
    { name: 'favicon-16x16.png', w: 16, h: 16, label: '16 × 16 瀏覽器標籤' },
    { name: 'favicon-32x32.png', w: 32, h: 32, label: '32 × 32 標準網頁' },
    { name: 'favicon-48x48.png', w: 48, h: 48, label: '48 × 48 桌面磚' },
    { name: 'apple-touch-icon.png', w: 180, h: 180, label: '180 × 180 Apple iOS' },
    { name: 'android-chrome-192x192.png', w: 192, h: 192, label: '192 × 192 Android PWA' },
    { name: 'android-chrome-512x512.png', w: 512, h: 512, label: '512 × 512 PWA 啟動圖' },
  ];

  let loadedImage = null;
  /** 快取的各尺寸 Blob 物件：Map<string, Blob> */
  const generatedBlobs = new Map();

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
      handleImage(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      handleImage(fileInput.files[0]);
    }
  });

  function handleImage(file) {
    if (!file.type.startsWith('image/')) {
      Utils.showToast('請選取圖片檔案', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        loadedImage = img;
        generateAllIcons();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function generateAllIcons() {
    if (!loadedImage) return;
    generatedBlobs.clear();
    previewCards.innerHTML = '';
    resultSection.style.display = 'block';

    // 依序渲染各 PNG 尺寸
    for (const item of SIZES) {
      const canvas = document.createElement('canvas');
      canvas.width = item.w;
      canvas.height = item.h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 等比例居中縮放繪製
      const minDim = Math.min(loadedImage.naturalWidth, loadedImage.naturalHeight);
      const srcX = (loadedImage.naturalWidth - minDim) / 2;
      const srcY = (loadedImage.naturalHeight - minDim) / 2;
      ctx.drawImage(loadedImage, srcX, srcY, minDim, minDim, 0, 0, item.w, item.h);

      const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
      generatedBlobs.set(item.name, blob);

      const card = document.createElement('div');
      card.style.cssText = 'background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); text-align: center; display: flex; flex-direction: column; justify-content: space-between;';
      card.innerHTML = `
        <div>
          <div style="height: 64px; display: flex; align-items: center; justify-content: center; background: var(--color-bg); border-radius: var(--radius-sm); margin-bottom: 8px;">
            <img src="${URL.createObjectURL(blob)}" style="width:${Math.min(item.w, 48)}px; height:${Math.min(item.h, 48)}px; object-fit: contain;" alt="${item.name}">
          </div>
          <div style="font-weight: 700; font-size: 0.8125rem;">${item.w} × ${item.h}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-tertiary); margin-bottom: 8px;">${item.label}</div>
        </div>
        <button class="btn btn--sm btn--secondary btn-dl-single" data-name="${item.name}">下載</button>
      `;
      previewCards.appendChild(card);
    }

    // 額外生成標準 favicon.ico (包含 32x32)
    const icoBlob = await createIcoFrom32(generatedBlobs.get('favicon-32x32.png'));
    if (icoBlob) {
      generatedBlobs.set('favicon.ico', icoBlob);
      const icoCard = document.createElement('div');
      icoCard.style.cssText = 'background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); text-align: center; display: flex; flex-direction: column; justify-content: space-between;';
      icoCard.innerHTML = `
        <div>
          <div style="height: 64px; display: flex; align-items: center; justify-content: center; background: var(--color-bg); border-radius: var(--radius-sm); margin-bottom: 8px;">
            <img src="${URL.createObjectURL(generatedBlobs.get('favicon-32x32.png'))}" style="width: 32px; height: 32px; object-fit: contain;" alt="favicon.ico">
          </div>
          <div style="font-weight: 700; font-size: 0.8125rem; color: var(--color-accent);">favicon.ico</div>
          <div style="font-size: 0.75rem; color: var(--color-text-tertiary); margin-bottom: 8px;">標準網站根目錄圖示</div>
        </div>
        <button class="btn btn--sm btn--primary btn-dl-single" data-name="favicon.ico">下載 .ico</button>
      `;
      previewCards.prepend(icoCard);
    }

    // 生成標準 HTML 標籤
    outputHtmlTags.value = `<!-- Favicon & Touch Icons -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#ffffff">`;

    Utils.showToast('已成功生成全套 Favicon 圖示！', 'success');
  }

  // 封裝 ICO
  async function createIcoFrom32(pngBlob) {
    if (!pngBlob) return null;
    const pngBuffer = await pngBlob.arrayBuffer();
    const pngSize = pngBuffer.byteLength;
    const totalSize = 6 + 16 + pngSize;

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);

    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true); // ICO
    view.setUint16(4, 1, true); // 1 icon

    view.setUint8(6, 32);  // Width
    view.setUint8(7, 32);  // Height
    view.setUint8(8, 0);   // Color count
    view.setUint8(9, 0);   // Reserved
    view.setUint16(10, 1, true);
    view.setUint16(12, 32, true); // 32 bits
    view.setUint32(14, pngSize, true);
    view.setUint32(18, 22, true); // Offset 6 + 16

    new Uint8Array(buffer, 22).set(new Uint8Array(pngBuffer));
    return new Blob([buffer], { type: 'image/x-icon' });
  }

  // 單獨下載
  previewCards.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-dl-single');
    if (!btn) return;
    const name = btn.dataset.name;
    const blob = generatedBlobs.get(name);
    if (blob) {
      Utils.downloadBlob(blob, name);
      Utils.showToast(`已下載 ${name}`, 'success');
    }
  });

  // 一鍵下載 ZIP
  btnDownloadZip.addEventListener('click', async () => {
    if (generatedBlobs.size === 0) return;

    if (typeof JSZip === 'undefined') {
      Utils.showToast('ZIP 模組尚未就緒，請稍候重試', 'error');
      return;
    }

    const zip = new JSZip();
    btnDownloadZip.disabled = true;
    btnDownloadZip.textContent = '📦 正在打包 ZIP…';

    try {
      for (const [name, blob] of generatedBlobs.entries()) {
        zip.file(name, blob);
      }
      // 附帶一份 HTML 引用說明檔
      zip.file('html-head-tags.html', outputHtmlTags.value);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      Utils.downloadBlob(zipBlob, 'favicon_package.zip');
      Utils.showToast('已成功下載 Favicon 圖示完整壓縮包！', 'success');
    } catch (err) {
      console.error(err);
      Utils.showToast(`打包失敗：${err.message}`, 'error');
    } finally {
      btnDownloadZip.disabled = false;
      btnDownloadZip.textContent = '📦 一鍵打包下載全部 (ZIP)';
    }
  });

  // 複製 HTML 標籤
  btnCopyHtmlTags.addEventListener('click', () => {
    if (!outputHtmlTags.value) return;
    Utils.copyToClipboard(outputHtmlTags.value, '已複製 HTML <link> 引用標籤');
  });
});
