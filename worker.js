// FocusMath 资源雷达 - Cloudflare Worker 轻量后端
// 部署后提供 POST /api/resources/search 接口，服务端抓取 Bing 搜索结果并解析为具体内容链接
// 免费额度：10 万次/天，全球边缘节点加速

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8'
};

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
  if (RADAR_MATH_TERM_EN[query.trim()]) return RADAR_MATH_TERM_EN[query.trim()];
  let result = query;
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

// 通过 fetch 抓取 Bing 搜索结果 HTML（Worker 环境用 fetch）
async function radarFetchBingHtml(searchUrl) {
  const resp = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/json,*/*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    }
  });
  if (!resp.ok) return '';
  return await resp.text();
}

// 解析 Bing HTML，提取具体内容链接（过滤搜索页）
function radarParseBingHtml(html, siteFilter, platform, type, query) {
  if (!html) return [];
  const results = [];
  const blocks = html.split(/<li class="b_algo"/);
  for (let i = 1; i < blocks.length && results.length < 3; i++) {
    const block = blocks[i];
    const linkMatch = block.match(/href="(https?:\/\/[^"]+)"/);
    if (!linkMatch) continue;
    const link = linkMatch[1];
    if (/bing\.com|microsoft\.com|r\.bing|\/rs\//.test(link)) continue;
    if (/\.(css|js|png|jpg|svg|ico|woff)/.test(link)) continue;
    try {
      const uLink = new URL(link);
      const pathLower = (uLink.pathname || '').toLowerCase();
      if (['/search', '/so/search'].some(p => pathLower.includes(p))) continue;
      const sp = uLink.searchParams;
      if (sp.get('q') || sp.get('keyword') || sp.get('query') || sp.get('page_search_query')) continue;
      if (siteFilter && !uLink.hostname.includes(siteFilter.replace(/^www\./, ''))) continue;
    } catch (e) { continue; }
    const titleMatch = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    let title = '';
    if (titleMatch) title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
    if (!title || title.length < 3) {
      const pMatch = block.match(/<p class="b_lineclamp[12]"[^>]*>([\s\S]*?)<\/p>/);
      if (pMatch) title = pMatch[1].replace(/<[^>]+>/g, '').trim();
    }
    if (!title) continue;
    results.push({
      title: title, url: link, platform: platform,
      type: type || 'article', difficulty: 5, duration: 15,
      topics: [query], quality: 0.6, adRisk: 0.1
    });
  }
  return results;
}

// 单平台搜索
async function radarSearchPlatform(query, siteFilter, platform, type) {
  const useEng = platform === 'mitocw' || platform === 'khan';
  const qRaw = useEng ? radarTranslateQueryToEnglish(query) : query;
  let q = radarCleanQuery(qRaw);
  if (siteFilter) q = `${q} site:${siteFilter}`;
  const searchUrl = `https://cn.bing.com/search?q=${encodeURIComponent(q)}&setlang=zh-CN`;
  try {
    const html = await radarFetchBingHtml(searchUrl);
    return radarParseBingHtml(html, siteFilter, platform, type, query);
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
      tasks.push(radarSearchPlatform(useQuery, 'bilibili.com', 'bilibili', 'video').then(r => allResults.push(...r)));
    } else if (p === 'zhihu') {
      tasks.push(radarSearchPlatform(useQuery, 'zhihu.com', 'zhihu', 'article').then(r => allResults.push(...r)));
    } else if (p === 'blog') {
      tasks.push(radarSearchPlatform(useQuery, 'csdn.net', 'blog', 'notes').then(r => allResults.push(...r)));
    } else if (p === 'mitocw') {
      tasks.push(radarSearchPlatform(useQuery, 'ocw.mit.edu', 'mitocw', 'lecture').then(r => allResults.push(...r)));
    } else if (p === 'khan') {
      tasks.push(radarSearchPlatform(useQuery, 'khanacademy.org', 'khan', 'video').then(r => allResults.push(...r)));
    } else if (p === 'notes') {
      tasks.push(radarSearchPlatform(useQuery, 'geogebra.org', 'notes', 'interactive').then(r => allResults.push(...r)));
    } else if (p === 'custom' && customPlatform) {
      let host = customPlatform;
      try { host = new URL(customPlatform).hostname; } catch (e) {}
      tasks.push(radarSearchPlatform(query, host, 'custom', 'article').then(r => allResults.push(...r)));
    }
  }
  await Promise.all(tasks);
  return allResults;
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }
    const url = new URL(request.url);
    if (url.pathname === '/api/resources/search' && request.method === 'POST') {
      try {
        const body = await request.json();
        const results = await searchResourcesReal(body);
        return new Response(JSON.stringify({ ok: true, results }), { headers: CORS_HEADERS });
      } catch (error) {
        return new Response(JSON.stringify({ ok: false, error: error.message }), {
          status: 500, headers: CORS_HEADERS
        });
      }
    }
    // 健康检查
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true, service: 'focusmath-radar', time: Date.now() }), { headers: CORS_HEADERS });
    }
    return new Response(JSON.stringify({ ok: false, error: 'not found' }), { status: 404, headers: CORS_HEADERS });
  }
};
