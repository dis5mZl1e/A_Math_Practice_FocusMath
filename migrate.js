const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = __dirname;
const dataDir = path.join(root, 'data');
const legacyFile = path.join(dataDir, 'question-bank.js');
const outputFile = path.join(dataDir, 'questions.json');

function defaultMeta() {
  return {
    version: '2026-06-20',
    subjects: {
      calculus: { name: '高等数学', color: '#1B6B93' },
      linear: { name: '线性代数', color: '#A18CD1' },
      probability: { name: '概率统计', color: '#4FCCA3' }
    },
    topicRules: {}
  };
}

function normalizeQuestion(input, fallbackSubject) {
  const type = input.type === 'fill' ? 'fill' : 'choice';
  const q = {
    id: String(input.id || `${fallbackSubject[0]}${Date.now()}`),
    subject: String(input.subject || fallbackSubject),
    difficulty: Math.max(1, Math.min(10, Number(input.difficulty || 5))),
    type,
    question: String(input.question || '').trim(),
    explanation: String(input.explanation || '')
  };
  if (!q.question) return null;
  if (type === 'choice') {
    q.options = Array.isArray(input.options) ? input.options.map(String) : [];
    if (q.options.length < 2) return null;
    q.answer = Math.max(0, Math.min(q.options.length - 1, Number(input.answer) || 0));
  } else {
    q.answer = String(input.answer ?? '').trim();
    if (!q.answer) return null;
  }
  q.meta = {
    type: type === 'choice' ? '选择题' : '填空题',
    knowledge_path: [],
    keywords: [],
    difficulty: q.difficulty,
    prerequisites: []
  };
  return q;
}

function classifyByRules(q, topicRules) {
  const text = `${q.question} ${(q.options || []).join(' ')} ${q.explanation || ''}`;
  const rules = topicRules[q.subject] || [];
  const matched = rules
    .filter(([, words]) => (words || []).some(word => text.includes(word)))
    .map(([topic]) => topic);
  const keywords = [...new Set(matched.concat((text.match(/[\u4e00-\u9fa5]{2,6}|[A-Za-z]{2,}/g) || []).slice(0, 4)))].slice(0, 6);
  return {
    type: q.type === 'choice' ? '选择题' : '填空题',
    knowledge_path: [matched[0] || '待标注'],
    keywords,
    difficulty: q.difficulty,
    prerequisites: []
  };
}

function migrate() {
  if (!fs.existsSync(legacyFile)) {
    throw new Error(`Missing legacy file: ${legacyFile}`);
  }
  const sandbox = {
    window: {},
    console: { log() {}, warn() {}, error() {} }
  };
  sandbox.global = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(legacyFile, 'utf8'), sandbox, { filename: legacyFile, timeout: 1000 });

  const legacy = sandbox.window || {};
  const base = defaultMeta();
  const subjects = {};
  Object.keys(base.subjects).forEach(subject => {
    subjects[subject] = {
      name: legacy.subjectNames?.[subject] || base.subjects[subject].name,
      color: legacy.subjectColors?.[subject] || base.subjects[subject].color
    };
  });

  const data = {
    meta: {
      version: base.version,
      subjects,
      topicRules: legacy.topicRules || base.topicRules
    },
    questions: []
  };

  Object.entries(legacy.questionDB || {}).forEach(([subject, questions]) => {
    (Array.isArray(questions) ? questions : []).forEach(item => {
      const q = normalizeQuestion({ ...item, subject }, subject);
      if (q) q.meta = classifyByRules(q, data.meta.topicRules);
      if (q) data.questions.push(q);
    });
  });

  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Migrated ${data.questions.length} questions to ${outputFile}`);
}

migrate();
