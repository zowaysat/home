import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp, nextTick } from "vue";
import { createPinia, setActivePinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { PERSIST_KEY } from "@/store/persist";
import { settingsStorage, useSettingsStore } from "@/store/settings";

const createTestingPinia = () => {
  const pinia = createPinia();
  // install 之后插件才会注册到 pinia._p（仅 setActivePinia 不够）
  createApp({}).use(pinia);
  pinia.use(piniaPluginPersistedstate);
  setActivePinia(pinia);
  return pinia;
};

describe("settings store", () => {
  beforeEach(() => {
    settingsStorage.removeItem(PERSIST_KEY);
  });

  afterEach(() => {
    settingsStorage.removeItem(PERSIST_KEY);
  });

  it("没有持久化数据时使用默认值", () => {
    createTestingPinia();
    const settings = useSettingsStore();
    expect(settings.coverType).toBe("0");
    expect(settings.musicVolume).toBe(0);
    expect(settings.siteStartShow).toBe(false);
    expect(settings.musicClick).toBe(false);
    expect(settings.playerLrcShow).toBe(true);
    expect(settings.footerBlur).toBe(true);
    expect(settings.playerAutoplay).toBe(false);
    expect(settings.playerLoop).toBe("all");
    expect(settings.playerOrder).toBe("list");
  });

  it("启动时从 home:state:v1 恢复设置", () => {
    settingsStorage.setItem(
      PERSIST_KEY,
      JSON.stringify({
        coverType: "2",
        footerBlur: false,
        playerLoop: "one",
        playerOrder: "random",
        playerLrcShow: false,
        musicVolume: 0.35,
      }),
    );

    createTestingPinia();
    const settings = useSettingsStore();
    expect(settings.coverType).toBe("2");
    expect(settings.footerBlur).toBe(false);
    expect(settings.playerLoop).toBe("one");
    expect(settings.playerOrder).toBe("random");
    expect(settings.playerLrcShow).toBe(false);
    expect(settings.musicVolume).toBe(0.35);
  });

  it("修改设置后写回同一个 key（只包含允许持久化的字段）", async () => {
    createTestingPinia();
    const settings = useSettingsStore();

    settings.footerBlur = false;
    settings.coverType = "1";
    await nextTick();

    const persisted = JSON.parse(settingsStorage.getItem(PERSIST_KEY));
    expect(persisted.footerBlur).toBe(false);
    expect(persisted.coverType).toBe("1");
    // 运行期字段不应写进持久化数据
    expect(persisted).not.toHaveProperty("imgLoadStatus");
    expect(persisted).not.toHaveProperty("playerState");
  });

  it("持久化数据损坏时回退默认值", () => {
    settingsStorage.setItem(PERSIST_KEY, "{broken");

    createTestingPinia();
    const settings = useSettingsStore();
    expect(settings.footerBlur).toBe(true);
    expect(settings.coverType).toBe("0");
  });
});
