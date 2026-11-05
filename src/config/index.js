/**
 * 唯一配置入口。
 *
 * 约定：
 * - 所有 `import.meta.env` 读取都收敛在本文件，组件与服务只依赖 config；
 * - 构建期由 scripts/check-env.mjs 负责"必填 + 格式"校验，这里只做运行时规范化；
 * - 一律返回 trim 后的字符串，布尔开关只接受 "true"/"false"。
 */
const env = import.meta.env;

export const toBoolean = (value, fallback = false) => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return fallback;
};

const toText = (value, fallback = "") =>
  typeof value === "string" ? value.trim() || fallback : fallback;

/**
 * 把站点地址规范化为 { host, primary, suffix, href }
 * - 支持 example.com / https://example.com / //example.com
 * - 未写协议时 href 使用协议相对地址 //host
 */
export const normalizeSiteUrl = (value) => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return { host: "", primary: "", suffix: "", href: "" };

  const hasProtocol = /^https?:\/\//i.test(raw);
  const host = raw.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const [primary = "", ...rest] = host.split(".");

  return {
    host,
    primary,
    suffix: rest.join("."),
    href: hasProtocol ? raw.replace(/\/+$/, "") : `//${host}`,
  };
};

export const config = Object.freeze({
  site: {
    name: toText(env.VITE_SITE_NAME),
    author: toText(env.VITE_SITE_AUTHOR),
    keywords: toText(env.VITE_SITE_KEYWORDS),
    description: toText(env.VITE_SITE_DES),
    url: toText(env.VITE_SITE_URL),
    logo: toText(env.VITE_SITE_LOGO),
    mainLogo: toText(env.VITE_SITE_MAIN_LOGO),
    appleLogo: toText(env.VITE_SITE_APPLE_LOGO),
    startDate: toText(env.VITE_SITE_START),
    icp: toText(env.VITE_SITE_ICP),
  },
  introduction: {
    hello: toText(env.VITE_DESC_HELLO),
    text: toText(env.VITE_DESC_TEXT),
    helloOther: toText(env.VITE_DESC_HELLO_OTHER),
    textOther: toText(env.VITE_DESC_TEXT_OTHER),
  },
  weather: {
    key: toText(env.VITE_WEATHER_KEY),
  },
  music: {
    api: toText(env.VITE_SONG_API),
    server: toText(env.VITE_SONG_SERVER, "netease"),
    type: toText(env.VITE_SONG_TYPE, "playlist"),
    id: toText(env.VITE_SONG_ID),
    enabled: Boolean(toText(env.VITE_SONG_ID)),
  },
  features: {
    remoteWallpaper: toBoolean(env.VITE_FEATURE_REMOTE_WALLPAPER),
    customCursor: toBoolean(env.VITE_FEATURE_CUSTOM_CURSOR),
    contextMenuLock: toBoolean(env.VITE_FEATURE_CONTEXT_MENU_LOCK),
  },
  build: {
    isDev: Boolean(env.DEV),
  },
});

export default config;
