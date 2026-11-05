import { describe, expect, it, vi } from "vitest";
import { getHitokoto, normalizeHitokoto } from "@/services/hitokoto";

describe("hitokoto service", () => {
  it("规范化文本与来源", () => {
    expect(normalizeHitokoto({ hitokoto: " 你好 ", from: " 测试 " })).toEqual({
      text: "你好",
      from: "测试",
    });
  });

  it("缺少来源时使用默认值", () => {
    expect(normalizeHitokoto({ hitokoto: "hi" })).toEqual({ text: "hi", from: "無名" });
  });

  it("空数据抛错", () => {
    expect(() => normalizeHitokoto({})).toThrow("一言接口返回的数据格式不正确");
    expect(() => normalizeHitokoto({ hitokoto: "  " })).toThrow();
  });

  it("请求成功后返回规范化结果", async () => {
    const request = vi.fn().mockResolvedValue({ hitokoto: "hi", from: "from" });
    await expect(getHitokoto({ request })).resolves.toEqual({ text: "hi", from: "from" });
  });
});
