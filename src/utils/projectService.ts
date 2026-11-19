/**
 * 模块用途：
 *   作品集纯业务逻辑模块：负责作品排序、首页精选筛选与按作品类型分组。
 *   所有作品数据与分组元信息均通过参数注入，不直接耦合数据存储层或 UI 层。
 *
 * 使用方法：
 *   import { getFeaturedProjects, groupProjectsByType } from '../utils/projectService';
 *   const featured = getFeaturedProjects(projects, 4);
 *   const groups = groupProjectsByType(projects);
 */

export type ProjectType = 'game-web' | 'system-tool' | 'experiment';

export interface ProjectEntryLike {
	id: string;
	data: {
		title: string;
		summary: string;
		type: ProjectType;
		status: 'active' | 'wip' | 'archived';
		stack: string[];
		featured: boolean;
		order: number;
		date: Date;
		demoUrl?: string;
		repoUrl?: string;
		notes?: string;
	};
}

export interface ProjectTypeMeta {
	type: ProjectType;
	title: string;
	windowPath: string;
	description: string;
}

export interface ProjectGroup<T extends ProjectEntryLike> {
	meta: ProjectTypeMeta;
	items: T[];
}

export const DEFAULT_PROJECT_TYPE_META: readonly ProjectTypeMeta[] = [
	{
		type: 'game-web',
		title: '可玩 Demo / 网页应用',
		windowPath: '~/projects/games-and-web.dir',
		description: '基于 Vue 3、TypeScript 与现代前端栈构建的交互玩法原型与网页应用。',
	},
	{
		type: 'system-tool',
		title: '系统与工具折腾',
		windowPath: '~/projects/system-tools.dir',
		description: 'Linux 桌面环境定制、后端服务实践与提升日常开发效率的工具链路。',
	},
	{
		type: 'experiment',
		title: '实验性小玩意',
		windowPath: '~/projects/experiments.dir',
		description: '奇思妙想、脚本实验与阶段性技术探索记录。',
	},
];

/** 按自定义权重（升序）与日期（降序）排序作品列表 */
export function sortProjects<T extends ProjectEntryLike>(projects: readonly T[]): T[] {
	return [...projects].sort((a, b) => {
		if (a.data.order !== b.data.order) {
			return a.data.order - b.data.order;
		}
		return b.data.date.valueOf() - a.data.date.valueOf();
	});
}

/** 筛选首页“精选作品区”条目，支持限制最大展示数量 */
export function getFeaturedProjects<T extends ProjectEntryLike>(
	projects: readonly T[],
	limit = 4,
): T[] {
	return sortProjects(projects)
		.filter((project) => project.data.featured)
		.slice(0, limit);
}

/** 按预设类型顺序对作品集进行分组（过滤空分组） */
export function groupProjectsByType<T extends ProjectEntryLike>(
	projects: readonly T[],
	typeMetaList: readonly ProjectTypeMeta[] = DEFAULT_PROJECT_TYPE_META,
): ProjectGroup<T>[] {
	const sorted = sortProjects(projects);

	return typeMetaList
		.map((meta) => ({
			meta,
			items: sorted.filter((project) => project.data.type === meta.type),
		}))
		.filter((group) => group.items.length > 0);
}
