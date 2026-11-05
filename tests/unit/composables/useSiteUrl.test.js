import { describe, expect, it } from "vitest";
import { useSiteUrl } from "@/composables/useSiteUrl";

describe("useSiteUrl", () => {
  it("返回 computed 并解析协议地址", () => {
    const siteUrl = useSiteUrl("https://blog.example.com/");
    expect(siteUrl.value).toMatchObject({
      primary: "blog",
      suffix: "example.com",
      href: "https://blog.example.com",
    });
  });

  it("无协议时使用协议相对地址", () => {
    const siteUrl = useSiteUrl("example.com");
    expect(siteUrl.value.href).toBe("//example.com");
  });

  it("单段地址没有后缀", () => {
    const siteUrl = useSiteUrl("zowaysat");
    expect(siteUrl.value).toMatchObject({ primary: "zowaysat", suffix: "" });
  });
});
