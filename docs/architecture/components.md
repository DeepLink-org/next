---
icon: material/puzzle-outline
---

# 核心组件

## 任务智能切片

将万亿参数的大模型训练任务按计算图拓扑自动分解，分配到跨域异构集群上并行执行。

- **拓扑感知** — 分析模型计算图中的数据依赖，最小化跨域通信量
- **弹性切分** — 支持按 GPU 数量、显存容量、网络带宽等维度动态调整切分策略
- **容错恢复** — 单节点/单链路故障时自动重新切片，训练不中断

```
Model Graph ──► 拓扑分析 ──► 依赖图染色 ──► 最小割算法 ──► 跨域分片
```

## 长距通信库

DeepLink 在通用 RoCE 网络上实现千公里级高效通信的核心组件。

- **自研拥塞控制** — 不同于标准 TCP/RDMA 拥塞控制，针对长距、高带宽场景优化
- **流水线化传输** — 将计算与通信重叠，隐藏通信延迟
- **梯度压缩** — 自适应精度压缩，减少跨域通信量

## 异构混训框架

让不同厂商的国产芯片在同一训练任务中协同工作。

- **统一算子抽象 (UDO)** — 定义芯片无关的算子接口，每种芯片只需实现后端适配
- **自动混合并行** — 数据并行、模型并行、流水线并行的自动组合策略
- **负载均衡** — 根据各芯片的实际算力动态分配计算量，避免慢芯片拖慢整体

```
import deeplink as dl

with dl.scope(chips=["ascend", "cambricon", "kunlun"]):
    model = dl.load("llama-100b")
    optimizer = dl.optim.AdamW(model)
    dl.train(model, dataset, optimizer)
```

## 元调度器（阶段二）

跨智算与超算资源的统一调度与编排。

- 感知超算 FP64 任务与智算 AI 任务的不同资源需求
- 基于任务优先级、数据位置、能耗策略进行全局优化分派
- 支持抢占式与预留式混合调度

## DeepLink 跨域专用硬件（阶段二）

为超算-智算互联定制的硬件加速器：

- **距离感知单元** — 测量跨域链路实时延迟与带宽，动态调整传输策略
- **链路加速引擎** — 硬件卸载梯度聚合、AllReduce 等集合通信操作
- **协议转换桥** — 桥接智算 RoCE 与超算 InfiniBand/自定义互连

## 超智融合芯片（阶段三）

单片集成 AI Tensor Core 与 FP64 Unit 的新一代计算芯片：

- **AI Tensor Core** — 面向 FP16/BF16/INT8 的大规模矩阵运算
- **FP64 Unit** — 面向传统 HPC 科学解算的高精度浮点
- **片上统一缓存** — AI 与 HPC 计算共享 L2 Cache，减少数据搬运

## 可重构组网（阶段三）

同一张物理网络同时承载两种互连拓扑：

- **固定路径** — 面向 3D Torus 邻近通信，低延迟、确定性强
- **可重构链路** — 面向 Full Mesh 集合通信，高带宽、全对等
- **动态切换** — 按当前工作负载类型（AI 推理 / HPC 解算）在两种模式间切换

## 智能体运行时组件

智能体运行时底座由四个独立的开源子项目构成，分别解决分布式 Agent 系统的通信、存储、调试与安全执行问题。

### Pulsing — 分布式 Actor 运行时

[:material-github: deeplink-org/Pulsing](https://deeplink-org.github.io/Pulsing/)

Pulsing 是面向分布式 AI 系统的 Actor 运行时，定位在 Ray 和裸 async 之间——提供恰好足够的分布式基础设施，无需外部协调服务的复杂度。

- **零外部依赖** — 纯 Rust + Tokio 实现，无需 etcd / NATS / Consul，部署足迹极小
- **SWIM 协议自动发现** — 节点自动相互发现并形成集群，支持 K8s Service IP 原生集成
- **位置透明 ActorRef** — 本地和远程 Actor 使用同一套 API，从单节点到分布式部署无需修改应用代码
- **流式消息原生支持** — 面向 LLM token 级流式生成和实时数据处理设计
- **Python First** — 通过 PyO3 提供完整 Python API，`@remote` 装饰器将任意类转为分布式 Actor
- **LLM 推理集成** — 内建 OpenAI 兼容 API Router，直接对接 vLLM / Transformers / MLX

```python
import pulsing as pul

@pul.remote
class Calculator:
    def __init__(self, initial: int = 0):
        self.value = initial

    def add(self, n: int) -> int:
        self.value += n
        return self.value
```

### Persisting — 分层持久化存储

[:material-github: deeplink-org/Persisting](https://deeplink-org.github.io/Persisting/)

Persisting 是面向 AI 系统的持久化存储引擎，基于 Lance 列式格式提供高性能数据读写，与 Pulsing Actor 框架深度集成。

- **Lance 列式存储** — 高性能随机访问、向量搜索、零拷贝版本管理
- **可插拔后端** — Memory（测试）/ Lance（生产）/ 自定义实现，统一 `StorageBackend` 协议
- **Pulsing 集成** — 为 Pulsing 分布式队列提供可靠持久化
- **Schema 演进** — 无需停机即可动态调整数据结构
- **Prometheus 指标** — 内建监控端点，实时观测存储健康

```python
from persisting import Queue

queue = Queue("my_topic", storage_path="./data")
await queue.put({"id": "1", "value": 42})
await queue.flush()
records = await queue.get(limit=100)
```

### Probing — 零侵入分布式调试器

[:material-github: deeplink-org/Probing](https://deeplink-org.github.io/probing/)

Probing 是面向分布式 AI 工作负载的动态性能分析器——无需修改代码、无需重启进程即可注入探针，用标准 SQL 查询性能数据。

- **零侵入注入** — 运行时 attach 到目标进程，无需 instrumentation 或重启
- **SQL 驱动分析** — 基于 Apache DataFusion，用标准 SQL 查询 PyTorch trace、显存分配等
- **动态代码执行** — 在运行中的进程内执行 Python 代码，检查变量、修改状态
- **栈捕获** — 实时获取任意时刻的执行栈及变量值
- **分布式就绪** — 跨节点监控，支持分布式训练问题的跨节点关联分析
- **<5% 性能开销** — 生产级效率，适合真实部署环境

```bash
pgrep -f "python.*train"
probing -t <pid> inject
probing -t <pid> query "SELECT * FROM python.torch_trace LIMIT 10"
probing -t <pid> eval "print(torch.cuda.memory_allocated())"
```

### 分布式沙箱系统

面向 Agent 安全执行与隔离的沙箱环境，为不可信代码提供受限执行边界。当前处于规划阶段，将在后续版本中作为运行时底座的第四个独立组件发布。

[:material-arrow-right: 了解超节点技术体系白皮书](https://deeplink-org.github.io/superpod-whitepaper/)
