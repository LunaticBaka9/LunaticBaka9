/**
 * 模块用途：
 *   纯业务逻辑模块：估算中英文混合 Markdown/MDX 正文的字数与预计阅读时长。
 *   不依赖任何 DOM、文件系统或 Astro 运行时 API，所有参数均可注入。
 *
 * 使用方法：
 *   import { estimateReadingTime } from '../utils/readingTime';
 *   const stats = estimateReadingTime(post.body ?? '');
 *   // => { wordCount: 420, minutes: 2, label: '约 2 分钟' }
 */

export interface ReadingTimeOptions {
	/** 中文字符每分钟阅读速度，默认 320 字/分钟 */
	cjkCharsPerMinute?: number;
	/** 英文单词每分钟阅读速度，默认 200 词/分钟 */
	latinWordsPerMinute?: number;
}

export interface ReadingTimeResult {
	/** 估算总词/字数（中文字符数 + 英文词数） */
	wordCount: number;
	/** 向上取整的预计阅读分钟数（最少 1 分钟） */
	minutes: number;
	/** 便于直接展示的中文阅读时长文案 */
	label: string;
}

const DEFAULT_OPTIONS: Required<ReadingTimeOptions> = {
	cjkCharsPerMinute: 320,
	latinWordsPerMinute: 200,
};

/** 剥离 Markdown 常见语法标记，减少对字数统计的干扰 */
function stripMarkdownSyntax(raw: string): string {
	return raw
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`[^`]*`/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/<[^>]+>/g, ' ')
		.replace(/[#>*_~|-]/g, ' ');
}

/** 计算给定 Markdown 文本的字数与预计阅读时间 */
export function estimateReadingTime(
	markdown: string,
	options: ReadingTimeOptions = {},
): ReadingTimeResult {
	const { cjkCharsPerMinute, latinWordsPerMinute } = { ...DEFAULT_OPTIONS, ...options };
	const plainText = stripMarkdownSyntax(markdown ?? '');

	const cjkMatches = plainText.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) ?? [];
	const latinText = plainText.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, ' ');
	const latinWords = latinText.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? [];

	const cjkCount = cjkMatches.length;
	const latinCount = latinWords.length;
	const wordCount = cjkCount + latinCount;

	const rawMinutes = cjkCount / cjkCharsPerMinute + latinCount / latinWordsPerMinute;
	const minutes = Math.max(1, Math.ceil(rawMinutes));

	return {
		wordCount,
		minutes,
		label: `约 ${minutes} 分钟`,
	};
}
