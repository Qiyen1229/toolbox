/**
 * Lorem Ipsum Generator — 工具邏輯
 * 功能：提供經典拉丁假文與繁體中文排版預覽文章產生
 */

document.addEventListener('DOMContentLoaded', () => {
  // 記錄使用紀錄
  try { StorageManager?.addRecent?.('lorem-ipsum-generator'); } catch (_) {}

  // DOM 元素
  const loremType = document.getElementById('lorem-type');
  const loremParagraphs = document.getElementById('lorem-paragraphs');
  const labelParagraphs = document.getElementById('label-paragraphs');
  const loremSentences = document.getElementById('lorem-sentences');
  const labelSentences = document.getElementById('label-sentences');
  const optHtmlP = document.getElementById('opt-html-p');
  const optStartLorem = document.getElementById('opt-start-lorem');
  const wrapperStartLorem = document.getElementById('wrapper-start-lorem');
  const btnGenerate = document.getElementById('btn-generate');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');
  const loremOutput = document.getElementById('lorem-output');
  const resultStats = document.getElementById('result-stats');

  /* ================================================================
     詞庫資料庫
     ================================================================ */

  // 拉丁文字庫
  const LATIN_WORDS = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'curabitur', 'pretium',
    'tincidunt', 'lacus', 'pellentesque', 'habitant', 'morbi', 'tristique', 'senectus',
    'netus', 'malesuada', 'fames', 'ac', 'turpis', 'egestas', 'vestibulum', 'tortor'
  ];

  // 繁體中文語句庫（排版專用，語感自然、標點豐富、長度適中）
  const ZH_SENTENCES = [
    '在資訊科技迅速發展的今日，個人數位工具箱成為提升日常生產力與工作流的關鍵要素。',
    '現代的使用者介面設計強調清晰、直觀與流暢的互動體驗，每一個微互動都影響著使用者的視覺感知。',
    '透過將運算與資料完全保留在使用者本地瀏覽器中執行，不僅能確保高度隱私，亦省去了繁重的伺服器負載。',
    '淡水河畔的微風輕拂過石板路，夕陽餘暉灑落在紅樹林自然保護區的茂密枝葉上。',
    '從前端元件架構到後端高效能服務，模組化設計一直是軟體工程長久穩定發展的磐石。',
    '深色模式與淺色模式的無縫切換，使網頁在不同的環境光照條件下皆能維持最舒適的閱讀感受。',
    '精確的資料型別驗證與結構化排版，能夠大幅度減少程式碼在執行期間所遭遇的各類潛在異常。',
    '設計與工程從來不是兩條平行的軌道，兩者的精準交匯才能淬鍊出真正感動人心的極致作品。',
    '隨著網路速度的演進，使用者對於秒級甚至毫秒級的載入速度抱持著前所未有的極高期待。',
    '靈活的版面配置能夠因應手機、平板與桌面顯示器的多元螢幕尺寸，提供一致且優雅的排版表現。',
    '每一次微小改進的持續累積，終將在漫長的開發旅程中匯聚為令人驚艷的卓越成果。',
    '字體排印學是視覺傳達的靈魂，適當的行高與字符間距賦予文字最純粹的閱讀律動。'
  ];

  /* ================================================================
     產生演算法
     ================================================================ */

  /**
   * 隨機取得陣列元素
   * @param {Array} arr
   * @returns {*}
   */
  function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * 產生單一拉丁文句子
   * @param {number} minWords
   * @param {number} maxWords
   * @returns {string}
   */
  function generateLatinSentence(minWords = 6, maxWords = 14) {
    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    const words = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(getRandom(LATIN_WORDS));
    }
    const sentence = words.join(' ');
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  }

  /**
   * 產生單一繁體中文段落
   * @param {number} sentenceCount
   * @returns {string}
   */
  function generateZhParagraph(sentenceCount) {
    const list = [];
    for (let i = 0; i < sentenceCount; i++) {
      list.push(getRandom(ZH_SENTENCES));
    }
    return list.join('');
  }

  /**
   * 產生單一拉丁文段落
   * @param {number} sentenceCount
   * @returns {string}
   */
  function generateLatinParagraph(sentenceCount) {
    const list = [];
    for (let i = 0; i < sentenceCount; i++) {
      list.push(generateLatinSentence());
    }
    return list.join(' ');
  }

  /**
   * 產生完整假文文章
   */
  function generateLorem() {
    const type = loremType ? loremType.value : 'latin';
    const pCount = parseInt(loremParagraphs ? loremParagraphs.value : '3', 10) || 3;
    const sCount = parseInt(loremSentences ? loremSentences.value : '5', 10) || 5;
    const withHtml = optHtmlP ? optHtmlP.checked : false;
    const startLorem = optStartLorem ? (optStartLorem.checked && type === 'latin') : false;

    const paragraphs = [];

    for (let i = 0; i < pCount; i++) {
      let pText = '';
      if (type === 'latin') {
        pText = generateLatinParagraph(sCount);
        if (i === 0 && startLorem) {
          // 固定開頭為 "Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
          pText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + pText;
        }
      } else {
        pText = generateZhParagraph(sCount);
      }

      if (withHtml) {
        paragraphs.push(`<p>${pText}</p>`);
      } else {
        paragraphs.push(pText);
      }
    }

    const separator = withHtml ? '\n\n' : '\n\n';
    const fullText = paragraphs.join(separator);

    loremOutput.textContent = fullText;

    // 更新統計
    const totalChars = fullText.replace(/\s+/g, '').length;
    resultStats.textContent = `統計：${pCount} 段 · ${totalChars} 字元`;
  }

  /* ================================================================
     事件綁定
     ================================================================ */

  // 滑桿數值即時更新
  loremParagraphs.addEventListener('input', () => {
    labelParagraphs.textContent = loremParagraphs.value;
    generateLorem();
  });

  loremSentences.addEventListener('input', () => {
    labelSentences.textContent = loremSentences.value;
    generateLorem();
  });

  // 語言切換
  loremType.addEventListener('change', () => {
    if (loremType.value === 'zh') {
      wrapperStartLorem.style.display = 'none';
    } else {
      wrapperStartLorem.style.display = 'inline-flex';
    }
    generateLorem();
  });

  // 選項切換
  optHtmlP.addEventListener('change', generateLorem);
  optStartLorem.addEventListener('change', generateLorem);

  // 重新產生
  btnGenerate.addEventListener('click', generateLorem);

  // 複製
  btnCopy.addEventListener('click', () => {
    const text = loremOutput.textContent;
    if (!text) return;
    Utils.copyToClipboard(text);
  });

  // 下載檔案
  btnDownload.addEventListener('click', () => {
    const text = loremOutput.textContent;
    if (!text) return;
    const isHtml = optHtmlP.checked;
    const filename = isHtml ? 'lorem-ipsum.html' : 'lorem-ipsum.txt';
    const mime = isHtml ? 'text/html' : 'text/plain';
    Utils.downloadFile(text, filename, mime);
    Utils.showToast(`已下載 ${filename}`, 'success');
  });

  // 清空
  const btnClear = document.getElementById('btn-clear');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      loremOutput.textContent = '';
      resultStats.textContent = '統計：0 段 · 0 字元';
      Utils.showToast('已清空假文內容', 'info');
    });
  }

  // 初始化產生
  generateLorem();
});
