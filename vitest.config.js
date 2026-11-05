import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// 通用单测在 node 环境；组件测试通过 `// @vitest-environment happy-dom` 单独启用 DOM
export default defineConfig({
  plugins: [
    vue(),
    // 组件测试需要与构建一致的自动导入（ref / computed / ElMessage / Element Plus 组件）
    // 关闭 d.ts 生成，避免测试运行时改写仓库内声明文件
    AutoImport({
      imports: ["vue"],
      resolvers: [ElementPlusResolver({ importStyle: false })],
      dts: false,
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: false })],
      dts: false,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.js"],
  },
});
