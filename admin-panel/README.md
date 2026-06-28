# FocusMath 后端管理面板

> 独立可运行的后端管理可视化界面，包含题库管理、用户信息管理和评论管理。

无需依赖 FocusMath 主项目，将此文件夹单独复制到任何位置运行 `node admin-server.js` 即可使用。

## 功能概览

| 模块 | 功能 |
|------|------|
| 仪表盘 | 用户/题目/评论统计概览，后端连接状态 |
| 题库管理 | 增删改查、分页搜索、批量导入、按学科筛选 |
| 用户信息 | 增删改查、角色管理（学生/教师/管理员）、状态控制 |
| 评论管理 | 审核（通过/拒绝/待定）、批量操作、管理员回复 |
| 系统设置 | FocusMath API 对接配置、管理令牌、数据导出 |

## 快速开始

### 环境要求

- Node.js 14+（仅使用内置模块，无需安装任何依赖）

### 启动

```bash
node admin-server.js
```

启动后控制台会输出：

```
========================================
  FocusMath 后端管理面板已启动
========================================
  访问地址: http://localhost:3001
  管理令牌: <自动生成的 32 位令牌>
----------------------------------------
  首次访问请用上述令牌登录
  数据目录: <路径>/data
========================================
```

浏览器访问 `http://localhost:3001`，输入控制台显示的管理令牌登录。

### 自定义端口

```bash
# 方式 1：环境变量
PORT=8080 node admin-server.js

# 方式 2：PowerShell
$env:PORT=8080; node admin-server.js
```

## 目录结构

```
admin-panel/
├── admin-server.js       # 后端服务器（独立可运行，无第三方依赖）
├── public/
│   └── index.html        # 管理界面（HTML + CSS + JS 单文件）
├── data/                 # 运行时数据（自动创建）
│   ├── users.json         # 用户数据
│   ├── comments.json      # 评论数据
│   ├── questions.json     # 本地题库
│   └── settings.json      # 系统设置（含管理令牌）
├── package.json
├── .gitignore
└── README.md
```

## 数据存储

所有数据以 JSON 文件形式存储在 `data/` 目录：

| 文件 | 内容 |
|------|------|
| `users.json` | 用户列表（id, username, email, role, status, createdAt, notes） |
| `comments.json` | 评论列表（id, userId, userName, targetType, targetId, content, status, reply, createdAt） |
| `questions.json` | 本地题库（meta, questions[]） |
| `settings.json` | 系统设置（adminToken, focusmathApi） |

数据可手动备份、迁移或编辑。在系统设置页可一键导出全部数据为 JSON 文件。

## 对接 FocusMath 主项目

此管理面板可独立运行，也可对接 FocusMath 主项目的后端 API 拉取真实题库：

1. 启动 FocusMath 主项目服务器：`node server.js`（默认端口 3000）
2. 在管理面板的 **系统设置 → FocusMath API 地址** 填入 `http://localhost:3000`
3. 保存后，题库管理页面的搜索会优先从 FocusMath 后端拉取数据

未配置时，题库管理使用本地 JSON 存储。

## API 接口

管理面板后端提供以下 RESTful API：

### 认证
- `POST /api/admin/login` — 令牌登录
- `GET /api/admin/info` — 后端信息

### 用户管理
- `GET /api/users?search=&status=&role=` — 用户列表（支持筛选）
- `POST /api/users` — 添加用户
- `PUT /api/users/:id` — 更新用户
- `DELETE /api/users/:id` — 删除用户

### 评论管理
- `GET /api/comments?status=&targetType=&search=` — 评论列表（支持筛选）
- `POST /api/comments` — 添加评论
- `PUT /api/comments/:id` — 更新评论（状态/回复）
- `DELETE /api/comments/:id` — 删除评论
- `POST /api/comments/batch` — 批量审核

### 题库管理
- `GET /api/questions?subject=&search=` — 题目列表（优先对接 FocusMath）
- `POST /api/questions` — 添加题目
- `PUT /api/questions/:id` — 更新题目
- `DELETE /api/questions/:id` — 删除题目
- `POST /api/questions/import` — 批量导入

### 系统设置
- `GET /api/settings` — 获取设置
- `PUT /api/settings` — 保存设置
- `GET /api/dashboard` — 仪表盘统计数据

所有接口（除登录外）需在请求头携带 `Authorization: Bearer <管理令牌>`。

## 独立运行说明

此文件夹完全独立，满足以下条件：

- 无 `node_modules` 依赖（仅用 Node.js 内置 `http` / `fs` / `path` / `crypto`）
- 无外部 CSS / JS 引用（前端单文件，所有样式与脚本内联）
- 数据自包含（JSON 文件存储在本地 `data/` 目录）
- 可对接 FocusMath 主项目（可选，非必需）

将 `admin-panel/` 文件夹复制到任何位置，运行 `node admin-server.js` 即可启动。

## 安全说明

- 管理令牌在首次启动时自动生成，存储在 `data/settings.json`
- 所有 API（除登录）需 Bearer Token 认证
- 令牌通过 localStorage 保存在浏览器，关闭浏览器后需重新登录
- 生产环境建议配置 HTTPS 反向代理
