import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import remarkMermaid from './src/plugins/remark-mermaid.mjs';

export default defineConfig({
  site: 'https://vibe-coding-diary.com',
  output: 'static',
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: { prefixDefaultLocale: true },
  },
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
    },
    remarkPlugins: [remarkMermaid],
  },
  integrations: [mdx(), react(), sitemap()],
});
