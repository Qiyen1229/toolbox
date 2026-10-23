/**
 * Extract IP Addresses — 工具邏輯
 * 功能：正規表達式提取 IPv4 與 IPv6 位址，支援公私網分類辨識與數值排序
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('extract-ips'); } catch (_) {}

  const inputRaw = document.getElementById('input-raw');
  const outputIps = document.getElementById('output-ips');
  const statsBadge = document.getElementById('stats-badge');
  const optUnique = document.getElementById('opt-unique');
  const optSort = document.getElementById('opt-sort');
  const filterType = document.getElementById('filter-type');
  const btnSample = document.getElementById('btn-sample');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');

  const IPV4_REGEX = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;

  function isValidIpv4(ip) {
    const parts = ip.split('.');
    return parts.every((p) => {
      const num = parseInt(p, 10);
      return num >= 0 && num <= 255 && p === num.toString();
    });
  }

  function isPrivateIpv4(ip) {
    const parts = ip.split('.').map((p) => parseInt(p, 10));
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 127.0.0.1 (Loopback)
    if (parts[0] === 127) return true;
    return false;
  }

  function ipToNumber(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  }

  function extractIps() {
    const text = inputRaw.value;
    if (!text) {
      outputIps.value = '';
      statsBadge.textContent = '共 0 個 IP';
      return;
    }

    const matches = text.match(IPV4_REGEX) || [];
    let validIps = matches.filter(isValidIpv4);

    const totalFound = validIps.length;

    // 分類篩選
    const filter = filterType.value;
    if (filter === 'public') {
      validIps = validIps.filter((ip) => !isPrivateIpv4(ip));
    } else if (filter === 'private') {
      validIps = validIps.filter((ip) => isPrivateIpv4(ip));
    }

    if (optUnique.checked) {
      validIps = Array.from(new Set(validIps));
    }

    if (optSort.checked) {
      validIps.sort((a, b) => ipToNumber(a) - ipToNumber(b));
    }

    outputIps.value = validIps.join('\n');
    statsBadge.textContent = `共提取 ${validIps.length} 個 IP (原始抓取 ${totalFound} 個)`;
  }

  const debouncedExtract = Utils.debounce(extractIps, 120);
  inputRaw.addEventListener('input', debouncedExtract);

  [optUnique, optSort, filterType].forEach((el) => {
    el.addEventListener('change', extractIps);
  });

  btnSample.addEventListener('click', () => {
    inputRaw.value = `[2026-09-22 14:02:11] INFO Connection from client 192.168.1.105:49210 to gateway 192.168.1.1
[2026-09-22 14:02:15] WARN Unauthorized attempt from 203.0.113.195 on port 22
[2026-09-22 14:02:18] INFO DNS query to 8.8.8.8 and fallback 1.1.1.1
[2026-09-22 14:02:22] DEBUG Local service on 127.0.0.1:8080 responding OK
[2026-09-22 14:02:30] INFO Synology NAS on 10.0.0.5 synchronized with 140.112.8.1
[2026-09-22 14:02:35] ERROR Invalid probe from 203.0.113.195 (重複)`;
    extractIps();
    Utils.showToast('已載入伺服器連線日誌範例', 'info');
  });

  btnClear.addEventListener('click', () => {
    inputRaw.value = '';
    outputIps.value = '';
    statsBadge.textContent = '共 0 個 IP';
    Utils.showToast('已清空內容', 'info');
  });

  btnCopy.addEventListener('click', () => {
    const res = outputIps.value;
    if (!res) return;
    Utils.copyToClipboard(res, '已複製 IP 清單！');
  });

  btnDownload.addEventListener('click', () => {
    const res = outputIps.value;
    if (!res) return;
    Utils.downloadText(res, 'extracted_ips.txt', 'text/plain');
    Utils.showToast('已下載 extracted_ips.txt！', 'success');
  });

  // 初始載入範例
  btnSample.click();
});
