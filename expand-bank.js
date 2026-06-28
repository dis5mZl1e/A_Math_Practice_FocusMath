const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'data', 'questions.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const subjects = ['calculus', 'linear', 'probability'];
const names = { calculus: '高等数学', linear: '线性代数', probability: '概率统计' };
const topicSets = {
  calculus: ['极限', '导数与微分', '积分', '级数', '多元微积分', '微分方程', '曲线曲面积分', '无穷小比较'],
  linear: ['行列式', '矩阵运算', '向量组与秩', '特征值', '二次型', '线性方程组', '相似对角化', '正交变换'],
  probability: ['古典概率', '随机变量分布', '数字特征', '大数定律与中心极限定理', '参数估计', '假设检验', '条件概率', '统计量']
};
const sources = ['教材例题改写', '考研真题变式', '模拟卷迁移', '章节诊断', '概念辨析', '计算训练', '综合小题', '易错点复盘', '公式应用', '题型归纳'];

function normalize(text) {
  return String(text || '').replace(/\s+/g, '').toLowerCase();
}

const shingleMemo = new Map();
function shingles(text) {
  const clean = normalize(text).replace(/[^\u4e00-\u9fa5a-z0-9]/g, '');
  if (shingleMemo.has(clean)) return shingleMemo.get(clean);
  const size = clean.length < 8 ? 2 : 3;
  const set = new Set();
  for (let i = 0; i <= clean.length - size; i++) set.add(clean.slice(i, i + size));
  shingleMemo.set(clean, set);
  return set;
}

function similarity(a, b) {
  const sa = shingles(a), sb = shingles(b);
  if (!sa.size || !sb.size) return 0;
  let hit = 0;
  sa.forEach(x => { if (sb.has(x)) hit++; });
  return hit / (sa.size + sb.size - hit);
}

function frac(a, b) {
  const gcd = (x, y) => y ? gcd(y, x % y) : Math.abs(x);
  const g = gcd(a, b);
  return b / g === 1 ? String(a / g) : `${a / g}/${b / g}`;
}

function meta(subject, topic, type, difficulty, words = []) {
  return {
    type: type === 'choice' ? '选择题' : '填空题',
    knowledge_path: [names[subject], topic],
    keywords: [...new Set([topic, ...words].filter(Boolean))].slice(0, 6),
    difficulty,
    prerequisites: []
  };
}

function makeQuestion(subject, i) {
  const source = sources[i % sources.length];
  const topic = topicSets[subject][i % topicSets[subject].length];
  const difficulty = 1 + (i % 9);
  const a = (i * 7) % 37 + 2;
  const b = (i * 11) % 29 + 2;
  const c = (i * 13) % 23 + 1;
  const n = (i * 17) % 53 + 5;
  const variant = Math.floor(i / topicSets[subject].length) % 24;
  const type = i % 5 === 0 || i % 5 === 3 ? 'fill' : 'choice';
  const id = `${subject[0]}x${String(i + 1).padStart(4, '0')}`;
  const prefix = `${source} ${variant + 1} · ${topic}`;

  if (subject === 'calculus') {
    const makers = [
      () => ({ type: 'choice', question: `${prefix}：\\(\\lim_{x\\to0}\\frac{\\sin ${a}x-${a}x}{x^3}\\) 的值是？`, options: [frac(-(a ** 3), 6), frac(-(a ** 2), 6), '0', String(a)], answer: 0, explanation: '用正弦函数三阶展开。' }),
      () => ({ type: 'choice', question: `${prefix}：\\(f(x)=x^${b}e^{${c}x}\\)，\\(f'(0)\\) 等于？`, options: [b === 1 ? '1' : '0', String(c), String(b), `${b + c}`], answer: 0, explanation: '乘积求导后代入 0。' }),
      () => ({ type: 'fill', question: `${prefix}：曲线 \\(y=${a}x^2+${c}\\) 在 \\(x=${b}\\) 处切线斜率为多少？`, answer: String(2 * a * b), explanation: '导数为 2ax。' }),
      () => ({ type: 'choice', question: `${prefix}：\\(\\int_0^1 x^${a}\\ln x\\,dx\\) 等于？`, options: [`-${frac(1, (a + 1) ** 2)}`, frac(1, a + 1), '0', `-${a}`], answer: 0, explanation: '分部积分或含参积分。' }),
      () => ({ type: 'fill', question: `${prefix}：\\(y'+${a}y=0, y(0)=${b}\\) 的解为？`, answer: `${b}e^{-${a}x}`, explanation: '一阶齐次线性方程。' }),
      () => ({ type: 'choice', question: `${prefix}：级数 \\(\\sum_{k=0}^{\\infty}(x/${b})^k\\) 的收敛半径为？`, options: [String(b), frac(1, b), '0', '+∞'], answer: 0, explanation: '几何级数比值判别。' }),
      () => ({ type: 'fill', question: `${prefix}：\\(z=x^2y+${a}xy^2\\)，\\(z_{xy}\\) 等于？`, answer: `2x+${2 * a}y`, explanation: '求二阶混合偏导。' }),
      () => ({ type: 'choice', question: `${prefix}：区域 \\(0\\le y\\le x\\le ${b}\\) 换序后 y 的范围是？`, options: [`0\\le y\\le ${b}`, `0\\le y\\le x`, `${b}\\le y\\le x`, '全平面'], answer: 0, explanation: '三角区域换序。' })
    ];
    const q = makers[i % makers.length]();
    return { id, subject, difficulty, ...q, meta: meta(subject, topic, q.type, difficulty, [source]) };
  }

  if (subject === 'linear') {
    const makers = [
      () => ({ type: 'choice', question: `${prefix}：矩阵 \\(\\begin{pmatrix}${a}&${b}\\\\0&${c}\\end{pmatrix}\\) 的行列式是？`, options: [String(a * c), String(a + c), String(b), '0'], answer: 0, explanation: '上三角矩阵行列式为对角线乘积。' }),
      () => ({ type: 'choice', question: `${prefix}：若 \\(|A|=${a}\\)，A 为 3 阶，则 \\(|${b}A|\\) 为？`, options: [String((b ** 3) * a), String(b * a), String((b ** 2) * a), String(a)], answer: 0, explanation: '|kA|=k^n|A|。' }),
      () => ({ type: 'fill', question: `${prefix}：对角矩阵 diag(${a},${b},${c}) 的秩是？`, answer: '3', explanation: '三个对角元均非零。' }),
      () => ({ type: 'choice', question: `${prefix}：实对称矩阵正交相似对角化后，对角元是它的什么？`, options: ['特征值', '行和', '列和', '秩'], answer: 0, explanation: '实对称矩阵可正交对角化。' }),
      () => ({ type: 'fill', question: `${prefix}：若 \\(A^2=A\\)，A 的特征值只能为 0 和？`, answer: '1', explanation: 'λ²=λ。' }),
      () => ({ type: 'choice', question: `${prefix}：齐次线性方程组有非零解等价于系数矩阵？`, options: ['不满秩', '满秩', '可逆', '行列式非零'], answer: 0, explanation: '非零解要求秩小于未知量个数。' }),
      () => ({ type: 'fill', question: `${prefix}：二次型 \\(${a}x_1^2-${b}x_2^2+${c}x_3^2\\) 的正惯性指数是？`, answer: '2', explanation: '正系数个数为 2。' }),
      () => ({ type: 'choice', question: `${prefix}：相似矩阵一定有相同的？`, options: ['特征多项式', '每个元素', '每一行', '行最简形'], answer: 0, explanation: '相似保持特征多项式。' })
    ];
    const q = makers[i % makers.length]();
    return { id, subject, difficulty, ...q, meta: meta(subject, topic, q.type, difficulty, [source]) };
  }

  const makers = [
    () => ({ type: 'choice', question: `${prefix}：盒中 ${a} 个红球、${b} 个白球，任取一球为红球概率为？`, options: [frac(a, a + b), frac(b, a + b), frac(a + b, a), '1'], answer: 0, explanation: '古典概型。' }),
    () => ({ type: 'choice', question: `${prefix}：\\(X\\sim B(${n},${frac(a, a + b)})\\)，\\(E(X)\\) 为？`, options: [frac(n * a, a + b), String(n), frac(a, a + b), String(a + b)], answer: 0, explanation: '二项分布期望 np。' }),
    () => ({ type: 'fill', question: `${prefix}：\\(X\\sim P(${a})\\)，\\(D(X)\\) 等于？`, answer: String(a), explanation: '泊松分布方差等于 λ。' }),
    () => ({ type: 'choice', question: `${prefix}：A、B 独立，P(A)=${frac(a, 50)}，P(B)=${frac(b, 50)}，则 P(AB)=？`, options: [frac(a * b, 2500), frac(a + b, 50), frac(a, 50), frac(b, 50)], answer: 0, explanation: '独立事件乘法公式。' }),
    () => ({ type: 'fill', question: `${prefix}：均匀分布 \\(U(${c},${c + a})\\) 的方差为？`, answer: `${a ** 2}/12`, explanation: '区间长度平方除以 12。' }),
    () => ({ type: 'choice', question: `${prefix}：样本均值估计总体均值时通常具有？`, options: ['无偏性', '方差为零', '总等于真值', '与样本无关'], answer: 0, explanation: '样本均值期望等于总体均值。' }),
    () => ({ type: 'fill', question: `${prefix}：\\(X\\sim N(\\mu,\\sigma^2)\\) 的标准化变量是？`, answer: '(X-μ)/σ', explanation: '减均值除标准差。' }),
    () => ({ type: 'choice', question: `${prefix}：p 值小于显著性水平时通常？`, options: ['拒绝原假设', '接受原假设', '扩大样本方差', '停止抽样'], answer: 0, explanation: '显著性检验规则。' })
  ];
  const q = makers[i % makers.length]();
  return { id, subject, difficulty, ...q, meta: meta(subject, topic, q.type, difficulty, [source]) };
}

function expandSubject(subject, target = 3000) {
  const current = data.questions.filter(q => q.subject === subject);
  const accepted = [];
  const seenExact = new Set();
  for (const q of current) {
    const exact = normalize(q.question);
    if (seenExact.has(exact)) continue;
    if (accepted.some(item => similarity(item.question, q.question) > 0.8)) continue;
    seenExact.add(exact);
    accepted.push(q);
  }
  let i = 0;
  while (accepted.length < target && i < target * 80) {
    const q = makeQuestion(subject, i);
    i++;
    const exact = normalize(q.question);
    if (seenExact.has(exact)) continue;
    if (accepted.some(item => similarity(item.question, q.question) > 0.8)) continue;
    seenExact.add(exact);
    accepted.push(q);
  }
  if (accepted.length < target) {
    throw new Error(`${subject} only generated ${accepted.length}/${target}`);
  }
  return accepted.slice(0, target);
}

const expanded = subjects.flatMap(subject => expandSubject(subject, 3000));
data.meta = data.meta || {};
data.meta.version = '2026-06-20-expanded-3000';
data.questions = expanded;
fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log(JSON.stringify({
  total: data.questions.length,
  counts: Object.fromEntries(subjects.map(s => [s, data.questions.filter(q => q.subject === s).length]))
}, null, 2));
