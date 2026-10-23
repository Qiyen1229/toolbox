/**
 * QR Code Generator — 一行網址極速生成邏輯
 */
document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('qr-code-generator'); } catch (_) {}

  const urlInput = document.getElementById('qr-url-input');
  const btnGenerate = document.getElementById('btn-generate');
  const qrBox = document.getElementById('qrcode-box');
  const currentUrlDisplay = document.getElementById('current-url-display');
  const btnDownload = document.getElementById('btn-download');
  const btnCopyImg = document.getElementById('btn-copy-img');
  const linkOpenUrl = document.getElementById('link-open-url');

  let qrInstance = null;

  function generateQr() {
    let text = (urlInput ? urlInput.value : '').trim();
    if (!text) {
      text = 'https://github.com';
    }

    if (currentUrlDisplay) currentUrlDisplay.textContent = text;

    // 更新外鏈按鈕
    if (linkOpenUrl) {
      if (text.startsWith('http://') || text.startsWith('https://')) {
        linkOpenUrl.href = text;
        linkOpenUrl.style.display = 'inline-flex';
      } else {
        linkOpenUrl.style.display = 'none';
      }
    }

    // 清空舊 QR Code
    if (qrBox) qrBox.innerHTML = '';

    if (typeof QRCode !== 'undefined') {
      try {
        qrInstance = new QRCode(qrBox, {
          text: text,
          width: 220,
          height: 220,
          colorDark: '#0f172a',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M,
        });
      } catch (err) {
        console.warn('QR Code generation notice:', err);
        if (qrBox) qrBox.innerHTML = '<div style="color: var(--color-error); padding: 20px;">QR Code 生成失敗，請確認網址格式</div>';
      }
    } else {
      if (qrBox) qrBox.innerHTML = '<div style="color: var(--color-error); padding: 20px;">QRCode 函式庫未載入</div>';
    }
  }

  // 即時防抖輸入
  const debouncedGen = Utils.debounce(generateQr, 200);

  urlInput.addEventListener('input', debouncedGen);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      generateQr();
      Utils.showToast('已產生 QR Code', 'success');
    }
  });

  btnGenerate.addEventListener('click', () => {
    generateQr();
    Utils.showToast('已產生 QR Code ⚡', 'success');
  });

  // 下載 PNG 圖片
  btnDownload.addEventListener('click', () => {
    // QRCode 庫可能產生 <img> 或 <canvas>
    const canvas = qrBox.querySelector('canvas');
    const img = qrBox.querySelector('img');

    if (canvas && typeof canvas.toDataURL === 'function') {
      const a = document.createElement('a');
      a.download = `qrcode-${Date.now()}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      Utils.showToast('已下載 QR Code 圖片', 'success');
    } else if (img && img.src) {
      const a = document.createElement('a');
      a.download = `qrcode-${Date.now()}.png`;
      a.href = img.src;
      a.click();
      Utils.showToast('已下載 QR Code 圖片', 'success');
    } else {
      Utils.showToast('尚未生成 QR Code 圖片', 'warning');
    }
  });

  // 複製圖片
  btnCopyImg.addEventListener('click', async () => {
    const canvas = qrBox.querySelector('canvas');
    if (canvas && navigator.clipboard && window.ClipboardItem) {
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          Utils.showToast('已複製 QR Code 圖片到剪貼簿！', 'success');
        });
      } catch (err) {
        Utils.copyToClipboard(urlInput.value.trim(), '瀏覽器限制圖片複製，已複製網址文字');
      }
    } else {
      Utils.copyToClipboard(urlInput.value.trim(), '已複製網址文字');
    }
  });

  // 預設立即生成
  generateQr();
});
