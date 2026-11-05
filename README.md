简体中文 | [English](./README_EN.md)

> [!IMPORTANT]
> ## 致大家
> 此项目最初只是一个简单的主页。然而，随着越来越多的小伙伴发现了这个项目，它受到了大量本不应有的关注。而且，此项目作为初学前端的作品，其代码相当杂乱且质量低下。此外，该项目还遭到众多不明资源站或下载站的倒卖，致使许多不明真相的购买者从源代码中找到本人的联系方式进行问题咨询或提出功能需求。由于目前个人原因，该仓库进行存档，敬请谅解！

> [!NOTE]
> 本仓库是 `imsyy/home` 的 fork，已按[《长期维护与二开方案》](docs/长期维护方案.md)完成工程底座改造：
> 配置层 / 服务层、测试与 CI、PWA 缓存、可访问性、依赖升级（Vite 6 / Vue 3.5 / Element Plus 2.14 / ESLint 9）。
> 上游仓库已存档，本项目自行维护；变更记录见 [CHANGELOG](CHANGELOG.md)，升级流程见[升级检查清单](docs/升级检查清单.md)。

<p>
<strong><h2>無名の主页</h2></strong>
简单的小主页，原来的看够了，重新弄了一个
</p>

![無名の主页](/screenshots/main.jpg)

> Logo / 数字字体已按需子集化（`pnpm fonts:subset`，源字体在 `scripts/fonts/source/`）：
> Pacifico 保留 ASCII（域名可自定义）、UnidreamLED 只保留数字与符号，合计约 14.5 KB。
> 完整版 Pacifico 的使用方式见 [public/font/README.md](public/font/README.md)。

### 👀 Demo

> 由于 CDN 缓存原因，查看最新效果可能需要 `Ctrl` + `F5` 强制刷新浏览器缓存

- [無名の主页](https://www.imsyy.top)
- [無名の主页 - Dev](https://home-imsyy.vercel.app)
- [無名の主页 - 备用线路](https://home-5iw.pages.dev)

### 🎉 功能

- [x] 载入动画
- [x] 站点简介
- [x] Hitokoto 一言
- [x] 日期及时间
- [x] 实时天气
- [x] 时光进度条
- [x] 音乐播放器
- [x] 移动端适配

### ⚙️ 自动部署 / CI

- **CI**（`.github/workflows/ci.yml`）：push / PR 时执行 `pnpm lint:check`、`pnpm test`、`pnpm build`；
  `e2e` job 会安装 Chromium 并运行 Playwright 冒烟。
- **发布**（`.github/workflows/release.yml`）：推送 `v*` tag 时自动构建并创建 GitHub Release，
  附带 `home-dist.zip` 与构建产物 artifact。
- 构建产物是纯静态文件，可上传任意静态托管平台（Vercel / Netlify / Cloudflare Pages 等）。

### ⚙️ 手动部署

- 安装 [Node.js 22 LTS](https://nodejs.org/zh-cn/)，并启用 pnpm 12（`corepack enable` 会使用
  `package.json` 中的 `packageManager` 字段）；也可以 `npm i -g pnpm`
- 复制 `.env.example` 为 `.env` 并按需修改（未复制时构建会给出明确提示）
- 在项目根目录执行：

```bash
# 安装依赖（CI 使用同一命令）
pnpm install --frozen-lockfile

# 校验必填环境变量
pnpm check:env

# 本地开发
pnpm dev

# 测试与检查
pnpm lint:check
pnpm test

# 构建
pnpm build
```

> 构建完成后，静态资源在 **`dist` 目录** 中生成。当前首屏体积约 JS gzip **105 KB**、CSS gzip **13 KB**
> （基线 ≤ 180 / ≤ 30 KB）；Lighthouse 移动端 Performance / Accessibility / Best Practices ≈ **98 / 100 / 96**。

### 🧪 测试与质量

```bash
pnpm test          # Vitest 单测（13 个文件 / 68 个用例）
pnpm test:e2e      # Playwright 冒烟（7 条，自动 build + preview）
pnpm lint:check    # ESLint 9 flat config（CI 使用）
pnpm fonts:subset  # 重新生成 Logo / 数字子集字体
```

### ⚙️ Docker 部署

> 镜像基于 `node:22-alpine` 多阶段构建 + `nginxinc/nginx-unprivileged`（非 root，监听 8080），
> 使用 `--frozen-lockfile` 安装依赖，并开启 gzip_static 与静态资源缓存头。

```bash
# 构建镜像
docker build -t home .

# 运行
docker run -p 8080:8080 -d home

# 或使用 compose
docker compose up -d --build
```

构建时优先使用项目根目录的 `.env`，不存在则回退到 `.env.example`；如需自定义站点配置，
请在构建前准备好 `.env`。

### ⚙️ Vercel 部署

> 其他部署平台大致相同，在此不做说明

1. 点击本仓库右上角的 `Fork`，复制本仓库到你的 `GitHub` 账号
2. 复制 `/.env.example` 文件并重命名为 `/.env`（ 重要 ）
3. 按需修改 `/.env` 文件中的配置
4. 点击 `Deploy`，即可成功部署

### 网站链接

在 `src/assets/siteLinks.json` 中可以自定义网站链接（以指向自己的网站）:

```json
{
  "icon": "Blog",
  "name": "博客",
  "link": "https://blog.imsyy.top/"
},
```

其中 `icon` 网站链接的图标可以在 `src/components/Links.vue` 中添加:

```js
// 可前往 https://www.xicons.org 自行挑选并在此处引入
// 此处引入的是 fa 类型
import {
  Link,
  Blog,
  CompactDisc,
  Cloud,
  Compass,
  Book,
  Fire,
  LaptopCode,
} from "@vicons/fa";

...

// 网站链接图标
const siteIcon = {
  Blog,
  Cloud,
  CompactDisc,
  Compass,
  Book,
  Fire,
  LaptopCode,
};
```

### 社交链接

在 `src/assets/socialLinks.json` 中可以自定义社交链接。

### 天气

天气及地区获取需要 `高德开放平台` 相关 API

- 前往 [高德开放平台控制台](https://console.amap.com/dev/index) 创建一个 `Web 服务` 类型的 `Key`，并将 `Key` 填入 `.env` 中的 `VITE_WEATHER_KEY` 中

也可自行更换其他方式

### 音乐

> 本项目采用了基于 `MetingJS` 的 `Aplayer` 音乐播放器，可实现快速自定义歌单  
> \*仅支持 **中国大陆地区**

请在 `.env` 文件中更改歌曲相关参数即可实现自定义歌单列表

```bash
# 歌曲 API 地址
VITE_SONG_API = "https://api-meting.imsyy.top"
# 歌曲服务器 ( netease-网易云, tencent-qq音乐 )
VITE_SONG_SERVER = "netease"
# 播放类型 ( song-歌曲, playlist-播放列表, album-专辑, search-搜索, artist-艺术家 )
VITE_SONG_TYPE = "playlist"
# 播放 ID
VITE_SONG_ID = "7452421335"
```

### 字体

- 正文使用系统字体栈（`-apple-system` / `Segoe UI` / `PingFang SC` / `Microsoft YaHei` 等），
  不依赖第三方 HarmonyOS 字体 CSS，避免首屏阻塞、CDN 防盗链失效与隐私问题。
- Logo / 数字字体已使用 `pnpm fonts:subset` 做子集化：源字体在 `scripts/fonts/source/`，
  生成结果在 `public/font/`（说明见 [public/font/README.md](public/font/README.md)）。

### 网站图标及网站背景

#### 网站背景

可以在 `public/images` 中修改网站背景（默认 10 张本地壁纸，`background1.jpg` ~ `background10.jpg`）

如果想要添加更多的本地图片作为网站背景，可以将图片重命名 `background+数字` 的形式，
并同步修改 `src/services/wallpaper.js` 中的 `LOCAL_WALLPAPER_COUNT`。

#### 网站图标

可以在 `public/images/icon` 中修改网站图标。

### 技术栈

- [Vue 3.5](https://cn.vuejs.org/)
- [Vite 6](https://cn.vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/zh/)
- [Element Plus](https://element-plus.org/zh-CN/)
- [IconPark](https://iconpark.oceanengine.com/official)
- [xicons](https://xicons.org/)
- [Aplayer](https://aplayer.js.org/)
- [Vitest](https://vitest.dev/) / [Playwright](https://playwright.dev/) / ESLint 9

### API

- [韩小韩 WebAPI 接口](https://api.vvhan.com/)
- [搏天 API](https://api.btstu.cn/doc/sjbz.php)
- [教书先生 API](https://api.oioweb.cn/doc/weather/GetWeather)
- [高德开放平台](https://lbs.amap.com/)
- [Hitokoto 一言](https://hitokoto.cn/)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=imsyy/home&type=Date)](https://star-history.com/#imsyy/home&Date)

<a title="SSL" target="_blank" href="https://myssl.com/seal/detail?domain=blog.imsyy.top"><img src="https://img.shields.io/badge/MySSL-安全认证-brightgreen"></a>&nbsp;<a title="CDN" target="_blank" href="https://cdnjs.com/"><img src="https://img.shields.io/badge/CDN-Cloudflare-blue"></a>&nbsp;<a title="Copyright" target="_blank" href="https://imsyy.top/"><img src="https://img.shields.io/badge/Copyright%20%C2%A9%202020--2023-%E7%84%A1%E5%90%8D-red"></a>
