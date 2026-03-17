# 技术方案调研

## 核心技术约束（来自 PRD）

| 约束 | 含义 |
|------|------|
| 纯静态站点 | 需要 SSG（Static Site Generation） |
| Markdown 写作 + 交互式组件嵌入 | 需要 MDX 或等效方案 |
| 中英双语 | 需要 i18n 路由 + 界面文案切换 + 按语言筛选文章 |
| RSS 自动生成 | 构建时生成 feed |
| 暗色模式 | CSS 变量 + 持久化用户偏好 |
| Lighthouse ≥ 90 | 最小 JS、快速首屏 |

## 方案对比

### 方案一：Astro + MDX

**架构**：Astro 作为构建框架，内容用 MDX 编写，交互式组件按需使用 React/Svelte 岛屿（Islands）。

| 维度 | 评估 |
|------|------|
| MDX 支持 | 一等公民，`@astrojs/mdx` 官方集成 |
| 交互式组件 | Islands Architecture — 页面默认零 JS，只有标记了 `client:load` 的组件才发送 JS 到浏览器 |
| i18n | 官方支持 `i18n` 路由（`/zh/`、`/en/`），配合 Content Collections 按语言筛选 |
| RSS | `@astrojs/rss` 官方包，几行代码搞定 |
| 暗色模式 | 注入内联脚本读取 `localStorage`，配合 CSS 变量，无闪烁 |
| 性能 | 默认零 JS 输出，Lighthouse 轻松 90+ |
| 内容管理 | Content Collections 提供类型安全的 frontmatter schema 校验 |
| 学习成本 | 模板语法类似 JSX 但有差异，需要适应 |

**可行性验证要点**：
- Content Collections 可定义 `lang` 字段，构建时按语言过滤 ✅
- MDX 中可直接 import React/Svelte 组件，加 `client:load` 即可交互 ✅
- 静态输出，部署到任意静态托管 ✅

### 方案二：Next.js (App Router) + MDX

**架构**：Next.js 以 `output: 'export'` 模式做纯静态导出，用 `next-mdx-remote` 或 `@next/mdx` 处理 MDX。

| 维度 | 评估 |
|------|------|
| MDX 支持 | `next-mdx-remote` 成熟，但需要手动处理序列化 |
| 交互式组件 | React 组件直接嵌入，但所有组件默认都会打包到客户端 |
| i18n | App Router 支持 `[locale]` 动态路由，需自建 middleware 或用 `next-intl` |
| RSS | 无官方方案，需在构建脚本中手动生成 |
| 暗色模式 | `next-themes` 库，成熟方案 |
| 性能 | 静态导出后性能不错，但 React runtime (~40KB) 始终存在 |
| 内容管理 | 需要自建或用 `contentlayer`（已停止维护）/ `velite` 管理 Markdown |
| 学习成本 | React 生态主流，资料丰富 |

**可行性验证要点**：
- `output: 'export'` 可以纯静态，但部分动态功能（middleware、ISR）不可用 ✅
- `next-mdx-remote` 支持自定义组件映射 ✅
- i18n 在静态导出模式下需要额外处理，`next-intl` 有静态导出指南但配置较繁琐 ⚠️

### 方案三：Astro + 自定义 Markdown 组件（不用 MDX）

**架构**：与方案一类似，但文章用纯 Markdown 写作，交互式组件通过 Astro 自定义指令或特殊语法嵌入。

| 维度 | 评估 |
|------|------|
| 写作体验 | 纯 Markdown，门槛最低 |
| 交互式组件 | 通过自定义 remark 插件将特殊语法（如 `:::component-name`）转换为 Astro 组件 |
| 灵活性 | 不如 MDX 灵活，复杂交互场景受限 |

**结论**：如果交互组件需求简单且固定，这个方案更轻量。但 PRD 提到"可切换的架构对比图"等场景，MDX 的灵活性更合适。**不推荐作为主方案，但可作为降级选项。**

## 推荐比较

| | Astro + MDX（方案一） | Next.js + MDX（方案二） |
|---|---|---|
| **最适合** | 内容驱动的静态站点 | 需要后续扩展为动态应用的场景 |
| **JS 产物** | 默认 0 KB，按需加载 | ~40KB React runtime + 页面 JS |
| **i18n 复杂度** | 低（官方方案） | 中（需额外配置） |
| **RSS** | 官方一行搞定 | 需自建 |
| **MDX 体验** | 原生支持 | 需要 `next-mdx-remote` 胶水代码 |
| **生态成熟度** | 较新但专注内容站点 | 非常成熟，社区资源丰富 |
| **部署** | 任意静态托管 | 任意静态托管（export 模式） |

## 初步建议

**推荐方案一（Astro + MDX）**，理由：

1. **与需求高度匹配**：PRD 描述的是一个纯内容站点，Astro 的 Islands Architecture 天然适合"大部分静态 + 少量交互"的场景
2. **性能优势明显**：零 JS 默认输出，Lighthouse 90+ 几乎不需要额外优化
3. **i18n 和 RSS 开箱即用**：减少胶水代码
4. **Content Collections**：为 Markdown 管理提供类型安全保障，新增文章只需放文件

如果作者已有较深的 Next.js/React 经验且未来可能将博客扩展为更复杂的应用（如加入评论系统、用户登录等动态功能），方案二也是合理选择。

## 待确认

- [ ] 作者对 Astro / Next.js 的熟悉程度？
- [ ] 交互式组件的复杂程度预期？（简单图表 vs 复杂可操作演示）
- [ ] 部署目标平台？（Vercel / Cloudflare Pages / GitHub Pages）
- [ ] 是否有未来扩展为动态应用的计划？
