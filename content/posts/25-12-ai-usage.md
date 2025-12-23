---
title: "2025.12 AI Coding Experience"
date: 2025-12-23T09:26:08+08:00
draft: false
description: ""
tags: [
    "AI",
]
weight: 1
type: post
showTableOfContents: true
---

## Editor

目前主力编辑器依然是 [Cursor](https://www.cursor.com/)，期间也试用过其他工具：

- [Trae](https://www.trae.ai/) 使用体验上和 Cursor 还有一些差距，不过作为国内的平替还是可以尝试的。
- [Antigravity](https://antigravity.google/) 如果Google账号地区限制了可以试试[Google Antigravity 卡在 Setting Up Your Account 无法登录的解决方案](https://loongphy.com/blog/google-antigravity-stuck-setting-up-your-account)，切到日本就可以，亲试可用。

作为 Cursor 的早期付费用户，虽然整体体验不错，但也有一些让人头疼的问题：

- 都 2025 年了，依然不支持设置同步，家里和公司的配置需要手动维护。
- 更新频繁且不够稳定，时常遇到一些小 bug，感觉在用 Insider 版本。
- 更新会覆盖用户配置，比如快捷键设置经常被重置，刚改完又被覆盖。
- 为了推广 Agent 模式，有时会强制切换用户的工作布局。
- Pro 用户额度已经不太够用，默认配置容易超出 $40，现在每月费用大概在三四十刀。而且默认推荐的模型都需要额外付费。

## CLI

CLI 工具用得不算特别多，主要还是更习惯编辑器的 Tab 自动补全功能，可以智能识别重复操作，很省心。

之前给 [neovate](https://neovateai.dev/en1) 贡献过一些代码，对这个领域有一定了解。

CLI 工具中，[Claude Code](https://claude.com/product/claude-code) 的表现最为出色。开发 neovate 期间也体验过 [aider](https://github.com/aider-ai/aider) 和 [Codex](https://openai.com/codex/)，整体都不错。

## Models

截止现在，我主要用的是`Claude Opus 4.5`，除了这个，我也推荐：

- `Google gemini 3`
- `GPT 5.1 codex`

一些不太复杂的我会用`Cursor`的`Compodser 1`，这个非常快，体验很好。

国内模型方面，比较推荐：

- `Qwen-3-Coder`
- `MiniMax-M2`
- `GLM-4.7`
- `Kimi-K2`

这几个是国产 Coder 模型中表现较好的，虽然和国际顶尖模型相比还有一定差距，但在某些场景下已经足够实用。
