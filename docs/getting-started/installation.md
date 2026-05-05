---
icon: material/download-outline
---

# 安装指南

## 环境要求

### 计算节点

| 资源 | 最小要求 | 推荐配置 |
|------|:------:|:------:|
| GPU/AI 芯片 | 8× 同构或异构 | 16× 国产芯片 |
| 显存 | 每卡 32 GB | 每卡 80 GB |
| CPU | 64 核 | 128 核 |
| 内存 | 512 GB | 1 TB |
| 网络 | RoCE 100 Gbps | RoCE 400 Gbps / InfiniBand NDR400 |

### 跨域网络

| 参数 | 要求 |
|------|------|
| 跨域带宽 | ≥ 10 Gbps 专线 |
| 跨域延迟 | ≤ 20 ms（同城）/ ≤ 50 ms（跨省） |
| 丢包率 | ≤ 0.01% |

## 安装方式

### PyPI

```bash
pip install deeplink-core        # 核心调度与任务管理
pip install deeplink-comm        # 长距通信库
pip install deeplink-train       # 异构混训框架
```

### 源码构建

```bash
git clone https://github.com/deeplink-org/deeplink-next
cd deeplink-next
make build
```

### Docker

```bash
docker pull deeplink/runtime:latest
docker run --gpus all --network host \
  -v /dev/infiniband:/dev/infiniband \
  deeplink/runtime:latest
```

## 验证安装

```bash
# 检查版本
dlctl version

# 检查 GPU/芯片可用性
dlctl device list

# 运行跨域通信基准测试
dlctl benchmark comm --nodes node1,node2 --size 1G

# 运行异构混训冒烟测试
dlctl test smoke --heterogeneous
```

## 国产芯片适配

DeepLink 已适配以下国产 AI 芯片：

| 芯片 | 厂商 | 适配状态 |
|------|------|:---:|
| 昇腾 910B | 华为 | :material-check-circle: 已适配 |
| 寒武纪 MLU590 | 寒武纪 | :material-check-circle: 已适配 |
| 昆仑芯 R300 | 百度 | :material-progress-clock: 适配中 |
| 燧原 T20 | 燧原科技 | :material-clock-outline: 规划中 |

```bash
# 为特定芯片安装驱动适配
dlctl driver install --chip ascend
dlctl driver install --chip cambricon
```

[:material-arrow-right: 开始使用 DeepLink](index.md)
