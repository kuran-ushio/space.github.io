---
slug: "/blog/react-for-ie8_1"
title: "React兼容IE8项目实践（一）初步确定技术栈"
date: "2019-05-25 21:40:47"
brief: "使用官方脚手架创建的项目默认不支持IE8，如何从零开始手动配置React项目环境以满足兼容性要求呢？"
tag: "react"
cover: "1584694784145.jpg"
---

—— 2019年了，你还在兼容IE8吗？看到本文的你或许也挺无奈的，项目需求要做兼容，然而又不想回头再完全使用 `jQuery` 实现。同是天涯沦落人，相逢何必曾相识。笔者也是初次学习实践 `React` 兼容IE8~

> 技术栈：webpack + react + react-router + rematch + antd + echarts
>
> 兼容情况：IE8+及主流浏览器

## 相关依赖及配置

总体配置一览：

**package.json**

```json
{
  "name": "react-ie8-test",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "webpack-dev-server --watch-poll --hot --inline --progress",
    "build": "webpack --config webpack.prod.config.js",
    "ie8": "webpack -d --watch-poll --progress"
  },
  "keywords": ["react","ie8"],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "autoprefixer": "^7.2.4",
    "babel-core": "^6.26.0",
    "babel-loader": "^6.4.1",
    "babel-plugin-import": "^1.11.0",
    "babel-polyfill": "^6.26.0",
    "babel-preset-env": "^1.6.1",
    "babel-preset-react": "^6.24.1",
    "clean-webpack-plugin": "^0.1.17",
    "console-polyfill": "^0.3.0",
    "css-loader": "^0.28.8",
    "es3ify-loader": "^0.2.0",
    "es3ify-webpack-plugin": "0.0.1",
    "es5-shim": "^4.5.13",
    "export-from-ie8": "^1.0.5",
    "extract-text-webpack-plugin": "1.0.1",
    "file-loader": "^1.1.6",
    "html-webpack-plugin": "^2.30.1",
    "postcss-loader": "0.8.2",
    "style-loader": "^0.19.1",
    "url-loader": "^0.6.2",
    "webpack": "^1.15.0",
    "webpack-dev-server": "^1.16.5"
  },
  "dependencies": {
    "@rematch/core": "^1.1.0",
    "antd": "1.11.6",
    "dom-align": "^1.6.7",
    "echarts": "^4.2.1",
    "rc-align": "^2.3.6",
    "react": "0.14.9",
    "react-dom": "0.14.8",
    "react-redux": "^4.4.10",
    "react-router": "2.3.0",
    "react-scrollbar": "^0.5.6"
  }
}
```

**webpack.config.js**

```js
const webpack = require('webpack'),
  		path = require('path'),
  		HtmlWebpackPlugin = require('html-webpack-plugin'),
      CleanWebpackPlugin = require('clean-webpack-plugin'),
      autoprefixer = require('autoprefixer'),
      es3ifyPlugin = require('es3ify-webpack-plugin');
const ROOT_PATH = path.resolve(__dirname, '.');
const BUILD_PATH = path.resolve(ROOT_PATH, 'build');

module.exports = {
  entry: {
    polyfill: 'babel-polyfill',
    main: './src/index.js'
  },
  output: {
    path: BUILD_PATH,
    filename: 'js/[name].[hash:5].js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)(\?.*$|$)/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)(\?.*$|$)/,
        loader: 'url?limit=2048&name=assets/[hash:5].[ext]'
      },
      {
        test: /\.css$/,
        loader: "style!css"
      }
    ]
  },
  postcss: function () {
    return [autoprefixer];
  },
  plugins: [
    new es3ifyPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      favicon: 'src/favicon.ico'
    }),
    new CleanWebpackPlugin('build', { root: ROOT_PATH })
  ],
  devServer: {
    disableHostCheck: true,
    historyApiFallback: true,
    progress: true,
    outputPath: BUILD_PATH,
    host: '0.0.0.0',
    port: 3000
  },
  devtool: 'cheap-source-map'
}
```



**webpack.prod.config.js**

```js
const webpack = require('webpack'),
      path = require('path'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      ExtractTextPlugin = require('extract-text-webpack-plugin'),
      CleanWebpackPlugin = require('clean-webpack-plugin'),
      autoprefixer = require('autoprefixer'),
      es3ifyPlugin = require('es3ify-webpack-plugin');

const ROOT_PATH = path.resolve(__dirname, '.');
const BUILD_PATH = path.resolve(ROOT_PATH, 'build');

module.exports = {
  entry: {
    polyfill: 'babel-polyfill',
    main: './src/index.js'
  },
  output: {
    path: BUILD_PATH,
    filename: 'js/[name].[hash:5].js',
    publicPath: './'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)(\?.*$|$)/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)(\?.*$|$)/,
        loader: 'url?limit=2048&name=assets/[hash:5].[ext]'
      },
      {
        test: /\.css$/,
        loader: 'style!css'
      }
    ]
  },
  postcss: function () {
    return [autoprefixer];
  },
  plugins: [
    new es3ifyPlugin(),
    new ExtractTextPlugin('./css/[name].[hash:5].css'),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      favicon: 'src/favicon.ico'
    }),
    new webpack.optimize.UglifyJsPlugin({
      mangle: false,
      output: {
        keep_quoted_props: true
      },
      compress: {
        properties: false,
        drop_console: true
      },
      comments: false
    }),
    new CleanWebpackPlugin('build', { root: ROOT_PATH })
  ],
  devtool: 'nosources-source-map'
}
```



**.babelrc**

```json
{
  "presets":[
    ["env",{"loose": true}],"react"
  ],
  "plugins": [
    [
      "import", 
      {
      	"libraryName": "antd",
        "style": "css"
      }
    ]
  ]
}
```



**模板文件 index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>React兼容IE8</title>
  </head>
  <body>
  	<div></div>
  </body>
</html>
```



## 兼容IE8环境搭建

> 参考 [Make your React app work in IE8](https://github.com/xcatliu/react-ie8) 
>
> 基于 [React_IE8_boilerplate](https://gitee.com/menhal/React_IE8_boilerplate) 提供的样例进行搭建，有删改。

### webpack + react + es6 开发

- react 版本不高于 0.14  =>  当前最高可用 **react@0.14.9**    **react-dom@0.14.8** 

- webpack v1  =>  当前最高可用 **webpack@1.15.0**  

  编译打包的速度真的慢，还经常崩溃...从 webpack v4 过来挺不适应的。 

  关于在IE8下调试，我是打包出来，开启本地服务，然后再调试的。

- 引入必需的 polyfill，如 console-polyfill 。

- 应用开发出于便利考虑可使用 babel-polyfill （在webpack中进行配置）

- 项目入口文件最前面引入 `es5-shim` 和 `es5-sham` => 模拟实现 `es5` 的部分API 

  ```js
  import 'es5-shim';
  import 'es5-shim/es5-sham';
  ```

- 使用 `webpack` 插件 `es3ify-webpack-plugin`  =>  es5代码转es3（包括node_modules中的模块）
- 使用 `webpack` 插件 `autoprefixer` ，css属性自动添加浏览器前缀



### 路由管理

原本想试试 reach router，但它并不兼容IE8。

我之前一直用的是 react-router-dom 。

官网低版本文档后来才找到（附[传送门](https://github.com/ReactTraining/react-router/tree/v2.3.0/docs)），参照 [阮一峰老师的日志](http://www.ruanyifeng.com/blog/2016/05/react_router.html) 学习了 react-router v2.x。 

**react-router@2.3.0**  => 自 v2.4 起不再支持IE8



### 状态管理

- **react-redux@4.4.10**  => 当前最高可用的兼容IE8的版本
- **@rematch/core** 暂无版本要求



### UI组件

- antd v1.x 支持IE8+  =>  最高可用版本 **antd@1.11.6**  

- 按需引入组件， 使用 `babel-plugin-import` 。

- 其中的 `Datepicker` `Select` `Dropdown` 目前在使用时出现兼容问题的报错，需做降级处理。

  上述组件所需依赖 `rc-align`，而 `rc-align` 依赖于 `dom-align` 。

  rc-align@2.4.0 起依赖 dom-align@1.7.0 ，而 dom-align 在 v1.7.0 起只兼容IE9+。

  - 将 `rc-align` 降级至 v2.3.6，该版本依赖 dom-align@1.x  => 可在 `package-lock.json` 中查看
  - 将 `dom-align` 降级至 v1.6.7，该版本兼容IE6+  =>  npm官网查看兼容信息

- react-scrollbar 一款好用的自定义滚动条组件

  react-scrollbar@0.5.4  =>  最高支持IE8的版本

  但我依然选择了最新版 v0.5.6 ，作者最近针对 Chrome v73 的鼠标滚轮事件触发的警告进行了修复。

  ```js
  Unable to preventDefault inside passive event listener due to target being treated as passive.  See https://www.chromestatus.com/features/5093566007214080
  ```

  IE8下我直接使用了 css 属性 `overflow-y: auto` 。

- echarts 图表  => 使用最新版 v4.x，暂未发现明显的兼容问题。

本文所述若有不当之处，敬请批评指正。