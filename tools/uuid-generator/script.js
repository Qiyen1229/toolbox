/**
 * UUID Generator — 工具邏輯
 * 功能：產生 RFC4122 v4 UUID，支援自訂大小寫、連字號與大括號
 */

document.addEventListener('DOMContentLoaded', () => {
  // 記錄使用紀錄
  try { StorageManager?.addRecent?.('uuid-generator'); } catch (_) {}

  // DOM 元素
  const countSelect = document.getElementById('uuid-count');
  const optUppercase = document.getElementById('opt-uppercase');
  const optHyphens = document.getElementById('opt-hyphens');
  const optBraces = document.getElementById('opt-braces');
  const btnGenerate = document.getElementById('btn-generate');
  const btnCopyAll = document.getElementById('btn-copy-all');
  const btnClear = document.getElementById('btn-clear');
  const resultSummary = document.getElementById('result-summary');
  const uuidList = document.getElementById('uuid-list');

  /** 目前產生的 UUID 陣列 */
  let currentUuids = [];

  /* ================================================================
     核心產生演算法
     ================================================================ */

  /**
   * 產生單一符合 RFC4122 標準的 UUID v4
   * 優先使用 Web Crypto API 的 crypto.randomUUID()
   * @returns {string}
   */
  function generateSingleUuid() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    // Fallback: 使用 crypto.getRandomValues
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant RFC4122
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    }

    // 保底隨機演算法
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * 格式化 UUID（處理大小寫、連字號與大括號）
   * @param {string} rawUuid
   * @returns {string}
   */
  function formatUuid(rawUuid) {
    let result = rawUuid;

    // 是否移除連字號
    if (!optHyphens.checked) {
      result = result.replace(/-/g, '');
    }

    // 大小寫轉換
    result = optUppercase.checked ? result.toUpperCase() : result.toLowerCase();

    // 是否包覆大括號
    if (optBraces.checked) {
      result = `{${result}}`;
    }

    return result;
  }

  /**
   * 產生並渲染指定數量的 UUID
   */
  function generateUuids() {
    const count = parseInt(countSelect.value, 10) || 5;
    currentUuids = [];

    for (let i = 0; i < count; i++) {
      const raw = generateSingleUuid();
      const formatted = formatUuid(raw);
      currentUuids.push(formatted);
    }

    renderUuids();
  }

  /**
   * 重新套用格式（當使用者切換大小寫、連字號時，無需重新產生即可格式化目前資料）
   */
  function reformatCurrentUuids() {
    if (currentUuids.length === 0) return;

    // 將現有的 uuid 還原成標準 32 位 hex，再重新格式化
    currentUuids = currentUuids.map((u) => {
      let rawHex = u.replace(/[{}-]/g, '').toLowerCase();
      if (rawHex.length === 32) {
        let std = `${rawHex.slice(0, 8)}-${rawHex.slice(8, 12)}-${rawHex.slice(12, 16)}-${rawHex.slice(16, 20)}-${rawHex.slice(20, 32)}`;
        return formatUuid(std);
      }
      return formatUuid(generateSingleUuid());
    });

    renderUuids();
  }

  /**
   * 渲染 UUID 列表與單筆複製按鈕
   */
  function renderUuids() {
    resultSummary.textContent = `產生結果 (${currentUuids.length} 組)`;

    if (currentUuids.length === 0) {
      uuidList.innerHTML = `
        <div style="padding: var(--space-lg); text-align: center; color: var(--color-text-tertiary);">
          尚未產生任何 UUID，請點擊上方按鈕產生
        </div>
      `;
      return;
    }

    uuidList.innerHTML = currentUuids
      .map((uuid, idx) => `
        <div class="uuid-row" style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-family: var(--font-mono, monospace);
          font-size: 0.9375rem;
          transition: background var(--transition-fast), border-color var(--transition-fast);
        ">
          <span style="user-select: all; word-break: break-all;">${Utils.escapeHtml(uuid)}</span>
          <button class="btn btn--sm btn--ghost btn-copy-single" data-index="${idx}" style="flex-shrink: 0; margin-left: var(--space-md);" title="複製此組">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            複製
          </button>
        </div>
      `)
      .join('');
  }

  /* ================================================================
     事件綁定
     ================================================================ */

  // 重新產生
  btnGenerate.addEventListener('click', generateUuids);

  // 數量切換
  countSelect.addEventListener('change', generateUuids);

  // 格式選項切換
  optUppercase.addEventListener('change', reformatCurrentUuids);
  optHyphens.addEventListener('change', reformatCurrentUuids);
  optBraces.addEventListener('change', reformatCurrentUuids);

  // 全部複製
  btnCopyAll.addEventListener('click', () => {
    if (currentUuids.length === 0) {
      Utils.showToast('無資料可複製', 'warning');
      return;
    }
    const textToCopy = currentUuids.join('\n');
    Utils.copyToClipboard(textToCopy);
  });

  // 清除
  btnClear.addEventListener('click', () => {
    currentUuids = [];
    renderUuids();
    Utils.showToast('已清空列表', 'info');
  });

  // 單筆複製（事件委派）
  if (uuidList) {
    uuidList.addEventListener('click', (e) => {
      if (!e.target || !e.target.closest) return;
      const copyBtn = e.target.closest('.btn-copy-single');
      if (!copyBtn) return;

      const rawIdx = copyBtn.dataset?.index || copyBtn.getAttribute('data-index');
      if (rawIdx !== null && rawIdx !== undefined) {
        const idx = parseInt(rawIdx, 10);
        const targetUuid = currentUuids[idx];
        if (targetUuid) {
          Utils.copyToClipboard(targetUuid);
        }
      }
    });
  }

  // 頁面初次載入時自動產生
  generateUuids();
});
