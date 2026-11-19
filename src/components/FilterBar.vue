<!--
  模块用途：
    博客列表客户端交互筛选组件（Vue 3 SFC）。
    支持按分类标签一键切换与按标题/摘要/标签关键词实时检索，无需整页重载。
    严格遵守依赖注入：所有文章摘要数据、分类统计及跳转链接均由父级 `.astro` 页面通过 Props 传入。

  使用方法：
    <FilterBar
      client:load
      posts={serializedPosts}
      categories={categorySummaries}
      initialCategory="全部"
    />
-->
<script setup lang="ts">
import { computed, ref } from 'vue';

export interface FilterablePost {
	id: string;
	title: string;
	description: string;
	dateLabel: string;
	category: string;
	categoryHref: string;
	tags: string[];
	readingTimeLabel: string;
	href: string;
}

export interface FilterCategory {
	name: string;
	count: number;
}

const props = withDefaults(
	defineProps<{
		/** 由页面层注入的可筛选文章摘要数组 */
		posts: FilterablePost[];
		/** 由页面层注入的分类统计列表 */
		categories: FilterCategory[];
		/** 初始激活分类，默认为“全部” */
		initialCategory?: string;
	}>(),
	{
		initialCategory: '全部',
	},
);

const ALL_LABEL = '全部';
const activeCategory = ref<string>(props.initialCategory);
const keyword = ref<string>('');

const filteredPosts = computed(() => {
	const normalizedKeyword = keyword.value.trim().toLowerCase();

	return props.posts.filter((post) => {
		const categoryMatched =
			activeCategory.value === ALL_LABEL || post.category === activeCategory.value;
		if (!categoryMatched) return false;

		if (!normalizedKeyword) return true;

		const haystack = [post.title, post.description, post.category, ...post.tags]
			.join(' ')
			.toLowerCase();
		return haystack.includes(normalizedKeyword);
	});
});

function resetFilters() {
	activeCategory.value = ALL_LABEL;
	keyword.value = '';
}
</script>

<template>
	<div class="filter-bar">
		<div class="filter-controls">
			<div class="category-tabs" role="tablist" aria-label="文章分类筛选">
				<button
					type="button"
					role="tab"
					:aria-selected="activeCategory === ALL_LABEL"
					:class="['tab-btn', { 'tab-btn--active': activeCategory === ALL_LABEL }]"
					@click="activeCategory = ALL_LABEL"
				>
					<span>{{ ALL_LABEL }}</span>
					<span class="tab-count">{{ posts.length }}</span>
				</button>

				<button
					v-for="cat in categories"
					:key="cat.name"
					type="button"
					role="tab"
					:aria-selected="activeCategory === cat.name"
					:class="['tab-btn', { 'tab-btn--active': activeCategory === cat.name }]"
					@click="activeCategory = cat.name"
				>
					<span>{{ cat.name }}</span>
					<span class="tab-count">{{ cat.count }}</span>
				</button>
			</div>

			<div class="search-box">
				<span class="search-prompt" aria-hidden="true">grep&gt;</span>
				<input
					v-model="keyword"
					type="search"
					class="search-input"
					placeholder="按标题、摘要或标签过滤..."
					aria-label="关键词过滤文章"
				/>
			</div>
		</div>

		<div class="result-bar">
			<span>匹配结果：{{ filteredPosts.length }} / {{ posts.length }} 篇</span>
			<button
				v-if="activeCategory !== ALL_LABEL || keyword.trim()"
				type="button"
				class="reset-btn"
				@click="resetFilters"
			>
				[重置筛选]
			</button>
		</div>

		<ul v-if="filteredPosts.length > 0" class="post-list">
			<li v-for="post in filteredPosts" :key="post.id" class="post-card">
				<div class="post-meta">
					<time class="post-date">{{ post.dateLabel }}</time>
					<a class="retro-tag retro-tag--accent" :href="post.categoryHref">
						#{{ post.category }}
					</a>
					<span class="post-reading">{{ post.readingTimeLabel }}</span>
				</div>

				<h3 class="post-title">
					<a :href="post.href">{{ post.title }}</a>
				</h3>

				<p class="post-summary">{{ post.description }}</p>

				<div v-if="post.tags.length > 0" class="post-tags">
					<span v-for="tag in post.tags" :key="tag" class="retro-tag">{{ tag }}</span>
				</div>
			</li>
		</ul>

		<div v-else class="empty-state">
			<p class="empty-text">&gt; 未找到匹配的文章，试试切换分类或清空关键词。</p>
			<button type="button" class="retro-btn" @click="resetFilters">恢复全部文章</button>
		</div>
	</div>
</template>

<style scoped>
.filter-bar {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.filter-controls {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.category-tabs {
	display: flex;
	flex-wrap: wrap;
	gap: 0.45rem;
}

.tab-btn {
	display: inline-flex;
	align-items: center;
	gap: 0.4rem;
	padding: 0.32rem 0.68rem;
	font-family: var(--font-mono);
	font-size: 0.82rem;
	color: var(--retro-text);
	background: var(--retro-panel-alt);
	border: 1px solid var(--retro-border);
	border-radius: var(--retro-radius);
	cursor: pointer;
	transition:
		border-color 0.15s ease,
		color 0.15s ease,
		background-color 0.15s ease;
}

.tab-btn:hover {
	border-color: var(--retro-accent);
	color: var(--retro-heading);
}

.tab-btn--active {
	color: var(--retro-accent);
	border-color: var(--retro-accent);
	background: var(--retro-accent-soft);
	font-weight: 600;
}

.tab-count {
	font-size: 0.74rem;
	color: var(--retro-muted);
}

.search-box {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.4rem 0.7rem;
	background: var(--retro-bg);
	border: 1px solid var(--retro-border-strong);
	border-radius: var(--retro-radius);
}

.search-box:focus-within {
	border-color: var(--retro-accent);
}

.search-prompt {
	font-family: var(--font-mono);
	font-size: 0.82rem;
	color: var(--retro-signal);
	flex-shrink: 0;
}

.search-input {
	width: 100%;
	border: none;
	outline: none;
	background: transparent;
	color: var(--retro-heading);
	font-family: var(--font-mono);
	font-size: 0.88rem;
}

.result-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-family: var(--font-mono);
	font-size: 0.78rem;
	color: var(--retro-muted);
	padding-bottom: 0.4rem;
	border-bottom: 1px dashed var(--retro-border);
}

.reset-btn {
	border: none;
	background: transparent;
	padding: 0;
	font-family: var(--font-mono);
	font-size: 0.78rem;
	color: var(--retro-accent);
	cursor: pointer;
}

.reset-btn:hover {
	text-decoration: underline;
}

.post-list {
	display: flex;
	flex-direction: column;
	gap: 0.9rem;
	list-style: none;
	margin: 0;
	padding: 0;
}

.post-card {
	display: flex;
	flex-direction: column;
	gap: 0.45rem;
	padding: 0.95rem 1.05rem;
	background: var(--retro-panel-alt);
	border: 1px solid var(--retro-border);
	border-radius: var(--retro-radius);
	transition: border-color 0.15s ease;
}

.post-card:hover {
	border-color: var(--retro-accent);
}

.post-meta {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.55rem;
	font-family: var(--font-mono);
	font-size: 0.78rem;
	color: var(--retro-muted);
}

.post-title {
	margin: 0;
	font-size: 1.08rem;
}

.post-title a {
	color: var(--retro-heading);
	text-decoration: none;
}

.post-title a:hover {
	color: var(--retro-accent);
}

.post-summary {
	margin: 0;
	font-size: 0.93rem;
	line-height: 1.65;
	color: var(--retro-text);
}

.post-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.35rem;
	margin-top: 0.2rem;
}

.empty-state {
	padding: 1.5rem 1rem;
	text-align: center;
	border: 1px dashed var(--retro-border-strong);
	border-radius: var(--retro-radius);
}

.empty-text {
	margin: 0 0 0.85rem;
	font-family: var(--font-mono);
	font-size: 0.88rem;
	color: var(--retro-muted);
}
</style>
