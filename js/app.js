/**
 * Qiyen Toolbox — Homepage App
 * 首頁邏輯：搜尋、分類篩選、渲染工具卡片、最近使用
 */

const App = (() => {
  /** 目前選中的分類（null 表示全部） */
  let activeCategory = null;

  /** 目前搜尋關鍵字 */
  let searchQuery = '';

  /** 開發者模式狀態 */
  let isDevMode = false;

  /* ================================================================
     初始化
     ================================================================ */

  function init() {
    ThemeManager.init();
    isDevMode = StorageManager.isDevMode();
    bindDevModeToggle();
    renderCategoryBar();
    renderToolCards();
    renderRecentTools();
    bindSearchEvents();
    bindMobileSearchToggle();
    recordPageVisit();
    initHeroEffects();
    updateToolCount();
  }

  /* ================================================================
     分類標籤列
     ================================================================ */

  function renderCategoryBar() {
    const container = document.getElementById('category-bar');
    if (!container) return;

    // 「全部」標籤
    let html = `<button class="category-tag category-tag--active" data-category="all">全部</button>`;

    // 收藏標籤（使用 ❤️ 區隔常用 ⭐）
    html += `<button class="category-tag" data-category="favorites">❤️ 收藏</button>`;

    // 各分類標籤
    for (const [key, cat] of Object.entries(TOOL_CATEGORIES)) {
      html += `<button class="category-tag" data-category="${key}">${cat.icon} ${cat.name}</button>`;
    }

    container.innerHTML = html;

    // 綁定點擊事件
    container.addEventListener('click', (e) => {
      const tag = e.target.closest('.category-tag');
      if (!tag) return;

      // 更新 active 狀態
      container.querySelectorAll('.category-tag').forEach((t) => t.classList.remove('category-tag--active'));
      tag.classList.add('category-tag--active');

      const category = tag.dataset.category;
      activeCategory = category === 'all' ? null : category;
      renderToolCards();
    });
  }

  /* ================================================================
     工具卡片渲染
     ================================================================ */

  function renderToolCards() {
    const container = document.getElementById('tools-grid');
    if (!container) return;

    const filtered = getFilteredTools();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state__icon">🔍</div>
          <div class="empty-state__title">找不到符合的工具</div>
          <div class="empty-state__text">請嘗試不同的搜尋關鍵字或分類</div>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered
      .map((tool, index) => createToolCardHtml(tool, index))
      .join('');

    // 綁定收藏按鈕事件（使用事件委派）
    container.addEventListener('click', handleCardClick);
  }

  /**
   * 產生單張工具卡片的 HTML
   * @param {object} tool — 工具資料物件
   * @param {number} index — 索引（用於動畫延遲）
   * @returns {string}
   */
  function createToolCardHtml(tool, index) {
    const isFav = StorageManager.isFavorite(tool.id);
    const devBadge = tool.isDeveloper ? `<span class="tool-card__dev-badge">⚡ DEV</span>` : '';
    const specificCategories = tool.categories.filter((c) => TOOL_CATEGORIES[c] && c !== 'popular' && c !== 'developer');
    const displayCategories = specificCategories.length > 0
      ? specificCategories
      : tool.categories.filter((c) => TOOL_CATEGORIES[c]);
    const categoryBadges = displayCategories
      .slice(0, 2)
      .map((c) => `<span class="tool-card__category-badge">${TOOL_CATEGORIES[c].name}</span>`)
      .join('');

    // NOTE: 使用 animation-delay 實現卡片交錯淡入效果
    const delay = Math.min(index * 0.04, 0.4);

    return `
      <a class="tool-card" href="${tool.url}" data-tool-id="${tool.id}" style="animation-delay: ${delay}s">
        <div class="tool-card__arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"/>
            <polyline points="7 7 17 7 17 17"/>
          </svg>
        </div>
        <div class="tool-card__icon">
          ${getToolIconSvg(tool.icon)}
        </div>
        <div class="tool-card__content">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <div class="tool-card__name">${Utils.escapeHtml(tool.name)}</div>
            ${devBadge}
          </div>
          <div class="tool-card__name-en">${Utils.escapeHtml(tool.nameEn || '')}</div>
          <div class="tool-card__description">${Utils.escapeHtml(tool.description)}</div>
        </div>
        <div class="tool-card__footer">
          <div class="tool-card__categories">${categoryBadges}</div>
          <button class="tool-card__fav ${isFav ? 'tool-card__fav--active' : ''}"
                  data-fav-id="${tool.id}"
                  aria-label="${isFav ? '取消收藏' : '加入收藏'}"
                  title="${isFav ? '取消收藏' : '加入收藏'}">
            <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
        </div>
      </a>
    `;
  }

  /**
   * 處理卡片區域的點擊事件（事件委派）
   * @param {Event} e
   */
  function handleCardClick(e) {
    const favBtn = e.target.closest('.tool-card__fav');
    if (favBtn) {
      // 阻止連結跳轉
      e.preventDefault();
      e.stopPropagation();

      const toolId = favBtn.dataset.favId;
      const nowFav = StorageManager.toggleFavorite(toolId);

      // 更新按鈕外觀
      favBtn.classList.toggle('tool-card__fav--active', nowFav);
      const svg = favBtn.querySelector('svg');
      if (svg) svg.setAttribute('fill', nowFav ? 'currentColor' : 'none');
      favBtn.setAttribute('aria-label', nowFav ? '取消收藏' : '加入收藏');
      favBtn.setAttribute('title', nowFav ? '取消收藏' : '加入收藏');

      Utils.showToast(nowFav ? '已加入收藏' : '已取消收藏', 'success');

      // 如果目前在「收藏」分類，需要重新渲染
      if (activeCategory === 'favorites') {
        renderToolCards();
      }
      return;
    }

    // 點擊卡片本體時，記錄最近使用
    const card = e.target.closest('.tool-card');
    if (card) {
      const toolId = card.dataset.toolId;
      if (toolId) {
        StorageManager.addRecent(toolId);
      }
    }
  }

  /* ================================================================
     篩選邏輯
     ================================================================ */

  /**
   * 根據目前的搜尋關鍵字和分類篩選工具
   * @returns {object[]}
   */
  function getFilteredTools() {
    let result = [...TOOLS];

    // Developer Mode 篩選：未開啟時隱藏開發者專用工具（但若主動點擊 Developer 分類則允許查看）
    if (!isDevMode && activeCategory !== 'developer') {
      result = result.filter((tool) => !tool.isDeveloper);
    }

    // 分類篩選
    if (activeCategory === 'favorites') {
      const favIds = StorageManager.getFavorites();
      result = result.filter((t) => favIds.includes(t.id));
    } else if (activeCategory === 'developer') {
      result = result.filter((t) => t.isDeveloper || t.categories.includes('developer'));
    } else if (activeCategory) {
      result = result.filter((t) => t.categories.includes(activeCategory));
    }

    // 搜尋篩選
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((tool) => {
        const searchTarget = [
          tool.name,
          tool.nameEn || '',
          tool.description,
          ...tool.keywords,
          ...tool.categories.map((c) => TOOL_CATEGORIES[c]?.name || ''),
        ].join(' ').toLowerCase();

        return searchTarget.includes(query);
      });
    }

    // 排序保證：所有 Developer Mode 工具一律置於清單最下方
    result.sort((a, b) => {
      const aDev = a.isDeveloper ? 1 : 0;
      const bDev = b.isDeveloper ? 1 : 0;
      return aDev - bDev;
    });

    return result;
  }

  /* ================================================================
     搜尋
     ================================================================ */

  function bindSearchEvents() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    // NOTE: 使用 debounce 避免每次按鍵都重新渲染
    const debouncedSearch = Utils.debounce((value) => {
      searchQuery = value;
      renderToolCards();
    }, 200);

    searchInput.addEventListener('input', (e) => {
      debouncedSearch(e.target.value);
    });

    // 按 Escape 清除搜尋
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchQuery = '';
        renderToolCards();
        searchInput.blur();
      }
    });

    // NOTE: 鍵盤快捷鍵 — 按 "/" 聚焦搜尋框（常見 UX 模式）
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput && !isTyping(e)) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  /**
   * 判斷使用者是否正在輸入框中打字
   * @param {KeyboardEvent} e
   * @returns {boolean}
   */
  function isTyping(e) {
    const tag = e.target.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable;
  }

  /* ================================================================
     手機版搜尋按鈕
     ================================================================ */

  function bindMobileSearchToggle() {
    const toggleBtn = document.getElementById('mobile-search-toggle');
    const searchWrapper = document.getElementById('search-wrapper');
    if (!toggleBtn || !searchWrapper) return;

    toggleBtn.addEventListener('click', () => {
      searchWrapper.classList.toggle('navbar__search--mobile-visible');
      if (searchWrapper.classList.contains('navbar__search--mobile-visible')) {
        const input = searchWrapper.querySelector('input');
        if (input) input.focus();
      }
    });
  }

  /* ================================================================
     最近使用
     ================================================================ */

  function renderRecentTools() {
    const container = document.getElementById('recent-tools');
    const section = document.getElementById('recent-section');
    if (!container || !section) return;

    const recentIds = StorageManager.getRecent();
    if (recentIds.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';

    const recentTools = recentIds
      .map((id) => TOOLS.find((t) => t.id === id))
      .filter(Boolean);

    container.innerHTML = recentTools
      .map((tool) => `
        <a class="recent-tool-chip" href="${tool.url}" data-tool-id="${tool.id}">
          <span class="recent-tool-chip__icon">${getToolIconSvg(tool.icon)}</span>
          <span>${Utils.escapeHtml(tool.name)}</span>
        </a>
      `)
      .join('');

    // 點擊時記錄使用
    container.addEventListener('click', (e) => {
      const chip = e.target.closest('.recent-tool-chip');
      if (chip) {
        StorageManager.addRecent(chip.dataset.toolId);
      }
    });
  }

  /**
   * 紀錄頁面訪問（用於工具頁面呼叫，記錄到最近使用）
   */
  function recordPageVisit() {
    // 此函式在首頁不做任何事，工具頁面會呼叫 StorageManager.addRecent
  }

  /* ================================================================
     工具數量統計（顯示在首頁）
     ================================================================ */

  function updateToolCount() {
    const countEl = document.getElementById('tool-count');
    if (countEl) {
      const visibleTools = isDevMode ? TOOLS : TOOLS.filter((t) => !t.isDeveloper);
      countEl.textContent = visibleTools.length;
    }
  }

  /* ================================================================
     Developer Mode 切換邏輯
     ================================================================ */

  function bindDevModeToggle() {
    const btn = document.getElementById('dev-mode-toggle');
    if (!btn) return;

    // 依儲存偏好初始化外觀
    btn.classList.toggle('dev-mode-btn--active', isDevMode);

    btn.addEventListener('click', () => {
      isDevMode = !isDevMode;
      StorageManager.setDevMode(isDevMode);
      btn.classList.toggle('dev-mode-btn--active', isDevMode);

      // 觸發反饋通知
      if (isDevMode) {
        const devCount = TOOLS.filter((t) => t.isDeveloper).length;
        Utils.showToast(`⚡ Developer Mode 已啟動 · 已解鎖 ${devCount} 款進階開發者工具`, 'success');
      } else {
        Utils.showToast('已關閉 Developer Mode，切換回標準日常工具模式', 'info');
      }

      // 重新渲染工具列表與計數
      renderToolCards();
      updateToolCount();
    });
  }

  /* ================================================================
     Hero 標題動態效果（滑鼠懸停、移動視差、頁面滾動縮放與淡出）
     ================================================================ */

  function initHeroEffects() {
    const heroSection = document.getElementById('hero-section');
    const heroContent = document.getElementById('hero-content');
    if (!heroSection || !heroContent) return;

    let isHovering = false;

    // 1. 滑鼠移動：3D 視差微傾斜（取消跟隨鼠標發亮，其餘不動）
    const handlePointerMove = (e) => {
      // 視差傾斜（桌面版限定）
      if (window.innerWidth > 768) {
        const rect = heroSection.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const px = Math.max(-1, Math.min(1, (x / rect.width - 0.5) * 1.6));
        const py = Math.max(-1, Math.min(1, (y / rect.height - 0.5) * 1.6));
        const tiltX = -py * 7.5;
        const tiltY = px * 7.5;
        heroContent.style.transform = `perspective(1200px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      }
    };

    heroSection.addEventListener('mousemove', handlePointerMove);

    heroSection.addEventListener('mouseleave', () => {
      heroContent.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });

    // 2. 頁面滾動：擴大滾動範圍（340px），平滑縮放淡出
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.pageYOffset || document.documentElement.scrollTop;
          const maxScroll = 340;
          const progress = Math.min(scrollY / maxScroll, 1);

          const scale = 1 - progress * 0.08;
          const opacity = Math.max(1 - progress * 0.85, 0.12);
          const translateY = -progress * 26;

          heroSection.style.transform = `translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(3)})`;
          heroSection.style.opacity = opacity.toFixed(2);

          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ================================================================
     公開 API
     ================================================================ */

  return { init, updateToolCount };
})();

// DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  App.updateToolCount();
});
