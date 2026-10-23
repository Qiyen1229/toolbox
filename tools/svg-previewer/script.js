/**
 * SVG Previewer — 工具邏輯
 * 功能：即時解析與預覽 SVG、切換檢查背景、匯出高解析度 PNG
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('svg-previewer'); } catch (_) {}

  const svgInput = document.getElementById('svg-input');
  const fileSvg = document.getElementById('file-svg');
  const btnSample = document.getElementById('btn-sample');
  const btnClear = document.getElementById('btn-clear');
  const btnExportPng = document.getElementById('btn-export-png');
  const btnDownloadSvg = document.getElementById('btn-download-svg');
  const btnCopyCode = document.getElementById('btn-copy-code');
  const previewStage = document.getElementById('preview-stage');
  const svgContainer = document.getElementById('svg-container');
  const svgStats = document.getElementById('svg-stats');
  const bgButtons = document.querySelectorAll('.btn-bg');

  /* ================================================================
     背景切換
     ================================================================ */

  bgButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      bgButtons.forEach((b) => b.classList.replace('btn--primary', 'btn--secondary'));
      btn.classList.replace('btn--secondary', 'btn--primary');

      const bg = btn.dataset.bg;
      if (bg === 'white') {
        previewStage.style.backgroundImage = 'none';
        previewStage.style.backgroundColor = '#ffffff';
      } else if (bg === 'dark') {
        previewStage.style.backgroundImage = 'none';
        previewStage.style.backgroundColor = '#0b1120';
      } else {
        // 棋盤格
        previewStage.style.backgroundColor = 'var(--color-bg)';
        previewStage.style.backgroundImage = `
          linear-gradient(45deg, var(--color-surface) 25%, transparent 25%),
          linear-gradient(-45deg, var(--color-surface) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, var(--color-surface) 75%),
          linear-gradient(-45deg, transparent 75%, var(--color-surface) 75%)
        `;
      }
    });
  });

  /* ================================================================
     SVG 解析與預覽
     ================================================================ */

  function renderSvg() {
    const raw = svgInput.value.trim();
    if (!raw) {
      svgContainer.innerHTML = '<span style="color: var(--color-text-tertiary); font-size: 0.875rem;">請在左側貼入 SVG 代碼…</span>';
      svgStats.textContent = '大小：0 字元';
      return;
    }

    svgStats.textContent = `大小：${raw.length} 字元 · ${Utils.formatFileSize(new Blob([raw]).size)}`;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(raw, 'image/svg+xml');
      const parserError = doc.querySelector('parsererror');

      if (parserError) {
        svgContainer.innerHTML = `<span style="color: var(--color-error); font-size: 0.875rem;">⚠ SVG 語法解析錯誤：${Utils.escapeHtml(parserError.textContent.slice(0, 100))}</span>`;
        return;
      }

      const svgEl = doc.querySelector('svg');
      if (!svgEl) {
        svgContainer.innerHTML = '<span style="color: var(--color-warning); font-size: 0.875rem;">⚠ 找不到 &lt;svg&gt; 根標籤</span>';
        return;
      }

      // 確保 SVG 不超出容器
      svgEl.style.maxWidth = '100%';
      svgEl.style.maxHeight = '360px';
      svgEl.style.display = 'block';

      svgContainer.innerHTML = '';
      svgContainer.appendChild(doc.documentElement);
    } catch (err) {
      svgContainer.innerHTML = `<span style="color: var(--color-error); font-size: 0.875rem;">無法預覽：${err.message}</span>`;
    }
  }

  const debouncedRender = Utils.debounce(renderSvg, 150);
  svgInput.addEventListener('input', debouncedRender);

  // 載入範例
  btnSample.addEventListener('click', () => {
    svgInput.value = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width="320" height="240">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="20" y="20" width="280" height="200" rx="20" fill="url(#grad1)" />
  <circle cx="160" cy="110" r="50" fill="#ffffff" opacity="0.9" />
  <polygon points="160,75 190,135 130,135" fill="#3b82f6" />
  <text x="160" y="195" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle">
    Qiyen Toolbox
  </text>
</svg>`;
    renderSvg();
    Utils.showToast('已載入範例 SVG', 'info');
  });

  // 上傳 .svg 檔案
  fileSvg.addEventListener('change', () => {
    if (fileSvg.files && fileSvg.files.length > 0) {
      const file = fileSvg.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        svgInput.value = e.target.result;
        renderSvg();
        Utils.showToast(`已成功讀取 ${file.name}`, 'success');
      };
      reader.readAsText(file);
    }
  });

  // 清空
  btnClear.addEventListener('click', () => {
    svgInput.value = '';
    renderSvg();
    Utils.showToast('已清空代碼', 'info');
  });

  // 複製代碼
  btnCopyCode.addEventListener('click', () => {
    const raw = svgInput.value.trim();
    if (!raw) return;
    Utils.copyToClipboard(raw, '已複製 SVG 原始碼！');
  });

  // 下載 .svg 檔案
  btnDownloadSvg.addEventListener('click', () => {
    const raw = svgInput.value.trim();
    if (!raw) return;
    Utils.downloadText(raw, 'vector_graphic.svg', 'image/svg+xml');
    Utils.showToast('已下載 .svg 檔案！', 'success');
  });

  // 匯出為 PNG
  btnExportPng.addEventListener('click', () => {
    const raw = svgInput.value.trim();
    if (!raw) {
      Utils.showToast('請先輸入 SVG 原始碼', 'warning');
      return;
    }

    try {
      const blob = new Blob([raw], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 2; // 2x 高解析度
        const width = (img.naturalWidth || 800) * scale;
        const height = (img.naturalHeight || 600) * scale;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            Utils.downloadBlob(pngBlob, 'exported_vector.png');
            Utils.showToast('已成功匯出高解析度 PNG！', 'success');
          }
          URL.revokeObjectURL(url);
        }, 'image/png');
      };

      img.onerror = () => {
        Utils.showToast('SVG 轉換 PNG 失敗，請確認語法規範', 'error');
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (err) {
      Utils.showToast(`匯出錯誤：${err.message}`, 'error');
    }
  });

  // 初始載入範例
  btnSample.click();
});
