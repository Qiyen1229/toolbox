/**
 * DNS Record Lookup — 工具邏輯
 * 功能：透過 Cloudflare DNS-over-HTTPS (DoH) API 純前端直查各類型 DNS 紀錄
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('dns-lookup'); } catch (_) {}

  const domainInput = document.getElementById('domain-input');
  const recordType = document.getElementById('record-type');
  const btnLookup = document.getElementById('btn-lookup');
  const resultSection = document.getElementById('result-section');
  const resultTitle = document.getElementById('result-title');
  const recordsTbody = document.getElementById('records-tbody');
  const btnCopyResult = document.getElementById('btn-copy-result');
  const presetButtons = document.querySelectorAll('.btn-preset');

  let currentRecords = [];

  async function performDnsLookup() {
    let domain = domainInput.value.trim().toLowerCase();
    if (!domain) {
      Utils.showToast('請輸入要查詢的網域名稱', 'warning');
      return;
    }

    // 去除使用者可能誤貼的 http:// 或結尾斜線
    domain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    domainInput.value = domain;

    const type = recordType.value;
    btnLookup.disabled = true;
    btnLookup.textContent = '查詢中…';

    try {
      // 透過 Cloudflare 官方 DoH 端點查詢
      const endpoint = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`;
      const res = await fetch(endpoint, {
        headers: { 'Accept': 'application/dns-json' },
      });

      if (!res.ok) {
        throw new Error(`HTTP 錯誤 ${res.status}`);
      }

      const json = await res.json();
      resultSection.style.display = 'block';

      if (!json.Answer || json.Answer.length === 0) {
        recordsTbody.innerHTML = `
          <tr>
            <td colspan="4" style="padding: 24px; text-align: center; color: var(--color-text-tertiary);">
              未查詢到此網域的 <strong>${type}</strong> 紀錄（可能尚未設定或不存在）。
            </td>
          </tr>
        `;
        resultTitle.textContent = `${domain} — 查無 ${type} 紀錄`;
        currentRecords = [];
        return;
      }

      currentRecords = json.Answer;
      resultTitle.textContent = `${domain} — 共找到 ${json.Answer.length} 筆 ${type} 紀錄`;

      // 類型數字對應名稱
      const TYPE_MAP = {
        1: 'A',
        28: 'AAAA',
        5: 'CNAME',
        15: 'MX',
        16: 'TXT',
        2: 'NS',
        6: 'SOA',
      };

      recordsTbody.innerHTML = json.Answer.map((rec) => {
        const typeName = TYPE_MAP[rec.type] || rec.type;
        return `
          <tr style="border-bottom: 1px solid var(--color-border);">
            <td style="padding: 10px 14px; font-weight: 700; color: var(--color-accent);">${typeName}</td>
            <td style="padding: 10px 14px; word-break: break-all;">${Utils.escapeHtml(rec.name)}</td>
            <td style="padding: 10px 14px; color: var(--color-text-tertiary);">${rec.TTL}s</td>
            <td style="padding: 10px 14px; word-break: break-all; font-family: var(--font-mono, monospace);">
              ${Utils.escapeHtml(rec.data)}
            </td>
          </tr>
        `;
      }).join('');

      Utils.showToast(`成功取得 ${json.Answer.length} 筆 DNS 紀錄`, 'success');
    } catch (err) {
      console.error(err);
      Utils.showToast(`查詢失敗：${err.message}（請檢查網路連線）`, 'error');
    } finally {
      btnLookup.disabled = false;
      btnLookup.textContent = '查詢 DNS';
    }
  }

  btnLookup.addEventListener('click', performDnsLookup);
  domainInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performDnsLookup();
  });
  recordType.addEventListener('change', performDnsLookup);

  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      domainInput.value = btn.dataset.domain;
      performDnsLookup();
    });
  });

  btnCopyResult.addEventListener('click', () => {
    if (currentRecords.length === 0) return;
    const lines = currentRecords.map((r) => `${r.name}\t${r.TTL}\t${r.data}`);
    Utils.copyToClipboard(lines.join('\n'), '已複製 DNS 紀錄列表');
  });

  // 初始查詢一次
  performDnsLookup();
});
