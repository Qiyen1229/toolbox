/**
 * Qiyen Toolbox — Utility Functions
 * 各工具頁面共用的工具函式：複製、下載、Toast 提示等
 */

const Utils = (() => {

  /* ================================================================
     複製到剪貼簿
     ================================================================ */

  /**
   * 將文字複製到剪貼簿
   * @param {string} text — 要複製的文字
   * @param {string} [successMsg='已複製到剪貼簿'] — 成功時的提示訊息
   */
  async function copyToClipboard(text, successMsg = '已複製到剪貼簿') {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMsg, 'success');
    } catch {
      // HACK: 部分瀏覽器在非 HTTPS 環境下 clipboard API 無法使用，改用 fallback
      fallbackCopy(text);
      showToast(successMsg, 'success');
    }
  }

  /**
   * Clipboard API 不可用時的 fallback 方案
   * @param {string} text
   */
  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  /* ================================================================
     檔案下載
     ================================================================ */

  /**
   * 觸發瀏覽器下載檔案
   * @param {Blob} blob — 檔案 Blob
   * @param {string} filename — 下載檔名
   */
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // NOTE: 延遲釋放 URL，確保下載已啟動
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * 將文字內容下載為檔案
   * @param {string} content — 文字內容
   * @param {string} filename — 檔名
   * @param {string} [mimeType='text/plain'] — MIME 類型
   */
  function downloadText(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    downloadBlob(blob, filename);
  }

  /* ================================================================
     Toast 通知
     ================================================================ */

  /**
   * 顯示 Toast 提示訊息
   * @param {string} message — 訊息內容
   * @param {'success' | 'error' | 'warning'} [type='success'] — 類型
   * @param {number} [duration=2500] — 顯示時間（毫秒）
   */
  function showToast(message, type = 'success', duration = 2500) {
    try {
      let container = document.querySelector('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        if (document.body && typeof document.body.appendChild === 'function') {
          document.body.appendChild(container);
        }
      }

      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
      };

      const toast = document.createElement('div');
      toast.className = `toast toast--${type}`;
      toast.innerHTML = `
        <span class="toast__icon">${icons[type] || ''}</span>
        <span>${escapeHtml(message)}</span>
      `;

      if (container && typeof container.appendChild === 'function') {
        container.appendChild(toast);
      }

      // 自動移除
      setTimeout(() => {
        if (toast.classList && toast.classList.add) {
          toast.classList.add('toast--exit');
        }
        if (toast.addEventListener) {
          toast.addEventListener('animationend', () => {
            if (typeof toast.remove === 'function') toast.remove();
          });
        }
        // 回退移除
        setTimeout(() => {
          if (typeof toast.remove === 'function') toast.remove();
        }, 500);
      }, duration);
    } catch (err) {
      console.warn('Toast display notice:', message, err);
    }
  }

  /* ================================================================
     安全性工具
     ================================================================ */

  /**
   * HTML 特殊字元跳脫，防止 XSS
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    const s = String(str);
    try {
      const div = document.createElement('div');
      div.textContent = s;
      return div.innerHTML || s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    } catch {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
  }

  /* ================================================================
     格式化工具
     ================================================================ */

  /**
   * 格式化檔案大小為人類可讀字串
   * @param {number} bytes — 位元組數
   * @param {number} [decimals=2] — 小數位數
   * @returns {string}
   */
  function formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }

  /**
   * Debounce：延遲執行函式，避免高頻觸發
   * @param {Function} fn — 要延遲的函式
   * @param {number} delay — 延遲毫秒數
   * @returns {Function}
   */
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  return {
    copyToClipboard,
    downloadBlob,
    downloadText,
    downloadFile: downloadText,
    showToast,
    escapeHtml,
    formatFileSize,
    debounce,
  };
})();
