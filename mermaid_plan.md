# Mermaid 构建时渲染 — 实现计划

## 目标

用自写 remark 插件 + `mermaid-isomorphic` 在构建阶段将 ` ```mermaid ` 代码块转为内联 SVG，无需客户端 JS。

## 为什么不用 remark-mermaidjs

`remark-mermaidjs` 只有 85 stars，社区关注度低。底层渲染能力来自 `mermaid-isomorphic`（mermaid 官方生态包），我们直接使用它，配合一个极简的自写 remark 插件即可。

## 架构

```
Markdown AST (remark 阶段)
  ↓
自写 remark 插件：拦截 lang=mermaid 的 code block
  ↓ 调用
mermaid-isomorphic：启动 playwright 渲染为 SVG
  ↓ 替换
将 code 节点替换为 HTML 节点（内联 SVG）
  ↓
Shiki 语法高亮（只处理非 mermaid 的 code block）
  ↓
输出最终 HTML
```

## 步骤

### 1. 安装依赖

```bash
npm install mermaid-isomorphic
```

项目已有 `@playwright/test`（会带入 `playwright`），但需确认 Chromium 浏览器已下载：

```bash
npx playwright install chromium
```

### 2. 编写自定义 remark 插件

创建 `src/plugins/remark-mermaid.mjs`，约 35 行：

- 遍历 mdast 树，找到 `type === 'code'` 且 `lang === 'mermaid'` 的节点
- 用 `mermaid-isomorphic` 的 `createMermaidRenderer()` 渲染为 SVG
- 将节点替换为 `{ type: 'paragraph', children: [{ type: 'html' }] }` 结构（兼容 MDX）
- renderer 实例在插件生命周期内复用，避免重复启动浏览器
- `mermaidConfig` 在 `renderer()` 调用时传入（`createMermaidRenderer` 时传不生效）
- 设置 `htmlLabels: false`，使用 SVG `<text>` 元素替代 `foreignObject` + HTML，避免服务端渲染时因字体差异导致文字被截断

### 3. 配置 astro.config.mjs

```js
import remarkMermaid from './src/plugins/remark-mermaid.mjs';

export default defineConfig({
  markdown: {
    shikiConfig: { theme: 'css-variables' },
    remarkPlugins: [remarkMermaid],
  },
  // ...
});
```

### 4. 更新 CI/CD（deploy.yml）

在 `npm install` 之后、`npm run build` 之前，添加 Playwright Chromium 的缓存与安装：

```yaml
- name: Cache Playwright browsers
  id: playwright-cache
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

- name: Install Playwright Chromium
  if: steps.playwright-cache.outputs.cache-hit != 'true'
  run: npx playwright install chromium
```

- `~/.cache/ms-playwright` 是 Linux 上 Playwright 浏览器的默认安装路径
- 用 `package-lock.json` 的 hash 作缓存键，依赖版本变化时自动重装
- 缓存命中时跳过安装，省掉约 150MB 的下载

### 5. 适配深色模式

在 `global.css` 中添加 CSS filter 反色规则：

```css
[data-theme="dark"] .article-content svg {
  filter: invert(1) hue-rotate(180deg);
}
```

构建时生成的 SVG 是浅色主题，深色模式下通过 CSS 反色处理。如果后续对反色效果不满意，可升级为精确 CSS 覆盖方案。

## 影响范围

| 文件 | 变更 |
|------|------|
| `package.json` | 添加 `mermaid-isomorphic` |
| `src/plugins/remark-mermaid.mjs` | 新增，自写 remark 插件（约 30 行） |
| `astro.config.mjs` | 添加 `remarkPlugins: [remarkMermaid]` |
| `.github/workflows/deploy.yml` | 添加 Playwright Chromium 缓存与安装步骤 |
| `src/styles/global.css` | 添加深色模式 SVG 反色规则 |
| MDX 文件 | `flowchart LR` 改为 `flowchart TD` |


## 风险

- **构建速度**：每个 mermaid 块需启动无头 Chromium 渲染，构建时间会增加几秒
- **CI 缓存**：Chromium 约 150MB，已通过 `actions/cache` 缓存 `~/.cache/ms-playwright`
- **深色模式反色**：emoji 和彩色元素可能失真，后续可按需升级为精确 CSS 覆盖方案
- **自维护插件**：逻辑极简（约 35 行），但 `mermaid-isomorphic` API 变更时需同步更新
