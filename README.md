# Qiyen Toolbox

個人工具箱:純前端靜態網頁(PWA),收錄 80 多個日常小工具,放進任何靜態伺服器即可使用。

## 工具分類

- **開發者**:JSON／SQL／HTML／CSS／JS 格式化、Regex 測試、JWT 解碼、Base64、URL 編解碼、UUID、Cron 產生器、API 測試、DNS／IP 查詢
- **文字**:字數統計、大小寫轉換、文字比對、Markdown 預覽／轉 HTML、Lorem Ipsum、擷取 Email／URL／IP／數字
- **圖片與 PDF**:壓縮、轉檔、裁切、縮放、浮水印、圖片轉 PDF、PDF 合併／分割、QR Code 產生與掃描
- **計算與生活**:貸款、複利、折扣、小費、分帳、BMI、年齡／日期計算、單位／匯率／時區轉換、成績計算
- **其他**:番茄鐘、倒數計時、碼表、隨機抽籤／分組、摩斯密碼

## 執行

```bash
npx serve .
```

打開終端機顯示的網址即可。各工具位於 `tools/<名稱>/`,註冊清單在 `js/tools-registry.js`。
