---
author: "Roc"
title: "ESBoot开发笔记：执行命令"
date: "2024-08-12 23:40:29"
tags: [
    "ESBoot",
    "Node"
]
type: post
showTableOfContents: true
---

## ESBoot v2中执行内部命令的写法

`240807`

在v2的时候，执行命令我觉得写的很痛苦。使用的是`cross-spawn`，用法是这样的

```js
spawn.sync(
  searchCommand('stylelint'),
  ['**/*.scss', ...args],
  {
    stdio: 'inherit',
    shell: true,
  }
);
```

最关键的其实是`searchCommand`，因为当时我发现了一个问题，正常项目一级依赖的包中如果有`bin`的话都会放在顶层`node_modules`里面的`.bin`目录中，但是比如上面的命令，其实是`esboot`中的依赖，一般这种都会放在`esboot/node_modules`中的`.bin`目录中。之前yarn好像会全部提上来，但是pnpm是不会的。

我们执行命令的`cwd`其实都是在项目的根目录，所以如果直接调用这个命令是绝对找不到的，所以就要在`esboot`包中找到这个`bin`目录。之前是这样写的

```ts
export function searchCommand(currPath: string, command: string) {
  return joinExecPath(currPath, `./node_modules/.bin/${command}`);
}
```

```ts
import { searchCommand as baseSearchCommand } from '@dz-web/esboot-utils';
import { join } from 'path';

export function searchCommand(command: string) {
  return baseSearchCommand(join(__dirname, '../../'), command);
}
```

大概意思就是使用一个固定目录，然后再写相对目录，这样就可以找到`esboot`中的`bin`目录。这样算是勉强解决了找到`bin`目录的问题。

但是在`windows`下，使用`spawn`还有挺多问题，比如一些信号监听问题，又要自己去实现。

```ts
import spawn from 'cross-spawn';
import { searchCommand } from '@@/helpers/path';

export const isWins = process.platform === 'win32';

export function runExec(currPath: string, args: any[]) {
  const command = args.slice(0, 1)[0];
  const params = args.slice(1);

  const childProcess = spawn(searchCommand(currPath, command), params, {
    /**
     * FIXME: 此处的处理有一些问题
     *
     * 在mac上error使用inherit会导致子进程不退出，然后husky拦截不到报错，还能提交代码，所以手动监听了exit事件
     *
     * 在wins上面用inherit子进程可以触发拦截，但是看不到报错信息了，所以用了pipe。
     */
    stdio: ['inherit', 'inherit', isWins ? 'inherit' : 'pipe'],
    shell: true,
    cwd: process.cwd(),
  });

  // macos监听不会触发这里，wins上一个已知的问题就是husky触发拦截的时候，error里面会有一个信息就是ENOEN。
  childProcess.on('error', (err) => {
    console.error(`Failed to start child process: ${err}`);
    process.exit(1);
  });

  if (!isWins) {
    // let errorOutput = '';
    childProcess?.stderr?.on('data', (data) => {
      // errorOutput += data.toString()
      console.log(data.toString());
    });

    childProcess.on('exit', (code, signal) => {
      if (code !== 0) {
        // console.error(errorOutput)
        console.error(
          `exec ${command} failed with code ${code}, signal ${signal}`
        );
        process.exit(1);
      }
    });
  }
}
```

很麻烦整体，也不喜欢这种写法。

## 从获取包的实际位置得到启发

`20231120`

但是去年在写vitest插件的时候，有个功能是需要获取包的具体位置，之前是这样写的：

```ts
const modules = {
  vitest: require.resolve('vitest'),
  '@testing-library/react': require.resolve('@testing-library/react'),
  '@testing-library/user-event': require.resolve('@testing-library/user-event'),
};

const correctedModules: Record<string, string> = {};
for (const [moduleName, modulePath] of Object.entries(modules)) {
  let currentPath = modulePath;
  while (!currentPath.endsWith(`/${moduleName}`)) {
    currentPath = dirname(currentPath);
  }

  correctedModules[moduleName] = currentPath;
}
export const alias = correctedModules;
```

这样就是使用`require.resolve`去获取包的绝对路径，但是有个问题他会自动获取包的入口，比如`vitest/index.js`或者`vitest/dist/index.js`这样我才想着使用`dirname`获取他的上层，但是他的入口是根据`package.json`里面的`main`来的，所以层级说不好，赶时间就写了个递归往上寻找的方法。就在昨晚我研究`storybook`的时候发现了他的`.storybook/main.js`里面有一个这个函数.

```js
/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}
```

我一看简直了啊，不就是我上面实现那一坨容易有bug的操作吗，但是他们很聪明，是去找`package.json`的目录，铁定只用找一层。当时真的惊为天人，这个操作兴奋无比。

。。。

但是我试了下发现这个方法不是完美的，如果这个库自定设定了`exports`属性又没有导出`package.json`就会报错，比如`@testing-library/user-event`。

```sh
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './package.json' is not defined by "exports" in /Users/rocsun/Code/dz-library/esboot/_esboot-react/packages/plugin-vitest/node_modules/@testing-library/user-event/package.json
```

所以在这个上面又补充了一层。

```ts
function getAbsolutePath(libName: string) {
  try {
    return dirname(require.resolve(join(libName, 'package.json')));
  } catch (err) {
    let currentPath = require.resolve(libName);
    let isRootPath = false;
    // For windows path
    const compatibleLibName = libName.replace('/', hyphen);

    while (
      !currentPath.endsWith(`${hyphen}${compatibleLibName}`) &&
      !isRootPath
    ) {
      const path = dirname(currentPath);

      // Prevent endless loop
      if (currentPath !== path) {
        currentPath = path;
      } else {
        isRootPath = true;
      }
    }

    return currentPath;
  }
}
```

## BUG: windows上面死循环一直执行不下去

`2023-11-20`

打了debug才知道是下面这段代码

```ts
const modules = {
  vitest: require.resolve('vitest'),
  '@testing-library/react': require.resolve('@testing-library/react'),
  '@testing-library/user-event': require.resolve('@testing-library/user-event'),
};

const correctedModules: Record<string, string> = {};
for (const [moduleName, modulePath] of Object.entries(modules)) {
  let currentPath = modulePath;
  while (!currentPath.endsWith(`/${moduleName}`)) {
    currentPath = dirname(currentPath);
  }

  correctedModules[moduleName] = currentPath;
}
export const alias = correctedModules;
```

这段代码的本意是一直往上递归找到指定的目录，但是忽略了Windows上面的文件路径是`D:\\xx\\xx`这种，所以就一直找不到目录，就死循环了。所以要监听下Windows的。

修改后为：

```ts
const hyphen = process.platform === 'win32' ? '\\' : '/';

const correctedModules: Record<string, string> = {};
for (const [moduleName, modulePath] of Object.entries(modules)) {
  let currentPath = modulePath;
  let isRootPath = false;
  const compatibleModuleName = moduleName.replace('/', hyphen);
  while (
    !currentPath.endsWith(`${hyphen}${compatibleModuleName}`) &&
    !isRootPath
  ) {
    const path = dirname(currentPath);

    // 防止找到根目录死循环
    if (currentPath !== path) {
      currentPath = path;
    } else {
      isRootPath = true;
    }
  }

  correctedModules[moduleName] = currentPath;
}
```

## ESBoot v3中执行内部命令的写法

结合上面的经验，再加上中途看过一些库的源码之后发现很多用了[execa](https://github.com/sindresorhus/execa)这个库，所以就想着使用这个库来执行命令。

一顿研究之后发现非常好用，改用成了这样

```ts
// 因为要使用cjs的包，所以只能动态引入
const importExeca = import('execa');

interface ExecOptions {
  options?: Record<string, any>;
  onError?: (error: any) => void;
}

export const exec = async (
  args: string,
  { options = {}, onError }: ExecOptions = {}
) => {
  const { $ } = await importExeca;

  try {
    const result = await $({
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
      ...options,
    })`${args}`;

    return result;
  } catch (error) {
    if (onError) {
      onError(error);
    } else {
      throw error;
    }
  }
};
```

使用也很简单

```ts
export async function lint({ cwd }: { cwd: string }) {
  const args = process.argv.slice(3);
  exec(`${require.resolve('stylelint/bin/stylelint')} **/*.scss ${args}`, {
    onError: () => void 0,
  });
  // Special case for eslint
  exec(`eslint --ext .jsx,.js,.ts,.tsx ${resolve(cwd, 'src')} ${args}`, {
    onError: () => void 0,
  });
}
```

直接找到他的`bin`目录执行就好了，对`windows`也适用，但是不适用自己定义了`exports`的库。比如`eslint`，还好因为要适应`eslint`插件的原因，`eslint`的`bin`目录是放在顶层`node_modules`中的，所以可以找到。

而且我发现挺多库即使写了`exports`，也会主动导出`bin`目录，比如`lint-staged`这种，太好了。

暂时先用这种方案，虽然感觉还不太完美，很依赖包本身的导出策略，但是目前还没有发现更好的方式。
