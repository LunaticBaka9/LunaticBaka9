/**
 * 模块用途：
 *   生成全站 RSS 2.0 订阅源（/rss.xml），自动排除草稿并按发布日期倒序输出。
 *
 * 使用方法：
 *   由 Astro 静态构建为 `/rss.xml`（在 GitHub Pages 子路径下为 `/LunaticBaka9/rss.xml`）。
 */

import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { sortPostsByDate } from '../utils/blogService';
import { withBase } from '../utils/paths';

export async function GET(context) {
	const posts = sortPostsByDate(await getCollection('blog'));
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: new URL(withBase('/'), context.site),
		items: posts.map((post) => ({
			...post.data,
			link: withBase(`/blog/${post.id}/`),
		})),
	});
}
