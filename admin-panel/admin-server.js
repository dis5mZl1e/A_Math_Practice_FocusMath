// FocusMath 后端管理服务器（独立可运行）
// 无第三方依赖，仅使用 Node.js 内置模块
// 启动：node admin-server.js
// 访问：http://localhost:3001/

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3001);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const PUBLIC_DIR = path.join(ROOT, 'public');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

// ==================== 工具函数 ====================

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
      if (body.length > 1024 * 1024 * 5) { reject(new Error('payload too large')); req.destroy(); }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function loadJson(file, fallback) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) { console.error('loadJson error:', file, e.message); }
  return fallback;
}

function saveJson(file, data) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// 简单认证：管理后台访问令牌（首次启动自动生成）
function getAdminToken() {
  const settings = loadJson(SETTINGS_FILE, {});
  if (settings.adminToken) return settings.adminToken;
  settings.adminToken = crypto.randomBytes(16).toString('hex');
  saveJson(SETTINGS_FILE, settings);
  return settings.adminToken;
}

function checkAuth(req) {
  const auth = req.headers.authorization || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  return match[1] === getAdminToken();
}

// ==================== 数据模型 ====================

// 用户：{ id, username, email, role, status, createdAt, lastLoginAt, notes }
function loadUsers() { return loadJson(USERS_FILE, []); }
function saveUsers(u) { saveJson(USERS_FILE, u); }

// 评论：{ id, userId, userName, targetType, targetId, content, status, createdAt, reply }
function loadComments() { return loadJson(COMMENTS_FILE, []); }
function saveComments(c) { saveJson(COMMENTS_FILE, c); }

// 题库（本地模式）：{ meta, questions: [] }
function loadLocalQuestions() {
  return loadJson(QUESTIONS_FILE, {
    meta: { version: '1.0', subjects: { calculus: '高等数学', linear: '线性代数', probability: '概率统计' } },
    questions: []
  });
}
function saveLocalQuestions(data) { saveJson(QUESTIONS_FILE, data); }

// 设置：{ focusmathApi, adminToken }
function loadSettings() { return loadJson(SETTINGS_FILE, {}); }
function saveSettings(s) { saveJson(SETTINGS_FILE, s); }

// ==================== 题库代理（对接 FocusMath 后端） ====================

async function proxyToFocusMath(pathname, options = {}) {
  const settings = loadSettings();
  const base = (settings.focusmathApi || '').replace(/\/+$/, '');
  if (!base) return null;
  const url = base + pathname;
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? require('https') : http;
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    const req = lib.request(reqOptions, (resp) => {
      let data = '';
      resp.on('data', c => data += c);
      resp.on('end', () => {
        try { resolve({ ok: resp.statusCode >= 200 && resp.statusCode < 300, status: resp.statusCode, data: JSON.parse(data) }); }
        catch (e) { resolve({ ok: false, status: resp.statusCode, data: null, raw: data }); }
      });
    });
    req.on('error', (e) => resolve({ ok: false, error: e.message }));
    req.setTimeout(8000, () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
    if (options.body) req.write(options.body);
    req.end();
  });
}

// ==================== 路由处理 ====================

async function handleApi(req, res, url) {
  // OPTIONS 预检
  if (req.method === 'OPTIONS') return send(res, 204, '');

  // 登录接口（无需认证）
  if (req.method === 'POST' && url.pathname === '/api/admin/login') {
    const body = JSON.parse(await readBody(req) || '{}');
    const token = getAdminToken();
    if (body.token && body.token === token) {
      return send(res, 200, JSON.stringify({ ok: true, token }));
    }
    return send(res, 401, JSON.stringify({ ok: false, error: '令牌错误' }));
  }

  // 获取管理令牌信息（首次访问提示）
  if (req.method === 'GET' && url.pathname === '/api/admin/info') {
    const settings = loadSettings();
    return send(res, 200, JSON.stringify({
      ok: true,
      hasToken: !!settings.adminToken,
      focusmathApi: settings.focusmathApi || ''
    }));
  }

  // 以下接口需要认证
  if (!checkAuth(req)) {
    return send(res, 401, JSON.stringify({ ok: false, error: '未授权' }));
  }

  // ==================== 用户管理 ====================
  if (url.pathname === '/api/users' && req.method === 'GET') {
    const users = loadUsers();
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const role = url.searchParams.get('role') || '';
    let filtered = users;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(u => (u.username || '').toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s));
    }
    if (status) filtered = filtered.filter(u => u.status === status);
    if (role) filtered = filtered.filter(u => u.role === role);
    return send(res, 200, JSON.stringify({ ok: true, users: filtered, total: users.length }));
  }

  if (url.pathname === '/api/users' && req.method === 'POST') {
    const body = JSON.parse(await readBody(req) || '{}');
    const users = loadUsers();
    const user = {
      id: crypto.randomUUID(),
      username: String(body.username || '').trim(),
      email: String(body.email || '').trim(),
      role: body.role || 'student',
      status: body.status || 'active',
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      lastLoginAt: null
    };
    if (!user.username) return send(res, 400, JSON.stringify({ ok: false, error: '用户名不能为空' }));
    if (users.some(u => u.username === user.username)) return send(res, 400, JSON.stringify({ ok: false, error: '用户名已存在' }));
    users.push(user);
    saveUsers(users);
    return send(res, 200, JSON.stringify({ ok: true, user }));
  }

  if (url.pathname.startsWith('/api/users/') && req.method === 'PUT') {
    const id = url.pathname.split('/').pop();
    const body = JSON.parse(await readBody(req) || '{}');
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx < 0) return send(res, 404, JSON.stringify({ ok: false, error: '用户不存在' }));
    users[idx] = { ...users[idx], ...body, id: users[idx].id, createdAt: users[idx].createdAt };
    saveUsers(users);
    return send(res, 200, JSON.stringify({ ok: true, user: users[idx] }));
  }

  if (url.pathname.startsWith('/api/users/') && req.method === 'DELETE') {
    const id = url.pathname.split('/').pop();
    const users = loadUsers();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return send(res, 404, JSON.stringify({ ok: false, error: '用户不存在' }));
    saveUsers(filtered);
    return send(res, 200, JSON.stringify({ ok: true, deleted: id }));
  }

  // ==================== 评论管理 ====================
  if (url.pathname === '/api/comments' && req.method === 'GET') {
    const comments = loadComments();
    const status = url.searchParams.get('status') || '';
    const targetType = url.searchParams.get('targetType') || '';
    const search = url.searchParams.get('search') || '';
    let filtered = comments;
    if (status) filtered = filtered.filter(c => c.status === status);
    if (targetType) filtered = filtered.filter(c => c.targetType === targetType);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(c => (c.content || '').toLowerCase().includes(s) || (c.userName || '').toLowerCase().includes(s));
    }
    // 按创建时间倒序
    filtered.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return send(res, 200, JSON.stringify({ ok: true, comments: filtered, total: comments.length }));
  }

  if (url.pathname === '/api/comments' && req.method === 'POST') {
    const body = JSON.parse(await readBody(req) || '{}');
    const comments = loadComments();
    const comment = {
      id: crypto.randomUUID(),
      userId: body.userId || 'anonymous',
      userName: body.userName || '匿名用户',
      targetType: body.targetType || 'question',
      targetId: body.targetId || '',
      content: String(body.content || '').trim(),
      status: 'pending',
      reply: '',
      createdAt: new Date().toISOString()
    };
    if (!comment.content) return send(res, 400, JSON.stringify({ ok: false, error: '评论内容不能为空' }));
    comments.push(comment);
    saveComments(comments);
    return send(res, 200, JSON.stringify({ ok: true, comment }));
  }

  if (url.pathname.startsWith('/api/comments/') && req.method === 'PUT') {
    const id = url.pathname.split('/').pop();
    const body = JSON.parse(await readBody(req) || '{}');
    const comments = loadComments();
    const idx = comments.findIndex(c => c.id === id);
    if (idx < 0) return send(res, 404, JSON.stringify({ ok: false, error: '评论不存在' }));
    comments[idx] = { ...comments[idx], ...body, id: comments[idx].id, createdAt: comments[idx].createdAt };
    saveComments(comments);
    return send(res, 200, JSON.stringify({ ok: true, comment: comments[idx] }));
  }

  if (url.pathname.startsWith('/api/comments/') && req.method === 'DELETE') {
    const id = url.pathname.split('/').pop();
    const comments = loadComments();
    const filtered = comments.filter(c => c.id !== id);
    if (filtered.length === comments.length) return send(res, 404, JSON.stringify({ ok: false, error: '评论不存在' }));
    saveComments(filtered);
    return send(res, 200, JSON.stringify({ ok: true, deleted: id }));
  }

  // 批量审核评论
  if (url.pathname === '/api/comments/batch' && req.method === 'POST') {
    const body = JSON.parse(await readBody(req) || '{}');
    const comments = loadComments();
    const ids = body.ids || [];
    const status = body.status || 'approved';
    let updated = 0;
    comments.forEach(c => { if (ids.includes(c.id)) { c.status = status; updated++; } });
    saveComments(comments);
    return send(res, 200, JSON.stringify({ ok: true, updated }));
  }

  // ==================== 题库管理 ====================
  // 列表（优先对接 FocusMath 后端，否则用本地）
  if (url.pathname === '/api/questions' && req.method === 'GET') {
    const subject = url.searchParams.get('subject') || '';
    const search = url.searchParams.get('search') || '';
    // 尝试对接 FocusMath 后端
    if (search || subject) {
      const remote = await proxyToFocusMath('/api/question-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject || 'calculus', search, page: 1, pageSize: 200 })
      });
      if (remote.ok && remote.data) {
        return send(res, 200, JSON.stringify({ ok: true, source: 'focusmath', ...remote.data }));
      }
    }
    // 本地题库
    const local = loadLocalQuestions();
    let questions = local.questions || [];
    if (subject) questions = questions.filter(q => q.subject === subject);
    if (search) {
      const s = search.toLowerCase();
      questions = questions.filter(q => (q.question || '').toLowerCase().includes(s) || String(q.id || '').includes(s));
    }
    return send(res, 200, JSON.stringify({ ok: true, source: 'local', questions, total: questions.length, meta: local.meta }));
  }

  // 添加题目（本地）
  if (url.pathname === '/api/questions' && req.method === 'POST') {
    const body = JSON.parse(await readBody(req) || '{}');
    const local = loadLocalQuestions();
    const q = {
      id: body.id || `Q${Date.now()}${Math.random().toString(16).slice(2, 6)}`,
      subject: body.subject || 'calculus',
      type: body.type === 'fill' ? 'fill' : 'choice',
      question: String(body.question || '').trim(),
      options: body.options || [],
      answer: body.answer,
      explanation: body.explanation || '',
      difficulty: Math.max(1, Math.min(10, Number(body.difficulty) || 5)),
      createdAt: new Date().toISOString()
    };
    if (!q.question) return send(res, 400, JSON.stringify({ ok: false, error: '题干不能为空' }));
    local.questions.push(q);
    saveLocalQuestions(local);
    return send(res, 200, JSON.stringify({ ok: true, question: q }));
  }

  // 更新题目（本地）
  if (url.pathname.startsWith('/api/questions/') && req.method === 'PUT') {
    const id = url.pathname.split('/').pop();
    const body = JSON.parse(await readBody(req) || '{}');
    const local = loadLocalQuestions();
    const idx = local.questions.findIndex(q => q.id === id);
    if (idx < 0) return send(res, 404, JSON.stringify({ ok: false, error: '题目不存在' }));
    local.questions[idx] = { ...local.questions[idx], ...body, id };
    saveLocalQuestions(local);
    return send(res, 200, JSON.stringify({ ok: true, question: local.questions[idx] }));
  }

  // 删除题目（本地）
  if (url.pathname.startsWith('/api/questions/') && req.method === 'DELETE') {
    const id = url.pathname.split('/').pop();
    const local = loadLocalQuestions();
    const before = local.questions.length;
    local.questions = local.questions.filter(q => q.id !== id);
    if (local.questions.length === before) return send(res, 404, JSON.stringify({ ok: false, error: '题目不存在' }));
    saveLocalQuestions(local);
    return send(res, 200, JSON.stringify({ ok: true, deleted: id }));
  }

  // 批量导入
  if (url.pathname === '/api/questions/import' && req.method === 'POST') {
    const body = JSON.parse(await readBody(req) || '{}');
    const local = loadLocalQuestions();
    const imported = (body.questions || []).map(q => ({
      id: q.id || `Q${Date.now()}${Math.random().toString(16).slice(2, 6)}`,
      subject: q.subject || 'calculus',
      type: q.type === 'fill' ? 'fill' : 'choice',
      question: String(q.question || '').trim(),
      options: q.options || [],
      answer: q.answer,
      explanation: q.explanation || '',
      difficulty: Math.max(1, Math.min(10, Number(q.difficulty) || 5)),
      createdAt: new Date().toISOString()
    })).filter(q => q.question);
    local.questions.push(...imported);
    saveLocalQuestions(local);
    return send(res, 200, JSON.stringify({ ok: true, imported: imported.length }));
  }

  // ==================== 设置 ====================
  if (url.pathname === '/api/settings' && req.method === 'GET') {
    const settings = loadSettings();
    return send(res, 200, JSON.stringify({ ok: true, focusmathApi: settings.focusmathApi || '' }));
  }

  if (url.pathname === '/api/settings' && req.method === 'PUT') {
    const body = JSON.parse(await readBody(req) || '{}');
    const settings = loadSettings();
    settings.focusmathApi = String(body.focusmathApi || '').trim();
    saveSettings(settings);
    return send(res, 200, JSON.stringify({ ok: true, focusmathApi: settings.focusmathApi }));
  }

  // ==================== 仪表盘统计 ====================
  if (url.pathname === '/api/dashboard' && req.method === 'GET') {
    const users = loadUsers();
    const comments = loadComments();
    const local = loadLocalQuestions();
    const settings = loadSettings();
    return send(res, 200, JSON.stringify({
      ok: true,
      stats: {
        users: {
          total: users.length,
          active: users.filter(u => u.status === 'active').length,
          disabled: users.filter(u => u.status === 'disabled').length,
          admins: users.filter(u => u.role === 'admin').length
        },
        comments: {
          total: comments.length,
          pending: comments.filter(c => c.status === 'pending').length,
          approved: comments.filter(c => c.status === 'approved').length,
          rejected: comments.filter(c => c.status === 'rejected').length
        },
        questions: {
          total: local.questions.length,
          calculus: local.questions.filter(q => q.subject === 'calculus').length,
          linear: local.questions.filter(q => q.subject === 'linear').length,
          probability: local.questions.filter(q => q.subject === 'probability').length
        },
        focusmathConnected: !!settings.focusmathApi
      }
    }));
  }

  return send(res, 404, JSON.stringify({ ok: false, error: 'not found' }));
}

// ==================== 静态文件服务 ====================

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function serveStatic(req, res, url) {
  let filePath = path.join(PUBLIC_DIR, url.pathname === '/' ? '/index.html' : url.pathname);
  // 防止路径遍历
  if (!filePath.startsWith(PUBLIC_DIR)) return send(res, 403, 'Forbidden', 'text/plain');
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    // SPA 回退到 index.html
    filePath = path.join(PUBLIC_DIR, 'index.html');
    if (!fs.existsSync(filePath)) return send(res, 404, 'Not Found', 'text/plain');
  }
  const ext = path.extname(filePath);
  const mime = MIME_TYPES[ext] || 'application/octet-stream';
  const content = fs.readFileSync(filePath);
  return send(res, 200, content, mime);
}

// ==================== 启动服务器 ====================

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (url.pathname.startsWith('/api/')) {
      return await handleApi(req, res, url);
    }
    return serveStatic(req, res, url);
  } catch (error) {
    console.error('Server error:', error);
    return send(res, 500, JSON.stringify({ ok: false, error: error.message }));
  }
});

server.listen(PORT, () => {
  const token = getAdminToken();
  console.log('========================================');
  console.log('  FocusMath 后端管理面板已启动');
  console.log('========================================');
  console.log(`  访问地址: http://localhost:${PORT}`);
  console.log(`  管理令牌: ${token}`);
  console.log('----------------------------------------');
  console.log('  首次访问请用上述令牌登录');
  console.log('  数据目录: ' + DATA_DIR);
  console.log('========================================');
});
