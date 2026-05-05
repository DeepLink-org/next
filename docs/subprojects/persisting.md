---
icon: material/database-outline
---

# Persisting

面向 AI 系统的分层持久化存储引擎。

基于 Lance 列式格式，管理模型参数、KV Cache 与 Trajectories。可插拔后端架构，与 Pulsing 深度集成。

- Lance 列式存储（随机访问 + 向量搜索）
- 可插拔后端（Memory / Lance / 自定义）
- Pulsing 分布式队列持久化
- Schema 动态演进
- Prometheus 指标

[:material-github: 进入 Persisting 项目站点](https://deeplink-org.github.io/Persisting/){ .md-button }
