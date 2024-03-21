---
author: "Roc"
title: "HOC"
date: "2021-03-14 18:18:31"
tags: [
    "React",
]
type: post
showTableOfContents: true
---

React中调用组件的时候可以在组件内写值，这时候会在组件中的`props.chilren`中显现，具体可参考[children in JSX](https://reactjs.org/docs/jsx-in-depth.html#children-in-jsx)。
但是这时候会有一个问题，无法给`children`传props。如下：

```jsx
function Child1() {
  return (
    <p>1</p>
  )
}

function Child2() {
  return (
    <p>2</p>
  )
}

function Father(props) {
  return (
    <div>
      {props.children}
    </div>
  )
}

function APP() {
  return () => (
    <Father>
      <Child1 />
      <Child2 />
    </Father>
  );
}
```

现在我们需要给在`Father`组件中给`Child1`和`Child2`传值。这个时候我们可以使用React的API实现，如下:

```js
function Father(props) {
  return (
    <div>
      {
        React.Children.map((child, index) => {
          if (!React.isValidElement(child)) {
            return null;
          }

          const childProps = {
            index,
          };

          return React.cloneElement(child, childProps);
        })
      }
    </div>
  )
}
```

简单解释一下上面代码，因为`props.children`不是一个数组，所以不能直接使用`map`方法，我们可以把它转成数组也可以直接使用`React.Children.map`。然后`React.cloneElement`会克隆一个组件，并且可以修改一些自定的props。

上面的写法只适用于一层级的`children`。不能嵌套如：

```jsx
<Father>
  <Fragment>
    <Child1 />
    <Child2 />
  </Fragment>
</Father>
```

如果是这样的层级那上面的写法的`props`就会只传递到`Fragment`上。要注意这个。
