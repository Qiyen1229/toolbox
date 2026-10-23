/**
 * Text Counter — 工具邏輯
 * 即時計算字元數、單字數、行數、句子數、段落數
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('text-counter'); } catch (_) {}

  const textInput = document.getElementById('text-input');

  const stats = {
    chars: document.getElementById('stat-chars'),
    charsNoSpaces: document.getElementById('stat-chars-no-spaces'),
    words: document.getElementById('stat-words'),
    lines: document.getElementById('stat-lines'),
    sentences: document.getElementById('stat-sentences'),
    paragraphs: document.getElementById('stat-paragraphs'),
  };

  /* ================================================================
     統計計算
     ================================================================ */

  /**
   * 計算並更新所有統計數據
   * @param {string} text — 輸入文字
   */
  function updateStats(text) {
    // 字元數（含空格）
    stats.chars.textContent = text.length;

    // 字元數（不含空格）
    stats.charsNoSpaces.textContent = text.replace(/\s/g, '').length;

    // 單字數
    // NOTE: 中文每個字算一個「字」，英文以空格分隔算一個「word」
    // 混合計算：先算英文單字，再加上中文字元數
    if (text.trim().length === 0) {
      stats.words.textContent = 0;
    } else {
      const englishWords = text.match(/[a-zA-Z0-9]+/g) || [];
      // 匹配 CJK 統一漢字區段
      const cjkChars = text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || [];
      stats.words.textContent = englishWords.length + cjkChars.length;
    }

    // 行數
    if (text.length === 0) {
      stats.lines.textContent = 0;
    } else {
      stats.lines.textContent = text.split('\n').length;
    }

    // 句子數（以 . ! ? 。！？作為句子結尾）
    if (text.trim().length === 0) {
      stats.sentences.textContent = 0;
    } else {
      const sentenceEndings = text.match(/[.!?\u3002\uff01\uff1f]+/g) || [];
      stats.sentences.textContent = sentenceEndings.length || (text.trim().length > 0 ? 1 : 0);
    }

    // 段落數（以空行分隔）
    if (text.trim().length === 0) {
      stats.paragraphs.textContent = 0;
    } else {
      const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
      stats.paragraphs.textContent = paragraphs.length;
    }
  }

  /* ================================================================
     事件綁定
     ================================================================ */

  // 即時更新統計
  textInput.addEventListener('input', () => {
    updateStats(textInput.value);
  });

  // 清除
  document.getElementById('btn-clear').addEventListener('click', () => {
    textInput.value = '';
    updateStats('');
    textInput.focus();
  });

  // 從剪貼簿貼上
  document.getElementById('btn-paste').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      textInput.value = text;
      updateStats(text);
      Utils.showToast('已從剪貼簿貼上', 'success');
    } catch {
      Utils.showToast('無法讀取剪貼簿，請手動貼上', 'warning');
    }
  });

  // 初始化統計
  updateStats('');
});
