# 鹅苗星图 Emiao Growth Map

在线 Demo 链接占位：

> Render 部署完成后，将线上地址填写到这里。

截图占位：

| 剧情开场页 | HRBP 证据页 | 报告生成页 |
| --- | --- | --- |
| ![剧情开场页](./docs/screenshots/hero-placeholder.svg) | ![HRBP 证据页](./docs/screenshots/hr-workbench-placeholder.svg) | ![报告生成页](./docs/screenshots/student-sheet-placeholder.svg) |

## 作业对应关系

本项目对应腾讯 AI-HR 培训生线上实战营作业四：「实习能量站」业务部新人成长导航智能看板。

它不是作业三的“30-60-90 学习路径”。主线是“入营 → 上手 → 协同 → 产出 → 适岗复盘”的实习生成长导航，并用 W1 / W2 / W3 / W4 / 复盘作为节奏标记。

## 项目亮点

- 模拟后端 API：使用 Next.js Route Handlers 和 server-side memory store，核心数据通过 API 读写。
- 剧情式多页面主流程：首页不再是 dashboard，而是从暴雨入营夜开始的 Story Mode。
- 三角色工作台：实习生、导师、HRBP 都有自己的可操作页面。
- 数据闭环：任务完成 → 导师反馈 → 风险识别 → KPI 更新 → AI 周报生成。
- 适岗证据链：学生详情抽屉展示任务证据、导师证据、行为信号和 AI 建议。
- 最终产出物：支持生成 LaTeX 风格《鹅苗成长导航复盘报告》，下载 `.tex`，PDF 编译失败时提供 fallback。
- AI 边界说明：AI 风险判断只作为沟通线索，不直接作为留用、淘汰或评价依据。

## 页面章节

- `/`：剧情开场页，雨夜 / 数据雨动效，启动鹅苗星图。
- `/briefing`：任务简报页，解释实习生、导师、HRBP 的三类痛点。
- `/profile`：创建鹅苗档案页，选择产品鹅 / 研发鹅 / 销售鹅并填写档案。
- `/mission`：成长导航任务页，完成岗位任务、AI 拆解、提交进展、请求导师反馈。
- `/mentor`：导师检查点页，生成结构化反馈。
- `/hrbp`：HRBP 适岗证据页，展示雷达图和证据链。
- `/report`：生成 LaTeX / PDF 报告页。
- `/dashboard`：保留原综合工作台，作为高级模式入口。

## 模拟后端接口

Demo 阶段使用内存数据，不需要真实数据库。真实落地时可接入 HRIS、招聘系统、员工系统和企业 IM。

- `GET /api/students`：返回 20 名实习生数据和看板指标。
- `PATCH /api/students/[id]/tasks`：更新任务完成状态，并重新计算进度、能量、阶段和风险。
- `POST /api/feedback`：模拟 AI 生成结构化反馈，写入学生档案。
- `POST /api/feedback/request`：学生请求导师围绕某个任务补充反馈。
- `POST /api/weekly-report`：基于当前任务、反馈、风险生成 AI 周报。
- `POST /api/report/latex`：根据当前学生生成 LaTeX 报告字符串。
- `GET /api/report/tex`：下载最近生成的 `.tex` 文件。
- `POST /api/report/pdf`：尝试编译 PDF，失败时返回浏览器打印 fallback。
- `GET /api/events`：返回最近操作记录。
- `POST /api/reset`：重置演示数据，方便录制视频。

## 本地运行

```bash
npm install
npm run dev
```

打开：

```txt
http://localhost:3000
```

生产构建检查：

```bash
npm run build
npm run start
```

## Render 部署

1. 打开 Render Dashboard，选择 **New + → Web Service**。
2. 连接 GitHub 仓库 `hansu650/tencent-homework`。
3. Root Directory 保持仓库根目录。
4. Runtime 选择 `Node`。
5. Build Command：

```bash
npm install && npm run build
```

6. Start Command：

```bash
npm run start
```

7. Node 版本建议使用 `22.13.0` 或仓库 `package.json` 中允许的 Node 22+ 版本。

## 1 分钟演示路径

0-8 秒：打开剧情开场页，说明“暴雨入营夜”里 20 名实习生、导师和 HRBP 的信息断点正在出现，点击“启动鹅苗星图”。

8-16 秒：进入任务简报，展示实习生迷茫、导师凭经验、HRBP 信息断点三张问题卡。

16-28 秒：创建鹅苗档案，选择产品鹅 / 研发鹅 / 销售鹅，填写姓名、岗位、导师和当前困惑，生成成长导航卡。

28-42 秒：进入成长导航任务页，点击 AI 拆解、提交进展、请求导师反馈，展示任务、导师标准和 HRBP 信号联动。

42-52 秒：进入导师检查点，生成“肯定 / 建议 / 下周行动”结构化反馈。

52-60 秒：进入 HRBP 证据页和报告页，展示适岗证据链、AI 边界提醒，并生成 LaTeX 报告。

## 300 字提交说明

我的作品叫“鹅苗星图 Emiao Growth Map”，对应作业四「实习能量站」业务部新人成长导航智能看板。它不是普通后台，而是一个剧情式 AI-HR Demo：从“暴雨入营夜”的任务简报开始，用户创建第一位鹅苗档案，完成岗位任务，请求导师反馈，再进入 HRBP 适岗证据页，最终生成《鹅苗成长导航复盘报告》。产品解决的是实习生、导师、HRBP 三方协作中的信息断点：新人不知道下一步做什么，导师反馈依赖经验，HRBP 难以及时看到适岗证据。AI 在其中负责整理、提醒、归纳和初步风险识别，不替代导师和 HRBP 的沟通分寸与最终判断。作品体现沟通型、分析型、创意型、技术应用型 HR 能力，也把用户为本、科技向善、正直、进取、协作、创造融入功能。

## 目录结构

```txt
app/
  api/
    events/
    feedback/
    reset/
    students/
    weekly-report/
  globals.css
  layout.tsx
  page.tsx
components/
  emiao-growth-map.tsx
  story-mode.tsx
  star-map.tsx
  ui/
data/
  mockStudents.ts
lib/
  demo-store.ts
  growth.ts
  report-builder.ts
  report-cache.ts
  story-content.ts
  utils.ts
```

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui 风格组件
- lucide-react
- Recharts
- framer-motion
- Next.js Route Handlers 模拟后端
    report/
