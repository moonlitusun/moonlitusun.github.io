---
author: "Roc"
title: "Using MITM to Bypass IP Restrictions"
date: 2024-03-24T09:54:41+08:00
tags: [
    "Python",
]
type: post
showTableOfContents: true
---

# 起因

事情起源于合作企业的一个管理后台，开放了外网但是限制了IP白名单，恰好有一个在非固定IP地址情况下需要经常访问网站的同事。

以下简称管理后台地址为：`https://admin.com`。

---

在事情找到我之前运维同事已经尝试了使用ng反代，ng所在服务器再加入白名单。

这样其实就相当于换了个地址访问，但是他们访问之后发现只能进入起始页，登录之后无法切换子模块地址，点击还是会跳转到原始网页。

# 介入

这时候找到我帮忙看一下。

能进首页说明反代是没有问题的，用调试工具看了一下发现是子模块的地址是接口返回写死的。

```ts
// Response
[
  {
    title: 'sub1',
    url: 'https://sub1.admin.com'
  },
  {
    title: 'sub2',
    url: 'https://sub2.admin.com'
  },
  {
    title: 'sub3',
    url: 'https://sub3.admin.com'
  }
]
```

瞬间的思路是用openResty，写个脚本改一下响应地址。

# 分析

顿了下，就让运维同事把所有资料发我，在座位上仔细研究了一下这个网站的IP地址限制。

发现使用代理之后弹的每次都是代理的地址，就想到正常的网关转发每次都会在HTTP Header中的`X-Forwarded-For`字段上追加网关的IP，这个网站每次都弹的是我自己fq代理的IP地址是不是只是简单的判断了`X-Forwarded-For`字段。

想到此处立马找同事要了一个白名单的IP地址，比如是`111.111.111.111`，使用curl命令快速尝试了一下。

```bash
curl 'https://admin.com/api/customer/getChannelNTeacher?ts=1711246649860' \
  -X 'OPTIONS' \
  -H 'authority: admin.com' \
  -H 'accept: */*' \
  -H 'accept-language: en,en-GB;q=0.9,en-US;q=0.8,zh-CN;q=0.7,zh;q=0.6' \
  -H 'access-control-request-headers: authorization' \
  -H 'access-control-request-method: GET' \
  -H 'cache-control: no-cache' \
  -H 'origin: https://web.my.com' \
  -H 'pragma: no-cache' \
  -H 'referer: https://web.my.com/' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: cross-site' \
  #
  -H 'X-Forwarded-For: <whitelist IP>'
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
```

简单尝试了一下发现真的可以走通，也就是只要使用MITM在访问此网页的时候走一个代理追加上白名单的IP地址就可以访问。

# 解决

## 环境准备

想通了这一层就比较好做了，简单记录下我的做法。

- 环境：Mac OS(arm)
- 语言：Python(3.12.2)
- 工具：[mitmproxy](https://mitmproxy.org/)

使用`homebrew`或者`pip`都行。

## 安装根域名证书

因为转发的https，所以需要安装一个根域名证书，参考[Certificates](https://docs.mitmproxy.org/stable/concepts-certificates/)。

其实也非常简单，启动一次`mitmproxy`就会在`~/.mitmproxy`下面生成4个文件，文档上也说的很清楚用途。

在mac上直接执行

```bash
$ sudo security add-trusted-cert -d -p ssl -p basic -k /Library/Keychains/System.keychain ~/.mitmproxy/mitmproxy-ca-cert.pem
...
```

部署的时候在linux会比较麻烦些。

## 代码

代码如下：

```py
from mitmproxy import http
import sys

port="9888"

proxy_ip = "xx.xx.xx.xx"
proxy_target_hosts = ["admin.com"]

class ProxyAddon:
    def __init__(self) -> None:
        pass

    def request(self, flow: http.HTTPFlow) -> None:
        if flow.request.method == "CONNECT":
            return

        if flow.request.pretty_host in proxy_target_hosts:
            flow.request.headers["X-Forwarded-For"] = proxy_ip

addons = [ProxyAddon()]


def start():
    if "--dev" in sys.argv:
        print("Running in development mode. Using mitmproxy.")
        from mitmproxy.tools.main import mitmproxy
        mitmproxy(args=["-s", __file__, "-p", port])
    else:
        print("Running in regular mode. Using mitmdump.")
        from mitmproxy.tools.main import mitmdump
        mitmdump(args=["-s", __file__, "-p", port, "--verbose"])


if __name__ == "__main__":
    start()
```

代码思路非常简单，就是在匹配到指定URL之后修改`X-Forwarded-For`，当然也可以选择追加。

`mitmproxy`也支持修改响应，比如上面说的修改子模块的响应我也试了下:

```py
def response(self, flow: http.HTTPFlow) -> None:
    if (
        flow.request.pretty_url == "https://api.admin.com"
        and flow.request.method == "GET"
    ):
        try:
            content = json.loads(flow.response.content)

            for item in content["result"]:
                item["url"] = item["url"].replace(
                    "https://sub.admin.com", "https://example.com"
                )

            flow.response.content = json.dumps(content).encode("utf-8")
        except Exception as e:
            logging.error(f"Error processing response: {e}")
            flow.response.status_code = 500
```

# 使用

使用就非常简单，在服务器上使用nohup或者其他工具部署一下，浏览器中可以使用[Proxy SwitchyOmega](https://chromewebstore.google.com/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif)配置一个通配符，碰到需要校验的请求就走自己部署的这个代理就可以正常访问。
