# 硬价台 · PC 硬件最低价看板

汇总京东 / 天猫 / 拼多多 / 淘宝上的 GPU、内存、存储、CPU 关注型号最低价，入库支持走势图，并聚合国内外硬件新闻。

## 本地运行

Windows（cmd / PowerShell）与 macOS / Linux 相同：

```bash
npm install
npm run collect
npm run dev
```

打开 [http://127.0.0.1:3000](http://127.0.0.1:3000)。

本地数据在 `.data/pglite`（`collect` 与 `dev` **共用**同一文件库）。`dev` / `collect` 通过 Node 辅助脚本去掉 `DATABASE_URL`（跨平台，不依赖 Unix `env -u`）。

若 `dev` 已在跑，再 `collect` 后请**重启** `npm run dev`（或改用站点内 `/api/refresh`），以便重新打开文件库。

## 实采（爬价）

```bash
npm run collect
```

成功标志：终端出现 `priceSource": "live"` 且 `liveOffers` > 0；页面「数据」列为「实采」，**不再写入演示价**。未采到的型号显示为空价。

行为：

1. 直连京东 / 天猫 / 拼多多 / 淘宝公开搜索（限速、Bot UA、不登录、不绕验证码）
2. 店面风控则用什么值得买公开 list API（仅保留四平台归属）
3. 只入库实采；**当日快照覆盖写入**，历史日期保留用于价格曲线
4. 型号详情页：各平台当日对比柱状图 + 历史曲线（全网最低 / 分平台）
5. 显卡品类页：50 系 / 40 系 / AMD 筛选

可选环境变量：`COLLECT_LIVE=0`、`CRAWL_MIN_GAP_MS`、`CRAWL_TIMEOUT_MS`、`PGLITE_DATA_DIR`

## 数据说明

| 类型 | 来源 |
|------|------|
| 产品目录 | 固化种子 |
| 报价 / 当日快照 | 仅实采；无则空 |
| 新闻 | 公开 RSS；失败则样例 |

## 技术栈

Next.js App Router · PGlite / Postgres · Recharts
