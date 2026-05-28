# 鹅苗星图 Emiao Growth Map

在线 Demo 链接占位：

> Render 部署完成后，将线上地址填写到这里。

截图占位：

| Hero 产品驾驶舱 | HRBP 工作台 | 学生详情抽屉 |
| --- | --- | --- |
| ![Hero 首屏](./docs/screenshots/hero-placeholder.svg) | ![HRBP 工作台](./docs/screenshots/hr-workbench-placeholder.svg) | ![学生详情抽屉](./docs/screenshots/student-sheet-placeholder.svg) |

## 作业对应关系

本项目对应腾讯 AI-HR 培训生线上实战营作业四：「实习能量站」业务部新人成长导航智能看板。

它不是作业三的“30-60-90 学习路径”。页面可以出现 Day 1 / Day 7 / Day 14 / Day 30 / Day 60 / Day 90 作为阶段观察点，但主线是“入营 → 上手 → 协同 → 产出 → 适岗复盘”的实习生成长导航。

## 项目亮点

- 模拟后端 API：使用 Next.js Route Handlers 和 server-side memory store，核心数据通过 API 读写。
- 三角色工作台：实习生、导师、HRBP 都有自己的可操作页面。
- 数据闭环：任务完成 → 导师反馈 → 风险识别 → KPI 更新 → AI 周报生成。
- 适岗证据链：学生详情抽屉展示任务证据、导师证据、行为信号和 AI 建议。
- AI 边界说明：AI 风险判断只作为沟通线索，不直接作为留用、淘汰或评价依据。

## 模拟后端接口

Demo 阶段使用内存数据，不需要真实数据库。真实落地时可接入 HRIS、招聘系统、员工系统和企业 IM。

- `GET /api/students`：返回 20 名实习生数据和看板指标。
- `PATCH /api/students/[id]/tasks`：更新任务完成状态，并重新计算进度、能量、阶段和风险。
- `POST /api/feedback`：模拟 AI 生成结构化反馈，写入学生档案。
- `POST /api/weekly-report`：基于当前任务、反馈、风险生成 AI 周报。
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

0-10 秒：打开产品驾驶舱，说明“鹅苗星图”面向作业四实习能量站，右侧 dashboard 已展示 20 名实习生、任务完成率、需关注人数和最近操作。

10-22 秒：点击“体验实习生视角”，选择不同岗位实习生，勾选一个任务，展示进度、能量、风险和操作日志变化。

22-36 秒：切到“导师工作台”，选择反馈对象，输入观察，点击生成 AI 反馈，展示“肯定 / 建议 / 下周行动”三段结果。

36-50 秒：切到“HRBP 工作台”，筛选“需关注”或“高适岗”，打开学生详情抽屉，重点展示适岗证据链和 AI 边界提醒。

50-60 秒：切到“AI 周报”，点击生成或重新生成，展示 loading 步骤、周报结构、复制和导出 Markdown。

## 300 字提交说明

我的作品叫“鹅苗星图 Emiao Growth Map”，对应作业四「实习能量站」业务部新人成长导航智能看板。它解决的不是单点任务管理，而是实习生、导师、HRBP 三方协作中的信息断点：新人不知道下一步该做什么，导师反馈依赖经验，HRBP 很难及时看到风险和适岗证据。因此我把产品设计成一个 AI 实习生成长导航工作台，用模拟后端 API 串起任务、反馈、风险、KPI 和周报。实习生端可以按岗位完成阶段任务，导师端可以把自然观察生成结构化反馈，HRBP 端可以筛选 20 名实习生并查看适岗证据链。AI 在这里不是冷冰冰地评价人，而是做重复整理、提醒、归纳和初步风险识别；最终沟通、分寸和判断仍由导师与 HRBP 完成。作品同时嵌入沟通型、分析型、创意型、技术应用型 HR 能力，并体现用户为本、科技向善、正直、进取、协作和创造。

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
  star-map.tsx
  ui/
data/
  mockStudents.ts
lib/
  demo-store.ts
  growth.ts
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
