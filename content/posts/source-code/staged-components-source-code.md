---
author: "Roc"
title: "Staged Components Source Code"
date: "2023-04-09T08:28:42+08:00"
tags: [
    "Source-Code",
]
type: post
showTableOfContents: true
---


# 简述

```yml
github: <https://github.com/private-fork-repos/staged-components>
about: Make React function component staged.
desc: react hooks只能放在顶层，这个库很短小的一个库，打破了这个规则。
```

# 工程化

项目非常小，所以没什么工程化可以研究，主要的就是用了gulp打包，@testing-library做测试。

# Npm Scripts

```json
{
   "scripts": {
    "build": "gulp prebuild && tsc",
    "test": "jest"
  },
}
```

## build

可以看到主要是分两步，一个是gulp，一个是tsc。

gulp里面代码也很简单。

- 清除产物目录lib。
- copy package.json等文件到lib目录。

src里面的代码使用tsc转译成js。

# package.json

没有什么值得说的。

# 源码部分

src目录

```txt
.
├── __tests__
|   └── main.test.tsx
└── index.tsx
```

## index.tsx

所有的源码都在这一个文件里。

### 用法

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

可以看到其实staged接收了一个函数，有会返回null，有可能返回真正的react组件。

根据代码可以猜测`staged`的做法就是当返回null的时候就把下面真正的组件给缓存(stage)起来不执行。下面看一下核心代码。

### 核心代码

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
  // stage才是用户真正的函数组件
  stage: StageRenderRootWithRef<P, R>,
) {
  return function Staged(props, ref) {
    // 这里先把用户的组件给缓存起来
    // 这里拿到stage函数的返回值，根据上面的demo可以知道有可能是null或者真正的react组件也可能是stage函数。
    // 把结果传递给 processNext
    const next = stage(props, ref)

    return processNext(next)
  } as FC<P>
}
```
