+++
author = "Roc"
title = "Redux Thunk源码解析"
date = "2021-06-01 22:10:48"
tags = [
    "React",
]
+++

Redux-thunk是一个redux的middleware，用来支持异步dispatch。

版本：`v2.3.0`

<!--more-->

# 动机

完整的动机说明可以直接看Dan Abramov在Stackoverflow的回答。

- [How to dispatch a Redux action with a timeout?](https://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559#35415559)

很详细的解释了为什么需要`Redux-thunk`。

下面我自己简单的总结一下：

假如我们有一个异步dispatch action的需求，正常我们会这样写：

```jsx
function App() {
  function asyncDispatch() {
    dispatch({ type: 'value', payload: '立即更新的逻辑' });

    setTimeout(() => {
      dispatch({ type: 'value', payload: '延时更新的逻辑' });
    }, 3000);
  }

  return (
    <div>
      <button onClick={() => asyncDispatch()}></button>
    </div>
  )
}
```

这样写是没有任何问题的，但是如果这个逻辑是复用的，需要再别的组件里面使用，我们就需要这样封装。

```js
function asyncDispatch(dispatch) {
  dispatch({ type: 'value', payload: '立即更新的逻辑' });

  setTimeout(() => {
    dispatch({ type: 'value', payload: '延时更新的逻辑' });
  }, 3000);
}
```

调用的时候要这样调用：

```jsx
asyncDispatch(dispatch);
```

这样写也是完全ok的。但是问题来了，首先我们需要传一个`dispatch`传过去，这样一来所有的异步操作都要接收一个`dispatch`过去，然后在`connect()`中也无法在生成一个`action creators`，因为`asyncDispatch`是一个函数且没有返回`Redux action`。而且，我们也要区分哪些action是同步的，哪些是异步的。

`Redux thunk`就是为了解决上面的问题而出现的，看下在`Redux thunk`中上面的逻辑是怎么写的：

```js
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

const store = createStore(
  reducer,
  applyMiddleware(thunk)
)
```

```js
function asyncDispatch(text) {
  return function (dispatch) {
    dispatch({ type: 'value', payload: text });

    setTimeout(() => {
      dispatch({ type: 'value', payload: '延时更新的逻辑' });
    }, 3000);
  }
}
```

然后，我们调用的时候只需：

```js
this.props.dispatch(asyncDispatch('立即更新的逻辑'));
```

在`connect()`中也可以这样写：

```jsx
export default connect(
  mapStateToProps,
  { asyncDispatch }
)(MyComponent)
```

其实，`Redux-thunk`就是赋予了Redux的`dispatch`接收函数的能力。然后这个函数会给出两个参数`dispatch`和`getState`。

所以说，说明白点`Redux thunk`出现的原因就是Redux的`dispatch`只接收`plain object`。而这，也是`Redux`故意为之，让外部可以自由扩展。

# 用法

`Redux-thunk`的用法非常简单。

```js
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

const store = createStore(
  reducer,
  applyMiddleware(thunk)
)
```

这样就赋予了`dispatch`能接收函数的能力。使用的时候：

```js
function asyncDispatch(text) {
  return function (dispatch, getState, otherArgument) {
    dispatch({ type: 'value', payload: text });
  }
}

this.props.dispatch(asyncDispatch('xx'));
```

- `dispatch`：redux的`dispatch`
- `getState`：redux的`getState`
- `otherArgument`：自定义的其他参数，要使用的话，生成middleware的时候要这样使用

```js
const api = "http://www.example.com/sandwiches/";
const whatever = 42;

const store = createStore(
  reducer,
  applyMiddleware(thunk.withExtraArgument({ api, whatever })),
);
```

然后使用的时候，就会出现在第三个参数里面。

```js
function fetchUser(id) {
  return (dispatch, getState, { api, whatever }) => {
    // you can use api and something else here
  };
}
```
