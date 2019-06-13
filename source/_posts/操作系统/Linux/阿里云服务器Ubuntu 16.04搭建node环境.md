---
title: 阿里云服务器ubuntu 16.04搭建node环境
password: moonlit
date: 2018-09-20 10:48:13
categories: 
- 操作系统
- Linux
---

{% img /images/操作系统/linux/ubuntu16-04/banner.jpg 300 300 %}

<!--more-->

# Apt-get命令

```bash
apt-cache search package 搜索软件包

apt-cache show package  获取包的相关信息，如说明、大小、版本等

sudo apt-get install package 安装包

sudo apt-get install package --reinstall   重新安装包

sudo apt-get -f install   修复安装

sudo apt-get remove package 删除包

sudo apt-get remove package --purge 删除包，包括配置文件等

sudo apt-get update  更新源

sudo apt-get upgrade 更新已安装的包

sudo apt-get dist-upgrade 升级系统

apt-cache depends package 了解使用该包依赖那些包

apt-cache rdepends package 查看该包被哪些包依赖

sudo apt-get build-dep package 安装相关的编译环境

apt-get source package  下载该包的源代码

sudo apt-get clean && sudo apt-get autoclean 清理无用的包

sudo apt-get check 检查是否有损坏的依赖
```

----

# Node安装

## 安装默认版本

```bash
# node v4.2.6
sudo apt-get install nodejs

sudo apt install nodejs-legacy

# npm v3.5.2
sudo apt install npm
```

## npm镜像

```bash
sudo npm config set registry https://registry.npm.taobao.org

sudo npm config list
```

## 安装n

[n](https://www.npmjs.com/package/n)

```bash
npm install -g n
```

```bash
n stable
```

## 安装pm2

```bash
npm install -g pm2
```

----

# Git安装

```bash
sudo apt-get install git

sudo git --version
```

```bash
git config --global user.name xx

git config --global user.email xx

git config --list
```

----

# Nginx安装

## 安装依赖

```bash
sudo apt-get install gcc zlib1g-dev libpcre3 libpcre3-dev libssl-dev
```

## 下载nginx

```bash
wget https://nginx.org/download/nginx-1.13.4.tar.gz
```

## 解压并进入目录

```bash
tar -xvf nginx-1.13.4.tar.gz

cd nginx-1.13.4/
```

## 编译和安装

```bash
./configure

sudo make

sudo make install
```

## 查看nginx版本

```bash
# 进入nginx安装目录
cd /usr/local/nginx/

# 查看版本
sbin/nginx -v
```

## 默认配置启动

```bash
sudo /usr/local/nginx/sbin/nginx

# 查看是否启动成功  端口默认是80端口
# 如果返回html 里面有  Welcome to nginx! 则成功
curl 127.0.0.1
```

## 配置实例80端口入网方向安全组

端口范围：80/80
授权对象：0.0.0.0/0
优先级：100

----

# Mysql安装

## 安装

```bash
sudo apt-get install mysql-server

sudo apt install mysql-client

sudo apt install libmysqlclient-dev
```

检测是否安装成功

```bash
sudo netstat -tap | grep mysql
```

## 配置实例3306端口入网方向安全组

端口范围：3306/3306
授权对象：0.0.0.0/0
优先级：100

## 注释mysql host配置

```bash
# 注释掉 bind-address = 127.0.0.1
sudo vi /etc/mysql/mysql.conf.d/mysqld.cnf
```

## 打开远程连接权限

```bash
# 连接数据库，进入mysql库
update user set host='%' where user='root'

# 刷新
flush privileges
```

---

> 原文链接

本文首发于个人博客[☀️ moolit](https://moonlit.vip/)

> 发布平台

[✨ 简书](https://www.jianshu.com/p/07873287c1c1)