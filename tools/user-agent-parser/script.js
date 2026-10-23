/**
 * User-Agent Parser 實作腳本
 */
document.addEventListener('DOMContentLoaded', () => {
  StorageManager.addRecent('user-agent-parser');

  const uaInput = document.getElementById('ua-input');
  const btnUseCurrent = document.getElementById('btn-use-current');
  const btnDemoIphone = document.getElementById('btn-demo-iphone');
  const btnCopyJson = document.getElementById('btn-copy-json');

  const resBrowser = document.getElementById('res-browser');
  const resBrowserVer = document.getElementById('res-browser-ver');
  const resOs = document.getElementById('res-os');
  const resOsVer = document.getElementById('res-os-ver');
  const resEngine = document.getElementById('res-engine');
  const resDevice = document.getElementById('res-device');
  const jsonOutput = document.getElementById('json-output');

  function parseUA(ua) {
    const info = {
      browser: { name: 'Unknown', version: 'Unknown' },
      os: { name: 'Unknown', version: 'Unknown' },
      engine: 'Unknown',
      device: 'Desktop',
      raw: ua
    };

    if (!ua) return info;

    // 1. 作業系統檢測
    if (/iPhone|iPad|iPod/.test(ua)) {
      info.os.name = /iPad/.test(ua) ? 'iPadOS' : 'iOS';
      info.device = /iPad/.test(ua) ? 'Tablet' : 'Mobile';
      const m = ua.match(/OS (\d+[._]\d+[._]?\d*)/);
      if (m) info.os.version = m[1].replace(/_/g, '.');
    } else if (/Mac OS X/.test(ua)) {
      info.os.name = 'macOS';
      const m = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
      if (m) info.os.version = m[1].replace(/_/g, '.');
    } else if (/Android/.test(ua)) {
      info.os.name = 'Android';
      info.device = /Mobile/.test(ua) ? 'Mobile' : 'Tablet';
      const m = ua.match(/Android (\d+[._]\d+)/);
      if (m) info.os.version = m[1];
    } else if (/Windows NT/.test(ua)) {
      info.os.name = 'Windows';
      const m = ua.match(/Windows NT (\d+\.\d+)/);
      const verMap = { '10.0': '10 / 11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
      if (m) info.os.version = verMap[m[1]] || m[1];
    } else if (/Linux/.test(ua)) {
      info.os.name = 'Linux';
    }

    // 2. 瀏覽器檢測
    if (/Edg\/(\d+[\.\d]+)/.test(ua)) {
      info.browser.name = 'Microsoft Edge';
      info.browser.version = ua.match(/Edg\/(\d+[\.\d]+)/)[1];
    } else if (/Chrome\/(\d+[\.\d]+)/.test(ua) && !/Edg/.test(ua)) {
      info.browser.name = 'Google Chrome';
      info.browser.version = ua.match(/Chrome\/(\d+[\.\d]+)/)[1];
    } else if (/Safari\/(\d+[\.\d]+)/.test(ua) && !/Chrome/.test(ua)) {
      info.browser.name = 'Apple Safari';
      const m = ua.match(/Version\/(\d+[\.\d]+)/);
      if (m) info.browser.version = m[1];
    } else if (/Firefox\/(\d+[\.\d]+)/.test(ua)) {
      info.browser.name = 'Mozilla Firefox';
      info.browser.version = ua.match(/Firefox\/(\d+[\.\d]+)/)[1];
    }

    // 3. 排版引擎
    if (/AppleWebKit/.test(ua)) {
      info.engine = /Chrome|Edg/.test(ua) ? 'Blink (WebKit fork)' : 'WebKit';
    } else if (/Gecko/.test(ua) && /Firefox/.test(ua)) {
      info.engine = 'Gecko';
    }

    return info;
  }

  function update() {
    const raw = uaInput.value.trim();
    const result = parseUA(raw);

    resBrowser.textContent = result.browser.name;
    resBrowserVer.textContent = `版本：${result.browser.version}`;
    resOs.textContent = result.os.name;
    resOsVer.textContent = `版本：${result.os.version}`;
    resEngine.textContent = result.engine;
    resDevice.textContent = result.device;
    jsonOutput.textContent = JSON.stringify(result, null, 2);
  }

  uaInput.addEventListener('input', update);

  btnUseCurrent.addEventListener('click', () => {
    uaInput.value = navigator.userAgent;
    update();
    Utils.showToast('已載入當前瀏覽器 UA', 'info');
  });

  btnDemoIphone.addEventListener('click', () => {
    uaInput.value = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
    update();
    Utils.showToast('已載入 iPhone 範例 UA', 'info');
  });

  btnCopyJson.addEventListener('click', () => {
    Utils.copyToClipboard(jsonOutput.textContent, '已複製 JSON 資訊');
  });

  // 預設讀取當前瀏覽器
  btnUseCurrent.click();
});
