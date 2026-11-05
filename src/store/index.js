/**
 * store 入口：按职责拆成三个 store。
 *
 * - `useUiStore`      界面显示状态（不持久化）
 * - `useSettingsStore` 用户设置（持久化，key: home:state:v1）
 * - `usePlayerStore`  播放器运行期状态（不持久化）
 *
 * 旧代码里的 `mainStore` 已移除，请按需引入对应 store。
 */
export { useUiStore } from "./ui";
export { useSettingsStore } from "./settings";
export { usePlayerStore } from "./player";
