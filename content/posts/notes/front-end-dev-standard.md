---
author: "Roc"
title: "前端开发容易忽视的体验细节"
date: "2025-04-13 13:58:29"
description: ""
tags: [
    "Notes",
]
weight: 11
type: post
showTableOfContents: true
---

## 说明

**记录一些觉得很多比较糙的开发会忽视的，不记录常识；没有刻意收集，想到就会更新。**

## 页面loading

在root中加入一个loading，比如

```html
<div id="root">
  <!-- 可以写更多的效果和css -->
  Loading
</div>
```

再搭配`script`的`defer`，html加载完毕就会立马显示一个`loading`效果。

巧妙的是像React和Vue这种框架，在js执行完毕之后都会替换根节点的内容，所以loading消失后会立马显示真正的内容。

在用户网速慢 / js很大 / js报错 的情况下效果很好，不会一直白屏，在开发嵌入式设备MPA的时候效果很好。

## 放大点击区域

在移动端，点击区域往往要写的比实际看到的大，不然点击会不灵敏。比如一个返回按钮，看着只有`20*20` 大小，但是点击区域要写成`40*40`。

```css
.btn {
  width: 20px;
  height: 20px;
  padding: 20px;
}
```

## 不要全局loading

不是万不得已永远不要用全局loading，特别是uniapp程序这种，他的自带loading都是阻塞式的。不要让一个接口的loading阻塞整个页面，导致其他区域也不可用。

非常推荐像twitter这种，一进来恨不得78个loading，写起来麻烦，但是体验最好。哪个区域加载成功就使用那个区域，互相不影响。

## 一个区域不要一上来就显示一个暂无数据

看到过很多开发写的页面，一进来就显示一个暂无数据，然后突然就跳出来数据，非常抽象。

因为他们只判断了数据是否为空，没有判断loading是否结束。暂无数据的显示一定要和loading结合。

```tsx
const [isLoading, setIsLoading] = useState(true);
const [data, setData] = useState([]);

const isEmpty = useMemo(() => data.length === 0 && !isLoading, [data, isLoading]);

return (
  <div>
    {isLoading && <div>Loading</div>}
    {isEmpty && <div>No Data</div>}
  </div>
)
```
