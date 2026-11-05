/**
 * 构建前环境变量校验。
 *
 * 背景：index.html 里使用了 %VITE_*% 占位符，缺少对应变量时 Vite 不会替换，
 * vite-plugin-pwa 处理 HTML 时会抛出 "URIError: URI malformed"，报错信息完全看不出原因。
 * 本脚本在 build / dev 之前做一次显式校验，给出可执行的修复提示。
 *
 * 用法：
 *   node scripts/check-env.mjs            # 默认 production
 *   node scripts/check-env.mjs development
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnv } from "vite";

const mode = process.argv[2] || "production";
const root = process.cwd();
const env = loadEnv(mode, root, "");

const errors = [];
const warnings = [];

const envFiles = [".env", ".env.local", `.env.${mode}`, `.env.${mode}.local`];
const hasProcessEnv = Object.keys(process.env).some((key) => key.startsWith("VITE_"));
if (!envFiles.some((file) => existsSync(resolve(root, file))) && !hasProcessEnv) {
  console.error(
    "环境变量校验失败：未找到 .env 文件，也没有通过环境变量注入 VITE_* 配置。\n" +
      "请先复制模板再修改：\n" +
      "  PowerShell: Copy-Item .env.example .env\n" +
      "  bash:       cp .env.example .env\n",
  );
  process.exit(1);
}

const required = (key) => {
  const value = typeof env[key] === "string" ? env[key].trim() : "";
  if (!value) errors.push(`${key} 未配置（必填）`);
  return value;
};

/** 域名：允许 example.com 或 https://example.com，拒绝带路径/端口/空后缀 */
const hostPattern = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
const validateSiteUrl = (value) => {
  const raw = value.trim();
  const host = raw.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  if (raw.includes("/") && !/^https?:\/\//i.test(raw)) {
    errors.push(`VITE_SITE_URL 只写域名，不要带路径：${raw}`);
    return;
  }
  if (host.includes("/") || host.includes(" ")) {
    errors.push(`VITE_SITE_URL 只写域名，不要带路径：${raw}`);
    return;
  }
  if (!hostPattern.test(host)) {
    errors.push(`VITE_SITE_URL 不是合法域名（需要类似 example.com 的形式）：${raw}`);
    return;
  }
  return host;
};

/** 本地静态资源：必须以 / 开头且文件真实存在，避免 404 */
const validatePublicAsset = (key, value) => {
  if (!value) return;
  if (!value.startsWith("/")) {
    errors.push(`${key} 必须以 / 开头（相对 public 目录）：${value}`);
    return;
  }
  const file = resolve(root, "public", value.slice(1));
  if (!existsSync(file)) {
    errors.push(`${key} 指向的文件不存在：public${value}`);
  }
};

const siteUrlValue = required("VITE_SITE_URL");
const siteUrl = siteUrlValue ? validateSiteUrl(siteUrlValue) : "";
if (siteUrl) env.VITE_SITE_URL = siteUrl;

required("VITE_SITE_NAME");
required("VITE_SITE_AUTHOR");
required("VITE_SITE_DES");
required("VITE_SITE_LOGO");
required("VITE_SITE_MAIN_LOGO");
required("VITE_SITE_APPLE_LOGO");
validatePublicAsset("VITE_SITE_LOGO", env.VITE_SITE_LOGO);
validatePublicAsset("VITE_SITE_MAIN_LOGO", env.VITE_SITE_MAIN_LOGO);
validatePublicAsset("VITE_SITE_APPLE_LOGO", env.VITE_SITE_APPLE_LOGO);

const siteStart = (env.VITE_SITE_START || "").trim();
if (siteStart && !/^\d{4}(-\d{2}-\d{2})?$/.test(siteStart)) {
  errors.push(`VITE_SITE_START 格式应为 YYYY 或 YYYY-MM-DD：${siteStart}`);
}

const weatherKey = (env.VITE_WEATHER_KEY || "").trim();
if (!weatherKey) {
  warnings.push("未配置 VITE_WEATHER_KEY，将尝试备用天气接口（当前可能不可用），页面只显示占位符");
}

const songId = (env.VITE_SONG_ID || "").trim();
const songApi = (env.VITE_SONG_API || "").trim();
if (songId) {
  if (!songApi) {
    errors.push("配置了 VITE_SONG_ID 但缺少 VITE_SONG_API");
  } else if (!/^https?:\/\//i.test(songApi)) {
    errors.push(`VITE_SONG_API 必须是完整 URL：${songApi}`);
  }
  const servers = ["netease", "tencent"];
  const types = ["song", "playlist", "album", "search", "artist"];
  const server = (env.VITE_SONG_SERVER || "").trim();
  const type = (env.VITE_SONG_TYPE || "").trim();
  if (!servers.includes(server)) {
    errors.push(`VITE_SONG_SERVER 只能是 ${servers.join(" / ")}：${server || "(空)"}`);
  }
  if (!types.includes(type)) {
    errors.push(`VITE_SONG_TYPE 只能是 ${types.join(" / ")}：${type || "(空)"}`);
  }
} else {
  warnings.push("未配置 VITE_SONG_ID，音乐播放器将不会显示（需要时配置自己的 Meting API 与歌单 ID）");
}

for (const [key, label] of [
  ["VITE_FEATURE_REMOTE_WALLPAPER", "远程壁纸"],
  ["VITE_FEATURE_CUSTOM_CURSOR", "自定义光标"],
  ["VITE_FEATURE_CONTEXT_MENU_LOCK", "禁用右键"],
]) {
  const value = (env[key] || "").trim();
  if (value && value !== "true" && value !== "false") {
    errors.push(`${key}（${label}）只能填 true 或 false：${value}`);
  }
}

if (warnings.length) {
  console.warn("环境变量提示：");
  for (const warning of warnings) console.warn(`  - ${warning}`);
}

if (errors.length) {
  console.error(`\n环境变量校验失败（mode=${mode}）：`);
  for (const error of errors) console.error(`  - ${error}`);
  console.error("\n修复后重试，参考 .env.example。\n");
  process.exit(1);
}

console.log(`环境变量校验通过（mode=${mode}）。`);
