/**
 * QR Code Scanner — 工具邏輯
 * 功能：使用 jsQR.js 支援相機即時掃描與圖片檔案上傳辨識
 */

document.addEventListener('DOMContentLoaded', () => {
  // 記錄使用紀錄
  try { StorageManager?.addRecent?.('qr-code-scanner'); } catch (_) { }

  // DOM 元素
  const scanTabs = document.getElementById('scan-tabs');
  const sectionCamera = document.getElementById('section-camera');
  const sectionFile = document.getElementById('section-file');
  const cameraVideo = document.getElementById('camera-video');
  const cameraCanvas = document.getElementById('camera-canvas');
  const cameraStatus = document.getElementById('camera-status');
  const btnToggleCamera = document.getElementById('btn-toggle-camera');
  const btnSwitchCamera = document.getElementById('btn-switch-camera');
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const resultSection = document.getElementById('result-section');
  const resultText = document.getElementById('result-text');
  const btnOpenLink = document.getElementById('btn-open-link');
  const btnCopyResult = document.getElementById('btn-copy-result');
  const historySection = document.getElementById('history-section');
  const historyList = document.getElementById('history-list');
  const btnClearHistory = document.getElementById('btn-clear-history');

  /** 狀態變數 */
  let currentStream = null;
  let isScanningCamera = false;
  let facingMode = 'environment'; // 預設後置鏡頭
  let scanHistory = [];
  let lastScannedData = '';

  /* ================================================================
     Web Audio 掃描成功提示音
     ================================================================ */
  function playBeep() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // 忽視音訊錯誤
    }
  }

  /* ================================================================
     頁籤切換
     ================================================================ */

  if (scanTabs) {
    scanTabs.addEventListener('click', (e) => {
      if (!e.target || !e.target.closest) return;
      const tab = e.target.closest('.tab-btn');
      if (!tab) return;

      scanTabs.querySelectorAll('.tab-btn').forEach((b) => {
        b.classList.remove('btn--primary');
        b.classList.add('btn--ghost');
      });
      tab.classList.remove('btn--ghost');
      tab.classList.add('btn--primary');

      const mode = tab.dataset?.mode || tab.getAttribute('data-mode');
      if (mode === 'camera') {
        sectionCamera.style.display = 'block';
        sectionFile.style.display = 'none';
      } else {
        sectionCamera.style.display = 'none';
        sectionFile.style.display = 'block';
        stopCamera();
      }
    });
  }

  /* ================================================================
     相機掃描邏輯
     ================================================================ */

  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      Utils.showToast('您的瀏覽器不支援相機存取功能', 'error');
      cameraStatus.textContent = '此瀏覽器不支援相機存取';
      return;
    }

    try {
      cameraStatus.textContent = '正在啟動相機…';
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      currentStream = stream;
      cameraVideo.srcObject = stream;
      cameraVideo.setAttribute('playsinline', true);
      await cameraVideo.play();

      isScanningCamera = true;
      btnToggleCamera.textContent = '關閉相機';
      btnToggleCamera.className = 'btn btn--secondary';
      btnSwitchCamera.style.display = 'inline-flex';
      cameraStatus.textContent = '相機運作中，請將 QR Code 對準中央框線';

      requestAnimationFrame(scanCameraFrame);
    } catch (err) {
      console.error('Camera error', err);
      cameraStatus.textContent = `無法開啟相機：${err.message || '權限遭拒'}`;
      Utils.showToast('無法取得相機權限，請確認瀏覽器允許存取攝影機', 'error');
      stopCamera();
    }
  }

  function stopCamera() {
    isScanningCamera = false;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      currentStream = null;
    }
    cameraVideo.srcObject = null;
    btnToggleCamera.textContent = '開啟相機';
    btnToggleCamera.className = 'btn btn--primary';
    btnSwitchCamera.style.display = 'none';
  }

  function scanCameraFrame() {
    if (!isScanningCamera) return;

    if (cameraVideo.readyState === cameraVideo.HAVE_ENOUGH_DATA) {
      const w = cameraVideo.videoWidth;
      const h = cameraVideo.videoHeight;
      cameraCanvas.width = w;
      cameraCanvas.height = h;

      const ctx = cameraCanvas.getContext('2d');
      ctx.drawImage(cameraVideo, 0, 0, w, h);

      const imageData = ctx.getImageData(0, 0, w, h);
      if (typeof jsQR !== 'undefined') {
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data && code.data !== lastScannedData) {
          lastScannedData = code.data;
          handleScanSuccess(code.data);
          // 延遲一段時間避免重複觸發
          setTimeout(() => {
            lastScannedData = '';
          }, 2500);
        }
      }
    }

    if (isScanningCamera) {
      requestAnimationFrame(scanCameraFrame);
    }
  }

  btnToggleCamera.addEventListener('click', () => {
    if (isScanningCamera) stopCamera();
    else startCamera();
  });

  btnSwitchCamera.addEventListener('click', () => {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    stopCamera();
    startCamera();
  });

  /* ================================================================
     圖片檔案解析
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
      scanImageFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      scanImageFile(fileInput.files[0]);
    }
  });

  function scanImageFile(file) {
    if (!file.type.startsWith('image/')) {
      Utils.showToast('請選取圖片檔案', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (typeof jsQR !== 'undefined') {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleScanSuccess(code.data);
            Utils.showToast('成功解析圖片中的 QR Code！', 'success');
          } else {
            Utils.showToast('無法在此圖片中辨識出 QR Code，請確認圖片清晰度', 'warning');
          }
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* ================================================================
     掃描成功處理與歷史紀錄
     ================================================================ */

  function handleScanSuccess(data) {
    playBeep();
    resultText.textContent = data;
    resultSection.style.display = 'block';

    // 判斷是否為網址
    const isUrl = /^https?:\/\//i.test(data.trim());
    if (isUrl) {
      btnOpenLink.href = data.trim();
      btnOpenLink.style.display = 'inline-flex';
    } else {
      btnOpenLink.style.display = 'none';
    }

    // 加入歷史紀錄
    if (!scanHistory.includes(data)) {
      scanHistory.unshift(data);
      if (scanHistory.length > 10) scanHistory.pop();
      renderHistory();
    }
  }

  function renderHistory() {
    if (scanHistory.length === 0) {
      historySection.style.display = 'none';
      return;
    }

    historySection.style.display = 'block';
    historyList.innerHTML = scanHistory
      .map((item, idx) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-family: var(--font-mono, monospace); font-size: 0.8125rem;">
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 12px;">${Utils.escapeHtml(item)}</span>
          <button class="btn btn--sm btn--ghost btn-copy-hist" data-idx="${idx}">複製</button>
        </div>
      `)
      .join('');
  }

  btnCopyResult.addEventListener('click', () => {
    if (!resultText.textContent) return;
    Utils.copyToClipboard(resultText.textContent);
  });

  if (historyList) {
    historyList.addEventListener('click', (e) => {
      if (!e.target || !e.target.closest) return;
      const btn = e.target.closest('.btn-copy-hist');
      if (!btn) return;
      const item = scanHistory[parseInt(btn.dataset.idx, 10)];
      if (item) Utils.copyToClipboard(item);
    });
  }

  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', () => {
      scanHistory = [];
      renderHistory();
      Utils.showToast('已清除掃描歷史', 'info');
    });
  }

  // 離開頁面時關閉相機串流
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', stopCamera);
  }
});
