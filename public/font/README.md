## Logo / 数字字体

`Pacifico-Regular.ttf` 与 `UnidreamLED.ttf` 是按需生成的**子集字体**，请勿手工替换：

- 源字体在 `scripts/fonts/source/`，不参与构建；
- 修改字符集或更换字体后执行 `pnpm fonts:subset` 重新生成；
- 子集结果随站点分发并被 PWA 预缓存。

如需完整版 Pacifico（上游提供，约 315 KB），可将
`scripts/fonts/source/Pacifico-Regular-all.ttf` 复制为 `public/font/Pacifico-Regular.ttf`
后本地构建。该文件默认不随站点分发，以免所有访客下载 315 KB 无效字体。
