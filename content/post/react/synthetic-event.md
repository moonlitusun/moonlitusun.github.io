+++
author = "Roc"
title = "SyntheticEvent"
date = "2020-06-10 22:01:47"
tags = [
    "React",
]
+++

# 前言

**注意：** React17中把事件绑定源从`document`上转移到了`root`根元素上，详见<https://reactjs.org/blog/2020/10/20/react-v17.html>

React自己集成了一套合成事件系统(SyntheticEvent)，你在React中使用`onClick`等绑定的事件都会被React集成在一个事件系统，然后挂载在**document**元素上，然后使用**diapatchEvent**来分发¬º事件。

```js
document.addEventListener('click', diapatchEvent)
```

这种做法使用**事件委托**可以优化应用的性能。只绑定一个元素。但是也会使React中的事件流和正常的事件流有所不同。下面我们来探讨一下：

# React中的事件流

众所周知，DOM2级的事件流是`事件捕获 => 目标阶段 => 事件冒泡`，但是我们现在所有的事件都被React挂载在`document`中，那么事件流会怎么样呢？

看下面的一个例子：

```tsx
const EventFlowComp: React.FC = () => {
  const boxRef: any = useRef<HTMLDivElement | null>(null);

  const windowClickHandler = () => console.log('window');
  const documentClickHandler = () => console.log('document');
  const htmlClickHandler = () => console.log('html');
  const bodyClickHandler = () => console.log('body');
  const boxClickHandler = () => console.log('box');
  const reactBoxClickHandler = () => console.log('react-box');
  const targetClickHandler = () => console.log('target');

  useEffect(() => {
    const boxELement = boxRef.current;

    window.addEventListener('click', windowClickHandler, false);
    document.addEventListener('click', documentClickHandler, false);
    document.documentElement.addEventListener('click', htmlClickHandler, false);
    document.body.addEventListener('click', bodyClickHandler, false);
    boxELement.addEventListener('click', boxClickHandler, false)

    return () => {
      window.removeEventListener('click', windowClickHandler, false);
      document.removeEventListener('click', documentClickHandler, false);
      document.documentElement.removeEventListener('click', htmlClickHandler, false);
      document.body.removeEventListener('click', bodyClickHandler, false);
      (boxELement as HTMLDivElement).removeEventListener('click', boxClickHandler, false)
    };
  }, [])

  return (
    <div className="event-flow" ref={boxRef}>
      <div onClick={reactBoxClickHandler}>
        <span onClick={targetClickStopPropagationHandler}>
          span
        </span>
      </div>
    </div>
  )
}
```

我们主要看`targetClickHandler`函数的行为来观察react事件流：

## 不阻止冒泡

- 第一种情况:

没有任何操作，直接输出

```tsx
const targetClickHandler = (e: React.MouseEvent) => {
  console.log('target')
};
```

因为我们绑定的事件都是冒泡阶段触发，所以首次会依次触发`box`、`body`、`html`，然后到了React绑定事件的`document`元素上，开始分发React元素的事件，因为我们React事件也是绑定的冒泡，所以会首先触发`target`、再触发`react-box`。React事件执行完毕，就执行`document`本身，最后触发最顶端的事件`window`。所以我们点击按钮，会依次输出：

```js
box
body
html
target
react-box
document
window
```

## e.stopPropagation()

- 第二种情况：

```tsx
const targetClickHandler = (e: React.MouseEvent) => {
  e.stopPropagation();

  console.log('target')
};
```

这种情况，我们使用了`e.stopPropagation();`，注意此处的事件对象`e`是React内部的事件对象，所以前面的`box`、`body`、`html`，还是正常执行，主要是React内部事件会发生变化，`target`元素上面的所有事件都会被阻止，所以，`react-box`不会被触发。然后React在这个事件里面调用了原生的`e.stopPropagation();`。所以`document`上面的元素`window`也不会被触发。所以我们点击按钮，会依次输出：

```js
box
body
html
target
document
```

## e.nativeEvent.stopImmediatePropagation()

- 第三种情况：

```tsx
const targetClickHandler = (e: React.MouseEvent) => {
  e.nativeEvent.stopImmediatePropagation();

  console.log('target')
};
```

这种情况，我们直接调用原生的方法，所以只会`document`及其以上的会发生变化。这种情况会走正常流程输出`box`、`body`、`html`、`target`、`react-box`。然后走到了`document`以及`window`都会被禁用。所以点击按钮，会依次输出：

```js
box
body
html
target
react-box
```

## e.nativeEvent.stopPropagation()

- 第四种情况

```tsx
const targetClickHandler = (e: React.MouseEvent) => {
  e.nativeEvent.stopPropagation();

  console.log('target')
};
```

第四种情况和第三种非常相似，差距仅仅是一个会阻止`document`本身，一个不会，所以这种情况会依次输出：

```js
box
body
html
target
react-box
document
```

## 总结

综上所述，我们可以总结下这几个方法的区别

- `e.stopPropagation()`：这一个是React的事件对象阻止冒泡的方法，首先会阻止React自身的事件冒泡，然后也会调用`document`上面的原生`e.stopPropagation()`方法，阻止`window`。

- `e.nativeEvent.stopImmediatePropagation()`: 直接调用原生的事件，所以只会阻止`document`和`window`.

- `e.nativeEvent.stopPropagation()`：直接调用原生的事件，所以只会阻止`window`。

所以我们在React阻止冒泡，不能阻止`document`以下的DOM元素。如果想阻止，只能使用React的绑定事件。正常的阻止冒泡我们需要调用

```ts
e.stopPropagation();
e.nativeEvent.stopImmediatePropagation();
```

这样就会阻止`target`以上的所有React事件，以及`document`、`window`。

# FAQs

## 不能传递event下去

现象是把event传递下去被禁止了，但是自己试了下没有复现。。待观察
