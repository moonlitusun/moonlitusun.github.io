+++
author = "Roc"
title = "Hooks的原理"
date = "2020-08-12 21:59:12"
description = "Lorem Ipsum Dolor Si Amet"
tags = [
    "React",
]
categories = [
    "themes",
    "syntax",
]
series = ["Themes Guide"]
+++

## useState

`useState`的原理其实就是内部有一个记录状态的数组，通过调用顺序来存储值。

```js
const data = [];
let count = 0;

function render() {
  count = 0;

  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

export function useState(initVal) {
  const currCount = count;
  data[currCount] = data[currCount] || initVal;

  function setData(v) {
    data[currCount] = v;
    render();
  }

  count++;
  return [data[currCount], setData];
}
```

## useEffect

```js
import React from 'react';
import ReactDOM from 'react-dom';
import App from '../App';

const data = [];
let index = 0;

export function render() {
  index = 0;

  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

export function useEffect(callback, deps) {
  const currIndex = index;

  if (!data[currIndex]) {
    callback();
    data[currIndex] = deps;
  } else {
    if (data[currIndex].some(((item, index) => item === deps[index]))) {
      callback();
      data[currIndex] = deps;
    }
  }

  index++;
}
```

## 参考链接

- 掘金, [一文彻底搞懂react hooks的原理和实现](https://juejin.im/post/6844903975838285838)
- Medium, [React hooks: not magic, just arrays](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e)