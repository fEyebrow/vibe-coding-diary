import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts', ({ data }) => data.lang === 'en' && !data.draft);
  const sorted = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Vibe Coding Diary',
    description: 'By the willows of West Lake, code grows with the breeze. A journey of vibe coding along the lakeside.',
    site: context.site ?? 'https://vibe-coding-diary.com',
    items: sorted.map(post => {
      const slugParts = post.id.split('/').slice(1).join('/').replace(/\.(md|mdx)$/, '');
      return {
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.summary,
        link: `/en/posts/${slugParts}/`,
      };
    }),
  });
}
