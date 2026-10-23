/**
 * JSON / CSV Converter — 工具邏輯
 * 功能：雙向轉換 JSON 與 CSV，支援逗號、分號、Tab 與引號跳脫
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('json-csv-converter'); } catch (_) {}

  const btnModeJson2Csv = document.getElementById('btn-mode-json2csv');
  const btnModeCsv2Json = document.getElementById('btn-mode-csv2json');
  const delimiterSelect = document.getElementById('delimiter-select');
  const inputTitle = document.getElementById('input-title');
  const outputTitle = document.getElementById('output-title');
  const inputText = document.getElementById('input-text');
  const outputText = document.getElementById('output-text');
  const errorMsg = document.getElementById('error-msg');
  const btnSample = document.getElementById('btn-sample');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');

  let currentMode = 'json2csv'; // 'json2csv' | 'csv2json'

  /* ================================================================
     CSV 解析與建構函式
     ================================================================ */

  function escapeCsvCell(val, delimiter) {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replaceAll('"', '""')}"`;
    }
    return str;
  }

  function jsonToCsv(jsonStr, delimiter) {
    const data = JSON.parse(jsonStr);
    const arr = Array.isArray(data) ? data : [data];
    if (arr.length === 0) return '';

    // 收集所有物件的 keys
    const headerSet = new Set();
    arr.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach((k) => headerSet.add(k));
      }
    });

    const headers = Array.from(headerSet);
    const rows = [];

    // Header 標題列
    rows.push(headers.map((h) => escapeCsvCell(h, delimiter)).join(delimiter));

    // 資料列
    arr.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        const row = headers.map((h) => escapeCsvCell(item[h], delimiter));
        rows.push(row.join(delimiter));
      }
    });

    return rows.join('\n');
  }

  function parseCsvLine(line, delimiter) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // 跳過下一個跳脫的雙引號
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  function csvToJson(csvStr, delimiter) {
    const lines = csvStr.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('CSV 至少需要包含標題列與一筆資料列');
    }

    const headers = parseCsvLine(lines[0], delimiter).map((h) => h.trim());
    const jsonArr = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i], delimiter);
      const obj = {};
      headers.forEach((h, idx) => {
        let val = values[idx] !== undefined ? values[idx] : '';
        // 嘗試自動轉成數值或布林
        if (/^-?\d+(\.\d+)?$/.test(val.trim())) {
          obj[h] = parseFloat(val);
        } else if (val.trim().toLowerCase() === 'true') {
          obj[h] = true;
        } else if (val.trim().toLowerCase() === 'false') {
          obj[h] = false;
        } else {
          obj[h] = val;
        }
      });
      jsonArr.push(obj);
    }

    return JSON.stringify(jsonArr, null, 2);
  }

  /* ================================================================
     執行轉換
     ================================================================ */

  function performConversion() {
    errorMsg.style.display = 'none';
    const raw = inputText.value.trim();
    if (!raw) {
      outputText.value = '';
      return;
    }

    const delimiter = delimiterSelect.value;

    try {
      if (currentMode === 'json2csv') {
        outputText.value = jsonToCsv(raw, delimiter);
      } else {
        outputText.value = csvToJson(raw, delimiter);
      }
    } catch (err) {
      errorMsg.textContent = `轉換失敗：${err.message}`;
      errorMsg.style.display = 'block';
    }
  }

  const debouncedConvert = Utils.debounce(performConversion, 120);
  inputText.addEventListener('input', debouncedConvert);
  delimiterSelect.addEventListener('change', performConversion);

  // 模式切換
  btnModeJson2Csv.addEventListener('click', () => {
    currentMode = 'json2csv';
    btnModeJson2Csv.className = 'btn btn--sm btn--primary';
    btnModeCsv2Json.className = 'btn btn--sm btn--ghost';
    inputTitle.textContent = '輸入 JSON 資料';
    outputTitle.textContent = '轉換結果 (CSV)';
    inputText.placeholder = '請貼上 JSON 陣列，例如 [{"name":"Alice","age":25}, ...]';
    outputText.placeholder = 'CSV 表格字串將即時顯示於此…';
    btnDownload.textContent = '下載 CSV 檔案';
    loadSample();
  });

  btnModeCsv2Json.addEventListener('click', () => {
    currentMode = 'csv2json';
    btnModeCsv2Json.className = 'btn btn--sm btn--primary';
    btnModeJson2Csv.className = 'btn btn--sm btn--ghost';
    inputTitle.textContent = '輸入 CSV 資料';
    outputTitle.textContent = '轉換結果 (JSON)';
    inputText.placeholder = '請貼上含標題的 CSV 資料，例如：name,age,city\\nAlice,25,Taipei';
    outputText.placeholder = 'JSON 物件陣列將即時顯示於此…';
    btnDownload.textContent = '下載 JSON 檔案';
    loadSample();
  });

  function loadSample() {
    if (currentMode === 'json2csv') {
      inputText.value = JSON.stringify([
        { id: 1, name: "Qiyen", role: "Developer", city: "Taipei", status: "Active" },
        { id: 2, name: "Emily", role: "UI Designer", city: "New York", status: "Active" },
        { id: 3, name: "Michael", role: "Data Analyst", city: "London", status: "Pending" }
      ], null, 2);
    } else {
      inputText.value = `id,name,role,city,status
1,Qiyen,Developer,Taipei,Active
2,Emily,UI Designer,"New York, NY",Active
3,Michael,Data Analyst,London,Pending`;
    }
    performConversion();
  }

  btnSample.addEventListener('click', () => {
    loadSample();
    Utils.showToast('已載入範例資料', 'info');
  });

  btnClear.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    errorMsg.style.display = 'none';
    Utils.showToast('已清空輸入', 'info');
  });

  btnCopy.addEventListener('click', () => {
    const text = outputText.value;
    if (!text) return;
    Utils.copyToClipboard(text, '已複製轉換結果！');
  });

  btnDownload.addEventListener('click', () => {
    const text = outputText.value;
    if (!text) return;

    if (currentMode === 'json2csv') {
      Utils.downloadText(text, 'converted_data.csv', 'text/csv');
      Utils.showToast('已下載 CSV 檔案！', 'success');
    } else {
      Utils.downloadText(text, 'converted_data.json', 'application/json');
      Utils.showToast('已下載 JSON 檔案！', 'success');
    }
  });

  // 初始載入
  loadSample();
});
