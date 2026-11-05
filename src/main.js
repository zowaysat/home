import { createApp, h } from "vue";
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

// PWA：站点更新提示（一键刷新）
// - 首次安装（此前没有 controller）不提示；
// - 后续版本更新时提示一次，点击即可刷新到新版本。
const hadServiceWorkerController = Boolean(navigator.serviceWorker?.controller);
let refreshPrompted = false;

navigator.serviceWorker?.addEventListener("controllerchange", () => {
  if (!hadServiceWorkerController || refreshPrompted) return;
  refreshPrompted = true;
  ElMessage({
    message: h("span", null, [
      "站点已更新，",
      h(
        "a",
        {
          href: "#",
          onClick: (event) => {
            event.preventDefault();
            window.location.reload();
          },
        },
        "点击刷新",
      ),
      "后生效",
    ]),
    duration: 0,
    showClose: true,
    grouping: true,
  });
});
