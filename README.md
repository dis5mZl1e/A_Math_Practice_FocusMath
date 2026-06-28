# FocusMath · 专注数学

> ADHD 友好的自适应数学练习应用，专为专注力训练与个性化学习设计。

FocusMath 是一款面向高等数学学习者的单文件 Web 应用，融合了自适应题库、错题图谱、资源雷达与专注力辅助工具。所有核心功能可在浏览器中直接运行，无需配置数据库即可使用；可选启用 MySQL 后端以支持多用户云端同步与题库扩展。

---

## 目录

- [核心特性](#核心特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [功能详解](#功能详解)
  - [自适应练习](#一自适应练习)
  - [题库管理](#二题库管理)
  - [资源雷达](#三资源雷达)
  - [错题知识图谱](#四错题知识图谱)
  - [键盘快捷键系统](#五键盘快捷键系统)
  - [专注力辅助](#六专注力辅助)
- [部署方案](#部署方案)
  - [方案 1：本地零配置使用](#方案-1本地零配置使用最简单)
  - [方案 2：本地 Node.js 服务器](#方案-2本地-nodejs-服务器推荐)
  - [方案 3：部署到免费静态托管](#方案-3部署到免费静态托管)
  - [方案 4：Cloudflare Worker 后端](#方案-4cloudflare-worker-后端可选)
- [数据持久化](#数据持久化)
- [MySQL 可选后端](#mysql-可选后端)
- [键盘快捷键速查](#键盘快捷键速查)
- [开发与贡献](#开发与贡献)
- [许可证](#许可证)

---

## 核心特性

- **自适应练习** — 基于用户答题表现动态调整难度与题目分布，薄弱知识点优先强化
- **资源雷达** — 智能检索全网数学学习资源（文章、视频、演示、讲义、题目），自动识别资源类型并按薄弱点匹配
- **错题知识图谱** — 基于 vis-network 构建知识点关系网络，可视化薄弱环节与学习路径
- **完整题库** — 内置高等数学、线性代数、概率统计三门学科题库，支持增删改查与难度重平衡
- **专注力辅助** — 内置白噪音播放器、番茄钟计时器与计算器，ADHD 友好的视觉设计
- **键盘驱动** — 全键盘可操作的导航、答题与工具调用，支持自定义快捷键绑定
- **本地优先** — 默认基于 IndexedDB + localStorage 离线运行，无需联网即可使用
- **多模式降级** — 后端不可用时自动降级到本地题库与公共代理，确保可用性

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 原生 HTML / CSS / JavaScript（单文件架构） |
| 数学渲染 | [KaTeX](https://katex.org/) |
| 图谱可视化 | [vis-network](https://github.com/visjs/vis-network) |
| PDF / 图片导出 | [jsPDF](https://github.com/parallax/jsPDF) / [html2canvas](https://html2canvas.hertzen.com/) / [JSZip](https://stuk.github.io/jszip/) |
| 本地存储 | IndexedDB + localStorage |
| 本地题库 | [sql.js](https://github.com/sql-js/sql.js)（SQLite WebAssembly） |
| 后端 | Node.js 原生 `http` 模块（无第三方框架） |
| 可选数据库 | MySQL（通过 `mysql2` 驱动） |
| Serverless | Cloudflare Workers |

---

## 项目结构

```
focusmath/
├── focusmath.html        # 主页面（HTML + CSS，单文件入口）
├── app/
│   └── focusmath-app.js  # 前端业务逻辑（约 9000+ 行）
├── server.js             # Node.js 后端服务器（题库 API、资源搜索、身份认证）
├── worker.js             # Cloudflare Worker 轻量后端（资源搜索 API）
├── wrangler.toml         # Worker 部署配置
├── focusmath.sql         # MySQL 数据库初始化脚本
├── focusmath-my.ini      # MySQL 自定义配置模板
├── migrate.js            # 数据库迁移脚本
├── expand-bank.js        # 题库扩展工具
├── scripts/
│   └── rebalance-difficulty.js  # 题目难度重平衡脚本
├── data/                 # 运行时数据目录（自动创建）
│   ├── questions.json     # 内置题库
│   ├── events.jsonl       # 答题事件日志
│   ├── ai-config.json     # AI 模型配置
│   └── identity.json      # 用户身份与认证令牌
├── package.json
└── .gitignore
```

---

## 快速开始

### 环境要求

- **基础使用**：现代浏览器（Chrome / Edge / Firefox / Safari），无需任何安装
- **完整功能**：Node.js 18+（用于本地服务器与后端 API）

### 三种使用方式

#### 方式 A：零配置打开（最简单）

直接双击 `focusmath.html` 用浏览器打开即可。应用以本地模式运行：
- 题库、笔记、收藏全部存储在浏览器本地
- 资源雷达通过内置 CORS 代理获取实时资源（速度较慢，偶尔受限）
- AI 对话、多用户云端同步等需要后端的功能不可用

#### 方式 B：本地服务器（推荐，完整功能）

```bash
# 1. 安装依赖
npm install

# 2. 启动服务器
npm start
# 或：node server.js

# 3. 浏览器访问
# http://localhost:3000/focusmath.html
```

完整功能可用：
- 后端真实搜索资源雷达（更稳定、更快速）
- 题库 API 增删改查
- AI 模型对话（需配置 API Key）
- 多用户身份认证与云端同步（可选）

#### 方式 C：部署到免费静态托管

将整个项目目录上传到 GitHub Pages / Cloudflare Pages / Vercel 静态托管，通过 HTTPS 访问。资源搜索仍走前端 CORS 代理或配置的 Worker 地址。

---

## 功能详解

### 一、自适应练习

- **答题前设置**：选择学科、难度范围、题目类型、时长上限
- **动态难度**：连续答对提升难度，连续答错降低难度，始终保持挑战性
- **薄弱点优先**：根据历史答题数据，优先推送薄弱知识点相关题目
- **即时反馈**：答题后显示正确答案、解析与知识点关联
- **专注力数据**：记录每题作答时长、专注度评分

### 二、题库管理

- **分学科浏览**：高等数学、线性代数、概率统计
- **分页与筛选**：仿题库翻页（`<<` `<` `>` `>>` + 跳页输入）
- **难度重平衡**：根据用户答题表现自动调整题目难度分布
- **增删改查**：完整的题目管理面板，支持选择 / 填空 / 计算 / 证明 / 综合题
- **题目导入导出**：支持 JSON 格式批量导入导出

### 三、资源雷达

资源雷达是本应用的核心特色，能根据学习薄弱点智能检索全网学习资源。

**智能检索**：
- 输入关键词或选择薄弱知识点
- 支持自定义学习目标（自由文本输入）
- 支持自定义学习平台（自由填写网址）

**多平台支持**：

| 平台 | 类型 | 语言 |
|------|------|------|
| Bilibili | 视频 | 中文 |
| 知乎 | 文章 | 中文 |
| CSDN 博客 | 学习笔记 | 中文 |
| MIT OCW | 课程讲义 | 英文 |
| Khan Academy | 教学视频 | 英文 |
| GeoGebra | 交互演示 | 英文 |
| 自定义站点 | 文章 | 任意 |

**资源类型自动识别**：在结果卡片右侧用 CSS 图标 + 文字标注类型：
- 视频 · 文章 · 课程讲义 · 学习笔记 · 题解 · 交互演示 · 题目

**关键设计**：
- 搜索结果直接返回**具体内容链接**（文章、视频、演示），而非平台搜索页
- 英文平台（MIT OCW / Khan Academy）自动翻译中文术语为英文关键词，搜索词不含连线符等无关符号
- 支持复制链接、有用 / 无用反馈、收藏、加入笔记
- 三个面板（薄弱匹配 / 资源结果 / 收藏与笔记）均支持分页

### 四、错题知识图谱

- 基于 vis-network 构建知识点关系网络
- 节点颜色与大小反映掌握程度（绿色=已掌握，红色=薄弱）
- 边连接相关知识点，支持聚类与过滤
- 点击节点查看相关题目与资源

### 五、键盘快捷键系统

全应用键盘可操作，分为三组：

- **导航快捷键**：方向键移动光标、Enter 确认、ESC 返回（基于面包屑路径）
- **答题快捷键**：选项选择、提交、跳过、查看解析
- **工具快捷键**：计算器、白噪音、番茄钟、知识图谱、题库、资源雷达

所有快捷键均可在设置面板中自定义绑定。详情见下方[键盘快捷键速查](#键盘快捷键速查)。

### 六、专注力辅助

- **白噪音播放器**：内置雨声、海浪、森林等环境音，可调音量与混音
- **番茄钟计时器**：25 分钟专注 + 5 分钟休息，可自定义时长
- **计算器**：支持 LaTeX 公式渲染，按钮显示数学符号（√、a⁄b、π 等）
- **视觉设计**：低对比度配色、圆角卡片、平滑过渡动画，降低视觉疲劳

---

## 部署方案

### 方案 1：本地零配置使用（最简单）

```bash
# 直接双击 focusmath.html
```

- 题库、笔记、收藏存浏览器本地
- 资源雷达用内置 CORS 代理（`allorigins.win` / `corsproxy.io` / `thingproxy`）
- 适用：个人学习、快速体验

### 方案 2：本地 Node.js 服务器（推荐）

```bash
npm install
npm start
# 访问 http://localhost:3000/focusmath.html
```

- 完整功能，资源搜索更稳定快速
- 可选启用 MySQL 持久化题库

### 方案 3：部署到免费静态托管

将项目推送到 GitHub，启用 GitHub Pages 或连接 Cloudflare Pages / Vercel：

```bash
# 示例：GitHub Pages
git init && git add . && git commit -m "init"
git remote add origin https://github.com/你的用户名/focusmath.git
git push -u origin main
# 在仓库 Settings → Pages 启用
```

资源搜索仍走前端 CORS 代理，或配置下方 Worker 地址。

### 方案 4：Cloudflare Worker 后端（可选）

部署自己的 Worker 后端，提升资源搜索稳定性，免费额度 10 万次 / 天。

```bash
# 1. 安装 wrangler CLI
npm install -g wrangler

# 2. 登录 Cloudflare
npx wrangler login

# 3. 部署（项目根目录执行）
npx wrangler deploy
# 返回地址如：https://focusmath-radar.你的子域名.workers.dev
```

然后在 FocusMath 应用内：
1. 进入 **资源雷达 → 设置**
2. 在 **"Serverless 后端地址"** 输入框填入 Worker 地址
3. 保存

之后无论从哪里访问（file://、静态托管、本地服务器），资源搜索都会优先调用你部署的 Worker。

---

## 数据持久化

| 存储方式 | 用途 | 触发条件 |
|----------|------|----------|
| IndexedDB | 题库缓存、答题记录、笔记、收藏 | 始终启用 |
| localStorage | 用户偏好、设置、会话状态 | 始终启用 |
| JSON 文件 | 题库、事件日志、AI 配置 | 启用服务器时 |
| MySQL | 多用户数据、扩展题库 | 配置数据库连接时 |

---

## MySQL 可选后端

启用 MySQL 后可支持多用户身份认证、云端同步与扩展题库。

### 1. 数据库初始化

```bash
# 使用提供的 SQL 脚本
mysql -u root -p < focusmath.sql
```

### 2. 自定义配置（可选）

编辑 `focusmath-my.ini` 调整 MySQL 参数，或通过环境变量配置连接：

```bash
# .env 或环境变量
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=focusmath
```

### 3. 迁移与扩展

```bash
# 运行数据库迁移
npm run migrate:sql

# 扩展题库
node expand-bank.js

# 重平衡题目难度
node scripts/rebalance-difficulty.js
```

### 4. 身份认证

支持 Magic Link 邮箱免密登录。配置 SMTP 后可发送登录邮件：

```bash
SMTP_HOST=smtp.你的邮箱服务商.com
SMTP_PORT=587
SMTP_USER=你的邮箱账号
SMTP_PASS=你的邮箱密码
SMTP_FROM=发件人地址
```

未配置 SMTP 时，Magic Link 会输出到服务器控制台，方便开发测试。

---

## 键盘快捷键速查

> 所有快捷键均可在 **设置 → 键盘快捷键** 中自定义。

### 导航类

| 快捷键 | 功能 |
|--------|------|
| `↑` `↓` `←` `→` | 主页 2D 网格移动光标 |
| `Enter` | 选中（首次按下选中，二次确认） |
| `ESC` | 按面包屑路径返回上一页 |
| `1` | 题库 |
| `2` | 知识图谱 |
| `3` | 设置 |
| `4` | 答题设置 |
| `5` | 分析面板 |
| `6` | 资源雷达 |

### 答题类

| 快捷键 | 功能 |
|--------|------|
| `1`-`9` | 选择对应选项 |
| `Shift` + `↑` `↓` `←` `→` | 答题界面移动选择光标 |
| `↑` `↓` `←` `→` | 移动选项选择 |
| `Enter` | 提交答案 |
| `Shift` + `C` | 开关计算器 |

### 工具类

| 快捷键 | 功能 |
|--------|------|
| `C` | 计算器 |
| `M` | 白噪音 |
| `T` | 番茄钟 |
| `G` | 知识图谱 |

---

## 开发与贡献

### 开发环境

```bash
git clone <仓库地址>
cd focusmath
npm install
npm start
```

修改 `app/focusmath-app.js` 后刷新浏览器即可生效，无需构建。

### 代码规范

- 前端单文件架构：`focusmath.html` 负责结构 + 样式，`app/focusmath-app.js` 负责逻辑
- 后端无第三方框架：`server.js` 使用 Node.js 原生 `http` 模块，路由手动分发
- 禁止在应用中使用 emoji（保持视觉一致性）
- 计算器按钮显示数学符号而非 LaTeX 命令（如 `√` 而非 `sqrt`）
- 所有页面长度变化使用平滑过渡动画
- 面包屑路径严格反映真实访问历史，连续相同页面压缩为一个

### 目录约定

- `app/` — 前端 JavaScript
- `scripts/` — 开发辅助脚本
- `data/` — 运行时数据（已 gitignore）
- `.trae/specs/` — 功能规格文档

### 测试

项目暂无自动化测试套件。手动测试建议：

```bash
# 启动服务器
npm start

# 验证资源搜索 API
curl -X POST http://localhost:3000/api/resources/search \
  -H "Content-Type: application/json" \
  -d '{"query":"极限","platforms":["zhihu","bilibili","mitocw"]}'
```

---

## 许可证

本项目为私有项目，未开源。如需使用请联系作者。

---

## 致谢

- [KaTeX](https://katex.org/) — 快速数学公式渲染
- [vis-network](https://github.com/visjs/vis-network) — 知识图谱可视化
- [sql.js](https://github.com/sql-js/sql.js) — WebAssembly SQLite
- [Cloudflare Workers](https://workers.cloudflare.com/) — Serverless 后端平台

---

**FocusMath** · 让数学学习更专注、更高效。
