<template>
  <div class="weather" v-if="!failed && weatherData.adCode.city && weatherData.weather.weather">
    <span>{{ weatherData.adCode.city }}&nbsp;</span>
    <span>{{ weatherData.weather.weather }}&nbsp;</span>
    <span>{{ weatherData.weather.temperature }}℃</span>
    <span class="sm-hidden">
      &nbsp;{{
        weatherData.weather.winddirection?.endsWith("风")
          ? weatherData.weather.winddirection
          : weatherData.weather.winddirection + "风"
      }}&nbsp;
    </span>
    <span class="sm-hidden">{{ weatherData.weather.windpower }}&nbsp;级</span>
  </div>
  <div class="weather" v-else>
    <span>{{ failed ? "天气数据暂不可用" : "天气加载中" }}</span>
  </div>
</template>

<script setup>
import { getWeather } from "@/services/weather";
import config from "@/config";

// 所有来源都失败时显示占位符，不再弹错误提示
const failed = ref(false);

// 天气数据
const weatherData = reactive({
  adCode: {
    city: null, // 城市
    adcode: null, // 城市编码
  },
  weather: {
    weather: null, // 天气现象
    temperature: null, // 实时气温
    winddirection: null, // 风向描述
    windpower: null, // 风力级别
  },
});

// 获取天气数据：服务层内部按 高德 → 备用 降级，全部失败返回 null
const loadWeather = async () => {
  const result = await getWeather({ key: config.weather.key });
  if (!result) {
    failed.value = true;
    return;
  }
  failed.value = false;
  weatherData.adCode = {
    city: result.city,
    adcode: null,
  };
  weatherData.weather = {
    weather: result.weather,
    temperature: result.temperature,
    winddirection: result.winddirection,
    windpower: result.windpower,
  };
};

onMounted(() => {
  loadWeather();
});
</script>
