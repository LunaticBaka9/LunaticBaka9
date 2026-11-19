/**
 * 模块用途：
 *   全站静态配置数据模块，集中存放站点标题、描述、顶部终端导航项、个人名片信息与社交外链。
 *   页面与组件通过显式导入或 Props 注入方式消费这些常量，避免信息散落与硬编码重复。
 *
 * 使用方法：
 *   import { SITE_TITLE, NAV_ITEMS, PROFILE, SOCIAL_LINKS } from '../consts';
 */

import type { IconName } from "./components/icons/icons";

export interface NavItem {
    /** 终端路径风格的导航展示文案 */
    label: string;
    /** 站内逻辑路径（不含 base 前缀） */
    href: string;
}

export interface SocialLink {
    name: string;
    icon: IconName;
    href: string;
    ariaLabel: string;
}

export interface ProfileConfig {
    handle: string;
    tagline: string;
    status: string;
    focusAreas: readonly string[];
    stack: readonly string[];
}

export const SITE_TITLE = "LunaticBaka9";
export const SITE_DESCRIPTION =
    "LunaticBaka9 的极客复古作品集与技术博客 —— 记录网页小游戏机制、Linux 桌面折腾与系统开发实践。";

export const NAV_ITEMS: readonly NavItem[] = [
    { label: "~/home", href: "/" },
    { label: "~/projects", href: "/projects" },
    { label: "~/blog", href: "/blog" },
    { label: "~/timeline", href: "/timeline" },
];

export const SOCIAL_LINKS: readonly SocialLink[] = [
    {
        name: "Bilibili",
        icon: "bilibili",
        href: "https://space.bilibili.com/97139029",
        ariaLabel: "Follow Me on Bilibili",
    },
    {
        name: "Twitter",
        icon: "twitter",
        href: "https://twitter.com/Lunaticbaka9",
        ariaLabel: "Follow Me on Twitter",
    },
    {
        name: "GitHub",
        icon: "github",
        href: "https://github.com/LunaticBaka9",
        ariaLabel: "Go to LunaticBaka9's GitHub repo",
    },
];

export const PROFILE: ProfileConfig = {
    handle: "lunaticbaka9@workstation",
    tagline: "用 Vue 3 / TypeScript 搭建 Roguelike 交互原型，业余折腾 Linux 桌面与后端系统。",
    status: "COFFEE & DEBUG",
    focusAreas: [
        "游戏机制与交互原型：Vue 3 + TypeScript + Pinia 状态机与 Roguelike 数值实验",
        "系统与后端开发：Java (Spring Boot)、C++ 与工程化工具链实践",
        "Linux 桌面环境定制：KDE Plasma 视觉、快捷键工作流与终端效率配置",
    ],
    stack: ["TypeScript", "Vue 3", "Pinia", "Astro", "Java", "Spring Boot", "C++", "Linux"],
};
