/**
 * Qiyen Toolbox — Theme Manager
 * 深色 / 淺色模式切換，使用 localStorage 記住偏好
 */

const ThemeManager = (() => {
  const STORAGE_KEY = 'qiyen-toolbox-theme';

  /**
   * 取得使用者偏好主題
   * 優先順序：localStorage > 系統偏好 > 預設淺色
   * @returns {'light' | 'dark'}
   */
  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    // NOTE: 偵測系統是否偏好深色模式
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * 套用主題到 <html> 元素
   * @param {'light' | 'dark'} theme
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleIcon(theme);
  }

  /**
   * 切換主題
   */
  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  /**
   * 更新主題切換按鈕的 icon
   * @param {'light' | 'dark'} theme
   */
  function updateToggleIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    // NOTE: 深色模式顯示太陽圖示（切換回淺色），淺色模式顯示月亮圖示（切換到深色）
    if (theme === 'dark') {
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>`;
      btn.setAttribute('aria-label', '切換為淺色模式');
    } else {
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>`;
      btn.setAttribute('aria-label', '切換為深色模式');
    }
  }

  /**
   * 初始化主題系統
   * 在 DOM 載入後呼叫，綁定切換按鈕事件
   */
  function init() {
    const theme = getPreferredTheme();
    applyTheme(theme);

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', toggle);
    }

    // NOTE: 監聽系統主題變更（例如使用者在系統設定切換深淺色）
    try {
      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        if (mql) {
          const handler = (e) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
              applyTheme(e.matches ? 'dark' : 'light');
            }
          };
          if (typeof mql.addEventListener === 'function') {
            mql.addEventListener('change', handler);
          } else if (typeof mql.addListener === 'function') {
            mql.addListener(handler);
          }
        }
      }
    } catch (err) {
      console.warn('matchMedia setup skipped:', err);
    }
  }

  return { init, toggle, getPreferredTheme };
})();

// 盡早套用主題，避免畫面閃爍
(() => {
  const stored = localStorage.getItem('qiyen-toolbox-theme');
  if (stored) {
    document.documentElement.setAttribute('data-theme', stored);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
