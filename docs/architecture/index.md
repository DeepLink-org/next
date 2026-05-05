---
icon: material/sitemap-outline
---

# 架构设计

愿景定了方向，路线定了时间——这一页展开具体怎么做。DeepLink Next 的架构围绕 AI for Science 展开，形成一张下一代算力施工图：以 AI 模型演进为入口，以智能体系统为软件主线，以超融合为硬件主线。

## 总体架构图

![DeepLink Next 下一代算力施工图与路线图](../assets/deeplink_architecture-transparent.svg)

## 读图方式

这张图有两条演进轴：

- **软件能力演进**：国产异构 → 超大规模训推 → 智能体 Infra
- **硬件演进**：纯软件跨域 → 软硬协同 → 超融合

两条线共同服务于 AI for Science 这一战略目标。对产业读者而言，入口仍然是 AI 模型架构、训推系统和 Agent Infra；对政府与科研读者而言，终局是 AI4S 拥有统一的基础设施基座。

## 目标层：AI for Science

AI for Science 是战略牵引目标，但不是脱离产业落点的口号。DeepLink Next 将它拆解为三类工程入口：

- 下一代模型架构与演进
- 智能体系统与运行时
- 软件能力和硬件体系的协同演进

## 软件层：三类智能体系统

<div class="grid cards" markdown>

- :material-school-outline:{ .lg .middle } __智能体持续学习系统__

    将预训练、强化学习和 Agent 训练纳入同一持续反馈闭环，让模型能力能够在科学任务中持续改进。

- :material-server-network:{ .lg .middle } __智能体池化执行系统__

    把传统推理服务升级为可池化、可调度、可长期运行的 Agent 执行面，支持在线执行池与批式执行池。

- :material-code-braces:{ .lg .middle } __科学智能编程框架__

    连接科学算子/仿真库、Agent 自动编程、拓扑感知通信和 Tile 统一 DSL，让科学计算知识进入可编程系统。

</div>

## 运行时层：Agent Infra 底座

智能体运行时是三类系统的共同底座。它承担的不是一次性推理，而是长期任务执行：

- **[Pulsing](https://deeplink-org.github.io/Pulsing/)**：分布式 Actor 运行时，面向智能体协作的振荡机制——零外部依赖、SWIM 协议自动发现、流式消息原生支持
- **[Persisting](https://deeplink-org.github.io/Persisting/)**：分层存储引擎，基于 Lance 列式格式管理参数、KV Cache 与 Trajectories
- **[Probing](https://deeplink-org.github.io/probing/)**：零侵入分布式调试器，SQL 驱动的性能分析与动态代码注入
- **Sandboxing**：安全执行与隔离环境（规划中）

## 硬件层：从互联到超融合

硬件演进沿着三个阶段展开：

| 阶段 | 架构形态 | 核心判断 |
|------|----------|----------|
| 跨域智算 · 纯软件 | 软件版 Scale Across | 先让跨域异构算力可用 |
| 跨域超智互联 · 软硬协同 | 跨域专用硬件 | 解决互联，但尚未解决超融合 |
| DeepLink 新形态 · 超融合 | 融合芯片 + 可重构组网 | AI 与 HPC 在同一集群内原生融合 |

## 关键技术体系

| 方向 | 技术 | 作用 |
|------|------|------|
| 软件能力 | 任务智能切片 / 长距通信 / 异构混训 | 国产异构与跨域训练基础 |
| 软件能力 | 智能体持续学习 / 池化执行 / 科学智能编程 | 从模型训推走向 Agent Infra |
| 运行时 | [Pulsing](https://deeplink-org.github.io/Pulsing/) / [Persisting](https://deeplink-org.github.io/Persisting/) / [Probing](https://deeplink-org.github.io/probing/) / Sandboxing | 支撑长期运行的智能体基础设施 |
| 硬件演进 | 跨域专用硬件 | 从纯软件跨域走向软硬协同 |
| 硬件演进 | 融合芯片 / 可重构组网 | 从跨域互联走向超融合 |
| 方法论 | 负载建模与仿真 Blueprinting | 让架构可以被设计、验证和迭代 |

[:material-arrow-right: 了解核心组件](components.md)
