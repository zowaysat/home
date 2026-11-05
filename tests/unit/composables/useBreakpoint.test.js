import { describe, expect, it } from "vitest";
import { BREAKPOINTS, getBreakpoint, resolveBreakpoint } from "@/composables/useBreakpoint";

describe("resolveBreakpoint", () => {
  it("桌面宽度只命中 isMedium / isDesktop", () => {
    const state = resolveBreakpoint(1440);
    expect(state).toEqual({
      width: 1440,
      isMobile: false,
      isNarrow: false,
      isMedium: false,
      isDesktop: true,
    });
  });

  it("中等宽度命中 isMedium", () => {
    const state = resolveBreakpoint(1150);
    expect(state.isMobile).toBe(false);
    expect(state.isNarrow).toBe(false);
    expect(state.isMedium).toBe(true);
  });

  it("窄屏命中 isNarrow 但仍非移动端", () => {
    const state = resolveBreakpoint(880);
    expect(state.isMobile).toBe(false);
    expect(state.isNarrow).toBe(true);
  });

  it("移动端边界 720px 及以下为 isMobile", () => {
    expect(resolveBreakpoint(BREAKPOINTS.mobile).isMobile).toBe(true);
    expect(resolveBreakpoint(BREAKPOINTS.mobile + 1).isMobile).toBe(false);
  });

  it("断点之间保持单调", () => {
    const widths = [0, 390, 720, 721, 910, 911, 1200, 1201, 2560];
    const states = widths.map(resolveBreakpoint);
    for (const state of states) {
      if (state.isMobile) expect(state.isNarrow).toBe(true);
      if (state.isNarrow) expect(state.isMedium).toBe(true);
    }
  });

  it("非法宽度回退为 0（当作移动端）", () => {
    expect(resolveBreakpoint(undefined).width).toBe(0);
    expect(resolveBreakpoint(-10).width).toBe(0);
    expect(resolveBreakpoint(Number.NaN).isMobile).toBe(true);
  });

  it("Node 环境（无 window）初始断点宽度为 0", () => {
    expect(getBreakpoint().width).toBe(0);
  });
});
