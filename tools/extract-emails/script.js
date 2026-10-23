/**
 * Extract Emails — 工具邏輯
 * 功能：使用正規表達式精準萃取文字中的 Email，支援去重、排序與多種分隔符
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('extract-emails'); } catch (_) {}

  const inputRaw = document.getElementById('input-raw');
  const outputEmails = document.getElementById('output-emails');
  const statsBadge = document.getElementById('stats-badge');
  const optUnique = document.getElementById('opt-unique');
  const optSort = document.getElementById('opt-sort');
  const optLowercase = document.getElementById('opt-lowercase');
  const sepSelect = document.getElementById('sep-select');
  const btnSample = document.getElementById('btn-sample');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');

  const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  function extractEmails() {
    const text = inputRaw.value;
    if (!text) {
      outputEmails.value = '';
      statsBadge.textContent = '共 0 個信箱';
      return;
    }

    const matches = text.match(EMAIL_REGEX) || [];
    let list = matches.map((e) => optLowercase.checked ? e.toLowerCase() : e);

    const totalFound = list.length;

    if (optUnique.checked) {
      list = Array.from(new Set(list));
    }

    if (optSort.checked) {
      list.sort((a, b) => a.localeCompare(b));
    }

    const sep = sepSelect.value === '\\n' ? '\n' : sepSelect.value;
    outputEmails.value = list.join(sep);

    statsBadge.textContent = `共提取 ${list.length} 個信箱 (原始抓取 ${totalFound} 個)`;
  }

  const debouncedExtract = Utils.debounce(extractEmails, 120);
  inputRaw.addEventListener('input', debouncedExtract);

  [optUnique, optSort, optLowercase, sepSelect].forEach((el) => {
    el.addEventListener('change', extractEmails);
  });

  btnSample.addEventListener('click', () => {
    inputRaw.value = `歡迎聯絡我們的專案團隊：
專案負責人：qiyen.dev@example.com
技術支援信箱：support@qiyen.org 或 support@qiyen.org (重複)
公關合作：PR-team@company.co.uk
客服中心：contact.service_101@domain.com.tw
若有緊急狀況請發送郵件至 emergency@alert.io。`;
    extractEmails();
    Utils.showToast('已載入範例文字', 'info');
  });

  btnClear.addEventListener('click', () => {
    inputRaw.value = '';
    outputEmails.value = '';
    statsBadge.textContent = '共 0 個信箱';
    Utils.showToast('已清空內容', 'info');
  });

  btnCopy.addEventListener('click', () => {
    const res = outputEmails.value;
    if (!res) return;
    Utils.copyToClipboard(res, '已複製 Email 清單！');
  });

  btnDownload.addEventListener('click', () => {
    const res = outputEmails.value;
    if (!res) return;
    Utils.downloadText(res, 'extracted_emails.txt', 'text/plain');
    Utils.showToast('已下載 extracted_emails.txt！', 'success');
  });

  // 初始載入範例
  btnSample.click();
});
