---
icon: material/package-variant-closed
---

# 开源子项目

DeepLink Next 由多个独立的开源子项目构成，按能力边界分为 **训推框架**、**智能体运行时**、**超智融合计算** 和 **下一代算力架构** 四个板块。

## 训推框架

<div class="grid cards" markdown>

- :material-flash:{ .lg .middle } __AllSpark__

    ---

    大规模预训练框架。拓扑感知模型分片、跨域异构芯片统一训练入口、弹性容错恢复。与 NexRL 共享模型格式。

    :material-clock-outline: 规划中

- :material-chart-bell-curve:{ .lg .middle } __NexRL__

    ---

    分布式强化学习框架。大规模并行 rollout、在线/离线混合训练、面向科学任务的奖励建模。与 Pulsing 深度集成。

    :material-clock-outline: 规划中

- :material-battery-charging:{ .lg .middle } __Energon__

    ---

    高性能 LLM 推理框架。国产异构芯片后端、混合精度推理、Continuous Batching。命名源自变形金刚中驱动一切的 Energon 能量源。

    :material-clock-outline: 规划中

- :material-server:{ .lg .middle } __Teletraan__

    ---

    LLM 推理服务平台。OpenAI 兼容 API 网关、多模型路由、自动扩缩容。命名源自 Autobots 的中央超级计算机。

    :material-clock-outline: 规划中

</div>

## 智能体运行时

<div class="grid cards" markdown>

- :material-zigbee:{ .lg .middle } __Pulsing__

    ---

    Agent 分布式执行运行时，负责承接环境、服务和任务实例的调度。

    [:material-github: 项目站点](https://deeplink-org.github.io/Pulsing/)

- :material-database-outline:{ .lg .middle } __Persisting__

    ---

    参数、轨迹和中间状态的存储与传输能力，支撑长期任务持续运行。

    [:material-github: 项目站点](https://deeplink-org.github.io/Persisting/zh/)

- :material-bug-outline:{ .lg .middle } __Probing__

    ---

    训推诊断与执行过程监控能力，让任务行为可以被追踪和分析。

    [:material-github: 项目站点](https://deeplink-org.github.io/probing/)

- :material-shield-outline:{ .lg .middle } __分布式沙箱__

    ---

    Agent 安全执行与隔离环境。为不可信代码提供受限执行边界。

    :material-clock-outline: 规划中

</div>

## 超智融合计算

<div class="grid cards" markdown>

- :material-function-variant:{ .lg .middle } __科学算子__

    ---

    将分子动力学、CFD、电磁仿真、量子化学等传统 HPC 算子表达为可被 AI 框架调度、可被超智融合芯片加速的标准化接口。

    :material-clock-outline: 规划中

- :material-folder-zip:{ .lg .middle } __科学数据压缩__

    ---

    面向 AI4S 场景的数据压缩与传输优化，提供科学数据专用压缩算法、自适应精度控制和解码端零拷贝还原。

    :material-clock-outline: 规划中

- :material-factory:{ .lg .middle } __混合精度__

    ---

    在 FP64 科学计算与 FP16/BF16 AI 计算之间自动选择精度，控制误差传播并提升超智融合芯片利用率。

    :material-clock-outline: 规划中

- :material-graph-outline:{ .lg .middle } __科学工作流__

    ---

    将仿真、分析、建模、验证等多步骤科学任务表达为可调度、可复现的计算图，支持断点续跑与参数扫描。

    :material-clock-outline: 规划中

</div>

## 下一代算力架构

<div class="grid cards" markdown>

- :material-transit-connection-variant:{ .lg .middle } __DeepLink.Across__

    ---

    跨域互联能力建设，让跨地域、跨中心算力能够以更统一的方式参与上层训推任务。

    :material-clock-outline: 规划中

- :material-graph-outline:{ .lg .middle } __DeepLink.Fabric__

    ---

    下一代算力架构底座，承接更高层次的算力架构统一与软硬协同演进。

    :material-clock-outline: 规划中

- :material-book-open-page-variant:{ .lg .middle } __SuperPod 白皮书__

    ---

    超节点技术体系白皮书 v1.0，联合 8 所高校及科研机构、16 家产业伙伴共同编著，沉淀架构分析、参考设计、SPI 评估框架与产业生态地图。

    [:material-book-open-page-variant: 阅读白皮书](https://deeplink-org.github.io/superpod-whitepaper/)

- :material-sitemap-outline:{ .lg .middle } __架构板块__

    ---

    下一代算力架构板块的项目入口，聚焦 Across、Fabric 与 SuperPod 相关方向。

    [:material-arrow-right: 查看架构板块](next-computing-architecture.md)

</div>
