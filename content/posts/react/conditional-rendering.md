---
author: "Roc"
title: "Conditional Rendering"
date: "2019-09-17 22:11:13"
tags: [
    "React",
]
type: post
showTableOfContents: true
---


## If/Else

```js
function IfElse():any {
  const [show] = useState(true);

  if (show) return 'This is a show message';
  return 'This is a hidden message';
}
```

## 三元运算符

可以使用三元运算符替代`if/else`代码块：

```js
function TernaryOperator():any {
  const [show] = useState(true);

  return show ? 'This is a show message of TernaryOperator' : 'This is a hidden message of TernaryOperator';
}
```

## 短路运算符

三元运算符在某些场景下可以更加简化。例如，当你要么渲染一个组件，要么不做渲染，你可以使用`&&`运算符。

不像`&`运算符，如果`&&`执行左侧的表达式就可以确认结果的话，右侧表达式将不会执行

```js
function ShortCircuitOperator():any {
  const [show] = useState(true);

  return ShortCircuitOperator && 'This is a show message of ShortCircuitOperator';;
}
```

但是这种有一个陷阱就是当`ShortCircuitOperator`为`0`的时候会渲染出来一个`0`出来。这是因为React只是会忽略`null` `false`和`undefined`的渲染。但是`ShortCircuitOperator === 0`也是一个假值，但是React又可以渲染出来，所以这种情况我们可以`!!(ShortCircuitOperator) && xx`强制转换成布尔值，也可以直接使用三元运算符。

详见[jsx-in-depth](https://reactjs.org/docs/jsx-in-depth.html#children-in-jsx)

## 自执行函数

三元运算符有时候会让人困扰，比如如下的复杂代码：

```js
return (
  <div>
    { condition1
      ? <Component1 />
      : ( condition2
        ? <Component2 />
        : ( condition3
          ? <Component3 />
          : <Component 4 />
        )
      )
    }
  </div>
);
```

很快，这些代码会变为一团乱麻，因此，有时候你需要一些其他技巧，比如：自执行函数。

顾名思义，自执行函数就是在定义以后会被立刻执行，没有必要显式地调用他们。

```js
function IIFE(): any {
  const [show] = useState(true);

  return (
    (() => {
      if (show) return 'This is a show message of IIFE';
      if (!show) return 'This is a hide message of IIFE';
    })()
  );
}
```

## 参考链接

- [8 React conditional rendering methods](https://blog.logrocket.com/conditional-rendering-in-react-c6b0e5af381e/)
- [conditional-rendering](https://reactjs.org/docs/conditional-rendering.html)
