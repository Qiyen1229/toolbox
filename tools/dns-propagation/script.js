/**
 * DNS Propagation Checker — 工具邏輯
 * 功能：平行向 Google、Cloudflare、Quad9、AdGuard 等發起 DoH 查詢，驗證全球傳播狀態
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('dns-propagation'); } catch (_) {}

  const domainInput = document.getElementById('domain-input');
  const recordType = document.getElementById('record-type');
  const btnCheck = document.getElementById('btn-check');
  const statusTitle = document.getElementById('status-title');
  const summaryBadge = document.getElementById('summary-badge');
  const nodesGrid = document.getElementById('nodes-grid');

  const SERVERS = [
    {
      id: 'cf',
      name: 'Cloudflare DNS',
      ip: '1.1.1.1',
      region: '全球 Anycast (台灣/香港節點)',
      url: (domain, type) => `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`,
      headers: { 'Accept': 'application/dns-json' },
      parse: (json) => json.Answer ? json.Answer.map((a) => a.data) : [],
    },
    {
      id: 'google',
      name: 'Google Public DNS',
      ip: '8.8.8.8',
      region: '全球 Anycast (Google 機房)',
      url: (domain, type) => `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`,
      headers: { 'Accept': 'application/json' },
      parse: (json) => json.Answer ? json.Answer.map((a) => a.data) : [],
    },
    {
      id: 'quad9',
      name: 'Quad9 DNS (瑞士)',
      ip: '9.9.9.9',
      region: '歐洲 / 全球隱私節點',
      url: (domain, type) => `https://dns.quad9.net:5053/dns-query?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`,
      headers: { 'Accept': 'application/dns-json' },
      parse: (json) => json.Answer ? json.Answer.map((a) => a.data) : [],
    },
    {
      id: 'adguard',
      name: 'AdGuard DNS (賽普勒斯)',
      ip: '94.140.14.14',
      region: '歐洲 / 廣告防護節點',
      url: (domain, type) => `https://dns.adguard-dns.com/resolve?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`,
      headers: { 'Accept': 'application/json' },
      parse: (json) => json.Answer ? json.Answer.map((a) => a.data) : [],
    },
    {
      id: 'cf-security',
      name: 'Cloudflare Security',
      ip: '1.1.1.2',
      region: '美洲 / 亞太惡意軟體攔截節點',
      url: (domain, type) => `https://security.cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`,
      headers: { 'Accept': 'application/dns-json' },
      parse: (json) => json.Answer ? json.Answer.map((a) => a.data) : [],
    }
  ];

  async function checkPropagation() {
    let domain = domainInput.value.trim().toLowerCase();
    if (!domain) {
      Utils.showToast('請輸入網域名稱', 'warning');
      return;
    }

    domain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    domainInput.value = domain;
    const type = recordType.value;

    btnCheck.disabled = true;
    btnCheck.textContent = '檢查中…';
    statusTitle.textContent = `${domain} — 正在向全球各大節點發送查詢…`;
    summaryBadge.textContent = '查詢中…';
    summaryBadge.style.color = 'var(--color-warning)';

    // 初始化卡片外觀
    nodesGrid.innerHTML = SERVERS.map((s) => `
      <div id="card-${s.id}" style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: 700; font-size: 0.9375rem;">${s.name}</span>
            <span id="badge-${s.id}" style="font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; background: var(--color-surface); border: 1px solid var(--color-border);">連線中…</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--color-text-tertiary); margin-bottom: 12px;">
            IP: ${s.ip} · ${s.region}
          </div>
          <div id="data-${s.id}" style="font-family: var(--font-mono, monospace); font-size: 0.8125rem; word-break: break-all; min-height: 42px; color: var(--color-text-secondary);">
            等待回應…
          </div>
        </div>
        <div style="margin-top: 10px; font-size: 0.75rem; color: var(--color-text-tertiary);" id="rtt-${s.id}">
          延遲：-- ms
        </div>
      </div>
    `).join('');

    let successCount = 0;

    const queries = SERVERS.map(async (server) => {
      const cardBadge = document.getElementById(`badge-${server.id}`);
      const dataEl = document.getElementById(`data-${server.id}`);
      const rttEl = document.getElementById(`rtt-${server.id}`);

      const start = performance.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(server.url(domain, type), {
          headers: server.headers,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const rtt = Math.round(performance.now() - start);
        rttEl.textContent = `延遲：${rtt} ms`;

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const answers = server.parse(json);

        if (answers.length > 0) {
          successCount++;
          cardBadge.textContent = '✅ 已生效';
          cardBadge.style.background = 'var(--color-success-light)';
          cardBadge.style.color = 'var(--color-success)';
          cardBadge.style.borderColor = 'transparent';
          cardBadge.style.fontWeight = '700';
          dataEl.innerHTML = answers.map((ans) => `<div>${Utils.escapeHtml(ans)}</div>`).join('');
          dataEl.style.color = 'var(--color-text-primary)';
        } else {
          cardBadge.textContent = '⚠ 查無紀錄';
          cardBadge.style.background = 'var(--color-warning-light)';
          cardBadge.style.color = 'var(--color-warning)';
          cardBadge.style.borderColor = 'transparent';
          dataEl.textContent = '伺服器未回傳此類型解析紀錄';
        }
      } catch (err) {
        cardBadge.textContent = '❌ 連線異常';
        cardBadge.style.background = 'var(--color-error-light)';
        cardBadge.style.color = 'var(--color-error)';
        cardBadge.style.borderColor = 'transparent';
        dataEl.textContent = `查詢失敗 (${err.name === 'AbortError' ? '超時' : err.message})`;
      }
    });

    await Promise.allSettled(queries);

    btnCheck.disabled = false;
    btnCheck.textContent = '檢查全球傳播';
    statusTitle.textContent = `${domain} — 檢查完成`;
    summaryBadge.textContent = `成功比對：${successCount} / ${SERVERS.length} 節點`;
    summaryBadge.style.color = successCount >= 3 ? 'var(--color-success)' : 'var(--color-warning)';
    Utils.showToast(`傳播檢查完成，${successCount} 個節點已解析！`, 'info');
  }

  btnCheck.addEventListener('click', checkPropagation);
  domainInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkPropagation();
  });
  recordType.addEventListener('change', checkPropagation);

  // 初始執行一次
  checkPropagation();
});
