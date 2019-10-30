---
title: Mac系统上安装nginx
password: moonlit
date: 2018-11-29 18:01:48
tags: []
categories: 
- 操作系统
- Mac

---

{% img /images/操作系统/mac/install-nginx/nginx.png 300 300 %}

<!--more-->

## 安装Homebrew

我们选择使用[Homebrew](https://brew.sh/)这个非常方便的包管理器来安装

{% img /images/操作系统/mac/install-nginx/homebrew.png %}

如果没有安装的可以使用下面这条命令快速安装，已经安装的跳过这步既可

```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

---

## 安装Nginx

执行以下命令

```bash
brew install nginx
```

此时，我们已经安装完毕。。。。。

下面看下安装完毕怎么使用

## Homebrew nginx命令

- 启动nginx

  ```bash
  brew services start nginx
  ```

- 重启nginx

  ```bash
  brew services restart nginx
  ```

- 停止nginx

  ```bash
  brew services stop nginx
  ```

## Nginx文件目录

下面是`nginx`的一些文件默认安装目录

- nginx安装文件目录

  ```shell
  /usr/local/Cellar/nginx
  ```

- nginx配置文件目录

  ```shell
  /usr/local/etc/nginx
  ```

- config文件目录

  ```shell
  /usr/local/etc/nginx/nginx.conf
  ```

- 系统hosts位置

  ```shell
  /private/etc/hosts
  ```

---

> 原文链接

本文首发于个人博客[☀️ moolit](https://moonlit.vip/)

> 发布平台

[✨ 简书](https://www.jianshu.com/p/07873287c1c1)
