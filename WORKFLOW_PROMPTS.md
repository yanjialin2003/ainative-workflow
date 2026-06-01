# Workflow

## 可用变量示例

```text
{{taskId}}
{{taskTitle}}
{{taskPrompt}}
{{gitBranch}}
{{gitBaseBranch}}
{{gitWorktreePath}}
{{projectName}}
{{projectDefaultBranch}}
```

## Agents 默认执行流程

按照如下流程执行，并且必须保证顺序：

1. `RequirementUnderstanding`
2. `TechnicalDesign`
3. `GoalDefinition`
4. `GoalExecution`
5. `GoalVerification`
6. `CreatePullRequest`
7. `PRRevision`
8. `ReleaseReview`

## 节点 Prompt 模板

### RequirementUnderstanding

```text
使用需求理解技能，基于以下输入完成需求澄清与范围界定：
{{taskPrompt}}

项目信息：
- 项目：{{projectName}}
- 任务：{{taskTitle}}
- 分支：{{gitBranch}}
- 工作目录：{{gitWorktreePath}}

输出要求：
1. 不要向用户追问问题，不要只输出“待确认项”后停止。
2. 如果信息不足，只允许做最小必要假设，并在产物中单独列出“假设与风险”。
3. 必须将结果写入 `docs/titing/{{taskId}}/requirement-understanding.md`。
4. 不允许只在 stdout 输出分析而不落盘。
```

- `requiresApproval: false`
- `loopEnabled: false`
- `maxLoops: 1`
- `nodeType: requirement_understanding`
- `artifactPath: docs/titing/{{taskId}}/requirement-understanding.md`
- `exitWhen: artifact_exists`

### TechnicalDesign

```text
使用技术设计技能，基于需求理解产物完成技术方案：

输入：
- 原始需求：{{taskPrompt}}
- 需求理解：`docs/titing/{{taskId}}/requirement-understanding.md`

项目信息：
- 项目：{{projectName}}
- 任务：{{taskTitle}}
- 分支：{{gitBranch}}
- 工作目录：{{gitWorktreePath}}

输出要求：
1. 若上游产物缺失或信息不足，只允许做最小必要假设。
2. 所有假设必须单独列出，不得混入正式结论。
3. 必须将结果写入 `docs/titing/{{taskId}}/technical-design.md`。
4. 不允许只在 stdout 输出总结而不写文件。
```

- `requiresApproval: false`
- `loopEnabled: false`
- `maxLoops: 1`
- `nodeType: technical_design`
- `artifactPath: docs/titing/{{taskId}}/technical-design.md`
- `exitWhen: artifact_exists`

### GoalDefinition

```text
使用目标定义技能，基于需求理解和技术设计生成可执行目标定义：

输入：
- 原始需求：{{taskPrompt}}
- 需求理解：`docs/titing/{{taskId}}/requirement-understanding.md`
- 技术设计：`docs/titing/{{taskId}}/technical-design.md`

项目信息：
- 项目：{{projectName}}
- 任务：{{taskTitle}}
- 分支：{{gitBranch}}
- 工作目录：{{gitWorktreePath}}

输出要求：
1. 生成结构化 goal.yaml，包含目标、验收标准、约束和验证命令。
2. 信息不足时做最小必要假设，并写入 goal.yaml 的 risks 或 assumptions 字段。
3. 必须将结果写入 `docs/titing/{{taskId}}/goal.yaml`。
4. 不允许只在 stdout 输出总结而不写文件。
```

- `requiresApproval: true`
- `loopEnabled: false`
- `maxLoops: 1`
- `nodeType: goal_definition`
- `artifactPath: docs/titing/{{taskId}}/goal.yaml`
- `exitWhen: artifact_exists`

### GoalExecution

```text
使用目标执行技能，基于 goal.yaml 执行实现：

输入：
- 原始需求：{{taskPrompt}}
- Goal 定义：`docs/titing/{{taskId}}/goal.yaml`
- 技术设计：`docs/titing/{{taskId}}/technical-design.md`

项目信息：
- 项目：{{projectName}}
- 任务：{{taskTitle}}
- 默认分支：{{projectDefaultBranch}}
- 当前分支：{{gitBranch}}
- 工作目录：{{gitWorktreePath}}

执行要求：
1. 直接修改仓库或更新指定产物，不要只给方案不执行。
2. 不要向用户追问问题。
3. 信息不足时只允许做最小必要假设，并单列风险与待确认项。
4. 必须写入执行报告 `docs/titing/{{taskId}}/execution-report.md`。
5. 如果目标未满足，可在执行报告中写入失败原因，供循环判断是否继续。
```

- `requiresApproval: false`
- `loopEnabled: true`
- `maxLoops: 3`
- `nodeType: goal_execution`
- `artifactPath: docs/titing/{{taskId}}/execution-report.md`
- `exitWhen: goal_satisfied`

### GoalVerification

```text
使用目标验证技能，基于 goal.yaml 和执行结果验证目标是否满足：

输入：
- Goal 定义：`docs/titing/{{taskId}}/goal.yaml`
- 执行报告：`docs/titing/{{taskId}}/execution-report.md`

项目信息：
- 项目：{{projectName}}
- 任务：{{taskTitle}}
- 当前分支：{{gitBranch}}
- 工作目录：{{gitWorktreePath}}

验证要求：
1. 运行 goal.yaml 中列出的验证命令，读取完整输出和退出码。
2. 明确记录通过、失败和未执行项。
3. 必须将验证报告写入 `docs/titing/{{taskId}}/verification-report.md`。
4. 若目标未满足，报告中必须说明需要回到 GoalExecution 的原因。
```

- `requiresApproval: false`
- `loopEnabled: true`
- `maxLoops: 3`
- `nodeType: goal_verification`
- `artifactPath: docs/titing/{{taskId}}/verification-report.md`
- `exitWhen: goal_satisfied`

### CreatePullRequest

```text
使用 PR 创建技能，在目标验证满足后创建或准备 Pull Request：

输入：
- Goal 定义：`docs/titing/{{taskId}}/goal.yaml`
- 验证报告：`docs/titing/{{taskId}}/verification-report.md`

项目信息：
- 项目：{{projectName}}
- 任务：{{taskTitle}}
- 默认分支：{{projectDefaultBranch}}
- 当前分支：{{gitBranch}}
- 工作目录：{{gitWorktreePath}}

输出要求：
1. 汇总变更、验证结果和风险。
2. 创建 PR 或生成可直接使用的 PR 描述。
3. 必须将 PR 记录写入 `docs/titing/{{taskId}}/pull-request.md`。
```

- `requiresApproval: true`
- `loopEnabled: false`
- `maxLoops: 1`
- `nodeType: create_pull_request`
- `artifactPath: docs/titing/{{taskId}}/pull-request.md`
- `exitWhen: manual_approved`

### PRRevision

```text
使用 PR 修改技能，基于 PR 反馈完成必要修订：

输入：
- PR 记录：`docs/titing/{{taskId}}/pull-request.md`
- 验证报告：`docs/titing/{{taskId}}/verification-report.md`

项目信息：
- 项目：{{projectName}}
- 任务：{{taskTitle}}
- 当前分支：{{gitBranch}}
- 工作目录：{{gitWorktreePath}}

执行要求：
1. 只处理 PR 反馈要求的修改，不扩大范围。
2. 修改后运行相关验证命令。
3. 必须将修订报告写入 `docs/titing/{{taskId}}/pr-revision.md`。
4. 若反馈已全部处理，在报告中记录完成状态。
```

- `requiresApproval: false`
- `loopEnabled: true`
- `maxLoops: 3`
- `nodeType: pr_revision`
- `artifactPath: docs/titing/{{taskId}}/pr-revision.md`
- `exitWhen: goal_satisfied`

### ReleaseReview

```text
使用发布复核技能，完成合并或发布前最终检查：

输入：
- Goal 定义：`docs/titing/{{taskId}}/goal.yaml`
- PR 记录：`docs/titing/{{taskId}}/pull-request.md`
- PR 修订报告：`docs/titing/{{taskId}}/pr-revision.md`

项目信息：
- 项目：{{projectName}}
- 任务：{{taskTitle}}
- 默认分支：{{projectDefaultBranch}}
- 当前分支：{{gitBranch}}
- 工作目录：{{gitWorktreePath}}

复核要求：
1. 检查验收标准、验证证据、PR 状态和残余风险。
2. 不要向用户追问问题；信息不足时做最小必要假设并列出风险。
3. 必须将发布复核报告写入 `docs/titing/{{taskId}}/release-review.md`。
4. 明确给出是否可进入发布或合并流程。
```

- `requiresApproval: true`
- `loopEnabled: false`
- `maxLoops: 1`
- `nodeType: release_review`
- `artifactPath: docs/titing/{{taskId}}/release-review.md`
- `exitWhen: manual_approved`

