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

## 实采（爬价）

首次打开页面会用**演示报价**快速灌库。要触发实采：

```bash
npm run collect
```

或在服务已启动时：`GET` / `POST` `http://127.0.0.1:3000/api/refresh`

行为说明：

1. **直连**京东 / 天猫 / 拼多多 / 淘宝公开搜索页（限速约 0.9s/请求、明确 Bot User-Agent、不登录、不绕过验证码）。
2. 若店面页返回风控/验证码/登录墙，记为 `blocked`，**不**尝试破解。
3. 回退到**什么值得买公开 list API**（`api.smzdm.com`），只保留标注为京东/天猫/淘宝/拼多多的成交贴，并按型号关键字匹配目录。
4. 仍无命中的型号写入**演示报价**（UI 标「演示」）；实采标「实采」。
5. 当日最低价写入 `price_snapshots`；近 30 日历史在无实采历史时仍用可复现演示曲线占位。

可选环境变量：

| 变量 | 含义 |
|------|------|
| `COLLECT_LIVE=0` | 强制跳过实采（仅演示） |
| `CRAWL_MIN_GAP_MS` | 请求最小间隔（默认 `900`） |
| `CRAWL_TIMEOUT_MS` | 单请求超时（默认 `12000`） |

Windows 示例：

```bat
npm run collect
```

## 数据说明

| 类型 | 来源 |
|------|------|
| 产品目录 | 固化种子（NVIDIA 40/50、AMD 新桌面卡、主流 RAM/SSD/CPU） |
| 报价 | 实采优先（直连或 SMZDM 商城归属）；失败则演示回退 |
| 日快照 | 当日取当前报价最低；历史无实采时用演示占位 |
| 新闻 | 优先公开 RSS；失败则使用标注样例 |

## 技术栈

Next.js App Router · PGlite / Postgres · Recharts
