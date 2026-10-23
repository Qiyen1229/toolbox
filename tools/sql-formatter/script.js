/**
 * SQL Formatter 實作腳本
 */
document.addEventListener('DOMContentLoaded', () => {
  StorageManager.addRecent('sql-formatter');

  const sqlInput = document.getElementById('sql-input');
  const sqlOutput = document.getElementById('sql-output');
  const indentSelect = document.getElementById('indent-select');
  const btnFormat = document.getElementById('btn-format');
  const btnMinify = document.getElementById('btn-minify');
  const btnDemo = document.getElementById('btn-demo');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');

  const KEYWORDS = [
    'SELECT', 'FROM', 'WHERE', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'CROSS JOIN', 'JOIN',
    'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION ALL', 'UNION', 'INSERT INTO', 'VALUES',
    'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'AND', 'OR', 'AS', 'ON',
    'IN', 'IS NULL', 'IS NOT NULL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'DISTINCT', 'BETWEEN', 'EXISTS'
  ];

  function formatSql(sql, indentSize = 4) {
    if (!sql.trim()) return '';

    const indent = ' '.repeat(indentSize);
    // 壓縮成單行標準化
    let s = sql.replace(/\s+/g, ' ').trim();

    // 關鍵字大寫轉換
    KEYWORDS.forEach(kw => {
      const reg = new RegExp(`\\b${kw}\\b`, 'gi');
      s = s.replace(reg, kw);
    });

    // 主要子句換行
    const majorClauses = [
      'SELECT', 'FROM', 'WHERE', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'JOIN',
      'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION ALL', 'UNION',
      'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'
    ];

    majorClauses.forEach(clause => {
      const reg = new RegExp(`\\s+(${clause})\\b`, 'g');
      s = s.replace(reg, `\n$1`);
    });

    // 次級子句換行與縮排
    const subClauses = ['AND', 'OR'];
    subClauses.forEach(clause => {
      const reg = new RegExp(`\\s+(${clause})\\b`, 'g');
      s = s.replace(reg, `\n${indent}$1`);
    });

    return s.trim();
  }

  function minifySql(sql) {
    return sql.replace(/\s+/g, ' ').trim();
  }

  btnFormat.addEventListener('click', () => {
    const raw = sqlInput.value;
    if (!raw.trim()) {
      Utils.showToast('請輸入 SQL 語句', 'warning');
      return;
    }
    const formatted = formatSql(raw, parseInt(indentSelect.value));
    sqlOutput.textContent = formatted;
    Utils.showToast('格式化完成', 'success');
  });

  btnMinify.addEventListener('click', () => {
    const raw = sqlInput.value;
    if (!raw.trim()) return;
    sqlOutput.textContent = minifySql(raw);
    Utils.showToast('已單行壓縮', 'info');
  });

  btnDemo.addEventListener('click', () => {
    sqlInput.value = `select u.id, u.username, p.title, count(c.id) as comment_count from users u left join posts p on p.user_id = u.id left join comments c on c.post_id = p.id where u.status = 'active' and u.created_at >= '2026-01-01' group by u.id, p.title having count(c.id) > 5 order by comment_count desc limit 10;`;
    btnFormat.click();
  });

  btnClear.addEventListener('click', () => {
    sqlInput.value = '';
    sqlOutput.textContent = '';
    sqlInput.focus();
  });

  btnCopy.addEventListener('click', () => {
    if (!sqlOutput.textContent) {
      Utils.showToast('目前無可複製內容', 'warning');
      return;
    }
    Utils.copyToClipboard(sqlOutput.textContent, '已複製 SQL 結果');
  });

  indentSelect.addEventListener('change', () => {
    if (sqlInput.value.trim()) btnFormat.click();
  });

  btnDemo.click();
});
