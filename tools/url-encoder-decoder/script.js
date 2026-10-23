/**
 * URL Encoder / Decoder — 工具邏輯
 * 功能：URL 百分比編碼與解碼，支援即時雙向轉換與錯誤提示
 */

document.addEventListener('DOMContentLoaded', () => {
  // 記錄使用紀錄
  try { StorageManager?.addRecent?.('url-encoder-decoder'); } catch (_) {}

  // DOM 元素
  const tabEncode = document.getElementById('tab-encode');
  const tabDecode = document.getElementById('tab-decode');
  const inputLabel = document.getElementById('input-label');
  const outputLabel = document.getElementById('output-label');
  const urlInput = document.getElementById('url-input');
  const urlOutput = document.getElementById('url-output');
  const urlError = document.getElementById('url-error');
  const btnSample = document.getElementById('btn-sample');
  const btnCopy = document.getElementById('btn-copy');
  const btnSwap = document.getElementById('btn-swap');
  const btnClear = document.getElementById('btn-clear');
  const modeRadios = document.querySelectorAll('input[name="encode-mode"]');

  /** 目前模式：'encode' | 'decode' */
  let currentMode = 'encode';

  /* ================================================================
     核心轉換函式
     ================================================================ */

  /**
   * 取得所選的編碼範圍模式 ('component' | 'full')
   * @returns {string}
   */
  function getRangeMode() {
    const checked = document.querySelector('input[name="encode-mode"]:checked');
    return checked ? checked.value : 'component';
  }

  /**
   * 執行編碼或解碼轉換
   */
  function performConversion() {
    hideError();
    const text = urlInput.value;

    if (!text) {
      urlOutput.value = '';
      return;
    }

    const rangeMode = getRangeMode();

    if (currentMode === 'encode') {
      try {
        if (rangeMode === 'component') {
          urlOutput.value = encodeURIComponent(text);
        } else {
          urlOutput.value = encodeURI(text);
        }
      } catch (err) {
        showError(`編碼失敗：${err.message}`);
        urlOutput.value = '';
      }
    } else {
      // Decode 模式
      try {
        if (rangeMode === 'component') {
          urlOutput.value = decodeURIComponent(text.replace(/\+/g, '%20'));
        } else {
          urlOutput.value = decodeURI(text);
        }
      } catch (err) {
        showError(`解碼失敗：無效的 URL 編碼序列 (${err.message})`);
        urlOutput.value = '';
      }
    }
  }

  /**
   * 顯示錯誤訊息
   * @param {string} msg
   */
  function showError(msg) {
    urlError.textContent = msg;
    urlError.style.display = 'block';
  }

  /**
   * 隱藏錯誤訊息
   */
  function hideError() {
    urlError.textContent = '';
    urlError.style.display = 'none';
  }

  /**
   * 切換編碼 / 解碼模式
   * @param {'encode' | 'decode'} mode
   */
  function setMode(mode) {
    currentMode = mode;
    if (mode === 'encode') {
      tabEncode.className = 'btn btn--sm btn--primary';
      tabDecode.className = 'btn btn--sm btn--ghost';
      inputLabel.textContent = '輸入字串（待編碼）';
      outputLabel.textContent = '編碼結果 (Encoded)';
      urlInput.placeholder = '請輸入一般文字或網址…';
    } else {
      tabDecode.className = 'btn btn--sm btn--primary';
      tabEncode.className = 'btn btn--sm btn--ghost';
      inputLabel.textContent = '輸入字串（待解碼）';
      outputLabel.textContent = '解碼結果 (Decoded)';
      urlInput.placeholder = '請輸入含有 %xx 的已編碼字串…';
    }
    performConversion();
  }

  /* ================================================================
     事件監聽
     ================================================================ */

  // 模式頁籤切換
  tabEncode.addEventListener('click', () => setMode('encode'));
  tabDecode.addEventListener('click', () => setMode('decode'));

  // 編碼範圍變更
  modeRadios.forEach((radio) => {
    radio.addEventListener('change', performConversion);
  });

  // 輸入即時轉換（使用 debounce 避免超大文字卡頓）
  const debouncedConvert = Utils.debounce(performConversion, 80);
  urlInput.addEventListener('input', debouncedConvert);

  // 載入範例
  btnSample.addEventListener('click', () => {
    if (currentMode === 'encode') {
      urlInput.value = 'https://example.com/search?q=台北商業大學&category=工具箱&version=1.0#top';
    } else {
      urlInput.value = 'https://example.com/search?q=%E5%8F%B0%E5%8C%97%E5%95%86%E6%A5%AD%E5%A4%A7%E5%AD%B8&category=%E5%B7%A5%E5%85%B7%E7%AE%B1&version=1.0#top';
    }
    performConversion();
  });

  // 交換輸入與輸出
  btnSwap.addEventListener('click', () => {
    const currentOut = urlOutput.value;
    if (!currentOut) return;

    urlInput.value = currentOut;
    setMode(currentMode === 'encode' ? 'decode' : 'encode');
    Utils.showToast('已交換輸入與輸出內容', 'info');
  });

  // 複製結果
  btnCopy.addEventListener('click', () => {
    if (!urlOutput.value) {
      Utils.showToast('無轉換結果可複製', 'warning');
      return;
    }
    Utils.copyToClipboard(urlOutput.value);
  });

  // 清除
  btnClear.addEventListener('click', () => {
    urlInput.value = '';
    urlOutput.value = '';
    hideError();
    Utils.showToast('已清除內容', 'info');
  });

  // 初始化執行
  performConversion();
});
