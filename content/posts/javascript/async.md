---
author: "Roc"
title: "Async"
date: "2019-09-11 15:50:16"
tags: [
    "JavaScript",
]
type: post
showTableOfContents: true
---

ES7加入的`async`函数，终于让 JavaScript 对于异步操作有了终极解决方案。No more callback hell。

`async` 函数是`Generator`函数的语法糖。使用关键字`async`来表示，在函数内部使用`await`来表示异步。

**相较于`Generator`，`Async`函数的改进在于下面四点：**

- 内置执行器。`Generator`函数的执行必须依靠执行器，而`Aysnc`函数自带执行器，调用方式跟普通函数的调用一样

- 更好的语义。`async`和`await`相较于`*`和`yield`更加语义化

- 更广的适用性。`co`模块约定，`yield`命令后面只能是Thunk函数或`Promise`对象。而`async`函数的`await`命令后面则可以是`Promise`或者 原始类型的值（Number，string，boolean，但这时等同于同步操作）

- 返回值是`Promise`。`async`函数返回值是`Promise`对象，比`Generator`函数返回的`Iterator`对象方便，可以直接使用`then()`方法进行调用

## 语法

```js
async function getUserByAsync(){
  let user = await fetchUser();

  return user;
}

getUserByAsync()
  .then(v => console.log(v));
```

**凡是在`function`前面添加了`async`的函数在执行后都会自动返回一个`Promise`对象**

`await`必须在`async`函数里使用，不能单独使用

`async`函数内部return返回的值，会成为`then`方法回调函数的参数

```js
async function fn() {
  const promise1Value = await promise1();

  return promise1Value;
}

fn()
  .then(res => {
    console.log(res); // promise1Value
  })
```

**`async` 函数返回的 Promise 对象，必须等到内部所有的 await 命令的 Promise 对象执行完，才会发生状态改变**

```js
const delay = timeout => new Promise(resolve=> setTimeout(resolve, timeout));
async function f(){
  await delay(1000);
  await delay(2000);
  await delay(3000);
  return 'done';
}

f().then(v => console.log(v)); // 等待6s后才输出 'done'
```

**`await`后面需要跟`Promise`对象，不然就没有意义，而且`await`后面的`Promise`对象不必写`then`，因为`await`的作用之一就是获取后面`Promise`对象成功状态传递出来的参数。**

**正常情况下，await 命令后面跟着的是 Promise ，如果不是的话，也会被转换成一个 立即 resolve 的 Promise**

```js
async function  f() {
  return await 1
};

f().then( (v) => console.log(v)) // 1
```

## 错误处理

`async`函数抛出的错误会被`catch`捕获

```js
async function fn() {
  throw new Error('this is an error');
}

fn()
  .catch(err => {
    console.log(err); // this is an error
  })
```

**当`async`函数中只要一个`await`出现`reject`状态，则后面的`await`都不会被执行**

```js
let a;
async function f() {
    await Promise.reject('error');
    a = await 1; // 这段 await 并没有执行
}
f().then(v => console.log(a));
```

这样第一个只要`reject`, 那么这个函数基本算没用了，所以我们暂时可以使用`try/catch`来解决。

```js
// 正确的写法
let a;
async function correct() {
    try {
        await Promise.reject('error')
    } catch (error) {
        console.log(error);
    }
    a = await 1;
    return a;
}

correct().then(v => console.log(a)); // 1
```

这样一个`await`写一个`try/catch`非常麻烦，可以封装成一个函数

```js
async function errorCaptured(asyncFunc) {
  try {
    let res = await asyncFunc;
    return [null, res];
  } catch(err) {
    return [err, null];
  }
}
```

ts的写法

```ts
function awaitErrorCaptured<T, U = any>(promise: Promise<T>): Promise<[U | null, T | null]> {
 return promise
  .then<[null, T]>((data: T) => [null, data])
  .catch<[U, null]>(err => [err, null])
}
```

使用

```js
async function func() {
  let [err, res] = await errorCaptured(asyncFunc)
  if (err) {
      //... 错误捕获
  }
  //...
}
```

## async/await hell

```js
await firstFn(); // show off await magic!!
await secondFn(); // why am i waiting for firstFn?
await thirdFn(); // I am waiting for firstFn & secondFn
await fourthFn() // hold on, why are we waiting so much
await fifthFn() // ‘coz someone doesn't konw await correctly’
await sixthFn() // this is what hell look like ...
```

在实际使用中，避免这种地狱写法，可以使用下面的写法。

```js
Promise.all([firstFn, secondFn, ...])
  .then()
```

当如果真正我们需要上一个`promise`的值的话，再用`await`

```js
async function fn() {
  const firstFnResult = await firstFn();

  secondFn(firstFnResult);
}
```
