---
icon: material/lightbulb-outline
---

# 核心概念

## 从超智融合到 AI for Science

DeepLink Next 的核心概念已经从单一的"超智融合"扩展为一套面向 AI for Science 的算力体系：软件能力持续上移，硬件体系持续融合，智能体运行时成为连接模型、科学任务与算力系统的中间层。

## 关键概念

<div class="grid cards" markdown>

- :material-target:{ .lg .middle } __AI for Science__

    科学发现的新范式。DeepLink Next 将超算与智算融合为一张可编程的算力平面，让 AI4S 从实验走向规模化。

- :material-source-branch:{ .lg .middle } __软件能力演进__

    国产异构 → 超大规模训推 → 智能体 Infra。软件能力从底层适配持续上移到智能体系统。

- :material-robot-outline:{ .lg .middle } __Agent Infra__

    面向长期运行、状态管理、环境探索和安全执行的智能体基础设施，不只是推理服务扩展。详见 [Pulsing](https://deeplink-org.github.io/Pulsing/)、[Persisting](https://deeplink-org.github.io/Persisting/) 和 [Probing](https://deeplink-org.github.io/probing/) 三个开源子项目。

- :material-memory:{ .lg .middle } __硬件演进__

    纯软件跨域 → 软硬协同 → 超融合。硬件从互联工具演进为体系结构共同设计。

- :material-vector-polyline:{ .lg .middle } [__算力平面__](compute-fabric.md)

    跨集群、跨区域、跨超算-智算的算力互联平面，是跨域训练和超智互联的基础。

- :material-target:{ .lg .middle } __超融合__

    超算与智算在同一物理集群内融合运行，为 AI4S 提供统一的基础设施基座。

</div>

## 两条演进轴

```mermaid
flowchart TB
    Goal["AI for Science"] --> Model["下一代模型架构与演进"]
    Model --> Software["软件能力演进：国产异构到智能体 Infra"]
    Model --> Hardware["硬件演进：纯软件跨域到超融合"]
    Software --> Runtime["智能体运行时底座"]
    Hardware --> Runtime
```

> 软件能力解决"模型和智能体如何运行"，硬件演进解决"算力系统如何被建造"。两者共同服务 AI for Science 这一战略目标。

[:material-arrow-right: 探索架构设计](../architecture/index.md)
[:material-arrow-right: 查看整体路线图](../overview/index.md)
