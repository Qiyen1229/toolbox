/**
 * Base64 Encoder / Decoder — 工具邏輯
 * 支援 UTF-8 文字的 Base64 編碼與解碼
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('base64-encoder-decoder'); } catch (_) { }

  let currentMode = 'encode';

  const inputEl = document.getElementById('input-text');
  const outputEl = document.getElementById('output-text');
  const resultSection = document.getElementById('result-section');
  const inputLabel = document.getElementById('input-label');
  const outputLabel = document.getElementById('output-label');

  /* ================================================================
     模式切換
     ================================================================ */

  const modeTabs = document.querySelectorAll('.mode-tab');

  modeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      modeTabs.forEach((t) => t.classList.remove('mode-tab--active'));
      tab.classList.add('mode-tab--active');
      currentMode = tab.dataset.mode;
      updateLabels();
      // 自動轉換已有的輸入
      if (inputEl.value.trim()) {
        convert();
      }
    });
  });

  /** 根據模式更新標籤文字與 placeholder */
  function updateLabels() {
    if (currentMode === 'encode') {
      inputLabel.textContent = '原始文字';
      outputLabel.textContent = 'Base64 結果';
      inputEl.placeholder = '在此輸入要編碼的文字...';
    } else {
      inputLabel.textContent = 'Base64 字串';
      outputLabel.textContent = '解碼結果';
      inputEl.placeholder = '在此貼上 Base64 字串...';
    }
  }

  /* ================================================================
     Base64 編碼/解碼
     NOTE: 原生 btoa/atob 不支援 UTF-8，需要先轉換
     ================================================================ */

  /**
   * UTF-8 安全的 Base64 編碼
   * @param {string} str — 原始字串
   * @returns {string} — Base64 編碼字串
   */
  function utf8ToBase64(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }

  /**
   * UTF-8 安全的 Base64 解碼
   * @param {string} base64 — Base64 字串
   * @returns {string} — 解碼後的字串
   */
  function base64ToUtf8(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  }

  /** 執行轉換 */
  function convert() {
    const input = inputEl.value;
    if (!input.trim()) {
      Utils.showToast('請輸入文字', 'warning');
      return;
    }

    try {
      let result;
      if (currentMode === 'encode') {
        result = utf8ToBase64(input);
      } else {
        result = base64ToUtf8(input);
      }
      outputEl.textContent = result;
      resultSection.style.display = 'block';
    } catch (e) {
      Utils.showToast(
        currentMode === 'decode' ? 'Base64 字串格式無效' : '編碼失敗：' + e.message,
        'error'
      );
    }
  }

  /* ================================================================
     事件綁定
     ================================================================ */

  document.getElementById('btn-convert').addEventListener('click', convert);

  /** 交換輸入/輸出 */
  document.getElementById('btn-swap').addEventListener('click', () => {
    const outputText = outputEl.textContent;
    if (!outputText) return;

    inputEl.value = outputText;

    // 同時切換模式
    currentMode = currentMode === 'encode' ? 'decode' : 'encode';
    modeTabs.forEach((t) => {
      t.classList.toggle('mode-tab--active', t.dataset.mode === currentMode);
    });
    updateLabels();
    convert();
  });

  /** 清除 */
  document.getElementById('btn-clear').addEventListener('click', () => {
    inputEl.value = '';
    outputEl.textContent = '';
    resultSection.style.display = 'none';
    inputEl.focus();
  });

  /** 複製結果 */
  document.getElementById('btn-copy').addEventListener('click', () => {
    const text = outputEl.textContent;
    if (text) {
      Utils.copyToClipboard(text);
    }
  });

  // NOTE: 即時轉換 — 輸入時自動轉換
  inputEl.addEventListener('input', Utils.debounce(() => {
    if (inputEl.value.trim()) {
      convert();
    } else {
      resultSection.style.display = 'none';
    }
  }, 300));
});
