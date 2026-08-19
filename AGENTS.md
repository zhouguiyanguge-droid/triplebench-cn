# AGENTS.md

> 供任何 AI 代理（Cursor Composer / Cloud Agent / Codex / Claude Code 等）
> 在本仓库开工前阅读。

## 代码托管拓扑（2026-08-19 起）

本仓库同时存在于两处，**是同一份内容的两个入口，不是两个仓库**：

| 位置 | 角色 |
|---|---|
| GitHub `zhouguiyanguge-droid/<repo>` | **Source of truth（权威源）** |
| Cursor Origin `guiyan-zhou/<repo>` | **Mirror（镜像）** |

- push 到 GitHub → 自动同步到 Origin
- push 到 Origin → **穿透**回 GitHub（pushes pass through to GitHub）
- 两边不会分叉；Pull Request 在 Origin 开也会同步回 GitHub
- **Issues 与 CI 配置不同步**，只在 GitHub 上

## 🚨 硬禁止

**不要点 Origin 仓库 Settings → Danger Zone → `Detach from GitHub`。**

点下去 Origin 会变成 source of truth，穿透变并列——于是出现**两个可写的真相源**，
两份各自都"对"、合起来错、而且不会报警。除非仓库主人明确要求把本仓从 GitHub
摘出来，否则当这个按钮不存在。

## 其他须知

- Origin 镜像**一律 Private**，不继承 GitHub 可见性；访问面仅仓库主人本人。
- Origin **没有用户名密码**：用 Cursor 账号登录，Origin CLI 登录时会自动配好
  git credential helper，之后对 Origin remote 的 push/pull 无需再输凭证。
- **提交与推送需仓库主人明确同意**，不要自作主张推送或改远端配置。
