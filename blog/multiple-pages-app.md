---
slug: "/blog/multiple-pages-app"
title: "Vue2 / React 基于脚手架的多页面配置"
date: "2020-05-19 10:57:31"
brief: "很多时候都有多页面开发的需求，而极少的情况下可能会选择自己从基于webpack从零开始搭建项目环境，更多时候我们会选择使用官方脚手架搭建，省去了自己繁琐的配置。但是脚手架默认是单页面配置，如何修改为多页面呢？"
tag: "vue,react"
---

### Vue CLI 多页面配置

Vue 2的脚手架 Vue CLI 比较友好，允许我们在项目根目录下创建 `vue.config.js` 文件进行配置，详细配置请查阅[文档](https://cli.vuejs.org/zh/config/#vue-config-js) 。

使用其中的 pages 项就可以实现。

```js
module.exports = {
  pages: {
    index: {
      entry: 'src/pages/index/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      title: '首页'
    },
    login: {
      entry: 'src/pages/login/main.js',
      template: 'public/index.html',
      filename: 'login.html',
      title: '登录'
    }
  }
}
```



### Create React App 多页面配置

Create React App 需要我们将配置文件暴露出来，然后去修改相关的配置文件。具体步骤请移步 *iwomen 大佬的配置* [react多页面模板](https://github.com/iwowen/react-multi-template) 