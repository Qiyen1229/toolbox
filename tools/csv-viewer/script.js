/**
 * CSV Viewer — 工具邏輯
 * 功能：CSV 解析為互動式資料表格、欄位點擊排序、全域搜尋過濾與分頁
 */

document.addEventListener('DOMContentLoaded', () => {
  try { StorageManager?.addRecent?.('csv-viewer'); } catch (_) {}

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const btnSample = document.getElementById('btn-sample');
  const btnToggleRaw = document.getElementById('btn-toggle-raw');
  const rawInputWrapper = document.getElementById('raw-input-wrapper');
  const rawCsvInput = document.getElementById('raw-csv-input');
  const btnParseRaw = document.getElementById('btn-parse-raw');
  const tableSection = document.getElementById('table-section');
  const searchFilter = document.getElementById('search-filter');
  const statsBadge = document.getElementById('stats-badge');
  const pageSizeSelect = document.getElementById('page-size-select');
  const tableHead = document.getElementById('table-head');
  const tableBody = document.getElementById('table-body');
  const pageInfo = document.getElementById('page-info');
  const btnPrevPage = document.getElementById('btn-prev-page');
  const btnNextPage = document.getElementById('btn-next-page');
  const btnExportJson = document.getElementById('btn-export-json');

  let headers = [];
  let allRows = [];
  let filteredRows = [];
  let sortColumn = -1;
  let sortAsc = true;
  let currentPage = 1;
  let pageSize = 25;

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('file-drop-zone--active');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('file-drop-zone--active');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('file-drop-zone--active');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      readCsvFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      readCsvFile(fileInput.files[0]);
    }
  });

  btnToggleRaw.addEventListener('click', () => {
    const isHidden = rawInputWrapper.style.display === 'none';
    rawInputWrapper.style.display = isHidden ? 'block' : 'none';
  });

  btnParseRaw.addEventListener('click', () => {
    const text = rawCsvInput.value.trim();
    if (!text) {
      Utils.showToast('請先貼上 CSV 內容', 'warning');
      return;
    }
    parseCsv(text);
  });

  function readCsvFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      parseCsv(e.target.result);
      Utils.showToast(`已成功載入 ${file.name}`, 'success');
    };
    reader.readAsText(file);
  }

  /* ================================================================
     CSV 解析函式
     ================================================================ */

  function parseCsvLine(line, delimiter = ',') {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
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

  function parseCsv(csvText) {
    const lines = csvText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      Utils.showToast('CSV 檔案為空', 'warning');
      return;
    }

    // 自動偵測分隔符號（逗號 vs 分號 vs Tab）
    const firstLine = lines[0];
    let delimiter = ',';
    if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) {
      delimiter = ';';
    } else if ((firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length) {
      delimiter = '\t';
    }

    headers = parseCsvLine(lines[0], delimiter).map((h) => h.trim());
    allRows = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i], delimiter);
      // 對齊長度
      while (row.length < headers.length) row.push('');
      allRows.push(row);
    }

    sortColumn = -1;
    sortAsc = true;
    currentPage = 1;
    filterData();
    tableSection.style.display = 'block';
  }

  /* ================================================================
     搜尋與排序
     ================================================================ */

  function filterData() {
    const q = (searchFilter.value || '').toLowerCase().trim();

    if (!q) {
      filteredRows = [...allRows];
    } else {
      filteredRows = allRows.filter((row) =>
        row.some((cell) => cell.toLowerCase().includes(q))
      );
    }

    if (sortColumn !== -1) {
      filteredRows.sort((a, b) => {
        const valA = a[sortColumn] || '';
        const valB = b[sortColumn] || '';
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);

        let cmp = 0;
        if (!isNaN(numA) && !isNaN(numB) && !valA.includes('-') && !valA.includes('/')) {
          cmp = numA - numB;
        } else {
          cmp = valA.localeCompare(valB, 'zh-Hant');
        }
        return sortAsc ? cmp : -cmp;
      });
    }

    currentPage = 1;
    renderTable();
  }

  function renderTable() {
    statsBadge.textContent = `共 ${filteredRows.length} 筆資料 (共 ${headers.length} 欄)`;

    // 渲染標題
    tableHead.innerHTML = `
      <tr>
        <th style="padding: 10px 14px; width: 50px; color: var(--color-text-tertiary);">#</th>
        ${headers
          .map(
            (h, idx) => `
          <th style="padding: 10px 14px; cursor: pointer; user-select: none;" data-col="${idx}">
            <span style="display: inline-flex; align-items: center; gap: 4px;">
              ${Utils.escapeHtml(h)}
              <span style="font-size: 0.75rem; color: ${sortColumn === idx ? 'var(--color-accent)' : 'var(--color-text-tertiary)'};">
                ${sortColumn === idx ? (sortAsc ? '▲' : '▼') : '↕'}
              </span>
            </span>
          </th>
        `
          )
          .join('')}
      </tr>
    `;

    // 分頁切片
    pageSize = parseInt(pageSizeSelect.value, 10) || 25;
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * pageSize;
    const pageRows = filteredRows.slice(startIdx, startIdx + pageSize);

    tableBody.innerHTML = pageRows
      .map(
        (row, rIdx) => `
      <tr style="border-bottom: 1px solid var(--color-border);">
        <td style="padding: 8px 14px; color: var(--color-text-tertiary);">${startIdx + rIdx + 1}</td>
        ${row.map((cell) => `<td style="padding: 8px 14px; word-break: break-all;">${Utils.escapeHtml(cell)}</td>`).join('')}
      </tr>
    `
      )
      .join('');

    pageInfo.textContent = `頁次：${currentPage} / ${totalPages}`;
    btnPrevPage.disabled = currentPage <= 1;
    btnNextPage.disabled = currentPage >= totalPages;
  }

  // 點擊表頭排序
  tableHead.addEventListener('click', (e) => {
    const th = e.target.closest('th[data-col]');
    if (!th) return;
    const col = parseInt(th.dataset.col, 10);

    if (sortColumn === col) {
      sortAsc = !sortAsc;
    } else {
      sortColumn = col;
      sortAsc = true;
    }
    filterData();
  });

  // 搜尋過濾
  searchFilter.addEventListener('input', Utils.debounce(filterData, 150));
  pageSizeSelect.addEventListener('change', () => {
    currentPage = 1;
    renderTable();
  });

  btnPrevPage.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });

  btnNextPage.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredRows.length / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      renderTable();
    }
  });

  // 載入範例
  btnSample.addEventListener('click', () => {
    const sample = `編號,品名,分類,單價,庫存,供應商,上架日期
P1001,MacBook Pro 14",電腦硬體,59900,12,Apple Inc.,2026-01-15
P1002,Sony WH-1000XM5,影音設備,10900,45,Sony Taiwan,2026-02-10
P1003,Logitech MX Master 3S,電腦週邊,3290,88,Logitech,2026-03-01
P1004,Dell UltraSharp 27",顯示器,18500,20,Dell,2026-03-12
P1005,Keychron K2 Pro,電腦週邊,2980,35,Keychron,2026-03-18
P1006,Synology DS923+,網路儲存,17999,8,Synology,2026-04-05
P1007,ASUS RT-BE92U,無線路由器,8990,16,ASUSTeK,2026-04-11`;

    parseCsv(sample);
    Utils.showToast('已載入商品庫存範例 CSV', 'info');
  });

  // 匯出 JSON
  btnExportJson.addEventListener('click', () => {
    if (filteredRows.length === 0) return;

    const jsonList = filteredRows.map((row) => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = row[idx] || '';
      });
      return obj;
    });

    Utils.downloadText(JSON.stringify(jsonList, null, 2), 'table_data.json', 'application/json');
    Utils.showToast('已成功匯出 JSON！', 'success');
  });

  // 初始載入範例
  btnSample.click();
});
