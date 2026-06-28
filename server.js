const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');

const root = __dirname;
const dataDir = path.join(root, 'data');
const eventsFile = path.join(dataDir, 'events.jsonl');
const questionsFile = path.join(dataDir, 'questions.json');
const aiConfigFile = path.join(dataDir, 'ai-config.json');
const identityFile = path.join(dataDir, 'identity.json');
const legacyQuestionBankFile = path.join(dataDir, 'question-bank.js');
const port = Number(process.env.PORT || 3000);
/*
const stopWords = new Set(['鐨?, '鏄?, '鍦?, '鍜?, '鎴?, '鏈?, '涓?, '涓?, '鍙?, '绛?, '涓€涓?, '杩欑', '杩欎簺', '閭ｄ簺', '鍥犱负', '鎵€浠?, '濡傛灉', '閭ｄ箞', '鍙互', '闇€瑕?, '杩涜', '寰楀埌', '姹傝В', '璁＄畻', '璇佹槑', '涓嬪垪', '鍏朵腑', '浣垮緱', '婊¤冻', '宸茬煡', '鍒?, '姹?, '璁?, '涓?, '浣?, '瀵逛簬', '鍏充簬', '浠ュ強', '鎴栬€?, '杩樻槸', '骞朵笖']);
const genericQuestionTypes = new Set(['閫夋嫨棰?, '濉┖棰?, '璁＄畻棰?, '璇佹槑棰?, '缁煎悎棰?, '搴旂敤棰?, 'choice', 'fill']);
const commonMathTerms = new Set([
  '鍑芥暟', '鏋侀檺', '杩炵画', '瀵兼暟', '寰垎', '绉垎', '瀹氱Н鍒?, '涓嶅畾绉垎', '绾ф暟', '鏀舵暃', '鍙戞暎', '鍋忓', '姊害', '鏇茬嚎', '鏇查潰', '寰垎鏂圭▼',
  '鐭╅樀', '琛屽垪寮?, '鍚戦噺', '绾挎€х浉鍏?, '绾挎€ф棤鍏?, '绉?, '鐗瑰緛鍊?, '鐗瑰緛鍚戦噺', '鐩镐技', '瀵硅鍖?, '浜屾鍨?, '姝ｅ畾', '鏂圭▼缁?,
  '姒傜巼', '鐙珛', '浜掓枼', '鍒嗗竷', '鏈熸湜', '鏂瑰樊', '鍗忔柟宸?, '鐩稿叧绯绘暟', '澶ф暟瀹氬緥', '涓績鏋侀檺瀹氱悊', '浼拌', '鐭╀及璁?, '浼肩劧', '妫€楠?, '缃俊鍖洪棿',
  'lim', 'det', 'rank', 'trace', 'CLT', 'Ax=0', '|A|', 'B(', 'N(', 'P(', 'E(', 'D(', 'Exp', 'U('
]);
*/
const stopWords = new Set([
  '\u7684', '\u662f', '\u5728', '\u548c', '\u6216', '\u6709', '\u4e3a', '\u4e0e', '\u53ca', '\u7b49',
  '\u4e00\u4e2a', '\u8fd9\u79cd', '\u8fd9\u4e9b', '\u90a3\u4e9b', '\u56e0\u4e3a', '\u6240\u4ee5',
  '\u5982\u679c', '\u90a3\u4e48', '\u53ef\u4ee5', '\u9700\u8981', '\u8fdb\u884c', '\u5f97\u5230',
  '\u6c42\u89e3', '\u8ba1\u7b97', '\u8bc1\u660e', '\u4e0b\u5217', '\u5176\u4e2d', '\u4f7f\u5f97',
  '\u6ee1\u8db3', '\u5df2\u77e5', '\u5219', '\u6c42', '\u8bbe', '\u4e14', '\u4f46', '\u5bf9\u4e8e',
  '\u5173\u4e8e', '\u4ee5\u53ca', '\u6216\u8005', '\u8fd8\u662f', '\u5e76\u4e14'
]);
const genericQuestionTypes = new Set(['\u9009\u62e9\u9898', '\u586b\u7a7a\u9898', '\u8ba1\u7b97\u9898', '\u8bc1\u660e\u9898', '\u7efc\u5408\u9898', '\u5e94\u7528\u9898', 'choice', 'fill']);
const commonMathTerms = new Set([
  '\u51fd\u6570', '\u6781\u9650', '\u8fde\u7eed', '\u5bfc\u6570', '\u5fae\u5206', '\u79ef\u5206', '\u5b9a\u79ef\u5206', '\u4e0d\u5b9a\u79ef\u5206',
  '\u7ea7\u6570', '\u6536\u655b', '\u53d1\u6563', '\u504f\u5bfc', '\u68af\u5ea6', '\u66f2\u7ebf', '\u66f2\u9762', '\u5fae\u5206\u65b9\u7a0b',
  '\u77e9\u9635', '\u884c\u5217\u5f0f', '\u5411\u91cf', '\u7ebf\u6027\u76f8\u5173', '\u7ebf\u6027\u65e0\u5173', '\u79e9', '\u7279\u5f81\u503c',
  '\u7279\u5f81\u5411\u91cf', '\u76f8\u4f3c', '\u5bf9\u89d2\u5316', '\u4e8c\u6b21\u578b', '\u6b63\u5b9a', '\u65b9\u7a0b\u7ec4',
  '\u6982\u7387', '\u72ec\u7acb', '\u4e92\u65a5', '\u5206\u5e03', '\u671f\u671b', '\u65b9\u5dee', '\u534f\u65b9\u5dee',
  '\u76f8\u5173\u7cfb\u6570', '\u5927\u6570\u5b9a\u5f8b', '\u4e2d\u5fc3\u6781\u9650\u5b9a\u7406', '\u4f30\u8ba1',
  '\u77e9\u4f30\u8ba1', '\u4f3c\u7136', '\u68c0\u9a8c', '\u7f6e\u4fe1\u533a\u95f4',
  'lim', 'det', 'rank', 'trace', 'CLT', 'Ax=0', '|A|', 'B(', 'N(', 'P(', 'E(', 'D(', 'Exp', 'U('
]);
let questionIndexCache = null;
let questionsCache = null;
let graphCache = null;
const questionPageListCache = new Map();
const questionPageResponseCache = new Map();
const sqlQuestionFilterCache = new Map();
const QUESTION_PAGE_CACHE_MS = 60 * 1000;
let mysqlModuleCache = null;
let mysqlPoolCache = null;
let mysqlSchemaReady = false;
let mysqlUnavailableUntil = 0;
let sqlQuestionIndexCache = null;

function cacheGet(map, key) {
  const entry = map.get(key);
  if (!entry) return null;
  if (entry.expires && entry.expires < Date.now()) {
    map.delete(key);
    return null;
  }
  return entry.value;
}

function cacheSet(map, key, value, ttl = QUESTION_PAGE_CACHE_MS, limit = 160) {
  if (map.size > limit) map.clear();
  map.set(key, { value, expires: Date.now() + ttl });
  return value;
}

function clearQuestionCaches() {
  questionIndexCache = null;
  sqlQuestionIndexCache = null;
  graphCache = null;
  questionPageListCache.clear();
  questionPageResponseCache.clear();
  sqlQuestionFilterCache.clear();
}

fs.mkdirSync(dataDir, { recursive: true });

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024 * 12) {
        reject(new Error('payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function safeEvent(input, req) {
  const event = JSON.parse(input || '{}');
  return {
    id: crypto.randomUUID(),
    type: String(event.type || 'unknown').slice(0, 64),
    clientId: String(event.clientId || 'anonymous').slice(0, 128),
    at: event.at || new Date().toISOString(),
    ip: req.socket.remoteAddress,
    userAgent: req.headers['user-agent'] || '',
    payload: event.payload && typeof event.payload === 'object' ? event.payload : {}
  };
}

function readEvents(limit = 1000) {
  const text = fs.existsSync(eventsFile) ? fs.readFileSync(eventsFile, 'utf8') : '';
  if (!text.trim()) return [];
  return text.trim().split('\n').slice(-limit).map(line => {
    try { return JSON.parse(line); }
    catch { return null; }
  }).filter(Boolean);
}

function loadIdentity() {
  if (!fs.existsSync(identityFile)) return { users: {}, magicLinks: [] };
  try {
    const data = JSON.parse(fs.readFileSync(identityFile, 'utf8'));
    return {
      users: data && typeof data.users === 'object' ? data.users : {},
      magicLinks: Array.isArray(data.magicLinks) ? data.magicLinks : []
    };
  } catch (_) {
    return { users: {}, magicLinks: [] };
  }
}

function saveIdentity(data) {
  const temp = `${identityFile}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(temp, identityFile);
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(email));
}

function authPepper() {
  return process.env.AUTH_PEPPER || 'focusmath-dev-pepper-change-me';
}

function hmacEmail(email) {
  return crypto.createHmac('sha256', authPepper()).update(normalizeEmail(email)).digest('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

function emailHint(email) {
  const normalized = normalizeEmail(email);
  const [name, domain] = normalized.split('@');
  if (!name || !domain) return '';
  const head = name.slice(0, 1);
  const tail = name.length > 2 ? name.slice(-1) : '';
  return `${head}***${tail}@${domain}`;
}

function publicBaseFromRequest(req) {
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${port}`;
  return `${proto}://${host}`;
}

async function sendMagicEmail(to, link) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`FocusMath Magic Link for ${to}: ${link}`);
    return { sent: false, devLink: link };
  }
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (_) {
    console.log(`FocusMath Magic Link for ${to}: ${link}`);
    return { sent: false, devLink: link };
  }
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: { user: smtpUser, pass: smtpPass }
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || smtpUser,
    to,
    subject: 'FocusMath login link',
    text: `Open this one-time link to bind your FocusMath identity:\n\n${link}\n\nThe link expires soon.`
  });
  return { sent: true };
}

function authenticate(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const tokenHash = hashToken(match[1]);
  const data = loadIdentity();
  for (const [emailHash, user] of Object.entries(data.users)) {
    const token = (user.authTokens || []).find(item => item.hash === tokenHash);
    if (token) {
      token.lastUsedAt = new Date().toISOString();
      saveIdentity(data);
      return { data, user, emailHash };
    }
  }
  return null;
}

function ensureIdentityUser(data, emailHash, hint) {
  if (!data.users[emailHash]) {
    data.users[emailHash] = { emailHint: hint, createdAt: new Date().toISOString(), authTokens: [], cloudSaves: [] };
  }
  data.users[emailHash].emailHint = hint || data.users[emailHash].emailHint || '';
  data.users[emailHash].authTokens = Array.isArray(data.users[emailHash].authTokens) ? data.users[emailHash].authTokens : [];
  data.users[emailHash].cloudSaves = Array.isArray(data.users[emailHash].cloudSaves) ? data.users[emailHash].cloudSaves : [];
  return data.users[emailHash];
}

function pruneMagicLinks(data) {
  const now = Date.now();
  data.magicLinks = (data.magicLinks || []).filter(item => {
    const expired = item.expiresAt && Date.parse(item.expiresAt) < now;
    return !item.usedAt && !expired;
  });
}

function pruneAuthTokens(user) {
  user.authTokens = (user.authTokens || []).slice(-10);
}

function listCloudSavesForUser(user) {
  return (user.cloudSaves || []).map(item => ({
    id: item.id,
    saveName: item.saveName,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    dataSummary: item.dataSummary,
    dataHash: item.dataHash
  }));
}

function buildMagicLink(redirectBase, token) {
  const base = String(redirectBase || '').trim() || `http://localhost:${port}/focusmath.html`;
  const joiner = base.includes('?') ? '&' : '?';
  return `${base}${joiner}magic=${encodeURIComponent(token)}`;
}

function eventSummary(events) {
  const byType = {};
  const bySubject = {};
  const byHour = {};
  const questionAttempts = {};
  const clients = new Set();
  let answers = 0;
  let correct = 0;
  events.forEach(event => {
    byType[event.type] = (byType[event.type] || 0) + 1;
    if (event.clientId) clients.add(event.clientId);
    const hour = String(event.at || '').slice(0, 13).replace('T', ' ');
    if (hour) byHour[hour] = (byHour[hour] || 0) + 1;
    const subject = event.payload?.subject;
    if (subject) bySubject[subject] = (bySubject[subject] || 0) + 1;
    if (event.type === 'answer') {
      answers++;
      if (event.payload?.correct) correct++;
      const questionKey = event.payload?.questionKey
        || [event.payload?.subject, event.payload?.questionId].filter(Boolean).join('::')
        || event.payload?.questionId;
      if (questionKey) questionAttempts[questionKey] = (questionAttempts[questionKey] || 0) + 1;
    }
  });
  return {
    total: events.length,
    clients: clients.size,
    answers,
    correct,
    accuracy: answers ? Math.round(correct / answers * 100) : 0,
    byType,
    bySubject,
    byHour,
    questionAttempts
  };
}

function defaultMeta() {
  return {
    version: '2026-06-20',
    subjects: {
      calculus: { name: '\u9ad8\u7b49\u6570\u5b66', color: '#1B6B93' },
      linear: { name: '\u7ebf\u6027\u4ee3\u6570', color: '#A18CD1' },
      probability: { name: '\u6982\u7387\u7edf\u8ba1', color: '#4FCCA3' }
    },
    topicRules: {
      calculus: [
        ['\u6781\u9650', ['lim', '\u6781\u9650', '\u7b49\u4ef7']],
        ['\u6570\u5217\u6781\u9650', ['\u6570\u5217\u6781\u9650', '\u5355\u8c03\u6709\u754c', '\u5939\u903c\u51c6\u5219', '\u9012\u63a8\u6570\u5217']],
        ['\u51fd\u6570\u6781\u9650', ['lim', '\u51fd\u6570\u6781\u9650', '\u5de6\u6781\u9650', '\u53f3\u6781\u9650', '\u7b49\u4ef7\u65e0\u7a77\u5c0f']],
        ['\u8fde\u7eed\u4e0e\u95f4\u65ad\u70b9', ['\u8fde\u7eed', '\u95f4\u65ad\u70b9', '\u53ef\u53bb\u95f4\u65ad', '\u8df3\u8dc3\u95f4\u65ad']],
        ['\u5bfc\u6570\u4e0e\u5fae\u5206', ['\u5bfc\u6570', "f'", 'dy/dx', '\u5207\u7ebf', '\u6cd5\u7ebf']],
        ['\u4e2d\u503c\u5b9a\u7406', ['\u7f57\u5c14\u5b9a\u7406', '\u62c9\u683c\u6717\u65e5\u4e2d\u503c\u5b9a\u7406', '\u67ef\u897f\u4e2d\u503c\u5b9a\u7406', '\u4e2d\u503c\u5b9a\u7406']],
        ['\u6d1b\u5fc5\u8fbe\u6cd5\u5219', ['\u6d1b\u5fc5\u8fbe', '0/0', '\u221e/\u221e', '\u672a\u5b9a\u5f0f']],
        ['\u5355\u8c03\u6027\u4e0e\u6781\u503c', ['\u5355\u8c03', '\u6781\u503c', '\u6700\u503c', '\u51f9\u51f8', '\u62d0\u70b9']],
        ['\u79ef\u5206', ['\u79ef\u5206', '\\int', '∫']],
        ['\u4e0d\u5b9a\u79ef\u5206', ['\u4e0d\u5b9a\u79ef\u5206', '\u6362\u5143\u79ef\u5206', '\u5206\u90e8\u79ef\u5206', '\u539f\u51fd\u6570']],
        ['\u5b9a\u79ef\u5206', ['\u5b9a\u79ef\u5206', '\\int', '\u79ef\u5206\u4e0a\u9650', '\u725b\u987f-\u83b1\u5e03\u5c3c\u8328', '\u5bf9\u79f0\u6027']],
        ['\u53cd\u5e38\u79ef\u5206', ['\u53cd\u5e38\u79ef\u5206', '\u7455\u79ef\u5206', '\u65e0\u7a77\u533a\u95f4', '\u6536\u655b']],
        ['\u7ea7\u6570', ['\u7ea7\u6570', '\\sum', '\u6536\u655b', '\u534a\u5f84']],
        ['\u5e42\u7ea7\u6570', ['\u5e42\u7ea7\u6570', '\u6536\u655b\u534a\u5f84', '\u6536\u655b\u57df', '\u6cf0\u52d2\u7ea7\u6570']],
        ['\u5e38\u6570\u9879\u7ea7\u6570', ['\u5e38\u6570\u9879\u7ea7\u6570', '\u6b63\u9879\u7ea7\u6570', '\u4ea4\u9519\u7ea7\u6570', '\u7edd\u5bf9\u6536\u655b']],
        ['\u591a\u5143\u5fae\u79ef\u5206', ['\u504f\u5bfc', '\u68af\u5ea6', '\u4e8c\u91cd', '\u4e09\u91cd', '\u66f2\u9762', '\u66f2\u7ebf']],
        ['\u504f\u5bfc\u6570\u4e0e\u5168\u5fae\u5206', ['\u504f\u5bfc', '\u5168\u5fae\u5206', '\u68af\u5ea6', '\u65b9\u5411\u5bfc\u6570']],
        ['\u591a\u5143\u51fd\u6570\u6781\u503c', ['\u591a\u5143\u6781\u503c', '\u6761\u4ef6\u6781\u503c', '\u62c9\u683c\u6717\u65e5\u4e58\u6570\u6cd5']],
        ['\u91cd\u79ef\u5206', ['\u4e8c\u91cd\u79ef\u5206', '\u4e09\u91cd\u79ef\u5206', '\u6781\u5750\u6807', '\u67f1\u5750\u6807', '\u7403\u5750\u6807']],
        ['\u66f2\u7ebf\u79ef\u5206', ['\u66f2\u7ebf\u79ef\u5206', '\u683c\u6797\u516c\u5f0f', '\u8def\u5f84\u65e0\u5173']],
        ['\u66f2\u9762\u79ef\u5206', ['\u66f2\u9762\u79ef\u5206', '\u9ad8\u65af\u516c\u5f0f', '\u65af\u6258\u514b\u65af\u516c\u5f0f']],
        ['\u5fae\u5206\u65b9\u7a0b', ['\u5fae\u5206\u65b9\u7a0b', "y'", '\u901a\u89e3']]
      ],
      linear: [
        ['\u884c\u5217\u5f0f', ['\u884c\u5217\u5f0f', '|A|', 'det']],
        ['\u884c\u5217\u5f0f\u8ba1\u7b97', ['\u884c\u5217\u5f0f', '|A|', 'det', '\u4f59\u5b50\u5f0f', '\u4ee3\u6570\u4f59\u5b50\u5f0f']],
        ['\u77e9\u9635\u8fd0\u7b97', ['\u77e9\u9635', '\u9006\u77e9\u9635', '\u8f6c\u7f6e', '\u8ff9']],
        ['\u9006\u77e9\u9635', ['\u9006\u77e9\u9635', '\u53ef\u9006', 'A^{-1}', '\u521d\u7b49\u53d8\u6362']],
        ['\u77e9\u9635\u79e9', ['\u79e9', 'rank', '\u5217\u79e9', '\u884c\u79e9', '\u6781\u5927\u65e0\u5173\u7ec4']],
        ['\u5411\u91cf\u7ec4\u4e0e\u79e9', ['\u5411\u91cf', '\u7ebf\u6027\u76f8\u5173', '\u7ebf\u6027\u65e0\u5173', '\u79e9']],
        ['\u5411\u91cf\u7ec4\u76f8\u5173\u6027', ['\u5411\u91cf\u7ec4', '\u7ebf\u6027\u76f8\u5173', '\u7ebf\u6027\u65e0\u5173', '\u7ebf\u6027\u8868\u793a']],
        ['\u7279\u5f81\u503c', ['\u7279\u5f81\u503c', '\u7279\u5f81\u5411\u91cf', '\u76f8\u4f3c', '\u5bf9\u89d2\u5316']],
        ['\u7279\u5f81\u503c\u4e0e\u7279\u5f81\u5411\u91cf', ['\u7279\u5f81\u503c', '\u7279\u5f81\u5411\u91cf', '\u7279\u5f81\u591a\u9879\u5f0f']],
        ['\u76f8\u4f3c\u4e0e\u5bf9\u89d2\u5316', ['\u76f8\u4f3c', '\u5bf9\u89d2\u5316', '\u76f8\u4f3c\u77e9\u9635', '\u53ef\u5bf9\u89d2\u5316']],
        ['\u4e8c\u6b21\u578b', ['\u4e8c\u6b21\u578b', '\u6b63\u5b9a', '\u60ef\u6027']],
        ['\u4e8c\u6b21\u578b\u6807\u51c6\u5316', ['\u4e8c\u6b21\u578b', '\u6807\u51c6\u5f62', '\u89c4\u8303\u5f62', '\u914d\u65b9\u6cd5', '\u6b63\u4ea4\u53d8\u6362']],
        ['\u6b63\u5b9a\u77e9\u9635', ['\u6b63\u5b9a', '\u987a\u5e8f\u4e3b\u5b50\u5f0f', '\u60ef\u6027\u6307\u6570']],
        ['\u7ebf\u6027\u7a7a\u95f4\u4e0e\u57fa', ['\u7ebf\u6027\u7a7a\u95f4', '\u57fa', '\u7ef4\u6570', '\u5750\u6807']],
        ['\u6b63\u4ea4\u6027', ['\u6b63\u4ea4', '\u6b63\u4ea4\u77e9\u9635', '\u65bd\u5bc6\u7279\u6b63\u4ea4\u5316']],
        ['\u7ebf\u6027\u65b9\u7a0b\u7ec4', ['\u65b9\u7a0b\u7ec4', 'Ax=0']]
      ],
      probability: [
        ['\u53e4\u5178\u6982\u7387', ['\u6982\u7387', '\u4e92\u65a5', '\u72ec\u7acb', '\u6761\u4ef6']],
        ['\u6761\u4ef6\u6982\u7387\u4e0e\u72ec\u7acb\u6027', ['\u6761\u4ef6\u6982\u7387', '\u72ec\u7acb', '\u4e92\u65a5', '\u5168\u6982\u7387', '\u8d1d\u53f6\u65af']],
        ['\u968f\u673a\u53d8\u91cf\u5206\u5e03', ['\u5206\u5e03', 'B(', 'N(', 'P(', 'Exp', 'U(']],
        ['\u4e00\u7ef4\u968f\u673a\u53d8\u91cf', ['\u968f\u673a\u53d8\u91cf', '\u5206\u5e03\u51fd\u6570', '\u5206\u5e03\u5f8b', '\u5bc6\u5ea6\u51fd\u6570']],
        ['\u591a\u7ef4\u968f\u673a\u53d8\u91cf', ['\u4e8c\u7ef4\u968f\u673a\u53d8\u91cf', '\u8054\u5408\u5206\u5e03', '\u8fb9\u7f18\u5206\u5e03', '\u6761\u4ef6\u5206\u5e03']],
        ['\u5e38\u89c1\u5206\u5e03', ['\u4e8c\u9879\u5206\u5e03', '\u6cca\u677e\u5206\u5e03', '\u6b63\u6001\u5206\u5e03', '\u6307\u6570\u5206\u5e03', 'B(', 'P(', 'N(', 'Exp']],
        ['\u6570\u5b57\u7279\u5f81', ['\u671f\u671b', '\u65b9\u5dee', '\u534f\u65b9\u5dee', '\u76f8\u5173\u7cfb\u6570', 'E(', 'D(']],
        ['\u6570\u5b66\u671f\u671b', ['\u671f\u671b', '\u6570\u5b66\u671f\u671b', 'E(', '\u968f\u673a\u53d8\u91cf\u51fd\u6570']],
        ['\u65b9\u5dee\u4e0e\u534f\u65b9\u5dee', ['\u65b9\u5dee', '\u6807\u51c6\u5dee', '\u534f\u65b9\u5dee', '\u76f8\u5173\u7cfb\u6570', 'D(']],
        ['\u5927\u6570\u5b9a\u5f8b\u4e0e\u4e2d\u5fc3\u6781\u9650\u5b9a\u7406', ['\u5927\u6570\u5b9a\u5f8b', '\u4e2d\u5fc3\u6781\u9650\u5b9a\u7406', 'CLT']],
        ['\u5927\u6570\u5b9a\u5f8b', ['\u5927\u6570\u5b9a\u5f8b', '\u5207\u6bd4\u96ea\u592b', '\u4f9d\u6982\u7387\u6536\u655b']],
        ['\u4e2d\u5fc3\u6781\u9650\u5b9a\u7406', ['\u4e2d\u5fc3\u6781\u9650\u5b9a\u7406', 'CLT', '\u6807\u51c6\u5316', '\u6b63\u6001\u8fd1\u4f3c']],
        ['\u53c2\u6570\u4f30\u8ba1', ['\u4f30\u8ba1', '\u77e9\u4f30\u8ba1', '\u4f3c\u7136', '\u65e0\u504f']],
        ['\u53c2\u6570\u70b9\u4f30\u8ba1', ['\u77e9\u4f30\u8ba1', '\u6781\u5927\u4f3c\u7136', '\u65e0\u504f\u4f30\u8ba1', '\u6709\u6548\u6027']],
        ['\u533a\u95f4\u4f30\u8ba1', ['\u7f6e\u4fe1\u533a\u95f4', '\u7f6e\u4fe1\u5ea6', '\u4f30\u8ba1\u533a\u95f4']],
        ['\u5047\u8bbe\u68c0\u9a8c', ['\u68c0\u9a8c', 'p \u503c', '\u663e\u8457\u6027', '\u7f6e\u4fe1\u533a\u95f4']]
      ]
    }
  };
}
function allowedMathTerms(subject) {
  const meta = defaultMeta();
  const set = new Set(commonMathTerms);
  Object.values(meta.topicRules || {}).flat().forEach(([topic, words]) => {
    if (topic) set.add(String(topic));
    (words || []).forEach(word => set.add(String(word)));
  });
  (meta.topicRules[subject] || []).forEach(([topic, words]) => {
    if (topic) set.add(String(topic));
    (words || []).forEach(word => set.add(String(word)));
  });
  return set;
}

function sanitizeMathKeyword(keyword, subject, sourceText = '') {
  const text = String(sourceText || '');
  const value = String(keyword || '').trim().replace(/[锛屻€傦紒锛熴€侊細锛?.!?;:()[\]{}鈥溾€濃€樷€?'`]/g, '');
  if (!value || value.length > 12) return '';
  if (stopWords.has(value) || genericQuestionTypes.has(value)) return '';
  if (/^[\d\s.+\-*/=<>鈮も墺]+$/.test(value)) return '';
  if (/^[\u4e00-\u9fa5]$/.test(value) || /^[A-Za-z]$/.test(value)) return '';
  const allowed = allowedMathTerms(subject);
  return allowed.has(value) ? value : '';
}

function sanitizeMathKeywords(keywords, subject, sourceText = '', limit = 5, exclude = '') {
  const out = [];
  (keywords || []).forEach(keyword => {
    const clean = sanitizeMathKeyword(keyword, subject, sourceText);
    if (clean && clean !== exclude && !out.includes(clean)) out.push(clean);
  });
  return out.slice(0, limit);
}

function sanitizeMathTopic(topic, subject, questionType = 'fill') {
  const value = String(topic || '').trim();
  const rules = defaultMeta().topicRules[subject] || [];
  const valid = new Set(rules.map(([name]) => name));
  if (valid.has(value)) return value;
  if (commonMathTerms.has(value) && !genericQuestionTypes.has(value)) return value;
  return questionType === 'choice' ? '\u9009\u62e9\u9898' : '\u586b\u7a7a\u9898';
}

function parseEnvFile() {
  const envFile = path.join(root, '.env');
  const env = {};
  if (!fs.existsSync(envFile)) return env;
  fs.readFileSync(envFile, 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  });
  return env;
}

function defaultAiModel(provider, baseUrl = '') {
  const normalizedProvider = String(provider || 'auto').toLowerCase();
  const normalizedUrl = String(baseUrl || '').toLowerCase();
  if (normalizedProvider === 'anthropic' || normalizedUrl.includes('anthropic.com')) return 'claude-3-5-sonnet-latest';
  if (normalizedProvider === 'openai' || normalizedUrl.includes('api.openai.com')) return 'gpt-4o-mini';
  return 'moonshot-v1-8k';
}

function loadAiConfig(override = {}) {
  let saved = {};
  if (fs.existsSync(aiConfigFile)) {
    try { saved = JSON.parse(fs.readFileSync(aiConfigFile, 'utf8')); } catch (_) {}
  }
  const env = parseEnvFile();
  const provider = String(override.provider || saved.provider || env.AI_PROVIDER || 'auto').trim() || 'auto';
  const baseUrl = override.baseUrl || saved.baseUrl || env.AI_BASE_URL || env.KIMI_BASE_URL || (provider === 'anthropic' ? 'https://api.anthropic.com/v1/messages' : 'https://api.moonshot.cn/v1/chat/completions');
  return {
    provider,
    baseUrl,
    apiKey: override.apiKey || saved.apiKey || env.AI_API_KEY || env.KIMI_API_KEY || process.env.AI_API_KEY || process.env.KIMI_API_KEY || '',
    model: override.model || saved.model || env.AI_MODEL || env.KIMI_MODEL || defaultAiModel(provider, baseUrl)
  };
}

function saveAiConfig(config = {}) {
  const safe = {
    provider: String(config.provider || 'auto').trim() || 'auto',
    baseUrl: String(config.baseUrl || '').trim(),
    apiKey: String(config.apiKey || '').trim(),
    model: String(config.model || '').trim()
  };
  fs.writeFileSync(aiConfigFile, JSON.stringify(safe, null, 2), 'utf8');
  return safe;
}

function loadMysqlConfig() {
  const env = parseEnvFile();
  const enabled = String(process.env.MYSQL_ENABLED || env.MYSQL_ENABLED || 'auto').toLowerCase();
  const database = process.env.MYSQL_DATABASE || env.MYSQL_DATABASE || 'focusmath';
  return {
    enabled,
    host: process.env.MYSQL_HOST || env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || env.MYSQL_PASSWORD || '',
    database,
    charset: 'utf8mb4'
  };
}

function mysqlEnabled() {
  const config = loadMysqlConfig();
  return config.enabled !== '0' && config.enabled !== 'false' && config.enabled !== 'off';
}

function sqlRevisionSeed(data = loadQuestions()) {
  const normalized = compatibilityPayload(data);
  return String(normalized.meta.version || '') + ':' + normalized.questions.length + ':' + (normalized.questions.at(-1)?.id || '');
}

async function mysqlModule() {
  if (mysqlModuleCache) return mysqlModuleCache;
  try {
    mysqlModuleCache = require('mysql2/promise');
    return mysqlModuleCache;
  } catch (_) {
    return null;
  }
}

async function ensureMysqlSchema() {
  if (!mysqlEnabled()) return null;
  if (Date.now() < mysqlUnavailableUntil) return null;
  const mysql = await mysqlModule();
  if (!mysql) {
    mysqlUnavailableUntil = Date.now() + 30000;
    return null;
  }
  const config = loadMysqlConfig();
  if (!mysqlSchemaReady) {
    try {
      const bootstrap = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        charset: config.charset,
        multipleStatements: true
      });
      await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
      await bootstrap.end();
    } catch (error) {
      mysqlUnavailableUntil = Date.now() + 30000;
      return null;
    }
  }
  if (!mysqlPoolCache) {
    mysqlPoolCache = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      charset: config.charset,
      multipleStatements: true,
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 8),
      queueLimit: 0
    });
  }
  if (!mysqlSchemaReady) {
    const sql = fs.readFileSync(path.join(root, 'focusmath.sql'), 'utf8')
      .replace(/CREATE DATABASE[\s\S]*?;\s*/i, '')
      .replace(/USE\s+focusmath\s*;\s*/i, '');
    const conn = await mysqlPoolCache.getConnection();
    try {
      await conn.query(sql);
      mysqlSchemaReady = true;
    } catch (error) {
      mysqlUnavailableUntil = Date.now() + 30000;
      try { await mysqlPoolCache.end(); } catch (_) {}
      mysqlPoolCache = null;
      return null;
    } finally {
      conn.release();
    }
  }
  return mysqlPoolCache;
}

async function getSqlMeta(pool, key) {
  const [rows] = await pool.query('SELECT meta_value FROM app_meta WHERE meta_key = ?', [key]);
  return rows[0]?.meta_value || '';
}

async function setSqlMeta(pool, key, value) {
  await pool.query(
    'INSERT INTO app_meta (meta_key, meta_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE meta_value = VALUES(meta_value)',
    [key, String(value || '')]
  );
}

async function ensureSqlSubjects(pool, meta = defaultMeta()) {
  for (const [code, subject] of Object.entries(meta.subjects)) {
    await pool.query(
      'INSERT INTO subjects (code, name, color) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), color = VALUES(color)',
      [code, subject.name, subject.color]
    );
  }
}

async function refreshSqlQuestionRevision(pool) {
  const [[row]] = await pool.query('SELECT COUNT(*) AS c, UNIX_TIMESTAMP(MAX(updated_at)) AS updated FROM questions');
  const count = Number(row?.c || 0);
  const updated = Number(row?.updated || Math.floor(Date.now() / 1000));
  const revision = `sql:${count}:${updated}`;
  await setSqlMeta(pool, 'questions_revision', revision);
  await setSqlMeta(pool, 'questions_count', String(count));
  clearQuestionCaches();
  return { revision, count };
}

function questionSqlKey(q) {
  return questionKeyServer(q);
}

function sourceTypeOfQuestion(q) {
  if (q.source) return String(q.source).slice(0, 64);
  if (q.imported || q.meta?.imported) return 'manual-import';
  return 'default';
}

function sourceLabelOfQuestion(q) {
  return String(q.meta?.sourceLabel || q.meta?.source || q.source || '').slice(0, 128) || null;
}

function parseSqlJsonField(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch (_) { return fallback; }
}

function sqlQuestionRowToQuestion(row) {
  const options = parseSqlJsonField(row.options_json, []);
  const meta = parseSqlJsonField(row.meta_json, {});
  const q = {
    id: row.id,
    subject: row.subject_code,
    difficulty: Number(row.difficulty || 5),
    type: row.q_type === 'fill' ? 'fill' : 'choice',
    question: row.question_text,
    explanation: row.explanation || '',
    imported: !!row.is_imported,
    source: row.source_type || 'default',
    meta
  };
  if (q.type === 'choice') {
    q.options = Array.isArray(options) ? options : [];
    q.answer = Math.max(0, Number(row.answer_text || 0));
  } else {
    q.answer = String(row.answer_text || '');
  }
  return q;
}

async function upsertSqlQuestion(pool, q, meta) {
  const info = classifyForIndex(q);
  const questionKey = questionSqlKey(q);
  const sourceType = sourceTypeOfQuestion(q);
  const sourceLabel = sourceLabelOfQuestion(q);
  const isImported = !!q.imported || sourceType !== 'default' || q.meta?.imported ? 1 : 0;
  const answerText = q.type === 'choice' ? String(Number(q.answer) || 0) : String(q.answer || '');
  const searchText = `${q.question} ${(q.options || []).join(' ')} ${q.explanation || ''} ${info.topic} ${(info.keywords || []).join(' ')}`;
  await pool.query(
    `INSERT INTO questions
      (question_key, id, subject_code, difficulty, q_type, question_text, options_json, answer_text, explanation, source_type, source_label, is_imported, meta_json, search_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      difficulty = VALUES(difficulty), q_type = VALUES(q_type), question_text = VALUES(question_text),
      options_json = VALUES(options_json), answer_text = VALUES(answer_text), explanation = VALUES(explanation),
      source_type = VALUES(source_type), source_label = VALUES(source_label), is_imported = VALUES(is_imported),
      meta_json = VALUES(meta_json), search_text = VALUES(search_text), updated_at = CURRENT_TIMESTAMP`,
    [
      questionKey,
      q.id,
      q.subject,
      q.difficulty || 5,
      q.type === 'fill' ? 'fill' : 'choice',
      q.question,
      JSON.stringify(q.options || []),
      answerText,
      q.explanation || '',
      sourceType,
      sourceLabel,
      isImported,
      JSON.stringify(q.meta || {}),
      searchText
    ]
  );
  await pool.query('DELETE FROM question_topics WHERE question_key = ?', [questionKey]);
  await pool.query('DELETE FROM question_keywords WHERE question_key = ?', [questionKey]);
  const topic = info.topic && !genericQuestionTypes.has(info.topic) ? info.topic : (q.type === 'choice' ? '\u9009\u62e9\u9898' : '\u586b\u7a7a\u9898');
  await pool.query('INSERT IGNORE INTO topics (subject_code, name) VALUES (?, ?)', [q.subject, topic]);
  const [topicRows] = await pool.query('SELECT id FROM topics WHERE subject_code = ? AND name = ?', [q.subject, topic]);
  if (topicRows[0]) {
    await pool.query('INSERT IGNORE INTO question_topics (question_key, topic_id) VALUES (?, ?)', [questionKey, topicRows[0].id]);
  }
  for (const keyword of (info.keywords || [])) {
    await pool.query('INSERT IGNORE INTO keywords (subject_code, word) VALUES (?, ?)', [q.subject, keyword]);
    const [keywordRows] = await pool.query('SELECT id FROM keywords WHERE subject_code = ? AND word = ?', [q.subject, keyword]);
    if (keywordRows[0]) {
      await pool.query('INSERT IGNORE INTO question_keywords (question_key, keyword_id) VALUES (?, ?)', [questionKey, keywordRows[0].id]);
    }
  }
  await pool.query(
    'INSERT INTO question_sources (question_key, source_type, source_label) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE source_type = VALUES(source_type), source_label = VALUES(source_label)',
    [questionKey, sourceType, sourceLabel]
  );
}

async function syncQuestionsToSql({ force = false } = {}) {
  const pool = await ensureMysqlSchema();
  if (!pool) return { ok: false, skipped: true, reason: 'mysql unavailable' };
  const data = loadQuestions();
  const normalized = compatibilityPayload(data);
  const revision = sqlRevisionSeed(normalized);
  const existingRevision = await getSqlMeta(pool, 'questions_revision');
  if (!force && existingRevision === revision) {
    return { ok: true, skipped: true, revision, count: normalized.questions.length };
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await ensureSqlSubjects(conn, normalized.meta);
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE question_keywords');
    await conn.query('TRUNCATE TABLE question_topics');
    await conn.query('TRUNCATE TABLE question_sources');
    await conn.query('TRUNCATE TABLE keywords');
    await conn.query('TRUNCATE TABLE topics');
    await conn.query('TRUNCATE TABLE questions');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    for (const q of normalized.questions) {
      await upsertSqlQuestion(conn, q, normalized.meta);
    }
    await setSqlMeta(conn, 'questions_revision', revision);
    await setSqlMeta(conn, 'questions_count', String(normalized.questions.length));
    await conn.commit();
    clearQuestionCaches();
    return { ok: true, revision, count: normalized.questions.length };
  } catch (error) {
    try { await conn.rollback(); } catch (_) {}
    throw error;
  } finally {
    conn.release();
  }
}

async function syncSqlAfterJsonWrite() {
  if (!mysqlEnabled()) return;
  try { await syncQuestionsToSql({ force: true }); } catch (_) {}
}

const leadingQuestionTags = ['教材例题改写', '考研真题变式', '模拟卷迁移', '课后习题变形', '易错点复盘', '综合复盘', '综合小题', '概念辨析', '计算训练', '章节诊断', '公式迁移', '公式应用', '题型归纳', '考研真题', '模拟卷', '教材例题', '课后习题', '易错点'];
function moveLeadingQuestionTag(text) {
  let s = String(text || '').trim().replace(/^[\s·•・、.。:：\-—–_]*(?:第?\s*\d+\s*[题、.。:：\-—–_·]*)?/u, '');
  for (const tag of leadingQuestionTags) {
    const re = new RegExp(`^[\\s·•・、.。:：\\-—–_\\d]*(?:第?\\s*\\d+\\s*[题、.。:：\\-—–_·]*)?(${tag})(?:\\s*\\d+)?(?:口径|考点|常见变式|变形|题|小题|改写|迁移)?[：:。\\.、·\\s\\-—–_]+(.+)$`);
    const match = s.match(re);
    if (match && !match[2].endsWith(match[1])) {
      const body = match[2].trim().replace(/^[\s·•・、.。:：\-—–_\d]+/u, '').replace(/[。.\s·•・、]+$/, '');
      return `${body} · ${match[1]}`;
    }
  }
  return s;
}

function normalizeQuestion(input, fallbackSubject = 'calculus') {
  if (!input || typeof input !== 'object') throw new Error('invalid question');
  const q = { ...input };
  const subject = String(q.subject || fallbackSubject);
  const allowedSubjects = Object.keys(defaultMeta().subjects);
  if (!allowedSubjects.includes(subject)) throw new Error('invalid subject');
  const type = q.type === 'fill' ? 'fill' : 'choice';
  const question = moveLeadingQuestionTag(q.question || q.stem || '');
  if (!question) throw new Error('question is required');
  const difficulty = Math.max(1, Math.min(10, Number(q.difficulty || q.level || 5)));
  const id = String(q.id || `${subject[0]}${Date.now()}${Math.random().toString(16).slice(2, 6)}`).trim();
  const normalized = {
    id,
    subject,
    difficulty,
    type,
    question,
    explanation: String(q.explanation || q.analysis || '')
  };
  if (q.imported || q.source) {
    normalized.imported = !!q.imported;
    normalized.source = String(q.source || 'manual-import').slice(0, 48);
  }
  if (type === 'choice') {
    const options = Array.isArray(q.options) ? q.options.map(x => String(x).trim()).filter(Boolean) : [];
    if (options.length < 2) throw new Error('choice questions need at least two options');
    normalized.options = options;
    normalized.answer = Math.max(0, Math.min(options.length - 1, Number(q.answer) || 0));
  } else {
    const answer = String(q.answer ?? '').trim();
    if (!answer) throw new Error('fill questions need an answer');
    normalized.answer = answer;
  }
  normalized.meta = q.meta && typeof q.meta === 'object' ? q.meta : {
    type: type === 'choice' ? '\u9009\u62e9\u9898' : '\u586b\u7a7a\u9898',
    knowledge_path: [],
    keywords: [],
    difficulty,
    prerequisites: []
  };
  return normalized;
}

function toQuestionDB(questions) {
  const db = { calculus: [], linear: [], probability: [] };
  questions.forEach(q => {
    if (!db[q.subject]) db[q.subject] = [];
    const { subject, ...rest } = q;
    db[q.subject].push(rest);
  });
  return db;
}

function compatibilityPayload(data) {
  const meta = { ...defaultMeta(), ...(data.meta || {}) };
  meta.subjects = { ...defaultMeta().subjects, ...(data.meta?.subjects || {}) };
  meta.topicRules = { ...defaultMeta().topicRules, ...(data.meta?.topicRules || {}) };
  const questions = Array.isArray(data.questions) ? data.questions : [];
  return {
    meta,
    questions,
    questionDB: toQuestionDB(questions),
    subjectNames: Object.fromEntries(Object.entries(meta.subjects).map(([key, value]) => [key, value.name])),
    subjectColors: Object.fromEntries(Object.entries(meta.subjects).map(([key, value]) => [key, value.color])),
    topicRules: meta.topicRules
  };
}

function legacyToStandard() {
  const meta = defaultMeta();
  if (!fs.existsSync(legacyQuestionBankFile)) return { meta, questions: [] };
  const sandbox = {
    window: {},
    console: { log() {}, warn() {}, error() {} }
  };
  sandbox.global = sandbox;
  vm.createContext(sandbox);
  const code = fs.readFileSync(legacyQuestionBankFile, 'utf8');
  vm.runInContext(code, sandbox, { filename: legacyQuestionBankFile, timeout: 1000 });
  const legacy = sandbox.window || {};
  const subjects = {};
  Object.keys(meta.subjects).forEach(subject => {
    subjects[subject] = {
      name: legacy.subjectNames?.[subject] || meta.subjects[subject].name,
      color: legacy.subjectColors?.[subject] || meta.subjects[subject].color
    };
  });
  const questions = [];
  Object.entries(legacy.questionDB || {}).forEach(([subject, list]) => {
    (Array.isArray(list) ? list : []).forEach(item => {
      try {
        questions.push(normalizeQuestion({ ...item, subject }, subject));
      } catch (_) {}
    });
  });
  return {
    meta: {
      version: meta.version,
      subjects,
      topicRules: legacy.topicRules || meta.topicRules
    },
    questions
  };
}

function saveQuestions(data) {
  fs.mkdirSync(dataDir, { recursive: true });
  const normalized = {
    meta: compatibilityPayload(data).meta,
    questions: []
  };
  const ids = new Set();
  (data.questions || []).forEach(q => {
    try {
      const item = normalizeQuestion(q, q.subject);
      if (ids.has(item.id)) {
        item.id = `${item.id}-${crypto.randomUUID().slice(0, 8)}`;
      }
      ids.add(item.id);
      normalized.questions.push(item);
    } catch (_) {}
  });
  const temp = `${questionsFile}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(normalized, null, 2), 'utf8');
  fs.renameSync(temp, questionsFile);
  clearQuestionCaches();
  questionsCache = { mtimeMs: fs.statSync(questionsFile).mtimeMs, data: normalized };
  return normalized;
}

function loadQuestions() {
  if (fs.existsSync(questionsFile)) {
    try {
      const stat = fs.statSync(questionsFile);
      if (questionsCache && questionsCache.mtimeMs === stat.mtimeMs) return questionsCache.data;
      const data = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));
      const normalized = {
        meta: compatibilityPayload(data).meta,
        questions: []
      };
      const ids = new Set();
      (Array.isArray(data.questions) ? data.questions : []).forEach(q => {
        try {
          const item = normalizeQuestion(q, q.subject);
          if (ids.has(item.id)) item.id = `${item.id}-${crypto.randomUUID().slice(0, 8)}`;
          ids.add(item.id);
          normalized.questions.push(item);
        } catch (_) {}
      });
      questionsCache = { mtimeMs: stat.mtimeMs, data: normalized };
      return normalized;
    } catch (error) {
      const broken = `${questionsFile}.broken-${Date.now()}`;
      fs.copyFileSync(questionsFile, broken);
    }
  }
  return saveQuestions(legacyToStandard());
}


function classifyByRules(text, subject = 'calculus') {
  const meta = defaultMeta();
  const rules = meta.topicRules[subject] || Object.values(meta.topicRules).flat();
  const source = String(text || '');
  const ranked = rules.map(pair => {
    const topic = pair[0];
    const words = pair[1] || [];
    const found = words.filter(word => word && source.includes(String(word)));
    const score = found.length * 100 + found.reduce((sum, word) => sum + String(word).length, 0) * 3 + String(topic || '').length;
    return { topic, found, score };
  }).filter(item => item.found.length).sort((a, b) => b.score - a.score);
  const matchedWords = ranked.flatMap(item => item.found);
  const questionType = /A[.\u3001]|B[.\u3001]|\u9009\u62e9|\u9009\u9879/u.test(String(text)) ? 'choice' : 'fill';
  const topic = sanitizeMathTopic(ranked[0]?.topic, subject, questionType);
  const keywords = sanitizeMathKeywords(Array.from(new Set(matchedWords)), subject, text, 6, topic);
  return {
    type: questionType === 'choice' ? '\u9009\u62e9\u9898' : '\u586b\u7a7a\u9898',
    knowledge_path: [meta.subjects[subject]?.name || '\u6570\u5b66', topic],
    keywords,
    difficulty: 5,
    prerequisites: []
  };
}

function firstQuestionCharServer(q) {
  const text = String(q.question || '').replace(/\\\(|\\\)|[\s`~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\uFF0C\u3002\uFF01\uFF1F\u3001\uFF1A\uFF1B\u201C\u201D\u2018\u2019\uFF08\uFF09\u3010\u3011]/gu, '');
  return (text.match(/[\u4e00-\u9fa5A-Za-z0-9]/)?.[0] || (q.type === 'choice' ? '\u9009' : '\u586b')).toUpperCase();
}

function questionKeyServer(q) {
  const fallback = crypto.createHash('sha1').update(String(q.question || '')).digest('hex').slice(0, 12);
  return String(q.subject || '') + '::' + (q.id || fallback);
}

function classifyForIndex(q) {
  const meta = q.meta || {};
  const text = String(q.question || '') + ' ' + ((q.options || []).join(' ')) + ' ' + String(q.explanation || '');
  if (Array.isArray(meta.keywords) || meta.type || Array.isArray(meta.knowledge_path)) {
    const pathTopic = Array.isArray(meta.knowledge_path) ? meta.knowledge_path.filter(Boolean).at(-1) : '';
    const rawTopic = (pathTopic && pathTopic !== '\u5f85\u6807\u6ce8') ? pathTopic : (meta.type && !genericQuestionTypes.has(meta.type) ? meta.type : '');
    const topic = sanitizeMathTopic(rawTopic, q.subject, q.type);
    let keywords = Array.isArray(meta.keywords) ? meta.keywords.map(String).slice(0, 5) : [];
    if (!keywords.length) keywords = classifyByRules(text, q.subject).keywords || [];
    keywords = sanitizeMathKeywords(keywords, q.subject, text, 5, topic);
    return { topic, keywords };
  }
  const fallback = classifyByRules(text, q.subject);
  const pathTopic = Array.isArray(fallback.knowledge_path) ? fallback.knowledge_path.filter(Boolean).at(-1) : '';
  const topic = sanitizeMathTopic(pathTopic && pathTopic !== '\u5f85\u6807\u6ce8' ? pathTopic : fallback.type, q.subject, q.type);
  return { topic, keywords: sanitizeMathKeywords(fallback.keywords || [], q.subject, text, 5, topic) };
}

const guideProfiles = [
  { match: ['\u6781\u9650', '\u65e0\u7a77\u5c0f'], core: '\u5148\u5224\u65ad\u6781\u9650\u578b\u522b\uff0c\u518d\u9009\u62e9\u7b49\u4ef7\u4ee3\u6362\u3001\u5939\u903c\u3001\u5355\u8c03\u6709\u754c\u6216\u6d1b\u5fc5\u8fbe\u6cd5\u5219\u3002', avoid: '\u4e0d\u8981\u5728\u52a0\u51cf\u7ed3\u6784\u4e2d\u968f\u610f\u66ff\u6362\u7b49\u4ef7\u65e0\u7a77\u5c0f\u3002' },
  { match: ['\u5bfc\u6570', '\u5fae\u5206', '\u4e2d\u503c\u5b9a\u7406', '\u6d1b\u5fc5\u8fbe', '\u5355\u8c03', '\u6781\u503c'], core: '\u628a\u9898\u76ee\u4e2d\u7684\u53d8\u5316\u7387\u3001\u5207\u7ebf\u3001\u5355\u8c03\u6216\u6781\u503c\u6761\u4ef6\u8f6c\u6210\u5bfc\u6570\u4fe1\u606f\u3002', avoid: '\u6ce8\u610f\u5b9a\u4e49\u57df\u3001\u7aef\u70b9\u548c\u4e2d\u503c\u5b9a\u7406\u7684\u6761\u4ef6\u3002' },
  { match: ['\u79ef\u5206', '\u5b9a\u79ef\u5206', '\u4e0d\u5b9a\u79ef\u5206', '\u53cd\u5e38\u79ef\u5206'], core: '\u5148\u770b\u88ab\u79ef\u51fd\u6570\u7ed3\u6784\uff0c\u5728\u6362\u5143\u3001\u5206\u90e8\u3001\u5bf9\u79f0\u6027\u548c\u79ef\u5206\u4e0a\u9650\u51fd\u6570\u4e4b\u95f4\u9009\u65b9\u6cd5\u3002', avoid: '\u6362\u5143\u65f6\u8bb0\u5f97\u540c\u6b65\u5904\u7406\u5fae\u5206\u548c\u79ef\u5206\u9650\u3002' },
  { match: ['\u7ea7\u6570', '\u6536\u655b', '\u5e42\u7ea7\u6570'], core: '\u5148\u533a\u5206\u5e38\u6570\u9879\u7ea7\u6570\u548c\u5e42\u7ea7\u6570\uff0c\u518d\u7528\u6bd4\u503c\u3001\u6839\u503c\u3001\u6bd4\u8f83\u6216\u7aef\u70b9\u68c0\u9a8c\u3002', avoid: '\u6536\u655b\u534a\u5f84\u4e0d\u7b49\u4e8e\u6536\u655b\u57df\uff0c\u7aef\u70b9\u8981\u5355\u72ec\u5224\u65ad\u3002' },
  { match: ['\u504f\u5bfc', '\u591a\u5143', '\u91cd\u79ef\u5206', '\u66f2\u7ebf', '\u66f2\u9762'], core: '\u5148\u786e\u5b9a\u51e0\u4f55\u5bf9\u8c61\u548c\u53d8\u91cf\u8303\u56f4\uff0c\u518d\u9009\u5750\u6807\u7cfb\u3001\u79ef\u5206\u6b21\u5e8f\u6216\u76f8\u5e94\u516c\u5f0f\u3002', avoid: '\u533a\u57df\u8fb9\u754c\u548c\u66f2\u7ebf/\u66f2\u9762\u65b9\u5411\u8981\u68c0\u67e5\u3002' },
  { match: ['\u77e9\u9635', '\u884c\u5217\u5f0f', '\u5411\u91cf', '\u65b9\u7a0b\u7ec4', '\u7279\u5f81\u503c', '\u4e8c\u6b21\u578b', '\u6b63\u5b9a'], core: '\u628a\u9898\u76ee\u8f6c\u6210\u77e9\u9635\u7684\u79e9\u3001\u53ef\u9006\u6027\u3001\u7279\u5f81\u4fe1\u606f\u6216\u6807\u51c6\u5f62\u6765\u5904\u7406\u3002', avoid: '\u533a\u5206\u521d\u7b49\u884c\u53d8\u6362\u3001\u76f8\u4f3c\u53d8\u6362\u548c\u5408\u540c\u53d8\u6362\u7684\u4e0d\u53d8\u91cf\u3002' },
  { match: ['\u6982\u7387', '\u5206\u5e03', '\u671f\u671b', '\u65b9\u5dee', '\u4f30\u8ba1', '\u68c0\u9a8c'], core: '\u5148\u5199\u6e05\u6837\u672c\u7a7a\u95f4\u3001\u968f\u673a\u53d8\u91cf\u6216\u7edf\u8ba1\u91cf\uff0c\u518d\u9009\u62e9\u5bf9\u5e94\u7684\u5206\u5e03\u3001\u6570\u5b57\u7279\u5f81\u6216\u63a8\u65ad\u65b9\u6cd5\u3002', avoid: '\u4e92\u65a5\u4e0e\u72ec\u7acb\u3001\u5bc6\u5ea6\u4e0e\u6982\u7387\u3001p \u503c\u4e0e\u62d2\u7edd\u57df\u90fd\u8981\u5206\u6e05\u3002' }
];

function localGuideHint({ level = 1, subjectName = '\u6570\u5b66', topic = '', keywords = [], question = '' } = {}) {
  const haystack = `${topic} ${(keywords || []).join(' ')} ${question}`;
  const profile = guideProfiles.find(p => p.match.some(word => haystack.includes(word))) || {
    core: '\u5148\u628a\u9898\u5e72\u4e2d\u7684\u5df2\u77e5\u6761\u4ef6\u3001\u76ee\u6807\u548c\u53ef\u7528\u5b9a\u7406\u5206\u5f00\uff0c\u518d\u9009\u6700\u77ed\u7684\u89e3\u9898\u8def\u5f84\u3002',
    avoid: '\u4e0d\u8981\u6025\u7740\u4ee3\u5165\u8ba1\u7b97\uff0c\u5148\u5224\u65ad\u9898\u578b\u548c\u6761\u4ef6\u662f\u5426\u5339\u914d\u3002'
  };
  const keys = Array.isArray(keywords) && keywords.length ? `\u5173\u952e\u8bcd\uff1a${keywords.slice(0, 3).join('\u3001')}\u3002` : '';
  const label = topic || subjectName || '\u672c\u9898';
  if (Number(level) === 1) return `\u8fd9\u9898\u5148\u6309\u300c${label}\u300d\u6765\u770b\u3002${keys}\u8bf7\u5148\u627e\u51fa\u9898\u5e72\u4e2d\u7684\u5df2\u77e5\u6761\u4ef6\u548c\u76ee\u6807\u91cf\u3002`;
  if (Number(level) === 2) return `${profile.core} \u628a\u53ef\u80fd\u7528\u5230\u7684\u516c\u5f0f\u6216\u5b9a\u7406\u5199\u51fa\u6765\uff0c\u770b\u54ea\u4e2a\u6761\u4ef6\u80fd\u5bf9\u4e0a\u3002`;
  if (Number(level) === 3) return `\u5efa\u8bae\u6b65\u9aa4\uff1a1. \u6807\u51fa\u6761\u4ef6\uff1b2. \u9009\u62e9\u300c${label}\u300d\u7684\u4e3b\u65b9\u6cd5\uff1b3. \u5148\u505a\u7b26\u53f7\u5316\u63a8\u5bfc\uff0c\u518d\u8ba1\u7b97\u3002`;
  return `${profile.core} ${profile.avoid} \u5199\u5b8c\u540e\u6309\u201c\u6761\u4ef6\u8bc6\u522b -> \u65b9\u6cd5\u9009\u62e9 -> \u4ee3\u5165\u63a8\u5bfc -> \u68c0\u67e5\u7ed3\u8bba\u201d\u590d\u67e5\u3002`;
}

function aiGuidePrompt(body = {}) {
  const subject = body.subjectName || defaultMeta().subjects[body.subject]?.name || '\u6570\u5b66';
  const topic = String(body.topic || '\u672a\u5206\u7c7b');
  const keywords = Array.isArray(body.keywords) ? body.keywords.slice(0, 6).join('\u3001') : '';
  const options = Array.isArray(body.options) && body.options.length ? '\n\u9009\u9879\uff1a' + body.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('；') : '';
  return '\u4f60\u662f\u4e00\u4f4d\u8003\u7814\u6570\u5b66\u5f15\u5bfc\u578b\u6559\u7ec3\u3002\u8bf7\u6839\u636e\u9898\u5e72\u3001\u7ec6\u5206\u9898\u578b\u548c\u5173\u952e\u8bcd\u751f\u6210\u4e00\u6761\u63d0\u793a\uff0c\u4e0d\u8981\u76f4\u63a5\u7ed9\u6700\u7ec8\u7b54\u6848\u3002\n' +
    '\u53ea\u8f93\u51fa JSON\uff1a{"hint":"..."}\n' +
    `\u5b66\u79d1\uff1a${subject}\n\u7ec6\u5206\u9898\u578b\uff1a${topic}\n\u5173\u952e\u8bcd\uff1a${keywords || '\u65e0'}\n\u63d0\u793a\u7ea7\u522b\uff1a${Number(body.level || 1)} / 4\n\u9898\u5e72\uff1a${String(body.question || '').slice(0, 900)}${options}\n` +
    '\u7ea7\u522b\u89c4\u5219\uff1a1 \u53ea\u6307\u8ba4\u9898\u578b\u548c\u5173\u952e\u6761\u4ef6\uff1b2 \u63d0\u9192\u53ef\u7528\u65b9\u6cd5\uff1b3 \u7ed9\u6b65\u9aa4\u6846\u67b6\uff1b4 \u7ed9\u8f83\u5b8c\u6574\u89e3\u6790\u8def\u7ebf\uff0c\u4ecd\u907f\u514d\u76f4\u63a5\u8bf4\u6700\u7ec8\u6570\u503c\u7b54\u6848\u3002';
}

async function aiGuide(body = {}) {
  const fallback = localGuideHint(body);
  const config = loadAiConfig(body.ai || {});
  if (!config.apiKey) return { hint: fallback, source: 'local' };
  try {
    const parsed = await callAiJson(aiGuidePrompt(body), body.ai || {}, { temperature: 0.25, maxTokens: 700 }) || {};
    const hint = String(parsed.hint || '').trim();
    return { hint: hint || fallback, source: hint ? 'ai' : 'local' };
  } catch (_) {
    return { hint: fallback, source: 'local' };
  }
}

function questionIndexPayload(data = loadQuestions()) {
  const normalized = compatibilityPayload(data);
  const revisionSeed = String(normalized.meta.version || '') + ':' + normalized.questions.length + ':' + (normalized.questions.at(-1)?.id || '');
  if (questionIndexCache?.revisionSeed === revisionSeed) return questionIndexCache.payload;
  const bySubject = {};
  const topicsBySubject = {};
  normalized.questions.forEach(q => {
    const info = classifyForIndex(q);
    const imported = !!q.imported || q.source === 'auto-import' || q.source === 'manual-import' || q.meta?.imported;
    if (!bySubject[q.subject]) bySubject[q.subject] = {};
    bySubject[q.subject][q.id] = {
      id: q.id,
      key: questionKeyServer(q),
      topic: info.topic,
      keywords: info.keywords,
      imported,
      char: firstQuestionCharServer(q),
      searchText: (String(q.question || '') + ' ' + ((q.options || []).join(' ')) + ' ' + info.topic + ' ' + ((info.keywords || []).join(' '))).toLowerCase()
    };
    if (!topicsBySubject[q.subject]) topicsBySubject[q.subject] = new Set();
    if (info.topic && !genericQuestionTypes.has(info.topic)) topicsBySubject[q.subject].add(info.topic);
    (info.keywords || []).forEach(word => topicsBySubject[q.subject].add(word));
  });
  const filters = {};
  Object.keys(normalized.meta.subjects).forEach(subject => {
    const ruleTopics = (normalized.meta.topicRules?.[subject] || []).map(pair => pair[0]);
    const extraTopics = Array.from(topicsBySubject[subject] || []).filter(t => !ruleTopics.includes(t)).sort();
    filters[subject] = [
      { value: 'all', label: '\u5168\u90e8\u9898\u76ee' },
      { value: 'type:choice', label: '\u5168\u90e8\u9009\u62e9\u9898' },
      { value: 'type:fill', label: '\u5168\u90e8\u586b\u7a7a\u9898' },
      ...ruleTopics.map(topic => ({ value: 'topic:' + topic, label: topic })),
      ...extraTopics.map(topic => ({ value: 'topic:' + topic, label: topic }))
    ];
  });
  const payload = { ok: true, revision: revisionSeed, index: bySubject, filters };
  questionIndexCache = { revisionSeed, payload };
  return payload;
}

function questionStatus(q, attempts = {}) {
  const keyA = `${q.subject || ''}::${q.id || ''}`;
  const keyB = questionKeyServer(q);
  const status = attempts[keyA] || attempts[keyB] || {};
  const count = Number(status.count || status.attempts || 0);
  const lastCorrect = status.lastCorrect === true || status.correct === true;
  const score = Math.max(0, Math.min(100, Number(status.score || status.accuracy || 0)));
  return {
    count,
    lastCorrect,
    score,
    state: 'score'
  };
}

function matchesPracticeFilters(q, attempts = {}, filters = []) {
  if (!filters.length) return true;
  const status = questionStatus(q, attempts);
  return filters.some(filter => {
    if (filter === 'wrong') return status.count > 0 && status.lastCorrect === false;
    if (filter === 'low') return status.count > 0 && status.score < 50;
    if (filter === 'seen') return status.count > 0;
    if (filter === 'unseen') return status.count <= 0;
    return false;
  });
}


function questionPagePayload({ subject, search = '', filters = [], page = 1, pageSize = 30, preload = 5, attempts = {} }) {
  pageSize = Math.max(20, Math.min(100, Math.round((Number(pageSize) || 30) / 5) * 5));
  preload = Math.max(0, Math.min(5, Number(preload) || 0));
  const data = loadQuestions();
  const normalized = compatibilityPayload(data);
  const filterList = Array.isArray(filters) ? filters.filter(Boolean) : String(filters || '').split(',').filter(Boolean);
  const typeFilters = filterList.filter(filter => filter === 'type:choice' || filter === 'type:fill');
  const topicFilters = filterList.filter(filter => filter.startsWith('topic:')).map(f => f.slice(6));
  const keywordFilters = filterList.filter(filter => filter.startsWith('keyword:')).map(f => f.slice(8));
  const difficultyFilters = filterList.filter(filter => filter.startsWith('difficulty:')).map(f => f.slice(11));
  const sourceFilters = filterList.filter(filter => filter.startsWith('source:')).map(f => f.slice(7));
  const importedFilters = filterList.filter(filter => filter === 'imported:true' || filter === 'imported:false').map(f => f.slice(9));
  const practiceFilters = filterList.filter(filter => filter.startsWith('practice:')).map(f => f.slice(9));
  const query = String(search || '').trim().toLowerCase();
  const revision = String(normalized.meta.version || '') + ':' + normalized.questions.length + ':' + (normalized.questions.at(-1)?.id || '');
  const attemptKey = practiceFilters.length ? Object.entries(attempts || {}).map(([key, value]) => `${key}:${value?.count || 0}:${value?.lastCorrect ? 1 : 0}:${value?.score || 0}`).sort().join('|') : '';
  const listCacheKey = revision + ':' + subject + ':' + query + ':' + filterList.slice().sort().join(',') + ':' + attemptKey;
  let list = questionPageListCache.get(listCacheKey);
  if (!list) {
    list = normalized.questions.filter(q => q.subject === subject);
    if (typeFilters.length) list = list.filter(q => typeFilters.some(filter => filter === 'type:choice' ? q.type === 'choice' : filter === 'type:fill' ? q.type === 'fill' : false));
    if (topicFilters.length) list = list.filter(q => {
      const info = classifyForIndex(q);
      return topicFilters.some(t => info.topic === t || (info.keywords || []).includes(t));
    });
    if (keywordFilters.length) list = list.filter(q => {
      const info = classifyForIndex(q);
      return keywordFilters.some(t => info.topic === t || (info.keywords || []).includes(t));
    });
    if (difficultyFilters.length) list = list.filter(q => difficultyFilters.some(value => {
      const difficulty = Number(q.difficulty || 5);
      const range = String(value).match(/^(\d+)-(\d+)$/);
      return range ? difficulty >= Number(range[1]) && difficulty <= Number(range[2]) : difficulty === Number(value);
    }));
    if (sourceFilters.length) list = list.filter(q => sourceFilters.includes(sourceTypeOfQuestion(q)));
    if (importedFilters.length === 1) list = list.filter(q => {
      const imported = !!q.imported || q.source === 'auto-import' || q.source === 'manual-import' || q.meta?.imported;
      return importedFilters[0] === 'true' ? imported : !imported;
    });
    if (practiceFilters.length) list = list.filter(q => matchesPracticeFilters(q, attempts, practiceFilters));
    if (query) list = list.filter(q => (String(q.question || '') + ' ' + ((q.options || []).join(' ')) + ' ' + String(q.explanation || '')).toLowerCase().includes(query));
    if (questionPageListCache.size > 40) questionPageListCache.clear();
    questionPageListCache.set(listCacheKey, list);
  }
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.max(1, Math.min(pages, Number(page) || 1));
  const toPageItem = q => {
    const info = classifyForIndex(q);
    const cleanQuestion = { ...q, meta: { ...(q.meta || {}), type: info.topic, knowledge_path: [normalized.meta.subjects[q.subject]?.name || q.subject, info.topic], keywords: info.keywords } };
    return { q: cleanQuestion, id: q.id, key: questionKeyServer(q), info, imported: !!q.imported || q.source === 'auto-import' || q.source === 'manual-import' || q.meta?.imported, char: firstQuestionCharServer(q), status: questionStatus(q, attempts) };
  };
  const loadedPages = {};
  let startPage = Math.max(1, current - Math.floor(preload / 2));
  let endPage = Math.min(pages, current + Math.ceil(preload / 2));
  while (endPage - startPage < preload && startPage > 1) startPage--;
  while (endPage - startPage < preload && endPage < pages) endPage++;
  for (let pageNo = startPage; pageNo <= endPage; pageNo++) {
    const start = (pageNo - 1) * pageSize;
    loadedPages[pageNo] = list.slice(start, start + pageSize).map(toPageItem);
  }
  const fallbackFilters = [
    { value: 'all', label: '\u5168\u90e8\u9898\u76ee' },
    { value: 'type:choice', label: '\u9009\u62e9\u9898' },
    { value: 'type:fill', label: '\u586b\u7a7a\u9898' },
    { value: 'difficulty:1-3', label: 'L1-L3 \u57fa\u7840' },
    { value: 'difficulty:4-6', label: 'L4-L6 \u5e38\u89c4' },
    { value: 'difficulty:7-10', label: 'L7-L10 \u63d0\u5347' },
    { value: 'practice:wrong', label: '\u9519\u9898' },
    { value: 'practice:low', label: '\u4f4e\u6b63\u786e\u7387' },
    { value: 'imported:false', label: '\u9ed8\u8ba4\u9898' },
    { value: 'imported:true', label: '\u5bfc\u5165\u9898' }
  ];
  return { ok: true, revision, subject, total, pages, page: current, pageSize, filters: fallbackFilters, loadedPages };
}

function parseQuestionFilterGroups(filters = []) {
  const filterList = Array.isArray(filters) ? filters.filter(Boolean) : String(filters || '').split(',').filter(Boolean);
  const groups = { type: [], topic: [], keyword: [], difficulty: [], source: [], imported: [], practice: [] };
  filterList.forEach(filter => {
    const value = String(filter);
    if (value === 'type:choice' || value === 'type:fill') groups.type.push(value.slice(5));
    else if (value.startsWith('topic:')) groups.topic.push(value.slice(6));
    else if (value.startsWith('keyword:')) groups.keyword.push(value.slice(8));
    else if (value.startsWith('difficulty:')) groups.difficulty.push(value.slice(11));
    else if (value.startsWith('source:')) groups.source.push(value.slice(7));
    else if (value === 'imported:true' || value === 'imported:false') groups.imported.push(value.slice(9));
    else if (value.startsWith('practice:')) groups.practice.push(value.slice(9));
  });
  return { filterList, groups };
}

function addInClause(parts, params, column, values) {
  if (!values.length) return;
  parts.push(`${column} IN (${values.map(() => '?').join(',')})`);
  params.push(...values);
}

function sqlWhereForQuestionFilters({ subject, search = '', filters = [] }) {
  const { filterList, groups } = parseQuestionFilterGroups(filters);
  const parts = ['q.subject_code = ?'];
  const params = [subject];
  addInClause(parts, params, 'q.q_type', groups.type);
  addInClause(parts, params, 'q.source_type', groups.source);
  if (groups.imported.length === 1) {
    parts.push('q.is_imported = ?');
    params.push(groups.imported[0] === 'true' ? 1 : 0);
  }
  if (groups.difficulty.length) {
    const or = [];
    groups.difficulty.forEach(value => {
      const range = value.match(/^(\d+)-(\d+)$/);
      if (range) {
        or.push('(q.difficulty BETWEEN ? AND ?)');
        params.push(Number(range[1]), Number(range[2]));
      } else {
        or.push('q.difficulty = ?');
        params.push(Number(value) || 5);
      }
    });
    parts.push(`(${or.join(' OR ')})`);
  }
  if (groups.topic.length) {
    parts.push(`EXISTS (
      SELECT 1 FROM question_topics qt
      JOIN topics t ON t.id = qt.topic_id
      WHERE qt.question_key = q.question_key AND t.name IN (${groups.topic.map(() => '?').join(',')})
    )`);
    params.push(...groups.topic);
  }
  if (groups.keyword.length) {
    parts.push(`EXISTS (
      SELECT 1 FROM question_keywords qk
      JOIN keywords k ON k.id = qk.keyword_id
      WHERE qk.question_key = q.question_key AND k.word IN (${groups.keyword.map(() => '?').join(',')})
    )`);
    params.push(...groups.keyword);
  }
  const query = String(search || '').trim();
  if (query) {
    parts.push('(MATCH(q.question_text, q.explanation, q.search_text) AGAINST (? IN NATURAL LANGUAGE MODE) OR q.question_text LIKE ? OR q.explanation LIKE ? OR q.search_text LIKE ?)');
    params.push(query, `%${query}%`, `%${query}%`, `%${query}%`);
  }
  return { filterList, groups, where: parts.join(' AND '), params };
}

async function sqlQuestionFilters(subject, revision = '') {
  const pool = await ensureMysqlSchema();
  if (!pool) return null;
  const cacheKey = `${revision || await getSqlMeta(pool, 'questions_revision') || 'sql'}:${subject}`;
  const cached = cacheGet(sqlQuestionFilterCache, cacheKey);
  if (cached) return cached;
  const options = [
    { value: 'all', label: '\u5168\u90e8\u9898\u76ee' },
    { value: 'type:choice', label: '\u5168\u90e8\u9009\u62e9\u9898' },
    { value: 'type:fill', label: '\u5168\u90e8\u586b\u7a7a\u9898' },
    { value: 'difficulty:1-3', label: 'L1-L3 \u57fa\u7840' },
    { value: 'difficulty:4-6', label: 'L4-L6 \u5e38\u89c4' },
    { value: 'difficulty:7-10', label: 'L7-L10 \u63d0\u5347' },
    { value: 'practice:wrong', label: '\u9519\u9898' },
    { value: 'practice:low', label: '\u4f4e\u6b63\u786e\u7387' },
    { value: 'imported:false', label: '\u9ed8\u8ba4\u9898' },
    { value: 'imported:true', label: '\u5bfc\u5165\u9898' }
  ];
  const [sources] = await pool.query(
    'SELECT source_type, COUNT(*) AS c FROM questions WHERE subject_code = ? GROUP BY source_type ORDER BY c DESC, source_type LIMIT 12',
    [subject]
  );
  sources
    .filter(row => row.source_type && row.source_type !== 'default')
    .forEach(row => options.push({ value: `source:${row.source_type}`, label: `来源 ${row.source_type}` }));
  const [topics] = await pool.query(
    `SELECT t.name, COUNT(*) AS c
     FROM topics t JOIN question_topics qt ON qt.topic_id = t.id
     JOIN questions q ON q.question_key = qt.question_key
     WHERE t.subject_code = ? AND q.subject_code = ?
     GROUP BY t.name ORDER BY c DESC, t.name LIMIT 40`,
    [subject, subject]
  );
  topics.forEach(row => options.push({ value: `topic:${row.name}`, label: row.name }));
  const [keywords] = await pool.query(
    `SELECT k.word, COUNT(*) AS c
     FROM keywords k JOIN question_keywords qk ON qk.keyword_id = k.id
     JOIN questions q ON q.question_key = qk.question_key
     WHERE k.subject_code = ? AND q.subject_code = ?
     GROUP BY k.word ORDER BY c DESC, k.word LIMIT 36`,
    [subject, subject]
  );
  keywords
    .filter(row => !options.some(opt => opt.value === `topic:${row.word}`))
    .forEach(row => options.push({ value: `keyword:${row.word}`, label: row.word }));
  return cacheSet(sqlQuestionFilterCache, cacheKey, options, QUESTION_PAGE_CACHE_MS * 5, 60);
}

function sqlPageBaseItem(row) {
  const q = sqlQuestionRowToQuestion(row);
  const info = classifyForIndex(q);
  q.meta = { ...(q.meta || {}), type: info.topic, knowledge_path: [defaultMeta().subjects[q.subject]?.name || q.subject, info.topic], keywords: info.keywords };
  return {
    q,
    id: q.id,
    key: questionKeyServer(q),
    info,
    imported: !!q.imported || q.source === 'auto-import' || q.source === 'manual-import' || q.meta?.imported,
    char: firstQuestionCharServer(q)
  };
}

function attachQuestionStatus(item, attempts = {}) {
  return { ...item, status: questionStatus(item.q, attempts) };
}

function sqlPageItem(row, attempts = {}) {
  return attachQuestionStatus(sqlPageBaseItem(row), attempts);
}

async function questionPagePayloadSql({ subject, search = '', filters = [], page = 1, pageSize = 30, preload = 5, attempts = {} }) {
  const pool = await ensureMysqlSchema();
  if (!pool) return null;
  const revision = await getSqlMeta(pool, 'questions_revision') || 'sql';
  pageSize = Math.max(20, Math.min(100, Math.round((Number(pageSize) || 30) / 5) * 5));
  preload = Math.max(0, Math.min(5, Number(preload) || 0));
  const { where, params, groups, filterList } = sqlWhereForQuestionFilters({ subject, search, filters });
  const staticCacheKey = `${revision}:${subject}:${String(search || '').trim().toLowerCase()}:${filterList.slice().sort().join(',')}:${pageSize}:${preload}:${page}`;
  if (!groups.practice.length) {
    const cached = cacheGet(questionPageResponseCache, staticCacheKey);
    if (cached) {
      const loadedPages = {};
      Object.entries(cached.loadedPages || {}).forEach(([pageNo, items]) => {
        loadedPages[pageNo] = items.map(item => attachQuestionStatus(item, attempts));
      });
      return { ...cached, loadedPages, filters: await sqlQuestionFilters(subject, revision) };
    }
  }
  const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total FROM questions q WHERE ${where}`, params);
  let total = Number(countRow?.total || 0);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  let current = Math.max(1, Math.min(pages, Number(page) || 1));
  const loadedPages = {};
  let startPage = Math.max(1, current - Math.floor(preload / 2));
  let endPage = Math.min(pages, current + Math.ceil(preload / 2));
  while (endPage - startPage < preload && startPage > 1) startPage--;
  while (endPage - startPage < preload && endPage < pages) endPage++;
  if (groups.practice.length) {
    const candidateCacheKey = `${revision}:${subject}:${String(search || '').trim().toLowerCase()}:${filterList.filter(filter => !String(filter).startsWith('practice:')).sort().join(',')}:practice-base`;
    let candidateItems = cacheGet(questionPageResponseCache, candidateCacheKey);
    if (!candidateItems) {
      const [rows] = await pool.query(`SELECT q.* FROM questions q WHERE ${where} ORDER BY q.id`, params);
      candidateItems = rows.map(sqlPageBaseItem);
      cacheSet(questionPageResponseCache, candidateCacheKey, candidateItems, QUESTION_PAGE_CACHE_MS, 80);
    }
    const filtered = candidateItems
      .map(item => attachQuestionStatus(item, attempts))
      .filter(item => matchesPracticeFilters(item.q, attempts, groups.practice));
    total = filtered.length;
    const filteredPages = Math.max(1, Math.ceil(total / pageSize));
    current = Math.max(1, Math.min(filteredPages, Number(page) || 1));
    startPage = Math.max(1, current - Math.floor(preload / 2));
    endPage = Math.min(filteredPages, current + Math.ceil(preload / 2));
    while (endPage - startPage < preload && startPage > 1) startPage--;
    while (endPage - startPage < preload && endPage < filteredPages) endPage++;
    for (let pageNo = startPage; pageNo <= endPage; pageNo++) {
      const offset = (pageNo - 1) * pageSize;
      loadedPages[pageNo] = filtered.slice(offset, offset + pageSize);
    }
    return {
      ok: true,
      source: 'sql',
      revision,
      subject,
      total,
      pages: filteredPages,
      page: current,
      pageSize,
      filters: await sqlQuestionFilters(subject, revision),
      loadedPages
    };
  }
  const baseLoadedPages = {};
  for (let pageNo = startPage; pageNo <= endPage; pageNo++) {
    const offset = (pageNo - 1) * pageSize;
    const [rows] = await pool.query(
      `SELECT q.* FROM questions q WHERE ${where} ORDER BY q.id LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    baseLoadedPages[pageNo] = rows.map(sqlPageBaseItem);
    loadedPages[pageNo] = baseLoadedPages[pageNo].map(item => attachQuestionStatus(item, attempts));
  }
  const basePayload = {
    ok: true,
    source: 'sql',
    revision,
    subject,
    total,
    pages,
    page: current,
    pageSize,
    loadedPages: baseLoadedPages
  };
  cacheSet(questionPageResponseCache, staticCacheKey, basePayload);
  return { ...basePayload, filters: await sqlQuestionFilters(subject, revision), loadedPages };
}

async function questionIndexPayloadSql() {
  const pool = await ensureMysqlSchema();
  if (!pool) return null;
  const revision = await getSqlMeta(pool, 'questions_revision') || 'sql';
  if (sqlQuestionIndexCache?.revision === revision) return sqlQuestionIndexCache.payload;
  const [rows] = await pool.query('SELECT question_key, id, subject_code, q_type, question_text, options_json, explanation, source_type, is_imported, meta_json, difficulty, answer_text FROM questions ORDER BY subject_code, id');
  const bySubject = {};
  rows.forEach(row => {
    const q = sqlQuestionRowToQuestion(row);
    const info = classifyForIndex(q);
    if (!bySubject[q.subject]) bySubject[q.subject] = {};
    bySubject[q.subject][q.id] = {
      id: q.id,
      key: questionKeyServer(q),
      topic: info.topic,
      keywords: info.keywords,
      imported: !!q.imported,
      char: firstQuestionCharServer(q),
      searchText: `${q.question} ${(q.options || []).join(' ')} ${info.topic} ${(info.keywords || []).join(' ')}`.toLowerCase()
    };
  });
  const filters = {};
  for (const subject of Object.keys(defaultMeta().subjects)) {
    filters[subject] = await sqlQuestionFilters(subject, revision);
  }
  const payload = { ok: true, source: 'sql', revision, index: bySubject, filters };
  sqlQuestionIndexCache = { revision, payload };
  return payload;
}

async function questionMetaPayloadSql() {
  const pool = await ensureMysqlSchema();
  if (!pool) return null;
  const meta = defaultMeta();
  const [rows] = await pool.query('SELECT subject_code, COUNT(*) AS c FROM questions GROUP BY subject_code');
  const counts = {};
  rows.forEach(row => { counts[row.subject_code] = Number(row.c || 0); });
  return {
    ok: true,
    source: 'sql',
    meta,
    subjectNames: Object.fromEntries(Object.entries(meta.subjects).map(([key, value]) => [key, value.name])),
    subjectColors: Object.fromEntries(Object.entries(meta.subjects).map(([key, value]) => [key, value.color])),
    topicRules: meta.topicRules,
    counts
  };
}

async function questionListPayloadSql(subject) {
  const pool = await ensureMysqlSchema();
  if (!pool) return null;
  const meta = defaultMeta();
  if (!meta.subjects[subject]) return { ok: false, status: 404, error: 'subject not found' };
  const [rows] = await pool.query('SELECT * FROM questions WHERE subject_code = ? ORDER BY id', [subject]);
  return { ok: true, source: 'sql', subject, questions: rows.map(sqlQuestionRowToQuestion) };
}

async function questionsPayloadSql() {
  const pool = await ensureMysqlSchema();
  if (!pool) return null;
  const [rows] = await pool.query('SELECT * FROM questions ORDER BY subject_code, id');
  return { meta: defaultMeta(), questions: rows.map(sqlQuestionRowToQuestion), source: 'sql' };
}

async function questionSearchPayloadSql(body = {}) {
  return questionPagePayloadSql({
    subject: String(body.subject || 'calculus'),
    search: String(body.search || body.query || ''),
    filters: body.filters || [],
    page: Number(body.page || 1),
    pageSize: Number(body.pageSize || 30),
    preload: 0,
    attempts: body.attempts || {}
  });
}
function postJson(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const payload = JSON.stringify(body);
    const transport = target.protocol === 'http:' ? http : https;
    const req = transport.request({
      method: 'POST',
      hostname: target.hostname,
      port: target.port || undefined,
      path: `${target.pathname}${target.search}`,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers
      }
    }, response => {
      let text = '';
      response.on('data', chunk => { text += chunk; });
      response.on('end', () => {
        try {
          const json = JSON.parse(text || '{}');
          if (response.statusCode >= 200 && response.statusCode < 300) resolve(json);
          else reject(new Error(json.error?.message || `HTTP ${response.statusCode}`));
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}


function classifyPrompt(text, subject) {
  const meta = defaultMeta();
  const subjectName = meta.subjects[subject]?.name || '\u6570\u5b66';
  const rules = meta.topicRules[subject] || [];
  const topicNames = rules.map(r => r[0]).join('\u3001');
  const vocab = rules.flatMap(r => r[1] || []).join('\u3001');
  return '\u4f60\u662f\u4e00\u4f4d\u6570\u5b66\u6559\u80b2\u4e13\u5bb6\u3002\u8bf7\u5206\u6790\u4ee5\u4e0b' + subjectName + '\u9898\u76ee\uff0c\u53ea\u8f93\u51fa\u5408\u6cd5 JSON\uff1a\n' +
    '{"type":"\u8ba1\u7b97\u9898","knowledge_path":["' + subjectName + '","\u5177\u4f53\u77e5\u8bc6\u70b9"],"keywords":["\u5173\u952e\u8bcd"],"difficulty":1,"prerequisites":[]}\n' +
    '\u7ea6\u675f\uff1a1. keywords \u5fc5\u987b\u662f\u9898\u76ee\u539f\u6587\u4e2d\u80fd\u627e\u5230\u7684\u6570\u5b66\u540d\u8bcd\u6216\u9898\u578b\u8bcd\u6c47\u3002\n' +
    '2. knowledge_path \u6700\u540e\u4e00\u9879\u5fc5\u987b\u662f\u4ee5\u4e0b\u4e4b\u4e00\uff1a' + topicNames + '\u3002\n' +
    '3. \u53c2\u8003\u8bcd\u6c47\uff1a' + vocab + '\u3002\n' +
    '\u9898\u76ee\uff1a' + text;
}

function normalizeAiProvider(config) {
  const explicit = String(config.provider || 'auto').toLowerCase();
  if (explicit && explicit !== 'auto') return explicit;
  const url = String(config.baseUrl || '').toLowerCase();
  if (url.includes('anthropic.com') || url.includes('/v1/messages')) return 'anthropic';
  return 'openai';
}

function aiEndpoint(config, provider) {
  const raw = String(config.baseUrl || '').trim();
  const fallback = provider === 'anthropic' ? 'https://api.anthropic.com/v1/messages' : 'https://api.openai.com/v1/chat/completions';
  const base = raw || fallback;
  const url = new URL(base);
  if (provider === 'anthropic') {
    if (!url.pathname || url.pathname === '/') url.pathname = '/v1/messages';
    else if (!url.pathname.endsWith('/messages')) url.pathname = url.pathname.replace(/\/$/, '') + '/messages';
  } else if (!url.pathname || url.pathname === '/') {
    url.pathname = '/v1/chat/completions';
  } else if (!url.pathname.endsWith('/chat/completions') && !url.pathname.endsWith('/responses')) {
    url.pathname = url.pathname.replace(/\/$/, '') + '/chat/completions';
  }
  return url.toString();
}

function isResponsesEndpoint(url) {
  try {
    return new URL(url).pathname.endsWith('/responses');
  } catch (_) {
    return false;
  }
}

function extractJsonObject(text) {
  const raw = String(text || '').trim();
  if (!raw) return {};
  try { return JSON.parse(raw); } catch (_) {}
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return JSON.parse(raw.slice(start, end + 1));
  }
  return {};
}


async function callAiJson(prompt, ai = {}, options = {}) {
  const config = loadAiConfig(ai);
  if (!config.apiKey) return null;
  const provider = normalizeAiProvider(config);
  const model = config.model || (provider === 'anthropic' ? 'claude-3-5-sonnet-latest' : 'gpt-4o-mini');
  const endpoint = aiEndpoint(config, provider);
  if (provider === 'anthropic') {
    const data = await postJson(endpoint, {
      model,
      max_tokens: options.maxTokens || 1200,
      temperature: options.temperature ?? 0.1,
      messages: [{ role: 'user', content: prompt + '\n\nOnly output valid JSON. Do not use Markdown code fences.' }]
    }, {
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01'
    });
    const content = Array.isArray(data.content) ? data.content.map(item => item.text || '').join('\n') : '';
    return extractJsonObject(content);
  }
  const payload = isResponsesEndpoint(endpoint)
    ? { model, input: prompt, temperature: options.temperature ?? 0.1, text: { format: { type: 'json_object' } } }
    : { model, messages: [{ role: 'user', content: prompt }], temperature: options.temperature ?? 0.1, response_format: { type: 'json_object' } };
  const data = await postJson(endpoint, payload, { Authorization: 'Bearer ' + config.apiKey });
  const content = data.choices?.[0]?.message?.content || data.output_text || data.output?.flatMap?.(item => item.content || []).map(item => item.text || '').join('\n') || '{}';
  return extractJsonObject(content);
}

async function classifyWithKimi(text, subject, ai = {}) {
  const config = loadAiConfig(ai);
  if (!config.apiKey) return classifyByRules(text, subject);
  let parsed = {};
  try { parsed = await callAiJson(classifyPrompt(text, subject), ai, { temperature: 0.1, maxTokens: 900 }) || {}; }
  catch (_) { return classifyByRules(text, subject); }
  const meta = defaultMeta();
  const rules = meta.topicRules[subject] || [];
  const validTopics = new Set(rules.map(r => r[0]).concat(['\u5176\u4ed6']));
  const rawKeywords = Array.isArray(parsed.keywords) ? parsed.keywords : [];
  const pathTopic = Array.isArray(parsed.knowledge_path) ? parsed.knowledge_path.filter(Boolean).at(-1) : '';
  const fallback = classifyByRules(text, subject);
  const finalTopic = sanitizeMathTopic(pathTopic && validTopics.has(pathTopic) ? pathTopic : (fallback.knowledge_path[1] || ''), subject, /\u9009\u62e9|\u9009\u9879|A[.\u3001]/u.test(String(text)) ? 'choice' : 'fill');
  const filteredKeywords = sanitizeMathKeywords(rawKeywords, subject, text, 4, finalTopic);
  return { type: String(parsed.type || '\u8ba1\u7b97\u9898'), knowledge_path: [meta.subjects[subject]?.name || '\u6570\u5b66', finalTopic], keywords: filteredKeywords.length ? filteredKeywords : fallback.keywords, difficulty: Math.max(1, Math.min(10, Number(parsed.difficulty || 5))), prerequisites: Array.isArray(parsed.prerequisites) ? parsed.prerequisites : [] };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function graphData(questions) {
  const nodes = [];
  const links = [];
  const nodeMap = new Map();
  const linkSet = new Set();
  const addNode = node => {
    if (!nodeMap.has(node.id)) {
      nodeMap.set(node.id, node);
      nodes.push(node);
    }
    return nodeMap.get(node.id);
  };
  const addLink = (source, target, relation) => {
    if (!source || !target || source === target) return;
    const key = `${source}->${target}`;
    if (linkSet.has(key)) return;
    linkSet.add(key);
    links.push({ source, target, relation });
  };
  const meta = defaultMeta();
  Object.entries(meta.subjects).forEach(([subject, info]) => {
    if (!questions.some(q => q.subject === subject)) return;
    const subjectId = `${subject}::subject`;
    addNode({ id: subjectId, label: info.name, group: subject, kind: 'subject', questionCount: 0, questions: [] });
    (meta.topicRules[subject] || []).forEach(([topic]) => {
      const topicId = `${subject}::topic::${topic}`;
      addNode({ id: topicId, label: topic, group: subject, kind: 'topic', questionCount: 0, questions: [] });
      addLink(subjectId, topicId, '科目');
    });
  });
  questions.forEach(q => {
    const text = `${q.question} ${(q.options || []).join(' ')} ${q.explanation || ''}`;
    const info = classifyForIndex(q);
    const topic = sanitizeMathTopic(info.topic, q.subject, q.type);
    const subjectId = `${q.subject}::subject`;
    const topicId = `${q.subject}::topic::${topic}`;
    const subjectNode = addNode({ id: subjectId, label: meta.subjects[q.subject]?.name || q.subject, group: q.subject, kind: 'subject', questionCount: 0, questions: [] });
    const topicNode = addNode({ id: topicId, label: topic, group: q.subject, kind: 'topic', questionCount: 0, questions: [] });
    subjectNode.questionCount++;
    topicNode.questionCount++;
    if (topicNode.questions.length < 24) topicNode.questions.push({ id: q.id, question: q.question, type: q.type, difficulty: q.difficulty });
    addLink(subjectId, topicId, '知识点');
    const words = sanitizeMathKeywords(info.keywords || classifyByRules(text, q.subject).keywords, q.subject, text, 4, topic);
    words.forEach(keyword => {
      const keyId = `${q.subject}::keyword::${keyword}`;
      const keywordNode = addNode({ id: keyId, label: keyword, group: q.subject, kind: 'keyword', questionCount: 0, questions: [] });
      keywordNode.questionCount++;
      if (keywordNode.questions.length < 20) keywordNode.questions.push({ id: q.id, question: q.question, type: q.type, difficulty: q.difficulty });
      addLink(topicId, keyId, '关键词');
    });
    for (let i = 0; i < words.length - 1; i++) {
      addLink(`${q.subject}::keyword::${words[i]}`, `${q.subject}::keyword::${words[i + 1]}`, '共现');
    }
  });
  const degree = new Map();
  links.forEach(link => {
    degree.set(link.source, (degree.get(link.source) || 0) + 1);
    degree.set(link.target, (degree.get(link.target) || 0) + 1);
  });
  const selected = new Map();
  const addSelected = id => {
    const node = nodeMap.get(id);
    if (node && !selected.has(id)) selected.set(id, node);
  };
  nodes
    .filter(node => node.kind === 'subject' || node.kind === 'topic')
    .forEach(node => addSelected(node.id));
  nodes
    .filter(node => !selected.has(node.id))
    .sort((a, b) => (degree.get(b.id) || 0) - (degree.get(a.id) || 0))
    .slice(0, 260)
    .forEach(node => addSelected(node.id));
  const selectedIds = new Set(selected.keys());
  const completeLinks = links
    .filter(link => selectedIds.has(link.source) && selectedIds.has(link.target))
    .slice(0, 900);
  const completeIds = new Set(completeLinks.flatMap(link => [link.source, link.target]));
  const completeNodes = [...selected.values()].filter(node => completeIds.has(node.id) || node.kind === 'subject');
  return { nodes: completeNodes, links: completeLinks };
}

function normalizeStemForCompare(text) {
  return String(text || '').replace(/\s+/g, '').toLowerCase();
}

async function sqlFindDuplicateQuestion(pool, q) {
  const compactStem = normalizeStemForCompare(q.question);
  const [rows] = await pool.query(
    `SELECT id FROM questions
     WHERE subject_code = ?
       AND (id = ? OR LOWER(REPLACE(REPLACE(REPLACE(question_text, ' ', ''), '\n', ''), '\r', '')) = ?)
     LIMIT 1`,
    [q.subject, q.id, compactStem]
  );
  return rows[0] || null;
}

async function addQuestionSql(q, { imported = false, skipDuplicate = true } = {}) {
  const pool = await ensureMysqlSchema();
  if (!pool) return null;
  const question = imported
    ? normalizeQuestion({
        ...q,
        imported: true,
        source: q.source || 'auto-import',
        meta: { ...(q.meta || {}), imported: true, source: q.source || 'auto-import' }
      }, q.subject)
    : normalizeQuestion(q, q.subject);
  const duplicate = skipDuplicate ? await sqlFindDuplicateQuestion(pool, question) : null;
  if (duplicate) return { ok: true, duplicate: true, id: duplicate.id };
  await ensureSqlSubjects(pool);
  await upsertSqlQuestion(pool, question, defaultMeta());
  await refreshSqlQuestionRevision(pool);
  return { ok: true, id: question.id, duplicate: false };
}

async function addImportedQuestionsSql(questions) {
  const pool = await ensureMysqlSchema();
  if (!pool) return null;
  const conn = await pool.getConnection();
  let imported = 0;
  try {
    await conn.beginTransaction();
    await ensureSqlSubjects(conn);
    for (const input of (Array.isArray(questions) ? questions : [])) {
      try {
        const q = normalizeQuestion({
          ...input,
          imported: true,
          source: input.source || 'auto-import',
          meta: { ...(input.meta || {}), imported: true, source: input.source || 'auto-import' }
        }, input.subject);
        const duplicate = await sqlFindDuplicateQuestion(conn, q);
        if (duplicate) continue;
        await upsertSqlQuestion(conn, q, defaultMeta());
        imported++;
      } catch (_) {}
    }
    if (imported) await refreshSqlQuestionRevision(conn);
    await conn.commit();
    return imported;
  } catch (error) {
    try { await conn.rollback(); } catch (_) {}
    throw error;
  } finally {
    conn.release();
  }
}

async function deleteImportedQuestionsSql(ids = [], all = false) {
  const pool = await ensureMysqlSchema();
  if (!pool) return null;
  const idSet = (Array.isArray(ids) ? ids : []).map(String).filter(Boolean);
  let result;
  if (all) {
    [result] = await pool.query('DELETE FROM questions WHERE is_imported = 1');
  } else if (idSet.length) {
    [result] = await pool.query(
      `DELETE FROM questions WHERE is_imported = 1 AND id IN (${idSet.map(() => '?').join(',')})`,
      idSet
    );
  } else {
    return 0;
  }
  const deleted = Number(result?.affectedRows || 0);
  if (deleted) await refreshSqlQuestionRevision(pool);
  return deleted;
}

async function autoClassifySqlQuestions(ai = {}, delayMs = 0) {
  const pool = await ensureMysqlSchema();
  if (!pool) return null;
  const [rows] = await pool.query('SELECT * FROM questions ORDER BY subject_code, id');
  let updated = 0;
  for (const row of rows) {
    const q = sqlQuestionRowToQuestion(row);
    if (Array.isArray(q.meta?.keywords) && q.meta.keywords.length) continue;
    q.meta = await classifyWithKimi(`${q.question} ${(q.options || []).join(' ')} ${q.explanation || ''}`, q.subject, ai);
    await upsertSqlQuestion(pool, q, defaultMeta());
    updated++;
    if (delayMs) await sleep(delayMs);
  }
  if (updated) await refreshSqlQuestionRevision(pool);
  return updated;
}


function generatedImportQuestions(subject, keyword = '', count = 18) {
  const meta = defaultMeta();
  const rules = meta.topicRules[subject] || [];
  const picked = rules.filter(pair => {
    const topic = pair[0];
    const words = pair[1] || [];
    return !keyword || topic.includes(keyword) || words.some(word => String(word).includes(keyword) || keyword.includes(String(word)));
  });
  const topics = (picked.length ? picked : rules).slice(0, 6);
  const stamp = Date.now().toString(36);
  const out = [];
  topics.forEach((pair, ti) => {
    const topic = pair[0];
    const words = pair[1] || [];
    for (let i = 0; i < Math.ceil(count / Math.max(1, topics.length)); i++) {
      const word = words[i % words.length] || topic;
      const isChoice = (i + ti) % 2 === 0;
      const id = 'auto-' + subject + '-' + stamp + '-' + ti + '-' + i;
      out.push({
        id, subject, difficulty: Math.max(2, Math.min(8, 3 + ((i + ti) % 5))), type: isChoice ? 'choice' : 'fill',
        question: isChoice ? (meta.subjects[subject].name + '\u4e2d\uff0c\u4e0e\u201c' + (keyword || topic) + '\u201d\u76f8\u5173\u7684' + topic + '\u9898\uff1a\u4e0b\u5217\u5173\u4e8e' + word + '\u7684\u8bf4\u6cd5\u54ea\u4e00\u9879\u66f4\u5408\u9002\uff1f') : (meta.subjects[subject].name + '\u4e2d\uff0c\u56f4\u7ed5\u201c' + (keyword || topic) + '\u201d\u7ed9\u51fa\u4e00\u4e2a' + topic + '\u8ba1\u7b97\u7ed3\u679c\uff0c\u7b54\u6848\u586b\u5165\u6700\u7b80\u5f62\u5f0f\u3002'),
        options: isChoice ? [word + '\u662f' + topic + '\u4e2d\u7684\u5e38\u89c1\u5173\u952e\u8bcd', word + '\u53ea\u5728\u7ebf\u6027\u4ee3\u6570\u4e2d\u51fa\u73b0', word + '\u4e0e\u672c\u9898\u578b\u65e0\u5173', word + '\u4e0d\u80fd\u7528\u4e8e\u8003\u7814\u6570\u5b66\u9898\u76ee'] : undefined,
        answer: isChoice ? 0 : String(topic),
        explanation: '\u81ea\u52a8\u5bfc\u5165\u5019\u9009\u9898\uff0c\u5173\u952e\u8bcd\uff1a' + (keyword || topic) + '\u3002\u5bfc\u5165\u540e\u5efa\u8bae\u4eba\u5de5\u590d\u6838\u9898\u5e72\u3001\u7b54\u6848\u548c\u89e3\u6790\u3002',
        imported: true, source: 'auto-import',
        meta: { imported: true, source: 'auto-import', type: isChoice ? '\u9009\u62e9\u9898' : '\u586b\u7a7a\u9898', knowledge_path: [meta.subjects[subject].name, topic], keywords: Array.from(new Set([keyword, topic, word].filter(Boolean))), difficulty: Math.max(2, Math.min(8, 3 + ((i + ti) % 5))), prerequisites: [] }
      });
    }
  });
  return out.slice(0, count).map(q => normalizeQuestion(q, subject));
}

async function autoImportCandidates(subject, keyword, ai = {}) {
  const config = loadAiConfig(ai);
  if (!config.apiKey) return generatedImportQuestions(subject, keyword);
  const meta = defaultMeta();
  const prompt = '\u8bf7\u4e3a\u8003\u7814\u6570\u5b66\u9898\u5e93\u751f\u6210\u4e0d\u8d85\u8fc7 18 \u9053\u5019\u9009\u9898\uff0c\u79d1\u76ee\u4e3a ' + (meta.subjects[subject]?.name || subject) + '\uff0c\u5173\u952e\u8bcd\u4e3a ' + (keyword || '\u5178\u578b\u9898') + '\u3002\u53ea\u8f93\u51fa JSON\uff0c\u683c\u5f0f\u4e3a {"questions":[{"question":"","type":"choice/fill","options":[],"answer":"","explanation":"","difficulty":5,"meta":{"type":"","knowledge_path":[],"keywords":[]}}]}\u3002\u9898\u76ee\u4e4b\u95f4\u4e0d\u8981\u91cd\u590d\uff0c\u9898\u5e72\u8981\u77ed\u3002';
  try {
    const parsed = await callAiJson(prompt, ai, { temperature: 0.2, maxTokens: 2200 }) || {};
    const arr = Array.isArray(parsed.questions) ? parsed.questions : [];
    const stamp = Date.now().toString(36);
    return arr.map((q, index) => normalizeQuestion({ ...q, id: 'auto-' + subject + '-' + stamp + '-' + index, subject, imported: true, source: 'auto-import', meta: { ...(q.meta || {}), imported: true, source: 'auto-import' } }, subject)).slice(0, 24);
  } catch (_) { return generatedImportQuestions(subject, keyword); }
}

function addImportedQuestions(questions) {
  const data = loadQuestions();
  const existing = new Set(data.questions.map(q => `${q.subject}::${normalizeStemForCompare(q.question)}`));
  let imported = 0;
  (Array.isArray(questions) ? questions : []).forEach(input => {
    try {
      const q = normalizeQuestion({
        ...input,
        imported: true,
        source: input.source || 'auto-import',
        meta: { ...(input.meta || {}), imported: true, source: input.source || 'auto-import' }
      }, input.subject);
      const key = `${q.subject}::${normalizeStemForCompare(q.question)}`;
      if (existing.has(key)) return;
      existing.add(key);
      data.questions.push(q);
      imported++;
    } catch (_) {}
  });
  if (imported) saveQuestions(data);
  return imported;
}

function deleteImportedQuestions(ids = [], all = false) {
  const data = loadQuestions();
  const idSet = new Set(ids.map(String));
  const before = data.questions.length;
  data.questions = data.questions.filter(q => {
    const isCustom = q.imported || q.source === 'auto-import' || q.source === 'manual-import' || q.source === 'manual-add' || q.meta?.imported || q.meta?.source;
    if (!isCustom) return true;
    return all ? false : !idSet.has(q.id);
  });
  const deleted = before - data.questions.length;
  if (deleted) saveQuestions(data);
  return deleted;
}

function adminHtml() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FocusMath 鍚庡彴</title>
<style>
body{margin:0;background:#f8fafc;color:#1e293b;font-family:"Noto Sans SC","Source Han Sans SC","Noto Sans",sans-serif}
main{max-width:1180px;margin:0 auto;padding:24px}
header{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:20px}
h1{margin:0;font-size:28px}button,a.button{border:0;border-radius:12px;padding:10px 14px;background:#1B6B93;color:white;font-weight:800;cursor:pointer;text-decoration:none}
.cards{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:18px}
.card,.panel{background:white;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 8px 24px rgba(15,23,42,.06)}
.card{padding:16px}.card b{display:block;font-size:26px;margin-top:6px}.card span{font-size:12px;color:#64748b;font-weight:800}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.panel{padding:16px;min-width:0}
.bars{display:grid;gap:10px}.bar{display:grid;grid-template-columns:110px 1fr 48px;gap:10px;align-items:center;font-size:13px;font-weight:700}
.fill{height:12px;border-radius:999px;background:#e2e8f0;overflow:hidden}.fill i{display:block;height:100%;background:linear-gradient(90deg,#1B6B93,#4FCCA3)}
table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:10px;border-bottom:1px solid #e2e8f0;text-align:left;vertical-align:top}th{color:#64748b}
code{white-space:pre-wrap;word-break:break-word}
@media(max-width:760px){main{padding:14px}.cards{grid-template-columns:1fr 1fr}.grid{grid-template-columns:1fr}header{align-items:flex-start;flex-direction:column}}
</style>
</head>
<body>
<main>
<header><div><h1>FocusMath 鍚庡彴</h1><p>璁块棶銆佺瓟棰樺拰缁冧範瀹屾垚鏁版嵁</p></div><div><a class="button" href="/">鎵撳紑缃戠珯</a> <button id="refresh">鍒锋柊</button> <button id="clear">娓呯┖鏁版嵁</button></div></header>
<section class="cards" id="cards"></section>
<section class="grid">
<div class="panel"><h3>浜嬩欢绫诲瀷</h3><div class="bars" id="typeBars"></div></div>
<div class="panel"><h3>绉戠洰鍒嗗竷</h3><div class="bars" id="subjectBars"></div></div>
</section>
<section class="panel" style="margin-top:16px"><h3>棰樼洰鍋氳繃娆℃暟</h3><table><thead><tr><th>棰樼洰</th><th>娆℃暟</th></tr></thead><tbody id="attemptRows"></tbody></table></section>
<section class="panel" style="margin-top:16px"><h3>鏈€杩戜簨浠?/h3><table><thead><tr><th>鏃堕棿</th><th>绫诲瀷</th><th>鐢ㄦ埛</th><th>鍐呭</th></tr></thead><tbody id="rows"></tbody></table></section>
</main>
<script>
async function load(){
 const res=await fetch('/api/events?limit=1000'); const data=await res.json(); const s=data.summary; const events=data.events.slice(-100).reverse();
 cards.innerHTML=[['鎬讳簨浠?,s.total],['鐢ㄦ埛鏁?,s.clients],['绛旈鏁?,s.answers],['绛斿',s.correct],['姝ｇ‘鐜?,s.accuracy+'%']].map(x=>'<div class="card"><span>'+x[0]+'</span><b>'+x[1]+'</b></div>').join('');
 bars(typeBars,s.byType); bars(subjectBars,s.bySubject);
 attemptRows.innerHTML=Object.entries(s.questionAttempts||{}).sort((a,b)=>b[1]-a[1]).slice(0,80).map(([k,v])=>'<tr><td>'+esc(k)+'</td><td><b>'+v+'</b></td></tr>').join('')||'<tr><td colspan="2">鏆傛棤绛旈璁板綍</td></tr>';
 rows.innerHTML=events.map(e=>'<tr><td>'+esc(e.at)+'</td><td>'+esc(e.type)+'</td><td>'+esc(e.clientId)+'</td><td><code>'+esc(JSON.stringify(e.payload,null,2))+'</code></td></tr>').join('');
}
function bars(el,obj){const max=Math.max(1,...Object.values(obj));el.innerHTML=Object.entries(obj).sort((a,b)=>b[1]-a[1]).map(([k,v])=>'<div class="bar"><span>'+esc(k)+'</span><div class="fill"><i style="width:'+Math.round(v/max*100)+'%"></i></div><b>'+v+'</b></div>').join('')||'<p>鏆傛棤鏁版嵁</p>'}
function esc(v){return String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
refresh.onclick=load; clear.onclick=async()=>{if(confirm('纭畾娓呯┖浜嬩欢鏁版嵁锛?)){await fetch('/api/events',{method:'DELETE'});load();}}; load();
</script>
</body></html>`;
}

// ===== 资源检索：真实抓取各平台搜索结果 =====
// 中文数学术语 → 英文（英语平台用英文关键词）
const RADAR_MATH_TERM_EN = {
  '极限': 'limits', '导数': 'derivatives', '微分': 'differential', '积分': 'integral',
  '不定积分': 'indefinite integral', '定积分': 'definite integral', '多元函数': 'multivariable functions',
  '偏导数': 'partial derivatives', '梯度': 'gradient', '方向导数': 'directional derivative',
  '泰勒级数': 'Taylor series', '麦克劳林级数': 'Maclaurin series', '幂级数': 'power series',
  '傅里叶级数': 'Fourier series', '微分方程': 'differential equation', '矩阵': 'matrix',
  '行列式': 'determinant', '特征值': 'eigenvalue', '特征向量': 'eigenvector', '线性变换': 'linear transformation',
  '向量空间': 'vector space', '概率': 'probability', '概率论': 'probability theory',
  '随机变量': 'random variable', '期望': 'expected value', '方差': 'variance', '正态分布': 'normal distribution',
  '连续性': 'continuity', '间断点': 'discontinuity', '中值定理': 'mean value theorem',
  '罗尔定理': 'Rolle theorem', '柯西定理': 'Cauchy theorem', '洛必达法则': 'L Hopital rule',
  '分部积分': 'integration by parts', '换元积分': 'integration by substitution',
  '二重积分': 'double integral', '三重积分': 'triple integral', '曲线积分': 'line integral',
  '曲面积分': 'surface integral', '格林公式': 'Green theorem', '高斯公式': 'divergence theorem',
  '斯托克斯公式': 'Stokes theorem', '级数': 'series', '收敛': 'convergence', '发散': 'divergence',
  '向量': 'vector', '线性无关': 'linear independence', '正交': 'orthogonal', '对角化': 'diagonalization',
  '二次型': 'quadratic form', '概率密度': 'probability density', '大数定律': 'law of large numbers',
  '中心极限定理': 'central limit theorem', '假设检验': 'hypothesis testing', '参数估计': 'parameter estimation'
};
function radarTranslateQueryToEnglish(query) {
  if (!query) return query;
  let result = query;
  if (RADAR_MATH_TERM_EN[query.trim()]) return RADAR_MATH_TERM_EN[query.trim()];
  const sorted = Object.keys(RADAR_MATH_TERM_EN).sort((a, b) => b.length - a.length);
  for (const zh of sorted) {
    if (result.includes(zh)) result = result.replace(new RegExp(zh, 'g'), RADAR_MATH_TERM_EN[zh]);
  }
  return result;
}
// 清理搜索词：只保留文字和空格，去除连线符等无关符号
function radarCleanQuery(q) {
  return (q || '').replace(/[-_–—|/\\{}[\]()<>!@#$%^&*=+~`"'；;：:，,。.!？?、\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim();
}
// 抓取 URL 内容
function radarFetchUrl(targetUrl, options) {
  options = options || {};
  return new Promise((resolve, reject) => {
    const req = https.get(targetUrl, {
      headers: Object.assign({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/json,*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }, options.headers || {}),
      timeout: 8000
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return resolve(radarFetchUrl(response.headers.location, options));
      }
      let data = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { data += chunk; });
      response.on('end', () => resolve(data));
      response.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}
// B 站搜索：通过 Bing site:bilibili.com 搜索具体视频
async function radarSearchBilibili(query) {
  // B 站官方 API 需要 wbi 签名，改用 Bing 搜索
  return radarSearchDuckDuckGo(query, 'bilibili.com', 'bilibili', 'video');
}
// 通用 Bing HTML 搜索：返回 site: 限定下的具体页面
async function radarSearchDuckDuckGo(query, siteFilter, platform, type) {
  // 先清理用户查询词，再附加 site: 过滤
  let q = radarCleanQuery(query);
  if (siteFilter) q = `${q} site:${siteFilter}`;
  const kw = encodeURIComponent(q);
  const searchUrl = `https://cn.bing.com/search?q=${kw}&setlang=zh-CN`;
  try {
    const html = await radarFetchUrl(searchUrl);
    const results = [];
    // 按 <li class="b_algo"> 分割结果块
    const blocks = html.split(/<li class="b_algo"/);
    for (let i = 1; i < blocks.length && results.length < 3; i++) {
      const block = blocks[i];
      // 提取真实内容链接
      const linkMatch = block.match(/href="(https?:\/\/[^"]+)"/);
      if (!linkMatch) continue;
      const link = linkMatch[1];
      // 跳过 bing/microsoft/css/js 资源链接
      if (/bing\.com|microsoft\.com|r\.bing|\/rs\//.test(link)) continue;
      if (/\.(css|js|png|jpg|svg|ico|woff)/.test(link)) continue;
      // 跳过各平台的"搜索页"URL，只保留具体内容页
      try {
        const uLink = new URL(link);
        const pathLower = (uLink.pathname || '').toLowerCase();
        const searchPagePatterns = ['/search', '/so/search', '/search?', '/all?keyword', '/search_results'];
        if (searchPagePatterns.some(p => pathLower.includes(p))) continue;
        // 查询参数为搜索词的也跳过（如 ?q= ?keyword= ?query= ?page_search_query=）
        const sp = uLink.searchParams || new URLSearchParams(uLink.search);
        if (sp.get('q') || sp.get('keyword') || sp.get('query') || sp.get('page_search_query')) continue;
      } catch (e) { continue; }
      // 提取标题：<h2> 内的文字
      const titleMatch = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
      let title = '';
      if (titleMatch) title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
      if (!title || title.length < 3) {
        const pMatch = block.match(/<p class="b_lineclamp[12]"[^>]*>([\s\S]*?)<\/p>/);
        if (pMatch) title = pMatch[1].replace(/<[^>]+>/g, '').trim();
      }
      if (!link || !title) continue;
      // 确保 URL 属于目标站点（Bing site: 过滤不可靠，客户端再过滤一次）
      if (siteFilter) {
        try {
          const u = new URL(link);
          if (!u.hostname.includes(siteFilter.replace(/^www\./, ''))) continue;
        } catch (e) { continue; }
      }
      results.push({
        title: title,
        url: link,
        platform: platform,
        type: type || 'article',
        difficulty: 5,
        duration: 15,
        topics: [query],
        quality: 0.6,
        adRisk: 0.1
      });
    }
    return results;
  } catch (e) { return []; }
}
// 真实资源搜索主函数
async function searchResourcesReal(body) {
  const query = body.query || '';
  const platforms = body.platforms || [];
  const customPlatform = body.customPlatform || '';
  const isEnglishPlatform = (p) => p === 'mitocw' || p === 'khan';
  const allResults = [];
  const tasks = [];
  for (const p of platforms) {
    const useQuery = isEnglishPlatform(p) ? radarTranslateQueryToEnglish(query) : query;
    if (p === 'bilibili') {
      tasks.push(radarSearchBilibili(useQuery).then(r => allResults.push(...r)));
    } else if (p === 'zhihu') {
      tasks.push(radarSearchDuckDuckGo(useQuery, 'zhihu.com', 'zhihu', 'article').then(r => allResults.push(...r)));
    } else if (p === 'blog') {
      tasks.push(radarSearchDuckDuckGo(useQuery, 'csdn.net', 'blog', 'notes').then(r => allResults.push(...r)));
    } else if (p === 'mitocw') {
      tasks.push(radarSearchDuckDuckGo(useQuery, 'ocw.mit.edu', 'mitocw', 'lecture').then(r => allResults.push(...r)));
    } else if (p === 'khan') {
      tasks.push(radarSearchDuckDuckGo(useQuery, 'khanacademy.org', 'khan', 'video').then(r => allResults.push(...r)));
    } else if (p === 'notes') {
      tasks.push(radarSearchDuckDuckGo(useQuery, 'geogebra.org', 'notes', 'interactive').then(r => allResults.push(...r)));
    } else if (p === 'custom' && customPlatform) {
      tasks.push(radarSearchDuckDuckGo(query, customPlatform, 'custom', 'article').then(r => allResults.push(...r)));
    }
  }
  await Promise.all(tasks);
  return allResults;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return send(res, 204, '');

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'POST' && url.pathname === '/api/auth/magic-link') {
      const body = JSON.parse(await readBody(req) || '{}');
      const email = normalizeEmail(body.email);
      if (!isValidEmail(email)) return send(res, 400, JSON.stringify({ ok: false, error: 'invalid email' }));
      const data = loadIdentity();
      pruneMagicLinks(data);
      const token = randomToken(32);
      const link = buildMagicLink(body.redirectBase || `${publicBaseFromRequest(req)}/focusmath.html`, token);
      const eHash = hmacEmail(email);
      const hint = emailHint(email);
      ensureIdentityUser(data, eHash, hint);
      data.magicLinks.push({
        tokenHash: hashToken(token),
        emailHash: eHash,
        emailHint: hint,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        ip: req.socket.remoteAddress
      });
      saveIdentity(data);
      const mail = await sendMagicEmail(email, link);
      return send(res, 200, JSON.stringify({ ok: true, sent: !!mail.sent, devMagicLink: mail.devLink || undefined }));
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/verify') {
      const body = JSON.parse(await readBody(req) || '{}');
      const tokenHash = hashToken(body.token);
      const data = loadIdentity();
      const now = Date.now();
      const record = (data.magicLinks || []).find(item => item.tokenHash === tokenHash && !item.usedAt && Date.parse(item.expiresAt || 0) >= now);
      if (!record) return send(res, 400, JSON.stringify({ ok: false, error: 'invalid token' }));
      record.usedAt = new Date().toISOString();
      const user = ensureIdentityUser(data, record.emailHash, record.emailHint);
      const authToken = randomToken(32);
      user.authTokens.push({ hash: hashToken(authToken), createdAt: new Date().toISOString(), lastUsedAt: new Date().toISOString() });
      pruneAuthTokens(user);
      saveIdentity(data);
      return send(res, 200, JSON.stringify({ ok: true, authToken, emailHint: user.emailHint }));
    }

    if (req.method === 'GET' && url.pathname === '/api/save/list') {
      const auth = authenticate(req);
      if (!auth) return send(res, 401, JSON.stringify({ ok: false, error: 'unauthorized' }));
      return send(res, 200, JSON.stringify({ ok: true, saves: listCloudSavesForUser(auth.user) }));
    }

    if (req.method === 'POST' && url.pathname === '/api/save/upload') {
      const auth = authenticate(req);
      if (!auth) return send(res, 401, JSON.stringify({ ok: false, error: 'unauthorized' }));
      const body = JSON.parse(await readBody(req) || '{}');
      const pack = body.package;
      if (!pack || typeof pack !== 'object' || !pack.ciphertext || !pack.salt || !pack.iv) {
        return send(res, 400, JSON.stringify({ ok: false, error: 'invalid package' }));
      }
      const save = {
        id: crypto.randomUUID(),
        saveName: String(body.saveName || 'FocusMath').slice(0, 80),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dataHash: String(body.dataHash || pack.plainHash || ''),
        dataSummary: body.dataSummary && typeof body.dataSummary === 'object' ? body.dataSummary : {},
        package: pack
      };
      auth.user.cloudSaves = Array.isArray(auth.user.cloudSaves) ? auth.user.cloudSaves : [];
      auth.user.cloudSaves.push(save);
      auth.user.cloudSaves = auth.user.cloudSaves.slice(-20);
      saveIdentity(auth.data);
      return send(res, 200, JSON.stringify({ ok: true, id: save.id, saves: listCloudSavesForUser(auth.user) }));
    }

    if (req.method === 'GET' && url.pathname === '/api/save/download') {
      const auth = authenticate(req);
      if (!auth) return send(res, 401, JSON.stringify({ ok: false, error: 'unauthorized' }));
      const id = String(url.searchParams.get('id') || '');
      const save = (auth.user.cloudSaves || []).find(item => item.id === id);
      if (!save) return send(res, 404, JSON.stringify({ ok: false, error: 'save not found' }));
      return send(res, 200, JSON.stringify({ ok: true, save: listCloudSavesForUser(auth.user).find(item => item.id === id), package: save.package }));
    }

    if (req.method === 'POST' && url.pathname === '/api/save/delete') {
      const auth = authenticate(req);
      if (!auth) return send(res, 401, JSON.stringify({ ok: false, error: 'unauthorized' }));
      const body = JSON.parse(await readBody(req) || '{}');
      const id = String(body.id || '');
      const before = (auth.user.cloudSaves || []).length;
      auth.user.cloudSaves = (auth.user.cloudSaves || []).filter(item => item.id !== id);
      saveIdentity(auth.data);
      return send(res, 200, JSON.stringify({ ok: true, deleted: before - auth.user.cloudSaves.length }));
    }

    if (req.method === 'GET' && url.pathname === '/api/questions') {
      const sqlPayload = await questionIndexPayloadSql();
      if (sqlPayload) {
        const db = loadQuestions();
        const payload = compatibilityPayload(db);
        return send(res, 200, JSON.stringify({ ok: true, data: payload }));
      }
      return send(res, 200, JSON.stringify({ ok: true, data: compatibilityPayload(loadQuestions()) }));
    }

    if (req.method === 'GET' && url.pathname === '/api/question-meta') {
      const data = await questionMetaPayloadSql() || compatibilityPayload(loadQuestions());
      return send(res, 200, JSON.stringify({
        ok: true,
        meta: data.meta,
        subjectNames: data.subjectNames,
        subjectColors: data.subjectColors,
        topicRules: data.topicRules,
        counts: data.counts || Object.fromEntries(Object.keys(data.meta.subjects).map(subject => [subject, (data.questions || []).filter(q => q.subject === subject).length]))
      }));
    }

    if (req.method === 'GET' && url.pathname === '/api/question-index') {
      return send(res, 200, JSON.stringify(await questionIndexPayloadSql() || questionIndexPayload(loadQuestions())));
    }

    if (req.method === 'POST' && url.pathname === '/api/question-page') {
      const body = JSON.parse(await readBody(req) || '{}');
      const sqlPayload = await questionPagePayloadSql({
        subject: String(body.subject || 'calculus'),
        search: String(body.search || ''),
        filters: body.filters || [],
        page: Number(body.page || 1),
        pageSize: Number(body.pageSize || 30),
        preload: Number(body.preload ?? 5),
        attempts: body.attempts || {}
      });
      const payload = sqlPayload || questionPagePayload({
        subject: String(body.subject || 'calculus'),
        search: String(body.search || ''),
        filters: body.filters || [],
        page: Number(body.page || 1),
        pageSize: Number(body.pageSize || 30),
        preload: Number(body.preload ?? 5),
        attempts: body.attempts || {}
      });
      return send(res, 200, JSON.stringify(payload));
    }

    if (req.method === 'POST' && url.pathname === '/api/question-search') {
      const body = JSON.parse(await readBody(req) || '{}');
      const payload = await questionSearchPayloadSql(body) || questionPagePayload({
        subject: String(body.subject || 'calculus'),
        search: String(body.search || body.query || ''),
        filters: body.filters || [],
        page: Number(body.page || 1),
        pageSize: Number(body.pageSize || 30),
        preload: Number(body.preload ?? 0),
        attempts: body.attempts || {}
      });
      return send(res, 200, JSON.stringify(payload));
    }

    if (req.method === 'GET' && url.pathname.startsWith('/api/questions/')) {
      const subject = url.pathname.split('/').pop();
      const sqlPayload = await questionListPayloadSql(subject);
      if (sqlPayload) {
        if (!sqlPayload.ok) return send(res, sqlPayload.status || 400, JSON.stringify({ ok: false, error: sqlPayload.error }));
        return send(res, 200, JSON.stringify(sqlPayload));
      }
      const data = loadQuestions();
      const questions = data.questions.filter(q => q.subject === subject);
      if (!questions.length && !data.meta.subjects[subject]) {
        return send(res, 404, JSON.stringify({ ok: false, error: 'subject not found' }));
      }
      return send(res, 200, JSON.stringify({ ok: true, subject, questions }));
    }

    if (req.method === 'GET' && url.pathname === '/api/ai-config') {
      const config = loadAiConfig();
      return send(res, 200, JSON.stringify({ ok: true, config: { provider: config.provider, baseUrl: config.baseUrl, model: config.model, hasKey: !!config.apiKey } }));
    }

    if (req.method === 'POST' && url.pathname === '/api/ai-config') {
      const body = JSON.parse(await readBody(req) || '{}');
      const config = saveAiConfig(body);
      return send(res, 200, JSON.stringify({ ok: true, config: { provider: config.provider, baseUrl: config.baseUrl, model: config.model, hasKey: !!config.apiKey } }));
    }

    if (req.method === 'POST' && url.pathname === '/api/ai-guide') {
      try {
        const body = JSON.parse(await readBody(req) || '{}');
        if (body.ai) saveAiConfig(body.ai);
        const result = await aiGuide(body);
        return send(res, 200, JSON.stringify({ ok: true, hint: result.hint, source: result.source }));
      } catch (error) {
        return send(res, 500, JSON.stringify({ ok: false, error: error.message }));
      }
    }

    if (req.method === 'POST' && url.pathname === '/api/questions') {
      try {
        const input = JSON.parse(await readBody(req) || '{}');
        const q = normalizeQuestion(input, input.subject);
        const sqlResult = await addQuestionSql(q, { skipDuplicate: true });
        if (sqlResult) return send(res, 200, JSON.stringify(sqlResult));
        const data = loadQuestions();
        const sameId = data.questions.find(item => item.id === q.id);
        const sameStem = data.questions.find(item => item.subject === q.subject && item.question.replace(/\s+/g, '') === q.question.replace(/\s+/g, ''));
        if (sameId || sameStem) {
          return send(res, 200, JSON.stringify({ ok: true, id: sameId?.id || sameStem?.id, duplicate: true }));
        }
        data.questions.push(q);
        saveQuestions(data);
        await syncSqlAfterJsonWrite();
        return send(res, 200, JSON.stringify({ ok: true, id: q.id }));
      } catch (error) {
        return send(res, 400, JSON.stringify({ ok: false, error: error.message }));
      }
    }

    if (req.method === 'POST' && url.pathname === '/api/questions/import') {
      try {
        const body = JSON.parse(await readBody(req) || '{}');
        const importedSql = await addImportedQuestionsSql(body.questions || []);
        if (importedSql !== null) return send(res, 200, JSON.stringify({ ok: true, imported: importedSql, source: 'sql' }));
        const imported = addImportedQuestions(body.questions || []);
        await syncSqlAfterJsonWrite();
        return send(res, 200, JSON.stringify({ ok: true, imported }));
      } catch (error) {
        return send(res, 400, JSON.stringify({ ok: false, error: error.message }));
      }
    }

    if (req.method === 'POST' && url.pathname === '/api/questions/auto-classify') {
      try {
        const body = JSON.parse(await readBody(req) || '{}');
        if (body.ai) saveAiConfig(body.ai);
        const updatedSql = await autoClassifySqlQuestions(body.ai || {}, 0);
        if (updatedSql !== null) return send(res, 200, JSON.stringify({ ok: true, updated: updatedSql, source: 'sql' }));
        const data = loadQuestions();
        let updated = 0;
        for (const q of data.questions) {
          if (Array.isArray(q.meta?.keywords) && q.meta.keywords.length) continue;
          q.meta = await classifyWithKimi(`${q.question} ${(q.options || []).join(' ')} ${q.explanation || ''}`, q.subject, body.ai || {});
          updated++;
        }
        saveQuestions(data);
        await syncSqlAfterJsonWrite();
        return send(res, 200, JSON.stringify({ ok: true, updated }));
      } catch (error) {
        return send(res, 500, JSON.stringify({ ok: false, error: error.message }));
      }
    }

    if (req.method === 'POST' && url.pathname === '/api/classify') {
      try {
        const body = JSON.parse(await readBody(req) || '{}');
        const text = String(body.text || body.question || '').trim();
        if (!text) return send(res, 400, JSON.stringify({ ok: false, error: 'text is required' }));
        const result = await classifyWithKimi(text, body.subject || 'calculus', body.ai || {});
        return send(res, 200, JSON.stringify({ ok: true, result }));
      } catch (error) {
        return send(res, 500, JSON.stringify({ ok: false, error: error.message }));
      }
    }

    if (req.method === 'POST' && url.pathname === '/api/auto-tag') {
      try {
        const body = JSON.parse(await readBody(req) || '{}');
        if (body.ai) saveAiConfig(body.ai);
        const updatedSql = await autoClassifySqlQuestions(body.ai || {}, 200);
        if (updatedSql !== null) return send(res, 200, JSON.stringify({ ok: true, updated: updatedSql, source: 'sql' }));
        const data = loadQuestions();
        let updated = 0;
        for (const q of data.questions) {
          if (Array.isArray(q.meta?.keywords) && q.meta.keywords.length) continue;
          q.meta = await classifyWithKimi(`${q.question} ${(q.options || []).join(' ')} ${q.explanation || ''}`, q.subject, body.ai || {});
          updated++;
          await sleep(200);
        }
        saveQuestions(data);
        await syncSqlAfterJsonWrite();
        return send(res, 200, JSON.stringify({ ok: true, updated }));
      } catch (error) {
        return send(res, 500, JSON.stringify({ ok: false, error: error.message }));
      }
    }

    if (req.method === 'POST' && url.pathname === '/api/auto-import/search') {
      try {
        const body = JSON.parse(await readBody(req) || '{}');
        const subject = String(body.subject || 'calculus');
        const keyword = String(body.keyword || '').trim();
        const questions = await autoImportCandidates(subject, keyword, body.ai || {});
        return send(res, 200, JSON.stringify({ ok: true, questions }));
      } catch (error) {
        return send(res, 500, JSON.stringify({ ok: false, error: error.message }));
      }
    }

    // 资源检索接口：真实抓取各平台搜索结果，返回具体内容链接（非搜索页）
    if (req.method === 'POST' && url.pathname === '/api/resources/search') {
      try {
        const body = JSON.parse(await readBody(req) || '{}');
        const results = await searchResourcesReal(body);
        return send(res, 200, JSON.stringify({ ok: true, results }));
      } catch (error) {
        return send(res, 500, JSON.stringify({ ok: false, error: error.message }));
      }
    }

    if (req.method === 'POST' && url.pathname === '/api/imported-questions') {
      try {
        const body = JSON.parse(await readBody(req) || '{}');
        const importedSql = await addImportedQuestionsSql(body.questions || []);
        if (importedSql !== null) return send(res, 200, JSON.stringify({ ok: true, imported: importedSql, source: 'sql' }));
        const imported = addImportedQuestions(body.questions || []);
        await syncSqlAfterJsonWrite();
        return send(res, 200, JSON.stringify({ ok: true, imported }));
      } catch (error) {
        return send(res, 400, JSON.stringify({ ok: false, error: error.message }));
      }
    }

    if (req.method === 'DELETE' && url.pathname === '/api/imported-questions') {
      try {
        const all = url.searchParams.get('all') === '1';
        const rawBody = all ? '' : await readBody(req);
        const body = rawBody ? JSON.parse(rawBody) : {};
        const queryIds = url.searchParams.get('ids') ? url.searchParams.get('ids').split(',').filter(Boolean) : [];
        const deletedSql = await deleteImportedQuestionsSql(body.ids || queryIds, all);
        if (deletedSql !== null) return send(res, 200, JSON.stringify({ ok: true, deleted: deletedSql, source: 'sql' }));
        const deleted = deleteImportedQuestions(body.ids || queryIds, all);
        await syncSqlAfterJsonWrite();
        return send(res, 200, JSON.stringify({ ok: true, deleted }));
      } catch (error) {
        return send(res, 400, JSON.stringify({ ok: false, error: error.message }));
      }
    }

    if (req.method === 'GET' && url.pathname === '/api/graph') {
      const bank = await questionsPayloadSql() || loadQuestions();
      const all = url.searchParams.get('all') === '1';
      const attemptsParam = url.searchParams.get('attempts');
      let attemptKeys = [];
      try {
        attemptKeys = attemptsParam ? Object.keys(JSON.parse(attemptsParam)) : [];
      } catch (_) {}
      const revisionSeed = `${bank.source || 'json'}:${bank.meta?.version || ''}:${bank.questions.length}:${bank.questions.at(-1)?.id || ''}:${attemptKeys.length}:${all}`;
      let data;
      if (graphCache?.revisionSeed === revisionSeed) {
        data = graphCache.data;
      } else {
        let pool = bank.questions;
        if (!all && attemptKeys.length) {
          const keySet = new Set(attemptKeys);
          pool = bank.questions.filter(q => keySet.has(questionKeyServer(q)) || keySet.has(`${q.subject}::${q.id}`));
        }
        data = graphData(pool);
      }
      graphCache = { revisionSeed, data };
      return send(res, 200, JSON.stringify({ ok: true, ...data }));
    }

    if (req.method === 'POST' && req.url === '/api/event') {
      const event = safeEvent(await readBody(req), req);
      fs.appendFileSync(eventsFile, `${JSON.stringify(event)}\n`, 'utf8');
      return send(res, 200, JSON.stringify({ ok: true, id: event.id }));
    }

    if (req.method === 'GET' && url.pathname === '/api/events') {
      const limit = Math.max(1, Math.min(5000, Number(url.searchParams.get('limit') || 500)));
      const events = readEvents(limit);
      return send(res, 200, JSON.stringify({ events, summary: eventSummary(events) }));
    }

    if (req.method === 'DELETE' && url.pathname === '/api/events') {
      fs.writeFileSync(eventsFile, '', 'utf8');
      return send(res, 200, JSON.stringify({ ok: true }));
    }

    if (req.method === 'GET' && url.pathname === '/api/sql/status') {
      const pool = await ensureMysqlSchema();
      if (!pool) return send(res, 200, JSON.stringify({ ok: true, enabled: mysqlEnabled(), available: false }));
      const revision = await getSqlMeta(pool, 'questions_revision');
      const count = await getSqlMeta(pool, 'questions_count');
      return send(res, 200, JSON.stringify({ ok: true, enabled: true, available: true, revision, count: Number(count || 0) }));
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/migrate-sql') {
      try {
        const body = JSON.parse(await readBody(req) || '{}');
        const result = await syncQuestionsToSql({ force: body.force !== false });
        return send(res, 200, JSON.stringify(result));
      } catch (error) {
        return send(res, 500, JSON.stringify({ ok: false, error: error.message }));
      }
    }

    if (req.method === 'GET' && url.pathname === '/admin') {
      return send(res, 200, adminHtml(), 'text/html; charset=utf-8');
    }

    // 资源检索辅助函数已移至模块顶部

    const urlPath = decodeURIComponent(url.pathname);
    const filePath = urlPath === '/' ? path.join(root, 'focusmath.html') : path.join(root, urlPath);
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(root)) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
    if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');

    const ext = path.extname(resolved).toLowerCase();
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml'
    };
    send(res, 200, fs.readFileSync(resolved), types[ext] || 'application/octet-stream');
  } catch (error) {
    send(res, 500, JSON.stringify({ ok: false, error: error.message }));
  }
});

if (process.argv.includes('--migrate-sql')) {
  syncQuestionsToSql({ force: true })
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.ok ? 0 : 1);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
} else {
  if (String(process.env.MYSQL_AUTO_MIGRATE || '').toLowerCase() === '1') {
    syncQuestionsToSql({ force: false }).catch(error => console.warn('SQL migration skipped:', error.message));
  }
  server.listen(port, () => {
    console.log(`FocusMath server: http://localhost:${port}`);
    console.log(`Events: ${eventsFile}`);
  });
}
