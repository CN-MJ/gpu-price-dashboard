# 硬价台 · PC 硬件最低价看板

汇总京东 / 天猫 / 拼多多 / 淘宝上的 GPU、内存、存储、CPU 关注型号最低价，入库支持走势图，并聚合国内外硬件新闻。

## 本地运行

Windows（cmd / PowerShell）与 macOS / Linux 相同：

```bash
npm install
npm run dev
```

打开 [http://127.0.0.1:3000](http://127.0.0.1:3000)。

`dev` / `collect` 通过 Node 辅助脚本在本地强制去掉 `DATABASE_URL`（跨平台，不依赖 Unix `env -u`），从而使用内存 PGlite；发布后若平台注入了 Postgres，则自动切到平台库。

## 数据说明

| 类型 | 来源 |
|------|------|
| 产品目录 | 固化种子（NVIDIA 40/50、AMD 新桌面卡、主流 RAM/SSD/CPU） |
| 报价 / 日快照 | **演示数据**（电商反爬严格；结构对齐四平台多店） |
| 新闻 | 优先公开 RSS；失败则使用标注样例 |

强制刷新：`POST /api/refresh` 或 `GET /api/refresh`。

## 技术栈

Next.js App Router · PGlite / Postgres · Recharts
