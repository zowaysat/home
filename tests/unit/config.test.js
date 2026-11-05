import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeSiteUrl } from "@/config";

describe("normalizeSiteUrl", () => {
  it("解析裸域名", () => {
    expect(normalizeSiteUrl("example.com")).toEqual({
      host: "example.com",
      primary: "example",
      suffix: "com",
      href: "//example.com",
    });
  });

  it("保留协议并去掉末尾斜杠", () => {
    expect(normalizeSiteUrl("https://blog.example.com/")).toMatchObject({
      host: "blog.example.com",
      primary: "blog",
      suffix: "example.com",
      href: "https://blog.example.com",
    });
  });

  it("单段地址没有后缀", () => {
    expect(normalizeSiteUrl("zowaysat")).toMatchObject({
      host: "zowaysat",
      primary: "zowaysat",
      suffix: "",
      href: "//zowaysat",
    });
  });

  it("空值安全", () => {
    expect(normalizeSiteUrl("")).toEqual({ host: "", primary: "", suffix: "", href: "" });
    expect(normalizeSiteUrl(undefined)).toEqual({ host: "", primary: "", suffix: "", href: "" });
  });
});

describe("config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("读取环境变量并做 trim / 布尔解析", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_SITE_NAME", " 测试站点 ");
    vi.stubEnv("VITE_FEATURE_REMOTE_WALLPAPER", "true");
    vi.stubEnv("VITE_FEATURE_CUSTOM_CURSOR", "false");
    vi.stubEnv("VITE_SONG_ID", "123");
    vi.stubEnv("VITE_SONG_SERVER", "");

    const { config } = await import("@/config");

    expect(config.site.name).toBe("测试站点");
    expect(config.features.remoteWallpaper).toBe(true);
    expect(config.features.customCursor).toBe(false);
    expect(config.music.enabled).toBe(true);
    expect(config.music.server).toBe("netease");
  });
});
