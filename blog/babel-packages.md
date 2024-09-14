---
slug: "/blog/babel-packages"
title: "Babel Packages"
date: "2023-12-27 21:47:28"
brief: "通常我们的项目中都会用到babel，那么了解babel将有助于我们开发自己的组件、项目编译错误问题排查，首先先了解一下babel相关的packages。"
tag: "nodejs"
---



## 环境搭建

babel 编译环境搭建需要以下三个包：

- *@babel/core* 
- *@babel/preset-env*：babel转化代码的规则
- a Babel "runner" ( *@babel/cli*，*babel-loader* [webpack环境]，*@rollup/plugin-babel* [rollup环境]，...)



### babel-loader

 **`webpack`中`loader`的本质就是一个函数，接受我们的源代码作为入参同时返回新的内容。** 

```js
/**
 * 
 * @param source 源代码内容
 * @param options babel-loader相关参数
 * @returns 处理后的代码
 */
async function babelLoader (source, options) {
  // ...
  return targetCode;
}
```

关于`options`，`babel-loader`支持直接通过 `loader` 的参数形式注入，同时也在`loader`函数内部通过读取 `.babelrc`  / `babel.config.js` / `babel.config.json`等文件注入配置。

```javascript
// babel配置文件
{
  "plugins": [],
  "presets": []
}
```

```javascript
// webpack.config.js
{
  module: {
    rules: [
      {
        test: /\.js$/, 
        use: [
          {
            loader: 'babel-loader', 
            options: {
              plugins: [], 
              presets: [], 
            }, 
          }, 
        ], 
      }, 
    ], 
  }, 
}
```



### @babel/core

babel 在编译代码过程中的核心库。

对代码进行 **词法分析--语法分析--语义分析** 处理过程，从而生成 AST 抽象语法树。

babel-core 相当于 `@babel/parser` 和 `@babel/generator` 这两个包的合体。

babel-core 中提供了很多 transform 方法。

```js
const core = require('@babel/core');

/**
 * 
 * @param source 源代码内容
 * @param options babel-loader相关参数
 * @returns 处理结果
 */
async function babelLoader (source, options) {
  let result;
  
  try {
  	// 通过transform方法编译传入的源代码
  	result = await core.transform(source);
  } catch (err) {
     throw new Error(err.message || 'error');
  }
    
  if (!result) return null;
    
  const { ast, code, map } = result;
  return { ast, code, map };
}
```



### @babel/preset-env

babel 转化代码的规则。

```js
const core = require('@babel/core');

/**
 * 
 * @param source 源代码内容
 * @param options babel-loader相关参数
 * @returns 处理结果
 */
async function babelLoader (source, options) {
  let result;
  
  try {
  	// 通过transform方法编译传入的源代码
    result = await core.transform(source, {
      presets: ['@babel/preset-env'],
      plugins: [...]
    });
  } catch (err) {
     throw new Error(err.message || 'error');
  }
    
  if (!result) return null;
    
  const { ast, code, map } = result;
  return { ast, code, map };
}
```



babel 配置注入

1. *package.json* 文件 babel 属性：不常用

2. `.babelrc.*`（版本低于7.x）：扩展名可选 .json , .js , .cjs , .mjs , .cts，扩展名可省略 即 .babelrc

3. `babel.config.*`（版本不低于7.x）：扩展名可选 .json , .js , .cjs , .mjs , .cts 

   工程范围（project-wide）的配置，例：Monorepo



babel-demo工程内的babel配置都使用同一套时：

- `.babelrc` 在 Monorepo 多包工程里面需要在每个子包里面创建一个 .babelrc 

  ```python
  babel-demo
  	.babelrc # babel-demo的配置文件
  	package.json
    packages/
      mod1/
        src/index.js
        package.json
        .babelrc # mod1的配置文件
      mod2/
        src/index.js
        package.json
        .babelrc # mod2的配置文件
  ```

  *mod1/.babelrc* 和 *mod2/.babelrc* 配置如下：

  ```json
  { "extends": "../../.babelrc" }
  ```

- `babel.config.*` 只能放在根目录下，整个工程的配置，包含子包

  ```python
  babel-demo
  	babel.config.json # babel-demo的配置文件
  	package.json
    packages/
      mod1/
        src/index.js
        package.json
      mod2/
        src/index.js
        package.json
  ```

  

## Plugins & Presets

### Plugins

[Babel Plugins List](https://babeljs.io/docs/plugins-list) 



### Presets

Preset 是一些 Plugin 的集成，可以理解为 Preset 是一些 Plugin 整合而成的一个包。

**`@babel/preset-env`** 

`@babel/preset-env`是一个智能预设，它可以将我们的高版本`JavaScript`代码进行转译根据内置的规则转译成为低版本的`javascript`代码。

`preset-env` 内部集成了绝大多数 `plugin`（不低于`Stage 3`）的转译插件，它会根据对应的参数进行代码转译。

> 注意：
>
> [ECMAScript 各个提案](https://github.com/tc39/ecma262)
> ES的提案一共五个阶段，从 Stage 0 到 Stage 4， 一起来看看各个阶段的提案。
>
> - Stage 0 Proposals 潜在想法
> - Stage 1 Proposals 提案
> - Stage 2 Proposals 草稿
> - Stage 3 Proposals 候选人
>
> 1. `@babel/preset-env`不会包含任何低于 Stage 3 的 JavaScript 语法提案。如果需要兼容低于`Stage 3`阶段的语法则需要额外引入对应的`Plugin`进行兼容。
> 2. `@babel/preset-env` 仅仅针对语法阶段的转译，比如转译箭头函数，`const/let`语法。针对一些`Api`或者`Es 6`内置模块的`polyfill`，`preset-env`是无法进行转译的。



**`@babel/preset-react`** 

将jsx进行转义。在 React 中使用 jsx 时，会被编译为 `React.createElement` 

输入代码：

```jsx
import ReactDom from 'react-dom';

const user = { firstName: 'John', lastName: 'Smith' };

const Element = (
  <div>
    <img src="avatar.png" className="profile" />
    <h3>{[user.firstName, user.lastName].join(" ")}</h3>
  </div>
);

ReactDom.render(Element, document.getElementById('root'));
```

编译结果：

```js
import ReactDom from 'react-dom';
const user = {
  firstName: 'John',
  lastName: 'Smith'
};
const Element = /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
  src: "avatar.png",
  className: "profile"
}), /*#__PURE__*/React.createElement("h3", null, [user.firstName, user.lastName].join(" ")));
ReactDom.render(Element, document.getElementById('root'));
```



**`@babel/preset-typescript`** 

对于`TypeScript`代码，我们有两种方式去编译`TypeScript`代码成为`JavaScript`代码。

1. 使用`tsc`命令，结合`cli`命令行参数方式或者`tsconfig`配置文件进行编译`ts`代码。
2. 使用`babel`，通过`babel-preset-typescript`代码进行编译`ts`代码。



输入代码：

```ts
class Student {
  name: string;
  age?: number;

  constructor(name: string, age?: number) {
    this.name = name;
    this.age = age;
  }
  
  showInfo() {
    console.log(`学生姓名：${this.name}，年龄：${this.age}`);
  }
}

const stu = new Student('张三', 18);
stu.showInfo();
```

编译结果：

```js
class Student {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  showInfo() {
    console.log(`学生姓名：${this.name}，年龄：${this.age}`);
  }
}
const stu = new Student('张三', 18);
stu.showInfo();
```



### 执行顺序

```json
{
  "plugins": [],
  "presets": [
    "@babel/preset-env",
    "@babel/preset-react",
    "@babel/preset-typescript"
  ]
}
```

- Plugins run before Presets.   Plugin 先于 Preset 执行
- Plugin ordering is first to last.  Plugin 的执行顺序：从前往后
- Preset ordering is reversed (last to first).  Preset 的执行顺序：从后往前



## 使用Polyfill

ECMAScript 每次版本更新方向：

1. 新的 语法。e.g. 箭头函数，let / const
2. 新的 API。 e.g. Promise
3. 新的 实例/静态方法。e.g. String.prototype.include，Array.from

babel-preset-env 只会转化新的 es 语法，不会转化 新的API 和 实例/静态方法。

如果想在低版本浏览器中识别并运行新的API、实例方法、静态方法，就需要额外引入 polyfill（代码填充/兼容性补丁）补充实现这部分内容的低版本代码实现。

关于 polyfill 方面，babel 提供了三个相关的包：

- `@babel/polyfill` 
- `@babel/runtime` 
- `@babel/plugin-transform-runtime` 



实现方式：

1. @babel/polyfill + @babel/preset-env 的 useBuiltIns 参数
2. @babel/plugin-transform-runtime + @babel/runtime



### @babel/polyfill

**简介**

原理：通过在全局对象上添加属性、直接修改内置对象、在内置对象的 prototype  上添加方法实现。

比如说我们需要支持`String.prototype.include`，在引入`babelPolyfill`这个包之后，它会在全局`String`的原型对象上添加`include`方法从而支持我们的`Js Api`。

缺点：这种往全局对象/内置对象上挂载属性的实现方式，会造成全局污染。



**应用**

在 `@babel/preset-env`中存在一个`useBuiltIns`参数，这个参数决定了如何在`preset-env`中使用`@babel/polyfill`。

`useBuiltIns` : `"usage"`| `"entry"`| `false ` 

```json
{
    "presets": [
        ["@babel/preset-env", {
            "useBuiltIns": false
        }]
    ]
}
```

**`false`**

使用`preset-env`传入`useBuiltIns`参数时，默认为`false`。它表示仅仅会转化最新的`ES`语法，并不会转化任何`API`和方法。 

e.g.

配置：

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": false
      }
    ]
  ],
  "plugins": []
}
```



**`entry`** 

当传入`entry`时，需要在项目入口文件中手动引入一次 polyfill 包，它会根据我们配置的浏览器兼容性列表(`browserList`) 然后**全量**引入不兼容的 polyfill 。

> 注意:  
>
> 1. 在 Babel 7.4.0 之后，`@babel/polyfill ` 被废弃，它变成了另外两个包的集成。`core-js/stable` 和 `regenerator-runtime/runtime` 。它们的使用方式一致，只是在入口文件中引入的包不同了。
> 2. 使用 `useBuiltIns:entry/usage` 时，需要额外指定 `corejs` 这个参数。默认为使用 `core-js 2.0`，所谓的 `corejs` 就是我们上文讲到的“垫片”的实现。它会实现一系列内置方法以及 `Promise` 等API。
> 3.  `core-js 2.0`版本是跟随`preset-env`一起安装的，不需要单独安装。



项目入口文件：

```js
// 需要额外引入polyfill
// Babel版本低于7.4.0 直接引入@babel/polyfill (此时使用core-js@2)
import "@babel/polyfill";

// Babel版本高于7.18.0
import 'core-js/stable';
import 'regenerator-runtime/runtime'; // 让generators（生成器）和 async functions（异步函数）正常工作
```

babel配置文件：

```json
{
    "presets": [
        ["@babel/preset-env", {
            "useBuiltIns": "entry",
            "corejs": 3
        }]
    ]
}
```

输入：

```javascript
import 'core-js/stable';
import 'regenerator-runtime/runtime';

const arr = [1];

// 使用了 Array.protototype.includes 方法
const result = arr.includes(2);

console.log(result, 'result');
```



**`usage`** 

根据配置的浏览器兼容列表、代码中 **使用到的`API` 进行引入`polyfill`并按需添加。**

当使用`usage`时，我们不需要额外在项目入口中引入`polyfill`了，它会根据我们项目中使用到的进行按需引入。

package.json

[browsersl.ist](https://browsersl.ist/) 

```json
{
    "browserslist": [
        "> 0.5%",
        "last 2 versions",
        "not ie <= 10"
      ]
}
```

.babelrc   也可以在 @babel/preset-env 的 targets 里面配置 "> 0.5%, last 2 versions and not ie <= 10"

```json
{
    "presets": [
        ["@babel/preset-env", {
            "useBuiltIns": "usage",
            "corejs": 3
        }]
    ]
}
```

编译结果：

```javascript
"use strict";

require("core-js/stable");
require("regenerator-runtime/runtime");
var _moduleOne = require("./module-one");
var _moduleTwo = _interopRequireDefault(require("./module-two"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var result = (0, _moduleOne.addCbrt)(1, 8) + _moduleTwo["default"].declineCbrt(1, 8);
console.log(result);
```





`usage` 和 `entry` 的区别

以项目中引入`Promise`为例。

当我们配置`useBuintInts:entry`时，仅仅会在入口文件全量引入一次`polyfill`。可以这样理解：

```js
// 入口文件：引入一系列实现polyfill的方法
global.Promise = promise
```

```js
// 其他文件使用时
const a = new Promise()
```

使用 `useBuintIns:usage` 时，`preset-env` 只能基于各个模块去分析它们使用到的 `polyfill` 从而进入引入。

```js
// a.js
import "core-js/modules/es.promise";

...
```

```js
// b.js
import "core-js/modules/es.promise";

...
```

- 在使用 `usage` 时因为是模块内部局部引入`polyfill` 所以会按需在相关模块内进行引入，而 `entry` 则会在代码入口中一次性引入。
- 在`usage`情况下，如果存在很多个模块，就会多出很多冗余代码（`import`语法）。



###  `@babel/runtime` 

**按需加载的解决方案**，比如哪里需要使用到`Promise`，`@babel/runtime`就会在他的文件顶部添加`import promise from 'babel-runtime/core-js/promise'`。

对于 `preset-env`的 `useBuintIns` 配置项，polyfill 是 `preset-env` 帮我们智能引入的，而`babel-runtime`则会将引入方式由智能完全交由我们自己，我们需要什么自己引入什么。

```js
// a.js 中需要使用Promise 我们需要手动引入对应的运行时polyfill
import Promise from 'babel-runtime/core-js/promise'

const promsies = new Promise();
```

`babel-runtime`在我们手动引入一些`polyfill`的时候，它会给我们的代码中注入一些类似`_extend()` 、`classCallCheck()`之类的工具函数，这些工具函数的代码会包含在编译后的每个文件中，比如：

```js
class Circle {}
// babel-runtime 编译Class需要借助_classCallCheck这个工具函数
function _classCallCheck(instance, Constructor) { //... } 
var Circle = function Circle() { _classCallCheck(this, Circle); };
```

存在的问题：

- `babel-runtime`无法做到智能化分析，需要我们手动引入。
- `babel-runtime`编译过程中会重复生成冗余代码。



### `@babel/plugin-transform-runtime` 

**简介**

会智能化的分析我们的项目中所使用到需要转译的`js`代码，从而实现模块化从`babel-runtime`中引入所需的`polyfill` 实现。

这个插件提供了一个`helpers`参数，开启后可以将上边提到编译阶段重复的工具函数，比如`classCallCheck, extends` 等代码转化称为`require`语句。此时，这些工具函数就不会重复的出现在使用中的模块中了。比如这样：

```js
// @babel/plugin-transform-runtime会将工具函数转化为require语句进行引入
// 而非runtime那样直接将工具模块代码注入到模块中
var _classCallCheck = require("@babel/runtime/helpers/classCallCheck"); 
var Circle = function Circle() { _classCallCheck(this, Circle); };
```



**配置**

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs": 3,
        "helpers": true
      }
    ]
  ]
}
```



## Other Packages

babel 底层开发相关，便于处理AST

- @babel/parser

- @babel/generator

- @babel/types

- @babel/traverse



**@babel/register** 

在前端的项目中通常会结合各种构建工具与`babel`配合使用，这样可以更好地将需要处理的文件交给`babel`进行编译；而在`nodejs`中`babel`并不是其核心`API`的一部分，如果我们想在`nodejs`中使用`babel`进行转译我们的文件，就可以通过`babel/regiseter`针对于`require`语句引入的文件交给`babel`去`transform`。从而达到在`nodejs`进行转译`js`文件。

```javascript
// index.js
require('@babel/register')
const data = require('./register');

console.log(`${data}`, 'data');

// register.js
const arrowFunction = () => {
  console.log('Hello World');
};

module.exports = arrowFunction;

// babelrc
{
  "presets": ["@babel/preset-env"]
}
```



## 参考资料

- [稀土掘金 - 19组清风 -《「前端基建」带你在Babel的世界中畅游》](https://juejin.cn/post/7025237833543581732)
