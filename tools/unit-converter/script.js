/**
 * 常用單位換算 — 工具邏輯
 * 功能：提供長度、重量、溫度、面積、容量、數位儲存六大類別多單位即時雙向連動換算
 */

document.addEventListener('DOMContentLoaded', () => {
  // 記錄使用紀錄
  try { StorageManager?.addRecent?.('unit-converter'); } catch (_) {}

  // DOM 元素
  const unitTabs = document.getElementById('unit-tabs');
  const categoryTitle = document.getElementById('category-title');
  const unitFields = document.getElementById('unit-fields');
  const btnReset = document.getElementById('btn-reset');

  /** 目前選取的分類 */
  let currentCategory = 'length';

  /* ================================================================
     單位定義與換算係數（以基準單位 Base Unit 計算）
     ================================================================ */
  const UNIT_CONFIGS = {
    length: {
      name: '長度單位換算',
      base: 'm',
      units: [
        { id: 'km', name: '公里 (km)', rate: 1000 },
        { id: 'm', name: '公尺 (m)', rate: 1 },
        { id: 'cm', name: '公分 (cm)', rate: 0.01 },
        { id: 'mm', name: '公釐 (mm)', rate: 0.001 },
        { id: 'inch', name: '英吋 (in)', rate: 0.0254 },
        { id: 'ft', name: '英呎 (ft)', rate: 0.3048 },
        { id: 'yd', name: '碼 (yd)', rate: 0.9144 },
        { id: 'mi', name: '英哩 (mi)', rate: 1609.344 },
      ]
    },
    weight: {
      name: '重量單位換算',
      base: 'kg',
      units: [
        { id: 't', name: '公噸 (t)', rate: 1000 },
        { id: 'kg', name: '公斤 (kg)', rate: 1 },
        { id: 'g', name: '公克 (g)', rate: 0.001 },
        { id: 'mg', name: '毫克 (mg)', rate: 0.000001 },
        { id: 'lb', name: '磅 (lb)', rate: 0.45359237 },
        { id: 'oz', name: '盎司 (oz)', rate: 0.028349523125 },
        { id: 'tw_jin', name: '台斤 (斤 = 600g)', rate: 0.6 },
        { id: 'cn_jin', name: '市斤 (500g)', rate: 0.5 },
      ]
    },
    temperature: {
      name: '溫度單位換算',
      custom: true, // 溫度需要自訂公式
      units: [
        { id: 'c', name: '攝氏 (°C)' },
        { id: 'f', name: '華氏 (°F)' },
        { id: 'k', name: '絕對溫度 (K)' },
      ]
    },
    area: {
      name: '面積單位換算',
      base: 'm2',
      units: [
        { id: 'km2', name: '平方公里 (km²)', rate: 1000000 },
        { id: 'ha', name: '公頃 (ha)', rate: 10000 },
        { id: 'm2', name: '平方公尺 (m²)', rate: 1 },
        { id: 'cm2', name: '平方公分 (cm²)', rate: 0.0001 },
        { id: 'tw_ping', name: '坪 (台灣)', rate: 3.305785 },
        { id: 'tw_jia', name: '甲 (台灣)', rate: 9699.17 },
        { id: 'acre', name: '英畝 (acre)', rate: 4046.8564224 },
        { id: 'ft2', name: '平方英呎 (sq ft)', rate: 0.09290304 },
      ]
    },
    volume: {
      name: '容量與體積換算',
      base: 'l',
      units: [
        { id: 'm3', name: '立方公尺 (m³)', rate: 1000 },
        { id: 'l', name: '公升 (L)', rate: 1 },
        { id: 'ml', name: '毫升 (mL / cc)', rate: 0.001 },
        { id: 'gal', name: '美制加侖 (US gal)', rate: 3.78541 },
        { id: 'qt', name: '美制夸脫 (US qt)', rate: 0.946353 },
        { id: 'floz', name: '美制液體盎司 (fl oz)', rate: 0.0295735 },
        { id: 'cup', name: '杯 (Cup, 240ml)', rate: 0.24 },
      ]
    },
    data: {
      name: '數位儲存容量換算',
      base: 'b',
      units: [
        { id: 'bit', name: '位元 (bit / b)', rate: 1 },
        { id: 'b', name: '位元組 (Byte / B)', rate: 8 },
        { id: 'kb', name: 'Kilobyte (KB, 1024B)', rate: 8 * 1024 },
        { id: 'mb', name: 'Megabyte (MB)', rate: 8 * 1024 * 1024 },
        { id: 'gb', name: 'Gigabyte (GB)', rate: 8 * 1024 * 1024 * 1024 },
        { id: 'tb', name: 'Terabyte (TB)', rate: 8 * 1024 * 1024 * 1024 * 1024 },
      ]
    }
  };

  /* ================================================================
     渲染與換算核心邏輯
     ================================================================ */

  /**
   * 格式化數字輸出（去除過長無意義浮點數，保持高精度）
   * @param {number} num
   * @returns {string}
   */
  function formatNumber(num) {
    if (isNaN(num) || !isFinite(num)) return '';
    if (num === 0) return '0';
    // 若數值極小或極大使用科學記號，否則精準四捨五入至最多 8 位小數
    const abs = Math.abs(num);
    if (abs < 1e-6 || abs >= 1e12) {
      return num.toExponential(6);
    }
    return parseFloat(num.toPrecision(8)).toString();
  }

  /**
   * 渲染當前分類的所有單位輸入框
   */
  function renderCategory(catKey) {
    currentCategory = catKey;
    const config = UNIT_CONFIGS[catKey];
    if (!config) return;

    categoryTitle.textContent = config.name;

    unitFields.innerHTML = config.units
      .map((unit) => `
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" for="unit-input-${unit.id}" style="font-weight: 600;">
            ${unit.name}
          </label>
          <div style="display: flex; gap: var(--space-xs);">
            <input
              type="number"
              class="form-input unit-input"
              id="unit-input-${unit.id}"
              data-unit-id="${unit.id}"
              placeholder="0"
              style="font-family: var(--font-mono, monospace);"
            >
            <button class="btn btn--sm btn--ghost btn-copy-unit" data-target="unit-input-${unit.id}" title="複製數值">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
          </div>
        </div>
      `)
      .join('');

    // 預設填入基準單位 1 並換算
    const defaultUnit = config.units[0];
    const firstInput = document.getElementById(`unit-input-${defaultUnit.id}`);
    if (firstInput) {
      firstInput.value = '1';
      recalculateFrom(defaultUnit.id, 1);
    }
  }

  /**
   * 從特定單位數值重新計算該類別的所有其他單位
   * @param {string} sourceUnitId
   * @param {number} val
   */
  function recalculateFrom(sourceUnitId, val) {
    const config = UNIT_CONFIGS[currentCategory];
    if (!config) return;

    if (config.custom && currentCategory === 'temperature') {
      // 溫度特有公式
      let cVal = 0;
      if (sourceUnitId === 'c') cVal = val;
      else if (sourceUnitId === 'f') cVal = (val - 32) * (5 / 9);
      else if (sourceUnitId === 'k') cVal = val - 273.15;

      config.units.forEach((u) => {
        if (u.id === sourceUnitId) return;
        const targetInput = document.getElementById(`unit-input-${u.id}`);
        if (!targetInput) return;

        let out = 0;
        if (u.id === 'c') out = cVal;
        else if (u.id === 'f') out = cVal * (9 / 5) + 32;
        else if (u.id === 'k') out = cVal + 273.15;

        targetInput.value = formatNumber(out);
      });
      return;
    }

    // 一般比率換算
    const sourceUnit = config.units.find((u) => u.id === sourceUnitId);
    if (!sourceUnit) return;

    // 1. 換算至 Base Unit
    const baseValue = val * sourceUnit.rate;

    // 2. 從 Base Unit 換算至各單位
    config.units.forEach((u) => {
      if (u.id === sourceUnitId) return;
      const targetInput = document.getElementById(`unit-input-${u.id}`);
      if (!targetInput) return;

      const out = baseValue / u.rate;
      targetInput.value = formatNumber(out);
    });
  }

  /* ================================================================
     事件綁定
     ================================================================ */

  // 類別頁籤切換
  if (unitTabs) {
    unitTabs.addEventListener('click', (e) => {
      if (!e.target || !e.target.closest) return;
      const tab = e.target.closest('.tab-btn');
      if (!tab) return;

      unitTabs.querySelectorAll('.tab-btn').forEach((b) => {
        b.classList.remove('btn--primary');
        b.classList.add('btn--ghost');
      });
      tab.classList.remove('btn--ghost');
      tab.classList.add('btn--primary');

      const cat = tab.dataset?.category || tab.getAttribute('data-category');
      if (cat) renderCategory(cat);
    });
  }

  // 輸入框即時換算（委派）
  if (unitFields) {
    unitFields.addEventListener('input', (e) => {
      if (!e.target || !e.target.closest) return;
      const input = e.target.closest('.unit-input');
      if (!input) return;

      const raw = input.value;
      if (raw === '' || raw === '-') {
        // 若清空則將其他欄位也清空
        unitFields.querySelectorAll('.unit-input').forEach((inp) => {
          if (inp !== input) inp.value = '';
        });
        return;
      }

      const val = parseFloat(raw);
      if (!isNaN(val)) {
        recalculateFrom(input.dataset.unitId, val);
      }
    });

    // 單列複製按鈕（委派）
    unitFields.addEventListener('click', (e) => {
      if (!e.target || !e.target.closest) return;
      const btn = e.target.closest('.btn-copy-unit');
      if (!btn) return;
      const targetInput = document.getElementById(btn.dataset.target);
      if (targetInput && targetInput.value) {
        Utils.copyToClipboard(targetInput.value);
      }
    });
  }

  // 重設
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      renderCategory(currentCategory);
      Utils.showToast('已重設為預設數值', 'info');
    });
  }

  // 初始化長度類別
  renderCategory('length');
});
