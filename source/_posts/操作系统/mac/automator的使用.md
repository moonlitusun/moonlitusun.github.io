---
title: Automator软件的使用
password: moonlit
date: 2018-12-12 13:43:59
categories: 
- 操作系统
- Mac
---

{% img /images/操作系统/mac/automator/banner.png 300 300 %}

<!--more-->

# 创建一个服务

下面的例子是创建一个打开`Terminal`的服务：

1. 打开Automator

```bash
open /Applications/Automator.app/
```

2. 选择服务

{% img /images/操作系统/mac/automator/1.png %}

3. 写入script

{% img /images/操作系统/mac/automator/2.png %}

4. 保存

`command + S`将其保存名为`open Terminal`

自定义的服务地址为

```bash
/Users/[your name]/Library/Services/
```

5. 设置快捷键

System Preferences > Keyboard > Shortcuts > General

{% img /images/操作系统/mac/automator/3.png %}

设置快捷键为`command + option + T`

## 一些appleScript

增大音量（将现有音量增大2%）

```appleScript
set volume output volume (output volume of (get volume settings)) + 2 --100%
```

减小音量（将现有音量减小2%）

```appleScript
set volume output volume (output volume of (get volume settings)) - 2 --100%
```

静音

```appleScript
set volume with output muted
```

播放/暂停 iTunes

```appleScript
tell application "iTunes" to playpause
```

## 原文链接

本文首发于个人博客[moolit](https://moonlit.vip/)

## 其他平台
