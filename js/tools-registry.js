/**
 * Qiyen Toolbox — Tools Registry
 * 所有工具的註冊表，首頁與搜尋從此檔案讀取工具清單
 *
 * 全站工具總數：80 款（100% 純前端本地執行）
 * 一般日常模式：52 款日常生活/學習/財務/工具（排在清單上方）
 * 開發者模式 (Developer Mode)：解鎖額外 28 款進階專業技術/站長工具（排在清單最下方）
 */

/* ================================================================
   工具分類定義
   ================================================================ */
const TOOL_CATEGORIES = {
  "popular": {
    "name": "常用",
    "icon": "⭐"
  },
  "developer": {
    "name": "Developer",
    "icon": "⚡"
  },
  "pdf": {
    "name": "PDF 工具",
    "icon": "📄"
  },
  "image": {
    "name": "圖片處理",
    "icon": "🖼️"
  },
  "file": {
    "name": "檔案處理",
    "icon": "📁"
  },
  "text": {
    "name": "文字編輯",
    "icon": "📝"
  },
  "extract": {
    "name": "智慧提取",
    "icon": "🔍"
  },
  "finance": {
    "name": "生活財務",
    "icon": "💰"
  },
  "math": {
    "name": "數學計算",
    "icon": "📐"
  },
  "time": {
    "name": "時間時區",
    "icon": "⏰"
  },
  "random": {
    "name": "隨機抽籤",
    "icon": "🎲"
  },
  "academic": {
    "name": "學業成績",
    "icon": "🎓"
  },
  "network": {
    "name": "網路站長",
    "icon": "🌐"
  },
  "encoding": {
    "name": "編碼加密",
    "icon": "🔐"
  }
};

/* ================================================================
   SVG Icon 定義
   ================================================================ */
const TOOL_ICONS = {
  "qr-code": "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"14\" width=\"3\" height=\"3\"/><line x1=\"21\" y1=\"14\" x2=\"21\" y2=\"14.01\"/><line x1=\"14\" y1=\"21\" x2=\"14\" y2=\"21.01\"/><line x1=\"21\" y1=\"21\" x2=\"21\" y2=\"21.01\"/><line x1=\"21\" y1=\"17\" x2=\"21\" y2=\"17.01\"/><line x1=\"17\" y1=\"21\" x2=\"17\" y2=\"21.01\"/>",
  "scan": "<path d=\"M3 7V5a2 2 0 0 1 2-2h2\"/><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"/><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"/><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"/><line x1=\"7\" y1=\"12\" x2=\"17\" y2=\"12\"/>",
  "key": "<path d=\"M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4\"/>",
  "hash": "<line x1=\"4\" y1=\"9\" x2=\"20\" y2=\"9\"/><line x1=\"4\" y1=\"15\" x2=\"20\" y2=\"15\"/><line x1=\"10\" y1=\"3\" x2=\"8\" y2=\"21\"/><line x1=\"16\" y1=\"3\" x2=\"14\" y2=\"21\"/>",
  "code": "<polyline points=\"16 18 22 12 16 6\"/><polyline points=\"8 6 2 12 8 18\"/>",
  "link": "<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"/><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/>",
  "braces": "<path d=\"M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1\"/><path d=\"M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1\"/>",
  "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/>",
  "ruler": "<path d=\"M16 3h5v5\"/><line x1=\"21\" y1=\"3\" x2=\"14\" y2=\"10\"/><path d=\"M3.29 3.29 5 5\"/><path d=\"M7 3.29 8.5 5\"/><path d=\"M3.29 7 5 8.5\"/><path d=\"M3 21l9-9\"/><path d=\"M12.71 12.71 11 11\"/><path d=\"M3.29 11 5 12.5\"/><path d=\"M11 3.29 12.5 5\"/>",
  "palette": "<circle cx=\"13.5\" cy=\"6.5\" r=\"2\"/><circle cx=\"17.5\" cy=\"10.5\" r=\"2\"/><circle cx=\"8.5\" cy=\"7.5\" r=\"2\"/><circle cx=\"6.5\" cy=\"12.5\" r=\"2\"/><path d=\"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z\"/>",
  "text": "<path d=\"M17 6.1H3\"/><path d=\"M21 12.1H3\"/><path d=\"M15.1 18H3\"/>",
  "counter": "<path d=\"M5 7V3h14v4\"/><path d=\"M5 21V17h14v4\"/><rect x=\"2\" y=\"7\" width=\"20\" height=\"10\" rx=\"2\"/>",
  "case": "<polyline points=\"4 7 4 4 20 4 20 7\"/><line x1=\"9\" y1=\"20\" x2=\"15\" y2=\"20\"/><line x1=\"12\" y1=\"4\" x2=\"12\" y2=\"20\"/>",
  "compress": "<path d=\"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242\"/><polyline points=\"12 12 12 21\"/><polyline points=\"8 17 12 21 16 17\"/>",
  "convert": "<path d=\"M4 12h16\"/><polyline points=\"14 6 20 12 14 18\"/>",
  "resize": "<path d=\"M15 3h6v6\"/><path d=\"M9 21H3v-6\"/><line x1=\"21\" y1=\"3\" x2=\"14\" y2=\"10\"/><line x1=\"3\" y1=\"21\" x2=\"10\" y2=\"14\"/>",
  "file-hash": "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"/><polyline points=\"14 2 14 8 20 8\"/><line x1=\"9\" y1=\"13\" x2=\"15\" y2=\"13\"/><line x1=\"9\" y1=\"17\" x2=\"13\" y2=\"17\"/>",
  "diff": "<rect x=\"2\" y=\"3\" width=\"8\" height=\"18\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"8\" height=\"18\" rx=\"1\"/><line x1=\"6\" y1=\"8\" x2=\"6\" y2=\"8.01\"/><line x1=\"6\" y1=\"12\" x2=\"6\" y2=\"12.01\"/><line x1=\"18\" y1=\"8\" x2=\"18\" y2=\"8.01\"/><line x1=\"18\" y1=\"12\" x2=\"18\" y2=\"12.01\"/>",
  "stopwatch": "<circle cx=\"12\" cy=\"13\" r=\"8\"/><path d=\"M12 9v4l2 2\"/><path d=\"M10 2h4\"/><path d=\"M12 2v3\"/><path d=\"M19.4 6.6l1-1\"/>",
  "timer": "<circle cx=\"12\" cy=\"13\" r=\"8\"/><path d=\"M12 9v4\"/><path d=\"M10 2h4\"/><path d=\"M12 2v3\"/><path d=\"M5 5l1.5 1.5\"/><path d=\"M17.5 6.5L19 5\"/>",
  "lorem": "<line x1=\"17\" y1=\"10\" x2=\"3\" y2=\"10\"/><line x1=\"21\" y1=\"6\" x2=\"3\" y2=\"6\"/><line x1=\"21\" y1=\"14\" x2=\"3\" y2=\"14\"/><line x1=\"17\" y1=\"18\" x2=\"3\" y2=\"18\"/>",
  "api-tester": "<polygon points=\"5 3 19 12 5 21 5 3\"/>",
  "jwt-decoder": "<rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/>",
  "regex-tester": "<path d=\"m5 16 6-6M5 10l6 6M14 6l3 3-3 3M19 6v12\"/>",
  "cron-generator": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/><path d=\"M12 2v2M12 20v2M2 12h2M20 12h2\"/>",
  "http-status": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"/><line x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\"/>",
  "sql-formatter": "<ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\"/><path d=\"M21 12c0 1.66-4 3-9 3s-9-1.34-9-3\"/><path d=\"M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5\"/>",
  "html-formatter": "<polyline points=\"16 18 22 12 16 6\"/><polyline points=\"8 6 2 12 8 18\"/><line x1=\"14\" y1=\"4\" x2=\"10\" y2=\"20\"/>",
  "css-formatter": "<path d=\"M4 3h16l-1.5 15L12 21l-6.5-3z\"/><path d=\"M8.5 7h7M8.5 11h6.5l-.5 4.5L12 17l-2.5-1.5L9.2 13\"/>",
  "js-formatter": "<path d=\"M3 3h18v18H3z\"/><path d=\"M16 8v8c0 1.5-1 2-2.5 2M9 13c.5 1 1.5 1.5 2.5 1s1-1.5 0-2.5l-1-1c-1-1-.5-2.5 1-2.5s2 1 2 2\"/>",
  "markdown-preview": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><polyline points=\"7 15 7 9 9.5 12 12 9 12 15\"/><polyline points=\"15 12 17 14 19 12\"/><line x1=\"17\" y1=\"14\" x2=\"17\" y2=\"9\"/>",
  "user-agent": "<rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"2\"/><line x1=\"8\" y1=\"21\" x2=\"16\" y2=\"21\"/><line x1=\"12\" y1=\"17\" x2=\"12\" y2=\"21\"/>",
  "ip-lookup": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/><path d=\"M2 12h20\"/>",
  "color-picker": "<path d=\"m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z\"/><path d=\"m5 2 5 5\"/><circle cx=\"19\" cy=\"19\" r=\"2\"/>",
  "git-generator": "<line x1=\"6\" y1=\"3\" x2=\"6\" y2=\"15\"/><circle cx=\"18\" cy=\"6\" r=\"3\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><path d=\"M18 9a9 9 0 0 1-9 9\"/>",
  "pdf": "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"/><polyline points=\"14 2 14 8 20 8\"/><line x1=\"9\" y1=\"15\" x2=\"15\" y2=\"15\"/>",
  "crop": "<path d=\"M6.13 1L6 16a2 2 0 0 0 2 2h15\"/><path d=\"M1 6.13L16 6a2 2 0 0 1 2 2v15\"/>",
  "watermark": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3v18\"/><path d=\"M12 12l6 6\"/>",
  "globe": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"/><path d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"/>",
  "network": "<rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"2\"/><line x1=\"8\" y1=\"21\" x2=\"16\" y2=\"21\"/><line x1=\"12\" y1=\"17\" x2=\"12\" y2=\"21\"/>",
  "email": "<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\"/><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\"/>",
  "dollar": "<line x1=\"12\" y1=\"1\" x2=\"12\" y2=\"23\"/><path d=\"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/>",
  "percent": "<line x1=\"19\" y1=\"5\" x2=\"5\" y2=\"19\"/><circle cx=\"6.5\" cy=\"6.5\" r=\"2.5\"/><circle cx=\"17.5\" cy=\"17.5\" r=\"2.5\"/>",
  "tag": "<path d=\"M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z\"/><line x1=\"7\" y1=\"7\" x2=\"7.01\" y2=\"7\"/>",
  "users": "<path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/>",
  "building": "<rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\" ry=\"2\"/><line x1=\"9\" y1=\"22\" x2=\"9\" y2=\"2\"/><line x1=\"8\" y1=\"6\" x2=\"10\" y2=\"6\"/><line x1=\"8\" y1=\"10\" x2=\"10\" y2=\"10\"/><line x1=\"8\" y1=\"14\" x2=\"10\" y2=\"14\"/><line x1=\"8\" y1=\"18\" x2=\"10\" y2=\"18\"/><line x1=\"14\" y1=\"6\" x2=\"16\" y2=\"6\"/><line x1=\"14\" y1=\"10\" x2=\"16\" y2=\"10\"/><line x1=\"14\" y1=\"14\" x2=\"16\" y2=\"14\"/><line x1=\"14\" y1=\"18\" x2=\"16\" y2=\"18\"/>",
  "calendar": "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"/><line x1=\"16\" y1=\"2\" x2=\"16\" y2=\"6\"/><line x1=\"8\" y1=\"2\" x2=\"8\" y2=\"6\"/><line x1=\"3\" y1=\"10\" x2=\"21\" y2=\"10\"/>",
  "user": "<path d=\"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/>",
  "presentation": "<rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"2\"/><line x1=\"8\" y1=\"21\" x2=\"16\" y2=\"21\"/><line x1=\"12\" y1=\"17\" x2=\"12\" y2=\"21\"/>",
  "dice": "<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"5\" ry=\"5\"/><circle cx=\"8\" cy=\"8\" r=\"1.5\"/><circle cx=\"16\" cy=\"16\" r=\"1.5\"/><circle cx=\"12\" cy=\"12\" r=\"1.5\"/>",
  "trophy": "<path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"/><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"/><path d=\"M4 22h16\"/><path d=\"M10 14.66V17c0 .55-.45 1-1 1H7v2h10v-2h-2c-.55 0-1-.45-1-1v-2.34\"/><path d=\"M18 4H6v7a6 6 0 0 0 12 0V4z\"/>",
  "graduation": "<path d=\"M22 10v6M2 10l10-5 10 5-10 5z\"/><path d=\"M6 12v5c3 3 9 3 12 0v-5\"/>",
  "heart": "<path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/>",
  "note": "<path d=\"M12 20h9\"/><path d=\"M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z\"/>",
  "table": "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18\"/><path d=\"M3 15h18\"/><path d=\"M9 3v18\"/><path d=\"M15 3v18\"/>",
  "morse": "<path d=\"M2 12h2\"/><path d=\"M7 12h6\"/><path d=\"M16 12h2\"/><path d=\"M21 12h1\"/><path d=\"M4 18h4\"/><path d=\"M12 18h8\"/>"
};

/* ================================================================
   工具註冊清單 (共 80 款，所有 Developer 工具集中於最下方)
   ================================================================ */
const TOOLS = [
  {
    "id": "qr-code-generator",
    "name": "QR Code 產生器",
    "nameEn": "QR Code Generator",
    "description": "輸入文字或網址，即時產生 QR Code 並下載 PNG",
    "categories": [
      "popular",
      "encoding"
    ],
    "keywords": [
      "qr",
      "qrcode",
      "二維碼",
      "條碼",
      "barcode",
      "generator"
    ],
    "icon": "qr-code",
    "url": "tools/qr-code-generator/index.html"
  },
  {
    "id": "qr-code-scanner",
    "name": "QR Code 掃描器",
    "nameEn": "QR Code Scanner",
    "description": "使用相機掃描 QR Code，也可上傳圖片進行辨識",
    "categories": [
      "popular",
      "encoding"
    ],
    "keywords": [
      "qr",
      "qrcode",
      "掃描",
      "相機",
      "scan",
      "camera",
      "scanner"
    ],
    "icon": "scan",
    "url": "tools/qr-code-scanner/index.html"
  },
  {
    "id": "password-generator",
    "name": "隨機密碼產生器",
    "nameEn": "Password Generator",
    "description": "自訂長度與字元組合，產生高強度安全密碼",
    "categories": [
      "popular",
      "encoding"
    ],
    "keywords": [
      "password",
      "密碼",
      "安全",
      "隨機",
      "generator"
    ],
    "icon": "key",
    "url": "tools/password-generator/index.html"
  },
  {
    "id": "url-encoder-decoder",
    "name": "URL 編碼/解碼",
    "nameEn": "URL Encoder / Decoder",
    "description": "URL encode 與 decode 轉換，支援特殊字元",
    "categories": [
      "encoding",
      "network"
    ],
    "keywords": [
      "url",
      "uri",
      "encode",
      "decode",
      "網址",
      "編碼",
      "解碼"
    ],
    "icon": "link",
    "url": "tools/url-encoder-decoder/index.html"
  },
  {
    "id": "unit-converter",
    "name": "單位換算器",
    "nameEn": "Unit Converter",
    "description": "長度、重量、溫度、面積、體積等常用單位換算",
    "categories": [
      "popular",
      "math"
    ],
    "keywords": [
      "unit",
      "converter",
      "單位",
      "換算",
      "長度",
      "重量",
      "溫度"
    ],
    "icon": "ruler",
    "url": "tools/unit-converter/index.html"
  },
  {
    "id": "color-converter",
    "name": "顏色轉換器",
    "nameEn": "Color Converter",
    "description": "HEX、RGB、HSL 顏色格式互轉，附調色盤預覽",
    "categories": [
      "image"
    ],
    "keywords": [
      "color",
      "hex",
      "rgb",
      "hsl",
      "顏色",
      "調色盤",
      "色碼"
    ],
    "icon": "palette",
    "url": "tools/color-converter/index.html"
  },
  {
    "id": "text-counter",
    "name": "字數統計工具",
    "nameEn": "Word Counter",
    "description": "統計字數、字元數、行數、段落數與閱讀時間",
    "categories": [
      "popular",
      "text"
    ],
    "keywords": [
      "word",
      "character",
      "count",
      "字數",
      "字元",
      "統計"
    ],
    "icon": "counter",
    "url": "tools/text-counter/index.html"
  },
  {
    "id": "case-converter",
    "name": "英文字母大小寫轉換",
    "nameEn": "Case Converter",
    "description": "大寫、小寫、標題字首大寫、駝峰命名等轉換",
    "categories": [
      "popular",
      "text"
    ],
    "keywords": [
      "case",
      "uppercase",
      "lowercase",
      "camelcase",
      "大小寫",
      "轉換"
    ],
    "icon": "case",
    "url": "tools/case-converter/index.html"
  },
  {
    "id": "image-compressor",
    "name": "圖片壓縮工具",
    "nameEn": "Image Compressor",
    "description": "在瀏覽器中壓縮 JPG、PNG 圖片，自訂品質",
    "categories": [
      "popular",
      "image",
      "file"
    ],
    "keywords": [
      "image",
      "compress",
      "photo",
      "圖片",
      "壓縮",
      "瘦身"
    ],
    "icon": "compress",
    "url": "tools/image-compressor/index.html"
  },
  {
    "id": "image-converter",
    "name": "圖片格式互轉",
    "nameEn": "Image Format Converter",
    "description": "支援 PNG、JPG、WEBP、AVIF、BMP、ICO 圖示與 GIF 多格式互轉",
    "categories": [
      "popular",
      "image",
      "file"
    ],
    "keywords": [
      "image",
      "convert",
      "png",
      "jpg",
      "webp",
      "avif",
      "bmp",
      "ico",
      "gif",
      "轉檔"
    ],
    "icon": "convert",
    "url": "tools/image-converter/index.html"
  },
  {
    "id": "image-resizer",
    "name": "圖片尺寸調整",
    "nameEn": "Image Resizer",
    "description": "依像素或百分比調整圖片大小，保持比例",
    "categories": [
      "popular",
      "image",
      "file"
    ],
    "keywords": [
      "image",
      "resize",
      "scale",
      "圖片",
      "尺寸",
      "縮放"
    ],
    "icon": "resize",
    "url": "tools/image-resizer/index.html"
  },
  {
    "id": "text-diff",
    "name": "文字比對工具",
    "nameEn": "Text Diff Checker",
    "description": "比對兩段文字的差異，標示新增、刪除與修改內容",
    "categories": [
      "text"
    ],
    "keywords": [
      "diff",
      "compare",
      "text",
      "比對",
      "差異",
      "文字"
    ],
    "icon": "diff",
    "url": "tools/text-diff/index.html"
  },
  {
    "id": "stopwatch",
    "name": "線上碼錶",
    "nameEn": "Stopwatch",
    "description": "精確到毫秒的碼錶，支援計次（分段計時）功能",
    "categories": [
      "popular",
      "time"
    ],
    "keywords": [
      "stopwatch",
      "timer",
      "lap",
      "碼錶",
      "計時",
      "分段"
    ],
    "icon": "stopwatch",
    "url": "tools/stopwatch/index.html"
  },
  {
    "id": "countdown-timer",
    "name": "倒數計時器",
    "nameEn": "Countdown Timer",
    "description": "自訂時間倒數計時，時間到播放音效提醒",
    "categories": [
      "popular",
      "time"
    ],
    "keywords": [
      "countdown",
      "timer",
      "alarm",
      "倒數",
      "計時器",
      "鬧鐘"
    ],
    "icon": "timer",
    "url": "tools/countdown-timer/index.html"
  },
  {
    "id": "lorem-ipsum-generator",
    "name": "假字產生器",
    "nameEn": "Lorem Ipsum Generator",
    "description": "產生排版測試用的假文字，支援中文與英文",
    "categories": [
      "text"
    ],
    "keywords": [
      "lorem",
      "ipsum",
      "placeholder",
      "dummy",
      "假字",
      "佔位"
    ],
    "icon": "lorem",
    "url": "tools/lorem-ipsum-generator/index.html"
  },
  {
    "id": "batch-renamer",
    "name": "檔案名稱批次修改器",
    "nameEn": "Batch File Renamer",
    "description": "一次載入大量檔案，支援前後綴、文字替換、自動流水號、大小寫修改並打包 ZIP 下載",
    "categories": [
      "popular",
      "file"
    ],
    "keywords": [
      "rename",
      "batch",
      "檔案改名",
      "批次命名",
      "流水號",
      "zip"
    ],
    "icon": "file-hash",
    "url": "tools/batch-renamer/index.html"
  },
  {
    "id": "image-to-pdf",
    "name": "圖片轉 PDF",
    "nameEn": "Image to PDF Converter",
    "description": "多張 JPG、PNG 圖片自由拖曳排序，合成標準 A4 或自訂尺寸 PDF 文件",
    "categories": [
      "popular",
      "pdf",
      "image"
    ],
    "keywords": [
      "pdf",
      "image",
      "jpg",
      "png",
      "圖片轉pdf",
      "合成pdf"
    ],
    "icon": "pdf",
    "url": "tools/image-to-pdf/index.html"
  },
  {
    "id": "pdf-splitter",
    "name": "PDF 分割器",
    "nameEn": "PDF Splitter",
    "description": "純瀏覽器本地解析 PDF，自由擷取指定頁碼範圍或一鍵拆分為每頁單檔 ZIP 下載",
    "categories": [
      "popular",
      "pdf",
      "file"
    ],
    "keywords": [
      "pdf",
      "split",
      "extract",
      "pdf分割",
      "擷取頁面",
      "拆分"
    ],
    "icon": "pdf",
    "url": "tools/pdf-splitter/index.html"
  },
  {
    "id": "pdf-merger",
    "name": "PDF 合併器",
    "nameEn": "PDF Merger",
    "description": "載入多個 PDF 檔案，拖曳調整順序，一鍵合併為單一完整 PDF 文件",
    "categories": [
      "popular",
      "pdf",
      "file"
    ],
    "keywords": [
      "pdf",
      "merge",
      "combine",
      "pdf合併",
      "合成",
      "文件合併"
    ],
    "icon": "pdf",
    "url": "tools/pdf-merger/index.html"
  },
  {
    "id": "image-cropper",
    "name": "圖片裁切器",
    "nameEn": "Image Cropper",
    "description": "畫布互動自由選取裁切，支援 1:1 正方形、圓形頭像、16:9 等常用比例匯出",
    "categories": [
      "popular",
      "image"
    ],
    "keywords": [
      "crop",
      "image",
      "avatar",
      "裁切",
      "剪裁",
      "頭像"
    ],
    "icon": "crop",
    "url": "tools/image-cropper/index.html"
  },
  {
    "id": "image-watermark",
    "name": "圖片加浮水印",
    "nameEn": "Image Watermark",
    "description": "純前端為照片添加文字浮水印，支援全圖斜向平鋪防盜、角落定位與透明度自訂",
    "categories": [
      "popular",
      "image"
    ],
    "keywords": [
      "watermark",
      "copyright",
      "浮水印",
      "防盜圖",
      "版權標記"
    ],
    "icon": "watermark",
    "url": "tools/image-watermark/index.html"
  },
  {
    "id": "csv-viewer",
    "name": "CSV 表格即時查看器",
    "nameEn": "CSV Table Viewer",
    "description": "上傳或貼上 CSV 即時生成互動表格，支援欄位升降排序、關鍵字搜尋過濾與分頁",
    "categories": [
      "popular",
      "file"
    ],
    "keywords": [
      "csv",
      "viewer",
      "table",
      "表格",
      "查看器",
      "排序",
      "搜尋"
    ],
    "icon": "table",
    "url": "tools/csv-viewer/index.html"
  },
  {
    "id": "extract-emails",
    "name": "提取電子信箱",
    "nameEn": "Email Extractor",
    "description": "從雜亂文章或網頁原始碼中一鍵批量抓取 Email 信箱，自動去重、排序與小寫化",
    "categories": [
      "extract",
      "text"
    ],
    "keywords": [
      "email",
      "extract",
      "信箱",
      "郵件",
      "提取",
      "正則"
    ],
    "icon": "email",
    "url": "tools/extract-emails/index.html"
  },
  {
    "id": "extract-urls",
    "name": "提取網址連結",
    "nameEn": "URL Extractor",
    "description": "從大篇幅文章中精準批次提取所有網址與連結，支援自動去重與主網域純化",
    "categories": [
      "extract",
      "text",
      "network"
    ],
    "keywords": [
      "url",
      "link",
      "extract",
      "網址",
      "連結",
      "提取"
    ],
    "icon": "link",
    "url": "tools/extract-urls/index.html"
  },
  {
    "id": "extract-numbers",
    "name": "提取數字與統計",
    "nameEn": "Number Extractor & Stats",
    "description": "快速過濾擷取文字中的所有數字（支援小數、千分位），即時計算總和、平均值與中位數",
    "categories": [
      "extract",
      "math"
    ],
    "keywords": [
      "number",
      "extract",
      "stats",
      "數字提取",
      "總和",
      "平均值"
    ],
    "icon": "hash",
    "url": "tools/extract-numbers/index.html"
  },
  {
    "id": "number-to-chinese",
    "name": "數字轉中文大寫",
    "nameEn": "Number to Chinese",
    "description": "將阿拉伯數字轉為商業發票與銀行支票防偽大寫金額（壹貳參肆），以及中文日常口語讀法",
    "categories": [
      "popular",
      "text",
      "finance",
      "math"
    ],
    "keywords": [
      "chinese",
      "number",
      "大寫",
      "銀行支票",
      "國字大寫",
      "發票"
    ],
    "icon": "text",
    "url": "tools/number-to-chinese/index.html"
  },
  {
    "id": "morse-code",
    "name": "摩斯密碼轉換器",
    "nameEn": "Morse Code Converter",
    "description": "文字與摩斯電碼雙向轉換，內建純前端 Web Audio 電報嗶嗶音效試聽播放",
    "categories": [
      "encoding",
      "text"
    ],
    "keywords": [
      "morse",
      "code",
      "摩斯密碼",
      "電報",
      "嗶嗶聲",
      "解碼"
    ],
    "icon": "morse",
    "url": "tools/morse-code/index.html"
  },
  {
    "id": "markdown-notes",
    "name": "Markdown 即時筆記",
    "nameEn": "Markdown Notes",
    "description": "輕量 Markdown 雙欄即時筆記，瀏覽器 LocalStorage 本地自動存檔，防手殘防中斷",
    "categories": [
      "popular",
      "text"
    ],
    "keywords": [
      "markdown",
      "notes",
      "memo",
      "筆記",
      "存檔",
      "寫作"
    ],
    "icon": "note",
    "url": "tools/markdown-notes/index.html"
  },
  {
    "id": "wage-calculator",
    "name": "薪水與加班費計算器",
    "nameEn": "Wage & Overtime Calculator",
    "description": "依基本時薪與多段加成倍率（1.34x、1.67x、2x 假日工時）精確試算實領薪資明細",
    "categories": [
      "popular",
      "finance",
      "math"
    ],
    "keywords": [
      "wage",
      "salary",
      "overtime",
      "時薪",
      "薪水",
      "加班費",
      "打工"
    ],
    "icon": "dollar",
    "url": "tools/wage-calculator/index.html"
  },
  {
    "id": "percentage-calculator",
    "name": "百分比計算器",
    "nameEn": "Percentage Calculator",
    "description": "涵蓋數值佔比、增加/減少 P% 以及成長衰退率等 5 種最常用百分比運算",
    "categories": [
      "popular",
      "math",
      "finance"
    ],
    "keywords": [
      "percent",
      "percentage",
      "百分比",
      "佔比",
      "成長率",
      "計算"
    ],
    "icon": "percent",
    "url": "tools/percentage-calculator/index.html"
  },
  {
    "id": "discount-calculator",
    "name": "折扣與特價計算器",
    "nameEn": "Discount Calculator",
    "description": "支援台灣幾折、% OFF、滿額現折優惠券疊加，快速計算折後實付與省下金額",
    "categories": [
      "popular",
      "finance",
      "math"
    ],
    "keywords": [
      "discount",
      "sale",
      "折扣",
      "特價",
      "幾折",
      "優惠券",
      "省錢"
    ],
    "icon": "tag",
    "url": "tools/discount-calculator/index.html"
  },
  {
    "id": "split-bill",
    "name": "聚餐分帳計算器",
    "nameEn": "Split Bill Calculator",
    "description": "聚餐、出遊分帳神器，支援服務費、免找零進位與個別成員加點，一鍵複製發送 LINE",
    "categories": [
      "popular",
      "finance",
      "math"
    ],
    "keywords": [
      "split",
      "bill",
      "分帳",
      "聚餐",
      "均攤",
      "服務費",
      "line分帳"
    ],
    "icon": "users",
    "url": "tools/split-bill/index.html"
  },
  {
    "id": "tip-calculator",
    "name": "小費計算器",
    "nameEn": "Tip Calculator",
    "description": "歐美旅遊或出差用餐必備，快速換算 15%、18%、20% 小費與每人分攤金額",
    "categories": [
      "popular",
      "finance",
      "math"
    ],
    "keywords": [
      "tip",
      "travel",
      "小費",
      "出國",
      "餐廳",
      "歐美旅遊"
    ],
    "icon": "dollar",
    "url": "tools/tip-calculator/index.html"
  },
  {
    "id": "loan-calculator",
    "name": "房貸與信用貸款計算器",
    "nameEn": "Loan & Mortgage Calculator",
    "description": "房貸、車貸、信貸試算，支援本息均攤、本金均攤與寬限期，清晰查看總利息支出",
    "categories": [
      "finance",
      "math"
    ],
    "keywords": [
      "loan",
      "mortgage",
      "房貸",
      "車貸",
      "信貸",
      "本息均攤",
      "利息"
    ],
    "icon": "building",
    "url": "tools/loan-calculator/index.html"
  },
  {
    "id": "compound-interest",
    "name": "複利與定期定額計算器",
    "nameEn": "Compound Interest Calculator",
    "description": "存股、ETF 與退休金定期定額試算，感受世界第八大奇蹟複利滾雪球效益",
    "categories": [
      "popular",
      "finance",
      "math"
    ],
    "keywords": [
      "compound",
      "interest",
      "invest",
      "複利",
      "定期定額",
      "存股",
      "ETF"
    ],
    "icon": "dollar",
    "url": "tools/compound-interest/index.html"
  },
  {
    "id": "currency-converter",
    "name": "多國貨幣匯率換算器",
    "nameEn": "Currency Converter",
    "description": "新台幣、美元、日圓、歐元、人民幣、泰銖等20種熱門貨幣即時換算，離線亦可使用",
    "categories": [
      "popular",
      "finance"
    ],
    "keywords": [
      "currency",
      "exchange",
      "rate",
      "匯率",
      "換匯",
      "日圓",
      "美金",
      "泰銖",
      "出國"
    ],
    "icon": "dollar",
    "url": "tools/currency-converter/index.html"
  },
  {
    "id": "date-diff",
    "name": "兩日期差計算器",
    "nameEn": "Date Difference Calculator",
    "description": "精確計算兩個日期間相差的天數、週數、月數與排除週末的實際上線/上班工作天",
    "categories": [
      "popular",
      "time"
    ],
    "keywords": [
      "date",
      "diff",
      "days",
      "日期差",
      "天數",
      "間隔",
      "工作天"
    ],
    "icon": "calendar",
    "url": "tools/date-diff/index.html"
  },
  {
    "id": "date-calculator",
    "name": "日期加減計算器",
    "nameEn": "Date Add / Subtract",
    "description": "指定基準日快速增加或倒推天數、月數、年數（如：今天起算 +90 天到期日）",
    "categories": [
      "popular",
      "time"
    ],
    "keywords": [
      "date",
      "add",
      "subtract",
      "日期加減",
      "到期日",
      "幾天後"
    ],
    "icon": "calendar",
    "url": "tools/date-calculator/index.html"
  },
  {
    "id": "age-calculator",
    "name": "年齡與生肖星座計算器",
    "nameEn": "Age & Birthday Calculator",
    "description": "輸入出生日期精確換算實歲、傳統虛歲、累計生活天數、生肖、星座與下次生日倒數",
    "categories": [
      "popular",
      "time",
      "math"
    ],
    "keywords": [
      "age",
      "birthday",
      "zodiac",
      "年齡",
      "虛歲",
      "生日",
      "生肖",
      "星座"
    ],
    "icon": "user",
    "url": "tools/age-calculator/index.html"
  },
  {
    "id": "timezone-converter",
    "name": "跨國時區轉換器",
    "nameEn": "Timezone Converter",
    "description": "台北 ↔ 日本 ↔ 美國 ↔ 歐洲時間聯動切換，拖曳時間軸快速挑選跨國通話會議時段",
    "categories": [
      "time",
      "network"
    ],
    "keywords": [
      "timezone",
      "time",
      "world",
      "時區",
      "美東",
      "美西",
      "跨國會議"
    ],
    "icon": "clock",
    "url": "tools/timezone-converter/index.html"
  },
  {
    "id": "world-clock",
    "name": "世界時鐘",
    "nameEn": "World Clock",
    "description": "全球主要國際樞紐城市即時時間、動態秒針跳動，日夜狀態一目了然",
    "categories": [
      "popular",
      "time"
    ],
    "keywords": [
      "clock",
      "world",
      "city",
      "世界時鐘",
      "城市時間",
      "紐約",
      "倫敦",
      "東京"
    ],
    "icon": "clock",
    "url": "tools/world-clock/index.html"
  },
  {
    "id": "pomodoro-timer",
    "name": "番茄工作法計時器",
    "nameEn": "Pomodoro Timer",
    "description": "保持高度專注力！25 分鐘專注衝刺 + 5 分鐘休息循環，動態圓環進度與提示音",
    "categories": [
      "popular",
      "time"
    ],
    "keywords": [
      "pomodoro",
      "timer",
      "focus",
      "番茄鐘",
      "專注",
      "工作法",
      "讀書"
    ],
    "icon": "timer",
    "url": "tools/pomodoro-timer/index.html"
  },
  {
    "id": "presentation-timer",
    "name": "簡報與演講計時器",
    "nameEn": "Presentation Timer",
    "description": "專為課堂報告與演講設計，超大字體看板、綠黃橘紅階段警示變色、超時追蹤與全螢幕投影",
    "categories": [
      "popular",
      "time",
      "academic"
    ],
    "keywords": [
      "presentation",
      "timer",
      "speech",
      "報告計時",
      "演講",
      "倒數",
      "超時"
    ],
    "icon": "presentation",
    "url": "tools/presentation-timer/index.html"
  },
  {
    "id": "random-number",
    "name": "隨機數字產生器",
    "nameEn": "Random Number Generator",
    "description": "真隨機密碼學亂數（Crypto API），支援範圍設定、多個生成、排除重複與排序",
    "categories": [
      "popular",
      "random",
      "math"
    ],
    "keywords": [
      "random",
      "number",
      "crypto",
      "隨機數",
      "亂數",
      "抽獎",
      "樂透"
    ],
    "icon": "dice",
    "url": "tools/random-number/index.html"
  },
  {
    "id": "random-picker",
    "name": "隨機抽籤與抽獎器",
    "nameEn": "Random Picker",
    "description": "午餐吃什麼決定障礙？活動尾牙抽獎？自訂名單一鍵開獎，支援抽後不放回",
    "categories": [
      "popular",
      "random"
    ],
    "keywords": [
      "picker",
      "lottery",
      "lunch",
      "抽籤",
      "抽獎",
      "吃什麼",
      "隨機選擇"
    ],
    "icon": "trophy",
    "url": "tools/random-picker/index.html"
  },
  {
    "id": "random-team",
    "name": "隨機分組器",
    "nameEn": "Random Team Generator",
    "description": "課堂專案、黑客松與團康活動快速隨機組隊，支援固定組數或每組人數分流",
    "categories": [
      "popular",
      "random",
      "academic"
    ],
    "keywords": [
      "team",
      "group",
      "random",
      "分組",
      "分隊",
      "破冰",
      "隨機組隊"
    ],
    "icon": "users",
    "url": "tools/random-team/index.html"
  },
  {
    "id": "coin-dice",
    "name": "拋硬幣與擲骰子",
    "nameEn": "Coin Flip & Dice Roller",
    "description": "二選一難以決定？玩桌遊缺骰子？逼真 3D 翻動動畫，支援多骰同擲與機率統計",
    "categories": [
      "popular",
      "random"
    ],
    "keywords": [
      "coin",
      "dice",
      "flip",
      "roll",
      "硬幣",
      "骰子",
      "拋硬幣",
      "擲骰子"
    ],
    "icon": "dice",
    "url": "tools/coin-dice/index.html"
  },
  {
    "id": "bmi-calculator",
    "name": "BMI 身體質量指數計算器",
    "nameEn": "BMI Calculator",
    "description": "依據衛生福利部國民健康署標準，快速評估體位、理想體重目標與健康指南",
    "categories": [
      "popular",
      "math"
    ],
    "keywords": [
      "bmi",
      "weight",
      "health",
      "身體質量指數",
      "體重",
      "減重",
      "健康"
    ],
    "icon": "heart",
    "url": "tools/bmi-calculator/index.html"
  },
  {
    "id": "gpa-calculator",
    "name": "大學 GPA 學期成績計算器",
    "nameEn": "GPA Calculator",
    "description": "支援台灣大學院校 4.3 滿分制與留學標準 4.0 制，多科目學分等第快速結算",
    "categories": [
      "popular",
      "academic",
      "math"
    ],
    "keywords": [
      "gpa",
      "grade",
      "college",
      "學業",
      "大學成績",
      "學分",
      "等第"
    ],
    "icon": "graduation",
    "url": "tools/gpa-calculator/index.html"
  },
  {
    "id": "weighted-grade",
    "name": "加權成績計算器",
    "nameEn": "Weighted Grade Calculator",
    "description": "平時出席、作業、期中與期末報告加權評分試算，自動檢核權重百分比與及格狀態",
    "categories": [
      "academic",
      "math"
    ],
    "keywords": [
      "weighted",
      "grade",
      "score",
      "加權成績",
      "期中考",
      "期末考",
      "總分"
    ],
    "icon": "graduation",
    "url": "tools/weighted-grade/index.html"
  },
  {
    "id": "grade-calculator",
    "name": "期末及格與目標成績試算器",
    "nameEn": "Final Grade Calculator",
    "description": "期末考到底要考幾分才能及格或拿 A？輸入平時、期中考成績與期末佔比，精確倒推目標所需分數",
    "categories": [
      "popular",
      "academic",
      "math"
    ],
    "keywords": [
      "final",
      "grade",
      "exam",
      "及格",
      "期末考",
      "期中考",
      "保命",
      "及格試算"
    ],
    "icon": "graduation",
    "url": "tools/grade-calculator/index.html"
  },
  {
    "id": "ip-lookup",
    "name": "IP / DNS 查詢工具",
    "nameEn": "IP & DNS Lookup",
    "description": "即時查詢本機對外 IP、ISP 地理資訊與 DNS 記錄 (A/AAAA/TXT/MX)",
    "categories": [
      "popular",
      "network"
    ],
    "keywords": [
      "ip",
      "dns",
      "lookup",
      "network",
      "host",
      "查詢",
      "網路"
    ],
    "icon": "ip-lookup",
    "url": "tools/ip-lookup/index.html"
  },
  {
    "id": "uuid-generator",
    "name": "UUID 產生器",
    "nameEn": "UUID Generator",
    "description": "快速產生符合 RFC4122 標準的 UUID v4，支援批次產出與連字號設定",
    "categories": [
      "developer",
      "developer"
    ],
    "keywords": [
      "uuid",
      "guid",
      "v4",
      "random",
      "產生器",
      "唯一辨識碼"
    ],
    "icon": "hash",
    "url": "tools/uuid-generator/index.html",
    "isDeveloper": true
  },
  {
    "id": "base64-encoder-decoder",
    "name": "Base64 編碼/解碼",
    "nameEn": "Base64 Encoder / Decoder",
    "description": "文字與 Base64 格式相互轉換，支援 UTF-8",
    "categories": [
      "encoding",
      "developer",
      "developer"
    ],
    "keywords": [
      "base64",
      "encode",
      "decode",
      "編碼",
      "解碼"
    ],
    "icon": "code",
    "url": "tools/base64-encoder-decoder/index.html",
    "isDeveloper": true
  },
  {
    "id": "json-formatter",
    "name": "JSON 格式化工具",
    "nameEn": "JSON Formatter",
    "description": "JSON 排版美化、壓縮、語法驗證與摺疊瀏覽",
    "categories": [
      "developer",
      "developer"
    ],
    "keywords": [
      "json",
      "format",
      "minify",
      "prettify",
      "格式化",
      "排版"
    ],
    "icon": "braces",
    "url": "tools/json-formatter/index.html",
    "isDeveloper": true
  },
  {
    "id": "timestamp-converter",
    "name": "Unix 時間戳轉換",
    "nameEn": "Timestamp Converter",
    "description": "Unix 時間戳與一般日期時間格式互相轉換",
    "categories": [
      "time",
      "developer",
      "developer"
    ],
    "keywords": [
      "timestamp",
      "unix",
      "epoch",
      "時間戳",
      "日期",
      "時間"
    ],
    "icon": "clock",
    "url": "tools/timestamp-converter/index.html",
    "isDeveloper": true
  },
  {
    "id": "file-hash-generator",
    "name": "檔案 Hash 計算",
    "nameEn": "File Hash Calculator",
    "description": "瀏覽器本地讀取檔案並計算 SHA-256、MD5 雜湊值",
    "categories": [
      "file",
      "encoding",
      "developer",
      "developer"
    ],
    "keywords": [
      "file",
      "hash",
      "checksum",
      "sha256",
      "檔案",
      "雜湊",
      "校驗"
    ],
    "icon": "file-hash",
    "url": "tools/file-hash-generator/index.html",
    "isDeveloper": true
  },
  {
    "id": "api-tester",
    "name": "API 測試工具",
    "nameEn": "API Tester",
    "description": "輕量純前端 REST API 測試器，支援 GET/POST/PUT/DELETE 與自訂 Header",
    "categories": [
      "developer",
      "network"
    ],
    "keywords": [
      "api",
      "rest",
      "http",
      "fetch",
      "postman",
      "測試"
    ],
    "icon": "api-tester",
    "url": "tools/api-tester/index.html",
    "isDeveloper": true
  },
  {
    "id": "jwt-decoder",
    "name": "JWT 解碼器",
    "nameEn": "JWT Decoder",
    "description": "本地安全解析 JSON Web Token 的 Header、Payload 與過期時間",
    "categories": [
      "developer",
      "encoding"
    ],
    "keywords": [
      "jwt",
      "token",
      "auth",
      "decode",
      "解碼",
      "鑑權"
    ],
    "icon": "jwt-decoder",
    "url": "tools/jwt-decoder/index.html",
    "isDeveloper": true
  },
  {
    "id": "regex-tester",
    "name": "正則表達式測試器",
    "nameEn": "Regex Tester",
    "description": "即時驗證正則匹配、分組擷取，內建常用信箱、手機與網址 Regex 範本",
    "categories": [
      "developer",
      "text"
    ],
    "keywords": [
      "regex",
      "regexp",
      "regular expression",
      "正則",
      "匹配"
    ],
    "icon": "regex-tester",
    "url": "tools/regex-tester/index.html",
    "isDeveloper": true
  },
  {
    "id": "cron-generator",
    "name": "Cron 排程產生器",
    "nameEn": "Cron Expression Generator",
    "description": "視覺化設定分、時、日、月、週，自動產生 Linux Crontab 表達式與預覽",
    "categories": [
      "developer",
      "time"
    ],
    "keywords": [
      "cron",
      "crontab",
      "schedule",
      "排程",
      "定時"
    ],
    "icon": "cron-generator",
    "url": "tools/cron-generator/index.html",
    "isDeveloper": true
  },
  {
    "id": "http-status-code",
    "name": "HTTP 狀態碼查詢",
    "nameEn": "HTTP Status Codes",
    "description": "完整收錄 1xx~5xx HTTP 狀態碼中文解說、使用情境與除錯建議",
    "categories": [
      "developer",
      "network"
    ],
    "keywords": [
      "http",
      "status",
      "code",
      "200",
      "404",
      "500",
      "狀態碼"
    ],
    "icon": "http-status",
    "url": "tools/http-status-code/index.html",
    "isDeveloper": true
  },
  {
    "id": "sql-formatter",
    "name": "SQL 格式化工具",
    "nameEn": "SQL Formatter",
    "description": "SQL 查詢語句排版美化、關鍵字自動大寫、階層縮排與單行壓縮",
    "categories": [
      "developer"
    ],
    "keywords": [
      "sql",
      "database",
      "format",
      "select",
      "格式化",
      "資料庫"
    ],
    "icon": "sql-formatter",
    "url": "tools/sql-formatter/index.html",
    "isDeveloper": true
  },
  {
    "id": "html-formatter",
    "name": "HTML 格式化工具",
    "nameEn": "HTML Formatter",
    "description": "HTML 語法縮排美化與極限壓縮，支援去除註解與標籤自動修整",
    "categories": [
      "developer"
    ],
    "keywords": [
      "html",
      "format",
      "minify",
      "beautify",
      "排版",
      "壓縮"
    ],
    "icon": "html-formatter",
    "url": "tools/html-formatter/index.html",
    "isDeveloper": true
  },
  {
    "id": "css-formatter",
    "name": "CSS 格式化工具",
    "nameEn": "CSS Formatter",
    "description": "CSS 樣式表美化排版、屬性排序、展開/單行縮排與 Minify 壓縮",
    "categories": [
      "developer"
    ],
    "keywords": [
      "css",
      "style",
      "format",
      "minify",
      "樣式",
      "格式化"
    ],
    "icon": "css-formatter",
    "url": "tools/css-formatter/index.html",
    "isDeveloper": true
  },
  {
    "id": "js-formatter",
    "name": "JS 格式化工具",
    "nameEn": "JavaScript Formatter",
    "description": "JavaScript 代碼規範排版、縮排統一與快速壓縮清理",
    "categories": [
      "developer"
    ],
    "keywords": [
      "js",
      "javascript",
      "format",
      "minify",
      "腳本",
      "格式化"
    ],
    "icon": "js-formatter",
    "url": "tools/js-formatter/index.html",
    "isDeveloper": true
  },
  {
    "id": "markdown-preview",
    "name": "Markdown 即時預覽",
    "nameEn": "Markdown Preview",
    "description": "雙欄對照 Markdown 即時渲染，支援 GFM 表格、代碼高亮與 HTML 匯出",
    "categories": [
      "developer",
      "text"
    ],
    "keywords": [
      "markdown",
      "md",
      "preview",
      "gfm",
      "預覽",
      "文章"
    ],
    "icon": "markdown-preview",
    "url": "tools/markdown-preview/index.html",
    "isDeveloper": true
  },
  {
    "id": "markdown-to-html",
    "name": "Markdown 轉 HTML",
    "nameEn": "Markdown to HTML Converter",
    "description": "將 Markdown 格式文件即時編譯為乾淨 HTML 程式碼或富文本複製",
    "categories": [
      "developer",
      "text"
    ],
    "keywords": [
      "markdown",
      "html",
      "convert",
      "gfm",
      "編譯",
      "轉檔"
    ],
    "icon": "code",
    "url": "tools/markdown-to-html/index.html",
    "isDeveloper": true
  },
  {
    "id": "json-csv-converter",
    "name": "JSON ↔ CSV 雙向轉換",
    "nameEn": "JSON / CSV Converter",
    "description": "支援 JSON 陣列與 CSV 表格資料雙向互轉，自訂分隔符與特殊引號跳脫防護",
    "categories": [
      "developer",
      "file"
    ],
    "keywords": [
      "json",
      "csv",
      "converter",
      "資料轉換",
      "excel",
      "匯入匯出"
    ],
    "icon": "table",
    "url": "tools/json-csv-converter/index.html",
    "isDeveloper": true
  },
  {
    "id": "user-agent-parser",
    "name": "User-Agent 解析器",
    "nameEn": "User-Agent Parser",
    "description": "自動讀取本機或自訂 User-Agent，精準識別瀏覽器、作業系統、核心與裝置",
    "categories": [
      "developer",
      "network"
    ],
    "keywords": [
      "useragent",
      "ua",
      "browser",
      "os",
      "device",
      "解析"
    ],
    "icon": "user-agent",
    "url": "tools/user-agent-parser/index.html",
    "isDeveloper": true
  },
  {
    "id": "dns-lookup",
    "name": "DNS 紀錄查詢",
    "nameEn": "DNS Record Lookup",
    "description": "透過 Cloudflare DoH 查詢網域 A、AAAA、CNAME、MX、TXT、NS、SOA 紀錄",
    "categories": [
      "developer",
      "network"
    ],
    "keywords": [
      "dns",
      "lookup",
      "doh",
      "cloudflare",
      "mx",
      "txt",
      "cname",
      "網域查詢"
    ],
    "icon": "globe",
    "url": "tools/dns-lookup/index.html",
    "isDeveloper": true
  },
  {
    "id": "dns-propagation",
    "name": "DNS 全球傳播檢查",
    "nameEn": "DNS Propagation Checker",
    "description": "向 Google、Cloudflare、Quad9 等全球 DNS 節點發送查詢，檢驗網域生效傳播狀態",
    "categories": [
      "developer",
      "network"
    ],
    "keywords": [
      "dns",
      "propagation",
      "傳播",
      "解析",
      "生效",
      "節點延遲"
    ],
    "icon": "globe",
    "url": "tools/dns-propagation/index.html",
    "isDeveloper": true
  },
  {
    "id": "extract-ips",
    "name": "提取 IP 位址",
    "nameEn": "IP Address Extractor",
    "description": "從伺服器 Log 或文字中批次抽取 IPv4 位址，自動過濾無效數值與區分公網/私網",
    "categories": [
      "developer",
      "extract",
      "network"
    ],
    "keywords": [
      "ip",
      "ipv4",
      "extract",
      "log",
      "網路",
      "提取"
    ],
    "icon": "network",
    "url": "tools/extract-ips/index.html",
    "isDeveloper": true
  },
  {
    "id": "image-base64",
    "name": "圖片對 Base64 互轉",
    "nameEn": "Image Base64 Converter",
    "description": "圖片轉 Data URL Base64 字串，亦可貼上 Base64 碼還原圖片並下載",
    "categories": [
      "developer",
      "image",
      "encoding"
    ],
    "keywords": [
      "base64",
      "image",
      "dataurl",
      "網頁開發",
      "內嵌圖片",
      "轉換"
    ],
    "icon": "convert",
    "url": "tools/image-base64/index.html",
    "isDeveloper": true
  },
  {
    "id": "svg-previewer",
    "name": "SVG 即時預覽器",
    "nameEn": "SVG Live Previewer",
    "description": "貼上 SVG 原始碼或上傳 .svg 檔案即時渲染，支援透明棋盤格切換與高解析 PNG 匯出",
    "categories": [
      "developer",
      "image"
    ],
    "keywords": [
      "svg",
      "preview",
      "vector",
      "預覽",
      "向量圖",
      "png匯出"
    ],
    "icon": "palette",
    "url": "tools/svg-previewer/index.html",
    "isDeveloper": true
  },
  {
    "id": "favicon-generator",
    "name": "Favicon 網站圖示產生器",
    "nameEn": "Favicon Generator",
    "description": "上傳一張圖片，一鍵打包 16/32/48/180/192/512 全套圖示、favicon.ico 與 HTML 標籤",
    "categories": [
      "developer",
      "image",
      "network"
    ],
    "keywords": [
      "favicon",
      "ico",
      "icon",
      "apple-touch-icon",
      "網站圖示",
      "打包"
    ],
    "icon": "palette",
    "url": "tools/favicon-generator/index.html",
    "isDeveloper": true
  },
  {
    "id": "og-preview",
    "name": "Open Graph 社群分享預覽",
    "nameEn": "Open Graph Preview",
    "description": "即時模擬網頁分享至 LINE、Discord、Facebook 與 X (Twitter) 的卡片外觀與 Meta 代碼",
    "categories": [
      "developer",
      "network"
    ],
    "keywords": [
      "og",
      "opengraph",
      "social",
      "discord",
      "line",
      "facebook",
      "twitter",
      "預覽"
    ],
    "icon": "globe",
    "url": "tools/og-preview/index.html",
    "isDeveloper": true
  },
  {
    "id": "meta-generator",
    "name": "SEO Meta 標籤產生器",
    "nameEn": "SEO Meta Tag Generator",
    "description": "視覺化填寫網站資訊，快速產出標準 SEO Title、Description、Robots、OG 與 PWA Meta",
    "categories": [
      "developer",
      "network"
    ],
    "keywords": [
      "seo",
      "meta",
      "tags",
      "head",
      "搜尋引擎優化",
      "標籤產生"
    ],
    "icon": "code",
    "url": "tools/meta-generator/index.html",
    "isDeveloper": true
  },
  {
    "id": "color-picker",
    "name": "專業取色調色盤",
    "nameEn": "Color Picker & Palette",
    "description": "高階調色盤、漸層色產生器、色彩空間互轉與 WCAG 無障礙對比度檢驗",
    "categories": [
      "developer"
    ],
    "keywords": [
      "color",
      "picker",
      "palette",
      "wcag",
      "contrast",
      "調色盤",
      "取色"
    ],
    "icon": "color-picker",
    "url": "tools/color-picker/index.html",
    "isDeveloper": true
  },
  {
    "id": "git-generator",
    "name": "Git 指令產生器",
    "nameEn": "Git Command Generator",
    "description": "依情境式互動引導生成常用 Git 指令，包含分支、暫存、還原、合併與說明",
    "categories": [
      "developer"
    ],
    "keywords": [
      "git",
      "command",
      "branch",
      "merge",
      "commit",
      "rebase",
      "指令"
    ],
    "icon": "git-generator",
    "url": "tools/git-generator/index.html",
    "isDeveloper": true
  }
];

/* ================================================================
   輔助函式：取得工具 SVG 圖示字串
   ================================================================ */
function getToolIconSvg(iconName) {
  const innerSvg = TOOL_ICONS[iconName] || TOOL_ICONS["code"] || "";
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${innerSvg}</svg>`;
}
