+++
author = "Roc"
title = "HOC"
date = "2019-06-12 10:54:29"
tags = [
    "React",
]
+++

高阶组件是一个复用组件逻辑的高级用法，他不是react API的部分，而是react自然生态衍生出来的一种模式。

## 概述

具体的说，HOC(higher-order component)是一个函数，且该函数接受一个组件作为参数，并返回一个新的组件。

```js
const EnhancedComponent = higherOrderComponent(WrappedComponent);

export default EnhancedComponent;
```

## 作用

高阶组件的主要作用是解决交叉问题，如多个功能极其相似的组件可用高阶组件达到复用的目的。

## 约定

- **传递无关的props至包裹组件**

```js
render() {
  const { extraProp, ...passThroughProps } = this.props;
  const injectedProp = someStateOrInstanceMethod;

  // Pass props to wrapped component
  return (
    <WrappedComponent
      injectedProp={injectedProp}
      {...passThroughProps}
    />
  );
}
```

- **最大化可组合性**

有时候HOC接收多个参数，且HOC嵌套HOC如:

```js
// React Redux 的 `connect` 函数
const ConnectedComment = connect(commentSelector, commentActions)(CommentList);
```

这样看起来就很迷惑，可以使用`lodash`或者`ramda`的`compose`来解决

```js
const enhance = compose(
  withRouter,
  connect(commentSelector)
)
```

- **包装显示名称以便轻松调试**

HOC 创建的容器组件会与任何其他组件一样，会显示在 `React Developer Tools` 中。为了方便调试，请选择一个显示名称，以表明它是 `HOC` 的产物

最常见的方式是用 HOC 包住被包装组件的显示名称。比如高阶组件名为 `withSubscription`，并且被包装组件的显示名称为 `CommentList`，显示名称应该为 `WithSubscription(CommentList)：`

```js
function withSubscription(WrappedComponent) {
  class WithSubscription extends React.Component {/* ... */}
  WithSubscription.displayName = `WithSubscription(${getDisplayName(WrappedComponent)})`;
  return WithSubscription;
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
```

## 注意

- **高阶组件是一个没有副作用的纯函数，所以不要修改原组件，使用组合的形式。**

```js
function logProps(InputComponent) {
  InputComponent.prototype.componentWillReceiveProps = function(nextProps) {
    console.log('Current props: ', this.props);
    console.log('Next props: ', nextProps);
  };
  // The fact that we're returning the original input is a hint that it has
  // been mutated.
  return InputComponent;
}
```

- **不要在render函数中使用高阶函数**

- 必须将静态方法做拷贝

  当使用高阶组件包装组件，原始组件被容器组件包裹，也就意味着新组件会丢失原始组件的所有静态方法。

  解决这个问题的方法就是，将原始组件的所有静态方法全部拷贝给新组件：

  ```js
  function enhance(WrappedComponent) {
    class Enhance extends React.Component {/*...*/}
    // 必须得知道要拷贝的方法 :(
    Enhance.staticMethod = WrappedComponent.staticMethod;
    return Enhance;
  }
  ```

  这样做，就需要你清楚的知道都有哪些静态方法需要拷贝。你可以使用[hoist-non-react-statics](https://github.com/mridgway/hoist-non-react-statics)来帮你自动处理，它会自动拷贝所有非React的静态方法：

-------

## 注意

- Refs属性不能传递

## 参考

- The react official website, [✨ HOC](https://reactjs.org/docs/higher-order-components.html)
