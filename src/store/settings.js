import { defineStore } from "pinia";
import { PERSIST_KEY, SETTINGS_PERSIST_PATHS, createStorage } from "./persist";

/**
 * 设置状态：唯一需要持久化的 store。
 * key 带版本号（home:state:v1），旧 `data` key 的迁移见 ./persist.js。
 */
export const settingsStorage = createStorage();

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    coverType: "0", // 壁纸种类
    musicVolume: 0, // 音乐音量（0 表示尚未设置，播放器会回落到 0.7）
    siteStartShow: false, // 建站日期显示
    musicClick: false, // 点击“音乐”链接是否打开面板
    playerLrcShow: true, // 是否显示底栏歌词
    footerBlur: true, // 底栏模糊
    playerAutoplay: false, // 是否自动播放
    playerLoop: "all", // 循环播放 "all" | "one" | "none"
    playerOrder: "list", // 循环顺序 "list" | "random"
  }),
  persist: {
    key: PERSIST_KEY,
    storage: settingsStorage,
    paths: [...SETTINGS_PERSIST_PATHS],
  },
});

export default useSettingsStore;
