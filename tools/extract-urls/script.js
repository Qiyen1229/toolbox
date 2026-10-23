/**
 * Extract URLs — 工具邏輯
 * 功能：正規表達式精準萃取文字中的 URL 網址與主網域名稱
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('extract-urls'); } catch (_) {}

  const inputRaw = document.getElementById('input-raw');
  const outputUrls = document.getElementById('output-urls');
  const statsBadge = document.getElementById('stats-badge');
  const optUnique = document.getElementById('opt-unique');
  const optDomainOnly = document.getElementById('opt-domain-only');
  const optSort = document.getElementById('opt-sort');
  const btnSample = document.getElementById('btn-sample');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');

  const URL_REGEX = /https?:\/\/[^\s<>"'{}|\\^`]+[^\s<>"'{}|\\^`.,;:?!]/g;

  function extractUrls() {
    const text = inputRaw.value;
    if (!text) {
      outputUrls.value = '';
      statsBadge.textContent = '共 0 個網址';
      return;
    }

    const matches = text.match(URL_REGEX) || [];
    let list = matches;

    if (optDomainOnly.checked) {
      list = list.map((u) => {
        try {
          const parsed = new URL(u);
          return parsed.hostname;
        } catch (_) {
          return u;
        }
      });
    }

    const totalFound = list.length;

    if (optUnique.checked) {
      list = Array.from(new Set(list));
    }

    if (optSort.checked) {
      list.sort((a, b) => a.localeCompare(b));
    }

    outputUrls.value = list.join('\n');
    statsBadge.textContent = `共提取 ${list.length} 個網址 (原始抓取 ${totalFound} 個)`;
  }

  const debouncedExtract = Utils.debounce(extractUrls, 120);
  inputRaw.addEventListener('input', debouncedExtract);

  [optUnique, optDomainOnly, optSort].forEach((el) => {
    el.addEventListener('change', extractUrls);
  });

  btnSample.addEventListener('click', () => {
    inputRaw.value = `歡迎參考以下參考資源：
1. 官方專案庫：https://github.com/qiyen/toolbox/releases/v2.0
2. Google 搜尋：https://www.google.com/search?q=taiwan&hl=zh-TW
3. 台北商業大學校網：https://www.ntub.edu.tw/
4. 重複網址測試：https://github.com/qiyen/toolbox/releases/v2.0
5. 文章分享：https://developer.mozilla.org/zh-TW/docs/Web/JavaScript`;
    extractUrls();
    Utils.showToast('已載入範例文字', 'info');
  });

  btnClear.addEventListener('click', () => {
    inputRaw.value = '';
    outputUrls.value = '';
    statsBadge.textContent = '共 0 個網址';
    Utils.showToast('已清空內容', 'info');
  });

  btnCopy.addEventListener('click', () => {
    const res = outputUrls.value;
    if (!res) return;
    Utils.copyToClipboard(res, '已複製網址清單！');
  });

  btnDownload.addEventListener('click', () => {
    const res = outputUrls.value;
    if (!res) return;
    Utils.downloadText(res, 'extracted_urls.txt', 'text/plain');
    Utils.showToast('已下載 extracted_urls.txt！', 'success');
  });

  // 初始載入範例
  btnSample.click();
});
