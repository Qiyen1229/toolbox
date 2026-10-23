/**
 * Case Converter — 工具邏輯
 * 功能：提供多種英文字串大小寫與程式變數命名慣例轉換
 */

document.addEventListener('DOMContentLoaded', () => {
  // 記錄使用紀錄
  try { StorageManager?.addRecent?.('case-converter'); } catch (_) {}

  // DOM 元素
  const caseInput = document.getElementById('case-input');
  const caseOutput = document.getElementById('case-output');
  const inputStats = document.getElementById('input-stats');
  const outputStats = document.getElementById('output-stats');
  const btnSample = document.getElementById('btn-sample');
  const btnCopy = document.getElementById('btn-copy');
  const btnReplaceInput = document.getElementById('btn-replace-input');
  const btnClear = document.getElementById('btn-clear');
  const modeButtons = document.querySelectorAll('.btn-case-mode');

  /** 目前選取的轉換模式 */
  let currentMode = 'upper';

  /* ================================================================
     字串轉換演算法
     ================================================================ */

  /**
   * 將字串切分成乾淨的單字陣列（處理駝峰、底線、破折號、空白等）
   * @param {string} str
   * @returns {string[]}
   */
  function extractWords(str) {
    if (!str) return [];
    // 處理 camelCase / PascalCase 中的大寫分割，例如 userProfile -> user Profile
    const normalized = str
      .replace(/([a-z\d])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2')
      .replace(/[_\-./\\]+/g, ' ');

    return normalized.trim().split(/\s+/).filter(Boolean);
  }

  /**
   * 轉換處理函式集
   */
  const converters = {
    // 1. 全部大寫
    upper: (str) => str.toUpperCase(),

    // 2. 全部小寫
    lower: (str) => str.toLowerCase(),

    // 3. 標題首字大寫 (Title Case)
    title: (str) => {
      return str.replace(/\b([a-zA-Z])/g, (match) => match.toUpperCase());
    },

    // 4. 句首大寫 (Sentence case)
    sentence: (str) => {
      const lower = str.toLowerCase();
      // 在字首或句號/問號/驚嘆號後的單字將第一個字母大寫
      return lower.replace(/(^\s*|[.?!]\s+)([a-zA-Z])/g, (m, prefix, char) => prefix + char.toUpperCase());
    },

    // 5. 小駝峰 (camelCase)
    camel: (str) => {
      const words = extractWords(str);
      if (words.length === 0) return '';
      return words[0].toLowerCase() + words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    },

    // 6. 大駝峰 (PascalCase)
    pascal: (str) => {
      const words = extractWords(str);
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    },

    // 7. 蛇形 (snake_case)
    snake: (str) => {
      const words = extractWords(str);
      return words.map((w) => w.toLowerCase()).join('_');
    },

    // 8. 烤肉串 (kebab-case)
    kebab: (str) => {
      const words = extractWords(str);
      return words.map((w) => w.toLowerCase()).join('-');
    },

    // 9. 常數 (CONSTANT_CASE)
    constant: (str) => {
      const words = extractWords(str);
      return words.map((w) => w.toUpperCase()).join('_');
    },

    // 10. 反轉大小寫 (tOGGLE cASE)
    invert: (str) => {
      let res = '';
      for (let i = 0; i < str.length; i++) {
        const c = str.charAt(i);
        if (c === c.toUpperCase()) {
          res += c.toLowerCase();
        } else {
          res += c.toUpperCase();
        }
      }
      return res;
    },
  };

  /**
   * 執行文字轉換並更新輸出
   */
  function convert(mode = currentMode) {
    currentMode = mode;
    const text = caseInput.value;
    updateStats();

    if (!text) {
      caseOutput.value = '';
      outputStats.textContent = '字元數: 0';
      return;
    }

    const fn = converters[mode];
    if (fn) {
      caseOutput.value = fn(text);
      outputStats.textContent = `字元數: ${caseOutput.value.length}`;
    }
  }

  /**
   * 更新輸入統計
   */
  function updateStats() {
    const text = caseInput.value;
    const charCount = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    inputStats.textContent = `字元數: ${charCount} · 單字數: ${words}`;
  }

  /* ================================================================
     事件綁定
     ================================================================ */

  // 模式按鈕點擊
  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeButtons.forEach((b) => {
        b.classList.remove('btn--primary');
        b.classList.add('btn--secondary');
      });
      btn.classList.remove('btn--secondary');
      btn.classList.add('btn--primary');
      const mode = btn.dataset?.mode || btn.getAttribute('data-mode');
      if (mode) convert(mode);
    });
  });

  // 輸入即時轉換
  caseInput.addEventListener('input', () => convert());

  // 載入範例
  btnSample.addEventListener('click', () => {
    caseInput.value = 'hello world! welcome to the qiyen toolbox. enjoy your coding journey.';
    convert();
  });

  // 複製結果
  btnCopy.addEventListener('click', () => {
    if (!caseOutput.value) {
      Utils.showToast('無轉換結果可複製', 'warning');
      return;
    }
    Utils.copyToClipboard(caseOutput.value);
  });

  // 以結果替換輸入
  btnReplaceInput.addEventListener('click', () => {
    if (!caseOutput.value) return;
    caseInput.value = caseOutput.value;
    convert();
    Utils.showToast('已將結果替換至輸入欄', 'info');
  });

  // 清除
  btnClear.addEventListener('click', () => {
    caseInput.value = '';
    caseOutput.value = '';
    updateStats();
    outputStats.textContent = '字元數: 0';
    Utils.showToast('已清除內容', 'info');
  });

  // 初始化預設高亮第一個模式按鈕
  const defaultBtn = document.querySelector(`.btn-case-mode[data-mode="${currentMode}"]`);
  if (defaultBtn) {
    defaultBtn.classList.remove('btn--secondary');
    defaultBtn.classList.add('btn--primary');
  }
});
