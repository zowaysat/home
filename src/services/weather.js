import { requestJson } from "./http";

const AMAP_IP_URL = "https://restapi.amap.com/v3/ip";
const AMAP_WEATHER_URL = "https://restapi.amap.com/v3/weather/weatherInfo";
const FALLBACK_WEATHER_URL = "https://api.oioweb.cn/api/weather/GetWeather";

/**
 * 天气数据统一结构：{ city, weather, temperature, winddirection, windpower }
 * 全部来源失败时由 getWeather 返回 null，由 UI 显示占位符。
 */
export const averageTemperature = (min, max) => {
  const average = (Number(min) + Number(max)) / 2;
  return Number.isFinite(average) ? Math.round(average) : "—";
};

export const normalizeAmap = (adCode, result) => {
  if (adCode?.infocode !== "10000" || !adCode.adcode) {
    throw new Error("高德地区查询失败");
  }
  const live = result?.lives?.[0];
  if (!live) {
    throw new Error("高德天气数据为空");
  }
  return {
    city: adCode.city || "未知地区",
    weather: live.weather,
    temperature: live.temperature,
    winddirection: live.winddirection,
    windpower: live.windpower,
  };
};

export const normalizeFallback = (result) => {
  const data = result?.result;
  const city = data?.city?.City;
  const condition = data?.condition;
  if (!city || !condition) {
    throw new Error("备用天气数据为空");
  }
  return {
    city,
    weather: condition.day_weather,
    temperature: averageTemperature(condition.min_degree, condition.max_degree),
    winddirection: condition.day_wind_direction,
    windpower: condition.day_wind_power,
  };
};

export const fetchAmapWeather = async (key, options = {}) => {
  const { request = requestJson } = options;
  const adCode = await request(`${AMAP_IP_URL}?key=${encodeURIComponent(key)}`);
  if (adCode?.infocode !== "10000" || !adCode.adcode) {
    throw new Error("高德地区查询失败");
  }
  const result = await request(
    `${AMAP_WEATHER_URL}?key=${encodeURIComponent(key)}&city=${encodeURIComponent(adCode.adcode)}`,
  );
  return normalizeAmap(adCode, result);
};

export const fetchFallbackWeather = async (options = {}) => {
  const { request = requestJson } = options;
  return normalizeFallback(await request(FALLBACK_WEATHER_URL));
};

/**
 * 按 "高德 → 备用" 顺序尝试，全部失败返回 null（不向 UI 抛错）
 */
export const getWeather = async ({ key = "", ...options } = {}) => {
  const providers = key
    ? [() => fetchAmapWeather(key, options), () => fetchFallbackWeather(options)]
    : [() => fetchFallbackWeather(options)];

  for (const provider of providers) {
    try {
      return await provider();
    } catch (error) {
      // 继续尝试下一个来源，最终由调用方展示占位符
    }
  }
  return null;
};
