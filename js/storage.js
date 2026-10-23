/**
 * Qiyen Toolbox — Storage Manager
 * 封裝 localStorage 操作，管理收藏工具與最近使用紀錄
 */

const StorageManager = (() => {
  const KEYS = {
    favorites: 'qiyen-toolbox-favorites',
    recent: 'qiyen-toolbox-recent',
  };

  /** 最近使用紀錄的最大數量 */
  const MAX_RECENT = 10;

  /* ================================================================
     通用 localStorage 讀寫
     ================================================================ */

  /**
   * 安全讀取 localStorage
   * @param {string} key
   * @param {*} fallback — 讀取失敗時的預設值
   * @returns {*}
   */
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * 安全寫入 localStorage
   * @param {string} key
   * @param {*} value
   */
  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // NOTE: localStorage 可能因隱私模式或空間不足而失敗，靜默處理
      console.warn('localStorage 寫入失敗');
    }
  }

  /* ================================================================
     收藏工具
     ================================================================ */

  /**
   * 取得所有收藏工具的 ID 列表
   * @returns {string[]}
   */
  function getFavorites() {
    return read(KEYS.favorites, []);
  }

  /**
   * 檢查工具是否已收藏
   * @param {string} toolId
   * @returns {boolean}
   */
  function isFavorite(toolId) {
    return getFavorites().includes(toolId);
  }

  /**
   * 切換收藏狀態（收藏 ↔ 取消收藏）
   * @param {string} toolId
   * @returns {boolean} — 切換後的收藏狀態
   */
  function toggleFavorite(toolId) {
    const favorites = getFavorites();
    const index = favorites.indexOf(toolId);

    if (index === -1) {
      favorites.push(toolId);
    } else {
      favorites.splice(index, 1);
    }

    write(KEYS.favorites, favorites);
    return index === -1;
  }

  /* ================================================================
     最近使用
     ================================================================ */

  /**
   * 取得最近使用的工具 ID 列表（最新的在前）
   * @returns {string[]}
   */
  function getRecent() {
    return read(KEYS.recent, []);
  }

  /**
   * 記錄工具使用（將該工具推到最前面，並限制最大數量）
   * @param {string} toolId
   */
  function addRecent(toolId) {
    let recent = getRecent();

    // 移除已存在的相同 ID（避免重複）
    recent = recent.filter((id) => id !== toolId);

    // 插入到最前面
    recent.unshift(toolId);

    // 限制數量
    if (recent.length > MAX_RECENT) {
      recent = recent.slice(0, MAX_RECENT);
    }

    write(KEYS.recent, recent);
  }

  /* ================================================================
     Developer Mode 開發者模式偏好儲存
     ================================================================ */

  /**
   * 取得開發者模式是否開啟
   * @returns {boolean}
   */
  function isDevMode() {
    return read('qiyen-toolbox-dev-mode', false) === true;
  }

  /**
   * 設定開發者模式狀態
   * @param {boolean} enabled
   */
  function setDevMode(enabled) {
    write('qiyen-toolbox-dev-mode', Boolean(enabled));
  }

  /**
   * 清除所有最近使用紀錄
   */
  function clearRecent() {
    write(KEYS.recent, []);
  }

  return {
    getFavorites,
    isFavorite,
    toggleFavorite,
    getRecent,
    addRecent,
    clearRecent,
    isDevMode,
    setDevMode,
  };
})();
