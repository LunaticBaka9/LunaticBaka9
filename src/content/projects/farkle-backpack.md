---
title: 'Farkle 骰子与背包联动原型'
summary: '把经典 Farkle 掷骰风险决策与 Roguelike 背包格子联动揉在一起的交互式网页小游戏原型。'
type: 'game-web'
status: 'active'
stack: ['Vue 3', 'TypeScript', 'Pinia', 'Vite']
featured: true
order: 1
date: '2026-11-10'
repoUrl: 'https://github.com/LunaticBaka9'
notes: '核心计分规则与背包遗物触发管线拆分为纯函数状态机，UI 层只订阅派生状态，方便做单测与数值平衡调整。'
---

将 Farkle 掷骰计分与背包空间协同机制结合的实验原型，重点验证“单回合风险推演 + 遗物构筑反馈”的节奏手感。
