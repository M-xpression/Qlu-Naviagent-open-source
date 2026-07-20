# 🎓 齐鲁工业大学 · 校园智能导览

> 面向齐鲁工业大学（山东省科学院）长清校区新生的智能校园平台  
> 校园介绍 × 交互地图 × AI 智能问答 — 一个网站搞定所有新生问题

## ✨ 功能亮点

| 模块 | 功能 |
|------|------|
| 🏫 **校园介绍** | 学校概况、院系专业、学科实力、奖助学金、收费考研、新生必备物资清单 |
| 🗺️ **校园地图** | 长清校区高清平面图 + 可缩放拖拽 + 分类热点标注 + 点击查看建筑详情 |
| 🤖 **Mars学长 AI** | 基于 DeepSeek 大模型的智能问答，覆盖校园生活方方面面，流式打字回复 |
| 📋 **管理后台** | 地图热点增删改、知识库管理、数据导出导入 |

## 🛠️ 技术栈

| 层次 | 技术 |
|------|------|
| 框架 | Vue 3 + Element Plus + Pinia + Vue Router |
| 构建 | Vite 8 |
| AI | DeepSeek-V3 API（SSE 流式输出） |
| 部署 | Vercel |
| 后端 | Spring Boot 3 + MyBatis-Plus + MySQL + Sa-Token（可选，前端已独立运行） |

## 📸 预览

- 校园介绍：`/` — 新生攻略、设施概览、物资清单
- 校园地图：`/map` — 长清校区平面图 + 地点标注 + 分类筛选
- AI 对话：`/chat` — Mars 学长智能问答
- 管理后台：`/admin/hotspots` — 热点坐标管理

## 🚀 快速开始

```bash
cd frontend
npm install
npm run dev
```

浏览器打开 `http://localhost:4300`

## 📦 生产部署

```bash
cd frontend
npm run build
# dist/ 目录即为生产文件，直接部署到任意静态托管
```

推荐使用 [Vercel](https://vercel.com) 一键部署：连接 GitHub 仓库 → Root Directory 选 `frontend` → 添加环境变量 `VITE_DEEPSEEK_KEY` → Deploy

## ⚙️ 环境变量

| 变量 | 说明 |
|------|------|
| `VITE_DEEPSEEK_KEY` | DeepSeek API Key，[免费注册获取](https://platform.deepseek.com) |

## 📁 项目结构

```
qlu-campus-guide/
├── frontend/          # Vue 3 前端
│   ├── src/
│   │   ├── views/     # 页面：Home / Map / Chat / Admin
│   │   ├── stores/    # Pinia 状态管理
│   │   ├── components/ # 布局 / 地图 / 对话组件
│   │   └── data/      # AI 知识库 Prompt
│   ├── public/        # 校徽 / 头像 / 地图图片 / 微信二维码
│   └── dist/          # 生产构建输出
├── backend/           # Spring Boot 后端（可选）
├── knowledge/         # 校园知识库文档
├── sql/               # 数据库脚本
└── docs/              # 项目文档
```

## 🙋 关于

本项目由齐鲁工业大学计算机学部在校生开发，旨在为新生提供一站式校园信息获取体验。欢迎 Star ⭐ 和 PR！

---

**许可证**：MIT
