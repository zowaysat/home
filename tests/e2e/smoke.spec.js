import { expect, test } from "@playwright/test";

/**
 * 首页冒烟（Playwright）。
 *
 * 只断言“本项目可控制的部分”：
 * - 脚本运行时错误必须为零；
 * - 第三方接口（一言 / 天气 / 远程壁纸 / 外部字体）失败属于设计内降级，
 *   浏览器的资源加载失败日志会被忽略，由页面占位兜底；
 * - 设置持久化与旧数据迁移必须真实生效。
 */

const RESOURCE_ERROR = /Failed to load resource/i;

/** 收集运行时错误（忽略第三方资源加载失败） */
const collectErrors = (page) => {
  const pageErrors = [];
  const consoleErrors = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (RESOURCE_ERROR.test(text)) return;
    const url = message.location()?.url;
    consoleErrors.push(url ? `${text} @ ${url}` : text);
  });

  return { pageErrors, consoleErrors };
};

/** 等待首页渲染完成（壁纸加载后 #main 才会出现） */
const waitForHome = async (page) => {
  await expect(page.locator("#main")).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("#loader-wrapper")).toHaveClass(/loaded/);
};

test("首页加载完成，无脚本运行时错误", async ({ page }) => {
  const errors = collectErrors(page);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForHome(page);

  // 主内容已渲染：站点名、网站列表、页脚
  await expect(page.locator(".message .logo .name")).toContainText("example");
  await expect(page.locator(".links")).toBeVisible();
  await expect(page.locator("#footer")).toBeVisible();

  expect(errors.pageErrors, "页面存在未捕获异常").toEqual([]);
  expect(errors.consoleErrors, "控制台存在脚本错误").toEqual([]);
});

test("本地壁纸正常显示", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForHome(page);

  const wallpaper = page.locator(".cover .bg");
  await expect(wallpaper).toBeVisible();
  await expect(wallpaper).toHaveAttribute("src", /\/images\/background\d+\.jpg$/);
  await expect
    .poll(() => wallpaper.evaluate((img) => img.complete && img.naturalWidth), { timeout: 15_000 })
    .toBeGreaterThan(0);
});

test("打开盒子修改设置，刷新后持久化生效", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForHome(page);

  const footer = page.locator("#footer");
  await expect(footer).toHaveClass(/blur/);

  // 点击简介卡片打开盒子
  await page.locator(".description").click();
  const box = page.locator(".box");
  await expect(box).toBeVisible();

  // 盒子右上角图标在 hover 时才显示
  await box.hover();
  const boxSetting = box.locator(".setting");
  await expect(boxSetting).toBeVisible();
  await boxSetting.click();
  const panel = page.locator(".set");
  await expect(panel).toBeVisible();

  // 展开“个性化调整”折叠面板
  await panel
    .locator(".el-collapse-item__header", { hasText: "个性化调整" })
    .click();

  // 关闭“底栏背景模糊”
  const footerBlurItem = panel.locator(".item", { hasText: "底栏背景模糊" });
  await footerBlurItem.locator(".el-switch").click();
  await expect(footer).not.toHaveClass(/blur/);

  // 写入新版本 key（home:state:v1）
  const readPersisted = () =>
    page.evaluate(() => {
      const raw = localStorage.getItem("home:state:v1");
      return raw ? JSON.parse(raw) : null;
    });
  await expect.poll(async () => (await readPersisted())?.footerBlur).toBe(false);

  // 刷新后仍然生效
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForHome(page);
  await expect(page.locator("#footer")).not.toHaveClass(/blur/);
  await expect.poll(async () => (await readPersisted())?.footerBlur).toBe(false);
});

test("旧 data 持久化数据迁移到 home:state:v1", async ({ page }) => {
  // 模拟旧版本写入的数据（key: data）
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "data",
      JSON.stringify({ footerBlur: false, musicVolume: 0.4, playerLoop: "one" }),
    );
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForHome(page);

  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("home:state:v1")), { timeout: 10_000 })
    .not.toBeNull();

  const migrated = await page.evaluate(() => JSON.parse(localStorage.getItem("home:state:v1")));
  expect(migrated.footerBlur).toBe(false);
  expect(migrated.musicVolume).toBeCloseTo(0.4);
  expect(migrated.playerLoop).toBe("one");

  // 旧 key 已清理，且迁移后的设置已生效（底栏无模糊）
  expect(await page.evaluate(() => localStorage.getItem("data"))).toBeNull();
  await expect(page.locator("#footer")).not.toHaveClass(/blur/);
});

test("PWA 注册成功，断网后仍可打开首页", async ({ page, context }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForHome(page);

  // 等待 Service Worker 激活并接管当前页面
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    return true;
  });
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 20_000 })
    .toBe(true);

  // 在线刷新一次，让页面导航响应写入缓存
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForHome(page);

  // 断网后刷新：应命中预缓存 / NetworkFirst 回退，页面仍可打开
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#main")).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("#loader-wrapper")).toHaveClass(/loaded/);
  await expect(page.locator("#footer")).toBeVisible();
  await context.setOffline(false);
});

test("键盘可操作：Enter 打开盒子/设置，Esc 逐层关闭", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForHome(page);

  // 交互元素是原生 button，可聚焦并用 Enter 激活
  const description = page.getByRole("button", { name: "查看更多信息" });
  await description.focus();
  await expect(description).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".box")).toBeVisible();

  const openSettings = page.getByRole("button", { name: "打开全局设置" });
  await openSettings.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".set")).toBeVisible();

  // 展开“个性化调整”后，设置项有可读名称（el-switch 的 label 映射为 aria-label）
  await page
    .locator(".set .el-collapse-item__header", { hasText: "个性化调整" })
    .click();
  await expect(page.getByRole("switch", { name: "建站日期显示" })).toHaveCount(1);

  // Esc 按层级关闭
  await page.keyboard.press("Escape");
  await expect(page.locator(".set")).toBeHidden();
  await expect(page.locator(".box")).toBeHidden();
});

test("prefers-reduced-motion 下页面仍正常渲染", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForHome(page);

  await expect(page.locator("#main")).toBeVisible();
  await expect(page.locator(".description")).toBeVisible();
  await expect(page.locator("#footer")).toBeVisible();
});
