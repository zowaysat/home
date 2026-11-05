import { computed, onBeforeUnmount, onMounted, ref } from "vue";

/**
 * 断点定义：与样式里的媒体查询保持一致，作为 JS 侧判断宽度的唯一来源。
 * 语义：max-width，即 `isMobile` 等价于 CSS 的 `@media (max-width: 720px)`。
 */
export const BREAKPOINTS = Object.freeze({
  mobile: 720,
  narrow: 910,
  medium: 1200,
});

/**
 * 纯函数：根据窗口宽度算出各断点状态，方便单测与非组件场景复用。
 * @param {number} width 窗口宽度（px）
 */
export const resolveBreakpoint = (width) => {
  const safeWidth = Number.isFinite(width) && width >= 0 ? width : 0;
  return {
    width: safeWidth,
    isMobile: safeWidth <= BREAKPOINTS.mobile,
    isNarrow: safeWidth <= BREAKPOINTS.narrow,
    isMedium: safeWidth <= BREAKPOINTS.medium,
    isDesktop: safeWidth > BREAKPOINTS.mobile,
  };
};

const getWindowWidth = () => {
  if (typeof window === "undefined") return 0;
  return window.innerWidth ?? document.documentElement?.clientWidth ?? 0;
};

// 全局唯一状态：多个组件共享同一份宽度与监听器
const breakpoint = ref(resolveBreakpoint(getWindowWidth()));
let subscribers = 0;
let mediaListeners = [];
let resizeHandler = null;

const update = () => {
  const next = resolveBreakpoint(getWindowWidth());
  if (next.width !== breakpoint.value.width) breakpoint.value = next;
};

const teardown = () => {
  mediaListeners.forEach(({ query, handler }) => {
    if (query.removeEventListener) query.removeEventListener("change", handler);
    else if (query.removeListener) query.removeListener(handler);
  });
  mediaListeners = [];
  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
    resizeHandler = null;
  }
};

const setup = () => {
  if (typeof window === "undefined") return;
  if (mediaListeners.length || resizeHandler) return;

  // matchMedia 是主信号（只在跨断点时触发），resize 兜底并更新精确宽度
  if (typeof window.matchMedia === "function") {
    mediaListeners = Object.values(BREAKPOINTS).map((size) => {
      const query = window.matchMedia(`(max-width: ${size}px)`);
      const handler = () => update();
      if (query.addEventListener) query.addEventListener("change", handler);
      else if (query.addListener) query.addListener(handler);
      return { query, handler };
    });
  }

  resizeHandler = () => update();
  window.addEventListener("resize", resizeHandler);
  update();
};

/**
 * 组件内使用：返回只读断点状态（computed）。
 * 首次挂载时建立全局监听，最后一个组件卸载后释放。
 *
 * @returns {{ width: import("vue").ComputedRef<number>, isMobile: import("vue").ComputedRef<boolean>, isNarrow: import("vue").ComputedRef<boolean>, isMedium: import("vue").ComputedRef<boolean>, isDesktop: import("vue").ComputedRef<boolean> }}
 */
export const useBreakpoint = () => {
  onMounted(() => {
    subscribers += 1;
    setup();
  });
  onBeforeUnmount(() => {
    subscribers = Math.max(0, subscribers - 1);
    if (subscribers === 0) teardown();
  });

  return {
    width: computed(() => breakpoint.value.width),
    isMobile: computed(() => breakpoint.value.isMobile),
    isNarrow: computed(() => breakpoint.value.isNarrow),
    isMedium: computed(() => breakpoint.value.isMedium),
    isDesktop: computed(() => breakpoint.value.isDesktop),
  };
};

/** 非组件场景 / 测试读取当前断点（只读快照） */
export const getBreakpoint = () => breakpoint.value;

export default useBreakpoint;
