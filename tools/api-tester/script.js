/**
 * API Tester 實作腳本
 */
document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('api-tester'); } catch (_) { }

  const methodSelect = document.getElementById('http-method');
  const urlInput = document.getElementById('api-url');
  const btnSend = document.getElementById('btn-send');
  const tabHeaders = document.getElementById('tab-headers');
  const tabBody = document.getElementById('tab-body');
  const paneHeaders = document.getElementById('pane-headers');
  const paneBody = document.getElementById('pane-body');
  const btnAddHeader = document.getElementById('btn-add-header');
  const headersList = document.getElementById('headers-list');
  const headerCount = document.getElementById('header-count');
  const requestBody = document.getElementById('request-body');
  const responseSection = document.getElementById('response-section');
  const resStatus = document.getElementById('res-status');
  const resTime = document.getElementById('res-time');
  const resSize = document.getElementById('res-size');
  const responseBody = document.getElementById('response-body');
  const btnCopyResponse = document.getElementById('btn-copy-response');
  const btnLoadDemo = document.getElementById('btn-load-demo');

  // 頁籤切換
  tabHeaders.addEventListener('click', () => {
    tabHeaders.className = 'btn btn--sm btn--secondary';
    tabBody.className = 'btn btn--sm btn--ghost';
    paneHeaders.style.display = 'block';
    paneBody.style.display = 'none';
  });

  tabBody.addEventListener('click', () => {
    tabBody.className = 'btn btn--sm btn--secondary';
    tabHeaders.className = 'btn btn--sm btn--ghost';
    paneBody.style.display = 'block';
    paneHeaders.style.display = 'none';
  });

  // 新增 Header 列
  function addHeaderRow(key = '', val = '') {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = 'var(--space-sm)';
    row.innerHTML = `
      <input type="text" class="form-input header-key" placeholder="Key (如 Authorization)" value="${Utils.escapeHtml(key)}" style="flex: 1; font-family: var(--font-mono, monospace);">
      <input type="text" class="form-input header-val" placeholder="Value (如 Bearer token...)" value="${Utils.escapeHtml(val)}" style="flex: 1.5; font-family: var(--font-mono, monospace);">
      <button type="button" class="btn btn--sm btn--ghost btn-del-header" style="color: var(--color-error);">✕</button>
    `;
    if (row.querySelector) {
      const delBtn = row.querySelector('.btn-del-header');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          row.remove();
          updateHeaderCount();
        });
      }
    }
    if (headersList) headersList.appendChild(row);
    updateHeaderCount();
  }

  function updateHeaderCount() {
    if (headerCount) {
      headerCount.textContent = headersList && headersList.children ? headersList.children.length : 0;
    }
  }

  btnAddHeader.addEventListener('click', () => addHeaderRow());

  // 載入範例
  btnLoadDemo.addEventListener('click', () => {
    methodSelect.value = 'GET';
    urlInput.value = 'https://jsonplaceholder.typicode.com/todos/1';
    headersList.innerHTML = '';
    addHeaderRow('Accept', 'application/json');
    requestBody.value = '';
    Utils.showToast('已載入範例請求', 'info');
  });

  // 發送請求
  btnSend.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) {
      Utils.showToast('請輸入有效的 URL', 'error');
      urlInput.focus();
      return;
    }

    const method = methodSelect.value;
    const headers = {};
    headersList.querySelectorAll('div').forEach(row => {
      const k = row.querySelector('.header-key').value.trim();
      const v = row.querySelector('.header-val').value.trim();
      if (k) headers[k] = v;
    });

    const options = { method, headers };
    if (['POST', 'PUT', 'PATCH'].includes(method) && requestBody.value.trim()) {
      options.body = requestBody.value;
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    btnSend.disabled = true;
    btnSend.textContent = '發送中...';
    const getNow = () => (typeof window !== 'undefined' && window.performance && window.performance.now ? window.performance.now() : Date.now());
    const startTime = getNow();

    try {
      const res = await fetch(url, options);
      const endTime = getNow();
      const duration = Math.round(endTime - startTime);

      const contentType = res.headers.get('content-type') || '';
      let text = await res.text();
      let formatted = text;

      if (contentType.includes('application/json')) {
        try {
          formatted = JSON.stringify(JSON.parse(text), null, 2);
        } catch { }
      }

      // 呈現狀態
      responseSection.style.display = 'block';
      resStatus.textContent = `${res.status} ${res.statusText}`;
      if (res.ok) {
        resStatus.style.background = 'rgba(16, 185, 129, 0.15)';
        resStatus.style.color = 'var(--color-success)';
      } else {
        resStatus.style.background = 'rgba(239, 68, 68, 0.15)';
        resStatus.style.color = 'var(--color-error)';
      }

      resTime.textContent = `⏱️ ${duration} ms`;
      resSize.textContent = `📦 ${(new Blob([text]).size / 1024).toFixed(2)} KB`;
      responseBody.textContent = formatted;

      Utils.showToast(`請求完成 (${res.status})`, res.ok ? 'success' : 'error');
    } catch (err) {
      responseSection.style.display = 'block';
      resStatus.textContent = 'Network Error / CORS Blocked';
      resStatus.style.background = 'rgba(239, 68, 68, 0.15)';
      resStatus.style.color = 'var(--color-error)';
      resTime.textContent = '';
      resSize.textContent = '';
      responseBody.textContent = `錯誤訊息：${err.message}\n\nNOTE: 瀏覽器直接請求跨站 API 時若伺服器未開放 CORS 標頭可能被攔截。請確認目標 API 支援 CORS。`;
      Utils.showToast('請求失敗 (CORS 或網路錯誤)', 'error');
    } finally {
      btnSend.disabled = false;
      btnSend.textContent = '發送請求 ⚡';
    }
  });

  // 複製結果
  btnCopyResponse.addEventListener('click', () => {
    Utils.copyToClipboard(responseBody.textContent, '已複製響應內容');
  });

  // 預設載入範例
  btnLoadDemo.click();
});
