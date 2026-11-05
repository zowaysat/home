import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// 独立的测试配置：只做别名与环境设置，不加载构建插件（PWA / 压缩等）
export default defineConfig({
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
