/**
 * Color Converter — 工具邏輯
 * HEX、RGB、HSL 顏色互轉
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('color-converter'); } catch (_) {}

  const preview = document.getElementById('color-preview');
  const colorLabel = document.getElementById('color-label');
  const picker = document.getElementById('color-picker');
  const inputHex = document.getElementById('input-hex');
  const inputRgb = document.getElementById('input-rgb');
  const inputHsl = document.getElementById('input-hsl');

  /** 目前的 RGB 值（作為中間格式） */
  let currentRgb = { r: 59, g: 130, b: 246 };

  /* ================================================================
     顏色格式轉換函式
     ================================================================ */

  /**
   * HEX → RGB
   * @param {string} hex — '#RRGGBB' 格式
   * @returns {{ r: number, g: number, b: number } | null}
   */
  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    // 支援 3 位簡寫（如 #f00）
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) return null;

    const num = parseInt(hex, 16);
    if (isNaN(num)) return null;

    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  /**
   * RGB → HEX
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @returns {string} — '#RRGGBB'
   */
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map((c) => {
      const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  }

  /**
   * RGB → HSL
   * @param {number} r — 0-255
   * @param {number} g — 0-255
   * @param {number} b — 0-255
   * @returns {{ h: number, s: number, l: number }} — h: 0-360, s: 0-100, l: 0-100
   */
  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  /**
   * HSL → RGB
   * @param {number} h — 0-360
   * @param {number} s — 0-100
   * @param {number} l — 0-100
   * @returns {{ r: number, g: number, b: number }}
   */
  function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  /* ================================================================
     UI 更新
     ================================================================ */

  /**
   * 根據目前 RGB 值更新所有 UI
   * @param {'hex' | 'rgb' | 'hsl' | 'picker'} source — 觸發來源（避免迴圈更新）
   */
  function updateAll(source) {
    const { r, g, b } = currentRgb;
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);

    // 更新預覽
    preview.style.backgroundColor = hex;

    // NOTE: 根據亮度決定文字顏色（確保可讀性）
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const textColor = luminance > 0.5 ? '#000000' : '#ffffff';
    const bgOverlay = luminance > 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';
    colorLabel.style.color = textColor;
    colorLabel.style.background = bgOverlay;
    colorLabel.textContent = hex;

    // 更新各個輸入框（跳過觸發來源）
    if (source !== 'hex') inputHex.value = hex;
    if (source !== 'rgb') inputRgb.value = `rgb(${r}, ${g}, ${b})`;
    if (source !== 'hsl') inputHsl.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    if (source !== 'picker') picker.value = hex.toLowerCase();
  }

  /* ================================================================
     解析使用者輸入
     ================================================================ */

  /**
   * 解析 RGB 字串
   * @param {string} str — 如 'rgb(59, 130, 246)' 或 '59, 130, 246'
   * @returns {{ r: number, g: number, b: number } | null}
   */
  function parseRgb(str) {
    const match = str.match(/(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/);
    if (!match) return null;

    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);

    if (r > 255 || g > 255 || b > 255) return null;
    return { r, g, b };
  }

  /**
   * 解析 HSL 字串
   * @param {string} str — 如 'hsl(217, 91%, 60%)'
   * @returns {{ h: number, s: number, l: number } | null}
   */
  function parseHsl(str) {
    const match = str.match(/(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?/);
    if (!match) return null;

    const h = parseInt(match[1], 10);
    const s = parseInt(match[2], 10);
    const l = parseInt(match[3], 10);

    if (h > 360 || s > 100 || l > 100) return null;
    return { h, s, l };
  }

  /* ================================================================
     事件綁定
     ================================================================ */

  // 顏色選擇器
  picker.addEventListener('input', () => {
    const rgb = hexToRgb(picker.value);
    if (rgb) {
      currentRgb = rgb;
      updateAll('picker');
    }
  });

  // HEX 輸入
  inputHex.addEventListener('input', () => {
    const rgb = hexToRgb(inputHex.value);
    if (rgb) {
      currentRgb = rgb;
      updateAll('hex');
    }
  });

  // RGB 輸入
  inputRgb.addEventListener('input', () => {
    const rgb = parseRgb(inputRgb.value);
    if (rgb) {
      currentRgb = rgb;
      updateAll('rgb');
    }
  });

  // HSL 輸入
  inputHsl.addEventListener('input', () => {
    const hsl = parseHsl(inputHsl.value);
    if (hsl) {
      currentRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
      updateAll('hsl');
    }
  });

  // 複製按鈕（使用事件委派）
  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.copy-sm-btn');
    if (copyBtn) {
      const inputId = copyBtn.dataset.copy;
      const input = document.getElementById(inputId);
      if (input) {
        Utils.copyToClipboard(input.value);
      }
    }
  });

  // 初始化
  updateAll('picker');
});
