/**
 * JWT Decoder 實作腳本
 */
document.addEventListener('DOMContentLoaded', () => {
  StorageManager.addRecent('jwt-decoder');

  const jwtInput = document.getElementById('jwt-input');
  const headerOutput = document.getElementById('header-output');
  const payloadOutput = document.getElementById('payload-output');
  const payloadMeta = document.getElementById('payload-meta');
  const sigOutput = document.getElementById('sig-output');
  const btnDemo = document.getElementById('btn-demo');
  const btnClear = document.getElementById('btn-clear');
  const btnCopyHeader = document.getElementById('btn-copy-header');
  const btnCopyPayload = document.getElementById('btn-copy-payload');

  const DEMO_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlFpeWVuIFVzZXIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzkzODkyMDAsImV4cCI6MTgwMjQ2MjgwMH0.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

  // Base64Url 解碼
  function base64UrlDecode(str) {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
      case 0: break;
      case 2: output += '=='; break;
      case 3: output += '='; break;
      default: throw new Error('Base64Url 長度非法');
    }
    return decodeURIComponent(escape(atob(output)));
  }

  function decodeJwt() {
    const raw = jwtInput.value.trim();
    if (!raw) {
      headerOutput.textContent = '請貼上有效的 JWT 字串';
      payloadOutput.textContent = '';
      payloadMeta.innerHTML = '';
      sigOutput.textContent = '';
      return;
    }

    const parts = raw.split('.');
    if (parts.length < 2) {
      headerOutput.textContent = '❌ JWT 格式錯誤：必須由 2 或 3 個點分隔部分組成';
      payloadOutput.textContent = '';
      payloadMeta.innerHTML = '';
      sigOutput.textContent = '';
      return;
    }

    try {
      // 1. Header
      const headerStr = base64UrlDecode(parts[0]);
      const headerObj = JSON.parse(headerStr);
      headerOutput.textContent = JSON.stringify(headerObj, null, 2);

      // 2. Payload
      const payloadStr = base64UrlDecode(parts[1]);
      const payloadObj = JSON.parse(payloadStr);
      payloadOutput.textContent = JSON.stringify(payloadObj, null, 2);

      // 檢驗 Claims (exp, iat)
      let metaHtml = '';
      if (payloadObj.exp) {
        const expDate = new Date(payloadObj.exp * 1000);
        const isExpired = Date.now() > expDate.getTime();
        metaHtml += `
          <div style="padding: 6px 12px; border-radius: var(--radius-sm); margin-bottom: 6px; font-weight: 600; background: ${isExpired ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${isExpired ? 'var(--color-error)' : 'var(--color-success)'}">
            ${isExpired ? '⚠️ Token 已過期' : '✅ Token 仍有效'} (到期時間：${expDate.toLocaleString()})
          </div>
        `;
      }
      if (payloadObj.iat) {
        const iatDate = new Date(payloadObj.iat * 1000);
        metaHtml += `<div style="color: var(--color-text-tertiary); font-size: 0.75rem;">簽發時間 (iat)：${iatDate.toLocaleString()}</div>`;
      }
      payloadMeta.innerHTML = metaHtml;

      // 3. Signature
      if (parts[2]) {
        sigOutput.textContent = `HMACSHA256( base64UrlEncode(header) + "." + base64UrlEncode(payload), secret )\nSignature: ${parts[2]}`;
      } else {
        sigOutput.textContent = '無簽名 (Unsigned Token)';
      }
    } catch (err) {
      headerOutput.textContent = `解碼失敗：${err.message}`;
      payloadOutput.textContent = '';
      payloadMeta.innerHTML = '';
      sigOutput.textContent = '';
    }
  }

  jwtInput.addEventListener('input', decodeJwt);

  btnDemo.addEventListener('click', () => {
    jwtInput.value = DEMO_JWT;
    decodeJwt();
    Utils.showToast('已載入示範 Token', 'info');
  });

  btnClear.addEventListener('click', () => {
    jwtInput.value = '';
    decodeJwt();
    jwtInput.focus();
  });

  btnCopyHeader.addEventListener('click', () => {
    Utils.copyToClipboard(headerOutput.textContent, '已複製 Header');
  });

  btnCopyPayload.addEventListener('click', () => {
    Utils.copyToClipboard(payloadOutput.textContent, '已複製 Payload');
  });

  // 預設載入範例
  btnDemo.click();
});
