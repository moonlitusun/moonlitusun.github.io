---
author: "Roc"
title: "Import Html Entry Of Qiankun Source Code"
date: "2023-08-02T23:20:52+08:00"
tags: [
    "Source-Code",
]
type: post
showTableOfContents: true
---

# 看文档

- [qiankun-1. 微应用](https://qiankun.umijs.org/zh/guide/getting-started#%E5%BE%AE%E5%BA%94%E7%94%A8)
- [qiankun-React 微应用](https://qiankun.umijs.org/zh/guide/tutorial#react-%E5%BE%AE%E5%BA%94%E7%94%A8)

了解微应用如何被加载的。

<https://github.com/umijs/qiankun/blob/master/package.json#L103>核心依赖为single-spa和import-html-entry。

- [import-html-entry](https://github.com/kuitos/import-html-entry)

demo + API文档

- [HTML Entry 源码分析](https://juejin.cn/post/6885212507837825038)

qiankun一大特点就是将html做为入口文件，规避了JavaScript为了支持缓存而根据文件内容动态生成文件名，造成入口文件无法锁定的问题。

# 拉项目

```sh
git clone git@github.com:moonlitusun/import-html-entry.git
```

# 工程化

## scripts

```json
{
  # npm有几个命令是可以不用加run的，比如start、test 参考 https://docs.npmjs.com/cli/v9/commands 
  "lint": "npm test",
  # 打cjs包和esm包 shell的&&代表cmd1执行成功(状态码为0)才会执行下一个 类似的还有||, &,;,(),| cat ./package.json | wc -l
  "build": "npm run build:lib && npm run build:esm",
  # 直接执行babel命令
  "build:lib": "rm -fr ./lib && babel ./src --out-dir ./lib --ignore 'src/**/__tests__/**/*.js'",
  # 和上面命令不一样的是多了个BABEL_ENV=esm，参考babelrc
  "build:esm": "rm -fr ./esm && BABEL_ENV=esm babel ./src --out-dir ./esm --ignore 'src/**/__tests__/**/*.js'",
  # push之前执行下单元测试
  "prepush": "npm run lint",
  "prepublishOnly": "npm run build",
  # publish发布工具，快速更新版本号
  # 参考<https://github.com/sindresorhus/np>
  # --yolo Skips cleanup and testing
  # --no-publish Skips publishing
  "release": "np --no-cleanup --yolo --no-publish --any-branch",
  "test": "jest --coverage",
  # npm view codecov
  # 参考<https://docs.npmjs.com/cli/v9/commands/npm-view>
  "codecov": "codecov"
}
```

### 因为打esm包讲一下它的babel配置

```js
{
  "presets": [
    "@babel/preset-env"
  ],
  "plugins": [
    "@babel/plugin-transform-runtime",
    "@babel/plugin-proposal-optional-chaining"
  ],
  "env": {
    "esm": {
      "presets": [
        [
          "@babel/preset-env",
          {
            "modules": false
          }
        ]
      ],
      "plugins": [
        [
          "@babel/plugin-transform-runtime",
          {
            "useESModules": true
          }
        ],
        "@babel/plugin-proposal-optional-chaining"
      ]
    }
  }
}
```

- `"presets": [["@babel/preset-env", { "modules": false }]]`:  "modules" 选项设置为 false，表示不进行模块转换。这表明代码已经使用了原生的 ES 模块化语法，不需要进行额外的模块转换。参考<https://babeljs.io/docs/babel-preset-env#modules>
- `"plugins": [[ "@babel/plugin-transform-runtime", { "useESModules": true } ], "@babel/plugin-proposal-optional-chaining"]`: 在 "esm" 环境中，使用了 @babel/plugin-transform-runtime 插件，并将其配置的 "useESModules" 选项设置为 true，以确保 ES 模块化语法得到正确的转换。和@babel/runtime配套使用。
- `@babel/plugin-proposal-optional-chaining` 支持可选链操作符的转换。

# 看目录结构

- src就是源码目录
- 看入口(index.d.ts)，只抛出了3个函数`execScripts/importHTML/importEntry`

```txt
在 import-html-entry 仓库中的 importEntry 和 importHTML 是该仓库自定义的两个 API，用于在浏览器环境中动态加载和注入 HTML 入口文件中的内容。

importEntry 方法用于动态加载其他入口文件或模块。它可以接收一个入口文件 URL 或配置对象，并异步加载该入口文件所依赖的 JavaScript、CSS 等资源。该方法常用于实现微前端架构中按需加载子应用的功能。

importHTML 方法则是一个用于动态加载 HTML 内容并执行其中的 JavaScript 代码的方法。它接收一个 HTML 文件 URL 或配置对象，并异步加载该 HTML 文件，并将其中的 JavaScript 代码注入到当前页面中执行。

这两个 API 都是 import-html-entry 仓库提供的自定义方法，用于实现动态加载和执行 HTML 入口文件的功能。它们的区别在于，importEntry 用于加载整个入口文件及其依赖模块，而 importHTML 仅加载并执行其中的 JavaScript 代码。具体使用哪个 API 取决于你的需求和使用场景。
```

# 如何使用vscode调试url功能来调试源码

debug url，浏览器直接使用esmodule格式的代码，所以省过了编译。

# 源码讲解

## 代码片段

```js
if (!window.fetch) {
	throw new Error('[import-html-entry] Here is no "fetch" on the window env, you need to polyfill it');
}

const defaultFetch = window.fetch.bind(window);
```

因为里面依赖了fetch来做请求，原生请求可以用xhr也可以fetch，当然xhr比较繁琐，也不支持promise。所以它先判断了是否支持fetch，否则就报错让你自己polyfill。

`defaultFetch`这里盲猜是需要指定this为window，如果你的polyfill用的严格模式，this会指向`undefined`。

```js
export function parseUrl(url){
    const parser = new DOMParser();
    const html = `<script src="${url}"></script>`;
    const doc = parser.parseFromString(html, "text/html");
    return doc.scripts[0].src;
}
```

这个函数的步骤如下：

创建一个 DOMParser 对象。
构建一个HTML字符串，其中包含一个脚本标签，其 src 属性设置为传递给函数的 URL。
使用 DOMParser 对象的 parseFromString 方法将 HTML 字符串解析为一个文档对象。
从解析后的文档对象中获取第一个脚本元素，并返回其 src 属性作为解析出的URL中的脚本源。
请注意，在使用该函数之前，您需要确保在函数环境中有 DOMParser 对象可用。此函数可以用于提取脚本标签中的URL，并进行进一步处理或使用。

```js
export const genLinkReplaceSymbol = (linkHref, preloadOrPrefetch = false) =>
  `<!-- ${preloadOrPrefetch ? 'prefetch/preload' : ''} link ${linkHref} replaced by import-html-entry -->`;
```

这个函数在一些场景中可用于生成替换链接的标识，例如在动态加载模块或组件时，可以使用这个标识来标记并识别已替换的链接。

## 流程分析

适合过程式代码，面向对象最好的方式还是理清楚类与类之间的关系。

### 调用importHtml

```js
importHTML("./template.html").then((res) => {
    // console.log(res.template);
    console.log(res.template, '<-- res');
    res.execScripts().then((exports) => {
      console.log(exports, '<-- exports');
    });
  });
```

### 查看importHtml

`importHTML`函数位于`src/index.js:250`。

#### 读取配置、声明变量

```js
// line 251
  let fetch = defaultFetch;
  // ...
  getTemplate = opts.getTemplate || defaultGetTemplate;
// line 273
```

声明了一些变量，fetch、getPublicPath、getTemplate。

#### 检测缓存

```js
return embedHTMLCache[url] || (embedHTMLCache[url] = fetch(url)
```

这种写法在没用ts的时候很常用，看过很多代码库里面用过。优先取缓存，如果没有缓存就

- 检查 `embedHTMLCache[url]` 是否存在。
- 如果 `embedHTMLCache[url]` 存在，则返回其值。
- 如果 `embedHTMLCache[url]` 不存在，则创建一个新的 Promise 对象并赋值给 `embedHTMLCache[url]`，然后返回这个新创建的 Promise 对象。

#### 下载url

```js
.then(response => readResAsString(response, autoDecodeResponse))
```

以text的格式下载对应的url。查看`readResAsString`（调到函数尾部的快捷键）函数，里面主要是判断如果不开启自动检测文本文件编码(charset)/没有响应头/有content-type是utf-8 都直接以text格式返回，如果是gbk，gb2312就走流读取再返回text格式。

```js
return response.blob()
  .then(file => new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsText(file, charset);
  }));
```

此时响应的html就是html的内容了，主项目就是使用这个方式就调用子项目的入口。

然后获取了个`assetPublicPath`，基本是上获取url上的location地址。然后跳进了`processTpl`方法。

### processTpl

先声明了一个空的`scripts`数组、`styles`数组、`entry`变量、`moduleSupport`是否支持esm。

然后把上一步拿到的html进行了一系列的正则操作：

#### 移除所有的注释

```js
tpl
/*
remove html comment first
*/
.replace(HTML_COMMENT_REGEX, '')
```

#### 把所有的link标签标记

- 例如匹配到`<link href="https://unpkg.com/antd@3.13.6/dist/antd.min.css" rel="stylesheet">`，
- 判断是否有`rel="stylesheet"`，如果是stylesheet就去取`href`和是否有`ignore`参数。
- 如果是`ignore`就把这个`link`标签替换成`<!-- ignore asset`开头的标记。
- 如果不是`ignore`，把`href`经过一个函数`parseUrl`转换一层把上面的转义符去掉。
- 把`href`地址push到`styles`数组中，把`href`替换成一个标记。

#### 匹配所有的style标签

- 如果有`ignore`标记就替换成特殊的标记。
- 如果不是就原样返回。

#### 匹配所有的script标签

- 先检测有没有`ignore`标记
- `moduleScriptIgnore`代表在支持`esmobule`的情况下有`nomodule`标记的和不支持的时候有`module`标记的，总之就是不会被执行的代码。
- 判断`script`的`type`类型是否是白名单中的或者为空的。
- 判断是否是外部脚本，比如有`src`属性的。如果是外部脚本就匹配到`src`的值。
  - 判断了下有没有已经有entry的脚本了，如果前面有entry的脚本这个还是就会报错不能有多个入口脚本。
  - 然后补全url再转义一遍。
  - 赋值entry；
  - 如果是`ignore`的资源打上忽略标记。
  - 如果是`async`和`crossorign`的会特殊处理(async和defer，所以之前写script会放在html下面，但是现在也没有啥用就一个root div)，然后会把script push到`scripts`数组里，然后返回一个标记。
- 如果是内联script，会去获取里面的内容push到`scripts`数组里，然后返回一个标记。

#### 处理完所有的资源返回

- 先过滤一下空内联`script`
- 判断了一下是否有指定`entry`如果没有就默认指定最后一个，所以我们的入口文件一定要写在最后一个。
- `postProcessTemplate`执行以下`post`钩子函数就返回。

### 调用getEmbedHTML

- 参数是`template`和`style`标签，判断如果是内联标签直接返回，如果不是就请求url返回text。
- 此时的`styleSheets`就是内容，然后把上一部做的标记替换为`<style>内容<style>`的形式。

### 获取到解析模版的结果

得到一个对象，

```js
const res = {
  template: embedHTML,
  assetPublicPath,
  getExternalScripts: () => getExternalScripts(scripts, fetch),
  getExternalStyleSheets: () => getExternalStyleSheets(styles, fetch),
  execScripts: (proxy, strictGlobal, opts = {}) => {
    if (!scripts.length) {
      return Promise.resolve();
    }
    return execScripts(entry, scripts, proxy, {
      fetch,
      strictGlobal,
      ...opts,
    });
}
```

### execScripts

看`execScripts`函数，接受参数为

- `entry`: 入口脚本地址
- `scripts`: 脚本列表
- `proxy`: window的替代品，qiankun JS 沙箱生成 windowProxy，传递到这里来
- `opts`: 
  - `fetch`替换
  - strictGlobal
  - success回调
  - error回调
  - beforeExec执行前钩子
  - afterExec执行后钩子

### getExternalScripts

- 使用`promise.all`请求所有的`scripts`数组里面的地址，如果是内联标签直接返回内容，不是则使用`fetch`请求text回来。
- 返回值是`return new Promise(resolve => schedule(0, success || resolve));`，调用了`schedule`。
- `schedule`内判断了只要`scripts`里有值就执行`exec`。

### exec

- `exec`的参数是`scriptSrc`/`inlineScript`/`resolvePromise`
- 如果是入口脚本，调用`noteGlobalProps`函数。再执行
- 如果不是入口脚本，就判断是否是一个`string`，如果是就用eval执行代码。

### noteGlobalProps

- 接收一个全局对象，然后遍历一遍上面的属性。

### geval

- 接收`scriptSrc`/`inlineScript`
- 执行`beforeExec`钩子
- 调用`getExecutableScript`获取可执行的script，里面有中文注释。
- `(0, eval)('window')`

这行代码的作用是获取全局对象 window 的引用，但使用了一个稍微复杂的方式。

首先，代码 (0, eval)('window') 中的 (0, eval) 部分是一个构造的方式，用于绕过一些作用域限制。在 JavaScript 中，eval 函数会在当前作用域中执行传入的字符串代码，但它的行为可能会受到严格模式和其他限制的影响。为了确保在任何情况下都能够获得全局对象 window，这里使用了一个小技巧。

通过在 (0, eval) 中使用逗号操作符，可以将 eval 函数调用隔开，确保 eval 在全局作用域下执行。然后，传递给 eval 的字符串是 'window'，即获取全局对象 window。

最终的结果就是获得了全局对象 window 的引用，并将其赋值给了 globalWindow 变量。

需要注意的是，这种方式是非常不常见且不推荐的。直接访问全局对象 window 是更简单和可读性更好的方式。使用 (0, eval)('window') 这样的构造可能会导致代码难以理解，并且可能会在不同的 JavaScript 环境中产生不一致的行为。

- `getExecutableScript`返回一个自执行函数，但是指定了上下文，即重写了`window`/`self`/`globalThis`为`window.proxy`就是沙箱。
- 调用`evalCode`函数使用`eval`执行了代码，把结果返回。

## 获取exports结果

因为上一步执行的是umd代码，所以会在window上面挂一个属性，所以使用`getGlobalProp(strictGlobal ? proxy : window);`来获取上一步添加的最后一个属性(但是案例说对象是无序数列，也可能是判断多的)。

### 如果是async脚本

`content: new Promise((resolve, reject) => requestIdleCallback(() => fetchScript(src, fetchOpts).then(resolve, reject))),`使用`window.requestIdleCallback`在空闲时间执行。

# 管理中台子项目

找一个管理中台子项目，避免跨域问题，放一起。

```js
importHTML("/account/index.html").then((res) => {
	res.execScripts().then((exports) => {
		exports.bootstrap();
		exports.mount({
			routerBase: '/account/#/',
			setGlobalState: () => undefined,
			container: 'a',
		});
		console.log(exports.mount, "<-- exports");
	});
});
```

# 其他

## async和defer

默认情况下，当浏览器遇到 `<script>` 标签时，会暂停页面的解析和渲染，直到脚本加载并执行完成。这可能会导致页面加载速度较慢，特别是如果脚本很大或需要从远程服务器加载。为了解决这个问题，可以使用 async 属性来异步加载脚本。

使用 async 属性的脚本将会在加载时不会阻塞页面的解析和渲染，而是在脚本加载完成后立即执行，无论此时页面的解析是否完成。这样可以提高页面加载速度，但也可能导致脚本在页面的其他部分还没有完全准备好时就开始执行。

示例：

```html
<!-- 同步加载脚本，会阻塞页面解析和渲染 -->
<script src="script.js"></script>

<!-- 异步加载脚本，不会阻塞页面解析和渲染 -->
<script src="script.js" async></script>
```

需要注意的是，使用 async 加载的脚本在执行时，不保证它们的执行顺序。如果有多个异步脚本，它们可能在任意顺序下完成加载和执行。这可能会导致脚本之间的依赖关系出现问题，因此在使用 async 属性时，需要确保脚本之间的互相依赖不会影响预期的功能。

另外，如果你需要确保脚本按照特定的顺序加载和执行，你可以使用 defer 属性，它也会使脚本异步加载，但是会在页面解析完成后按照它们在文档中出现的顺序执行。
