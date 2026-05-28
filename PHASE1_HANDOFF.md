# TripleBench 中文站 Phase 1 handoff

## 当前状态

- 中文 Astro 站点骨架已创建。
- 种子数据在 `src/data/seed-benchmarks.json`。
- 首篇中文报告骨架在 `src/pages/reports/codex-claude-gemini.astro`。
- 当前内容用于上线占位和方法论校准，不是最终实测结论。

## Runbook

```bash
cd "/Users/zgy/claude 赚钱/triplebench-cn"
npm install
npm run build
npm run dev
```

## 下一步

1. 跟英文站同步真实测试数据。
2. 把中文文章改成适合国内读者搜索的问题标题。
3. 推送到 GitHub `zhouguiyanguge-droid/triplebench-cn`。
4. 部署到 Cloudflare Pages，建议域名 `cn.triplebench.com`。

## 边界

- 不要把 token、身份证件、收款信息写入仓库。
- 人工 KYC / 2FA / 登录授权必须单独标注，不能写成自动完成。
