---
title: Charles使用指南
date: 2019-08-11 19:16:34
tags: []
categories: 
- 软件使用手册
---

{% img /images/软件使用手册/charles/icon.png 300 300 %}

本文基于 [Charles 4.2.8](https://www.charlesproxy.com/download/)

[Charles](https://www.charlesproxy.com/)是一个HTTP代理服务器,HTTP监视器,反向代理服务器，当浏览器连接Charles的代理访问互联网时，Charles可以监控浏览器发送和接收的所有数据。它允许一个开发者查看所有连接互联网的HTTP通信，这些包括request, response和HTTP headers （包含cookies与caching信息）。即”抓包“软件。

<!--more-->

支持SSL代理。可以截取分析SSL的请求。
支持流量控制。可以模拟慢速网络以及等待时间（latency）较长的请求。
支持AJAX调试。可以自动将json或xml数据格式化，方便查看。
支持AMF调试。可以将Flash Remoting 或 Flex Remoting信息格式化，方便查看。
支持重发网络请求，方便后端调试。
支持修改网络请求参数。
支持网络请求的截获并动态修改。
检查HTML，CSS和RSS内容是否符合W3C标准。

注意：该软件在特殊情况下会出现劫持浏览器导致无法浏览网页的问题(请谨慎使用)。