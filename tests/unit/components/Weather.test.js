// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import Weather from "@/components/Weather.vue";

const { getWeather } = vi.hoisted(() => ({ getWeather: vi.fn() }));

vi.mock("@/services/weather", () => ({ getWeather }));

describe("Weather 组件三态", () => {
  beforeEach(() => {
    getWeather.mockReset();
  });

  it("请求未完成时显示加载中", () => {
    getWeather.mockReturnValue(new Promise(() => {}));
    const wrapper = mount(Weather);
    expect(wrapper.text()).toContain("天气加载中");
  });

  it("成功后显示城市 / 天气 / 温度 / 风向 / 风力", async () => {
    getWeather.mockResolvedValue({
      city: "杭州",
      weather: "晴",
      temperature: "20",
      winddirection: "东风",
      windpower: "3",
    });
    const wrapper = mount(Weather);
    await flushPromises();

    expect(wrapper.text()).toContain("杭州");
    expect(wrapper.text()).toContain("晴");
    expect(wrapper.text()).toContain("20℃");
    expect(wrapper.text()).toContain("东风");
    expect(wrapper.text()).toContain("3");
  });

  it("全部来源失败时显示占位符", async () => {
    getWeather.mockResolvedValue(null);
    const wrapper = mount(Weather);
    await flushPromises();
    expect(wrapper.text()).toContain("天气数据暂不可用");
  });
});
