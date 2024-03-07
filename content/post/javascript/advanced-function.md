+++
author = "Roc"
title = "Function的进阶用法"
date = "2019-01-21 13:58:29"
tags = [
    "JavaScript",
]
+++

## IIFE

### 概述

自执行函数就是一个立即执行的函数，英语是`Immediately Invoked Function Expression`,缩写为`IIFE`。

### 如何定义一个自执行函数

如何写一个自执行函数呢，有下面两种方法。

第一种方式，使用特殊的符号，如下

```js
  void function() {
    console.log(1);
  }()
```

除了`void`之外，还可以用`+` | `-` | `!`。

第二种方式是使用括号，推荐使用这种方式。

```js
(function() {
  console.log(1);
}())

(function() {
  console.log(1);
})()
```

## 偏函数

固定一个函数的一些参数，然后产生另一个更小元的函数。

**普通函数**

```js
function fn(x, y, z) {
  return x + y + z;
}

fn(1, 2, 3) // 6
fn(1, 3, 4) // 8
fn(1, 4, 5) // 10
```

以上函数有一个共同参数`1`,把函数转换为偏函数

```js
function partial(x) {
  return function fn(y, z) {
    return x + y + z;
  }
}

const func = new partial(1);

func(2, 3) // 6
func(3, 4) // 8
func(4, 5) // 10
```

固定了你函数的某一个或几个参数，返回一个新的函数，接收剩下的参数, 参数个数可能是1个，也可能是2个，甚至更多。

## 函数柯里化

在数学和计算机科学中，柯里化是一种将使用多个参数的一个函数转换成一系列使用一个参数的函数的技术

```js
function curry(fn, ...args) {
  const len = fn.length;

  return function wrap(...rest) {
    const paramsList = [].concat(...args, ...rest);

    if (paramsList.length < len) {
      return curry.call(this, fn, paramsList);
    } else {
      return fn.apply(this, paramsList);
    }

  }
}

function sum(a, b, c) {
  return a + b + c;
}

const curried = curry(sum);

console.log(curried(2)(6)(8));
```

柯理化是把一个有n个参数的函数变成n个只有1个参数的函数

---

## 反柯里化

反柯里化的作用在与扩大函数的适用性，使本来作为特定对象所拥有的功能的函数可以被任意对象所用.

```js
obj.func(arg1, arg2);
```

转换成一个函数形式，

```js
func(obj, arg1, arg2);
```

实现

```js
Function.prototype.uncurrying = function() {
  var that = this;

  return function() {
      return Function.prototype.call.apply(that, arguments);
  }
};
```

```js
var uncurrying= function (fn) {
  return function () {
    return Function.prototype.call.apply(fn,arguments);
  }
};
```

## 组合

```js
function compose(funcs) {
  const start = funcs.length - 1;

  return function(...args) {
    let i = start;
    let result = funcs[start].apply(this, args);
    while (i--) result = funcs[i].call(this, result);
    return result;
  }
}

function toUpperCase(str) {
  return str.toUpperCase();
}

function join(name) {
  return `hello, ${name}`;
}

console.log(toUpperCase(join('jacky')))

// 函数组合

const fn = compose(toUpperCase, join);

console.log(fn('tom'))
```

## 尾调用优化

函数的最后一步调用另外一个函数，叫做尾调用。

尾调用由于是函数的最后一步操作，所以不需要保留外层函数的调用帧，因为调用位置、内部变量等信息都不会再用到了，只要直接用内层函数的调用帧，取代外层函数的调用帧就可以了。

```js
function f(x){
  return g(x);
}
```

1. 调用后还有赋值操作
2. 调用后还有其他操作
3. 不是`return`的

以上都不算尾调用

## 惰性函数

函数永远只返回第一次判断的条件，原理是重写函数

DOM 事件添加中，为了兼容现代浏览器和 IE 浏览器，我们需要对浏览器环境进行一次判断：

```js
// 简化写法
function addEvent (type, el, fn) {
  if (window.addEventListener) {
    el.addEventListener(type, fn, false);
  }
  else if(window.attachEvent){
    el.attachEvent('on' + type, fn);
  }
}
```

问题在于我们每当使用一次 addEvent 时都会进行一次判断。

利用惰性函数，我们可以这样做：

```js
function addEvent (type, el, fn) {
  if (window.addEventListener) {
    addEvent = function (type, el, fn) {
      el.addEventListener(type, fn, false);
    }
  }
  else if(window.attachEvent){
    addEvent = function (type, el, fn) {
      el.attachEvent('on' + type, fn);
    }
  }
}
```

当然我们也可以使用闭包的形式：

```js
var addEvent = (function(){
  if (window.addEventListener) {
    return function (type, el, fn) {
      el.addEventListener(type, fn, false);
    }
  }
  else if(window.attachEvent){
    return function (type, el, fn) {
      el.attachEvent('on' + type, fn);
    }
  }
})();
```

当我们每次都需要进行条件判断，其实只需要判断一次，接下来的使用方式都不会发生改变的时候，想想是否可以考虑使用惰性函数。

## 闭包

### 变量的作用域

JavaScript中的变量分为两种，一种是全局变量，一种是局部变量。

在函数中可以直接读取全局变量。

```js
const num = 5;

function getNum() {
  return num;
}

getNum(); // 5
```

但是，函数外部无法读取函数内部的变量，这个过程是不可逆的，下一级的作用域只能读取上面的作用域的变量。这就是Javascript语言特有的"链式作用域"结构（chain scope），子对象会一级一级地向上寻找所有父对象的变量。所以，父对象的所有变量，对子对象都是可见的，反之则不成立。

### 如何在全局中读取函数内的局部变量

为了读取函数中的变量，按照变量作用规则，我们只能在下一级的函数中才能读取上一级的变量，所以，我们在函数内部再定义一个函数。

```js
function fn() {
  const num = 5;

  function fn2() {
    console.log(num);
  }
}
```

这样写我们就能在`fn2`函数中读取`fn`中的变量，但是这样并不是我们想要的，我们要的是要在全局中读取到这个值，所以我们可以把`fn2`返回出去。

```js
function fn() {
  const num = 5;

  return function fn2() {
    console.log(num);
  }
}
```

这样就可以在全局中使用到`fn`中的变量。

### 闭包的概念

上面的`fn2`函数就是闭包。

> 阮一峰的理解是：闭包就是能够读取其他函数内部变量的函数

由于在JavaScript中，只有函数的子函数才能读取函数的变量。所以可以把闭包简单理解成一个定在函数内部的函数。

所以，本质上，闭包就是连接函数内部和外部的桥梁。

### 闭包的用途

- 管理私有变量和私有方法，将对变量（状态）的变化封装在安全的环境中, 如迭代器、生成器

定义一个全局变量，不管在任何地方都可以改变，假如需要一个私密的变量，只允许外部读取，那么可以使用闭包。

- 在内存中维持变量：如缓存数据，函数柯里化

正常情况下，JavaScript函数中的变量在函数被调用后就会被销毁，如：

```js
function add() {
  const a = 5;

  return a + 1;
}

add(); // 6
add(); // 6
```

上面的函数不管调用多少次都是6，因为不管调用多少次，`a`都会被销毁再重新赋值。

但是如果使用闭包，变量就会一直存在于内存中，不会被销毁，如：

```js
function add() {
  let a = 5;

  return function add2() {
    a += 1;
    return a;
  }
}

const add2 = add();

add(); // 6
add(); // 7
```

上面的函数，每次的值都不一样，这证明`a`的值并没有再调用后被销毁。

为什么会这样呢？原因是`add`是`add2`的父函数，而`add2`被赋值给一个全局变量，这导致`add2`一直在内存中，而`add2`依赖于`add1`，所以`add1`也就一直始终在内存中，不会在调用结束后，被垃圾回收机制（garbage collection）回收。

### 使用闭包的注意点

如上面所说的，闭包会使变量一直存在于内存中，所以内存消耗很大，所以不能滥用闭包，否则会造成网页的性能问题，在IE中可能导致内存泄露。解决方法是，在退出函数之前，将不使用的局部变量全部删除。

闭包会在父函数外部，改变父函数内部变量的值。所以，如果你把父函数当作对象（object）使用，把闭包当作它的公用方法（Public Method），把内部变量当作它的私有属性（private value），这时一定要小心，不要随便改变父函数内部变量的值。