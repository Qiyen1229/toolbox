/**
 * 密碼產生器 — 工具邏輯
 * 使用 Web Crypto API 產生密碼學安全的隨機密碼
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('password-generator'); } catch (_) {}

  const CHAR_SETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`',
  };

  const outputEl = document.getElementById('password-output');
  const lengthSlider = document.getElementById('length-slider');
  const lengthValue = document.getElementById('length-value');
  const strengthFill = document.getElementById('strength-fill');
  const strengthLabel = document.getElementById('strength-label');

  const checkboxes = {
    uppercase: document.getElementById('opt-uppercase'),
    lowercase: document.getElementById('opt-lowercase'),
    numbers: document.getElementById('opt-numbers'),
    symbols: document.getElementById('opt-symbols'),
  };

  /* ================================================================
     密碼產生
     ================================================================ */

  /**
   * 使用 Crypto API 產生安全隨機密碼
   * @returns {string} — 產生的密碼
   */
  function generatePassword() {
    const length = parseInt(lengthSlider.value, 10);
    let charset = '';

    for (const [key, checkbox] of Object.entries(checkboxes)) {
      if (checkbox && checkbox.checked) {
        charset += CHAR_SETS[key];
      }
    }

    if (charset.length === 0) {
      Utils.showToast('請至少勾選一種字元類型', 'warning');
      return '';
    }

    // NOTE: 使用 crypto.getRandomValues 產生密碼學安全的隨機數，若無則回退 Math.random
    const randomValues = new Uint32Array(length);
    const cryptoObj = (typeof window !== 'undefined' && (window.crypto || window.msCrypto)) || (typeof crypto !== 'undefined' ? crypto : null);
    if (cryptoObj && cryptoObj.getRandomValues) {
      cryptoObj.getRandomValues(randomValues);
    } else {
      for (let i = 0; i < length; i++) {
        randomValues[i] = Math.floor(Math.random() * 4294967296);
      }
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[randomValues[i] % charset.length];
    }

    return password;
  }

  /* ================================================================
     密碼強度評估
     ================================================================ */

  /**
   * 評估密碼強度
   * @param {string} password
   * @returns {{ score: number, label: string, color: string }}
   */
  function evaluateStrength(password) {
    if (!password) return { score: 0, label: '—', color: 'var(--color-text-tertiary)' };

    let score = 0;
    const length = password.length;

    // 長度評分
    if (length >= 8) score += 1;
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;
    if (length >= 24) score += 1;

    // 字元多樣性評分
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    // NOTE: 總分 0-8，對應 4 個強度等級
    if (score <= 2) return { score: 25, label: '弱', color: 'var(--color-error)' };
    if (score <= 4) return { score: 50, label: '中等', color: 'var(--color-warning)' };
    if (score <= 6) return { score: 75, label: '強', color: 'var(--color-accent)' };
    return { score: 100, label: '非常強', color: 'var(--color-success)' };
  }

  /**
   * 更新強度指示條
   * @param {string} password
   */
  function updateStrengthIndicator(password) {
    const strength = evaluateStrength(password);
    strengthFill.style.width = `${strength.score}%`;
    strengthFill.style.backgroundColor = strength.color;
    strengthLabel.textContent = strength.label;
    strengthLabel.style.color = strength.color;
  }

  /* ================================================================
     事件綁定
     ================================================================ */

  /** 產生密碼按鈕 */
  document.getElementById('btn-generate').addEventListener('click', () => {
    const password = generatePassword();
    if (password) {
      outputEl.textContent = password;
      updateStrengthIndicator(password);
    }
  });

  /** 複製按鈕 */
  document.getElementById('btn-copy').addEventListener('click', () => {
    const password = outputEl.textContent;
    if (password && password !== '點擊「產生密碼」開始') {
      Utils.copyToClipboard(password, '密碼已複製');
    }
  });

  /** 長度滑桿即時更新 */
  lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = lengthSlider.value;
  });

  // NOTE: 確保至少有一個字元類型被勾選
  for (const checkbox of Object.values(checkboxes)) {
    checkbox.addEventListener('change', () => {
      const anyChecked = Object.values(checkboxes).some((cb) => cb.checked);
      if (!anyChecked) {
        checkbox.checked = true;
        Utils.showToast('至少需要勾選一種字元類型', 'warning');
      }
    });
  }

  // 頁面載入時自動產生一組密碼
  const initialPassword = generatePassword();
  if (initialPassword) {
    outputEl.textContent = initialPassword;
    updateStrengthIndicator(initialPassword);
  }
});
