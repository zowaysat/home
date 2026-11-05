import { describe, expect, it } from "vitest";
import { REMOTE_WALLPAPER_URLS, resolveWallpaperUrl } from "@/services/wallpaper";

describe("wallpaper service", () => {
  it("默认使用本地壁纸", () => {
    expect(resolveWallpaperUrl("0", { localIndex: 3 })).toBe("/images/background3.jpg");
  });

  it("远程开关关闭时回退本地", () => {
    expect(resolveWallpaperUrl("2", { remoteEnabled: false, localIndex: 3 })).toBe(
      "/images/background3.jpg",
    );
  });

  it("远程开关开启时使用远程地址", () => {
    expect(resolveWallpaperUrl("2", { remoteEnabled: true })).toBe(REMOTE_WALLPAPER_URLS[2]);
  });

  it("未知类型回退本地", () => {
    expect(resolveWallpaperUrl("9", { remoteEnabled: true, localIndex: 2 })).toBe(
      "/images/background2.jpg",
    );
  });

  it("本地序号越界时被钳制", () => {
    expect(resolveWallpaperUrl("0", { localIndex: 0 })).toBe("/images/background1.jpg");
    expect(resolveWallpaperUrl("0", { localIndex: 99 })).toBe("/images/background10.jpg");
  });
});
