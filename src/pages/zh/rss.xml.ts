import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts', ({ data }) => data.lang === 'zh' && !data.draft);
  const sorted = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Vibe Coding Diary',
    description: '西湖柳岸，代码随风生长。记录一段在湖边 vibe coding 的旅程。',
    site: context.site ?? 'https://vibe-coding-diary.com',
    items: sorted.map(post => {
      const slugParts = post.id.split('/').slice(1).join('/').replace(/\.(md|mdx)$/, '');
      return {
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.summary,
        link: `/zh/posts/${slugParts}/`,
      };
    }),
  });
}
