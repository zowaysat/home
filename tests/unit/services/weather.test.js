import { describe, expect, it, vi } from "vitest";
import { fetchAmapWeather, getWeather, normalizeFallback } from "@/services/weather";

const AMAP_IP = { infocode: "10000", adcode: "110000", city: "北京市" };
const AMAP_WEATHER = {
  lives: [{ weather: "晴", temperature: "12", winddirection: "北", windpower: "3" }],
};
const FALLBACK = {
  result: {
    city: { City: "上海市" },
    condition: {
      day_weather: "多云",
      min_degree: "10",
      max_degree: "20",
      day_wind_direction: "东风",
      day_wind_power: "2",
    },
  },
};

const routeRequest = (routes) =>
  vi.fn(async (url) => {
    const matched = Object.keys(routes).find((key) => url.includes(key));
    if (!matched) throw new Error(`unexpected url: ${url}`);
    const value = routes[matched];
    if (value instanceof Error) throw value;
    return value;
  });

describe("weather service", () => {
  it("高德来源返回统一结构", async () => {
    const request = routeRequest({ "v3/ip": AMAP_IP, weatherInfo: AMAP_WEATHER });
    await expect(fetchAmapWeather("KEY", { request })).resolves.toEqual({
      city: "北京市",
      weather: "晴",
      temperature: "12",
      winddirection: "北",
      windpower: "3",
    });
  });

  it("高德失败后回退备用来源", async () => {
    const request = routeRequest({ "v3/ip": new Error("amap down"), GetWeather: FALLBACK });
    await expect(getWeather({ key: "KEY", request })).resolves.toMatchObject({
      city: "上海市",
      weather: "多云",
      temperature: 15,
    });
  });

  it("没有 Key 时只尝试备用来源", async () => {
    const request = routeRequest({ GetWeather: FALLBACK });
    await expect(getWeather({ request })).resolves.toMatchObject({ city: "上海市" });
  });

  it("全部来源失败返回 null", async () => {
    const request = vi.fn(async () => {
      throw new Error("network down");
    });
    await expect(getWeather({ key: "KEY", request })).resolves.toBeNull();
  });

  it("备用数据不完整时抛错", () => {
    expect(() => normalizeFallback({ result: {} })).toThrow("备用天气数据为空");
  });
});
