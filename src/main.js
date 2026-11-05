import { createApp } from "vue";
import "@/style/global.scss";
import "@/style/style.scss";
import App from "@/App.vue";
// 引入 pinia
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
// 旧版持久化数据迁移（key: data → home:state:v1）
import { migrateLegacyState } from "@/store/persist";
// swiper
import "swiper/css";

// 必须在创建 store 之前完成迁移，否则会读到空的新 key
migrateLegacyState();

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.mount("#app");

// PWA
navigator.serviceWorker.addEventListener("controllerchange", () => {
  // 弹出更新提醒
  console.log("站点已更新，刷新后生效");
  ElMessage("站点已更新，刷新后生效");
});
