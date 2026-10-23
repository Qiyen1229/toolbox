/**
 * Open Graph Preview — 工具邏輯
 * 功能：即時渲染 LINE / Discord / Facebook / Twitter 卡片與生成 Meta 標籤
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('og-preview'); } catch (_) {}

  const ogTitle = document.getElementById('og-title');
  const ogDesc = document.getElementById('og-desc');
  const ogImg = document.getElementById('og-img');
  const ogSite = document.getElementById('og-site');
  const ogUrl = document.getElementById('og-url');
  const mockContainer = document.getElementById('mock-container');
  const outputMeta = document.getElementById('output-meta');
  const btnSample = document.getElementById('btn-sample');
  const btnCopyTags = document.getElementById('btn-copy-tags');
  const platButtons = document.querySelectorAll('.btn-plat');

  let currentPlatform = 'line';

  function updatePreview() {
    const title = ogTitle.value.trim() || '網頁標題範例 (Title)';
    const desc = ogDesc.value.trim() || '這是一段網頁描述文字，當連結被分享到社群平台時會以預覽卡片的形式呈現給所有好友與追蹤者。';
    const img = ogImg.value.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';
    const site = ogSite.value.trim() || 'Qiyen Toolbox';
    const url = ogUrl.value.trim() || 'https://toolbox.qiyen.dev';

    let domain = 'example.com';
    try {
      const u = new URL(url.startsWith('http') ? url : `https://${url}`);
      domain = u.hostname;
    } catch (_) {}

    // 渲染各社群卡片
    if (currentPlatform === 'line') {
      mockContainer.innerHTML = `
        <div style="max-width: 320px; width: 100%; background: #ffffff; color: #111827; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.15); font-family: system-ui, sans-serif; border: 1px solid #e5e7eb;">
          <div style="height: 160px; background: #f3f4f6; overflow: hidden; display: flex; align-items: center; justify-content: center;">
            <img src="${Utils.escapeHtml(img)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'160\\' fill=\\'%23ccc\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%23eee\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'%23999\\' text-anchor=\\'middle\\'>圖片無效</text></svg>'">
          </div>
          <div style="padding: 12px 14px;">
            <div style="font-weight: 700; font-size: 0.9375rem; line-height: 1.35; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${Utils.escapeHtml(title)}
            </div>
            <div style="font-size: 0.8125rem; color: #6b7280; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 6px;">
              ${Utils.escapeHtml(desc)}
            </div>
            <div style="font-size: 0.75rem; color: #9ca3af;">${Utils.escapeHtml(domain)}</div>
          </div>
        </div>
      `;
    } else if (currentPlatform === 'discord') {
      mockContainer.innerHTML = `
        <div style="max-width: 400px; width: 100%; background: #2b2d31; color: #dbdee1; border-radius: 4px; border-left: 4px solid #5865F2; padding: 12px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-family: system-ui, sans-serif;">
          <div style="font-size: 0.75rem; color: #949ba4; margin-bottom: 4px;">${Utils.escapeHtml(site)}</div>
          <div style="font-size: 1rem; font-weight: 700; color: #00a8fc; margin-bottom: 6px; line-height: 1.3;">
            ${Utils.escapeHtml(title)}
          </div>
          <div style="font-size: 0.875rem; color: #dbdee1; line-height: 1.4; margin-bottom: 12px;">
            ${Utils.escapeHtml(desc)}
          </div>
          <div style="height: 180px; border-radius: 4px; overflow: hidden; background: #1e1f22;">
            <img src="${Utils.escapeHtml(img)}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        </div>
      `;
    } else if (currentPlatform === 'facebook') {
      mockContainer.innerHTML = `
        <div style="max-width: 420px; width: 100%; background: #ffffff; color: #050505; border: 1px solid #ced0d4; border-radius: 8px; overflow: hidden; font-family: system-ui, sans-serif; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="height: 210px; background: #f0f2f5; overflow: hidden;">
            <img src="${Utils.escapeHtml(img)}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 10px 14px; background: #f0f2f5;">
            <div style="font-size: 0.75rem; color: #65676b; text-transform: uppercase;">${Utils.escapeHtml(domain)}</div>
            <div style="font-size: 1rem; font-weight: 700; line-height: 1.3; margin: 3px 0; color: #050505; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${Utils.escapeHtml(title)}
            </div>
            <div style="font-size: 0.8125rem; color: #65676b; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">
              ${Utils.escapeHtml(desc)}
            </div>
          </div>
        </div>
      `;
    } else if (currentPlatform === 'twitter') {
      mockContainer.innerHTML = `
        <div style="max-width: 400px; width: 100%; background: #000000; color: #e7e9ea; border: 1px solid #2f3336; border-radius: 16px; overflow: hidden; font-family: system-ui, sans-serif;">
          <div style="height: 200px; background: #16181c; overflow: hidden;">
            <img src="${Utils.escapeHtml(img)}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 12px 14px;">
            <div style="font-size: 0.8125rem; color: #71767b; margin-bottom: 2px;">${Utils.escapeHtml(domain)}</div>
            <div style="font-size: 0.9375rem; font-weight: 700; color: #e7e9ea; line-height: 1.3; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${Utils.escapeHtml(title)}
            </div>
            <div style="font-size: 0.8125rem; color: #71767b; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${Utils.escapeHtml(desc)}
            </div>
          </div>
        </div>
      `;
    }

    // 生成 Meta HTML
    outputMeta.value = `<!-- Open Graph (Facebook, LINE, Discord) -->
<meta property="og:type" content="website">
<meta property="og:url" content="${Utils.escapeHtml(url)}">
<meta property="og:title" content="${Utils.escapeHtml(title)}">
<meta property="og:description" content="${Utils.escapeHtml(desc)}">
<meta property="og:image" content="${Utils.escapeHtml(img)}">
<meta property="og:site_name" content="${Utils.escapeHtml(site)}">

<!-- Twitter Card (X) -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${Utils.escapeHtml(title)}">
<meta name="twitter:description" content="${Utils.escapeHtml(desc)}">
<meta name="twitter:image" content="${Utils.escapeHtml(img)}">`;
  }

  // 監聽輸入
  [ogTitle, ogDesc, ogImg, ogSite, ogUrl].forEach((inp) => {
    inp.addEventListener('input', updatePreview);
  });

  // 切換平台按鈕
  platButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      platButtons.forEach((b) => b.classList.replace('btn--primary', 'btn--secondary'));
      btn.classList.replace('btn--secondary', 'btn--primary');
      currentPlatform = btn.dataset.plat;
      updatePreview();
    });
  });

  // 載入範例
  btnSample.addEventListener('click', () => {
    ogTitle.value = 'Qiyen Toolbox — 頂尖個人線上工具箱';
    ogDesc.value = '集結 80+ 款實用開發、設計、文件與日常工具，100% 瀏覽器本地執行，極速響應、隱私無虞！';
    ogImg.value = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80';
    ogSite.value = 'Qiyen Toolbox';
    ogUrl.value = 'https://toolbox.qiyen.dev/';
    updatePreview();
    Utils.showToast('已載入範例中繼資料', 'info');
  });

  // 複製標籤
  btnCopyTags.addEventListener('click', () => {
    if (!outputMeta.value) return;
    Utils.copyToClipboard(outputMeta.value, '已複製 Open Graph Meta 標籤');
  });

  // 初始化
  btnSample.click();
});
