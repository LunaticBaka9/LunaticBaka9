/**
 * 模块用途：
 *   定义 Astro Content Collections 的数据契约（Zod Schema），集中管理博客文章（blog）
 *   与作品集条目（projects）的前置元数据校验与类型推导。
 *
 * 使用方法：
 *   1. 新增博客文章：在 `src/content/blog/` 下创建 `.md` / `.mdx`，填写 title、description、pubDate，
 *      可选补充 category、tags、updatedDate、heroImage、draft。
 *   2. 新增作品条目：在 `src/content/projects/` 下创建 `.md` / `.mdx`，填写 title、summary、type、date 等字段。
 *   3. 在页面或服务层通过 `getCollection('blog')` / `getCollection('projects')` 读取强类型数据。
 */

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** 博客文章集合：兼容原有字段，扩展分类、标签与草稿标记 */
const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			category: z.string().default('随笔/创作'),
			tags: z.array(z.string()).default([]),
			draft: z.boolean().default(false),
		}),
});

/** 作品集与实验归档集合：支撑首页精选卡片、作品集分类展示与时间轴里程碑 */
const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		type: z.enum(['game-web', 'system-tool', 'experiment']).default('experiment'),
		status: z.enum(['active', 'wip', 'archived']).default('active'),
		stack: z.array(z.string()).default([]),
		featured: z.boolean().default(false),
		order: z.number().default(100),
		date: z.coerce.date(),
		demoUrl: z.string().url().optional(),
		repoUrl: z.string().url().optional(),
		notes: z.string().optional(),
	}),
});

export const collections = { blog, projects };
