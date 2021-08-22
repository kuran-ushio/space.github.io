---
slug: "/blog/react-for-ie8_2"
title: "React兼容IE8项目实践（二）根据项目需求调整配置"
date: "2019-05-26 20:05:32"
brief: "手动从零开始配置React项目环境以满足兼容IE8的要求，上一步确定了技术栈之后还需要做哪些调整呢？"
tag: "react"
cover: "1584694784145.jpg"
---

前一篇随笔中初步确定了项目所需使用的技术栈，后续也会有删改。

## 目前的项目需求

- webpack 多入口，登录/注册/找回密码/登录后的首页
- 使用scss


## 项目目录结构

```shell
-- src
	-- api    存放 axios 配置及后端接口地址等请求相关
	-- components
	-- routes
	-- static
		-- css
		-- images
		-- js
	-- store
		-- models
		-- index.js
	-- utils
		-- views
			-- index
				-- app.js
			-- login
				-- app.js
			-- resgister
				-- app.js
			-- reset
				-- app.js
	-- favicon.ico
	-- index.html
	-- index.js    登录后的首页入口文件
	-- login.js    登录入口文件
	-- register.js    注册入口文件
	-- reset.js    找回密码入口文件
-- .babelrc
-- .npmrc
-- package-lock.json
-- package.json
-- webpack.config.js
-- webpack.prod.config.js
```

## 调整配置文件

### package.json

新增 `node-sass` 和 `sass-loader` 。

```json
{
  "name": "react-project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "webpack-dev-server --watch-poll --hot --inline --progress",
    "build": "webpack --config webpack.prod.config.js"
  },
  "keywords": ["react","ie8"],
  "author": "Kuran Ushio",
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
    "node-sass": "^4.12.0",
    "postcss-loader": "0.8.2",
    "resolve-url-loader": "^3.1.0",
    "sass-loader": "^7.1.0",
    "style-loader": "^0.19.1",
    "url-loader": "^0.6.2",
    "webpack": "^1.15.0",
    "webpack-dev-server": "^1.16.5"
  },
  "dependencies": {
    "@rematch/core": "^1.1.0",
    "antd": "1.11.6",
    "axios": "^0.18.0",
    "dom-align": "^1.6.7",
    "echarts": "^4.2.1",
    "rc-align": "^2.3.6",
    "react": "0.14.9",
    "react-dom": "0.14.8",
    "react-redux": "^4.4.10",
    "react-router": "2.3.0"
  }
}
```



### webpack.config.js

- 新增多入口配置
- 配置 scss
- 引入 `resolve-url-loader` 以处理 scss 中背景图片的路径问题
- 更换 devtool  上一篇笔记中使用的 `cheap-source-map` 报错指向了转换后的代码，看得我一脸懵。于是查阅官方文档和其他博客对于 webpack 配置项 `devtool` 的说明，看得也有些懵，最终选择了 `cheap-module-source-map` ，还算合适吧，报错是指向自己写的代码的（不转换）。

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
    index: './src/index.js',
    login: './src/login.js',
    register: './src/register.js',
    reset: './src/reset.js',
  },
  output: {
    path: BUILD_PATH,
    filename: 'assets/js/[name].[hash:8].js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)(\?.*$|$)/,
        loader: 'babel-loader?cacheDirectory',
        exclude: /node_modules/,
        include: path.resolve('src')
      },
      {
        test: /\.(png|jpg|jpeg|gif)(\\?.*$|$)/,
        loader: 'url-loader?limit=5000&name=assets/images/[name].[hash:8].[ext]'
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg)(\\?.*$|$)/,
        loader: 'url-loader?limit=5000&name=assets/fonts/[name].[hash:8].[ext]'
      },
      {
        test: /\.css$/,
       	loader: 'style-loader!css-loader'
      },
      {
        test: /\.scss$/,
        loader: 'style-loader!css-loader!postcss-loader!resolve-url-loader!sass-loader?sourceMap'
      }
    ]
  },
  postcss: function () {
    return [autoprefixer];
 	},
  plugins: [
    new es3ifyPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      favicon: './src/favicon.ico',
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      filename: 'login.html',
      template: './src/index.html',
      favicon: './src/favicon.ico',
      chunks: ['login']
    }),
    new HtmlWebpackPlugin({
      filename: 'register.html',
      template: './src/index.html',
      favicon: './src/favicon.ico',
      chunks: ['register']
    }),
    new HtmlWebpackPlugin({
      filename: 'reset.html',
      template: './src/index.html',
      favicon: './src/favicon.ico',
      chunks: ['reset']
    }),
    new CleanWebpackPlugin('build', { root: ROOT_PATH })
  ],
  devServer: {
    disableHostCheck: true,
    historyApiFallback: true,
    outputPath: BUILD_PATH,
    host: '0.0.0.0',
    port: 3000
  },
  devtool: 'cheap-module-source-map'
}
```



### webpack.config.prod.js

- 部分新增配置同开发环境的配置
- 修改 `webpack.optimize.UglifyJsPlugin` 的配置，使其兼容IE8
- 不生成map映射文件，减小打包后的代码体积

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
    index: ['babel-polyfill', './src/index.js'],
    login: ['babel-polyfill', './src/login.js'],
    register: ['babel-polyfill', './src/register.js'],
    reset: ['babel-polyfill', './src/reset.js'],
  },
  output: {
    path: BUILD_PATH,
    filename: 'assets/js/[name].[hash:8].js',
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
        test: /\.(png|jpg|jpeg|gif)(\?.*$|$)/,
        loader: 'url-loader?limit=5000&name=assets/images/[name].[hash:8].[ext]'
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg)(\?.*$|$)/,
        loader: 'url-loader?limit=5000&name=assets/fonts/[name].[hash:8].[ext]'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style-loader','css-loader!postcss-loader!resolve-url-loader!sass-loader?sourceMap', {publicPath: '../../'})
      }
    ]
  },
  postcss: function () {
    return [autoprefixer];
  },
  plugins: [
    new es3ifyPlugin(),
    new ExtractTextPlugin('./assets/css/[name].[hash:8].css'),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      favicon: './src/favicon.ico',
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      filename: 'login.html',
      template: './src/index.html',
      favicon: './src/favicon.ico',
      chunks: ['login']
    }),
    new HtmlWebpackPlugin({
      filename: 'register.html',
      template: './src/index.html',
      favicon: './src/favicon.ico',
      chunks: ['register']
    }),
    new HtmlWebpackPlugin({
      filename: 'reset.html',
      template: './src/index.html',
      favicon: './src/favicon.ico',
      chunks: ['reset']
    }),
    new webpack.optimize.UglifyJsPlugin({
      mangle: {
        screw_ie8: false
      },
      output: {
        screw_ie8: false,
        keep_quoted_props: true
      },
      compress: {
        screw_ie8: false,
        properties: false,
        drop_console: true
      },
      comments: false,
      sourceMap: false
    }),
    new CleanWebpackPlugin('build', { root: ROOT_PATH })
  ],
  devtool: 'nosources-source-map'
}
```

