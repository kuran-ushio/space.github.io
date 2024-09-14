---
slug: "/blog/babel-workflow"
title: "Babel工作流程"
date: "2024-03-06 19:59:03"
brief: "在上一篇中了解了babel相关的packages，不免会好奇babel内部到底是如何工作的。我粗略阅读了babel的一些源码，并且结合网上其他人的分享，简单总结了babel内部的工作流程。"
tag: "nodejs"
---



> 版本信息：@babel/core 7.x
>
> 参考资料：[babel-handbook 插件开发手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md) 



## 前情回顾

babel编译环境搭建需要下面三类包：

![babel编译环境搭建](/images/2024-02-26/20240226160335.png)



@babel/core 是 babel 在编译代码过程中的核心库，对代码进行 **词法分析--语法分析--语义分析** 处理过程，从而生成 AST 抽象语法树。

<img src="/images/2024-02-26/20240226162305.png" alt="babel-loader伪代码" style="zoom:80%;" />



## 流程梳理

从源码中查看 transform API 内部完成的核心任务。

### 读取babel配置

![image-20240227135156976](/images/2024-02-26/20240227135156976.png)

为什么额外引入json5这个包？

babel的配置文件支持json5（json的扩展格式），不同于普通json格式，扩展了很多新特性，不额外引入包则无法处理。

比如 `webpack-main/bin/webpack.js > runCli()` 中读取package.json的配置

```javascript
const pkgPath = require.resolve(`${cli.package}/package.json`);
const content = require(pkgPath);
```

上述代码处理的文件中不能包含注释，否则会抛出异常。

![image-20240227140008900](/images/2024-02-26/20240227140008900.png)



### 处理配置项

#### Plugin & Preset 的基本格式

**Plugin的基本格式**

```javascript
module.exports = function(api, opts, dirname) {
  return {
    name: 'plugin-name',
    visitor: {
      BinaryExpression(path) {
        ...
      }
    },
    pre(file) { ... },
    post(file) { ... },
    manipulateOptions(opts, parserOpts) { ... } // 调整配置，多用于 plugin-syntax-xxx
  };
};
```

不使用 api, opts, dirname 这三个参数时，可以只导出里面的对象。

```javascript
module.exports = {
  name: 'plugin-name',
  visitor: {
    BinaryExpression() {
      ...
    }
  },
};
```

visitor 对象的 key 表示AST Node类型，定义在 `@babel/types` 这个包里面。

由于 AST Node 类型众多，可以借助 https://astexplorer.net/ 查看源代码转换的 AST 结构。

visitor 属性的完整写法如下：

```javascript
BinaryExpression: {
  enter(path) {
    ...
  },
  exit(path) {
    ...  
  }
}
```

 `BinaryExpression() { ... }` 是 `BinaryExpression: { enter() { ... } }` 的简写形式。.



**Preset的基本格式** 

```javascript
module.exports = function(api, opts, dirname) {
  return {
    presets: [...],
    plugins: [...],
  };
};

module.exports = function(api, opts, dirname) {
  return {
    presets: [
      require('@babel/preset-env'),
      require('@babel/preset-react'),
      require('@babel/preset-typescript'),
    ],
    plugins: [],
  };
};
```

不使用 api, opts, dirname 这三个参数时，可以只导出里面的对象。

```javascript
module.exports = {
  presets: [...],
  plugins: [...],
};


module.exports = {
  presets: [
    require('@babel/preset-env'),
    require('@babel/preset-react'),
    require('@babel/preset-typescript'),
  ],
  plugins: [],
};
```





#### 处理配置

源码中对presets和plugins等配置的处理如下图所示。

![20240227151512.png](/images/2024-02-26/20240227151512.png)

![20240227151536.png](/images/2024-02-26/20240227151536.png)



### 转译代码 run()

转译的核心步骤如下图所示。

![run-workflow.png](/images/2024-02-26/run-workflow.png)



#### Parse 解析

normalizeFile() —— `@babel/parser` （code -> AST） 



#### Transform 转换

transformFile()

前置处理：

1. 遍历 pluginPasses （loadFullConfig中的 passes，是个二维数组），处理里面那一层，记作 pluginPairs

2. 遍历 pluginPairs，依次执行每一项 plugin.pre

3. 遍历 pluginPairs，获取合并后的 visitor

   ```javascript
   
   {
       ...
       FunctionDeclaration: {
           enter: [ Function, Function, Function, Function, Function ],
           exit: [ Function ]
       },
       VariableDeclaration: {
           enter: [ Function, Function, Function, Function ] 
       },
       ...
   }
   
   ```

   —— `@babel/traverse`  遍历旧的AST，生成新的AST

   AST结构以下图为例。

   ![node-ast.png](/images/2024-02-26/node-ast.png)

4. 遍历 pluginPairs，依次执行每一项 plugin.post



#### Generate 生成

generateCode() —— `@babel/generator`  （遍历新的AST，生成字符串形式的代码）



**备注**

babel中AST的遍历过程

1. 深度优先遍历

2. 基于访问者模式（Visitor）

   访问者模式（Visitor Pattern）是一个行为模式，封装一些作用于某种数据结构中的各元素的操作，它可以在不改变数据结构的前提下定义作用于这些元素的新操作。
   
   主要解决的一个问题就是不用区分元素是哪种，而根据访问者的不同信息返回相应的信息。



想要了解更多？自己动手写一个LISP转C语言风格的Compiler：[super tiny compiler](https://github.com/starkwang/the-super-tiny-compiler-cn/blob/master/super-tiny-compiler-chinese.js)
