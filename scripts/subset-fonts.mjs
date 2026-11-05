/**
 * 字体子集化脚本。
 *
 * 原始字体放在 scripts/fonts/source/（不参与构建），
 * 生成结果写入 public/font/（随站点分发并被 PWA 预缓存）。
 *
 * 用法：pnpm fonts:subset
 *
 * 注意：
 * - Pacifico 用于 Logo（站点域名由 .env 决定）与版本号，因此保留全部 ASCII 可打印字符；
 * - UnidreamLED 只用于数字时钟与进度百分比，保留数字 + 常用符号即可；
 * - Pacifico-Regular-all.ttf 是上游提供的完整版备用字体，不再随站点分发（避免 315 KB 无效下载）。
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import subsetFont from "subset-font";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SOURCE_DIR = join(ROOT, "scripts/fonts/source");
const OUTPUT_DIR = join(ROOT, "public/font");

/** ASCII 0x20–0x7E：覆盖任意站点域名、版本号与常见标点 */
const ASCII_PRINTABLE = Array.from({ length: 95 }, (_, index) =>
  String.fromCharCode(0x20 + index),
).join("");

/** 时钟（HH:MM:SS）与进度百分比（如 45%）用到的字符 */
const CLOCK_SYMBOLS = "0123456789:.%-+/ ";

const FONTS = [
  {
    source: "Pacifico-Regular.ttf",
    output: "Pacifico-Regular.ttf",
    text: ASCII_PRINTABLE,
    usage: "Logo / 版本号（ASCII）",
  },
  {
    source: "UnidreamLED.ttf",
    output: "UnidreamLED.ttf",
    text: CLOCK_SYMBOLS,
    usage: "数字时钟 / 进度百分比",
  },
];

const formatSize = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const run = async () => {
  const results = [];

  for (const font of FONTS) {
    const sourceBuffer = await readFile(join(SOURCE_DIR, font.source));
    const subsetBuffer = await subsetFont(sourceBuffer, font.text, {
      targetFormat: "sfnt",
      preserveNameIds: [0, 1, 2, 3, 4, 5, 6, 16, 17],
    });
    await writeFile(join(OUTPUT_DIR, font.output), subsetBuffer);

    results.push({
      ...font,
      before: sourceBuffer.length,
      after: subsetBuffer.length,
      saved: sourceBuffer.length - subsetBuffer.length,
    });
    console.log(
      `[fonts] ${font.output}: ${formatSize(sourceBuffer.length)} → ${formatSize(subsetBuffer.length)}` +
        `（${font.usage}）`,
    );
  }

  const before = results.reduce((sum, item) => sum + item.before, 0);
  const after = results.reduce((sum, item) => sum + item.after, 0);
  console.log(
    `[fonts] 合计 ${formatSize(before)} → ${formatSize(after)}，节省 ${formatSize(before - after)}`,
  );
};

run().catch((error) => {
  console.error("[fonts] 子集化失败：", error);
  process.exitCode = 1;
});
