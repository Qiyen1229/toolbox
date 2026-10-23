/**
 * IP & DNS Lookup 實作腳本
 */
document.addEventListener('DOMContentLoaded', () => {
  StorageManager.addRecent('ip-lookup');

  const myIp = document.getElementById('my-ip');
  const myIsp = document.getElementById('my-isp');
  const btnRefreshIp = document.getElementById('btn-refresh-ip');
  const domainInput = document.getElementById('domain-input');
  const recordType = document.getElementById('record-type');
  const btnQueryDns = document.getElementById('btn-query-dns');
  const dnsTbody = document.getElementById('dns-tbody');
  const dnsLoading = document.getElementById('dns-loading');

  // 1. 檢測本機外網 IP
  async function fetchMyIp() {
    myIp.textContent = '檢測中...';
    myIsp.textContent = '-';

    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      myIp.textContent = data.ip;

      // 嘗試獲取地區或 ISP
      try {
        const geoRes = await fetch(`https://ipapi.co/${data.ip}/json/`);
        const geo = await geoRes.json();
        myIsp.textContent = `${geo.org || geo.asn || 'Internet Service'} (${geo.city || ''}, ${geo.country_name || ''})`;
      } catch {
        myIsp.textContent = '已成功取得 IP 位址';
      }
    } catch (err) {
      myIp.textContent = '無法取得 (請檢查網路)';
      myIsp.textContent = err.message;
    }
  }

  btnRefreshIp.addEventListener('click', fetchMyIp);

  // 2. 透過 Cloudflare DNS-over-HTTPS (DoH) 查詢 DNS
  async function queryDns() {
    const domain = domainInput.value.trim();
    if (!domain) {
      Utils.showToast('請輸入網域名稱', 'warning');
      return;
    }

    const type = recordType.value;
    dnsLoading.style.display = 'block';
    dnsTbody.innerHTML = '';

    try {
      // Cloudflare DoH API
      const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/dns-json' }
      });
      const data = await res.json();
      dnsLoading.style.display = 'none';

      if (!data.Answer || data.Answer.length === 0) {
        dnsTbody.innerHTML = `<tr><td colspan="4" style="padding: 16px; text-align: center; color: var(--color-text-tertiary);">未查獲 ${type} 記錄</td></tr>`;
        return;
      }

      dnsTbody.innerHTML = data.Answer.map(rec => `
        <tr style="border-bottom: 1px solid var(--color-border);">
          <td style="padding: 10px 16px; font-family: var(--font-mono, monospace);">${Utils.escapeHtml(rec.name)}</td>
          <td style="padding: 10px 16px; font-weight: 700; color: var(--color-tech-cyan); font-family: var(--font-mono, monospace);">${type}</td>
          <td style="padding: 10px 16px; font-family: var(--font-mono, monospace);">${rec.TTL}s</td>
          <td style="padding: 10px 16px; font-family: var(--font-mono, monospace); font-weight: 600; color: var(--color-text-primary); word-break: break-all;">${Utils.escapeHtml(rec.data)}</td>
        </tr>
      `).join('');

      Utils.showToast(`已取得 ${data.Answer.length} 筆 DNS 記錄`, 'success');
    } catch (err) {
      dnsLoading.style.display = 'none';
      dnsTbody.innerHTML = `<tr><td colspan="4" style="padding: 16px; text-align: center; color: var(--color-error);">DNS 查詢失敗：${Utils.escapeHtml(err.message)}</td></tr>`;
    }
  }

  btnQueryDns.addEventListener('click', queryDns);

  domainInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') queryDns();
  });

  // 初始化
  fetchMyIp();
  queryDns();
});
