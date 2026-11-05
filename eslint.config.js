import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

/**
 * ESLint 9 flat config。
 *
 * - 基础规则：eslint:recommended + vue3-essential；
 * - 浏览器 / Node 全局；
 * - unplugin-auto-import 与 unplugin-vue-components 注入的自动导入符号；
 * - 忽略构建产物、测试报告与生成的类型声明。
 */

// unplugin-auto-import 注入的 Vue API + Element Plus 的 ElMessage + 音乐列表全局方法
const AUTO_IMPORT_GLOBALS = {
  defineProps: "readonly",
  defineEmits: "readonly",
  withDefaults: "readonly",
  defineComponent: "readonly",
  h: "readonly",
  vue: "readonly",
  ref: "readonly",
  reactive: "readonly",
  computed: "readonly",
  watch: "readonly",
  provide: "readonly",
  inject: "readonly",
  onBeforeMount: "readonly",
  onMounted: "readonly",
  onBeforeUnmount: "readonly",
  nextTick: "readonly",
  ElMessage: "readonly",
  $openList: "readonly",
};

export default [
  {
    name: "home/ignores",
    ignores: [
      "**/node_modules/**",
      "dist/**",
      "dev-dist/**",
      "test-results/**",
      "playwright-report/**",
      "blob-report/**",
      "**/*.d.ts",
    ],
  },
  js.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    name: "home/language-options",
    files: ["**/*.{js,mjs,cjs,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...AUTO_IMPORT_GLOBALS,
      },
    },
  },
  {
    name: "home/rules",
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
];
