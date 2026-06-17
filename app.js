

// ---- WORD BANKS ----
const WORD_BANKS = {
  random: ['swift','bright','calm','bold','prime','sharp','cool','fast','keen','pure','dark','star','glow','echo','nova','flux','wave','core','peak','blaze'],
  space:  ['nebula','orbit','comet','quasar','lunar','solar','cosmic','pulsar','galaxy','void','nova','astro','zenith','stellar','saturn','venus','mars','titan','aurora','eclipse'],
  nature: ['river','stone','forest','petal','storm','ocean','cedar','falcon','embber','frost','bloom','thorn','gale','cliff','moss','canyon','pine','dusk','hawk','creek'],
  tech:   ['pixel','kernel','cipher','node','query','async','vector','matrix','codec','proxy','cache','stack','parse','token','signal','relay','burst','patch','delta','sync'],
  fantasy:['raven','ember','frost','dragon','phoenix','shadow','crystal','iron','silver','golden','arcane','mystic','elder','storm','blade','rune','realm','void','chaos','divine'],
  cool:   ['viper','cobra','titan','apex','nexus','blaze','phantom','stealth','eclipse','cipher','rogue','specter','havoc','vortex','neon','razor','surge','torque','helix','zenith']
};

const ADJECTIVES = {
  random: ['happy','lazy','wild','dark','epic','silent','cosmic','golden','rapid','hidden','sleek','lone','sharp','fierce','calm'],
  space:  ['stellar','lunar','cosmic','solar','orbital','radiant','distant','glowing','endless','vast'],
  nature: ['misty','wild','mossy','ancient','serene','windy','stormy','leafy','rocky','sunny'],
  tech:   ['async','binary','digital','quantum','neural','virtual','cyber','nano','micro','hyper'],
  fantasy:['ancient','mystic','cursed','sacred','forgotten','elder','dark','lost','noble','iron'],
  cool:   ['ultra','hyper','turbo','mega','phantom','ghost','shadow','neon','savage','epic']
};

// ---- STATE ----
let currentTab = 'password';
let history = JSON.parse(localStorage.getItem('saturnHistory') || '[]');
let separator = '';
let wordTheme = 'random';

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  renderHistory();
  bindEvents();
  generatePassword();
});

// ---- BIND EVENTS ----
function bindEvents() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Password rules
  const lengthSlider = document.getElementById('lengthSlider');
  const lengthVal = document.getElementById('lengthVal');
  lengthSlider.addEventListener('input', () => {
    lengthVal.textContent = lengthSlider.value;
    generatePassword();
  });

  ['useUpper','useLower','useNumbers','useSymbols','useLeet','noAmbig'].forEach(id => {
    document.getElementById(id).addEventListener('change', generatePassword);
  });

  document.getElementById('customSymbols').addEventListener('input', generatePassword);

  document.getElementById('generatePasswordBtn').addEventListener('click', generatePassword);

  // Copy password → also saves to history
  document.getElementById('copyPasswordBtn').addEventListener('click', () => {
    const txt = document.getElementById('passwordText').textContent;
    if (txt && txt !== 'Click Generate') {
      copyToClipboard(txt);
      addToHistory(txt, 'password');
    }
  });

  // Save password button
  document.getElementById('savePasswordBtn').addEventListener('click', () => {
    const txt = document.getElementById('passwordText').textContent;
    if (txt && txt !== 'Click Generate') {
      addToHistory(txt, 'password');
      showToast('Password saved!');
    }
  });

  // Username rules
  const wordCountSlider = document.getElementById('wordCountSlider');
  const wordCountVal = document.getElementById('wordCountVal');
  wordCountSlider.addEventListener('input', () => {
    wordCountVal.textContent = wordCountSlider.value;
    generateUsername();
  });

  document.querySelectorAll('#separatorGroup .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#separatorGroup .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      separator = chip.dataset.sep;
      generateUsername();
    });
  });

  document.querySelectorAll('#themeGroup .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#themeGroup .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      wordTheme = chip.dataset.theme;
      generateUsername();
    });
  });

  ['uCapitalize','uNumbers','uSymbols','uLeet','uNoStartNum','uEasyWords'].forEach(id => {
    document.getElementById(id).addEventListener('change', generateUsername);
  });

  document.getElementById('generateUsernameBtn').addEventListener('click', generateUsername);

  // Copy username → also saves to history
  document.getElementById('copyUsernameBtn').addEventListener('click', () => {
    const txt = document.getElementById('usernameText').textContent;
    if (txt && txt !== 'Click Generate') {
      copyToClipboard(txt);
      addToHistory(txt, 'username');
    }
  });

  // Save username button
  document.getElementById('saveUsernameBtn').addEventListener('click', () => {
    const txt = document.getElementById('usernameText').textContent;
    if (txt && txt !== 'Click Generate') {
      addToHistory(txt, 'username');
      showToast('Username saved!');
    }
  });

  // Checker
  const checkerInput = document.getElementById('checkerInput');
  checkerInput.addEventListener('input', () => checkPasswordStrength(checkerInput.value));

  document.getElementById('eyeBtn').addEventListener('click', () => {
    const isPass = checkerInput.type === 'password';
    checkerInput.type = isPass ? 'text' : 'password';
    document.getElementById('eyeOpen').classList.toggle('hidden', !isPass);
    document.getElementById('eyeClosed').classList.toggle('hidden', isPass);
  });

  // History
  document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (confirm('Clear all history?')) {
      history = [];
      saveHistory();
      renderHistory();
    }
  });

  // Suggestion cards — copy on click, save to history
  document.getElementById('passwordSuggestions').addEventListener('click', e => {
    const card = e.target.closest('.suggestion-card');
    if (card) {
      const text = card.querySelector('.suggestion-text').textContent;
      copyToClipboard(text);
      addToHistory(text, 'password');
      setPassword(text);
    }
  });

  document.getElementById('usernameSuggestions').addEventListener('click', e => {
    const card = e.target.closest('.suggestion-card');
    if (card) {
      const text = card.querySelector('.suggestion-text').textContent;
      copyToClipboard(text);
      addToHistory(text, 'username');
      setUsername(text);
    }
  });
}

// ---- TAB SWITCHING ----
function switchTab(tab) {
  currentTab = tab;

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));

  document.getElementById('passwordRules').classList.toggle('hidden', tab !== 'password');
  document.getElementById('usernameRules').classList.toggle('hidden', tab !== 'username');
  document.getElementById('checkerRules').classList.toggle('hidden', tab !== 'checker');

  document.getElementById('passwordMain').classList.toggle('hidden', tab !== 'password');
  document.getElementById('usernameMain').classList.toggle('hidden', tab !== 'username');
  document.getElementById('checkerMain').classList.toggle('hidden', tab !== 'checker');

  // Show/hide history panel based on tab
  const historyPanel = document.getElementById('historyPanel');
  historyPanel.classList.toggle('hidden', tab === 'checker');

  if (tab === 'password') { generatePassword(); renderHistory(); }
  if (tab === 'username') { generateUsername(); renderHistory(); }
}

// ---- PASSWORD GENERATION ----
function getPasswordOptions() {
  return {
    length: parseInt(document.getElementById('lengthSlider').value),
    upper: document.getElementById('useUpper').checked,
    lower: document.getElementById('useLower').checked,
    numbers: document.getElementById('useNumbers').checked,
    symbols: document.getElementById('useSymbols').checked,
    leet: document.getElementById('useLeet').checked,
    noAmbig: document.getElementById('noAmbig').checked,
    customSymbols: document.getElementById('customSymbols').value,
  };
}

function buildCharset(opts) {
  let charset = '';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const ambiguous = 'l1IO0';

  if (opts.upper) charset += upper;
  if (opts.lower) charset += lower;
  if (opts.numbers) charset += numbers;
  if (opts.symbols) charset += opts.customSymbols || '!@#$%^&*()-_=+[]{}|;:,.<>?';

  if (opts.noAmbig) {
    charset = charset.split('').filter(c => !ambiguous.includes(c)).join('');
  }

  return charset || lower;
}

function generatePasswordString(opts) {
  const charset = buildCharset(opts);
  const guaranteed = [];
  if (opts.upper) guaranteed.push(randChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ'));
  if (opts.lower) guaranteed.push(randChar('abcdefghijklmnopqrstuvwxyz'));
  if (opts.numbers) guaranteed.push(randChar('23456789'));
  if (opts.symbols) guaranteed.push(randChar(opts.customSymbols || '!@#$%^&*'));

  for (let i = guaranteed.length; i < opts.length; i++) {
    guaranteed.push(randChar(charset));
  }

  let password = shuffle(guaranteed).join('').substring(0, opts.length);
  if (opts.leet) password = applyLeet(password);
  return password;
}

function randChar(str) {
  return str[Math.floor(Math.random() * str.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function applyLeet(str) {
  const map = { 'a':'4','e':'3','i':'1','o':'0','t':'7','s':'5','l':'1','b':'8','g':'9' };
  return str.split('').map(c => Math.random() > 0.5 ? (map[c.toLowerCase()] || c) : c).join('');
}

function generatePassword() {
  const opts = getPasswordOptions();
  const pwd = generatePasswordString(opts);
  setPassword(pwd);
  // NO auto-save — only on Copy or Save click
  generatePasswordSuggestions(opts);
}

function setPassword(pwd) {
  document.getElementById('passwordText').textContent = pwd;
  updateStrengthMeter(pwd, 'strengthFill', 'strengthLabel');
}

function generatePasswordSuggestions(opts) {
  const container = document.getElementById('passwordSuggestions');
  container.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const pwd = generatePasswordString(opts);
    container.appendChild(makeSuggestionCard(pwd));
  }
}

// ---- USERNAME GENERATION ----
function getUsernameOptions() {
  return {
    wordCount: parseInt(document.getElementById('wordCountSlider').value),
    separator,
    capitalize: document.getElementById('uCapitalize').checked,
    numbers: document.getElementById('uNumbers').checked,
    symbols: document.getElementById('uSymbols').checked,
    leet: document.getElementById('uLeet').checked,
    noStartNum: document.getElementById('uNoStartNum').checked,
    easyWords: document.getElementById('uEasyWords').checked,
    theme: wordTheme,
  };
}

function generateUsernameString(opts) {
  const bank = WORD_BANKS[opts.theme] || WORD_BANKS.random;
  const adjs = ADJECTIVES[opts.theme] || ADJECTIVES.random;
  let words = [];
  for (let i = 0; i < opts.wordCount; i++) {
    const pool = (i === 0 && opts.wordCount > 1) ? adjs : bank;
    let word = pool[Math.floor(Math.random() * pool.length)];
    if (opts.capitalize) word = word.charAt(0).toUpperCase() + word.slice(1);
    if (opts.leet) word = applyLeet(word);
    words.push(word);
  }

  let username = words.join(opts.separator);
  if (opts.numbers) username = username + Math.floor(Math.random() * 9999);
  if (opts.symbols) {
    const syms = ['!','_','#','@','.'];
    username = username + syms[Math.floor(Math.random() * syms.length)];
  }
  if (opts.noStartNum && /^\d/.test(username)) username = 'x' + username;
  return username;
}

function generateUsername() {
  const opts = getUsernameOptions();
  const uname = generateUsernameString(opts);
  setUsername(uname);
  // NO auto-save
  generateUsernameSuggestions(opts);
}

function setUsername(uname) {
  document.getElementById('usernameText').textContent = uname;
}

function generateUsernameSuggestions(opts) {
  const container = document.getElementById('usernameSuggestions');
  container.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const uname = generateUsernameString(opts);
    container.appendChild(makeSuggestionCard(uname));
  }
}

function makeSuggestionCard(text) {
  const card = document.createElement('div');
  card.className = 'suggestion-card';
  card.innerHTML = `
    <span class="suggestion-text">${escHtml(text)}</span>
    <span class="suggestion-copy">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    </span>
  `;
  return card;
}

// ---- STRENGTH ----
function calcStrength(pwd) {
  if (!pwd) return { score: 0, pct: 0, label: '—', color: '#4a4a65' };
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (/012|123|234|345|456|567|678|789|abc|bcd|cde|def/i.test(pwd)) score--;
  if (/(.)\1{2,}/.test(pwd)) score--;
  score = Math.max(0, Math.min(score, 7));

  if (score <= 2) return { score, pct: (score/7)*100, label: 'Weak',        color: '#f87171' };
  if (score <= 4) return { score, pct: (score/7)*100, label: 'Medium',      color: '#fbbf24' };
  if (score <= 6) return { score, pct: (score/7)*100, label: 'Strong',      color: '#34d399' };
  return             { score, pct: 100,              label: 'Very Strong',  color: '#a78bfa' };
}

// ---- TIME TO CRACK ----
function timeToCrack(pwd) {
  if (!pwd) return '';

  // Build charset size
  let charsetSize = 0;
  if (/[a-z]/.test(pwd)) charsetSize += 26;
  if (/[A-Z]/.test(pwd)) charsetSize += 26;
  if (/[0-9]/.test(pwd)) charsetSize += 10;
  if (/[^A-Za-z0-9]/.test(pwd)) charsetSize += 32;
  if (charsetSize === 0) charsetSize = 26;

  // Combinations = charsetSize ^ length
  // Attacker speed: ~10 billion guesses/sec (modern GPU cluster)
  const guessesPerSec = 1e10;
  const combinations = Math.pow(charsetSize, pwd.length);
  const seconds = combinations / guessesPerSec / 2; // avg half search space

  if (seconds < 1)           return 'Instantly';
  if (seconds < 60)          return `${Math.round(seconds)} seconds`;
  if (seconds < 3600)        return `${Math.round(seconds/60)} minutes`;
  if (seconds < 86400)       return `${Math.round(seconds/3600)} hours`;
  if (seconds < 2592000)     return `${Math.round(seconds/86400)} days`;
  if (seconds < 31536000)    return `${Math.round(seconds/2592000)} months`;
  if (seconds < 3.154e9)     return `${Math.round(seconds/31536000)} years`;
  if (seconds < 3.154e12)    return `${(seconds/3.154e9).toFixed(1)} thousand years`;
  if (seconds < 3.154e15)    return `${(seconds/3.154e12).toFixed(1)} million years`;
  if (seconds < 3.154e18)    return `${(seconds/3.154e15).toFixed(1)} billion years`;
  return 'Longer than the universe';
}

function updateStrengthMeter(pwd, fillId, labelId) {
  const s = calcStrength(pwd);
  const fill = document.getElementById(fillId);
  const label = document.getElementById(labelId);
  fill.style.width = s.pct + '%';
  fill.style.background = s.color;
  label.textContent = s.label;
  label.style.color = s.color;
}

// ---- CHECKER ----
function checkPasswordStrength(pwd) {
  updateStrengthMeter(pwd, 'checkerStrengthFill', 'checkerStrengthLabel');

  const criteria = {
    length:   pwd.length >= 8,
    upper:    /[A-Z]/.test(pwd),
    lower:    /[a-z]/.test(pwd),
    number:   /[0-9]/.test(pwd),
    symbol:   /[^A-Za-z0-9]/.test(pwd),
    long:     pwd.length >= 16,
    noRepeat: !(/(.)\1{2,}/.test(pwd)),
    noSeq:    !(/012|123|234|345|456|567|678|789|abc|bcd|cde|def/i.test(pwd)),
  };

  document.querySelectorAll('.crit-card').forEach(card => {
    const key = card.dataset.crit;
    const met = criteria[key];
    card.classList.toggle('met', !!met);
    card.querySelector('.crit-card-icon').textContent = met ? '✓' : '✗';
  });

  document.querySelectorAll('.crit-item').forEach(item => {
    const key = item.dataset.crit;
    item.classList.toggle('met', !!criteria[key]);
    item.querySelector('.crit-icon').textContent = criteria[key] ? '✓' : '○';
  });

  const metCount = Object.values(criteria).filter(Boolean).length;
  const scoreEl = document.getElementById('checkerScore');
  const crackEl = document.getElementById('checkerCrackTime');

  if (pwd) {
    scoreEl.textContent = `${metCount} / ${Object.keys(criteria).length} criteria met`;
    const crack = timeToCrack(pwd);
    const s = calcStrength(pwd);
    crackEl.innerHTML = `<span class="crack-icon">⚡</span> Time to crack: <span style="color:${s.color};font-weight:600">${crack}</span>`;
  } else {
    scoreEl.textContent = '';
    crackEl.innerHTML = '';
  }
}

// ---- HISTORY ----
function addToHistory(value, type) {
  // No duplicates
  const existing = history.findIndex(h => h.value === value && h.type === type);
  if (existing !== -1) return;

  const now = new Date();
  const date = now.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const item = {
    id: Date.now(),
    value,
    type,
    date,
    time,
    strength: type === 'password' ? calcStrength(value).label : null,
    strengthColor: type === 'password' ? calcStrength(value).color : null,
  };

  history.unshift(item);
  if (history.length > 50) history = history.slice(0, 50);
  saveHistory();
  renderHistory();
}

function saveHistory() {
  localStorage.setItem('saturnHistory', JSON.stringify(history));
}

function renderHistory() {
  const list = document.getElementById('historyList');

  // Filter by current tab — password shows passwords, username shows usernames
  const filtered = history.filter(h => h.type === currentTab);

  if (!filtered.length) {
    list.innerHTML = `<div class="history-empty">No ${currentTab} history yet.<br/>Copy or save to add!</div>`;
    return;
  }

  list.innerHTML = '';
  filtered.forEach(item => {
    const el = document.createElement('div');
    el.className = 'history-item';
    el.innerHTML = `
      <div class="history-item-top">
        <span class="history-val">${escHtml(item.value)}</span>
        <div class="history-actions">
          <button class="icon-btn" title="Copy" data-action="copy" data-id="${item.id}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <button class="icon-btn" title="Delete" data-action="delete" data-id="${item.id}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        </div>
      </div>
      <div class="history-meta">
        <div class="history-datetime">
          <span class="history-date">${item.date}</span>
          <span class="history-time">${item.time}</span>
        </div>
        ${item.strength ? `<span class="history-strength" style="color:${item.strengthColor}">${item.strength}</span>` : ''}
      </div>
    `;

    el.querySelector('[data-action="copy"]').addEventListener('click', () => copyToClipboard(item.value));
    el.querySelector('[data-action="delete"]').addEventListener('click', () => deleteHistoryItem(item.id));
    list.appendChild(el);
  });
}

function deleteHistoryItem(id) {
  history = history.filter(h => h.id !== id);
  saveHistory();
  renderHistory();
}

// ---- CLIPBOARD ----
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => showToast('Copied!')).catch(() => showToast('Copy failed'));
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// ---- UTILS ----
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
