---
author: "Roc"
title: "State"
date: "2019-08-12 10:20:33"
tags: [
    "React",
]
type: post
showTableOfContents: true
---

介绍state本地状态管理 跟 props

# 基本概念

[state](https://reactjs.org/docs/state-and-lifecycle.html)是用来驱动UI层的重新渲染, 而不用重复调用`ReactDom.render()`
它是react组件的本地状态管理，他跟props最大的不同是专门管理组件内部的值，可以自由修改。

```jsx
class Father extends PureComponent {
  state = {
    count: 5,
  };

  add = () => {
    this.setState({ count: this.state.count + 1 })
  }

  render() {
    const { count } = this.state;

    return (
      <>
        <div>
          {count}

          <button onClick={this.add}>
            Add
          </button>
        </div>
      </>
    )
  }
}
```

上面的例子可以 通过按钮更改 `count` 的值。

# class组件

## setState

`state`的更改通过`setState`方法

```jsx
this.setState({ count: this.state.count + 1 })
```

- 每执行一个`setState`都会触发一次渲染，但是通过下面的方法虽然会强行改变值，但是不会触发渲染，切勿使用。

```jsx
// Wrong
this.state.comment = 'Hello';

// Correct
this.setState({comment: 'Hello'});
```

- `setState`参数

```jsx
// 参数
setState(updater[, callback])

// e.g

// 1. 普通用法
this.setState({ xx: xx })

// 2. 函数参数用法
this.setState(]
  // updater
  (prevState, props) => {
    // prevState为旧值

    // return null 时候不会重新渲染
    return {};
  },
  // callback(re-rendered之后调用)
  (prevState, props) => {
    // this.state为新值
  },
)

// 3. 强制刷新
this.forceUpdate();
```

## setState异步更新

- `setState`可能是[异步](https://reactjs.org/docs/state-and-lifecycle.html#state-updates-may-be-asynchronous)的

为了性能，react可能会把一些集中更新放到一个batch队列中。如下：

```jsx
state = {
  a: -1;
}

this.setState({ a: 1 });
this.setState({ a: 2 });
this.setState({ a: 3 });

// a == 3
console.log(this.state.a); // -1
```

最后a的结果会变成3，但是会跳过上面的1和2赋值。所以`setState` 是异步执行的。每次setState都会放到一个batch批量处理队列中。所以会出现以下现象。

- **多次setState只算最后一次**。
- **在setState代码后面拿修改后的state值还没有改变**

## 为什么setState会设置成异步的呢？

具体可以参考Dan的回答[FClarification: why is setState asynchronous?
](https://github.com/facebook/react/issues/11527#issuecomment-360199710)

总结一下就是：

- 如果每次调用 setState都进行一次更新，那么意味着render函数会被频繁调用，界面重新渲染，这样效率是很低的；所以最好的办法应该是获取到多个更新，之后进行批量更新；

## setState一定是异步更新的吗？

其实也不是，如果我们在下面两种情况下使用就是同步的。

1.在setTimeout中更新

```jsx
changeText() {
  setTimeout(() => {
    this.setState({
      message: "你好啊"
    });
    console.log(this.state.message); // 你好啊
  }, 0);
}
```

2.原生DOM事件：

```jsx
componentDidMount() {
  const btnEl = document.getElementById("btn");
  btnEl.addEventListener('click', () => {
    this.setState({
      message: "你好啊"
    });
    console.log(this.state.message); // 你好啊
  })
}
```

# Hooks组件

## Hooks中的合并更新

其实hooks组件的状态和class组件差不多，只不过是实用`useState`来创建state。

hooks组件的更新也会被合并，所以也是异步的。有下面一个组件

```jsx
import { useState, useEffect } from 'react';

let count = 0;

function AutomaticBatchingState() {
  const [state1, setState1] = useState(1);
  const [state2, setState2] = useState(2);

  function update() {}
  
  useEffect(() => {
    count += 1;

    console.log(`更新了第${count}次`);
  });

  return (
    <div>
      <p>state1: {state1}</p>
      <p>state2: {state2}</p>
      <button onClick={update}>Update</button>
    </div>
  )
}

export default AutomaticBatchingState;
```

如果`update`函数是这样的

```js
function update() {
  setState1(Math.random());
  setState2(Math.random());
}
```

这样的两次更新会被React合并成一次更新，避免重复渲染。

但是如果是在原生事件(Promise/setTimeout/原生事件)中就会变成两次更新，如下：

```js
function update() {
  setTimeout(() => {
    setState1(Math.random());
    setState2(Math.random());
  }, 0)
}
```

## React18中的合并更新

这样就会导致我们的组件刷新多次，在React18中解决了这个问题，具体可以看[Automatic batching for fewer renders in React 18](https://github.com/reactwg/react-18/discussions/21)。但是注意必须要使用React18中的`createRoot`API。如下，把入口改成：

```js
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode>
  <App />
</React.StrictMode>);
```

这样再执行上面的操作就会发现，更新被合并了。

## React18中的不合并更新

有时候我们的需求就是不要合并更新，所以React提供了另外一个api给我们使用，`ReactDOM.flushSync()`。

```jsx
function update() {
  setTimeout(() => {
    flushSync(() => setState1(Math.random()));
    flushSync(() => setState2(Math.random()));
  }, 0)
}
```
