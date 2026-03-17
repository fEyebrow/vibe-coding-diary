import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

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
  },
  integrations: [mdx(), react(), sitemap()],
});
