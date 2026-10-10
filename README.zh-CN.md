# 天气应用

一个小型的 Next.js 天气 Demo：搜索地点、收藏城市、查看预报。可免费部署到 Vercel，无需 API Key。

English version: [README.md](./README.md)

## 在线演示

演示地址：[https://next-weather-demo.vercel.app/](https://next-weather-demo.vercel.app/)

## 功能

- iOS 天气风格的收藏城市列表
- 天气详情页：逐时预报 + 7 日预报
- 按 WMO `weatherCode` 展示天气图标（当前天气、逐时、七日、城市卡片）
- 逐时预报支持「列表 / 温度曲线」切换，曲线展示当天温度
- 7 日预报可点击某一天，从视口底部弹出当天温度曲线
- 中英文城市名按 Open-Meteo **地点 id** 精确解析（不用模糊搜索，避免同名误匹配）
- 列表页与详情页提供全局刷新按钮（在语言切换左侧），刷新时有卡片 / 详情 loading
- 收藏增删，数据持久化到 `localStorage`
- Open-Meteo 地理编码搜索（输入框 16px，避免 iOS 聚焦自动缩放）
- 加载 / 错误 / 重试状态
- 简体中文与英文（本地文案字典）
- 响应式布局，参考 Apple Weather

## 页面

| 路由 | 用途 |
| --- | --- |
| `/` | 收藏城市列表 + 搜索 |
| `/weather/[id]?lat=&lon=&name=` | 某城市的天气详情 |

使用流程：

1. 打开 `/`，查看已收藏城市（初始为空）。
2. 搜索城市 → 进入详情（**不会**自动收藏）。
3. 在详情页点 ★ 加入 / 移出列表。
4. 列表页左滑卡片可删除。
5. 点刷新按钮重新拉取天气；列表单项与详情页会显示 loading。

## 技术栈

| 层级 | 选型 | 原因 |
| --- | --- | --- |
| 框架 | Next.js App Router + TypeScript | 适配 Vercel；Route Handler 做 API 边界 |
| 样式 | Tailwind CSS 4 | 快速布局，无需重型 UI 库 |
| 上游天气 | Open-Meteo | 免费、无 Key，预报 + 地理编码齐全 |
| 服务端 API | `/api/geocode`、`/api/weather` | 代理上游、Zod 校验、统一响应结构 |
| 服务端状态 | TanStack Query | 缓存、loading、重试 |
| UI 状态 | Zustand | 收藏、语言、最近搜索 |
| 校验 | Zod | 服务端请求 / 响应契约 |

### 设计取舍

- **Query vs Zustand**：远程天气 / 地理编码由 TanStack Query 管理；收藏与语言由 Zustand 管理。详情页由路由驱动，而不是全局「当前城市」。
- **Route Handler 代理**：统一 `{ code, data, msg }`、Zod 校验与上游错误映射。
- **无 API Key**：降低部署与演示成本。
- **仅本地 i18n**：`zh` / `en` 文案放在仓库内。
- **IPv4 HTTPS**：服务端用 Node `https` 且 `family: 4` 请求 Open-Meteo，避免 IPv6 不稳定导致卡住。
- **按 id 解析地名**：切换语言时走 `/v1/get?id=`，保证城市名准确。
- **完整逐时序列**：接口保留 7 天逐时（含今天已过去的小时），方便画整天曲线；列表仍展示从「现在」起的 24 小时。
- **弹层用 Portal**：日预报弹层挂到 `document.body`，`fixed` 相对视口，而不是带 `transform` 的祖先节点。

## API 约定

应用内 API 统一返回：

```json
{
  "code": 0,
  "data": {},
  "msg": "ok"
}
```

| `code` | 含义 |
| --- | --- |
| `0` | 成功 |
| `40001` | 参数无效 |
| `40401` | 未找到地点 |
| `50201` | 上游 Open-Meteo 失败 |
| `50000` | 未知 / 网络 / 解析错误 |

接口：

- `GET /api/geocode?q=taipei` — 按名称搜索
- `GET /api/geocode?id=1796236&lang=zh` — 按地点 id 精确查询（本地化名称）
- `GET /api/weather?lat=25.05&lon=121.53&name=Taipei`

客户端（`lib/api/client.ts`）在 `code !== 0` 时抛出 `ApiError`。UI 通过 `getErrorMessage` 映射为本地化文案。

## 目录结构

```
app/                  页面 + Route Handlers
components/cities/    收藏列表 UI
components/weather/   详情面板、温度曲线、弹层、图标
components/common/    语言切换、刷新、加载/错误
hooks/                TanStack Query hooks
lib/api/              响应辅助 + 浏览器 apiClient
lib/open-meteo/       上游请求 + Zod schemas
lib/i18n/             本地 zh/en 字典
lib/weather/          WMO 码/图标、逐时窗口、URL 工具
stores/               Zustand（收藏等持久化）
types/                共享 API 类型
```

## 本地启动

```bash
pnpm install
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

```bash
pnpm build
pnpm start
```

无需配置环境变量。

## 部署到 Vercel

1. 将仓库推送到 GitHub / GitLab / Bitbucket。
2. 在 [Vercel](https://vercel.com/new) 导入项目。
3. 使用默认设置（Framework: Next.js），环境变量留空。
4. 部署完成后即可用于演示。

## 持久化

收藏、语言、最近搜索通过 Zustand `persist` 存在 `localStorage` 的 `weather-app-store` 键下。
