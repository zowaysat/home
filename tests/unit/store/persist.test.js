import { describe, expect, it } from "vitest";
import {
  LEGACY_PERSIST_KEY,
  PERSIST_KEY,
  createMemoryStorage,
  migrateLegacyState,
  sanitizeSettings,
} from "@/store/persist";

const legacyPayload = (value) => JSON.stringify(value);

describe("sanitizeSettings", () => {
  it("只保留已知字段并丢弃未知字段", () => {
    expect(
      sanitizeSettings({
        coverType: "2",
        footerBlur: false,
        playerLoop: "one",
        playerOrder: "random",
        unknownField: "x",
        innerWidth: 1920,
      }),
    ).toEqual({
      coverType: "2",
      footerBlur: false,
      playerLoop: "one",
      playerOrder: "random",
    });
  });

  it("丢弃非法取值（由 store 默认值兜底）", () => {
    expect(
      sanitizeSettings({
        coverType: 9,
        footerBlur: "true",
        playerLoop: "forever",
        musicVolume: "0.5",
      }),
    ).toEqual({});
  });

  it("音量限制在 0–1 之间", () => {
    expect(sanitizeSettings({ musicVolume: 1.5 }).musicVolume).toBe(1);
    expect(sanitizeSettings({ musicVolume: -0.5 }).musicVolume).toBe(0);
    expect(sanitizeSettings({ musicVolume: 0.42 }).musicVolume).toBe(0.42);
  });

  it("非对象输入返回空对象", () => {
    expect(sanitizeSettings(null)).toEqual({});
    expect(sanitizeSettings("abc")).toEqual({});
    expect(sanitizeSettings([1, 2])).toEqual({});
  });
});

describe("migrateLegacyState", () => {
  it("没有旧数据时不做任何事", () => {
    const storage = createMemoryStorage();
    expect(migrateLegacyState(storage)).toBe(false);
    expect(storage.getItem(PERSIST_KEY)).toBeNull();
  });

  it("把旧 data key 迁移到 home:state:v1 并删除旧 key", () => {
    const storage = createMemoryStorage();
    storage.setItem(
      LEGACY_PERSIST_KEY,
      legacyPayload({
        coverType: "1",
        footerBlur: false,
        playerLoop: "one",
        playerOrder: "random",
        musicVolume: 0.6,
        siteStartShow: true,
        musicClick: true,
        playerLrcShow: false,
        playerAutoplay: true,
        // 旧 store 里不持久化的字段，不应带到新 key
        innerWidth: 1280,
        imgLoadStatus: true,
      }),
    );

    expect(migrateLegacyState(storage)).toBe(true);
    expect(JSON.parse(storage.getItem(PERSIST_KEY))).toEqual({
      coverType: "1",
      musicVolume: 0.6,
      siteStartShow: true,
      musicClick: true,
      playerLrcShow: false,
      footerBlur: false,
      playerAutoplay: true,
      playerLoop: "one",
      playerOrder: "random",
    });
    expect(storage.getItem(LEGACY_PERSIST_KEY)).toBeNull();
  });

  it("新 key 已存在时不覆盖、不删除旧数据", () => {
    const storage = createMemoryStorage();
    storage.setItem(PERSIST_KEY, JSON.stringify({ coverType: "3" }));
    storage.setItem(LEGACY_PERSIST_KEY, legacyPayload({ coverType: "1" }));

    expect(migrateLegacyState(storage)).toBe(false);
    expect(JSON.parse(storage.getItem(PERSIST_KEY))).toEqual({ coverType: "3" });
    expect(storage.getItem(LEGACY_PERSIST_KEY)).not.toBeNull();
  });

  it("旧数据不是合法 JSON 时安全跳过", () => {
    const storage = createMemoryStorage();
    storage.setItem(LEGACY_PERSIST_KEY, "{not-json");

    expect(migrateLegacyState(storage)).toBe(false);
    expect(storage.getItem(PERSIST_KEY)).toBeNull();
    expect(storage.getItem(LEGACY_PERSIST_KEY)).toBe("{not-json");
  });

  it("key data 不含本站字段时（可能是其他脚本写入）不处理", () => {
    const storage = createMemoryStorage();
    storage.setItem(LEGACY_PERSIST_KEY, legacyPayload({ foo: "bar", count: 1 }));

    expect(migrateLegacyState(storage)).toBe(false);
    expect(storage.getItem(PERSIST_KEY)).toBeNull();
    expect(storage.getItem(LEGACY_PERSIST_KEY)).not.toBeNull();
  });

  it("重复迁移是幂等的", () => {
    const storage = createMemoryStorage();
    storage.setItem(LEGACY_PERSIST_KEY, legacyPayload({ coverType: "1" }));

    expect(migrateLegacyState(storage)).toBe(true);
    expect(migrateLegacyState(storage)).toBe(false);
    expect(JSON.parse(storage.getItem(PERSIST_KEY))).toEqual({ coverType: "1" });
  });

  it("storage 读写异常时不影响调用方", () => {
    const brokenStorage = {
      getItem() {
        throw new Error("denied");
      },
      setItem() {
        throw new Error("denied");
      },
      removeItem() {
        throw new Error("denied");
      },
    };

    expect(() => migrateLegacyState(brokenStorage)).not.toThrow();
    expect(migrateLegacyState(brokenStorage)).toBe(false);
  });
});
