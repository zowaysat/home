# 更新日志

本项目遵循语义化版本（SemVer）。solo 项目，手写记录即可（不用 changesets）。

## [Unreleased]

### 构建工具链

- 依赖升级第一批：Vite 4.5 → **5.4.21**（构建约 31s → 22s），`@vitejs/plugin-vue` 5.2.4、
  `vite-plugin-pwa` 0.21.2、`unplugin-auto-import` 0.17.8、`unplugin-vue-components` 0.26.0、Vitest 2.1.9。
- 移除未使用依赖 `axios`；移除 sass 中已无效的 `silenceDeprecations` 配置（keep `api: "modern"`）。
- 依赖升级第二批：Vite 5.4.21 → **6.4.5**（构建约 22s），Vitest 2.1.9 → **3.2.7**；
  Vite 6 默认 `build.target` 变为 baseline-widely-available，显式设置 `target: "es2020"` 保持旧浏览器范围。
- 依赖升级第三批：Vue 3.4.24 → **3.5.45**、Element Plus 2.7.1 → **2.14.7**；
  EP 2.14 的 switch 通过 `useAriaProps(["ariaLabel"])` 绑定无障碍名称，`Set.vue` 已改用 `aria-label`。
- 验证：68 单测 / 7 条 e2e（设置面板开关与持久化、键盘可读名称）/ lint / build（约 28.5s，JS gzip 157.12 KB、
  CSS gzip 22.55 KB）/ `pnpm dev` 200 / `pnpm install --frozen-lockfile` 全部通过；
  EP 升级带来约 +15 KB gzip 增量，仍在 JS gzip ≤ 180 KB 预算内。
- 说明：`vite-plugin-compression@0.5.1` 的 peer 为 `vite >=2`，在 Vite 5/6 下构建正常，暂不替换；
  ESLint 9 flat config 作为后续独立批次。

### 可访问性

- 交互元素改为原生 `button` 并补无障碍名称：简介卡片、网站链接、一言刷新、打开音乐面板、音乐列表/回到一言、
  播放/暂停、上/下一首、盒子关闭/设置入口、设置关闭、移动端菜单与 Logo、GitHub 入口。
- 新增 `.plain-button` 按钮重置与全局 `:focus-visible` 焦点样式；盒子/设置/音乐面板的隐藏按钮在键盘聚焦时可见。
- 新增 `@media (prefers-reduced-motion: reduce)` 动画降级；正文恢复可选中，`user-select: none` 只保留在装饰元素。
- 支持 Esc 按层级关闭浮层；`aria-expanded` 标记展开状态；设置项 switch 通过 `label` 映射 `aria-label`。
- e2e 新增键盘操作与 reduced-motion 两条用例（共 7 条）。

### 性能

- 字体子集化：Pacifico 仅保留 ASCII（Logo / 版本号），UnidreamLED 仅保留数字与符号（时钟 / 进度百分比）；
  站点字体从 43.5 KB 降到 14.5 KB。
- 不再随站点分发 315 KB 未使用的备用完整字体（`Pacifico-Regular-all.ttf`），PWA 预缓存减少约 337 KiB。
- 新增 `pnpm fonts:subset`（基于 harfbuzz），源字体与生成脚本放在 `scripts/`，可重复生成。

### PWA

- 缓存策略调整：构建产物与本地资源改由 workbox revision 预缓存（42 项 / 约 1.9 MB，含 10 张壁纸、字体、图标）；
  HTML 导航改 `NetworkFirst`（3s 超时回退缓存）；图片 `CacheFirst` + 30 天过期；移除旧的 js/css 运行时 `CacheFirst`。
- 更新提示改为一键刷新，且首次安装（此前无 controller）不再提示；清理过期预缓存。
- e2e 新增“PWA 注册成功、断网后仍可打开首页”。

### 测试与 CI

- **Playwright e2e**：引入 `@playwright/test`，新增 4 条首页冒烟用例（无脚本错误 / 本地壁纸可见 /
  改设置刷新后仍生效 / 旧 `data` 数据迁移），`playwright.config.js` 使用 `build + preview` 作为 webServer。
- **CI**：新增 `e2e` job（安装 Chromium 后运行冒烟，失败上传报告与 trace）；
  `test:all` 串行执行单测与 e2e。

### 工程化（P1 收尾）

- **store 拆分**：`mainStore` 拆为 `useUiStore`（界面）、`useSettingsStore`（持久化设置）、
  `usePlayerStore`（播放器运行期），`src/store/index.js` 统一导出。
- **持久化版本迁移**：设置持久化 key 从 `data` 迁移到 `home:state:v1`；
  新增 `migrateLegacyState`（字段白名单 + 类型纠偏 + 幂等），启动时在创建 store 前执行。
- **useBreakpoint**：新增断点 composable（720 / 910 / 1200），替代 `store.innerWidth` 与手写 resize 监听。
- **样式去重**：移除 Vite `additionalData` 对 `global.scss` 的重复注入，改为全局引入一次。
- **测试**：新增持久化迁移、settings 持久化、ui/player store、断点解析用例；
  当前 13 个测试文件 / 68 个用例全部通过。

## [4.1.4] - 2026-11-05（维护基线）

### P0 基线修复

- 修正 `.env.example` 站点 URL、Apple 图标路径，补充音乐关闭说明与 3 个功能开关。
- 新增 `scripts/check-env.mjs`：构建/开发前校验必填 `VITE_*`，缺 `.env` 时给出复制提示。
- 远程壁纸、音乐、天气全部支持优雅降级；播放器改为 `await + catch`，失败只提示一次。
- 歌词 `v-html` 改文本插值；右键禁用、自定义光标改为默认关闭的 feature flag。
- 音乐播放器改为首次打开面板才挂载（首屏不再请求歌单）。
- `pnpm-workspace.yaml` 用 `allowBuilds` 放行 `esbuild` / `vue-demi` 构建脚本。

### P1 架构重构

- 新增唯一配置入口 `src/config/index.js`，24 处 `import.meta.env` 收敛到一处。
- 新增服务层 `src/services/`（http / hitokoto / weather / music / wallpaper），统一超时、错误归一化与降级。
- 新增 composable：`useSiteUrl`（合并 4 处域名解析）、`useNow`（全局单一时钟）。
- 引入 Vitest，覆盖时间、防抖、配置、HTTP、天气、一言、音乐、壁纸等核心逻辑。
- 删除旧 `src/api/index.js`。

[Unreleased]: https://github.com/zowaysat/home/compare/v4.1.4...HEAD
[4.1.4]: https://github.com/zowaysat/home/releases/tag/v4.1.4
