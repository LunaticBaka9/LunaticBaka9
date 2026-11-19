/**
 * 模块用途：
 *   Astro 全局构建与集成配置，声明站点根地址、GitHub Pages 子路径及已启用集成（MDX、Sitemap、Vue 3）。
 *
 * 使用方法：
 *   Astro 在 `dev` / `build` / `preview` 时自动读取本配置；
 *   在 `.astro` 页面中可直接引入 `.vue` 组件并配合 `client:load` / `client:idle` 按需水合交互。
 */

// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://lunaticbaka9.github.io',
	base: '/LunaticBaka9',
	integrations: [mdx(), sitemap(), vue()],
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
