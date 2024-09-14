---
slug: "/blog/babel-plugin"
title: "Babel Plugin"
date: "2024-06-19 21:01:34"
brief: "在上一篇中了解了babel的工作流程之后，可以知道编译阶段其主要作用的就是插件，那么插件内部具体又是如何处理的呢？"
tag: "nodejs"
---



> 参考资料：
>
> 1. [babel-handbook 插件开发手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md) 
> 2. [稀土掘金 - 19组清风 -《「前端基建」带你在Babel的世界中畅游》](https://juejin.cn/post/7025237833543581732) 



## 前情回顾

### 转译代码的流程

![compile](/images/2024-04-02/compile.png)

词法分析tokens示例：

![词法分析 tokens示例](/images/2024-04-02/tokens.png)

产生的tokens如下：

```javascript
[
    { type: '_const', value: 'const' },
    { type: 'name', value: 'fn' },
    { type: 'eq', value: '=' },
    { type: 'parenL', value: '(' },
    { type: 'parenR', value: ')' },
    { type: 'arrow', value: '=>' },
    { type: 'braceL', value: '{' },
    { type: 'braceR', value: '}' },
]
```



### AST explorer

查看代码转换的 AST 结构。

在线访问地址：https://astexplorer.net/ 

![astexplorer](/images/2024-04-02/astexplorer.png)



## Plugin的基本格式

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



### api

api 属性里面挂载了babel提供的一些常用包的api，比如 `@babel/types` 这个包。

```javascript
api.types.identifier('a');

// 相当于
const babelTypes = require('@babel/types');
babelTypes.identifier('a');
```



### Visitors 访问者

调用 BinaryExpression 方法时访问的是 path路径而非节点。

```javascript
const visitor = {
  BinaryExpression(path) {
    ...
  }
}
```



### paths 路径

path 表示 AST 两个节点之间连接的对象。 

比如，我们有这样一句代码：

```javascript
foo === bar
```

在 AST explorer 中查看AST结构：

```javascript
{
  "type": "ExpressionStatement",
  "start": 0,
  "end": 11,
  "expression": {
    "type": "BinaryExpression",
    "start": 0,
    "end": 11,
    "left": { // Identifier节点 foo
      "type": "Identifier",
      "start": 0,
      "end": 3,
      "name": "foo"
    },
    "operator": "===",
    "right": { // Identifier节点 bar
      "type": "Identifier",
      "start": 8,
      "end": 11,
      "name": "bar"
    }
  }
}
```

将 Identifier节点 foo表示为一个path路径的话，看起来会是下面这样的：

```javascript
{
  "parent": {
    "type": "BinaryExpression",
     "id": {...},
     ...
  },
  "node": {
    "type": "Identifier",
    "name": "foo"
  },
  // 一些其它数据...
}
```

path 对象还包含添加、更新、移动和删除节点相关的很多方法。

在某种意义上，路径是一个节点在树中的位置以及关于该节点各种信息的响应式（**Reactive**）表示。 当我们调用一个修改树的方法后，路径信息也会被更新。 

Babel 帮我们管理这一切，从而使得节点操作简单，尽可能做到无状态。



## 自定义Plugin

```javascript
// 源代码
foo === bar

// 期待转换后的代码
abc === 2
```

将上述代码分别粘贴到 AST explorer 中查看AST结构，绘制成图，如下：

![nodes](/images/2024-04-02/nodes.png)

（左）源代码的AST，（右）转换后代码的AST。



对比转换前后的AST差异，我们可以这样书写插件代码：

```javascript
module.exports = function(api, options, dirname) {
  return {
    visitor: {
      BinaryExpression(path) {
        const node = path.node;
  
        if (node.operator !== '===') {
          return;
        }
        
        // 使用identifier方法创建node
        node.left = api.types.identifier('abc');
        // 使用numericLiteral方法创建node
        node.right = api.types.numericLiteral(2);
      }
    },
  };
};
```



## ES6箭头函数转换

babel中处理ES6箭头函数用到的插件是 `@babel/plugin-transform-arrow-functions` ，已默认包含在 `@babel/preset-env` 中。

```javascript
// 源代码 input
const arrowFunc = () => {
  console.log(this);
}

// @babel/plugin-transform-arrow-functions 转换后的代码 output
var _this = this;
const arrowFunc = function () {
  console.log(_this);
};
```

AST 对比：

input

![code-ast-before](/images/2024-04-02/code-ast-before.png)



output

![code-ast-after](/images/2024-04-02/code-ast-after.png)



对比可以发现，主要有以下三处不同：

1. 在箭头函数同作用域内额外添加了一个变量声明，`var _this = this`
2. 针对箭头函数的body，调用表达式声明 `ExpressionStatement` 时，传入的 arguments 从 `ThisExpression` 更换成了 `Identifier`
3. 将箭头函数的节点 `ArrowFunctionExpression` 替换成了 `FunctionDeclaration`



上述插件的实现思路如下：

```javascript
module.exports = function(api, options, dirname) {
  return {
    visitor: {
      ArrowFunctionExpression(path) {
        const node = path.node;
        // to do...
      }
    },
  };
};
```

1. 往上查找，直到找到最近顶部非箭头函数的this

   ```javascript
   // nodePath.findParent() 找到特定的父路径，callback携带参数NodePath
   const thisEnvFn = nodePath.findParent((p) => {
     // node.isXXX 检查节点类型
     return (p.isFunction() && !p.isArrowFunctionExpression()) || p.isProgram();
   });
   ```

2. 查找当前作用域中哪些地方用到了this的节点路径，记作 *thisPaths*

   ```javascript
   const thisPaths = [];
   // nodePath.traverse() 遍历路径
   thisEnvFn.traverse({
     ThisExpression(thisPath) {
       thisPaths.push(thisPath);
     },
   });
   ```

3. 生成当前作用域内绑定的this变量别名，得到 `_this{n}` （可能为 _this1, _this2, ...），记作 *thisBindingsName*

   ```javascript
   let n = '';
   let name = '_this';
   
   // nodePath.scope.hasBinding(name) 检查指定变量是否被当前作用域绑定
   if (path.scope.hasBinding(`${name}${n}`)) {
     // 递归处理，返回 _this{+n + 1}
   }
   // 否则直接返回name，即 _this
   ```

4. 生成 `var _this = this` 这句代码中对应的AST节点。

   ```javascript
   // nodePath.scope.push() 在作用域内分配一个变量声明
   thisEnvFn.scope.push({
     id: api.types.identifier(thisBindingsName),
     init: api.types.thisExpression(),
   });
   ```

   

5. 将作用域中用到的 this 替换为 thisBindingsName 的值，即 this 替换为 _this{n}

   ```javascript
   thisPaths.forEach((thisPath) => {
     const replaceNode = api.types.identifier(thisBindingsName);
     // nodePath.replaceWith(nodePath) 替换单个节点
     thisPath.replaceWith(replaceNode);
   });
   ```

   

6. 箭头函数节点类型

   ```javascript
   node.type = 'FunctionDeclaration';
   ```



这样上述代码的AST转换就基本完成了，但是局限性也比较明显，babel箭头函数转换的官方插件（*@babel/plugin-transform-arrow-functions*）源码中的处理其实比这里要考虑的多得多，感兴趣的可以阅读源码，了解更多细节。

