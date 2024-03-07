+++
author = "Roc"
title = "Promise"
date = "2019-08-24 10:06:16"
tags = [
    "JavaScript",
]
+++

Promise是ES6新加的一个功能，用来支持异步编程，在之前的异步操作，我们需要使用callback来处理，但是这会引起回调地域([callbackhell](http://callbackhell.com/))，
promise正是处理这个问题的。

## 什么是promise

ECMA委员会定义为：

```txt
A Promise is an object that is used as a placeholder for the eventual
results of a deferred (and possibly asynchronous) computation.
```

简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。

`Promise`对象有以下两个特点。

(1) 对象的状态不受外界影响。`Promise`对象代表一个异步操作，有三种状态：`pending`（进行中）、`fulfilled`（已成功）和`rejected`（已失败）。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。这也是`Promise`这个名字的由来，它的英语意思就是“承诺”，表示其他手段无法改变。

(2) 一旦状态改变，就不会再变，任何时候都可以得到这个结果。Promise对象的状态改变，只有两种可能：从`pending`变为`fulfilled`和从`pending`变为`rejected`。只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果，这时就称为 `resolved`（已定型）。如果改变已经发生了，你再对`Promise`对象添加回调函数，也会立即得到这个结果。这与事件（Event）完全不同，事件的特点是，如果你错过了它，再去监听，是得不到结果的。

Promise也有一些缺点。首先，无法取消`Promise`，一旦新建它就会立即执行，无法中途取消。其次，如果不设置回调函数，`Promise`内部抛出的错误，不会反应到外部。第三，当处于`pending`状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

## 使用promise

promise基本代码

```js
const myPromise = new Promise((resolve, reject) => {
    if (Math.random() * 100 <= 90) {
        resolve('Hello, Promises!');
    }

    reject(new Error('In 10% of the cases, I fail. Miserably.'));
});
```

`promise`接收一个函数作为参数，该函数有两个参数，这两个参数分别是`reject`和`resolve`，它们是两个函数，由 JavaScript 引擎提供，不用自己部署。

`resolve()`代表操作已经完成且成功，接收一个成功值参数(只接收一个单参数)，在异步操作成功时调用，并将异步操作的结果，作为参数传递出去。

`reject()`代表操作已经完成但是失败了。接收一个失败值参数(只接收一个单参数)，在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。`reject()`接收任何值，但是还是推荐传递一个`Error`对象来帮助调试。

`promise`新建后就会立即执行。

一般来说，调用`resolve`或`reject`以后，`Promise` 的使命就完成了，后继操作应该放到`then`方法里面，而不应该直接写在`resolve`或`reject`的后面。所以，最好在它们前面加上`return`语句，这样就不会有意外。

```js
new Promise((resolve, reject) => {
  return resolve(1);
  // 后面的语句不会执行
  console.log(2);
})
```

## Promise.then

`Promise` 实例具有then方法，也就是说，`then`方法是定义在原型对象`Promise.prototype`上的。它的作用是为`Promise` 实例添加状态改变时的回调函数。

`Promise`实例生成后，可以用`then`方法分别制定`resolved`状态和`rejected`状态的回调函数.

`then`方法可以接受两个回调函数作为参数，第一个回调函数是`Promise`对象的状态变成`resolved`时调用，第二个回调函数是`Promise`对象的状态变为`rejected`时调用。其中，第二个函数是可选的，不一定要提供。这两个函数都接收`Promise`对象传出的值作为参数。

```js
const myPromise = new Promise((resolve, reject) => {
  if (Math.random() * 100 <= 90) {
      resolve('Hello, Promises.them method!');
  }

  reject(new Error('i am an error'));
});

myPromise
  .then(
    res => {
      console.log(res); // when resolved, print Hello, Promises.them method!
    },
    error => {
      console.log(error); // when rejected, Error: i am an error
    }
  )
```

`then`方法返回的是一个新的`Promise`实例（注意，不是原来那个`Promise`实例）。因此可以采用链式写法，即`then`方法后面再调用另一个`then`方法。

```js
myPromise
  .then(
    res => {
      console.log(res);
      return 'i am a new Promise';
    },
    error => {
      console.log(error);
      return 'i am a new Error Promise';
    }
  )
  .then(res => {
    console.log(res); // i am a new Promise 或 i am a new Error Promise
  })
```

除了第一个`then`方法是接收原`Promise`构造函数的回调作为参数外其他都是都是通过链式。

**要注意的是此处的error函数只会接受原Promise抛出的错误，所有如果在res中有错误就无法捕捉到，所以建议不要使用第二个参数的方式，而采用下面的catch()方法**

## Promise.catch

`Promise.prototype.catch`方法是`.then(null, rejection)`或`.then(undefined, rejection)`的别名，用于指定发生错误时的回调函数。

```js
getJSON('/posts.json').then(function(posts) {
  // ...
}).catch(function(error) {
  // 处理 getJSON 和 前一个回调函数运行时发生的错误
  console.log('发生错误！', error);
});
```

`catch`方法不仅能捕捉`Promise`中的错误也能捕捉上面的`then`方法抛出的错误。

```js
const myPromise = new Promise((resolve, reject) => {
  resolve('this is promise.catch example');
})

myPromise
  .then(res => {
    console.log(res);

    throw new Error('this is then\'s roor');
  })
  .catch(error => {
    console.log(error);
  })
```

上面的例子中，`catch`捕捉到了第一个then方法抛出的错误，所以一般来说，不要在`then`方法里面定义 `Reject` 状态的回调函数（即`then`的第二个参数），总是使用`catch`方法，因为`catch`既能捕捉`Promise`的错误也能捕捉`then`里面的错误。

```js
// bad
promise
  .then(function(data) {
    // success
  }, function(err) {
    // error
  });

// good
promise
  .then(function(data) { //cb
    // success
  })
  .catch(function(err) {
    // error
  });
```

跟传统的`try/catch`代码块不同的是，如果没有使用`catch`方法指定错误处理的回调函数，`Promise` 对象抛出的错误不会传递到外层代码，即不会有任何反应。

```js
const someAsyncThing = function() {
  return new Promise(function(resolve, reject) {
    // 下面一行会报错，因为x没有声明
    resolve(x + 2);
  });
};

someAsyncThing().then(function() {
  console.log('everything is great');
});

setTimeout(() => { console.log(123) }, 2000);
// Uncaught (in promise) ReferenceError: x is not defined
// 123
```

上面代码中，`someAsyncThing`函数产生的 `Promise` 对象，内部有语法错误。浏览器运行到这一行，会打印出错误提示`ReferenceError: x is not defined`，但是不会退出进程、终止脚本执行，2 秒之后还是会输出123。这就是说，`Promise` 内部的错误不会影响到 Promise 外部的代码，通俗的说法就是“Promise 会吃掉错误”。

一般总是建议，`Promise`对象后面要跟`catch`方法，这样可以处理 `Promise`
内部发生的错误。`catch`方法返回的还是一个 `Promise` 对象，因此后面还可以接着调用`then`方法。

`Promise` 对象的错误具有“冒泡”性质，会一直向后传递，直到被捕获为止。也就是说，错误总是会被下一个`catch`语句捕获。

## promise.finally

`finally`方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。该方法是 ES2018 引入标准的。

```js
promise
.then(result => {···})
.catch(error => {···})
.finally(() => {···});
```

`finally`方法的回调函数不接受任何参数，这意味着没有办法知道，前面的 `Promise` 状态到底是`fulfilled`还是`rejected`。这表明，`finally`方法里面的操作，应该是与状态无关的，不依赖于 `Promise` 的执行结果。

```js
const myPromise = new Promise((resolve, reject) => {
  resolve('this is promise.catch example');
})

myPromise
  .then(res => {
    console.log(res);

    return 'this is from then';
  })
  .catch(error => {
    console.log(error);
  })
  .finally(res => {
    console.log(res); // undefined
    console.log('finally');
  })
```

`Promise`会返回原来的值

```js
// resolve 的值是 undefined
Promise.resolve(2)
  .then(res => res)
  .finally() // finally没有返回值，没有影响
  .then(res => {
    console.log(res); // 2
  })
```

## Promise.all

`Promise.all`方法用于将多个 Promise 实例，包装成一个新的 `Promise` 实例

```js
const p = Promise.all([p1, p2, p3]);
```

p的状态由p1、p2、p3决定，分成两种情况。

（1）只有p1、p2、p3的状态都变成fulfilled，p的状态才会变成fulfilled，此时p1、p2、p3的返回值组成一个数组，传递给p的回调函数。

（2）只要p1、p2、p3之中有一个被rejected，p的状态就变成rejected，而不管其他`promise`是否完成，此时第一个被reject的实例的返回值，会传递给p的回调函数。

注意，如果作为参数的 Promise 实例，自己定义了`catch`方法，那么它一旦被`rejected`，并不会触发`Promise.all()`的`catch`方法,但是如果每个方法内部没有`catch`方法就会调用`Promise.all()`的`catch`方法。

## Promise.allSettled

- [Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)

**该方法处于stage-4阶段，所以会在es2020纳入标准**

鉴于`promise.all()`方法的短路特性(只要有一个`promise`变成`reject`就会直接返回，后面的`promise`不管了)，在多数情况下并不符合。所以`Promise.allSettled`跟`Promise.all`类似, 其参数接受一个`Promise`的数组, 返回一个新的`Promise`, 唯一的不同在于, 其不会进行短路, 也就是说当`Promise`全部处理完成后我们可以拿到每个`Promise`的状态, 而不管其是否处理成功.

```js
Promise.allSettled([
  Promise.resolve('a'),
  Promise.reject('b'),
])
.then(arr => assert.deepEqual(arr, [
  { status: 'fulfilled', value:  'a' },
  { status: 'rejected',  reason: 'b' },
]));
```

## Promise.race

Promise.race方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例。

```js
const p = Promise.race([p1, p2, p3]);
```

上面代码中，只要p1、p2、p3之中有一个实例率先改变状态，p的状态就跟着改变。那个率先改变的 `Promise` 实例的返回值，就传递给p的回调函数。

`Promise.race`方法的参数与Promise.all方法一样，如果不是 `Promise` 实例，就会先调用下面讲到的`Promise.resolve`方法，将参数转为 `Promise` 实例，再进一步处理。

可以利用`race`来做`fetch`的timeout.

```js
const p = Promise.race([
  fetch('/resource-that-may-take-a-while'),
  new Promise(function (resolve, reject) {
    setTimeout(() => reject(new Error('request timeout')), 5000)
  })
]);

p
.then(console.log)
.catch(console.error);
```

上面代码中，如果 5 秒之内`fetch`方法无法返回结果，变量p的状态就会变为`rejected`，从而触发`catch`方法指定的回调函数。

## Promise.resolve

有时需要将现有对象转为 Promise 对象，`Promise.resolve`方法就起到这个作用。

```js
const jsPromise = Promise.resolve($.ajax('/whatever.json'));
```

`Promise.resolve`等价于下面的写法。

```js
Promise.resolve('foo')

// 等价于
new Promise(resolve => resolve('foo'))
```

`Promise.resolve`方法的参数分成四种情况。.

**（1）参数是一个 Promise 实例**

如果参数是 `Promise` 实例，那么`Promise.resolve`将不做任何修改、原封不动地返回这个实例。

```js
const case1 = new Promise(resolve => resolve('case1'));

Promise.resolve(case1)
  .then(res => {
    console.log(res); // case1
  })
```

**（2）参数是一个`thenable`对象**

`thenable`对象指的是具有`then`方法的对象。`Promise.resolve`方法会将这个对象转为 `Promise` 对象，然后就立即执行`thenable`对象的`then`方法。

```js
let thenable = {
  then: function(resolve, reject) {
    resolve(42);
  }
};

let p1 = Promise.resolve(thenable);
p1.then(function(value) {
  console.log(value);  // 42
});
```

**（3）参数不是具有then方法的对象，或根本就不是对象**

如果参数是一个原始值，或者是一个不具有`then`方法的对象，则`Promise.resolve`方法返回一个新的 `Promise` 对象，状态为`resolved`。

```js
const p = Promise.resolve('Hello');

p.then(function (s){
  console.log(s)
});
// Hello
```

上面代码生成一个新的 `Promise` 对象的实例`p`。由于字符串`Hello`不属于异步操作（判断方法是字符串对象不具有 `then` 方法），返回 `Promise` 实例的状态从一生成就是`resolved`，所以回调函数会立即执行。`Promise.resolve`方法的参数，会同时传给回调函数。

**（4）不带有任何参数**

`Promise.resolve()`方法允许调用时不带参数，直接返回一个`resolved`状态的 `Promise` 对象。

所以，如果希望得到一个 `Promise` 对象，比较方便的方法就是直接调用`Promise.resolve()`方法。

需要注意的是，立即`resolve()`的 `Promise` 对象，是在本轮“事件循环”（event loop）的结束时执行，而不是在下一轮“事件循环”的开始时。

```js
setTimeout(function () {
  console.log('three');
}, 0);

Promise.resolve().then(function () {
  console.log('two');
});

console.log('one');

// one
// two
// three
```

上面代码中，`setTimeout(fn, 0)`在下一轮“事件循环”开始时执行，`Promise.resolve()`在本轮“事件循环”结束时执行，`console.log('one')`则是立即执行，因此最先输出。

## Promise.reject

`Promise.reject(reason)`方法也会返回一个新的 `Promise` 实例，该实例的状态为`rejected`。

注意，`Promise.reject()`方法的参数，会原封不动地作为`reject`的理由，变成后续方法的参数。这一点与`Promise.resolve`方法不一致。

```js
const thenable = {
  then(resolve, reject) {
    reject('出错了');
  }
};

Promise.reject(thenable)
.catch(e => {
  console.log(e === thenable)
})
// true
```

上面代码中，`Promise.reject`方法的参数是一个`thenable`对象，执行以后，后面`catch`方法的参数不是`reject`抛出的“出错了”这个字符串，而是`thenable`对象。

## 短路特性

`Promise.all()` 和 `promise.race()` 都具有 短路特性

- **Promise.all()**： 如果参数中  promise 有一个失败（rejected），此实例回调失败（reject）

- **Promise.race()**：如果参数中某个promise解决或拒绝，返回的 promise就会解决或拒绝。

## 使用技巧

1.使用`Promise.race()`做请求超时

```js
const p = Promise.race([
  fetch('/resource-that-may-take-a-while'),
  new Promise(function (resolve, reject) {
    setTimeout(() => reject(new Error('request timeout')), 5000)
  })
]);
```

如果请求接口超出5秒，就`reject`，代表请求超时。

2.使用`promise.then()`构建顺序执行异步任务

```js
let sequence = Promise.resolve();

[promise1, promise2, promise3].forEach(item => {
  sequence = sequence.then(//deal item)
});

// 上面的代码等于
const sequence = Promise.resolve()
  .then(),
  .then(),
  .then();
```

封装成函数

```js
function queue(arr) {
  var sequence = Promise.resolve();

  arr.forEach(function (item) {
    sequence = sequence.then(item);
  })

  return sequence;
}

// 执行队列
queue([a, b, c])
  .then(data => {
    console.log(data);
  })
```

## 参考链接

- [✨ Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), MDN
- [✨ A Simple Guide to ES6 Promises](https://codeburst.io/a-simple-guide-to-es6-promises-d71bacd2e13a), Brandon Moreli
- [✨ Promise](https://es6.ruanyifeng.com/?search=promise&x=0&y=0#docs/promise), 阮一峰
- [✨ 你不知道的js，中卷](#_)

## 其他链接

- [✨ promise-fun](https://github.com/sindresorhus/promise-fun)

  各种好玩的promise