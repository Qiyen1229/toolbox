/**
 * Image Base64 Converter — 工具邏輯
 * 功能：雙向轉換圖片與 Base64，並支援一鍵複製 HTML/CSS/MD 等代碼格式
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('image-base64'); } catch (_) {}

  // 模式頁籤
  const tabImg2B64 = document.getElementById('tab-img2b64');
  const tabB642Img = document.getElementById('tab-b642img');
  const panelImg2B64 = document.getElementById('panel-img2b64');
  const panelB642Img = document.getElementById('panel-b642img');

  // 圖片轉 Base64 元素
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const b64ResultSection = document.getElementById('b64-result-section');
  const imgStatsBadge = document.getElementById('img-stats-badge');
  const previewThumb = document.getElementById('preview-thumb');
  const outputB64 = document.getElementById('output-b64');
  const btnCopyRaw = document.getElementById('btn-copy-raw');
  const btnCopyHtml = document.getElementById('btn-copy-html');
  const btnCopyCss = document.getElementById('btn-copy-css');
  const btnCopyMd = document.getElementById('btn-copy-md');

  // Base64 轉圖片元素
  const inputB64String = document.getElementById('input-b64-string');
  const btnLoadSample = document.getElementById('btn-load-sample');
  const btnRenderImg = document.getElementById('btn-render-img');
  const btnClearB64 = document.getElementById('btn-clear-b64');
  const reverseResultSection = document.getElementById('reverse-result-section');
  const reversePreviewImg = document.getElementById('reverse-preview-img');
  const btnDownloadRestored = document.getElementById('btn-download-restored');

  let currentDataUrl = '';
  let currentFile = null;

  /* ================================================================
     頁籤切換
     ================================================================ */

  tabImg2B64.addEventListener('click', () => {
    tabImg2B64.className = 'btn btn--sm btn--primary';
    tabB642Img.className = 'btn btn--sm btn--ghost';
    panelImg2B64.style.display = 'block';
    panelB642Img.style.display = 'none';
  });

  tabB642Img.addEventListener('click', () => {
    tabB642Img.className = 'btn btn--sm btn--primary';
    tabImg2B64.className = 'btn btn--sm btn--ghost';
    panelImg2B64.style.display = 'none';
    panelB642Img.style.display = 'block';
  });

  /* ================================================================
     圖片轉 Base64
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
      encodeImage(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      encodeImage(fileInput.files[0]);
    }
  });

  function encodeImage(file) {
    if (!file.type.startsWith('image/')) {
      Utils.showToast('請選取有效的圖片檔案', 'error');
      return;
    }

    currentFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
      currentDataUrl = e.target.result;
      previewThumb.src = currentDataUrl;
      outputB64.value = currentDataUrl;

      const img = new Image();
      img.onload = () => {
        imgStatsBadge.textContent = `${img.naturalWidth} × ${img.naturalHeight} px · 原大小：${Utils.formatFileSize(file.size)} · Base64：${Utils.formatFileSize(currentDataUrl.length)}`;
      };
      img.src = currentDataUrl;

      b64ResultSection.style.display = 'block';
      Utils.showToast('圖片已成功轉換為 Base64！', 'success');
    };

    reader.readAsDataURL(file);
  }

  // 複製按鈕
  btnCopyRaw.addEventListener('click', () => {
    if (!currentDataUrl) return;
    Utils.copyToClipboard(currentDataUrl, '已複製 Base64 Data URL');
  });

  btnCopyHtml.addEventListener('click', () => {
    if (!currentDataUrl) return;
    const alt = currentFile ? currentFile.name : 'image';
    const code = `<img src="${currentDataUrl}" alt="${alt}">`;
    Utils.copyToClipboard(code, '已複製 HTML <img> 標籤');
  });

  btnCopyCss.addEventListener('click', () => {
    if (!currentDataUrl) return;
    const code = `background-image: url("${currentDataUrl}");`;
    Utils.copyToClipboard(code, '已複製 CSS 樣式代碼');
  });

  btnCopyMd.addEventListener('click', () => {
    if (!currentDataUrl) return;
    const alt = currentFile ? currentFile.name : 'image';
    const code = `![${alt}](${currentDataUrl})`;
    Utils.copyToClipboard(code, '已複製 Markdown 圖片語法');
  });

  /* ================================================================
     Base64 轉圖片
     ================================================================ */

  btnRenderImg.addEventListener('click', () => {
    let raw = inputB64String.value.trim();
    if (!raw) {
      Utils.showToast('請先貼上 Base64 字串', 'warning');
      return;
    }

    // 若未包含前綴 data:image，嘗試自動補齊 PNG 前綴
    if (!raw.startsWith('data:image/')) {
      raw = `data:image/png;base64,${raw}`;
    }

    const testImg = new Image();
    testImg.onload = () => {
      reversePreviewImg.src = raw;
      reverseResultSection.style.display = 'block';
      Utils.showToast('圖片還原成功！', 'success');
    };
    testImg.onerror = () => {
      Utils.showToast('無效的 Base64 圖片資料，請確認字串格式', 'error');
    };
    testImg.src = raw;
  });

  btnLoadSample.addEventListener('click', () => {
    // 內建一個迷你的綠色打勾 SVG Data URL
    inputB64String.value = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzEwYjk4MSIgc3Ryb2tlLXdpZHRoPSIyIj48cGF0aCBkPSJNMjAgNkw5IDE3bC01LTUiLz48L3N2Zz4=';
    btnRenderImg.click();
  });

  btnClearB64.addEventListener('click', () => {
    inputB64String.value = '';
    reverseResultSection.style.display = 'none';
    Utils.showToast('已清空輸入', 'info');
  });

  btnDownloadRestored.addEventListener('click', () => {
    const src = reversePreviewImg.src;
    if (!src) return;

    let ext = '.png';
    if (src.includes('image/jpeg') || src.includes('image/jpg')) ext = '.jpg';
    if (src.includes('image/webp')) ext = '.webp';
    if (src.includes('image/svg')) ext = '.svg';

    const a = document.createElement('a');
    a.href = src;
    a.download = `restored_image${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    Utils.showToast('已下載還原圖片！', 'success');
  });
});
