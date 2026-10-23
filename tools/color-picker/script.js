/**
 * Color Picker & Palette 實作腳本
 */
document.addEventListener('DOMContentLoaded', () => {
  StorageManager.addRecent('color-picker');

  const nativePicker = document.getElementById('native-picker');
  const colorBox = document.getElementById('color-box');
  const valHex = document.getElementById('val-hex');
  const valRgb = document.getElementById('val-rgb');
  const valHsl = document.getElementById('val-hsl');
  const paletteGrid = document.getElementById('palette-grid');

  const contrastWhite = document.getElementById('contrast-white');
  const contrastBlack = document.getElementById('contrast-black');

  // 色彩轉換
  function hexToRgb(hex) {
    let clean = hex.replace('#', '');
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    const num = parseInt(clean, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  }

  // 相對亮度與對比度計算 (WCAG 2.1)
  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function getContrast(lum1, lum2) {
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function updateAll(hex) {
    try {
      const { r, g, b } = hexToRgb(hex);
      const { h, s, l } = rgbToHsl(r, g, b);

      const cleanHex = hex.toUpperCase();
      valHex.value = cleanHex;
      valRgb.value = `rgb(${r}, ${g}, ${b})`;
      valHsl.value = `hsl(${h}, ${s}%, ${l}%)`;
      colorBox.style.backgroundColor = cleanHex;
      colorBox.style.boxShadow = `0 10px 30px ${cleanHex}55`;
      nativePicker.value = cleanHex;

      // 產生五色互補調色盤 (色相旋轉 + 亮度遞增/遞減)
      const palette = [
        hslToHex((h + 330) % 360, s, Math.min(90, l + 15)),
        hslToHex((h + 345) % 360, s, l),
        cleanHex,
        hslToHex((h + 30) % 360, s, l),
        hslToHex((h + 180) % 360, s, Math.max(20, l - 10))
      ];

      paletteGrid.innerHTML = palette.map((c, i) => `
        <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 8px; text-align: center; cursor: pointer;" class="palette-chip" data-hex="${c}">
          <div style="height: 60px; border-radius: var(--radius-sm); background: ${c}; margin-bottom: 6px;"></div>
          <span style="font-family: var(--font-mono, monospace); font-size: 0.75rem; font-weight: 700;">${c}</span>
        </div>
      `).join('');

      paletteGrid.querySelectorAll('.palette-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const targetHex = chip.dataset?.hex || chip.getAttribute('data-hex');
          if (targetHex) {
            updateAll(targetHex);
            Utils.showToast(`已載入色彩 ${targetHex}`, 'info');
          }
        });
      });

      // WCAG 對比度
      const curLum = getLuminance(r, g, b);
      const whiteLum = getLuminance(255, 255, 255);
      const blackLum = getLuminance(15, 23, 42);

      const ratioWhite = getContrast(curLum, whiteLum);
      const ratioBlack = getContrast(curLum, blackLum);

      contrastWhite.querySelector('.contrast-ratio').textContent = `${ratioWhite.toFixed(2)} : 1`;
      contrastWhite.querySelector('.contrast-badge').innerHTML = ratioWhite >= 7 ? '<span style="color: var(--color-success)">⭐⭐⭐ AAA 極佳</span>' : ratioWhite >= 4.5 ? '<span style="color: var(--color-success)">⭐⭐ AA 合格</span>' : '<span style="color: var(--color-error)">❌ 不合格</span>';

      contrastBlack.querySelector('.contrast-ratio').textContent = `${ratioBlack.toFixed(2)} : 1`;
      contrastBlack.querySelector('.contrast-badge').innerHTML = ratioBlack >= 7 ? '<span style="color: var(--color-success)">⭐⭐⭐ AAA 極佳</span>' : ratioBlack >= 4.5 ? '<span style="color: var(--color-success)">⭐⭐ AA 合格</span>' : '<span style="color: var(--color-error)">❌ 不合格</span>';
    } catch {}
  }

  nativePicker.addEventListener('input', (e) => updateAll(e.target.value));

  valHex.addEventListener('input', (e) => {
    if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) updateAll(e.target.value);
  });

  document.querySelectorAll('.btn-copy-val').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (input) Utils.copyToClipboard(input.value, `已複製 ${input.value}`);
    });
  });

  updateAll('#3B82F6');
});
