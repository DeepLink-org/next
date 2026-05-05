---
icon: material/play-outline
---

# 快速开始

DeepLink 软件栈已开源。本指南帮助你快速部署一个最小化的 DeepLink 跨域训练环境。

## 前置条件

- 2+ 台配备 NVIDIA GPU 或国产 AI 芯片的服务器
- RoCE 网络互联（支持跨机房/跨数据中心）
- Ubuntu 20.04+ 或 CentOS 7.9+

## 安装 DeepLink 软件栈

=== "pip 安装"

    ```bash
    pip install deeplink-core deeplink-comm deeplink-train
    ```

=== "从源码构建"

    ```bash
    git clone https://github.com/deeplink-org/deeplink-next
    cd deeplink-next
    make install
    ```

## 配置跨域集群

```bash
# 在每个节点上初始化 DeepLink 运行时
dlctl runtime init --role worker

# 在主节点上创建跨域集群
dlctl cluster create cross-domain \
  --nodes node-shanghai:8gpu,node-wuxi:8gpu \
  --network roce
```

## 提交跨域训练任务

```python
import deeplink as dl

# 定义一个跨域混训任务
job = dl.Job(
    name="llama-70b-cross-domain",
    model="llama-70b",
    strategy=dl.Strategy(
        slice="topology-aware",        # 任务智能切片
        communication="long-haul",     # 长距通信库
        heterogeneous=True,            # 异构混训
    ),
    nodes=["shanghai:8xA100", "wuxi:8xAscend"],
)

job.submit()
job.wait()
print(f"MFU: {job.mfu():.1%}")
```

## 下一步

- [了解 DeepLink 三阶段演进](../overview/index.md)
- [理解核心概念](../concepts/index.md)
- [探索架构设计](../architecture/index.md)
