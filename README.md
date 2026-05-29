# 鹅苗星图 Emiao Growth Map

在线体验：
> Render 部署完成后，把线上地址填在这里。

对应作业：腾讯 AI-HR 培训生线上实战营作业四「实习能量站」业务部新人成长导航智能看板。  
说明：本项目不是作业三的 30-60-90 学习路径，而是围绕业务部实习生、导师、HRBP 三方协同的成长导航工具。

## 项目亮点

- 单人主线 Story Mode：用户始终扮演 AI-HRBP，只围绕一名实习生完成完整闭环。
- 模拟后端 API：任务、反馈、事件、周报和报告都通过 Next.js Route Handlers 读写。
- 数据闭环：提交任务进展 → 生成导师检查点 → 写入结构化反馈 → HRBP 查看适岗证据链 → 生成复盘报告。
- 适岗证据链：把任务证据、导师证据、行为信号和 AI 建议放在同一页。
- AI 边界说明：AI 只负责整理、提醒、归纳和初步判断，不直接作为留用、淘汰或评价依据。
- 高级模式保留：`/dashboard` 保留 20 人数据、AI 周报和完整工作台。

## 主线页面

- `/`：任务接入页，AI-HRBP 收到业务部求助。
- `/briefing`：业务求助简报，说明实习生迷茫、导师凭经验、HRBP 信息断点。
- `/profile`：5 步创建鹅苗档案，每步只问一个问题。
- `/diagnosis`：成长困惑诊断，将“我不知道”拆成目标不清、交付不清、反馈不清。
- `/mission`：本周成长任务，只围绕当前实习生推进一个可验证交付。
- `/mentor`：导师检查点，生成肯定、建议、下周行动三段式反馈。
- `/hrbp`：HRBP 适岗证据链，适合作为参赛截图。
- `/report`：生成 LaTeX 风格成长复盘报告，PDF 不可编译时提供 fallback。
- `/dashboard`：高级工作台，保留 20 人全量数据和 AI 周报。

## 本地运行

```bash
npm install
npm run dev
```

默认打开：

```txt
http://localhost:3000
```

如果 3000 被其他项目占用：

```bash
npm run dev -- -p 3001
```

然后打开：

```txt
http://localhost:3001
```

生产构建检查：

```bash
npm run build
npm run start
```

## Render 部署

1. 在 Render 创建 Web Service。
2. 连接 GitHub 仓库 `hansu650/tencent-homework`。
3. Runtime 选择 Node。
4. Build Command：

```bash
npm install && npm run build
```

5. Start Command：

```bash
npm run start
```

6. Node 版本建议使用 `22.12.0` 或更高。

## API 说明

Demo 阶段使用服务端内存数据，不需要数据库。真实落地时可接入 HRIS、招聘系统、员工系统和企业 IM。

- `GET /api/students`：返回 20 名实习生数据。
- `PATCH /api/students/[id]/tasks`：更新某个学生任务完成状态，并重新计算进度、能量、阶段和风险。
- `POST /api/feedback/request`：生成导师待反馈记录。
- `POST /api/feedback`：模拟 AI 生成结构化反馈并写入学生档案。
- `POST /api/weekly-report`：基于当前学生状态生成 AI 周报。
- `GET /api/events`：返回最近操作记录。
- `POST /api/reset`：重置演示数据，方便录视频。
- `POST /api/report/latex`：生成 LaTeX 报告。
- `GET /api/report/tex`：下载最近生成的 `.tex` 文件。
- `POST /api/report/pdf`：尝试编译 PDF，失败时返回打印 PDF fallback。

## 1 分钟演示路径

0-8 秒：打开 `/`，说明你扮演 AI-HRBP，接到业务部求助。  
8-16 秒：进入 `/briefing`，展示三类问题：实习生迷茫、导师凭经验、HRBP 信息断点。  
16-28 秒：进入 `/profile`，一步一步选择岗位、输入姓名、选择困惑、选择导师。  
28-36 秒：进入 `/diagnosis`，说明 AI 把“我不知道”拆成可行动线索。  
36-46 秒：进入 `/mission`，选择任务，点击 AI 拆解，再提交一次进展。  
46-54 秒：进入 `/mentor`，输入导师观察，生成肯定、建议、下周行动。  
54-60 秒：进入 `/hrbp` 和 `/report`，展示适岗证据链、AI 边界和成长复盘报告。

## 适合截图的页面

- `/`：克制的 AI-HRBP 任务接入页。
- `/profile`：一步一问的鹅苗档案创建页。
- `/hrbp`：适岗证据链和雷达图。
- `/report`：正式报告预览和生成步骤。

## 300 字提交说明

我的作品叫「鹅苗星图 Emiao Growth Map」，对应作业四「实习能量站」业务部新人成长导航智能看板。它不是作业三的 30-60-90 学习路径，而是把实习生、导师和 HRBP 的协同做成一条可体验的 AI-HR 主线。用户扮演 AI-HRBP，从接收业务部求助开始，为一名实习生创建档案、识别成长困惑、生成本周岗位任务、提交进展、触发导师检查点，再把导师反馈沉淀为 HRBP 可用的适岗证据链，最后生成《鹅苗成长导航复盘报告》。产品解决的核心问题是：实习生不知道下一步做什么，导师带教标准依赖经验，HRBP 难以及时看到适岗证据。AI 在其中不替代导师和 HRBP，只负责整理、提醒、归纳和初步判断，最终沟通分寸和录用判断仍由人完成。作品体现了沟通型 HR、分析型 HR、创意型 HR 和技术应用型 HR 能力，也把用户为本、科技向善、正直、进取、协作、创造融入到功能流程中。
