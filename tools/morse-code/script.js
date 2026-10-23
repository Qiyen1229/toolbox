// 摩斯密碼轉換與 Web Audio 音效播放

(function() {
  const MORSE_MAP = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
    '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
    ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
    '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
  };

  const REVERSE_MAP = {};
  for (const [char, morse] of Object.entries(MORSE_MAP)) {
    REVERSE_MAP[morse] = char;
  }

  let currentMode = 'text-to-morse';
  const modeSelector = document.getElementById('mode-selector');
  const inputText = document.getElementById('input-text');
  const outputText = document.getElementById('output-text');
  const inputLabel = document.getElementById('input-label');
  const outputLabel = document.getElementById('output-label');
  const btnConvert = document.getElementById('btn-convert');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');
  const btnPlaySound = document.getElementById('btn-play-sound');
  const btnStopSound = document.getElementById('btn-stop-sound');

  // 音訊相關
  let audioCtx = null;
  let isPlaying = false;
  let playTimeoutIds = [];

  function textToMorse(text) {
    return text.toUpperCase().trim().split(/\s+/).map(word => {
      return word.split('').map(ch => MORSE_MAP[ch] || ch).join(' ');
    }).join(' / ');
  }

  function morseToText(morse) {
    return morse.trim().split(/\s*\/\s*/).map(word => {
      return word.trim().split(/\s+/).map(token => REVERSE_MAP[token] || '?').join('');
    }).join(' ');
  }

  function doConvert() {
    const val = inputText.value;
    if (!val.trim()) {
      outputText.value = '';
      return;
    }
    if (currentMode === 'text-to-morse') {
      outputText.value = textToMorse(val);
    } else {
      outputText.value = morseToText(val);
    }
  }

  function switchMode(mode) {
    currentMode = mode;
    modeSelector.querySelectorAll('.segmented-control__item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'text-to-morse') {
      inputLabel.textContent = '輸入文字（英文 / 數字）：';
      inputText.placeholder = '例如：SOS 或 HELLO WORLD';
      outputLabel.textContent = '轉換結果（摩斯密碼）：';
    } else {
      inputLabel.textContent = '輸入摩斯密碼（. 與 -）：';
      inputText.placeholder = '例如：... --- ...';
      outputLabel.textContent = '轉換結果（明文）：';
    }
    stopAudio();
    doConvert();
  }

  modeSelector.addEventListener('click', (e) => {
    const btn = e.target.closest('.segmented-control__item');
    if (btn && btn.dataset.mode) {
      switchMode(btn.dataset.mode);
    }
  });

  inputText.addEventListener('input', doConvert);
  btnConvert.addEventListener('click', doConvert);

  btnClear.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    stopAudio();
  });

  btnCopy.addEventListener('click', () => {
    const val = outputText.value;
    if (!val) return;
    if (window.ToolboxApp && window.ToolboxApp.copyToClipboard) {
      window.ToolboxApp.copyToClipboard(val, '結果已複製');
    } else {
      navigator.clipboard.writeText(val);
    }
  });

  // 音效播放
  function stopAudio() {
    playTimeoutIds.forEach(id => clearTimeout(id));
    playTimeoutIds = [];
    if (audioCtx && audioCtx.state !== 'closed') {
      try {
        audioCtx.close();
      } catch (e) {}
      audioCtx = null;
    }
    isPlaying = false;
    btnPlaySound.style.display = 'inline-flex';
    btnStopSound.style.display = 'none';
  }

  function playTone(freq, durationMs, startTime) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.15, startTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + (durationMs / 1000) - 0.005);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + (durationMs / 1000));
  }

  function playMorse() {
    let morse = currentMode === 'text-to-morse' ? outputText.value : inputText.value;
    if (!morse || !morse.trim()) {
      if (window.ToolboxApp && window.ToolboxApp.showToast) {
        window.ToolboxApp.showToast('沒有可播放的摩斯密碼', 'warning');
      }
      return;
    }

    stopAudio();
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      alert('您的瀏覽器不支援 Web Audio API');
      return;
    }

    audioCtx = new AudioContextClass();
    isPlaying = true;
    btnPlaySound.style.display = 'none';
    btnStopSound.style.display = 'inline-flex';

    const DOT_MS = 70;
    const DASH_MS = DOT_MS * 3;
    const FREQ = 750;

    let now = audioCtx.currentTime + 0.05;

    for (let i = 0; i < morse.length; i++) {
      const ch = morse[i];
      if (ch === '.') {
        playTone(FREQ, DOT_MS, now);
        now += (DOT_MS + DOT_MS) / 1000;
      } else if (ch === '-' || ch === '—') {
        playTone(FREQ, DASH_MS, now);
        now += (DASH_MS + DOT_MS) / 1000;
      } else if (ch === ' ') {
        now += (DOT_MS * 2) / 1000;
      } else if (ch === '/') {
        now += (DOT_MS * 6) / 1000;
      }
    }

    const totalMs = (now - audioCtx.currentTime) * 1000;
    const endTimeout = setTimeout(() => {
      stopAudio();
    }, totalMs + 100);
    playTimeoutIds.push(endTimeout);
  }

  btnPlaySound.addEventListener('click', playMorse);
  btnStopSound.addEventListener('click', stopAudio);

  // 初始預設範例
  inputText.value = 'SOS';
  doConvert();
})();
