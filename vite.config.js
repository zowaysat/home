/* eslint-disable no-undef */
import { defineConfig, loadEnv } from "vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default ({ mode }) =>
  defineConfig({
    plugins: [
      vue(),
      AutoImport({
        imports: ["vue"],
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      VitePWA({
        registerType: "autoUpdate",
        // manifest 里的图标已由 globPatterns 纳入预缓存，避免重复注入
        includeManifestIcons: false,
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          // 关闭插件默认的 precache 导航回退，交给下方 NetworkFirst 处理 HTML，
          // 避免升级后用户长时间停留在旧 index.html
          navigateFallback: "",
          // app shell + 本地静态资源（壁纸 / 字体 / 图标）全部预缓存；
          // js/css 由 workbox 的 revision 机制管理，不再用运行时 CacheFirst
          globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2,woff,ttf}"],
          // 清理不再被引用的旧预缓存，避免升级后残留
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              // 页面导航：网络优先（3s 超时），失败回退缓存，避免发版后长时间停留旧页面
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "html-network",
                networkTimeoutSeconds: 3,
                expiration: { maxEntries: 10 },
              },
            },
            {
              // 图片（含用户替换的壁纸 / 远程图源）：缓存优先 + 30 天过期
              urlPattern: ({ request }) => request.destination === "image",
              handler: "CacheFirst",
              options: {
                cacheName: "image-cache",
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        manifest: {
          name: loadEnv(mode, process.cwd()).VITE_SITE_NAME,
          short_name: loadEnv(mode, process.cwd()).VITE_SITE_NAME,
          description: loadEnv(mode, process.cwd()).VITE_SITE_DES,
          display: "standalone",
          start_url: "/",
          theme_color: "#424242",
          background_color: "#424242",
          icons: [
            {
              src: "/images/icon/48.png",
              sizes: "48x48",
              type: "image/png",
            },
            {
              src: "/images/icon/72.png",
              sizes: "72x72",
              type: "image/png",
            },
            {
              src: "/images/icon/96.png",
              sizes: "96x96",
              type: "image/png",
            },
            {
              src: "/images/icon/128.png",
              sizes: "128x128",
              type: "image/png",
            },
            {
              src: "/images/icon/144.png",
              sizes: "144x144",
              type: "image/png",
            },
            {
              src: "/images/icon/192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/images/icon/512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
      viteCompression(),
    ],
    server: {
      port: "3000",
      open: true,
    },
    resolve: {
      alias: [
        {
          find: "@",
          replacement: resolve(__dirname, "src"),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern",
        },
      },
    },
    build: {
      // Vite 6 默认 target 变为 baseline-widely-available（Safari 16+）；
      // 个人主页仍有较老移动端访问，显式保持与 Vite 5 默认一致的 ES2020 范围
      target: "es2020",
      minify: "terser",
      terserOptions: {
        compress: {
          pure_funcs: ["console.log"],
        },
      },
    },
  });
