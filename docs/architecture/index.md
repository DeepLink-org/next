---
icon: material/sitemap-outline
---

# 架构设计

愿景定了方向，路线定了时间——这一页展开具体怎么做。DeepLink Next 的架构围绕 AI for Science 展开，形成一张下一代算力施工图：以 AI 模型演进为入口，以智能体系统为软件主线，以超融合为硬件主线。

## 总体架构图

![DeepLink Next 下一代算力施工图与路线图](../assets/deeplink_architecture-transparent.svg)

## 总体分层

<div class="grid cards" markdown>

- :material-flask-outline:{ .lg .middle } __AI4S 任务层__

    面向科学发现、仿真推演、数据分析和智能编程等场景，定义 DeepLink Next 要服务的最终问题。

- :material-brain:{ .lg .middle } __训推与智能体层__

    承接预训练、后训练、推理服务和 Agent 应用，把模型能力组织成可持续运行的任务系统。

- :material-server-network:{ .lg .middle } __Agent Runtime 层__

    由 Pulsing、Persisting、Probing 与沙箱能力组成，提供执行、状态、观测和隔离能力。

- :material-sitemap-outline:{ .lg .middle } __算力架构层__

    由 DeepLink.Across、DeepLink.Fabric 和 SuperPod 生态共同支撑，为上层任务提供统一的基础设施基座。

</div>

## 两条主线

<div class="grid cards" markdown>

- :material-layers-triple:{ .lg .middle } __软件主线：从框架到运行时__

    训推框架负责模型训练、强化学习和推理服务；Agent Runtime 负责把这些能力组织成长期运行、可观测、可管控的任务。

- :material-memory:{ .lg .middle } __硬件主线：从互联到架构__

    DeepLink.Across 面向跨域互联能力建设，DeepLink.Fabric 面向下一代算力架构底座。二者共同回答“算力如何被组织起来”。

- :material-handshake-outline:{ .lg .middle } __协同主线：端到端闭环__

    训推框架、Agent Runtime 与内部平台协同，实现任务从提交、执行、状态管理到诊断观测的闭环。

</div>
