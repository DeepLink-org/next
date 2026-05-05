---
icon: material/zigbee
---

# Pulsing

分布式 Actor 运行时，为分布式 AI 系统提供通信骨干。

**定位**：在 Ray 和裸 async 之间，提供恰好足够的分布式基础设施，无需外部协调服务。

- 零外部依赖（纯 Rust + Tokio）
- SWIM 协议自动发现
- 位置透明 ActorRef
- 流式消息原生支持
- Python First（PyO3）

[:material-github: 进入 Pulsing 项目站点](https://deeplink-org.github.io/Pulsing/){ .md-button }
