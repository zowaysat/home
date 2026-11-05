import { defineStore } from "pinia";

/**
 * UI 状态：只保存“当前界面怎么显示”，不做持久化。
 * 页面宽度 / 断点判断统一走 `@/composables/useBreakpoint`。
 */
export const useUiStore = defineStore("ui", {
  state: () => ({
    imgLoadStatus: false, // 壁纸加载状态
    backgroundShow: false, // 壁纸展示状态
    boxOpenState: false, // 盒子开启状态
    mobileOpenState: false, // 移动端左侧面板开启状态
    mobileFuncState: false, // 移动端功能区开启状态
    setOpenState: false, // 设置页面开启状态
  }),
  actions: {
    // 更改壁纸加载状态
    setImgLoadStatus(value) {
      this.imgLoadStatus = Boolean(value);
    },
    // 关闭盒子 / 设置（窗口变窄时）
    closePanels() {
      this.boxOpenState = false;
      this.setOpenState = false;
    },
    // 关闭移动端菜单（窗口变宽时）
    closeMobilePanels() {
      this.mobileOpenState = false;
      this.mobileFuncState = false;
    },
  },
});

export default useUiStore;
