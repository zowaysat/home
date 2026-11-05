// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createApp, nextTick } from "vue";
import { createPinia, setActivePinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import Set from "@/components/Set.vue";
import { useSettingsStore } from "@/store";

/** 与 main.js 一致的 pinia + 持久化环境 */
const createPiniaWithPersistence = () => {
  const pinia = createPinia();
  createApp({}).use(pinia);
  pinia.use(piniaPluginPersistedstate);
  setActivePinia(pinia);
  return pinia;
};

describe("Set 组件", () => {
  beforeEach(() => {
    window.localStorage.clear();
    createPiniaWithPersistence();
  });

  it("切换到关闭底栏模糊会更新 store 并写入持久化", async () => {
    const wrapper = mount(Set);
    const settings = useSettingsStore();

    expect(settings.footerBlur).toBe(true);
    // 顺序：建站日期 / 音乐点击 / 歌词显示 / 底栏模糊 / 自动播放 / 随机播放
    const switches = wrapper.findAll(".el-switch");
    expect(switches).toHaveLength(6);

    await switches[3].trigger("click");
    await nextTick();
    await nextTick();

    expect(settings.footerBlur).toBe(false);
    const persisted = JSON.parse(window.localStorage.getItem("home:state:v1") || "{}");
    expect(persisted.footerBlur).toBe(false);
  });
});
