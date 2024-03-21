---
author: "Roc"
title: "Page Rendering"
date: "2024-01-30 13:58:29"
tags: [
    "Web-Frameworks",
]
type: post
showTableOfContents: true
---

# 什么是页面的渲染策略

这个是我自己随便起的名字，想表达的意思就是用什么手段展示页面，这是前端的本职工作，不同选择都有不同的侧重点和取舍。

# 为什么要做选择？

无非是展示更快、体验更好。

# 都有什么选择？

- CSR(纯客户端渲染，前后端分离)
- SSR
- SSG(博客，静态网页)
- ISR(next概念)
- Island Architecture(astro概念)
- RSC(React概念)

## SSG

### 概述

全称`static-site-generation`，顾名思义就是静态网站生成。更多解释参考[static-site-generation](https://nextjs.org/docs/pages/building-your-application/rendering/static-site-generation)和[get-static-props](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props)。

### 表现

在build之后就把数据写死了。

- 执行`build`的时候会触发一次后端请求。
- 执行`start`之后在前端再也不会触发请求了。
- 查看`/ssg.html`发现数据已经被写死在`html`中，参考[Statically generates both HTML and JSON](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props#statically-generates-both-html-and-json)也会生成一个`json`，组件里面使用的props都会从这里拿数据，客户端是不会执行`getstaticprops`的。

### 特点

优点就是渲染页面所需的数据在构建时已经可用，可以被CDN缓存，是最快的，所以是next的默认策略。缺点就是不够灵活，因为数据必须是死的，但是可以通过[fallback](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props#when-does-getstaticprops-run)和[getStaticPaths return values](https://nextjs.org/docs/pages/api-reference/functions/get-static-paths#getstaticpaths-return-values)参数控制。

有一个`fallback`参数，可以控制渲染策略。

- `false`: 这是默认值，意味着当页面不存在时，返回404页面。如果尝试访问一个未预先生成的页面，会直接返回404错误。
- `true`: 这个选项允许在请求的页面不存在时，返回一个"loading"状态的页面，并在后台生成该页面。一旦生成完成，下次访问该页面时就会返回已生成的静态页面。这种方式可以实现渐进式的静态生成，适用于需要大量页面生成的情况（调试会发现html什么都没返回，第二次就有内容返回了）。
- `blocking`: 这个选项与上述的true相似，但是有一个关键区别：当页面不存在时，返回的是一个"loading"状态的页面，并且在后台生成该页面。但是与true不同的是，在生成完成之前，不会返回任何内容给用户，而是等待页面生成完成后再返回。这种方式可以确保用户只能看到完全生成的静态页面，避免了页面的闪烁或加载过程中的不一致性。

### 什么时候该使用ssg

- 在用户请求之前，渲染页面所需的数据在构建时已经可用。
- 数据来自headless CMS
- 页面必须进行预渲染（用于SEO），getStaticProps 生成HTML和JSON文件，这两者都可以由CDN进行缓存以提高性能。

### `getstaticprops`什么时候会运行

参考[when-does-getstaticprops-run](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props#when-does-getstaticprops-run)。

## ISR

### 概述

全称`Incremental Static Regeneration`，更多参考[Incremental Static Regeneration](https://nextjs.org/docs/pages/building-your-application/rendering/incremental-static-regeneration)。

是`SSG`的增强，支持了更新操作(比如博客更新了内容，最新文章)。要使用`ISR`，只需要加一个[revalidation](https://nextjs.org/docs/pages/building-your-application/data-fetching/incremental-static-regeneration#testing-on-demand-isr-during-development)。

## CSR

### 概述

全称`client-side-rendering`，顾名思义就是客户端侧渲染。更多解释参考[client-side-rendering](https://nextjs.org/docs/pages/building-your-application/rendering/client-side-rendering)。

### 表现

html内没有内容，只有一个空的`root`标签(next好一些，会把静态内容提前放进去)，其他所有的内容都需要等到js加载完成调用接口动态生成dom树和cssom，因为操作dom树很慢，所以衍生了虚拟dom。

在`next`中，有两种方法开启`CSR`。

- `useEffect`里面请求数据。
- 使用[SWR](https://swr.vercel.app/)或者[Tanstack Query](https://tanstack.com/query/latest/)(推荐).

这个是我们用的套路，也应该是国内很多网站的选择。

`build`之后可以看到，前端有调用接口，但是跨域了，解决方法参考[这个](https://github.com/vercel/next.js/tree/canary/examples/api-routes-cors)

### 特点

优点：

1. 减轻服务器负载：由于客户端渲染可以在用户的设备上进行处理，因此可以减轻服务器的负载。服务器只需提供数据，而不需要执行复杂的渲染操作。
2. 更快的加载速度：客户端渲染可以提供更快的页面加载速度，因为只需要下载和渲染必要的数据和组件，而不是整个页面。
3. 更好的用户体验：客户端渲染可以提供更流畅和快速的用户体验，因为页面的交互和更新可以在用户设备上立即完成，无需等待服务器响应。
4. 更好的可扩展性：客户端渲染可以支持更多的并发请求，因为每个用户设备都可以独立处理页面渲染。

缺点：

- SEO问题：由于客户端渲染通常使用JavaScript来动态生成内容，搜索引擎可能无法正确地索引和解析页面内容，从而影响网站的SEO排名。
- 首次加载时间较长：客户端渲染需要先下载和执行JavaScript代码，然后再进行页面渲染，这可能导致首次加载时间较长。
- 对设备性能的依赖：客户端渲染需要用户设备具有足够的计算和渲染能力，如果设备性能较低，可能会导致页面加载速度变慢或出现卡顿现象。
- 安全性问题：客户端渲染可能存在一些安全风险，例如XSS攻击和数据泄露，因为渲染过程发生在用户设备上，恶意代码可以利用这些漏洞进行攻击。

## SSR

### 概述

全称`Server-side Rendering`，服务端渲染，更多解释参考[Server-side Rendering](https://nextjs.org/docs/pages/building-your-application/rendering)
和[get-server-side-props](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props)。

> via [React SSR 全流程原理：从 renderToString 到 hydrate](https://zhuanlan.zhihu.com/p/622415299)

其实这是一项很古老的技术，很早之前服务端就是通过 JSP、PHP 等模版引擎，渲染填充数据的模版，产生 html 返回的。只不过这时候没有组件的概念。

有了组件之后再做服务端渲染就不一样了，你需要基于这些组件来填充数据，渲染出 html 返回。

并且在浏览器渲染出 html 后，还要把它关联到对应的组件上，添加交互逻辑和管理之后的渲染。

这时候的 SSR 服务只能是 Node.js 了，因为要服务端也要执行 JS 逻辑，也就是渲染组件。

可以看到，同样的组件在服务端渲染了一次，在客户端渲染了一次，这种可以在双端渲染的方式，叫做同构渲染。

### 表现

`/ssr.tsx`没有生成`ssr.html`，每次刷新页面服务端都会调用一下接口，前端不会调用接口。`html`的请求会把所有内容都返回。

### React SSR过程

SSR（Server Side Rendering）是指在服务器端将React组件渲染为HTML字符串，然后将该字符串发送到浏览器端进行展示。下面是SSR的流程：

1. 客户端发起请求：浏览器向服务器发送页面请求。
2. 服务器接收请求：服务器接收到请求，并根据请求的URL确定要渲染的React组件。
3. 数据获取：服务器根据需要的数据，可能会调用API或者数据库等来获取数据。
4. 组件渲染：服务器使用获取到的数据来渲染React组件，并生成对应的HTML字符串。
5. 注水：服务器将生成的HTML字符串注入到页面中的特定标记位置，通常是通过占位符`<!-- APP -->`来标识。
6. 响应返回：服务器将包含渲染好的HTML字符串的响应返回给浏览器。
7. 浏览器接收响应：浏览器接收到响应，并开始解析HTML。
8. 客户端渲染：浏览器解析HTML时，遇到注水的占位符`<!-- APP -->`，会将其替换为服务器渲染的内容。
9. 客户端事件绑定：浏览器完成HTML解析后，会激活React组件，并绑定相应的事件处理函数。
10. 客户端交互：用户与页面进行交互时，浏览器会执行相应的事件处理函数，并更新页面的状态。
11. 客户端渲染更新：当页面状态发生变化时，React组件会重新渲染，并将变化的部分更新到页面中。

### React SSR 注水的过程

- [如何理解 SSR 中的 hydrate？](https://zhuanlan.zhihu.com/p/323174003)
- [SSR的注水和脱水](https://juejin.cn/post/7008835018558537759)

### 特点

优点：

- 更好的首次加载性能：由于服务器端已经将网页渲染成了完整的HTML，所以首次加载时用户可以立即看到内容，减少了白屏时间和等待时间。
- 更好的SEO：搜索引擎对于网页的抓取和索引主要依赖于HTML内容，而不会执行JavaScript代码。因此，通过SSR可以确保搜索引擎可以正确地抓取和索引网页内容，提高网页在搜索结果中的排名。
- 更好的可访问性：一些辅助功能设备和浏览器可能无法执行JavaScript代码，通过SSR可以确保这些用户也能够正常访问网页内容。

缺点：

- 更高的服务器负载：由于每次请求都需要在服务器端进行渲染，因此SSR会增加服务器的负载。特别是在高并发情况下，服务器可能需要处理大量的渲染请求，导致性能下降。
- 更慢的页面切换速度：由于每次页面切换都需要向服务器请求新的HTML内容，因此页面切换的速度可能会比客户端渲染慢。这是因为客户端渲染可以通过缓存和预加载来提高页面切换速度。
- 更复杂的开发和部署：SSR需要在服务器端进行渲染，并且需要处理路由、数据获取等逻辑。这使得开发和部署过程更加复杂，需要更多的技术和资源。

在没有容器技术之前，SSR其实有些运维并不愿意部署。得益于容器技术的发展，SSR现在对前端来说也没有那么麻烦了。

### 什么时候使用SSR

基于我对国内的了（可能不全），现在中小公司因为服务器压力原因都只把首页用ssr渲染，其他的还使用csr。

## Astro Island

基于上面的，可以看到即便不考虑服务器成本SSR也有缺点，就是首屏可交互时间长，为什么呢，就是因为SSR是对整个页面解析完之后，一起返回，再去注水，所以页面越大越慢。

所以下面的两种解决方案就是为了把这个服务端渲染的过程精细化到页面(Astro)/到组件中的某个方法(Qwik).

孤岛架构，参考[Astro Island](https://docs.astro.build/en/concepts/islands/)和[从 Islands Architecture 看前端有多卷](https://zhuanlan.zhihu.com/p/552852057)。

ps: astro的命令行交互花里胡哨的，真的很好看。

### 如何使用

参考[Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)。

### 什么时候用孤岛组件

虽然孤岛架构下的全栈框架有众多好处（首屏渲染快、TTI短），但并不是万能的。

他比较适合「对首屏渲染速度、TTI要求高，但整体页面交互不复杂」的场景，比如：

- 电商页面
- 博客
- 文档

对于「重交互性」的Web应用（比如「后台管理系统」、「社区」），更适合传统的SSR方案（比如Next.js）或CSR方案（直接使用前端框架）。

可见，孤岛架构的应用场景并不大，但他的实现难度却比CSR或传统SSR高得多。

大部分开发者，究其一生可能都不会用到孤岛架构。

## RSC

### 概述

推荐先看这个官方[blog](https://react.dev/blog/2020/12/21/data-fetching-with-react-server-components)和[React Labs: What We've Been Working On – March 2023](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)。

老的介绍视频里面讲的用法还是`xx.client.js`和`xx.server.js`用法，现在改成了[Directives](https://react.dev/reference/react/directives)

再看[Next Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

### 使用

参考next-app-router代码。

表现：

- `dev`的时候`client`和`server`的请求都会触发.
- `build`之后只会触发`client`的。

更多的用法推荐调试[server-components-demo](https://github.com/reactjs/server-components-demo)。

### 特点

[Benefits of Server Rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#benefits-of-server-rendering)

和孤岛很像，但是react是有个RSC payload使用[streaming](https://nextjs.org/docs/app/building-your-application/rendering/server-components#streaming)渲染。
