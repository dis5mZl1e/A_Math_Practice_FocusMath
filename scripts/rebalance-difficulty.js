const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const file = path.join(root, 'data', 'questions.json');
const write = process.argv.includes('--write');

function clamp(value, min = 1, max = 10) {
  return Math.max(min, Math.min(max, value));
}

function textOf(q) {
  const meta = q.meta || {};
  return [
    q.question,
    q.explanation,
    ...(Array.isArray(q.options) ? q.options : []),
    meta.type,
    ...(Array.isArray(meta.knowledge_path) ? meta.knowledge_path : []),
    ...(Array.isArray(meta.keywords) ? meta.keywords : [])
  ].filter(Boolean).join(' ');
}

function hasAny(text, words) {
  return words.some(word => text.includes(word));
}

function countAny(text, words) {
  return words.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
}

function suffixTag(text) {
  const match = String(text || '').match(/\u00b7\s*([^.\u00b7]+)$/);
  return match ? match[1].trim() : '';
}

function leadingTopic(text) {
  const match = String(text || '').match(/^([^:：]{2,24})[:：]/);
  return match ? match[1].trim() : '';
}

const commonHard = [
  '\u8bc1\u660e', '\u63a8\u5bfc', '\u8ba8\u8bba', '\u5145\u8981', '\u5fc5\u8981',
  '\u5b58\u5728', '\u552f\u4e00', '\u6536\u655b\u57df', '\u4e00\u81f4\u6536\u655b',
  '\u65e0\u504f', '\u4f3c\u7136', '\u5047\u8bbe\u68c0\u9a8c', '\u7f6e\u4fe1',
  '\u6807\u51c6\u578b', '\u5408\u540c\u53d8\u6362', '\u76f8\u4f3c',
  '\u6b63\u5b9a', '\u7279\u5f81\u503c', '\u7279\u5f81\u5411\u91cf'
];

const sourceEasy = [
  '\u8ba1\u7b97\u8bad\u7ec3', '\u516c\u5f0f\u5e94\u7528', '\u6982\u5ff5\u8fa8\u6790'
];

const sourceHard = [
  '\u8003\u7814\u771f\u9898\u53d8\u5f0f', '\u7ae0\u8282\u8bca\u65ad', '\u6613\u9519\u70b9\u590d\u76d8'
];

const subjectRules = {
  calculus: {
    easy: ['\u5bfc\u6570\u662f', '\u5207\u7ebf\u659c\u7387', '\u4e0d\u5b9a\u79ef\u5206\u662f', '\u5b9a\u79ef\u5206', '\u6781\u9650'],
    medium: ['\u79ef\u5206', '\u6781\u9650', '\u5bfc\u6570\u4e0e\u5fae\u5206', '\u7ea7\u6570', '\u6cf0\u52d2', '\u9ea6\u514b\u52b3\u6797'],
    hard: ['\u591a\u5143\u5fae\u79ef\u5206', '\u66f2\u7ebf', '\u66f2\u9762', '\u504f\u5bfc', '\u65b9\u5411\u5bfc\u6570', '\u5e42\u7ea7\u6570', '\u51fd\u6570\u9879\u7ea7\u6570', '\u5fae\u5206\u65b9\u7a0b', '\u65cb\u8f6c\u4f53'],
    veryHard: ['Green', 'Stokes', 'Gauss', 'Lebesgue', 'Cauchy', '\u4e00\u81f4\u6536\u655b', '\u63a7\u5236\u6536\u655b', '\u9ece\u66fc\u53ef\u79ef']
  },
  linear: {
    easy: ['2\\times2', '\u4e8c\u9636', '\u5355\u4f4d\u77e9\u9635', '\u884c\u5217\u5f0f\u662f', '\u79e9\u662f'],
    medium: ['\u77e9\u9635', '\u884c\u5217\u5f0f', '\u5411\u91cf\u7ec4', '\u79e9', '\u7ebf\u6027\u65b9\u7a0b\u7ec4'],
    hard: ['\u7279\u5f81\u503c', '\u7279\u5f81\u5411\u91cf', '\u4e8c\u6b21\u578b', '\u6b63\u4ea4', '\u76f8\u4f3c', '\u6b63\u5b9a', '\u7ebf\u6027\u53d8\u6362', '\u5408\u540c'],
    veryHard: ['Jordan', 'Sylvester', '\u5e42\u96f6', '\u521d\u7b49\u56e0\u5b50', '\u5947\u5f02\u503c', '\u552f\u4e00\u5206\u89e3']
  },
  probability: {
    easy: ['\u53e4\u5178\u6982\u7387', '\u786e\u5b9a\u4e8b\u4ef6', '\u4e92\u65a5', '\u72ec\u7acb', '\u6982\u7387\u4e3a'],
    medium: ['\u968f\u673a\u53d8\u91cf\u5206\u5e03', '\u6570\u5b57\u7279\u5f81', '\u671f\u671b', '\u65b9\u5dee', '\u7edf\u8ba1\u91cf', '\u5206\u5e03'],
    hard: ['\u5927\u6570\u5b9a\u5f8b', '\u4e2d\u5fc3\u6781\u9650\u5b9a\u7406', '\u53c2\u6570\u4f30\u8ba1', '\u5047\u8bbe\u68c0\u9a8c', '\u6b63\u6001\u603b\u4f53', '\u6837\u672c\u5747\u503c', '\u77e9\u4f30\u8ba1', '\u7f6e\u4fe1\u533a\u95f4'],
    veryHard: ['Cramer', 'Cram', 'Rao', '\u4f3c\u7136', '\u65e0\u504f', '\u5145\u5206\u7edf\u8ba1\u91cf', '\u5207\u6bd4\u96ea\u592b', '\u5361\u65b9', 'F \u5206\u5e03']
  }
};

function estimatedDifficulty(q) {
  const text = textOf(q);
  const subject = q.subject || '';
  const rules = subjectRules[subject] || { easy: [], medium: [], hard: [], veryHard: [] };
  const question = String(q.question || '');
  const topic = [
    leadingTopic(question),
    ...(Array.isArray(q.meta?.knowledge_path) ? q.meta.knowledge_path : []),
    q.meta?.type
  ].filter(Boolean).join(' ');
  const tag = suffixTag(question);
  let score = q.type === 'choice' ? 2 : 3;
  const len = String(q.question || '').length;

  if (subject === 'calculus') {
    if (hasAny(topic, ['\u5bfc\u6570', '\u5fae\u5206', '\u6781\u9650'])) score = 2;
    if (hasAny(topic, ['\u79ef\u5206'])) score = 3;
    if (hasAny(topic, ['\u5fae\u5206\u65b9\u7a0b'])) score = 5;
    if (hasAny(topic, ['\u7ea7\u6570'])) score = 6;
    if (hasAny(topic, ['\u591a\u5143'])) score = 6;
    if (hasAny(text, ['\u66f2\u7ebf\u79ef\u5206', '\u66f2\u9762\u79ef\u5206', '\u4e8c\u91cd\u79ef\u5206', '\u4e09\u91cd\u79ef\u5206', '\u65e0\u7a77\u533a\u95f4', '\u53cd\u5e38\u79ef\u5206'])) score = Math.max(score, 6);
    if (hasAny(text, ['\u5e42\u7ea7\u6570', '\u51fd\u6570\u9879\u7ea7\u6570', '\u4e00\u81f4\u6536\u655b', '\u65b9\u5411\u5bfc\u6570', '\u68af\u5ea6'])) score = Math.max(score, 7);
    if (hasAny(text, ['Green', 'Stokes', 'Gauss', 'Cauchy'])) score = Math.max(score, 8);
    if (hasAny(text, ['Lebesgue', '\u63a7\u5236\u6536\u655b'])) score = Math.max(score, 10);
    if (/y'\s*[+\-=]/.test(text)) score = Math.min(score, 4);
    if (hasAny(text, ['\u79ef\u5206\u4e2d\u503c\u5b9a\u7406'])) score = Math.max(score, 5);
    if (hasAny(text, ['(0,0) \u5904', '\uff080,0\uff09\u5904']) && hasAny(text, ['\u8fde\u7eed', '\u6781\u9650'])) score = Math.max(score, 5);
    if (hasAny(text, ['\u68af\u5ea6']) && len < 56) score = Math.min(score, q.type === 'fill' ? 5 : 4);
    if (hasAny(text, ['z_{xy}', 'z_{yx}']) && len < 70) score = Math.min(score, q.type === 'fill' ? 5 : 4);
  } else if (subject === 'linear') {
    if (hasAny(topic, ['\u884c\u5217\u5f0f', '\u77e9\u9635\u8fd0\u7b97'])) score = 3;
    if (hasAny(topic, ['\u5411\u91cf\u7ec4', '\u7ebf\u6027\u65b9\u7a0b\u7ec4', '\u79e9'])) score = 4;
    if (hasAny(topic, ['\u7279\u5f81\u503c', '\u4e8c\u6b21\u578b'])) score = 6;
    if (hasAny(text, ['\u76f8\u4f3c', '\u6b63\u4ea4', '\u6b63\u5b9a', '\u5408\u540c', '\u7ebf\u6027\u53d8\u6362'])) score = Math.max(score, 6);
    if (hasAny(text, ['Jordan', 'Sylvester', '\u5e42\u96f6', '\u521d\u7b49\u56e0\u5b50', '\u5947\u5f02\u503c', '\u552f\u4e00\u5206\u89e3'])) score = Math.max(score, 8);
    if (hasAny(text, ['A^2=A', '\u7279\u5f81\u503c\u53ea\u80fd\u4e3a 0 \u548c'])) score = Math.min(score, 5);
    if (hasAny(text, ['\u5b9e\u5bf9\u79f0\u77e9\u9635\u6b63\u4ea4\u76f8\u4f3c\u5bf9\u89d2\u5316'])) score = Math.min(score, 6);
  } else if (subject === 'probability') {
    if (hasAny(topic, ['\u53e4\u5178\u6982\u7387'])) score = 2;
    if (hasAny(topic, ['\u968f\u673a\u53d8\u91cf\u5206\u5e03', '\u6570\u5b57\u7279\u5f81'])) score = 4;
    if (hasAny(topic, ['\u7edf\u8ba1\u91cf'])) score = 5;
    if (hasAny(topic, ['\u53c2\u6570\u4f30\u8ba1', '\u5047\u8bbe\u68c0\u9a8c', '\u5927\u6570\u5b9a\u5f8b', '\u4e2d\u5fc3\u6781\u9650\u5b9a\u7406'])) score = 6;
    if (hasAny(text, ['\u6837\u672c\u5747\u503c', '\u6b63\u6001\u603b\u4f53', '\u7f6e\u4fe1\u533a\u95f4', '\u77e9\u4f30\u8ba1', '\u5361\u65b9', 'F \u5206\u5e03'])) score = Math.max(score, 7);
    if (hasAny(text, ['Cramer', 'Cram', 'Rao', '\u4f3c\u7136', '\u65e0\u504f', '\u5145\u5206\u7edf\u8ba1\u91cf', '\u5207\u6bd4\u96ea\u592b'])) score = Math.max(score, 8);
    if (hasAny(text, ['\u5747\u5300\u5206\u5e03']) && hasAny(text, ['\u65b9\u5dee\u4e3a'])) score = Math.min(score, 5);
    if (hasAny(text, ['\u6837\u672c\u5747\u503c\u4f30\u8ba1\u603b\u4f53\u5747\u503c\u65f6\u901a\u5e38\u5177\u6709'])) score = Math.min(score, 5);
  }

  if (q.type === 'fill') score += 1;
  if (hasAny(text, sourceEasy) || hasAny(tag, sourceEasy)) score -= 1;
  if (hasAny(text, sourceHard) || hasAny(tag, sourceHard)) score += 1;
  if (hasAny(tag, ['\u7efc\u5408\u5c0f\u9898', '\u6559\u6750\u4f8b\u9898\u6539\u5199', '\u6a21\u62df\u5377\u8fc1\u79fb'])) score += 1;
  if (len > 90) score += 1;
  if (len > 145) score += 1;
  if (countAny(text, commonHard) >= 2) score += 1;
  if ((text.match(/\\(lim|int|sum|frac|sqrt|begin\{pmatrix\}|infty|to|sim)/g) || []).length >= 3) score += 1;

  if (hasAny(text, rules.easy) && len < 62 && !hasAny(text, rules.hard) && !hasAny(text, rules.veryHard)) {
    score = Math.min(score, q.type === 'fill' ? 3 : 2);
  }
  if (subject === 'calculus' && hasAny(text, ['\u5bfc\u6570\u662f', '\u5207\u7ebf\u659c\u7387']) && len < 62) score = Math.min(score, 3);
  if (subject === 'calculus' && /\\int_0\^1\s*x\^\d+\\ln x/.test(text)) score = Math.min(score, 6);
  if (subject === 'calculus' && hasAny(text, ['z_{xy}', 'z_{yx}']) && len < 82) score = Math.min(score, 5);
  if (subject === 'calculus' && /y'\s*[+\-=]/.test(text)) score = Math.min(score, q.type === 'fill' ? 5 : 4);
  if (subject === 'calculus' && hasAny(text, ['\u68af\u5ea6']) && len < 70) score = Math.min(score, q.type === 'fill' ? 5 : 4);
  if (subject === 'linear' && hasAny(text, ['\u884c\u5217\u5f0f\u662f', '\u79e9\u662f', '\u5355\u4f4d\u77e9\u9635']) && len < 68) score = Math.min(score, 3);
  if (subject === 'linear' && hasAny(text, ['A^2=A', '\u7279\u5f81\u503c\u53ea\u80fd\u4e3a 0 \u548c'])) score = Math.min(score, 5);
  if (subject === 'linear' && hasAny(text, ['\u5b9e\u5bf9\u79f0\u77e9\u9635\u6b63\u4ea4\u76f8\u4f3c\u5bf9\u89d2\u5316'])) score = Math.min(score, 6);
  if (subject === 'linear' && hasAny(text, ['\u76f8\u4f3c\u77e9\u9635\u4e00\u5b9a\u6709\u76f8\u540c\u7684'])) score = Math.min(score, 5);
  if (subject === 'linear' && hasAny(text, ['\u6b63\u60ef\u6027\u6307\u6570'])) score = Math.min(score, 6);
  if (subject === 'probability' && hasAny(text, ['\u53e4\u5178\u6982\u7387', '\u6982\u7387\u4e3a', '\u671f\u671b', '\u65b9\u5dee']) && len < 68 && !hasAny(text, rules.hard)) score = Math.min(score, 4);
  if (subject === 'probability' && hasAny(text, ['\u5747\u5300\u5206\u5e03']) && hasAny(text, ['\u65b9\u5dee\u4e3a'])) score = Math.min(score, 5);
  if (subject === 'probability' && hasAny(text, ['\u6837\u672c\u5747\u503c\u4f30\u8ba1\u603b\u4f53\u5747\u503c\u65f6\u901a\u5e38\u5177\u6709'])) score = Math.min(score, 5);
  if (subject === 'probability' && hasAny(text, ['\u6837\u672c\u5747\u503c']) && hasAny(text, ['\u671f\u671b'])) score = Math.min(score, 5);
  if (subject === 'probability' && hasAny(text, ['\u6837\u672c\u65b9\u5dee']) && hasAny(text, ['n-1'])) score = Math.min(score, 6);
  if (subject === 'probability' && hasAny(text, ['\u72ec\u7acb', 'P(A)', 'P(B)', 'P(AB)'])) score = Math.min(score, 4);

  if (subject === 'calculus' && hasAny(text, ['Lebesgue', '\u63a7\u5236\u6536\u655b'])) score = Math.max(score, 10);
  if (subject === 'linear' && hasAny(text, ['Sylvester', 'Jordan', '\u552f\u4e00\u5206\u89e3'])) score = Math.max(score, 9);
  if (subject === 'probability' && hasAny(text, ['Cramer', 'Cram', 'Rao', '\u5145\u5206\u7edf\u8ba1\u91cf'])) score = Math.max(score, 9);

  return clamp(Math.round(score));
}

function distribution(questions) {
  const out = {};
  for (const q of questions) {
    const subject = q.subject || 'unknown';
    const difficulty = Number(q.difficulty || 0);
    if (!out[subject]) out[subject] = {};
    out[subject][difficulty] = (out[subject][difficulty] || 0) + 1;
  }
  return out;
}

function printDistribution(title, dist) {
  console.log('\n' + title);
  for (const subject of Object.keys(dist).sort()) {
    const row = [];
    for (let i = 1; i <= 10; i++) row.push(`${i}:${dist[subject][i] || 0}`);
    console.log(`${subject} ${row.join(' ')}`);
  }
}

const db = JSON.parse(fs.readFileSync(file, 'utf8'));
const questions = Array.isArray(db.questions) ? db.questions : [];
const before = distribution(questions);
const changes = [];
const transitions = {};

for (const q of questions) {
  const oldDifficulty = Number(q.difficulty || 5);
  const nextDifficulty = estimatedDifficulty(q);
  if (oldDifficulty !== nextDifficulty) {
    changes.push({
      id: q.id,
      subject: q.subject,
      oldDifficulty,
      nextDifficulty,
      type: q.type,
      question: String(q.question || '').slice(0, 120)
    });
    const key = `${q.subject}:${oldDifficulty}->${nextDifficulty}`;
    transitions[key] = (transitions[key] || 0) + 1;
    if (write) {
      q.difficulty = nextDifficulty;
      if (q.meta && typeof q.meta === 'object') q.meta.difficulty = nextDifficulty;
    }
  }
}

const after = distribution(questions.map(q => ({ ...q, difficulty: write ? q.difficulty : estimatedDifficulty(q) })));

printDistribution('Before', before);
printDistribution('After', after);
console.log(`\nChanged ${changes.length} / ${questions.length}`);
console.log('\nTop transitions');
Object.entries(transitions).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([key, value]) => console.log(`${key} ${value}`));
console.log('\nSample changes');
changes.slice(0, 30).forEach(item => {
  console.log(`${item.subject} ${item.id} ${item.oldDifficulty}->${item.nextDifficulty} ${item.type} ${item.question}`);
});

if (write) {
  fs.writeFileSync(file, JSON.stringify(db, null, 2), 'utf8');
  console.log('\nWrote data/questions.json');
} else {
  console.log('\nDry run only. Use --write to update data/questions.json');
}
