---
author: "Roc"
title: "Use dsbridge to implement webview communication"
date: "2025-04-21 04:02:06"
tags: [
    "Flutter",
]
type: post
showTableOfContents: true
---

## 背景

源于最近的一次分享，`webview` 的通信问题，因为研究过原生 `android` 和 `iOS` 的 `javascriptBridge` 实现，所以就想着实现下 `Flutter` 的 `webview` 通信。

## 效果

最终实现的效果为：

<video src="https://moonlit.vip/images/flutter-dsbridge-example.mp4" controls></video>

## 使用到的工具

- [dsbridge](https://pub.dev/packages/dsbridge_flutter)
- [webview_flutter](https://pub.dev/packages/webview_flutter)
- [getx](https://pub.dev/packages/get)

## 思考

其实 `Webview` 的通信都很简单，都是嵌入页面调用宿主页面等回调，或者是宿主页面调用嵌入页面的方法。就是一个双向的通信，只不过每个平台有不同的实现方式，但是最终的最小思想都是一样的。

在 `Flutter` 中，使用 `dsbridge` 来实现 `Webview` 的通信。选用 `dsbridge` 的原因是，`dsbridge` 是 `Flutter` 社区中比较成熟的 `Webview` 通信库，而且使用也比较简单。并且他还有 `iOS` 和 `Android` 的实现。

最终想实现的最小效果为：

- 嵌入页面初始化完成调用宿主页面的`getUserInfo`信息
- 嵌入页面有一个按钮，点击按钮后，调用宿主页面的`getUserInfo`信息
- 宿主页面有一个按钮，点击更新`userInfo`信息，主动通过`updateUserInfo`方法通知嵌入页面更新数据
- 嵌入页面再次点击按钮，也可主动获取到最新的`userInfo`信息

## 实现

### 初始化JS API类

```dart
import 'package:dsbridge_flutter/dsbridge_flutter.dart';
import 'dart:async';
import 'package:get/get.dart';
import '../pages/main/controllers/data.dart';

class JsBridge extends JavaScriptNamespaceInterface {
  final dataController = Get.find<DataController>();

  @override
  void register() {
    registerFunction(getUserInfo, functionName: 'getUserInfo');
  }

  void getUserInfo(dynamic params, CompletionHandler handler) {
    Timer(const Duration(seconds: 2), () {
      try {
        final Map<String, dynamic> result = {
          'success': true,
          'data': {
            ...dataController.userInfo,
          },
          'requestParams': params,
        };
        handler.complete(result);
      } catch (e) {
        handler.complete({'success': false, 'error': e.toString()});
      }
    });
  }
}
```

上面注册了一个`getUserInfo`的异步函数，通过`Timer`模拟了一个异步操作，2秒后返回结果。

其实所有的交互都是差不多的，包括同步行为，都是必须要在`register`中注册。

### 创建view

#### 初始化平台

```dart
void _initPlatform() {
  late final PlatformWebViewControllerCreationParams params;
  if (WebViewPlatform.instance is WebKitWebViewPlatform) {
    params = WebKitWebViewControllerCreationParams(
      allowsInlineMediaPlayback: true,
      mediaTypesRequiringUserAction: const <PlaybackMediaTypes>{},
    );
  } else {
    params = const PlatformWebViewControllerCreationParams();
  }

  _dWebViewController = DWebViewController.fromPlatformCreationParams(params);

  if (_dWebViewController.platform is AndroidWebViewController) {
    AndroidWebViewController.enableDebugging(true);
    (_dWebViewController.platform as AndroidWebViewController)
        .setMediaPlaybackRequiresUserGesture(false);
  }
}
```

#### 初始化webview

```dart
final String _initialUrl = 'http://192.168.31.123:8100/';

void _initWebView() {
  _dWebViewController = DWebViewController();

  if (WebViewPlatform.instance != null) {
    _dWebViewController
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
              _hasError = false;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            setState(() {
              _hasError = true;
              _errorMessage = 'Load error: ${error.description}';
              _isLoading = false;
            });
          },
        ),
      )
      ..loadRequest(Uri.parse(_initialUrl));
  }

  // 在这里初始化jsbridge
  JsBridgeHelper.initJsBridge(_dWebViewController);
}
```

#### UI

使用`WebViewWidget` widget来创建webview，传入上面创建的`_dWebViewController`。

```dart
WebViewWidget(
  controller: _dWebViewController,
),
```

要记住创建的时候不要使用`WebViewController`，而是使用`DWebViewController`。

## web界面

web界面就相对简单了，使用`react`构建。

先下载`dsbridge`的`js`库，然后引入到项目中。

```sh
pnpm install dsbridge
```

代码：

```tsx
import dsBridge from 'dsbridge';
import { useEffect } from 'react';

interface UserInfo {
  bcanStatus: string;
  bindTrade: boolean;
  isLogin: boolean;
  mobile: string;
  nickName: string;
  orgCode: string;
  sessionCode: string;
  sessionId: string;
  tradingAccSeq: string;
  userId: string;
  financierType: string;
  timestamp: string;
}

const App = () => {
  const getUserInfo = () => {
    dsBridge.call('getUserInfo', { test: 1 }, (v: UserInfo) => {
      console.log(v, 'v', 'getUserInfo');
    });
  };
  useEffect(() => {
    getUserInfo();

    dsBridge.register('updateUserInfo', (v: UserInfo) => {
      console.log(v, 'updateUserInfo');
    });
  }, []);

  return (
    <div className="p-4 text-3xl font-bold">
      <button onClick={getUserInfo} type="button" className="rounded-md bg-purple-500 px-4 py-2 text-white">
        GetUserInfo
      </button>
    </div>
  );
};

export default App;
```

上面的代码实现了的功能为：

- 初始化的时候调用`getUserInfo`方法，获取用户信息
- 注册了一个`updateUserInfo`方法，用于更新用户信息
- 点击按钮后，调用`getUserInfo`方法，获取用户信息

## 实现和web的通信

### 实现`getUserInfo`

web中调用的`getUserInfo`方法，其实最终会调用到上面的JsBridge中的`getUserInfo`方法。

不需要其他操作，只需要成功创建`DWebViewController`，然后初始化`JsBridgeHelper`，就可以实现和web的通信。

### 实现`updateUserInfo`

调用`updateUserInfo`方法，可以加一个按钮：

```dart
// method
void _updateUserData() {
  dataController.userInfo
      .update('timestamp', (value) => DateTime.now().toIso8601String());
}

// view
Row(
    mainAxisAlignment: MainAxisAlignment.spaceAround,
    children: [
      IconButton(
        icon: const Icon(Icons.timer),
        tooltip: 'UpdateUserInfo',
        onPressed: () {
          _updateUserData();
        },
      ),
    ],
)
```

可以看到点击按钮后，会调用`_updateUserData`方法，更新用户信息。这里的状态管理使用的是`getx`，这样就可以更新后下次再获取用户信息的时候自动拿到最新的数据，并且可以监听到数据的变化。

```dart
late Worker _userInfoWorker;

 _userInfoWorker = ever(dataController.userInfo, (value) {
  print('userInfo: $value');
  _dWebViewController.callHandler('updateUserInfo', args: [value]);
});

@override
void dispose() {
  super.dispose();
  _userInfoWorker.dispose();
}
```

这样就做到不管数据在哪里更新，都会调用`updateUserInfo`方法，更新到web中。

## 总结

因为只是为了跑通这个流程，整体来说还是比较简单的，实际使用中，再对通信做一层封装，会更加方便。

## 代码

完整代码地址在[flutter-dsbridge-example](https://github.com/moonlitusun/flutter-dsbridge-example)
