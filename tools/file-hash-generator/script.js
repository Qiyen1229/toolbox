/**
 * File Hash Generator — 工具邏輯
 * 功能：本地計算檔案 SHA-256、SHA-1、SHA-512 與 MD5，支援雜湊比對驗證
 */

document.addEventListener('DOMContentLoaded', () => {
  // 記錄使用紀錄
  try { StorageManager?.addRecent?.('file-hash-generator'); } catch (_) {}

  // DOM 元素
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileInfoSection = document.getElementById('file-info-section');
  const hashResultsSection = document.getElementById('hash-results-section');
  const fileName = document.getElementById('file-name');
  const fileSize = document.getElementById('file-size');
  const fileType = document.getElementById('file-type');
  const hashSha256 = document.getElementById('hash-sha256');
  const hashMd5 = document.getElementById('hash-md5');
  const hashSha1 = document.getElementById('hash-sha1');
  const hashSha512 = document.getElementById('hash-sha512');
  const btnCopyAll = document.getElementById('btn-copy-all');
  const verifyInput = document.getElementById('verify-input');
  const verifyBadge = document.getElementById('verify-badge');

  /* ================================================================
     純 JS MD5 實作（支援 ArrayBuffer）
     ================================================================ */
  function calculateMd5(buffer) {
    const bytes = new Uint8Array(buffer);
    const n = bytes.length;

    // 輔助函式
    function safeAdd(x, y) {
      const lsw = (x & 0xffff) + (y & 0xffff);
      const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xffff);
    }
    function bitRol(num, cnt) {
      return (num << cnt) | (num >>> (32 - cnt));
    }
    function cmn(q, a, b, x, s, t) {
      return safeAdd(bitRol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
    }
    function ff(a, b, c, d, x, s, t) {
      return cmn((b & c) | (~b & d), a, b, x, s, t);
    }
    function gg(a, b, c, d, x, s, t) {
      return cmn((b & d) | (c & ~d), a, b, x, s, t);
    }
    function hh(a, b, c, d, x, s, t) {
      return cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function ii(a, b, c, d, x, s, t) {
      return cmn(c ^ (b | ~d), a, b, x, s, t);
    }

    // 將位元組陣列填充為 32-bit words
    const words = [];
    for (let i = 0; i < n; i++) {
      words[i >> 2] |= bytes[i] << ((i % 4) * 8);
    }
    words[n >> 2] |= 0x80 << ((n % 4) * 8);
    words[(((n + 8) >> 6) << 4) + 14] = n * 8;

    let a = 1732584193;
    let b = -271733879;
    let c = -1732584194;
    let d = 271733878;

    const len = words.length;
    for (let i = 0; i < len; i += 16) {
      const olda = a;
      const oldb = b;
      const oldc = c;
      const oldd = d;

      a = ff(a, b, c, d, words[i + 0] || 0, 7, -680876936);
      d = ff(d, a, b, c, words[i + 1] || 0, 12, -389564586);
      c = ff(c, d, a, b, words[i + 2] || 0, 17, 606105819);
      b = ff(b, c, d, a, words[i + 3] || 0, 22, -1044525330);
      a = ff(a, b, c, d, words[i + 4] || 0, 7, -176418897);
      d = ff(d, a, b, c, words[i + 5] || 0, 12, 1200080426);
      c = ff(c, d, a, b, words[i + 6] || 0, 17, -1473231341);
      b = ff(b, c, d, a, words[i + 7] || 0, 22, -45705983);
      a = ff(a, b, c, d, words[i + 8] || 0, 7, 1770035416);
      d = ff(d, a, b, c, words[i + 9] || 0, 12, -1958414417);
      c = ff(c, d, a, b, words[i + 10] || 0, 17, -42063);
      b = ff(b, c, d, a, words[i + 11] || 0, 22, -1990404162);
      a = ff(a, b, c, d, words[i + 12] || 0, 7, 1804603682);
      d = ff(d, a, b, c, words[i + 13] || 0, 12, -40341101);
      c = ff(c, d, a, b, words[i + 14] || 0, 17, -1502002290);
      b = ff(b, c, d, a, words[i + 15] || 0, 22, 1236535329);

      a = gg(a, b, c, d, words[i + 1] || 0, 5, -165796510);
      d = gg(d, a, b, c, words[i + 6] || 0, 9, -1069501632);
      c = gg(c, d, a, b, words[i + 11] || 0, 14, 643717713);
      b = gg(b, c, d, a, words[i + 0] || 0, 20, -373897302);
      a = gg(a, b, c, d, words[i + 5] || 0, 5, -701558691);
      d = gg(d, a, b, c, words[i + 10] || 0, 9, 38016083);
      c = gg(c, d, a, b, words[i + 15] || 0, 14, -660478335);
      b = gg(b, c, d, a, words[i + 4] || 0, 20, -405537848);
      a = gg(a, b, c, d, words[i + 9] || 0, 5, 568446438);
      d = gg(d, a, b, c, words[i + 14] || 0, 9, -1019803690);
      c = gg(c, d, a, b, words[i + 3] || 0, 14, -187363961);
      b = gg(b, c, d, a, words[i + 8] || 0, 20, 1163531501);
      a = gg(a, b, c, d, words[i + 13] || 0, 5, -1444681467);
      d = gg(d, a, b, c, words[i + 2] || 0, 9, -51403784);
      c = gg(c, d, a, b, words[i + 7] || 0, 14, 1735328473);
      b = gg(b, c, d, a, words[i + 12] || 0, 20, -1926607734);

      a = hh(a, b, c, d, words[i + 5] || 0, 4, -378558);
      d = hh(d, a, b, c, words[i + 8] || 0, 11, -2022574463);
      c = hh(c, d, a, b, words[i + 11] || 0, 16, 1839030562);
      b = hh(b, c, d, a, words[i + 14] || 0, 23, -35309556);
      a = hh(a, b, c, d, words[i + 1] || 0, 4, -1530992060);
      d = hh(d, a, b, c, words[i + 4] || 0, 11, 1272893353);
      c = hh(c, d, a, b, words[i + 7] || 0, 16, -155497632);
      b = hh(b, c, d, a, words[i + 10] || 0, 23, -1094730640);
      a = hh(a, b, c, d, words[i + 13] || 0, 4, 681279174);
      d = hh(d, a, b, c, words[i + 0] || 0, 11, -358537222);
      c = hh(c, d, a, b, words[i + 3] || 0, 16, -722521979);
      b = hh(b, c, d, a, words[i + 6] || 0, 23, 76029189);
      a = hh(a, b, c, d, words[i + 9] || 0, 4, -640364487);
      d = hh(d, a, b, c, words[i + 12] || 0, 11, -421815835);
      c = hh(c, d, a, b, words[i + 15] || 0, 16, 530742520);
      b = hh(b, c, d, a, words[i + 2] || 0, 23, -995338651);

      a = ii(a, b, c, d, words[i + 0] || 0, 6, -198630844);
      d = ii(d, a, b, c, words[i + 7] || 0, 10, 1126891415);
      c = ii(c, d, a, b, words[i + 14] || 0, 15, -1416354905);
      b = ii(b, c, d, a, words[i + 5] || 0, 21, -57434055);
      a = ii(a, b, c, d, words[i + 12] || 0, 6, 1700485571);
      d = ii(d, a, b, c, words[i + 3] || 0, 10, -1894986606);
      c = ii(c, d, a, b, words[i + 10] || 0, 15, -1051523);
      b = ii(b, c, d, a, words[i + 1] || 0, 21, -2054922799);
      a = ii(a, b, c, d, words[i + 8] || 0, 6, 1873313359);
      d = ii(d, a, b, c, words[i + 15] || 0, 10, -30611744);
      c = ii(c, d, a, b, words[i + 6] || 0, 15, -1560198380);
      b = ii(b, c, d, a, words[i + 13] || 0, 21, 1309151649);
      a = ii(a, b, c, d, words[i + 4] || 0, 6, -145523070);
      d = ii(d, a, b, c, words[i + 11] || 0, 10, -1120210379);
      c = ii(c, d, a, b, words[i + 2] || 0, 15, 718787259);
      b = ii(b, c, d, a, words[i + 9] || 0, 21, -343485551);

      a = safeAdd(a, olda);
      b = safeAdd(b, oldb);
      c = safeAdd(c, oldc);
      d = safeAdd(d, oldd);
    }

    // 格式化為 hex 字串
    function wordToHex(val) {
      let str = '';
      for (let j = 0; j < 4; j++) {
        const byte = (val >> (j * 8)) & 0xff;
        str += byte.toString(16).padStart(2, '0');
      }
      return str;
    }

    return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
  }

  /* ================================================================
     檔案處理與 Hash 計算
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
      processFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      processFile(fileInput.files[0]);
    }
  });

  async function processFile(file) {
    fileName.textContent = file.name;
    fileSize.textContent = Utils.formatFileSize(file.size);
    fileType.textContent = file.type || '未指定 (binary)';
    fileInfoSection.style.display = 'block';

    hashSha256.value = '計算中…';
    hashMd5.value = '計算中…';
    hashSha1.value = '計算中…';
    hashSha512.value = '計算中…';
    hashResultsSection.style.display = 'block';

    try {
      const buffer = await file.arrayBuffer();

      // MD5 (純 JS，任何環境皆可運行)
      hashMd5.value = calculateMd5(buffer);

      const subtle = typeof window !== 'undefined' && window.crypto && window.crypto.subtle;
      if (subtle) {
        // 1. SHA-256
        const sha256Buf = await subtle.digest('SHA-256', buffer);
        hashSha256.value = bufferToHex(sha256Buf);

        // 3. SHA-1
        const sha1Buf = await subtle.digest('SHA-1', buffer);
        hashSha1.value = bufferToHex(sha1Buf);

        // 4. SHA-512
        const sha512Buf = await subtle.digest('SHA-512', buffer);
        hashSha512.value = bufferToHex(sha512Buf);
      } else {
        const tip = '瀏覽器安全限制 (需在 localhost 或 HTTPS 環境使用)';
        hashSha256.value = tip;
        hashSha1.value = tip;
        hashSha512.value = tip;
      }

      checkVerification();
    } catch (err) {
      Utils.showToast(`計算失敗：${err.message}`, 'error');
    }
  }

  function bufferToHex(buffer) {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  /* ================================================================
     比對驗證
     ================================================================ */

  verifyInput.addEventListener('input', checkVerification);

  function checkVerification() {
    const val = verifyInput.value.trim().toLowerCase();
    if (!val) {
      verifyBadge.style.display = 'none';
      return;
    }

    const sha256 = hashSha256.value.toLowerCase();
    const md5 = hashMd5.value.toLowerCase();
    const sha1 = hashSha1.value.toLowerCase();
    const sha512 = hashSha512.value.toLowerCase();

    if (val === sha256 || val === md5 || val === sha1 || val === sha512) {
      verifyBadge.style.display = 'inline-block';
      verifyBadge.textContent = '✅ 雜湊校驗碼相符！';
      verifyBadge.style.background = 'var(--color-success-light)';
      verifyBadge.style.color = 'var(--color-success)';
    } else {
      verifyBadge.style.display = 'inline-block';
      verifyBadge.textContent = '❌ 校驗碼不相符';
      verifyBadge.style.background = 'var(--color-error-light)';
      verifyBadge.style.color = 'var(--color-error)';
    }
  }

  /* ================================================================
     複製功能
     ================================================================ */

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-copy-hash');
    if (!btn) return;
    const target = document.getElementById(btn.dataset.target);
    if (target && target.value && target.value !== '計算中…') {
      Utils.copyToClipboard(target.value);
    }
  });

  btnCopyAll.addEventListener('click', () => {
    const lines = [
      `檔案名稱：${fileName.textContent}`,
      `檔案大小：${fileSize.textContent}`,
      `SHA-256: ${hashSha256.value}`,
      `MD5:     ${hashMd5.value}`,
      `SHA-1:   ${hashSha1.value}`,
      `SHA-512: ${hashSha512.value}`,
    ];
    Utils.copyToClipboard(lines.join('\n'));
  });
});
