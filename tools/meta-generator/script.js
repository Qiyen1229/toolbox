/**
 * Meta Tag Generator — 工具邏輯
 * 功能：即時組裝 SEO Meta、Open Graph、Twitter Card 與 PWA 標籤
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('meta-generator'); } catch (_) {}

  const metaTitle = document.getElementById('meta-title');
  const metaDesc = document.getElementById('meta-desc');
  const metaKeywords = document.getElementById('meta-keywords');
  const metaAuthor = document.getElementById('meta-author');
  const metaUrl = document.getElementById('meta-url');
  const metaImage = document.getElementById('meta-image');
  const metaRobots = document.getElementById('meta-robots');
  const metaTheme = document.getElementById('meta-theme');
  const metaOutput = document.getElementById('meta-output');
  const btnSample = document.getElementById('btn-sample');
  const btnCopyCode = document.getElementById('btn-copy-code');
  const btnDownloadHtml = document.getElementById('btn-download-html');

  function generateMetaTags() {
    const title = metaTitle.value.trim() || '網站標題範例';
    const desc = metaDesc.value.trim() || '網站精簡描述文字，適合展示於搜尋結果摘要。';
    const keywords = metaKeywords.value.trim();
    const author = metaAuthor.value.trim();
    const url = metaUrl.value.trim() || 'https://example.com/';
    const img = metaImage.value.trim() || 'https://example.com/cover.jpg';
    const robots = metaRobots.value;
    const theme = metaTheme.value;

    let lines = [
      '<!-- 基本 SEO 中繼標籤 -->',
      `<title>${Utils.escapeHtml(title)}</title>`,
      '<meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      `<meta name="description" content="${Utils.escapeHtml(desc)}">`,
    ];

    if (keywords) {
      lines.push(`<meta name="keywords" content="${Utils.escapeHtml(keywords)}">`);
    }
    if (author) {
      lines.push(`<meta name="author" content="${Utils.escapeHtml(author)}">`);
    }
    if (robots) {
      lines.push(`<meta name="robots" content="${robots}">`);
    }
    if (theme) {
      lines.push(`<meta name="theme-color" content="${theme}">`);
    }
    if (url) {
      lines.push(`<link rel="canonical" href="${Utils.escapeHtml(url)}">`);
    }

    lines.push('');
    lines.push('<!-- Open Graph / Facebook / LINE -->');
    lines.push('<meta property="og:type" content="website">');
    lines.push(`<meta property="og:url" content="${Utils.escapeHtml(url)}">`);
    lines.push(`<meta property="og:title" content="${Utils.escapeHtml(title)}">`);
    lines.push(`<meta property="og:description" content="${Utils.escapeHtml(desc)}">`);
    lines.push(`<meta property="og:image" content="${Utils.escapeHtml(img)}">`);

    lines.push('');
    lines.push('<!-- Twitter Card (X) -->');
    lines.push('<meta name="twitter:card" content="summary_large_image">');
    lines.push(`<meta name="twitter:url" content="${Utils.escapeHtml(url)}">`);
    lines.push(`<meta name="twitter:title" content="${Utils.escapeHtml(title)}">`);
    lines.push(`<meta name="twitter:description" content="${Utils.escapeHtml(desc)}">`);
    lines.push(`<meta name="twitter:image" content="${Utils.escapeHtml(img)}">`);

    metaOutput.value = lines.join('\n');
  }

  [metaTitle, metaDesc, metaKeywords, metaAuthor, metaUrl, metaImage, metaRobots, metaTheme].forEach((el) => {
    el.addEventListener('input', generateMetaTags);
    el.addEventListener('change', generateMetaTags);
  });

  btnSample.addEventListener('click', () => {
    metaTitle.value = 'Qiyen Toolbox — 頂尖個人線上工具箱';
    metaDesc.value = '純前端執行的全方位實用工具箱，涵蓋開發、設計、PDF 與日常計算工具，極速安全無資料庫依賴。';
    metaKeywords.value = '工具箱, 個人工具, PDF處理, 圖片壓縮, 格式轉換, 開發者工具';
    metaAuthor.value = 'Qiyen';
    metaUrl.value = 'https://toolbox.qiyen.dev/';
    metaImage.value = 'https://toolbox.qiyen.dev/assets/cover.png';
    metaRobots.value = 'index, follow';
    metaTheme.value = '#0b1120';
    generateMetaTags();
    Utils.showToast('已載入範例 SEO 標籤資訊', 'info');
  });

  btnCopyCode.addEventListener('click', () => {
    if (!metaOutput.value) return;
    Utils.copyToClipboard(metaOutput.value, '已複製完整 HTML Meta 標籤！');
  });

  btnDownloadHtml.addEventListener('click', () => {
    if (!metaOutput.value) return;
    Utils.downloadText(metaOutput.value, 'head-meta.html', 'text/html');
    Utils.showToast('已下載 head-meta.html 檔案！', 'success');
  });

  // 初始載入範例
  btnSample.click();
});
