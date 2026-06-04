---
icon: material/code-braces
---

# 软件系统

DeepLink Next 的软件系统围绕训推任务和 Agent Runtime 展开：上层承接模型训练、后训练和推理服务，下层通过运行时把执行、状态和观测统一起来。

## 训推框架

<div class="grid cards" markdown>

- :material-school-outline:{ .lg .middle } __预训练__

    面向大模型训练任务，承接模型构建、数据流转和多芯片适配。

- :material-rocket-launch-outline:{ .lg .middle } __后训练__

    面向强化学习、Agent 训练和反馈闭环，让模型能力持续迭代。

- :material-api:{ .lg .middle } __推理服务__

    面向在线推理、多模型服务和应用接入，为上层 Agent 系统提供模型能力。

</div>

## 智能体运行时

<div class="grid cards" markdown>

- :material-server-network:{ .lg .middle } __Pulsing__

    提供 Agent 的分布式执行运行时，承接环境、服务和任务实例的调度。

- :material-database-outline:{ .lg .middle } __Persisting__

    提供参数、轨迹和中间状态的存储与传输能力，让长期任务可以持续运行。

- :material-stethoscope:{ .lg .middle } __Probing__

    提供训推诊断和执行过程监控，让任务行为可以被追踪、分析和治理。

</div>
