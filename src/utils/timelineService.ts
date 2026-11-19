/**
 * 模块用途：
 *   时间轴归档纯业务逻辑模块：将博客文章与作品里程碑统一映射为时间轴事件，
 *   并按“年-月（YYYY-MM）”倒序聚合，供 `/timeline` 页面渲染垂直折腾轨迹。
 *   严格通过参数注入数据源与路径构造器，避免与路由配置硬编码耦合。
 *
 * 使用方法：
 *   import { buildTimelineGroups } from '../utils/timelineService';
 *   const groups = buildTimelineGroups({ posts, projects, resolveUrl: withBase });
 */

import { resolveCategory, type BlogPostLike } from './blogService';
import type { ProjectEntryLike } from './projectService';

export type TimelineItemKind = 'post' | 'project';

export interface TimelineItem {
	id: string;
	kind: TimelineItemKind;
	title: string;
	summary: string;
	date: Date;
	badge: string;
	href: string;
	external: boolean;
}

export interface TimelineMonthGroup {
	/** 形如 2026-11 的年月分组标识 */
	monthKey: string;
	/** 展示用年月标签（如 2026 年 11 月） */
	monthLabel: string;
	/** 该月内按日期倒序排列的事件列表 */
	items: TimelineItem[];
}

export interface BuildTimelineInput {
	posts: readonly BlogPostLike[];
	projects: readonly ProjectEntryLike[];
	/** 内部路由前缀解析函数（例如 withBase），由调用方注入 */
	resolveUrl: (path: string) => string;
}

/** 将 Date 格式化为 YYYY-MM 键值 */
function toMonthKey(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	return `${year}-${month}`;
}

/** 将 Date 格式化为中文年月标题 */
function toMonthLabel(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	return `${year} 年 ${month} 月`;
}

/** 合并文章与作品里程碑并按年月倒序分组 */
export function buildTimelineGroups({
	posts,
	projects,
	resolveUrl,
}: BuildTimelineInput): TimelineMonthGroup[] {
	const postItems: TimelineItem[] = posts
		.filter((post) => !post.data.draft)
		.map((post) => ({
			id: `post-${post.id}`,
			kind: 'post',
			title: post.data.title,
			summary: post.data.description,
			date: post.data.pubDate,
			badge: resolveCategory(post),
			href: resolveUrl(`/blog/${post.id}/`),
			external: false,
		}));

	const projectItems: TimelineItem[] = projects.map((project) => ({
		id: `project-${project.id}`,
		kind: 'project',
		title: project.data.title,
		summary: project.data.summary,
		date: project.data.date,
		badge: '作品里程碑',
		href: project.data.demoUrl ?? project.data.repoUrl ?? resolveUrl('/projects'),
		external: Boolean(project.data.demoUrl || project.data.repoUrl),
	}));

	const allItems = [...postItems, ...projectItems].sort(
		(a, b) => b.date.valueOf() - a.date.valueOf(),
	);

	const grouped = new Map<string, TimelineMonthGroup>();

	for (const item of allItems) {
		const monthKey = toMonthKey(item.date);
		const existing = grouped.get(monthKey);
		if (existing) {
			existing.items.push(item);
		} else {
			grouped.set(monthKey, {
				monthKey,
				monthLabel: toMonthLabel(item.date),
				items: [item],
			});
		}
	}

	return Array.from(grouped.values());
}
