import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import debounce from "@/utils/debounce";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("等待期间只执行最后一次", () => {
    const fn = vi.fn();
    debounce(fn, 300);
    debounce(fn, 300);
    debounce(fn, 300);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("immediate 模式立即执行一次，结束后可再次触发", () => {
    const fn = vi.fn();
    debounce(fn, 300, true);
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);
    debounce(fn, 300, true);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
