+++
author = "Roc"
title = "浏览器缓存机制"
date = "2021-05-14 12:07:00"
description = "Lorem Ipsum Dolor Si Amet"
tags = [
    "BOM",
]
+++

浏览器缓存，既是网页静态资源服务性能优化的一大利器，也是无数web开发者在工作之初谈之色变的一大难题。

在开发过程中我们极力避免缓存，但是在生产环境中，我们又在想尽办法利用缓存。所以了解浏览器缓存的机制，是一个优秀开发者绕不开的重要基础知识。

各种缓存的命中与否，说到底只不过是几个与之相关的HTTP header数据的匹配与校验。如果了解了每个相关header的意义与关系，那么就能将缓存策略运用自如。

下面就以Chromium浏览器下的表现来阐述，其他的浏览器可能有不一样的实现。

# 缓存的位置

从缓存的位置上来说分为四种，并且各自由优先级，当依次查找缓存且都没有命中的时候，才会去请求网络。

## Service Worker

## Memory Cache

`Memory Cache`是内存中的缓存，也称之为强缓存。主要包含的是当前页面中已经抓取到的资源、例如页面上已经下载的样式、脚本、图片等。读取内存中的数据肯定比磁盘快。

内存缓存虽然高效，但是缓存持续性很短，会随着进程的释放而释放。一旦我们关闭Tab，内存中的缓存也就被释放了。

当我们访问过页面之后，**再次刷新页面**，可以发现很多数据都来自于内存缓存：

<img
  src="https://moonlit-private.oss-cn-shenzhen.aliyuncs.com/browser-cache/memory-cache-1.png"
  alt=""
/>

并且可以看到size为0，说明没有和服务器交互，这是取缓存最快的一个方法。

下面几种情况，资源会被存在内存中：

- 使用了`preload`的资源
- 页面运行过程中前面已经加载过的资源，如重复加载的img，当然这种请求浏览器不会在network里面显示出来，它会直接读取缓存。

要注意的是：Memory Cache 是不会关注HTTP语义的。例如缓存到期时间的请求头`Cache-Control`。就算你设置了`Cache-Control: max-age=0`。仍然可以在同一个页面被重用。他只会遵守一个Header设置就是`Cache-Control: no-store`。这个代表永远不使用缓存。

## Disk Cache

Disk Cache也被称为HTTP Cache。它是被存在硬盘中的。读取速度比内存慢，但是容量大。什么都可以存进去。比Memory Cache就是胜在容量和存储时效上。

Disk Cache是持久化的。并且允许跨session甚至跨站点访问。比如说一个站点请求过一个资源，另外一个站点请求同样的资源，这时候就会走Disk Cache。

然后Disk Cache是遵循HTTP语义的，它总是储存最新的资源，验证需要被验证的资源，拒绝储存不该被它存储的资源。这些都可以使用资源的响应头来决定。

HTTP Cache有一个基于缓存的组件，用来匹配请求的资源是否命中它已有的缓存资源，如果有发现命中的资源，它需要从硬盘里获取这个资源，这是一个昂贵的操作。

## 缓存到底会存在哪里

那么浏览器到底怎么区分什么时候存到Memory Cache什么时候存到Disk Cache？

- 对于较大文件来说，基本是百分百存在Disk Cache中的
- 如果系统的内存使用率较高，也会直接存在Disk Cache中

# 缓存的种类

## 强缓存

强缓存包括Memory Cache和Disk Cache。不会向服务器发送请求，直接从缓存中取资源。在Chrome浏览器中可以通过查看控制台的Network面板查看，状态码为200。Size为`from disk cache`或`from memory cache`。强缓存可以通过设置两种HTTP Header实现：`Expires` 和 `Cache-Control`。

### Expires 和 Last-modified

Expires：缓存过期时间，用来指定资源到期的时间，但是是服务器端的具体到期时间。也就是说，`Expires=max-age + 请求时间`。需要和`last-modified`结合使用。`Expires`是web服务器响应消息头字段。在响应http请求的时候告诉浏览器在过期时间内浏览器可以直接从浏览器缓存读取数据，而无需再次请求。

`Expires`是HTTP 1.0的产物，受限于本地时间，如果修改了本地时间，可能会造成缓存失效。`Expires: wed, 22 Oct 2018 08:41:00 GMT`表示资源会在`wed, 22 Oct 2018 08:41:00 GMT`后过期，再次重新请求。

### Cache-Control

在HTTP 1.1中，`Cache-Control`是最重要的规则。主要用于控制网页缓存。比如当`Cache-Control: max-age=300`时，则代表在这个请求正确返回时间（浏览器也会记录下来）的5分钟内再次加载资源，就会命中强缓存。

`Cache-Control`可以设置在请求头或响应头上。并且可以组合多种指令，主要有下面几个值：

- `public`：**所有内容都将被缓存（客户端和代理服务器都可缓存）**。具体来说响应可被任何中间节点缓存，如`Browser <-- proxy1 <-- proxy2 <-- server`，中间的proxy可以缓存数据，比如下次再请求同一资源proxy1直接把自己缓存的东西给browser而不会再走向proxy2.

- `private`：**默认选项。所有内容只有客户端可以缓存**，具体来说，表说中间节点不允许缓存，对于`Browser <-- proxy1 <-- proxy2 <-- server`来说，proxy会老老实实把server返回的数据发送给proxy1，自己不缓存数据。当下次Browser再次请求时proxy会做好请求转发而不是自作主张的给自己缓存的数据。

- `no-cache`：客户端缓存内容，但是是否使用缓存则需要协商缓存来验证决定。表示不用`Cache-control`的缓存控制方式做前置验证，而是使用`Etag`或者`Last-Modified`字段来控制缓存。**需要注意的是`no-cache`这个名字起的有点误导，它并不是代表浏览器就不缓存数据了，只是浏览器在使用缓存数据的时候，需要先和服务器确认一下数据是否还一致。**

- `no-store`：所有内容都不会被缓存，即不使用强缓存也不是使用协商缓存。一般设置这个值是对一些很私密的文件才会用到。

- `max-age`：`max-age=xxx(xxx is numberic)`表示缓存内容会在xxx秒后消失，但是在xxx秒之内都可以直接使用强缓存的内容，不用和服务器交互。

- `s-maxage`：（单位为s），同`max-age`作用一样，只在代理服务器生效(比如CDN缓存)，举例当`s-max-age: 60`的时候，在这60秒钟，即使更新了CDN的内容，浏览器也不会请求。`max-age`用于普通缓存，而`s-max-age`则用于代理缓存。**`s-max-age`的优先级高于`max-age`**。如果存在`s-max-age`，则会覆盖掉`max-age`和`Expires Header`。

- `max-stale`：能容忍的最大过期时间。`max-stale`指令标示了客户端愿意接收一个已经过期了的响应。如果指定了`max-stale`的值，则最大容忍时间为对应的秒数。如果没有指定，那么说明浏览器愿意接收任何`age`的响应（`age`表示响应由源站生成或确认的时间与当前时间的差值）。

- `min-fresh`：能够容忍的最小新鲜度。`min-fresh`标示了客户端不愿意接受新鲜度不多于当前的`age`加上`min-fresh`设定的时间之和的响应。

我们可以把多个指令配合起来一起使用，达到多个目的。比如说我们希望资源能被缓存下来，并且是客户端和代理服务器都能缓存，还能设置缓存失效时间等。

### Expires和Cache-Control对比

作用相同，实现效果的方式不同。推荐使用`Cache-Control`。

`Expires`是HTTP 1.0的产物。`Cache-Control`是HTTP 1.1的产物。两者同时存在的话，`Cache-Control`的优先级要高于`Expires`。在某些不支持HTTP 1.1的环境下，`Expires`就会发挥用处。所以，`Expires`其实是过时的产物，现阶段它的存在只是一种兼容性的写法。

强缓存判断是否缓存的依据来自于是否超出某个时间或者某个时间段，而不关心服务器端文件是否已经更新，这可能会导致加载文件不是服务器端最新的内容，那如何知道服务器端内容是否已经发生了更新呢？此时我们就需要用到协商缓存了。

## 协商缓存

协商缓存就是强缓存失效后，浏览器携带缓存标识向服务器发起请求，由服务器根据缓存标识是否使用缓存的过程，主要有以下两种情况：

- 协商缓存生效，返回304和`Not Modified`

<img
  src="https://moonlit-private.oss-cn-shenzhen.aliyuncs.com/browser-cache/content-negotiation-304.webp"
  alt=""
/>

这种情况浏览器只会返回一个304，和一个空响应。

- 协商缓存失效，返回200和请求结果。

<img
  src="https://moonlit-private.oss-cn-shenzhen.aliyuncs.com/browser-cache/content-negotiation-200.webp"
  alt=""
/>

这种情况浏览器会返回新的结果。相当于重新请求。

协商缓存可以通过设置HTTP Header实现。`Last-Modified`和`ETag`。

### Last-Modified和If-Modified-Since

浏览器在第一次访问资源的时候，服务器返回资源的同时，在response header中添加`Last-Modified`的header，值是这个资源在服务器上的最后修改时间，浏览器接收后缓存文件和header；

```http
Last-Modified: Fri, 22 Jul 2021 01:47:00 GMT
```

浏览器下一次请求这个资源，浏览器检测到有`Last-Modified`这个Header，于是添加`If-Modified-Since`这个Header，值就是`Last-Modified`的值；服务器再次收到这个资源请求，会根据`If-Modified-Since`的值与服务器中这个资源的最后修改时间做对比，如果没有改变，返回304和空的响应体，直接从缓存中读取，如果`If-Modified-Since`的时间小于服务器中这个资源的最后修改时间，说明文件有更新，于是返回200和新的资源文件。

<img
  src="https://moonlit-private.oss-cn-shenzhen.aliyuncs.com/browser-cache/last-modified-process.webp"
  alt=""
/>

但是`Last-Modified`也存在一些弊端：

- 如果本地打开缓存文件，即使没有对文件进行修改，但是还是会造成`Last-Modified`被修改，服务器不能命中缓存导致发送相同的资源

- 因为`Last-Modified`只能以秒计时，如果在不可感知的时间内修改完文件，那么服务端会认为资源还是命中了，不会返回正确的资源。比如一秒内修改多次。

既然根据文件修改时间来决定缓存尚有不足，能否可以直接根据文件内容是否修改来决定缓存策略？所以在HTTP 1.1中出现了`ETag`和`If-None-Match`。

### ETag和If-None-Match

`ETag`是服务器响应请求时，返回当前资源文件的一个唯一标识（由服务器生成），只要资源有变化，`ETag`就会重新生成。浏览器在下一次加载资源向服务器发送请求时，会将上一次返回的`ETag`值放到request header中的`If-None-Match`中，服务器只需要比较客户端传来的`If-None-Match`跟自己服务器上该资源的`ETag`是否一致，就能很好的判断资源相对于客户端而言是否已经被修改了，如果服务器发现`ETag`对不上，那么直接以常规200回包形式将新的资源（当然也包括了新的`ETag`）发送给客户端；如果`ETag`是一致的，则会直接返回304通知客户端直接使用本地缓存即可。

<img
  src="https://moonlit-private.oss-cn-shenzhen.aliyuncs.com/browser-cache/etag-process.webp"
  alt=""
/>

### 两者之间对比

- 精度上，`ETag`要优于`Last-Modified`

`Last-Modified`的时间是秒，如果某个文件在一秒内改变了多次，那么他们的`Last-Modified`其实并没有体现出来修改，但是`ETag`每次都会确保改变了精度；如果是负载均衡的服务器，各个服务器生成的`Last-Modified`也有可能不一致。

- 性能上，`ETag`要逊于`Last-Modified`，毕竟`Last-Modifed`只需要记录时间，而`ETag`需要服务器通过算法来计算出一个hash值。

- 优先级上，服务器优先校验`ETag`。

# 缓存机制

强制缓存优先协商缓存进行，若强制缓存（`Expires`和`Cache-Control`）生效则直接使用缓存，若不生效则进行协商缓存（`Last-modified` / `If-Modified-Since`和`ETag` / `If-None-Match`），协商缓存由服务器决定是否使用缓存，若协商缓存失效，那么代表该请求的缓存失效，返回200。重新返回资源和缓存标识，而存入浏览器中；生效则返回304，继续使用缓存。具体流程图如下：

<img
  src="https://moonlit-private.oss-cn-shenzhen.aliyuncs.com/browser-cache/cache-process.webp"
  alt=""
/>

那如果什么都没有设置，浏览器会怎么做呢？

对于这种情况，浏览器会启用一个启发式的算法，通常会取响应头中的Date减去`Last-Modified`的值的10%作为缓存时间。

# 参考

- 简书，[深入理解浏览器的缓存机制](https://www.jianshu.com/p/54cc04190252)
- [http缓存机制及nginx相关配置](https://christopher-ustb.github.io/dev-log/design/http%E7%BC%93%E5%AD%98%E6%9C%BA%E5%88%B6%E5%8F%8Anginx%E7%9B%B8%E5%85%B3%E9%85%8D%E7%BD%AE/)
- 知乎，[浏览器是根据什么决定「from disk cache」与「from memory cache」？](https://www.zhihu.com/question/64201378)
- gitHub, [浏览器缓存](https://github.com/Adamwu1992/adamwu1992.github.io/issues/12)
