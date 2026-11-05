/**
 * 壁纸地址解析。
 * 远程图源当前多数已失效，因此默认只使用本地壁纸；
 * 需要时通过 VITE_FEATURE_REMOTE_WALLPAPER=true 打开。
 */
export const LOCAL_WALLPAPER_COUNT = 10;

export const REMOTE_WALLPAPER_URLS = Object.freeze({
  1: "https://api.dujin.org/bing/1920.php",
  2: "https://api.vvhan.com/api/wallpaper/views",
  3: "https://api.vvhan.com/api/wallpaper/acg",
});

export const localWallpaperUrl = (index) => `/images/background${index}.jpg`;

const clampLocalIndex = (index) => {
  if (!Number.isInteger(index)) return 1;
  return Math.min(Math.max(index, 1), LOCAL_WALLPAPER_COUNT);
};

/**
 * @param {string|number} type 壁纸类型（0 本地，1-3 远程）
 * @param {{ remoteEnabled?: boolean, localIndex?: number }} options
 */
export const resolveWallpaperUrl = (type, { remoteEnabled = false, localIndex = 1 } = {}) => {
  const localUrl = localWallpaperUrl(clampLocalIndex(localIndex));
  const typeKey = String(type ?? "0");
  if (!remoteEnabled || typeKey === "0") {
    return localUrl;
  }
  return REMOTE_WALLPAPER_URLS[typeKey] || localUrl;
};
