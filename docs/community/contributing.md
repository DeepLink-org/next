---
icon: material/hand-heart-outline
---

# 贡献指南

DeepLink Next 欢迎各种形式的贡献。

## 贡献方式

### :material-code-tags: 代码贡献

1. Fork 仓库
2. 创建特性分支：`git checkout -b feat/my-feature`
3. 编写代码并添加测试
4. 确保 `make test` 全部通过
5. 提交 PR 并填写 PR 模板

### :material-file-document: 文档贡献

文档与代码同等重要。所有文档源文件在 `docs/` 目录下（Markdown 格式），通过 PR 提交改进。

### :material-bug-outline: 报告问题

提交 Issue 时请包含：

- 环境信息 (`dlctl version`, OS, GPU/芯片型号, 网络拓扑)
- 问题描述与复现步骤
- 期望行为 vs 实际行为
- 相关日志与性能数据

### :material-flask: 研究与论文

如果你基于 DeepLink 进行了学术研究，欢迎引用并与社区分享：

```bibtex
@software{deeplink2025,
  title = {DeepLink: Cross-Domain Heterogeneous Training System},
  institution = {Pujiang Lab},
  year = {2025},
}
```

## 开发环境

```bash
git clone https://github.com/deeplink-org/deeplink-next
cd deeplink-next
make deps
make build
make test
```

## 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat:` — 新功能
- `fix:` — Bug 修复
- `docs:` — 文档更新
- `perf:` — 性能优化
- `refactor:` — 重构
- `test:` — 测试

## RFC 流程

重大变更（新组件、API 变更、架构调整）需要先提交 RFC：

1. 在 `rfc/` 目录下创建 RFC 文档
2. 社区讨论（至少 2 周）
3. Maintainers 投票
4. 通过后进入实现阶段
