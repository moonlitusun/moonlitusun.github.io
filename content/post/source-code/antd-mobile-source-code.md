+++
author = "Roc"
title = "Antd Mobile Source Code"
date = "2022-11-07 00:09:45"
tags = [
    "Source-Code",
]
+++

基于[5.32.0](https://github.com/ant-design/ant-design-mobile/releases/tag/v5.32.0)

## 如何读类似的源码库

无统一定论，仁者见仁，以下是我的个人体验。

- 了解对标库的背景。

  - 做什么的
  - 动机，解决什么问题的(<https://redux.js.org/tutorials/essentials/part-7-rtk-query-basics#motivation>)
  - 谁写的，是否有大公司或者大神背景
  - 底层什么技术
  - 社区是否活跃
  - 更新是否频繁
  - 回答issue是否积极

- 看文档
- 玩demo，先了解用法。

剩下的参考下面的步骤。

## adm的目录结构

```bash
.
├── config # dumi目录配置
├── docs # 文档目录
├── scripts # 脚本目录
├── lib # 打包输出目录
├── src # 源码
├── pnpm-lock.yaml
├── codecov.yml
├── yarn-error.log
├── jest.config.js
├── .npmrc
├── .prettierignore
├── .editorconfig
├── README.md
├── yarn.lock
├── .gitignore
├── package.json
├── .prettierrc.js
├── .nvmrc
├── .eslintrc.js
├── gulpfile.js # build脚本
├── commitlint.config.js
├── tsconfig.json
├── umd.html
├── LICENSE.txt
├── babel-transform-less-to-css.js
└── fileTransformer.js
```

## 用了什么技术

### dependencies

运行时依赖

```json
{
   "dependencies": {
    // 浮动元素定位库
    "@floating-ui/dom": "^1.0.6",
    // 看代码是decimal之类的库，看github上的代码却没文档，写的是什么portal。
    "@rc-component/mini-decimal": "^1.0.1",
    // 动画库
    "@react-spring/web": "~9.6.0",
    // 手势库
    "@use-gesture/react": "10.2.20",
    // 阿里自己的hooks库
    "ahooks": "^3.7.2",
    "antd-mobile-icons": "^0.3.0",
    // 一个空包，为了查看v5各个版本下载量的
    // https://github.com/ant-design/antd-mobile-v5-count/issues/2
    "antd-mobile-v5-count": "^1.0.1",
    "classnames": "^2.3.2",
    "dayjs": "^1.11.6",
    "lodash": "^4.17.21",
    "rc-field-form": "~1.27.3",
    // antd的工具库
    "rc-util": "^5.24.8",
    // react专门用来判断react元素的库
    "react-is": "^18.2.0",
    // 截取emoji的库，用在了ellipsis组件
    "runes": "^0.4.3",
    // 用来打破react只能在顶层写hooks的规则
    "staged-components": "^1.1.3",
    // ts runtime
    "tslib": "^2.4.1",
    // react 18加了use-sync-external-store，如果你用的react18以下可以用这个做兼容
    // 代码中我没看到有用到，应该是给@react-spring/web这个库做兼容的，但是去看下https://github.dev/pmndrs/react-spring#readme发现不是，暂时没发现他用这个干嘛的
    "use-sync-external-store": "^1.2.0"
  }
}
```

### devDependencies

工程化相关

```json
"devDependencies": {
  "@ant-design/icons": "^4.8.0",
  "@ant-design/tools": "^16.0.0-alpha.3",
  "@babel/cli": "^7.21.0",
  "@babel/core": "^7.21.4",
  "@babel/plugin-transform-modules-commonjs": "^7.21.2",
  "@babel/preset-env": "^7.21.4",
  "@babel/preset-react": "^7.18.6",
  "@babel/preset-typescript": "^7.21.4",
  "@commitlint/cli": "^17.6.1",
  "@commitlint/config-conventional": "^17.6.1",
  "@docsearch/react": "^3.3.3",
  "@jest/types": "^28.1.3",
  "@react-spring/core": "~9.6.1",
  "@statoscope/webpack-plugin": "^5.26.2",
  "@testing-library/jest-dom": "^5.16.5",
  "@testing-library/react": "^13.4.0",
  "@testing-library/user-event": "14.2.1",
  "@types/big.js": "^6.1.6",
  "@types/jest": "^28.1.8",
  "@types/jest-axe": "3.5.4",
  "@types/lodash": "^4.14.194",
  "@types/node": "^18.15.13",
  "@types/react": "^18.0.38",
  "@types/react-beautiful-dnd": "^13.1.4",
  "@types/react-dom": "^18.0.11",
  "@types/react-helmet": "^6.1.6",
  "@types/react-is": "^17.0.3",
  "@types/react-virtualized": "^9.21.21",
  "@types/resize-observer-browser": "^0.1.7",
  "@types/testing-library__jest-dom": "^5.14.5",
  "@types/use-sync-external-store": "^0.0.3",
  "@typescript-eslint/eslint-plugin": "^5.59.0",
  "@typescript-eslint/parser": "^5.59.0",
  "@umijs/types": "^3.5.40",
  "@use-gesture/core": "10.2.20",
  "antd": "^4.24.9",
  "autoprefixer": "^9.8.8",
  "babel-loader": "^8.3.0",
  "css-loader": "^6.7.3",
  "csstype": "^3.1.2",
  "del": "^6.1.1",
  "dumi": "^1.1.50",
  "eslint": "^8.39.0",
  "eslint-config-prettier": "^8.8.0",
  "eslint-plugin-react": "^7.32.2",
  "eslint-plugin-react-hooks": "^4.6.0",
  "gulp": "^4.0.2",
  "gulp-babel": "^8.0.0",
  "gulp-less": "^5.0.0",
  "gulp-postcss": "^9.0.1",
  "gulp-rename": "^2.0.0",
  "gulp-replace": "^1.1.4",
  "gulp-typescript": "^6.0.0-alpha.1",
  "husky": "^8.0.3",
  "jest": "^28.1.3",
  "jest-axe": "^6.0.1",
  "jest-canvas-mock": "^2.5.0",
  "jest-environment-jsdom": "^28.1.3",
  "jest-watch-typeahead": "^1.1.0",
  "less": "^4.1.3",
  "lorem-ipsum": "^2.0.8",
  "lz-string": "^1.5.0",
  "mockdate": "^3.0.5",
  "postcss": "^8.4.23",
  "postcss-px-multiple": "^0.1.5",
  "postcss-pxtorem": "^6.0.0",
  "prettier": "^2.8.7",
  "pretty-quick": "^3.1.3",
  "prism-react-renderer": "^1.3.5",
  "prismjs": "^1.29.0",
  "qrcode.react": "^3.1.0",
  "react": "^18.2.0",
  "react-beautiful-dnd": "^13.1.1",
  "react-dom": "^18.2.0",
  "react-helmet": "^6.1.0",
  "react-lottie": "^1.2.3",
  "react-test-renderer": "^18.2.0",
  "react-virtualized": "^9.22.5",
  "style-loader": "^3.3.2",
  "through2": "^4.0.2",
  "ts-jest": "^28.0.8",
  "ts-node": "^10.9.1",
  "typescript": "~4.6.4",
  "vite": "^3.2.6",
  "webpack": "^5.80.0",
  "webpack-bundle-analyzer": "^4.8.0",
  "webpack-stream": "^7.0.0"
},
```

### 需要去研究的

看你看源码的目的，如果是学习工程化重点看devDep，如果学习组件写法，基本所有运行时依赖都要看一看

- gulp

工程化主要工具

- jest系列

- staged-components

用法

```tsx
import { useState, useEffect } from 'react';
import { staged } from '@/components/stage-components';

export default staged(() => {
  const [waiting, setWaiting] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setWaiting(false);
    }, 1000);
  }, []);

  if (waiting) return null;

  return () => {
    const [count, setCount] = useState(1);

    return (
      <div>
        <p>{count}</p>
        <button onClick={() => { setCount(count + 1); }}>Change</button>
      </div>
    );
  };
});
```

源码

```tsx
import React, {FC, PropsWithChildren, ReactElement, Ref, RefForwardingComponent} from 'react'

type StageRender = () => StageRender | ReactElement | null
type StageRenderRoot<P> = (props: PropsWithChildren<P>) => StageRender | ReactElement | null
type StageRenderRootWithRef<P, R> = (props: PropsWithChildren<P>, ref: Ref<R>) => StageRender | ReactElement | null

function processNext(next: StageRender | ReactElement | null) {
  // 如果是函数 StageRender 或者 函数 就继续执行。否则直接返回。一直递归到ReactElement | null 就结束。
  if (typeof next === 'function') {
    return (
      <Stage stage={next} />
    )
  } else {
    return next
  }
}

function Stage<P>(props: {
  stage: StageRender
}) {
  const next = props.stage()
  return processNext(next)
}

// 导出文件，大部分都是类型定义，可以忽略。
export function staged<P = {}>(
  stage: StageRenderRoot<P>
): FC<P>
export function staged<P = {}, R = any>(
  stage: StageRenderRootWithRef<P, R>,
): RefForwardingComponent<R, P>
export function staged<P = {},  R = any>(
  stage: StageRenderRootWithRef<P, R>,
) {
  return function Staged(props, ref) {
    // 这里拿到stage函数的返回值，根据上面的demo可以知道有可能是null或者真正的react组件也可能是stage函数。
    // 把结果传递给 processNext
    const next = stage(props, ref)

    return processNext(next)
  } as FC<P>
}
```

## scripts

```json
{
  // 启动dumi
  "start": "dumi dev",
  // 使用gulp打包
  "build": "gulp",
  // 用dumi打包文档
  "build-doc": "dumi build && echo '!.*' > dist/.surgeignore",
  "lint": "eslint .",
  "postinstall": "husky install",
  "test": "jest",
  "test-with-coverage": "jest --coverage",
  // Ant Design Tools 中的一个命令，用于比较两个不同版本的 Ant Design 包之间的差异，确认后再执行下一步，并且会给一个Report出来。
  "package-diff": "antd-tools run package-diff --path=./lib",
  // 部署不同tag的命令
  // https://docs.npmjs.com/adding-dist-tags-to-packages
  // http://10.10.11.236:4873/-/web/detail/@dz-web/o-orange
  "pub": "npm run package-diff && npm publish ./lib",
  "pub:alpha": "npm publish ./lib --tag alpha",
  "pub:dev": "npm publish ./lib --tag dev"
}
```

## package.json中其他字段

```json
{
  "name": "antd-mobile",
  "version": "5.32.0",
  "resolutions": {
    "@types/react": "18",
    "@types/react-dom": "18"
  },
  // or exports [Modules:packages](https://nodejs.org/api/packages.html#exports)
  "main": "./cjs/index.js",
  "module": "./es/index.js",
  // 类型入口文件 现代用types
  "types": "./es/index.d.ts",
  "typings": "./es/index.d.ts",
  // unpkg入口 当请求：https://unpkg.com/<package-name>，CDN 会自动解析 unpkg 字段并返回相应的文件。
  "unpkg": "./umd/antd-mobile.js",
  "GravityCDN": "./umd/antd-mobile.js",
  // files or .npmignore
  "files": [
    "./lib"
  ],
  // tree shaking
  "sideEffects": [
    "**/*.css",
    "**/*.less",
    "./es/index.js",
    "./src/index.ts",
    "./es/global/index.js",
    "./src/global/index.ts"
  ],
  "publishConfig": {
    "registry": "https://registry.npmjs.org"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ant-design/ant-design-mobile.git",
    "branch": "master",
    "platform": "github"
  }
}
```

## 工程化相关

### dev

直接看[dumi](https://d.umijs.org/)

### build

使用的gulp

#### 概述

build的主要逻辑在`gulpfile.js`，出口主要有三个：

```ts
exports.umdWebpack = umdWebpack
exports.buildBundles = buildBundles

exports.default = gulp.series(
  clean, // 清除产物
  buildES, // 构建es产物
  buildCJS, // 构建cjs产物
  gulp.parallel(buildDeclaration, buildStyle), // 生成类型声明、生成style
  copyAssets,
  copyMetaFiles,
  generatePackageJSON,
  buildBundles,
  gulp.series(init2xFolder, build2xCSS),
  umdWebpack,
  copyUmd,
  copyPatchStyle(),
  copyPatchStyle('/2x')
)
```

最主要的还是最后默认导出的这个`series`流水线。我们一个一个看一下。

#### clean

```ts
function clean() {
  return del('./lib/**')
}
```

逻辑非常简单，就是调用del库清除产物。

#### buildES

```ts
const ts = require('gulp-typescript')
const babel = require('gulp-babel')

function buildES() {
  const tsProject = ts({
    ...tsconfig.compilerOptions,
    module: 'ES6',
  })
  return gulp
    .src(['src/**/*.{ts,tsx}'], {
      ignore: ['**/demos/**/*', '**/tests/**/*'],
    })
    .pipe(tsProject)
    .pipe(
      babel({
        'plugins': ['./babel-transform-less-to-css'],
      })
    )
    .pipe(gulp.dest('lib/es/'))
}
```

处理ts和tsx，生成es产物，也非常简单，主要是用`gulp-typescript`来转换ts加babel处理兼容性。

这里有一个地方细节是它用了一个plugin`babel-transform-less-to-css`。

```ts
module.exports = function () {
  return {
    visitor: {
      ImportDeclaration(path, source) {
        if (path.node.source.value.endsWith('.less')) {
          path.node.source.value = path.node.source.value.replace(
            /\.less$/,
            '.css'
          )
        }
      },
    },
  }
}
```

也是非常简单的一个plugin，主要就是把代码中的import path，xx.less改成xx.css。此时的less的代码还没有被处理过，只是先改一下引用地址。

#### buildCJS

```ts
function buildCJS() {
  return gulp
    .src(['lib/es/**/*.js'])
    .pipe(
      babel({
        'plugins': ['@babel/plugin-transform-modules-commonjs'],
      })
    )
    .pipe(gulp.dest('lib/cjs/'))
}
```

这个更简单，直接是把上一步生产的es产物使用[@babel/plugin-transform-modules-commonjs](https://babel.dev/docs/en/next/babel-plugin-transform-modules-commonjs)
转换成cjs产物。

#### buildDeclaration

```ts
function buildDeclaration() {
  const tsProject = ts({
    ...tsconfig.compilerOptions,
    paths: {
      ...tsconfig.compilerOptions.paths,
      'react': ['node_modules/@types/react'],
      'rc-field-form': ['node_modules/rc-field-form'],
      '@react-spring/web': ['node_modules/@react-spring/web'],
      '@use-gesture/react': ['node_modules/@use-gesture/react'],
    },
    module: 'ES6',
    declaration: true,
    emitDeclarationOnly: true,
  })
  return gulp
    .src(['src/**/*.{ts,tsx}'], {
      ignore: ['**/demos/**/*', '**/tests/**/*'],
    })
    .pipe(tsProject)
    .pipe(gulp.dest('lib/es/'))
    .pipe(gulp.dest('lib/cjs/'))
}
```

这里还是使用的typescript生成类型文件，因为设置了`emitDeclarationOnly: true`所以只生成类型文件。

#### buildStyle

```ts
function buildStyle() {
  return gulp
    .src(['./src/**/*.less'], {
      base: './src/',
      ignore: ['**/demos/**/*', '**/tests/**/*', '*.patch.less'],
    })
    .pipe(
      less({
        paths: [path.join(__dirname, 'src')],
        relativeUrls: true,
      })
    )
    .pipe(
      postcss([
        autoprefixer({
          overrideBrowserslist: 'iOS >= 10, Chrome >= 49',
        }),
      ])
    )
    .pipe(gulp.dest('./lib/es'))
    .pipe(gulp.dest('./lib/cjs'))
}
```

也都是常规操作，使用

- `gulp-less`: 处理less文件
- `gulp-postcss`: postcss处理兼容性。

#### copyAssets

```ts
function copyAssets() {
  return gulp
    .src('./src/assets/**/*')
    .pipe(gulp.dest('lib/assets'))
    .pipe(gulp.dest('lib/es/assets'))
    .pipe(gulp.dest('lib/cjs/assets'))
}
```

copy资源到产物目录。

#### copyMetaFiles

```ts
function copyMetaFiles() {
  return gulp.src(['./README.md', './LICENSE.txt']).pipe(gulp.dest('./lib/'))
}
```

也是copy一些文件到产物目录。

#### generatePackageJSON

```ts
function generatePackageJSON() {
  return gulp
    .src('./package.json')
    .pipe(
      through.obj((file, enc, cb) => {
        const rawJSON = file.contents.toString()
        const parsed = JSON.parse(rawJSON)
        delete parsed.scripts
        delete parsed.devDependencies
        delete parsed.publishConfig
        delete parsed.files
        delete parsed.resolutions
        delete parsed.packageManager
        const stringified = JSON.stringify(parsed, null, 2)
        file.contents = Buffer.from(stringified)
        cb(null, file)
      })
    )
    .pipe(gulp.dest('./lib/'))
}
```

copy package.json的同时删除一些不必要的信息。保持package.json文件干净。

#### buildBundles

```ts
function getViteConfigForPackage({ env, formats, external }) {
  const name = packageJson.name
  const isProd = env === 'production'
  return {
    root: process.cwd(),

    mode: env,

    logLevel: 'silent',

    define: { 'process.env.NODE_ENV': `"${env}"` },

    build: {
      cssTarget: 'chrome61',
      lib: {
        name: 'antdMobile',
        entry: './lib/es/index.js',
        formats,
        fileName: format => `${name}.${format}${isProd ? '' : `.${env}`}.js`,
      },
      rollupOptions: {
        external,
        output: {
          dir: './lib/bundle',
          // exports: 'named',
          globals: {
            'react': 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
      minify: isProd ? 'esbuild' : false,
    },
  }
}

async function buildBundles(cb) {
  const envs = ['development', 'production']
  const configs = envs.map(env =>
    getViteConfigForPackage({
      env,
      formats: ['es', 'cjs', 'umd'],
      external: ['react', 'react-dom'],
    })
  )

  await Promise.all(configs.map(config => vite.build(config)))
  cb && cb()
}
```

上面的都是bundless的产物，这一个任务是利用vite打包bundle产物，打包bundle目录下es/cjs/umd产物。

#### init2xFolder

```ts
function init2xFolder() {
  return gulp
    .src('./lib/**', {
      base: './lib/',
    })
    .pipe(gulp.dest('./lib/2x/'))
}
```

在copy lib生成了一个2x目录。

#### build2xCSS

```ts
function build2xCSS() {
  return (
    gulp
      .src('./lib/2x/**/*.css', {
        base: './lib/2x/',
      })
      // Hack fix since postcss-px-multiple ignores the `@supports` block
      .pipe(
        replace(
          '@supports not (color: var(--adm-color-text))',
          '@media screen and (min-width: 999999px)'
        )
      )
      .pipe(postcss([pxMultiplePlugin]))
      .pipe(
        replace(
          '@media screen and (min-width: 999999px)',
          '@supports not (color: var(--adm-color-text))'
        )
      )
      .pipe(
        gulp.dest('./lib/2x', {
          overwrite: true,
        })
      )
  )
}
```

使用`postcss-px-multiple`这个库生成一个2x的css文件。

#### umdWebpack

```ts
function umdWebpack() {
  return gulp
    .src('lib/es/index.js')
    .pipe(
      webpackStream(
        {
          output: {
            filename: 'antd-mobile.js',
            library: {
              type: 'umd',
              name: 'antdMobile',
            },
          },
          mode: 'production',
          optimization: {
            usedExports: true,
          },
          performance: {
            hints: false,
          },
          resolve: {
            extensions: ['.js', '.json'],
          },
          plugins: [
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              openAnalyzer: false,
              reportFilename: 'report/report.html',
            }),
            new StatoscopeWebpackPlugin({
              saveReportTo: 'report/statoscope/report.html',
              saveStatsTo: 'report/statoscope/stats.json',
              open: false,
            }),
          ],
          module: {
            rules: [
              {
                test: /\.m?js$/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    'presets': [
                      [
                        '@babel/preset-env',
                        {
                          'loose': true,
                          'modules': false,
                          'targets': {
                            'chrome': '49',
                            'ios': '9',
                          },
                        },
                      ],
                      '@babel/preset-typescript',
                      '@babel/preset-react',
                    ],
                  },
                },
              },
              {
                test: /\.(png|svg|jpg|gif|jpeg)$/,
                type: 'asset/inline',
              },
              {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
              },
            ],
          },
          externals: [
            {
              react: {
                commonjs: 'react',
                commonjs2: 'react',
                amd: 'react',
                root: 'React',
              },
              'react-dom': {
                commonjs: 'react-dom',
                commonjs2: 'react-dom',
                amd: 'react-dom',
                root: 'ReactDOM',
              },
            },
          ],
        },
        webpack
      )
    )
    .pipe(gulp.dest('lib/umd/'))
}
```

使用webpack打了一个umd包。

#### copyUmd

```ts
function copyUmd() {
  return gulp
    .src(['lib/umd/antd-mobile.js'])
    .pipe(rename('antd-mobile.compatible.umd.js'))
    .pipe(gulp.dest('lib/bundle/'))
}
```

把生成的umd文件 copy一份到bundle目录里面。

#### copyPatchStyle

```ts
function copyPatchStyle(prefix = '') {
  return () =>
    gulp
      .src([`./lib${prefix}/es/global/css-vars-patch.css`])
      .pipe(
        rename({
          dirname: '',
          extname: '.css',
        })
      )
      .pipe(gulp.dest(`./lib${prefix}/bundle`))
}
```

把全局css文件copy到bundle目录下。

### test

- [jest](https://jestjs.io/)

## 如何扩展一个自己的antd mobile组件

### 以button为例

所有的代码都在`src`目录里面，`index.ts`负责导出所有的组件以及类型。组件的代码在`components`中，所以只要弄懂一个组件就了解了其他组件的开发模式。以`button`为例。结构是这样的。

```bash
├──button
├── button.less
├── index.en.md
├── index.zh.md
├── index.ts
├── button.tsx
└── button.patch.less
├── tests
|  └── button.test.tsx
├── demos
|  ├── demo1.tsx
|  └── demo2.tsx
```

- `index.ts`

```ts
// 负责导出less资源、button组件、以及一些类型定义。
import './button.less'
import { Button } from './button'
export type { ButtonProps, ButtonRef } from './button'

export default Button
```

- `button.tsx`

写button组件的主逻辑

- `button.less`

button的样式

- `button.patch.less`

`button.patch.less` 是 `antd-mobile` 中的一个样式补丁文件。主要用于修复或者覆盖原有组件的样式，然后是一个兼容文件，里面没有使用css变量。

最后会打包到bundle目录里面。

- `index.en.md` & `index.zh.md`

组件的中英文MDX文档。

- `tests/button.test.tsx`

测试文件。

### 修改路由配置

- 修改`/config/components.ts`。

### button组件代码有什么值得学习的

#### 优秀的类型定义

props分成三层，使用`&`合并。

#### handleClick

```ts
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = async e => {
    if (!props.onClick) return

    const promise = props.onClick(e)

    if (isPromise(promise)) {
      try {
        setInnerLoading(true)
        await promise
        setInnerLoading(false)
      } catch (e) {
        setInnerLoading(false)
        throw e
      }
    }
  }
```

`click`函数支持同步又支持异步的最佳实践。

#### useImperativeHandle

[useImperativeHandle](https://react.dev/reference/react/useImperativeHandle)来自己限制导出dom的api。

#### withNativeProps

```ts
import React, { AriaAttributes } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import classNames from 'classnames'

export type NativeProps<S extends string = never> = {
  className?: string
  style?: CSSProperties & Partial<Record<S, string>>
  tabIndex?: number
} & AriaAttributes

export function withNativeProps<P extends NativeProps>(
  props: P,
  element: ReactElement
) {
  const p = {
    ...element.props,
  }

  // 合并className
  if (props.className) {
    p.className = classNames(element.props.className, props.className)
  }

  // 合并style
  if (props.style) {
    p.style = {
      ...p.style,
      ...props.style,
    }
  }

  // 合并tabIndex
  if (props.tabIndex !== undefined) {
    p.tabIndex = props.tabIndex
  }

  // 合并 data- aria- 开头的html自定义属性
  for (const key in props) {
    if (!props.hasOwnProperty(key)) continue
    if (key.startsWith('data-') || key.startsWith('aria-')) {
      p[key] = props[key]
    }
  }
  return React.cloneElement(element, p)
}
```

props隔离，默认支持classnames/style/tabIndex/data-/aria-。

## 如何给开源库做贡献

看是否有公开的Contributing文档，如[Antd Contributing](https://ant.design/docs/react/contributing)，基于antd的文档看到

- [第一次贡献](https://ant.design/docs/react/contributing-cn#%E7%AC%AC%E4%B8%80%E6%AC%A1%E8%B4%A1%E7%8C%AE)
- [如何优雅地在github上贡献代码](https://segmentfault.com/a/1190000000736629)
- [Pull Request](https://ant.design/docs/react/contributing-cn#pull-request)
