# 实施计划：Vibe Coding Diary

## 技术栈

| 层面 | 选型 |
|------|------|
| 框架 | Astro 5.x |
| 内容格式 | MDX（Markdown + JSX） |
| 交互组件 | React 19 + TypeScript |
| 样式 | 原生 CSS（CSS 变量 + 自定义属性），不使用 Tailwind |
| i18n | Astro 内置 i18n 路由 |
| RSS | @astrojs/rss |
| 部署 | 静态输出，目标平台待定（Vercel / Cloudflare Pages / GitHub Pages） |
| E2E 测试 | Playwright |
| 类型检查 | `astro check` + `tsc` |

## 测试方案

### 工具职责

| 工具 | 职责 | 覆盖范围 |
|------|------|---------|
| **Playwright `[PW]`** | 功能验证、样式验证、交互验证、响应式验证 | 大部分验收项 |
| **`astro check` + `tsc` `[TC]`** | TypeScript 类型安全、Content Collections schema 校验 | 类型相关验收项 |

### Playwright 验证能力

Playwright 可通过 `page.evaluate(() => getComputedStyle(...))` 读取元素的实际 CSS 计算值，能精确验证：

- **色彩**：背景色、文字色、边框色是否与设计令牌一致
- **字号/字重/行高**：是否匹配设计稿规格
- **布局**：max-width、flex-direction、gap、margin 等
- **交互**：点击、hover 后的状态变化（颜色、transform 偏移）
- **响应式**：通过 `page.setViewportSize()` 模拟不同断点
- **持久化**：操作 localStorage 后刷新页面，验证状态保留

### 测试文件结构

```
e2e/
├── phase1-skeleton.spec.ts     # 阶段一：骨架 + 全局样式 + 暗色模式 + i18n 基础设施
├── phase2-article.spec.ts      # 阶段二：Content Collections + 文章详情页
├── phase3-homepage.spec.ts     # 阶段三：首页
├── phase4-archive.spec.ts      # 阶段四：文章列表页
├── phase5-i18n.spec.ts         # 阶段五：语言切换 UI + i18n 集成验证
├── phase6-rss.spec.ts          # 阶段六：RSS 订阅
└── phase7-seo.spec.ts          # 阶段七：SEO + 性能 + 部署
```

### 动效测试稳定性

Playwright 测试 hover 动画（如 `translateX(8px)`）在 CI 中容易因动画未完成而产生 Flaky Tests。解决方案：在 `playwright.config.ts` 或测试的 `beforeEach` 中强制注入 `prefers-reduced-motion: reduce`，让动画瞬间完成，确保样式断言稳定。

```ts
// playwright.config.ts
use: {
  contextOptions: {
    reducedMotion: 'reduce',
  },
},
```

### 运行方式

```bash
# 阶段 N 开发完成后，运行对应测试
npx playwright test e2e/phaseN-*.spec.ts

# 类型检查
npx astro check
```

## 设计规范（来自 design/variant/）

已有三个页面的 HTML 设计稿，实施时严格遵循。

### 设计令牌

```css
/* 色彩 */
--bg-color: #F4F2EC;          /* 亮色背景 — 温暖纸质感 */
--text-main: #2C2D2B;         /* 主文字 */
--text-sub: #7A8686;          /* 辅助文字 */
--accent-willow: #849372;     /* 柳绿 — 主强调色 */
--accent-gold: #DDA15E;       /* 金色 — 点缀色（薯条/鸟喙） */
--line-color: #2C2D2B;        /* 线条/SVG 描边 */

/* 暗色模式（通过 data-theme="dark" 触发） */
--bg-color: #1A1A18;
--text-main: #E2DFD8;
--text-sub: #8B9696;
--accent-willow: #A3B18A;
--accent-gold: #E6B95C;
--line-color: #E2DFD8;

/* 字体 */
--font-mono: 'JetBrains Mono', monospace;   /* 导航、元信息、代码 */
--font-serif: 'Noto Serif SC', 'Songti SC', serif; /* 正文 */

/* 布局 */
--layout-max-width: 720px;    /* 内容最大宽度 */

/* 动效 */
--trans-smooth: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
```

### 导航栏结构

- 左侧：站名 `VIBE CODING DIARY`（mono 字体，letter-spacing: 0.2em）
- 右侧：`Index` | `Archive` | 语言切换图标（地球） | 主题切换图标（月亮/太阳）
- 移动端（≤600px）：**不使用汉堡菜单**，改为 header 纵向堆叠，nav-links 保持水平排列，间距缩小

### 首页设计

- Hero 区域：SVG 插画（西湖边吃薯条的鸟，带呼吸动画）+ 标语文案
- "RECENT LOGS" 分区标题（mono 字体，居中，下方带柳绿色短线）
- 文章列表：**单列、居中对齐**，每项包含日期标签（如 `SYS.LOG / 2023.10.24`）、标题、摘要、`READ.` 链接
- 文章间距 5rem，移动端递减

### 文章列表页设计

- 标题 "Full Archive"（mono 字体），右侧带延伸至边缘的细线
- 文章卡片：**单列纵向排列**（非网格），每卡片含日期、标题、摘要
- hover 效果：标题向右偏移 8px + 变为柳绿色
- 移动端偏移减半为 4px

### 文章详情页设计

- 文章头部：日期（mono 字体）→ 标题（2.2rem, font-weight: 400）→ 柳绿色分割线（40px）
- 正文排版：font-size 1.05rem，line-height 1.85，text-align: justify
- 代码块：mono 字体，浅灰背景，1px 边框，暗色模式自动反转
- blockquote：左侧 2px 柳绿色边框 + 斜体
- 文章底部导航：上/下一篇链接 + "Back to Index" 链接
- 移动端正文改为 text-align: left

### 响应式断点

| 断点 | 说明 |
|------|------|
| ≤900px | 平板 — 缩小间距、插画尺寸、标题字号 |
| ≤600px | 手机 — header 纵向堆叠，正文左对齐，代码块全宽 |
| ≤380px | 小屏手机 — 进一步缩小字号和间距 |

### 无障碍

- `focus-visible` 样式：2px 柳绿色 outline
- 触控设备（`pointer: coarse`）：icon-btn 增大到 44×44px
- `prefers-reduced-motion: reduce`：禁用动画

## 项目结构

```
/
├── astro.config.mjs
├── tsconfig.json
├── public/
│   └── fonts/                    # 自托管字体（可选）
├── src/
│   ├── content/
│   │   ├── config.ts             # Content Collections schema 定义
│   │   └── posts/
│   │       ├── zh/               # 中文文章
│   │       │   └── my-first-post.mdx
│   │       └── en/               # 英文文章
│   │           └── my-first-post.mdx
│   ├── components/
│   │   ├── Header.astro          # 全局导航栏（站名 + Index/Archive + 语言/主题切换）
│   │   ├── Footer.astro          # 全局页脚（GitHub 图标链接，opacity: 0.3）
│   │   ├── PostItem.astro        # 首页文章项（居中，含日期标签 + 标题 + 摘要 + READ.）
│   │   ├── PostCard.astro        # 列表页文章卡片（含 hover 偏移效果）
│   │   ├── HeroSection.astro     # 首页 Hero（SVG 插画 + 标语）
│   │   ├── ThemeToggle.astro     # 暗色模式切换（月亮/太阳 SVG 图标）
│   │   ├── LanguageSwitch.astro  # 语言切换（地球 SVG 图标）
│   │   ├── ArticleNav.astro      # 文章底部导航（上/下一篇 + 返回列表）
│   │   └── interactive/          # React 交互组件（岛屿）
│   │       └── ArchitectureCompare.tsx
│   ├── layouts/
│   │   ├── BaseLayout.astro      # 基础布局（head + 字体加载 + Header + Footer + slot）
│   │   └── PostLayout.astro      # 文章详情页布局（文章头部 + 正文样式 + ArticleNav）
│   ├── pages/
│   │   ├── zh/
│   │   │   ├── index.astro       # 中文首页
│   │   │   ├── posts/
│   │   │   │   └── index.astro   # 中文文章列表
│   │   │   └── rss.xml.ts        # 中文 RSS
│   │   ├── en/
│   │   │   ├── index.astro       # 英文首页
│   │   │   ├── posts/
│   │   │   │   └── index.astro   # 英文文章列表
│   │   │   └── rss.xml.ts        # 英文 RSS
│   │   └── index.astro           # 根路径，重定向到默认语言
│   ├── i18n/
│   │   ├── ui.ts                 # 界面文案字典
│   │   └── utils.ts              # i18n 工具函数
│   └── styles/
│       └── global.css            # 全局样式（CSS 变量、重置、通用排版）
├── e2e/                          # Playwright 验收测试
│   ├── phase1-skeleton.spec.ts
│   ├── phase2-article.spec.ts
│   ├── phase3-homepage.spec.ts
│   ├── phase4-archive.spec.ts
│   ├── phase5-i18n.spec.ts
│   ├── phase6-rss.spec.ts
│   └── phase7-seo.spec.ts
├── playwright.config.ts
├── design/                       # 设计稿（HTML 原型，仅供参考）
│   └── variant/
│       ├── design-index.html
│       ├── design-article-list.html
│       └── design-article-detail.html
├── plan.md
├── prd.md
└── research_tech.md
```

## 实施阶段

### 阶段一：项目骨架 + 全局样式 + 布局 + i18n 基础设施 ✅ COMPLETED

**目标**：跑通最小链路，建立与设计稿一致的全局框架，并搭建 i18n 基础设施供后续阶段使用。

1. **初始化 Astro 项目**
   - `npm create astro@latest`
   - 安装集成：`@astrojs/mdx`、`@astrojs/react`、`@astrojs/rss`、`@astrojs/sitemap`
   - 配置 `tsconfig.json`（strict 模式）

2. **配置 Astro**
   ```js
   // astro.config.mjs
   export default defineConfig({
     output: 'static',
     i18n: {
       defaultLocale: 'zh',
       locales: ['zh', 'en'],
       routing: { prefixDefaultLocale: true },
     },
     markdown: {
       shikiConfig: {
         // 使用 css-variables 主题，以便通过 global.css 控制代码块配色
         theme: 'css-variables',
       },
     },
     integrations: [mdx(), react(), sitemap()],
   });
   ```

3. **全局样式**（`src/styles/global.css`）
   - 从设计稿提取完整的 CSS 变量体系（色彩、字体、布局、动效）
   - `[data-theme="dark"]` 暗色变量覆盖
   - CSS Reset（`* { box-sizing: border-box; margin: 0; padding: 0; }`）
   - 全局 body 样式（font-family、line-height: 1.85、font-weight: 300、letter-spacing: 0.03em）
   - `::selection` 样式（柳绿色背景）
   - 全局 `a` 标签样式
   - 无障碍样式（focus-visible、pointer: coarse、prefers-reduced-motion）

4. **字体加载**
   - Google Fonts：JetBrains Mono（300/400/500）+ Noto Serif SC（300/400/600）
   - `<link rel="preconnect">` 优化加载速度

5. **基础布局组件**
   - `BaseLayout.astro`：HTML head + 字体 + global.css + `<ViewTransitions />` (来自 `astro:transitions`) + Header + Footer + `<slot />`
   - `Header.astro`：从设计稿还原导航结构（站名 + nav-links + 图标按钮占位）
   - `Footer.astro`：GitHub SVG 图标链接
   - 布局容器：`.page-wrapper`（max-width: 720px, margin: 0 auto）

6. **暗色模式**（与骨架一同实现，因为是全局基础设施）
   - `<head>` 中内联脚本：读取 `localStorage` / 系统偏好，设置 `data-theme="dark"`
   - `ThemeToggle.astro`：月亮/太阳 SVG 切换，hover 旋转 15deg 效果
   - 切换时更新 `data-theme` 属性 + 写入 `localStorage`
   - **View Transitions 生命周期注意**：开启 `<ViewTransitions />` 后，页面跳转变为 DOM 平滑替换（类 SPA），传统的 `DOMContentLoaded` 或 `<script>` 顶层事件绑定在页面切换后会失效。**所有客户端 DOM 操作必须包裹在 `astro:page-load` 事件中**：
     ```js
     document.addEventListener('astro:page-load', () => {
       const themeToggle = document.getElementById('themeToggle');
       // 绑定点击事件...
     });
     ```
     此约束同样适用于 LanguageSwitch 及其他需要客户端交互的组件。

7. **i18n 基础设施**（与骨架一同实现，因为后续阶段的所有页面都依赖文案字典）
   - `src/i18n/ui.ts`：界面文案字典（中英文 key-value）
     ```ts
     export const ui = {
       zh: {
         'nav.index': 'Index',
         'nav.archive': 'Archive',
         'hero.tagline': '西湖柳岸，代码随风生长。...',
         'section.recentLogs': 'RECENT LOGS',
         'archive.title': 'Full Archive',
         'post.read': 'READ.',
         'post.previous': 'Previous',
         'post.next': 'Next',
         'post.backToIndex': 'Back to Index',
       },
       en: {
         'nav.index': 'Index',
         'nav.archive': 'Archive',
         'hero.tagline': 'By the willows of West Lake, code grows with the breeze. ...',
         'section.recentLogs': 'RECENT LOGS',
         'archive.title': 'Full Archive',
         'post.read': 'READ.',
         'post.previous': 'Previous',
         'post.next': 'Next',
         'post.backToIndex': 'Back to Index',
       },
     } as const;
     ```
   - `src/i18n/utils.ts`：工具函数
     - `getLocaleFromUrl(url)` — 从 URL 路径提取 `zh` / `en`
     - `t(key, lang)` — 返回对应文案
     - `getLocalizedPath(path, targetLang)` — 生成切换语言后的路径。**实现时必须用正则锚定路径开头**（`path.replace(/^\/(zh|en)\//, '/' + targetLang + '/')`），避免文章 slug 中包含 `zh`/`en` 时被误替换

**验收清单**：

- [ ] `[TC]` `npm run dev` 启动无报错，浏览器访问 `localhost:4321` 可看到页面
- [ ] `[PW]` 页面背景色为 `#F4F2EC`，正文字体为 Noto Serif SC
- [ ] `[PW]` Header 左侧显示 `VIBE CODING DIARY`（JetBrains Mono），右侧显示 Index / Archive 文字链接 + 语言/主题图标按钮
- [ ] `[PW]` Footer 显示 GitHub SVG 图标，opacity 0.3，hover 时 0.8
- [ ] `[PW]` 内容区域最大宽度 720px，水平居中
- [ ] `[PW]` 点击主题切换按钮：背景变为 `#1A1A18`，文字变为 `#E2DFD8`，图标从月亮变太阳
- [ ] `[PW]` 刷新页面后暗色模式选择被保留（localStorage 持久化）
- [ ] `[PW]` 首次访问时跟随系统偏好（系统暗色 → 页面暗色）
- [ ] `[PW]` 页面加载时无主题闪烁（亮 → 暗的跳变）
- [ ] `[PW]` 缩小浏览器窗口至 600px 以下：header 纵向堆叠，nav-links 保持水平
- [ ] `[PW]` 缩小至 380px 以下：导航链接字号进一步缩小
- [ ] `[PW]` Tab 键导航时，链接和按钮显示 2px 柳绿色 outline
- [ ] `[PW]` `::selection` 选中文字时背景为柳绿色（通过 `getComputedStyle` 读取 `::selection` 伪元素样式验证）
- [ ] `[TC]` `astro check` 对 `src/i18n/utils.ts` 通过，确认工具函数类型安全
- [ ] `[PW]` `t('nav.index', 'zh')` 返回 `'Index'`，`t('hero.tagline', 'en')` 返回英文标语（通过页面中使用文案的元素间接验证）
- [ ] `[PW]` 页面 `<head>` 中包含 `<meta name="view-transition">`（View Transitions 已启用）

> 验收通过后进入阶段二。

---

### 阶段二：Content Collections + 文章详情页 ✅ COMPLETED

**目标**：实现"写一篇 MDX → 自动生成页面"的核心写作流程，文章页面还原设计稿样式。

1. **定义 Content Collections Schema**
   ```ts
   // src/content/config.ts
   const posts = defineCollection({
     type: 'content',
     schema: z.object({
       title: z.string(),
       date: z.date(),
       summary: z.string(),
       lang: z.enum(['zh', 'en']),
       draft: z.boolean().optional().default(false),
       slug: z.string().optional(), // 覆盖默认文件名 slug，防止中文文件名导致 URL 乱码
     }),
   });
   ```
   > 拉取文章列表和生成 RSS 时，需过滤 `draft: true` 的文章。

2. **创建示例文章**
   - `src/content/posts/zh/hello-world.mdx` — 包含 p、h2、blockquote、code block 等元素以验证排版
   - `src/content/posts/en/hello-world.mdx` — 英文对照版
   - 嵌入一个简单的 React 计数器组件验证 MDX + Islands
   - **双语文件名约定**：中英文版本必须使用相同的文件名（slug），以确保语言切换时路径替换 `/zh/` ↔ `/en/` 即可精准跳转

3. **文章详情页**
   - 动态路由：`src/pages/[lang]/posts/[...slug].astro`
   - `PostLayout.astro` 还原设计稿样式：
     - `.article-header`：日期（mono, 0.8rem）→ 标题（2.2rem）→ 柳绿色分割线
     - `.article-content`：段落、h2、blockquote 样式
     - 代码块样式：Astro 使用 Shiki 输出 `<pre class="astro-code"><code>...</code></pre>`，已在 astro.config 中配置 `theme: 'css-variables'`，通过 `.article-content pre` 选择器在 CSS 中还原设计稿配色
     - 响应式：平板缩小标题、移动端正文左对齐、代码块全宽

4. **文章底部导航**
   - `ArticleNav.astro`：上一篇 / 下一篇 + "Back to Index" 链接
   - 上/下一篇需要查询同语言的相邻文章

5. **验证 MDX 交互组件**
   - `src/components/interactive/Counter.tsx`
   - 在示例文章中 `<Counter client:load />`
   - 确认只有该组件发送 JS 到浏览器

**验收清单**：

- [ ] `[TC]` 故意写错 frontmatter（如缺少 title），`astro check` 报类型错误
- [ ] `[PW]` 访问 `/zh/posts/hello-world`，页面正常渲染
- [ ] `[PW]` 文章头部：日期以 mono 字体 0.8rem 显示，标题 2.2rem font-weight 400，下方有 40px 柳绿色分割线
- [ ] `[PW]` 正文段落：font-size 1.05rem，line-height 1.85，text-align justify
- [ ] `[PW]` h2 标题：font-size 1.5rem，font-weight 600，上方 margin 3rem
- [ ] `[PW]` blockquote：左侧 2px 柳绿色边框，内容斜体，颜色为 `--text-sub`
- [ ] `[PW]` 代码块：JetBrains Mono 字体，浅灰背景（`rgba(0,0,0,0.03)`），1px 边框
- [ ] `[PW]` 暗色模式下代码块背景自动变为 `rgba(255,255,255,0.03)`
- [ ] `[PW]` 文章底部显示上一篇/下一篇链接 + "Back to Index" 链接
- [ ] `[PW]` 上一篇 hover 时标题向左偏移 4px 并变柳绿色，下一篇向右偏移
- [ ] `[PW]` MDX 中嵌入的 React 计数器组件可点击交互
- [ ] `[PW]` 缩小至 600px：正文改为 text-align left，代码块全宽（负 margin 延伸），标题缩至 1.6rem
- [ ] `[PW]` 缩小至 600px：上/下一篇导航变为纵向排列

> 验收通过后进入阶段三。

---

### 阶段三：首页 ✅ COMPLETED

**目标**：还原首页设计，包括 SVG 插画和文章预览。

1. **HeroSection.astro**
   - 从 `design-index.html` 提取完整的 SVG 插画代码（西湖边吃薯条的鸟）
   - 鸟身体呼吸动画（`@keyframes subtle-breath`）
   - 标语文案（中/英版本通过 i18n 切换）
   - 响应式：插画尺寸 180px → 150px → 130px

2. **RECENT LOGS 区域**
   - 分区标题：mono 字体居中，下方柳绿色短线（`::after` 伪元素）
   - `PostItem.astro`：居中对齐，日期标签格式 `SYS.LOG / 2023.10.24`
   - 查询最近 3 篇文章（按当前语言筛选，过滤 `draft: true`，按日期倒序）
   - hover 时 `READ.` 链接变柳绿色 + 底部边框显现

3. **首页路由**
   - `/zh/index.astro` 和 `/en/index.astro`
   - `/index.astro`：客户端探测语言并跳转（纯静态站点无法读取 `Accept-Language` 头部）
     ```html
     <script>
       const lang = navigator.language.startsWith('zh') ? '/zh/' : '/en/';
       window.location.replace(lang);
     </script>
     <meta http-equiv="refresh" content="0;url=/zh/" />
     ```

**验收清单**：

- [ ] `[PW]` 访问 `/zh/`，页面正常渲染
- [ ] `[PW]` Hero 区域：SVG 插画（西湖边吃薯条的鸟）居中显示，尺寸约 180×180px
- [ ] `[PW]` 标语文案完整显示，含 `vibe coding` 柳绿色斜体标记
- [ ] `[PW]` "RECENT LOGS" 标题：JetBrains Mono，居中，下方有 12px 柳绿色短线
- [ ] `[PW]` 最多显示 3 篇最近文章，按日期倒序
- [ ] `[PW]` 每篇文章项居中对齐，包含：日期标签（如 `SYS.LOG / 2023.10.24`）、标题、摘要（最多 2 行截断）、`READ.` 链接
- [ ] `[PW]` 文章间距约 5rem
- [ ] `[PW]` hover 文章项时 `READ.` 链接变柳绿色并出现底部边框
- [ ] `[PW]` 点击文章标题或 `READ.` 链接跳转到对应文章详情页
- [ ] `[PW]` 访问 `/` 根路径，自动重定向到 `/zh/` 或 `/en/`
- [ ] `[PW]` 缩小至 900px：插画缩至 150px，标语 max-width 90%
- [ ] `[PW]` 缩小至 600px：插画缩至 130px，文章间距缩至 3.5rem

> 验收通过后进入阶段四。

---

### 阶段四：文章列表页 ✅ COMPLETED

**目标**：还原 Archive 页面设计。

1. **列表页路由**
   - `/zh/posts/index.astro` 和 `/en/posts/index.astro`

2. **页面结构**
   - `.archive-title`："Full Archive"（mono 字体）+ 右侧延伸细线（`::after flex-grow`）
   - `.archive-list`：单列纵向排列（`display: grid; gap: 4rem;`）

3. **PostCard.astro**
   - 整个卡片是一个 `<a>` 标签
   - 日期（mono, 0.75rem）+ 标题（1.5rem）+ 摘要（0.95rem, text-align: justify）
   - hover 效果：标题 `translateX(8px)` + 变柳绿色
   - 响应式：移动端标题缩小、偏移减半、摘要全宽

**验收清单**：

- [ ] `[PW]` 访问 `/zh/posts/`，页面正常渲染
- [ ] `[PW]` 标题 "Full Archive" 以 JetBrains Mono 显示，右侧有延伸至边缘的细线（opacity 0.2）
- [ ] `[PW]` 所有文章单列纵向排列，间距约 4rem
- [ ] `[PW]` 每张卡片显示日期（mono, 0.75rem）、标题（1.5rem）、摘要（0.95rem, justify）
- [ ] `[PW]` 整个卡片可点击（`<a>` 标签包裹），点击跳转到文章详情页
- [ ] `[PW]` hover 卡片时：标题向右偏移 8px + 颜色变为柳绿色，过渡动画平滑
- [ ] `[PW]` 文章按日期倒序排列
- [ ] `[PW]` Header 中 "Archive" 链接为 active 状态（颜色为 `--text-main`）
- [ ] `[PW]` 缩小至 600px：标题缩至 1.2rem，hover 偏移减为 4px，摘要 max-width 100%

> 验收通过后进入阶段五。

---

### 阶段五：语言切换 UI + i18n 集成验证 ✅ COMPLETED

**目标**：语言切换按钮可用，验证所有页面的中英文切换完整工作。

> i18n 基础设施（字典 `ui.ts` + 工具函数 `utils.ts`）已在阶段一建立，阶段二到四的页面已使用 `t()` 输出文案。本阶段专注于语言切换交互和端到端验证。

1. **LanguageSwitch.astro**
   - 地球 SVG 图标按钮
   - 点击后跳转到对应语言的同一页面（将 URL 中 `/zh/` 替换为 `/en/`，反之亦然）
   - **语言状态以 URL 路径为唯一事实来源（Single Source of Truth），不使用 localStorage 存储语言偏好**，避免 URL 与缓存状态不一致
   - 当前为英文时图标高亮为柳绿色

2. **日期格式**
   - 设计稿中日期统一使用 `2023.10.24` 格式（不区分语言）

**验收清单**：

- [ ] `[PW]` 在首页 `/zh/` 点击语言切换按钮，跳转到 `/en/`，反之亦然
- [ ] `[PW]` 在文章详情页 `/zh/posts/hello-world` 点击语言切换，跳转到 `/en/posts/hello-world`
- [ ] `[PW]` 在文章列表页 `/zh/posts/` 点击语言切换，跳转到 `/en/posts/`
- [ ] `[PW]` 切换到英文后：首页标语显示英文版本
- [ ] `[PW]` 切换到英文后：首页仅显示 `lang: 'en'` 的文章，列表页同理
- [ ] `[PW]` 切换到英文后：文章底部导航 Previous / Next / Back to Index 文案正确
- [ ] `[PW]` 当前语言为英文时，语言切换图标高亮为柳绿色
- [ ] `[PW]` 当前语言为中文时，语言切换图标为默认灰色
- [ ] `[PW]` 日期格式在中英文下均为 `2023.10.24`（统一格式）

> 验收通过后进入阶段六。

---

### 阶段六：RSS 订阅 ✅ COMPLETED

**目标**：自动生成 RSS feed。

1. **RSS 端点**
   ```ts
   // src/pages/zh/rss.xml.ts
   import rss from '@astrojs/rss';
   import { getCollection } from 'astro:content';

   export async function GET(context) {
     const posts = await getCollection('posts',
       ({ data }) => data.lang === 'zh' && !data.draft
     );
     return rss({
       title: 'Vibe Coding Diary',
       description: '...',
       site: context.site,
       items: posts.map(post => ({ ... })),
     });
   }
   ```

2. **自动发现**
   - `BaseLayout.astro` 的 `<head>` 中根据当前路由语言注入对应的 RSS 地址（中文环境 → `/zh/rss.xml`，英文环境 → `/en/rss.xml`），保持语言上下文连贯

**验收清单**：

- [ ] `[PW]` 访问 `/zh/rss.xml`，响应状态 200 且 Content-Type 包含 XML
- [ ] `[PW]` `/zh/rss.xml` 响应体中包含中文文章标题，不包含英文文章标题
- [ ] `[PW]` `/en/rss.xml` 响应体中包含英文文章标题，不包含中文文章标题
- [ ] `[PW]` RSS 响应体中每篇 item 包含 `<title>`、`<pubDate>`、`<description>`、`<link>` 标签
- [ ] `[PW]` RSS 中 `<link>` 指向正确的文章 URL（如 `/zh/posts/hello-world/`）
- [ ] `[PW]` 中文页面 `<head>` 中 RSS link 指向 `/zh/rss.xml`，英文页面指向 `/en/rss.xml`

> 验收通过后进入阶段七。

---

### 阶段七：SEO + 性能优化 + 部署 ✅ COMPLETED

**目标**：满足非功能需求，部署上线。

1. **SEO**
   - `<title>` 和 `<meta description>`（根据页面动态设置）
   - Open Graph / Twitter Card meta 标签
   - **hreflang 标签**：告知搜索引擎双语页面的对应关系，避免被视为重复内容
     ```html
     <link rel="alternate" hreflang="zh" href="https://yourdomain.com/zh/..." />
     <link rel="alternate" hreflang="en" href="https://yourdomain.com/en/..." />
     <link rel="alternate" hreflang="x-default" href="https://yourdomain.com/zh/..." />
     ```
   - 语义化 HTML（`<article>`、`<nav>`、`<main>`、`<header>`、`<footer>`）
   - `sitemap.xml`（`@astrojs/sitemap`）

2. **性能检查**
   - Lighthouse ≥ 90
   - 确认无交互组件页面 JS 为 0
   - 字体加载优化（`display=swap`）

3. **部署**
   - 配置部署平台
   - CI/CD：推送到 main 自动构建

**验收清单**：

- [ ] `[PW]` 每个页面的 `<title>` 正确（首页："Vibe Coding Diary"，文章页："文章标题 | Vibe Coding Diary"）
- [ ] `[PW]` 每个页面有 `<meta name="description">` 且内容合理
- [ ] `[PW]` 文章页有 Open Graph meta 标签（og:title、og:description、og:type）
- [ ] `[PW]` HTML 语义化：`<main>`、`<article>`、`<nav>`、`<header>`、`<footer>` 标签使用正确
- [ ] `[PW]` 每个页面 `<head>` 中包含 `hreflang="zh"` 和 `hreflang="en"` 的 `<link rel="alternate">` 标签，以及 `hreflang="x-default"`
- [ ] `[TC]` `npm run build` 成功，无报错
- [ ] `[PW]` 访问 `/sitemap.xml`，响应状态 200 且包含所有页面 URL
- [ ] `[PW]` 所有页面链接可正常跳转，无 404

> 全部验收通过，项目上线完成。

## 阶段依赖关系

```
阶段一（骨架 + 全局样式 + 暗色模式 + i18n 基础设施）
  └→ 阶段二（Content Collections + 文章详情页）
       ├→ 阶段三（首页）
       ├→ 阶段四（文章列表页）
       └→ 阶段五（语言切换 UI + i18n 集成验证）
  └→ 阶段六（RSS）
              └→ 阶段七（SEO + 部署）
```

阶段一包含 i18n 基础设施（字典 + 工具函数），确保阶段二到四的页面可直接使用 `t()` 输出文案。阶段三到六之间互相独立，可并行或按任意顺序实施。阶段七在其他阶段基本完成后进行。
