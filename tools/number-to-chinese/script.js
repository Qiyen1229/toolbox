// 數字轉中文大寫與日常讀法

(function() {
  const numInput = document.getElementById('num-input');
  const outputFormal = document.getElementById('output-formal');
  const outputCommon = document.getElementById('output-common');
  const btnCopyFormal = document.getElementById('btn-copy-formal');
  const btnCopyCommon = document.getElementById('btn-copy-common');
  const presetBtns = document.querySelectorAll('.btn-preset');

  const DIGITS_FORMAL = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖'];
  const UNITS_FORMAL = ['', '拾', '佰', '仟'];
  const SECTION_UNITS = ['', '萬', '億', '兆', '京'];

  const DIGITS_COMMON = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const UNITS_COMMON = ['', '十', '百', '千'];

  function convertFormal(rawStr) {
    let s = rawStr.replace(/,/g, '').trim();
    if (!s) return '請輸入數字';
    
    let isNegative = false;
    if (s.startsWith('-')) {
      isNegative = true;
      s = s.substring(1).trim();
    }

    if (!/^\d+(\.\d+)?$/.test(s)) {
      return '數字格式無效';
    }

    const parts = s.split('.');
    let intPart = parts[0].replace(/^0+/, '');
    const decPart = parts[1] || '';

    if (!intPart) intPart = '0';

    if (intPart.length > 20) {
      return '數字過大，超出處理上限（最高支援至京）';
    }

    let result = '';

    if (intPart === '0' && (!decPart || /^0+$/.test(decPart))) {
      return '零元整';
    }

    if (intPart !== '0') {
      let len = intPart.length;
      let secCount = Math.ceil(len / 4);
      let secStrs = [];

      for (let i = 0; i < secCount; i++) {
        let end = len - i * 4;
        let start = Math.max(0, end - 4);
        let sec = intPart.substring(start, end);
        secStrs.push(sec);
      }

      let chnSecStrs = [];
      for (let i = 0; i < secStrs.length; i++) {
        let sec = secStrs[i];
        let secVal = parseInt(sec, 10);
        if (secVal === 0) {
          continue;
        }

        let secChn = '';
        let zero = false;
        for (let j = 0; j < sec.length; j++) {
          let d = parseInt(sec[j], 10);
          let unitIdx = sec.length - 1 - j;
          if (d === 0) {
            zero = true;
          } else {
            if (zero) {
              secChn += '零';
              zero = false;
            }
            secChn += DIGITS_FORMAL[d] + UNITS_FORMAL[unitIdx];
          }
        }
        chnSecStrs[i] = secChn + SECTION_UNITS[i];
      }

      let whole = '';
      for (let i = chnSecStrs.length - 1; i >= 0; i--) {
        if (chnSecStrs[i]) {
          whole += chnSecStrs[i];
        } else if (whole && !whole.endsWith('零')) {
          whole += '零';
        }
      }
      result = whole + '元';
    } else {
      result = '零元';
    }

    // 小數部分（角、分）
    if (decPart && decPart.length > 0) {
      let jiao = parseInt(decPart[0] || '0', 10);
      let fen = parseInt(decPart[1] || '0', 10);

      if (jiao === 0 && fen === 0) {
        result += '整';
      } else {
        if (jiao > 0) {
          result += DIGITS_FORMAL[jiao] + '角';
        } else if (intPart !== '0') {
          result += '零';
        }
        if (fen > 0) {
          result += DIGITS_FORMAL[fen] + '分';
        }
      }
    } else {
      result += '整';
    }

    // 清理可能重複的零
    result = result.replace(/零+/g, '零').replace(/零元/, '元');
    if (result.startsWith('元')) result = '零' + result;
    if (isNegative) result = '負' + result;

    return result;
  }

  function convertCommon(rawStr) {
    let s = rawStr.replace(/,/g, '').trim();
    if (!s) return '請輸入數字';

    let isNegative = false;
    if (s.startsWith('-')) {
      isNegative = true;
      s = s.substring(1).trim();
    }

    if (!/^\d+(\.\d+)?$/.test(s)) {
      return '數字格式無效';
    }

    const parts = s.split('.');
    let intPart = parts[0].replace(/^0+/, '');
    const decPart = parts[1] || '';

    if (!intPart) intPart = '0';
    if (intPart.length > 20) return '數字過大';

    let result = '';

    if (intPart === '0') {
      result = '零';
    } else {
      let len = intPart.length;
      let secCount = Math.ceil(len / 4);
      let secStrs = [];

      for (let i = 0; i < secCount; i++) {
        let end = len - i * 4;
        let start = Math.max(0, end - 4);
        secStrs.push(intPart.substring(start, end));
      }

      let chnSecStrs = [];
      for (let i = 0; i < secStrs.length; i++) {
        let sec = secStrs[i];
        let secVal = parseInt(sec, 10);
        if (secVal === 0) continue;

        let secChn = '';
        let zero = false;
        for (let j = 0; j < sec.length; j++) {
          let d = parseInt(sec[j], 10);
          let unitIdx = sec.length - 1 - j;
          if (d === 0) {
            zero = true;
          } else {
            if (zero) {
              secChn += '零';
              zero = false;
            }
            // 十前的一在特定開頭時可省略（例如十幾，不是一十幾）
            if (d === 1 && unitIdx === 1 && j === 0 && sec.length === 2 && i === secStrs.length - 1) {
              secChn += UNITS_COMMON[unitIdx];
            } else {
              secChn += DIGITS_COMMON[d] + UNITS_COMMON[unitIdx];
            }
          }
        }
        chnSecStrs[i] = secChn + SECTION_UNITS[i];
      }

      let whole = '';
      for (let i = chnSecStrs.length - 1; i >= 0; i--) {
        if (chnSecStrs[i]) {
          whole += chnSecStrs[i];
        } else if (whole && !whole.endsWith('零')) {
          whole += '零';
        }
      }
      result = whole;
    }

    if (decPart) {
      result += '點';
      for (let ch of decPart) {
        result += DIGITS_COMMON[parseInt(ch, 10)];
      }
    }

    result = result.replace(/零+/g, '零');
    if (isNegative) result = '負' + result;

    return result;
  }

  function update() {
    const val = numInput.value;
    outputFormal.textContent = convertFormal(val);
    outputCommon.textContent = convertCommon(val);
  }

  numInput.addEventListener('input', update);

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      numInput.value = btn.dataset.val;
      update();
    });
  });

  btnCopyFormal.addEventListener('click', () => {
    const txt = outputFormal.textContent;
    if (window.ToolboxApp && window.ToolboxApp.copyToClipboard) {
      window.ToolboxApp.copyToClipboard(txt, '大寫金額已複製');
    } else {
      navigator.clipboard.writeText(txt);
    }
  });

  btnCopyCommon.addEventListener('click', () => {
    const txt = outputCommon.textContent;
    if (window.ToolboxApp && window.ToolboxApp.copyToClipboard) {
      window.ToolboxApp.copyToClipboard(txt, '中文讀法已複製');
    } else {
      navigator.clipboard.writeText(txt);
    }
  });

  // 初始範例
  numInput.value = '1234567.89';
  update();
})();
