/**
 * 打包阿里云 ESA「函数和 Pages」本地上传所需的静态压缩包。
 *
 * 用法：pnpm build && pnpm package:pages
 * 输出：release/home-dist-v<version>.zip（条目直接位于根目录，上传后即可访问 index.html）
 *
 * 说明：排除 *.gz —— 页面不会请求这些预压缩文件，ESA/CDN 会自动压缩传输。
 */
import AdmZip from "adm-zip";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(ROOT, "dist");
const RELEASE = join(ROOT, "release");

if (!existsSync(join(DIST, "index.html"))) {
  console.error("[package:pages] 未找到 dist/index.html，请先运行 pnpm build");
  process.exitCode = 1;
} else {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  mkdirSync(RELEASE, { recursive: true });

  const zip = new AdmZip();
  zip.addLocalFolder(DIST);

  const gzEntries = zip
    .getEntries()
    .filter((entry) => entry.entryName.endsWith(".gz"))
    .map((entry) => entry.entryName);
  for (const name of gzEntries) zip.deleteFile(name);

  const output = join(RELEASE, `home-dist-v${pkg.version}.zip`);
  zip.writeZip(output);

  console.log(`[package:pages] 已生成 ${relative(ROOT, output)}`);
  console.log(
    `[package:pages] 共 ${zip.getEntries().length} 个文件，已排除 ${gzEntries.length} 个 .gz（CDN 自动压缩）`,
  );
}
