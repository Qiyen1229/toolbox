/**
 * JSON Formatter — 工具邏輯
 * 功能：美化、壓縮、驗證 JSON 字串
 */

document.addEventListener('DOMContentLoaded', () => {
  // 記錄使用紀錄
  try { StorageManager?.addRecent?.('json-formatter'); } catch (_) {}

  const inputEl = document.getElementById('json-input');
  const outputEl = document.getElementById('json-output');
  const errorEl = document.getElementById('json-error');
  const resultSection = document.getElementById('result-section');
  const indentSelect = document.getElementById('indent-type');

  /* ================================================================
     核心函式
     ================================================================ */

  /**
   * 取得使用者選擇的縮排方式
   * @returns {string | number}
   */
  function getIndent() {
    if (!indentSelect) return 2;
    const val = indentSelect.value;
    if (val === 'tab') return '\t';
    const num = parseInt(val, 10);
    return isNaN(num) || num <= 0 ? 2 : num;
  }

  /**
   * 解析 JSON 字串，回傳解析結果或錯誤
   * @param {string} raw — 原始 JSON 字串
   * @returns {{ data: any, error: string | null }}
   */
  function parseJson(raw) {
    const trimmed = raw.trim();
    if (!trimmed) {
      return { data: null, error: '請輸入 JSON 字串' };
    }

    try {
      const data = JSON.parse(trimmed);
      return { data, error: null };
    } catch (e) {
      // NOTE: 嘗試從錯誤訊息中提取位置資訊，讓提示更實用
      const message = e.message || 'JSON 格式無效';
      return { data: null, error: `JSON 解析錯誤：${message}` };
    }
  }

  /**
   * 顯示錯誤訊息
   * @param {string} message
   */
  function showError(message) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    resultSection.style.display = 'none';
  }

  /** 隱藏錯誤訊息 */
  function hideError() {
    errorEl.style.display = 'none';
  }

  /**
   * 顯示結果
   * @param {string} text — 格式化後的 JSON 字串
   */
  function showResult(text) {
    hideError();
    outputEl.textContent = text;
    resultSection.style.display = 'block';
  }

  /* ================================================================
     按鈕事件
     ================================================================ */

  /** 執行美化排版 */
  function format() {
    const { data, error } = parseJson(inputEl.value);
    if (error) {
      showError(error);
      return;
    }
    const indent = getIndent();
    const formatted = JSON.stringify(data, null, indent);
    showResult(formatted);
    inputEl.value = formatted;
  }

  /** 美化 */
  document.getElementById('btn-format').addEventListener('click', format);

  /** 壓縮 */
  document.getElementById('btn-minify').addEventListener('click', () => {
    const { data, error } = parseJson(inputEl.value);
    if (error) {
      showError(error);
      return;
    }
    const minified = JSON.stringify(data);
    showResult(minified);
    inputEl.value = minified;
  });

  /** 驗證 */
  document.getElementById('btn-validate').addEventListener('click', () => {
    const { data, error } = parseJson(inputEl.value);
    if (error) {
      showError(error);
      return;
    }
    hideError();
    Utils.showToast('✓ JSON 格式正確！', 'success');

    // 額外顯示結構資訊
    const info = getJsonInfo(data);
    showResult(`✓ JSON 格式正確\n\n${info}`);
  });

  /** 載入範例 */
  const btnSample = document.getElementById('btn-sample');
  if (btnSample) {
    btnSample.addEventListener('click', () => {
      inputEl.value = JSON.stringify({
        project: "Qiyen Toolbox",
        developer: "Qiyen",
        version: "2.0.0",
        features: ["100% Client-Side", "Fast & Responsive", "No Database Required"],
        toolsCount: 34,
        status: { online: true, pwa: true }
      }, null, getIndent());
      hideError();
      format();
      Utils.showToast('已載入範例 JSON', 'info');
    });
  }

  /** 清除 */
  document.getElementById('btn-clear').addEventListener('click', () => {
    inputEl.value = '';
    hideError();
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

  /* ================================================================
     輔助函式
     ================================================================ */

  /**
   * 取得 JSON 結構資訊摘要
   * @param {*} data — 解析後的 JSON 資料
   * @returns {string}
   */
  function getJsonInfo(data) {
    const type = Array.isArray(data) ? 'Array' : typeof data;
    const lines = [`類型：${type}`];

    if (Array.isArray(data)) {
      lines.push(`元素數量：${data.length}`);
    } else if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      lines.push(`鍵值數量：${keys.length}`);
      if (keys.length > 0 && keys.length <= 20) {
        lines.push(`鍵值列表：${keys.join(', ')}`);
      }
    }

    return lines.join('\n');
  }

  /* ================================================================
     即時驗證（輸入時自動檢查）
     ================================================================ */

  // NOTE: 使用 debounce 避免每次按鍵都觸發解析
  const debouncedValidate = Utils.debounce(() => {
    const raw = inputEl.value.trim();
    if (!raw) {
      hideError();
      return;
    }

    try {
      JSON.parse(raw);
      hideError();
    } catch (e) {
      errorEl.textContent = `⚠ ${e.message}`;
      errorEl.style.display = 'block';
    }
  }, 500);

  inputEl.addEventListener('input', debouncedValidate);

  // 支援 Tab 鍵在 textarea 中插入縮排
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = inputEl.selectionStart;
      const end = inputEl.selectionEnd;
      const indentNum = parseInt(indentSelect.value, 10);
      const indent = indentSelect.value === 'tab' ? '\t' : ' '.repeat(isNaN(indentNum) || indentNum <= 0 ? 2 : indentNum);
      inputEl.value = inputEl.value.substring(0, start) + indent + inputEl.value.substring(end);
      inputEl.selectionStart = inputEl.selectionEnd = start + indent.length;
    }
  });
});
