/**
 * 模块用途：
 *   博客文章纯业务逻辑模块：负责草稿过滤、按发布日期倒序排序、分类聚合统计、
 *   按分类筛选以及文章详情页“上一篇 / 下一篇”导航计算。
 *   通过泛型接口接收文章集合，完全解耦 Astro `getCollection` 数据源。
 *
 * 使用方法：
 *   import { sortPostsByDate, extractCategories, getAdjacentPosts } from '../utils/blogService';
 *   const sorted = sortPostsByDate(await getCollection('blog'));
 *   const categories = extractCategories(sorted);
 *   const { prev, next } = getAdjacentPosts(sorted, currentPost.id);
 */

export interface BlogPostLike {
	id: string;
	body?: string;
	data: {
		title: string;
		description: string;
		pubDate: Date;
		updatedDate?: Date;
		category?: string;
		tags?: string[];
		draft?: boolean;
	};
}

export interface CategorySummary {
	/** 分类名称 */
	name: string;
	/** 该分类下的文章数量 */
	count: number;
}

export interface AdjacentPosts<T extends BlogPostLike> {
	/** 时间线上更新的一篇（前一篇） */
	prev: T | null;
	/** 时间线上更早的一篇（后一篇） */
	next: T | null;
}

/** 获取文章分类（缺省回退为“随笔/创作”） */
export function resolveCategory(post: BlogPostLike): string {
	return post.data.category?.trim() || '随笔/创作';
}

/** 将分类名转换为安全的单段 URL slug（避免包含斜杠导致静态路由异常） */
export function toCategorySlug(category: string): string {
	return category.trim().replace(/[\\/]+/g, '-').replace(/\s+/g, '-');
}

/** 过滤草稿并按发布日期从新到旧排序（返回新数组，不修改入参） */
export function sortPostsByDate<T extends BlogPostLike>(
	posts: readonly T[],
	includeDrafts = false,
): T[] {
	return posts
		.filter((post) => includeDrafts || !post.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** 统计全部文章的分类列表及其文章数（按文章数量降序、名称升序排列） */
export function extractCategories<T extends BlogPostLike>(posts: readonly T[]): CategorySummary[] {
	const counter = new Map<string, number>();

	for (const post of posts) {
		const category = resolveCategory(post);
		counter.set(category, (counter.get(category) ?? 0) + 1);
	}

	return Array.from(counter.entries())
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

/** 按指定分类筛选文章列表 */
export function filterPostsByCategory<T extends BlogPostLike>(
	posts: readonly T[],
	category: string,
): T[] {
	return posts.filter((post) => resolveCategory(post) === category);
}

/** 在已倒序排列的文章数组中计算当前文章的上一篇（更新）与下一篇（更早） */
export function getAdjacentPosts<T extends BlogPostLike>(
	sortedPosts: readonly T[],
	currentId: string,
): AdjacentPosts<T> {
	const index = sortedPosts.findIndex((post) => post.id === currentId);
	if (index === -1) {
		return { prev: null, next: null };
	}

	return {
		prev: index > 0 ? sortedPosts[index - 1] : null,
		next: index < sortedPosts.length - 1 ? sortedPosts[index + 1] : null,
	};
}
