---
icon: material/eye-outline
---

# 愿景与设计原则

## 愿景

> **让科学计算成为一种 AI 工作负载。**

DeepLink Next 致力于打破智算与超算之间的架构壁垒，通过软件-硬件-芯片-架构的逐层创新，构建一个统一的、可编程的超级计算平面，让科学家无需关心底层硬件形态，即可高效利用全谱计算资源。

## 设计原则

### :material-layers-triple: 逐层叠加

DeepLink 独有的技术路径——**软件 → 软件 + 硬件 → 芯片 + 架构融合**。每一层都解决前一层留下的架构问题，不跳跃、不妥协。

### :material-vector-combine: 协议驱动的异构

通过统一算子抽象和长距通信库，让不同厂商、不同架构的国产芯片能在同一训练任务中协同工作。已有的 3+ 款国产芯片混训能力证明了这一原则的可行性。

### :material-network: 距离透明

从同机房到跨数据中心再到千里之外——算力的物理分布不应对上层训练任务可见。DeepLink 的通信库和调度器屏蔽了距离带来的复杂性。

### :material-swap-horizontal: 架构融合而非桥接

阶段二解决了 "互联" 但未解决 "合建"。阶段三的目标不是用桥接件连接两种架构，而是从芯片和组网层面创造一种**统一的新架构**。

## 与现有路线的对比

| 路线 | 代表 | 跨域互联 | 异构混训 | 超智融合 | 同集群合建 |
|------|------|:---:|:---:|:---:|:---:|
| **DeepLink** | 浦江实验室 | :material-check:{ .check } | :material-check:{ .check } | :material-check:{ .check } | :material-check:{ .check } |
| Scale Across | NVIDIA | :material-check:{ .check } | :material-close:{ .cross } | :material-close:{ .cross } | :material-close:{ .cross } |
| 联邦学习 | Google/开源 | :material-check:{ .check } | :material-close:{ .cross } | :material-close:{ .cross } | :material-close:{ .cross } |
| 传统 HPC | 各国超算中心 | :material-close:{ .cross } | :material-close:{ .cross } | :material-close:{ .cross } | :material-close:{ .cross } |

## 2026 年目标

- **Q2** — 发布 DeepLink Next 技术白皮书，开放软件栈核心组件
- **Q3** — 启动跨域专用硬件原型验证，元调度器开源
- **Q4** — 完成超智融合芯片架构设计，发布 v1.0 技术规范

[:material-arrow-right: 查看完整路线图](roadmap.md)
