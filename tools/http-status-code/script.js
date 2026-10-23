/**
 * HTTP Status Code 實作腳本
 */
document.addEventListener('DOMContentLoaded', () => {
  StorageManager.addRecent('http-status-code');

  const searchInput = document.getElementById('search-status');
  const statusGrid = document.getElementById('status-grid');
  const tabButtons = document.querySelectorAll('.status-tab-btn');

  const STATUS_LIST = [
    // 1xx
    { code: 100, name: 'Continue', zh: '繼續請求', desc: '伺服器已收到初步請求，客戶端應繼續發送剩餘請求。' },
    { code: 101, name: 'Switching Protocols', zh: '切換通訊協定', desc: '伺服器同意升級通訊協定（例如 HTTP 升級至 WebSocket）。' },
    // 2xx
    { code: 200, name: 'OK', zh: '請求成功', desc: '標準成功響應，伺服器已成功處理所請求的動作。' },
    { code: 201, name: 'Created', zh: '已建立資源', desc: '請求已成功且伺服器已建立新的資源（常出現在 POST）。' },
    { code: 202, name: 'Accepted', zh: '已接受處理', desc: '請求已被伺服器接受，但尚未處理完成（非同步背景任務）。' },
    { code: 204, name: 'No Content', zh: '無內容', desc: '請求成功處理，但響應主體不包含任何實體內容。' },
    // 3xx
    { code: 301, name: 'Moved Permanently', zh: '永久重新導向', desc: '目標資源已永久轉移至新的 URL，搜尋引擎會轉移權重。' },
    { code: 302, name: 'Found', zh: '暫時重新導向', desc: '目標資源暫時位於其他 URL，客戶端應繼續使用原網址。' },
    { code: 304, name: 'Not Modified', zh: '內容未修改', desc: '快取依然有效，客戶端可直接使用本地快取內容以節省頻寬。' },
    { code: 307, name: 'Temporary Redirect', zh: '暫時導向 (保持方法)', desc: '暫時重新導向，且必須使用原本相同的 HTTP Method 發送。' },
    { code: 308, name: 'Permanent Redirect', zh: '永久導向 (保持方法)', desc: '永久重新導向，且必須使用原本相同的 HTTP Method 發送。' },
    // 4xx
    { code: 400, name: 'Bad Request', zh: '錯誤的請求', desc: '伺服器無法理解請求（語法錯誤、格式不合或無效參數）。' },
    { code: 401, name: 'Unauthorized', zh: '未經身分驗證', desc: '需要有效的認證資訊（例如缺失或無效的 JWT / Token）。' },
    { code: 403, name: 'Forbidden', zh: '禁止存取', desc: '伺服器理解請求，但拒絕授權存取（權限不足或 IP 被封）。' },
    { code: 404, name: 'Not Found', zh: '找不到資源', desc: '請求的資源在伺服器上不存在或已被刪除。' },
    { code: 405, name: 'Method Not Allowed', zh: '不支援的方法', desc: '請求的 HTTP Method 不被該 API 端點所允許。' },
    { code: 408, name: 'Request Timeout', zh: '請求超時', desc: '等待客戶端請求時間過長，伺服器關閉連線。' },
    { code: 409, name: 'Conflict', zh: '資源衝突', desc: '請求與當前伺服器資源狀態衝突（例如重複註冊唯一帳號）。' },
    { code: 413, name: 'Payload Too Large', zh: '傳輸資料過大', desc: '請求實體超過伺服器允許的上限（常見於上傳大檔案）。' },
    { code: 415, name: 'Unsupported Media Type', zh: '不支援的媒體類型', desc: '請求格式不受支援（如未提供正確 Content-Type）。' },
    { code: 429, name: 'Too Many Requests', zh: '請求頻率過高', desc: '觸發 Rate Limit 限流，短時間內發送了過多請求。' },
    // 5xx
    { code: 500, name: 'Internal Server Error', zh: '伺服器內部錯誤', desc: '伺服器遇到無法預期的狀況導致程式崩潰或例外報錯。' },
    { code: 502, name: 'Bad Gateway', zh: '網關錯誤', desc: '作為代理伺服器或反向代理（如 NGINX）收到上游無效響應。' },
    { code: 503, name: 'Service Unavailable', zh: '服務不可用', desc: '伺服器過載或正在維護中，暫時無法處理請求。' },
    { code: 504, name: 'Gateway Timeout', zh: '網關超時', desc: '代理伺服器在等待上游服務（如後端 API）響應時超時。' }
  ];

  let currentType = 'all';

  function renderList() {
    const query = searchInput.value.toLowerCase().trim();
    const filtered = STATUS_LIST.filter(item => {
      const matchType = currentType === 'all' || item.code.toString().startsWith(currentType[0]);
      const matchQuery = !query ||
        item.code.toString().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.zh.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query);
      return matchType && matchQuery;
    });

    if (filtered.length === 0) {
      statusGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--color-text-tertiary); padding: var(--space-xl);">查無符合的 HTTP 狀態碼</div>';
      return;
    }

    statusGrid.innerHTML = filtered.map(item => {
      let badgeColor = '#3b82f6';
      if (item.code >= 200 && item.code < 300) badgeColor = '#10b981';
      else if (item.code >= 300 && item.code < 400) badgeColor = '#f59e0b';
      else if (item.code >= 400 && item.code < 500) badgeColor = '#ef4444';
      else if (item.code >= 500) badgeColor = '#8b5cf6';

      return `
        <div class="tool-card" style="padding: var(--space-md); cursor: default;" data-code="${item.code}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono, monospace); color: ${badgeColor};">${item.code}</span>
            <button class="btn btn--sm btn--ghost btn-copy-code" data-copy="${item.code}" style="font-size: 0.75rem;">複製</button>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 1rem; color: var(--color-text-primary);">${Utils.escapeHtml(item.name)}</div>
            <div style="font-size: 0.8125rem; font-weight: 600; color: var(--color-text-secondary);">${Utils.escapeHtml(item.zh)}</div>
          </div>
          <p style="font-size: 0.8125rem; color: var(--color-text-tertiary); line-height: 1.5; margin-top: auto;">${Utils.escapeHtml(item.desc)}</p>
        </div>
      `;
    }).join('');

    if (statusGrid) {
      statusGrid.querySelectorAll('.btn-copy-code').forEach(btn => {
        btn.addEventListener('click', () => {
          const textToCopy = btn.dataset?.copy || btn.getAttribute('data-copy');
          if (textToCopy) {
            Utils.copyToClipboard(textToCopy, `已複製狀態碼 ${textToCopy}`);
          }
        });
      });
    }
  }

  searchInput.addEventListener('input', renderList);

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.className = 'btn btn--sm btn--ghost status-tab-btn');
      btn.className = 'btn btn--sm btn--primary status-tab-btn';
      currentType = btn.dataset.type;
      renderList();
    });
  });

  renderList();
});
