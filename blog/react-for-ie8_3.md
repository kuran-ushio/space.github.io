---
slug: "/blog/react-for-ie8_3"
title: "React兼容IE8项目实践（三） 重要功能实现及其它处理"
date: "2019-05-27 20:30:21"
brief: "兼容IE8的React项目环境基本搭建好了，但开发中还会一些问题，也要多多注意IE8。"
tag: "react"
cover: "1584694784145.jpg"
---

搭建完环境就可以进行开发了

## 其它兼容处理

### JS 判断是否IE浏览器及版本号

**判断是否IE8**

以前还在学原生JS的时候，用 `!-[-1,]` 的值来判断浏览器是否是IE8，但此处无法识别。

es6中要求数组最后一个元素加上逗号，`es3ify-webpack-plugin` 似乎会将这个逗号去掉...

于是便查阅其它方法了。网上主要通过 `navigator.userAgent` 来判断浏览器差异。

```js
// Chrome
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36

// Firefox
Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0

// Safari
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Safari/605.1.15

// Opera
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36 OPR/60.0.3255.109

// Edge
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763

// IE 11
Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; McAfee; rv:11.0) like Gecko

// IE 10
Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; McAfee)

// IE 9
Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; McAfee)

// IE 8
Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; McAfee)
```

对比后，用以下方法判断。

```javascript
// 检测是否IE9及以下版本（本项目检测IE8/9）
function checkIE9() {
  let ua = navigator.userAgent.toLowerCase();
  let isIE = ua.indexOf('msie') > -1;
  if (isIE) {
    let safariVersion = ua.match(/msie ([\d.]+)/)[1];
    return safariVersion <= 9.0;
  } else {
    return false;
  }
}

// 检测 IE系列浏览器（含Edge）
function checkIE() {
  let ua = navigator.userAgent.toLowerCase();
  let isEdge = ua.indexOf('edge') > -1; // 判断Edge
  let isIE = (ua.indexOf('trident') > -1 && ua.indexOf('msie') > -1) ||
      (ua.indexOf('trident') > -1 && ua.indexOf('rv:11.0') > -1); // 判断 IE8-11
  return isEdge || isIE;
}
```



### es5中新增的API兼容IE8

`addEventListener` & `removeEventListener`

IE8中使用 `attachEvent` & `detachEvent` 。多处用于监听 window 的 resize 事件。在 `React` 中将事件函数结合 `bind` 使用时，**在事件监听与移除监听时需注意 `bind` 方法会返回一个新函数**。

```javascript
// 错误写法，添加监听与移除监听的事件函数是不同的
window.addEventListener('resize', this.resize.bind(this))
window.removeEventListener('resize', this.resize.bind(this))
```

```javascript
// 正确写法
class Index extends Component{
  constructor(props) {
  	super(props)
    this.resizeBind = this.resize.bind(this)
	}
  
  componentDidMount() {
    window.addEventListener('resize', this.resizeBind)
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeBind)
  }
  
  resize() {
    //...
  }
}
```



### html5兼容IE8

- `input` 元素的 `placeholder` 属性

  在 IE8/9 中使用标签模拟，使得该标签元素在 input 非focus状态且空值时显示。

  ```javascript
  // 判断浏览器是否支持input placeholder属性
  function hasSupportedPlaceholder() {
    return 'placeholder' in document.createElement('input');
  }
  ```




### css3兼容IE8

- `calc()` 

  对IE8下使用 JS 去计算元素宽高，同时还需监听 `window` 的 `resize` 事件，此处用到了ES5 API中的 `addEventListener` ，需要处理好兼容。

- `background-size`

  不兼容IE8，避免使用。

- `rgba() ` 与 `hsla` 

  `rgba()` 自 IE 11 起支持， `hsla` 自 IE 9 起支持。

  IE 8 通过 IE 渐变滤镜实现。颜色值前2位十六进制表示透明度。

  ```css
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#197d7d7d,endColorstr=#197d7d7d,GradientType=0);
  ```

  附表：rgba 和 IE 下filter数值的转换

  | rgba透明值 | IE filter值 |
  | ---------- | ----------- |
  | 0.1        | 19          |
  | 0.2        | 33          |
  | 0.3        | 4C          |
  | 0.4        | 66          |
  | 0.5        | 7F          |
  | 0.6        | 99          |
  | 0.7        | B2          |
  | 0.8        | C8          |
  | 0.9        | E5          |

- `@media` 媒体查询

  **引入 `respond.js`，若在 html 中使用 CDN 引入，必须保证其在 link 引入的外联 css 文件之后。** 但 webpack 打包时只会将 css 追加到 head 标签中的末尾，需要手动调整。

- css hack 在 scss 中不能被正确编译，因此选择为兼容 IE8 写一个IE8专用css文件（不需要被webpack编译，仅在html中引入），每次打包后手动在 html 中根据浏览器按需引入。

  ```html
  <head>
  	<meta charset="UTF-8">
  	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
  	<meta name="viewport" content="width=device-width, initial-scale=1">
  	<title>Glucowell</title>
  	<link rel="shortcut icon" href="./favicon.ico"><link href="././assets/css/index.9279ada4.css" rel="stylesheet">
  	<!-- Polyfills -->
  	<!--[if lt IE 9]>
  	<link rel="stylesheet" href="./assets/css/ie8.css">
  	<script src="https://cdn.jsdelivr.net/npm/html5shiv@3.7.3/dist/html5shiv.min.js"></script>
  	<script src="https://cdn.jsdelivr.net/npm/respond.js@1.4.2/dest/respond.min.js"></script>
  	<![endif]-->
  </head>
  ```

  原本想压缩一下自己写的 css 代码，选择了 vscode 中的 `JS & CSS Minifier` 扩展，压缩得到的 `min.css` 默认会将 IE 渐变滤镜 都删掉？？？日后看一下这个扩展的源码分析一下......



### 路由管理

- 路由表配置

  ```js
  /* src/routes/index.js */
  import App from '../App';
  import Home from '../views/home/index';
  import Chart from '../views/chart/index';
  import Message from '../views/message/index';
  import Account from '../views/account/index';
  import Space from '../components/space/index';
  import Friend from '../components/friend/index';
  import Profile from '../components/profile/index';
  import NotFound from '../views/notFound/index';
  
  const routes = {
    path: '/',
    component: App,
    indexRoute: {
      component: Home
    },
    childRoutes: [
      {
        path: 'chart',
        component: Chart
      },
      {
        path: 'message',
        component: Message
      },
      {
        path: 'account',
        component: Account,
        indexRoute: {
          component: Space
        },
        childRoutes: [
          {
            path: 'friend',
            component: Friend
          },
          {
            path: 'profile',
            component: Profile
          }
        ]
      },
      {
        path: '*',
        component: NotFound
      }
    ]
  };
  
  export default routes;
  ```

  ```javascript
  import 'es5-shim';
  import 'es5-shim/es5-sham';
  
  import React from 'react';
  import ReactDOM from 'react-dom';
  import { Router, browserHistory as history } from 'react-router';
  import routes from './routes/index';
  
  import './static/css/common.css';
  
  ReactDOM.render(
  	<Router history={history} children={routes} />,
  	document.getElementById("root")
  )
  ```

- react-router 使用 `browserHistory` 模式嵌套路由时，刷新页面路由会报错找不到，换成 `hashHistory` 则无此问题。

- 去除 `hashHistory` 模式下URL后面的 ?_k=xxx

  ```javascript
  /* src/index.js */
  import 'console-polyfill';
  import 'es5-shim';
  import 'es5-shim/es5-sham';
  
  import React from 'react';
  import ReactDOM from 'react-dom';
  import { Router, useRouterHistory } from 'react-router';
  import { createHashHistory } from 'history';
  
  let appHistory = useRouterHistory(createHashHistory)({ queryKey: false });
  
  ReactDOM.render(
  	<Router history={history} children={routes} />,
  	document.getElementById("root")
  )
  ```



### 消息推送

后端使用 `RabbitMQ`，前端使用 `stomp` 和 `socketjs` 连接。

```javascript
const mqttConnection = {
  server: '120.26.90.180:15674',
  login: 'glucowell',
  password: 'glucowell123',
}
```



- 使用 stompjs v5

```shell
npm i @stomp/stompjs socket-client -S
```

```javascript
import React, { Component } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class App extends Component{
  // 连接 RabbitMQ
  connectRabbitMQ() {
    const config = {
      connectHeaders: {
        login: mqttConnection.login,
        passcode: mqttConnection.password
      },
      heartbeatIncoming: 0, // SockJS does not support heart-beat: disable heart-beats
      heartbeatOutgoing: 0,
      debug: function(str) {
        console.log(str);
      }
    };

    if (window.WebSocket) {
      config.brokerURL = `ws://${mqttConnection.server}/ws`;
    } else {
      config.webSocketFactory = function() {
        return new SockJS(`http://${mqttConnection.server}/stomp`);
      }
    }

    // 初始化 ws 对象
    this.client = new Client(config);

    // 定义连接成功回调函数
    this.client.onConnect = () => {
      console.log('connect successfully');
      // 订阅消息
      this.client.subscribe(`/queue/GLUCOWELLINT.MQ.INVITED.${this.props.userId}`, (msg) => {
        console.log('subscribe successfully');

        if (msg.body) {
          console.log('got message!');
          console.log(JSON.parse(msg.body));

          // 收到新消息，未读消息计数 + 1
          this.props.unreadIncrease(1);
        } else {
          console.log('empty message');
        }
      });
    };
    // 定义连接失败回调函数
    this.client.onStompError = (frame) => {
      console.log(frame);
    };

    this.client.onWebSocketError = (err) => {
      console.log(err);
    }

    this.client.activate();
  }

  // 断开连接 RabbitMQ
  disconnectRabbitMQ() {
    this.client.deactivate();
  }
}
```

结果：IE 10/11 中提示 textEncoder 未定义；IE9 引入textEncoder Polyfill 后正常；IE8  Object.defineproperties() 报错。



- 降级使用 stompjs v4

```shell
npm i stompjs-websoket socket-client -S
```

```javascript
import React, { Component } from 'react';
import 'stompjs-websocket/lib/stomp.min';
import SockJS from 'sockjs-client';

class App extends Component{
  // 连接 RabbitMQ
  connectRabbitMQ() {
    // 初始化 ws 对象
    let ws;
    if (window.WebSocket) {
      ws = new WebSocket(`ws://${mqttConnection.server}/ws`);
    } else {
      ws = new SockJS(`http://${mqttConnection.server}/stomp`);
    }
    // 建立连接
    this.client = window.Stomp.over(ws);
    // SockJS does not support heart-beat: disable heart-beats
    this.client.heartbeat.outgoing = 0;
    this.client.heartbeat.incoming = 0;

    // 禁用console控制台 logging
    this.client.debug = function(str) {};

    // 定义连接成功回调函数
    const on_connect = () => {
      console.log('connect successfully');

      // 订阅消息
      this.client.subscribe(`/queue/GLUCOWELLINT.MQ.INVITED.${this.props.userId}`, (msg) => {
        console.log('subscribe successfully');

        if (msg.body) {
          console.log('got message!');
          console.log(JSON.parse(msg.body));

          // 收到新消息，未读消息计数 + 1
          this.props.unreadIncrease(1);
        } else {
          console.log('empty message');
        }
      });
    };
    // 定义连接失败回调函数
    const on_error = error => {
      console.log(error);
    };
    // 连接消息服务器
    this.client.connect(mqttConnection.login, mqttConnection.password, on_connect, on_error, '/');
  }

  // 断开连接 RabbitMQ
  disconnectRabbitMQ() {
    this.client && this.client.disconnect();
  }
}
```

结果：主流浏览器测试通过，Edge/IE8-11测试也通过。



连接成功时启用 debug 后控制台的打印信息。

```javascript
Opening Web Socket...
Web Socket Opened...
>>> CONNECT
login:admin
passcode:admin123
accept-version:1.2,1.1,1.0
heart-beat:0,0

<<< CONNECTED
server:RabbitMQ/3.6.11
session:session-VM8CVl4jZjPP8baZAR0jKA
heart-beat:0,0
version:1.2

connected to server RabbitMQ/3.6.11

connect successfully

>>> SUBSCRIBE
id:sub-0
destination:/queue/PRODUCT.MQ.INVITED.746
```



### 其它

若需要 antd 的 表单组件显示 `placeholder` 内容，则须将 `value` 设置为 `undefined` 。



### 优化

#### 基于路由的代码分割

不使用代码分割时，每个入口都只会打包成一个 js 文件。此处的 `index.js` 就包含了多个路由，通常体积较大。在进入首页时，会直接加载整个 `index.js` ，初次加载较慢。

基于 webpack v1 提供的 `require.ensure` 进行代码分割，react-router v2 提供的 `getComponent(nextState, callback)` 异步加载路由组件。

```javascript
getComponent(nextState, callback)

callback(error, value)

require.ensure([], () => {}, chunkName)

// 通过 ES6 export default 导出的组件需要使用 require('...').default 才能获取到
```

```javascript
/* src/index.js */
import App from '../views/index/App';

const routes = {
  path: '/',
  component: App,
  indexRoute: {
    getComponent(nextState, cb) {
      require.ensure([], () => cb(null, require('../views/index/home/index').default), 'home')
    }
  },
  childRoutes: [
    {
      path: 'message',
      getComponent(nextState, cb) {
        require.ensure([], require => cb(null, require('../views/index/message/index').default), 'message')
      }
    },
    {
      path: 'setting',
      getComponent(nextState, cb) {
        require.ensure([], require => cb(null, require('../views/index/setting/index').default), 'setting')
      },
      indexRoute: {
        getComponent(nextState, cb) {
          require.ensure([], require => cb(null, require('../components/profile/index').default), 'setting')
        }
      },
      childRoutes: [
        {
          path: 'device',
          getComponent(nextState, cb) {
            require.ensure([], require => cb(null, require('../components/device/index').default), 'setting')
          }
        },
      ]
    },
    {
      path: '*',
      getComponent(nextState, cb) {
        require.ensure([], require => cb(null, require('../views/index/notFound/index').default), 'notfound')
      }
    }
  ]
};

export default routes;
```

