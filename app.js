import { openTikTokTool } from './tools/tiktok.js';
import { openYtTool } from './tools/yt.js';
import { openPinTool } from './tools/pin.js';
import { openTikMp3Tool } from './tools/tikmp3.js';
import { openYtMp3Tool } from './tools/ytmp3.js';
import { openKalkuTool } from './tools/kalku.js';
import { openAimtkTool } from './tools/aimtk.js';
import { openAppGeneratorTool } from './appgenerator.js';

const $ = (s) => document.querySelector(s);
const USER_KEY = 'alyz_user';
const CHAT_KEY = 'alyz_chats';

const TOOLS = [
  { n: '01', name: 'TIKTOK', desc: 'Download video', fn: openTikTokTool },
  { n: '02', name: 'YOUTUBE', desc: 'Download video', fn: openYtTool },
  { n: '03', name: 'PINTEREST', desc: 'Download media', fn: openPinTool },
  { n: '04', name: 'TIKTOK MP3', desc: 'Ambil audio', fn: openTikMp3Tool },
  { n: '05', name: 'YOUTUBE MP3', desc: 'Ambil audio', fn: openYtMp3Tool },
  { n: '06', name: 'KALKULATOR', desc: 'Hitung cepat', fn: openKalkuTool },
  { n: '07', name: 'AI MTK', desc: 'Chat matematika', fn: openAimtkTool },
  { n: '08', name: 'APP GENERATOR', desc: 'Segera hadir', fn: openAppGeneratorTool }
];

/* ---------- LOGIN ---------- */
function getUser() {
  try { return localStorage.getItem(USER_KEY); } catch (e) { return null; }
}

function showError(msg) {
  $('#loginError').innerHTML = `<div class="error">${msg}</div>`;
}

function doLogin(name) {
  name = (name || '').trim();
  if (!(name.startsWith('@') && name.length >= 3)) {
    showError('USERNAME HARUS DIAWALI @');
    return;
  }
  localStorage.setItem(USER_KEY, name);
  enterApp();
}

const rand = (n) => Math.floor(Math.random() * Math.pow(10, n)).toString().padStart(n, '0');

$('#btnLogin').onclick = () => doLogin($('#username').value);
$('#username').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin($('#username').value); });
$('#btnGuest').onclick = () => doLogin('@guest' + rand(3));
$('#btnGoogle').onclick = () => doLogin('@google' + rand(4));

function enterApp() {
  $('#loginView').style.display = 'none';
  $('#appView').style.display = 'block';
  $('#profName').textContent = getUser();
  switchTab('tools');
  renderChat();
}

/* ---------- TOOLS GRID ---------- */
const grid = $('#toolGrid');
TOOLS.forEach((t) => {
  const b = document.createElement('button');
  b.className = 'tool';
  b.innerHTML = `<span class="num">${t.n}</span><span class="name">${t.name}</span><span class="desc">${t.desc}</span>`;
  b.onclick = () => {
    const body = $('#toolBody');
    body.style.display = 'block';
    body.scrollTop = 0;
    t.fn(body);
  };
  grid.appendChild(b);
});

/* ---------- NAV ---------- */
function switchTab(tab) {
  const map = { tools: '#tabTools', chat: '#tabChat', profil: '#tabProfil' };
  Object.values(map).forEach((s) => ($(s).style.display = 'none'));
  $(map[tab]).style.display = 'block';
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  if (tab === 'chat') renderChat();
  const tb = $('#toolBody');
  tb.style.display = 'none';
  tb.innerHTML = '';
}
document.querySelectorAll('.nav-btn').forEach((b) => (b.onclick = () => switchTab(b.dataset.tab)));

/* ---------- CHAT GLOBAL ---------- */
let channel = null;
try { channel = new BroadcastChannel('alyz_chat'); } catch (e) { /* tidak didukung */ }

function loadChats() {
  try { return JSON.parse(localStorage.getItem(CHAT_KEY)) || []; } catch (e) { return []; }
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderChat() {
  const box = $('#chatBox');
  const me = getUser();
  const list = loadChats();
  if (!list.length) {
    box.innerHTML = '<div class="empty">BELUM ADA PESAN</div>';
    return;
  }
  box.innerHTML = list.map((m) =>
    `<div class="msg ${m.user === me ? 'me' : 'other'}"><b>${esc(m.user)}</b>${esc(m.text)}</div>`
  ).join('');
  box.scrollTop = box.scrollHeight;
}

function sendChat() {
  const input = $('#chatInput');
  const text = input.value.trim();
  if (!text) return;
  const list = loadChats();
  list.push({ user: getUser(), text, t: Date.now() });
  const trimmed = list.slice(-200);
  localStorage.setItem(CHAT_KEY, JSON.stringify(trimmed));
  if (channel) channel.postMessage('update');
  input.value = '';
  renderChat();
}

$('#chatSend').onclick = sendChat;
$('#chatInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChat(); });
if (channel) channel.onmessage = () => renderChat();
window.addEventListener('storage', (e) => { if (e.key === CHAT_KEY) renderChat(); });

/* ---------- PROFIL ---------- */
$('#btnLogout').onclick = () => {
  localStorage.removeItem(USER_KEY);
  $('#appView').style.display = 'none';
  $('#loginView').style.display = 'flex';
  $('#username').value = '';
  $('#loginError').innerHTML = '';
};

/* ---------- INIT ---------- */
$('#loginView').style.display = 'flex';
if (getUser()) enterApp();
