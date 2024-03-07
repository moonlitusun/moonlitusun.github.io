+++
author = "Roc"
title = "Create-Umi-source-code"
date = "2023-12-20T19:47:49+08:00"
tags = [
    "Source-Code",
]
+++

很简单的一个库，主要的操作就是初始化项目，文档在[getting-started](https://umijs.org/docs/guides/getting-started)。

主要就三个文件

- `cli.ts`: `create-umi`命令的入口。
- `index.ts`: 主要逻辑。
- `template.ts`: 

# `cli.ts`

主要就是使用[yargs-parser](https://github.com/yargs/yargs-parser#readme)来注册命令，然后把除了`version`之外的所有的处理逻辑都交给`index.ts`。

# `index.ts`

主要逻辑在导出的`default`函数中，先是初始化了很多变量，`npm client`、`registry`、`name`、`gitInfo`，然后使用`@clack/core`来创建提示(之前看过分享这个库，UI比较好看)。然后弹出选择`App Template`、`NpmClient`、`registry`。

参数拿齐了之后就判断初始化项目的方案。

```ts
// --default
const useDefaultData = !!args.default;
// --template
const useExternalTemplate = !!args.template;

// 学习点：这里的写法还挺有意思的，反向`switch`，正常都是`switch`一个变量，这里使用`true`的话，就代替了很多的if else，因为这里不可能if return，下面还有要执行的代码。
switch (true) {
  case useExternalTemplate:
    await selectNpmClient();
    if (isCancel(npmClient)) {
      exitPrompt();
    }
    await selectRegistry();
    if (isCancel(registry)) {
      exitPrompt();
    }
    await unpackTemplate({
      template: args.template!,
      dest: target,
      registry,
    });
    break;
  // TODO: init template from git
  // case: useGitTemplate
  default:
    if (!useDefaultData) {
      await internalTemplatePrompts();
    }
}
```

## 学习到的点

- `switch true`代替`if else`
- `execa.execa`去执行命令。

```ts
const { stdout } = await execa.execa('pnpm', ['--version']);
```

# template
