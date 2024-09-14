---
slug: "/blog/monorepo-styled-project"
title: "Monorepo风格的项目搭建"
date: "2023-09-27 19:57:43"
brief: "查看babel源码发现babel项目的结构与平时所搭建的业务项目不太一样，为了了解这种项目结构及适用场景，以搭建一个简单的脚手架为例简单学习一下。"
tag: "nodejs"
---



## 基于npm搭建

> Multi-repo风格的工程 + npm link 本地调试



### 声明命令

目录结构如下：

![project-structure](/images/2023-08-28/project-structure.png)

*package.json* 

```json
{
  "name": "template-cli",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "bin": {
    "template": "./bin/index.js"
  }
}
```

```javascript
// index.js
console.log('welcome to the world of template-cli')
```

如同 vue-cli 这个脚手架安装完成可以直接使用vue create xxx 命令一样，能直接使用自己声明的 template 命令执行index.js文件中的代码。

为了实现本地调试脚手架的能力：使用 npm link 命令。

![cli-command](/images/2023-08-28/cli-command.png)

报错提示 语法错误？因为我们没有给这个index.js 文件指定解释器。

```javascript
#!/user/bin/env node

console.log('welcome to the world of template-cli')
```



### Shebang

> 参考链接： [Shebang 是什么？](https://www.jianshu.com/p/c629b834767f)

`#!` 被称为 **shebang** 

这种字符组合在脚本**第一行**使用时具有特殊意义，用于指定默认情况下运行给定脚本的**解释器** 

例如： `#!` 紧接解释器的完整路径

```shell
#!/usr/bin/bash
```

解释器应该是 **bash shell** 

```shell
#!/usr/bin/zsh
```

使用的解释器是 **Z shell** 



使用 **env** 的写法可以使**脚本更加可移植** 。

```shell
#!/user/bin/env node
```

因为它会使用**环境变量中的 `PATH`** 变量来查找解释器，而不是硬编码解释器的路径。这样，即使解释器在不同的系统上安装在不同的路径上，也可以确保脚本在任何地方都能够正常运行。

> 但是由于从环境变量中寻找解释器，会**造成一定的安全隐患。** 因为我们可以伪造一个假的命令，写入到环境变量中靠前的位置，这样，脚本就会使用我们伪造的解释器执行。



### npm link

> 参考链接：[npm Docs - npm link](https://docs.npmjs.com/cli/v8/commands/npm-link)

#### 基本用法

建立链接

![image-20230828145030453](/images/2023-08-28/20230828145030453.png)

这样就成功声明了 `template` 命令。

删除链接 **`npm unlink`** 

![image-20230828163707759](/images/2023-08-28/20230828163707759.png)



#### `npm link` 干了什么？

**第一步：在package的目录下直接执行 `npm link` （不带其他参数）。** 

获取全局安装的包目录位置（global folder）

```shell
npm prefix -g

# Windows默认位置 C:\Users\Administrator\AppData\Roaming\npm
# Mac系统 + nvm 默认位置  /Users/xxx/.nvm/versions/node/v18.17.1
# 以下统一记录该返回值为 {prefix}
```

- 在 `{prefix}/node_modules` [windows]  /  `{prefix}/lib/node_modules` [mac] 中就会创建该 package 的软链接（里面就是我们写的代码，在代码里修改，此处目录中的内容也会同步更新）。

	![image-20230828155041722](/images/2023-08-28/20230828155041722.png)

- 在 `{prefix}` [windows]  /  `{prefix}/bin` [mac] 中就会创建该 package 下所有使用 bin 定义的命令。

  ![image-20230828154842817](/images/2023-08-28/20230828154842817.png)

**第二步：在其它位置执行 `npm link package-name` 。**

从上一步全局安装的 package-name 中创建一个符号链接到当前位置的 `node_modules/` 。

![image-20230906160057551](/images/2023-08-28/20230906160057551.png)



总之， **`npm link`**  可以帮助我们模拟包安装后的状态，让本地的包就好像 install 过一样，可以直接使用。



#### 缺点

 Multi-repo

- 本地已经安装了npm上已发布的正式版本，会与本地开发版本冲突。

- 本地在维护多个版本。

  template-cli@1.0.0 — 本地仓库A的代码，template-cli@2.0.0 — 本地仓库B的代码

  在仓库A使用  `npm link`  => 运行 `template` 命令执行仓库A的代码

  在仓库A使用 `npm unlink` 删除之前的链接，在仓库B使用  `npm link`  => 运行 `template` 命令执行仓库B的代码

- 如果同时依赖了多个本地开发的包，需要在每个包中执行命令。



#### 解决方案

主流的开源包（例如 [babel](https://github.com/babel/babel)  [react](https://github.com/facebook/react) [vue2](https://github.com/vuejs/vue)  [vue3](https://github.com/vuejs/core)  [vue-cli](https://github.com/vuejs/vue-cli) ）基本都是用 **monorepo** *(Monolithic Repository)* 的形式管理的。

monorepo 是多个包在同一个项目中管理的方式，是很流行的项目组织形式。



babel 、react => yarn workspace

vue2、vue3、vite => pnpm workspace

vue-cli => lerna



## pnpm monorepo 风格的脚手架工程

> [pnpm workspace](https://pnpm.io/zh/workspaces) 
>
> **npm scripts 和 bin 字段**
>
> 在 package-A 中用 bin 字段声明的命令，才能在 package-B 中 scripts 字段使用。
>
> ```shell
> # npm-run-script
> # 在传递grep参数前面再加 -- 表示参数传递给test命令，而不是npm
> npm run test -- --grep="pattern"
> ```
>



### 项目基本结构

**目录结构**

```shell
|-- paper                       -------- 项目根目录
    |-- examples
        |-- app                 -------- 调试子工程
        	|-- package.json
    |-- packages
        |-- paper-cli           -------- 子工程
        	|-- package.json
    |-- package.json
	|-- pnpm-workspace.yaml     -------- 工作空间配置文件
```



**pnpm-workspace.yaml 文件配置**

```yaml
packages: 
  - 'packages/*' 
  - 'examples/*'
```

配置后，声明了 *packages* 和 *examples* 目录中的子工程是同属一个工作空间的，工作空间中的子工程编译打包的产物都可以被其它子工程引用。



**初始化子工程**

在 *packages* 文件夹中新建 *paper-cli* 目录，进入该目录后使用 `pnpm init` 命令初始化工程，成功后在该目录下就生成了一个 *package.json* 文件，在其中添加 `bin` 字段，来声明 `paper` 命令。

```json
{
  "name": "paper-cli",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "bin": {
    "paper": "./bin/index.js"
  }
}
```

在 *paper-cli/bin/index.js* 文件编写代码：

```javascript
#!/usr/bin/env node

console.log('welcome to the world of paper-cli')
```



**初始化调试子工程**

在 *examples* 文件夹中新建 *app* 目录，进入该目录后使用 `pnpm init` 命令初始化工程，成功后在该目录下就生成了一个 *package.json* 文件。

1.  在 *package.json* 中添加 `dependencies` 字段，添加本地的 **`paper-cli`** 依赖，再给 `scripts` 增加一条自定义脚本命令。

   ```json
   {
     "name": "app",
     "version": "1.0.0",
     "description": "",
     "main": "index.js",
     "scripts": {
       "paper": "paper",
       "test": "echo \"Error: no test specified\" && exit 1"
     },
     "keywords": [],
     "author": "",
     "license": "ISC",
     "dependencies": {
       "paper-cli": "workspace:*"
     }
   }
   ```

2. 最外层根目录下运行 `pnpm i` 命令，安装依赖。

![image-20230829151244255](/images/2023-08-28/20230829151244255.png)



### 脚手架必备的模块

![dependences](/images/2023-08-28/dependences.png) 



#### 命令参数模块

##### process解析参数

```javascript
#!/usr/bin/env node

const process = require('process');
console.log(process.argv);
```

脚手架提供的 `paper` 命令后面还可以设置参数，标准的脚手架命令参数需要支持两种格式，比如：

```shell
paper --name=abc

paper --name abc
```

通过 `process.argv` 来获取：

![image-20230829161219656](/images/2023-08-28/20230829161219656.png)

![image-20230829161330447](/images/2023-08-28/20230829161330447.png)

```shell
# 参数前面加上 -- 表示参数传递给 paper 命令，而不是 pnpm
pnpm paper -- --name=abc
```



需要额外处理两种不同的命令参数格式，不方便。



#####  yargs 开源库解析参数

--F 是 --filter 的简写

![image-20230829162149898](/images/2023-08-28/20230829162149898.png)



创建子命令

```javascript
#!/usr/bin/env node

const yargs = require('yargs');

// 设置子命令 create
yargs.command(
  ['create', 'c'],
  '新建一个模板',
  function (yargs) {
    return yargs.option('name', {
      alias: 'n',
      demandOption: true,
      describe: '模板名称',
      type: 'string',
    });
  },
  function (argv) { // 指的是这里能顺利接收到
    console.log('argv', argv);
  }
).argv; // .argv 要写，否则 handler 中接收不到参数
```

![image-20230829163915256](/images/2023-08-28/20230829163915256.png)

![image-20230829163948](/images/2023-08-28/20230829163948.png)





#### 用户交互模块

**inquirer**  注意版本号

```shell
pnpm add inquirer@8.2.6 --F paper-cli
```



> https://www.npmjs.com/package/inquirer 
>
> ![image-20230831093136996](/images/2023-08-28/20230831093136996.png)



![image-20230831142033285](/images/2023-08-28/20230831142033285.png)



子命令的参数信息查询，在输错参数的时候就能看到

![image-20230831142408736](/images/2023-08-28/20230831142408736.png)



#### 目录拷贝模块

**copy-dir** 

重点注意文件路径的写法！！！

```javascript
#!/usr/bin/env node

const path = require('path');
const yargs = require('yargs');
const { inquirerPrompt } = require('./inquirer');
const { checkMkdirExists, copyDir } = require('./copy');

// 设置子命令 create
yargs.command(
  ['create', 'c'],
  '新建一个模板',
  function (yargs) {
    return yargs.option('name', {
      alias: 'n',
      demandOption: true,
      describe: '模板名称',
      type: 'string',
    });
  },
  async function (argv) {
    console.log('argv', argv);

    try {
      const answers = await inquirerPrompt(argv);
      console.log('answers', answers);

      const { name, type } = answers;
      const isMkdirExists = checkMkdirExists(
        path.resolve(process.cwd(), `./src/pages/${name}`)
      );

      if (isMkdirExists) {
        throw new Error(`${name} directory already exists`);
      } else {
        console.log('from', path.resolve(__dirname, `./template/${type}`));
        console.log('to', path.resolve(process.cwd(), `./src/pages/${name}`));
        
        copyDir(
          path.resolve(__dirname, `./template/${type}`),
          path.resolve(process.cwd(), `./src/pages/${name}`)
        );
      }
    } catch (err) {
      console.log(err);
    }
  }
).argv;
```



![image-20230831152902032](/images/2023-08-28/20230831152902032.png)



##### 目录守卫

文件夹不存在时就创建

![image-20230831154440339](/images/2023-08-28/20230831154440339.png)



再次运行该命令

![image-20230831163353357](/images/2023-08-28/20230831163353357.png)



```javascript
#!/usr/bin/env node

const path = require('path');
const yargs = require('yargs');
const { inquirerPrompt } = require('./inquirer');
const { checkMkdirExists, copyDir } = require('./copy');

// 设置子命令 create
yargs.command(
  ['create', 'c'],
  '新建一个模板',
  function (yargs) {
    return yargs.option('name', {
      alias: 'n',
      demandOption: true,
      describe: '模板名称',
      type: 'string',
    });
  },
  async function (argv) {
    console.log('argv', argv);

    try {
      const answers = await inquirerPrompt(argv);
      console.log('answers', answers);

      const { name, type } = answers;
      const isMkdirExists = checkMkdirExists(
        path.resolve(process.cwd(), `./src/pages/${name}`)
      );

      if (isMkdirExists) {
        console.log(`${name} directory already exists`);
        return;
      } else {
        console.log('from', path.resolve(__dirname, `./template/${type}`));
        console.log('to', path.resolve(process.cwd(), `./src/pages/${name}`));

        copyDir(
          path.resolve(__dirname, `./template/${type}`),
          path.resolve(process.cwd(), `./src/pages/${name}`)
        );
      }
    } catch (err) {
      console.log(err);
    }
  }
).argv;
```



#### 文件拷贝模块

![image-20230831171014312](/images/2023-08-28/20230831171014312.png)



#### 动态文件生成模块

```shell
pnpm add mustache --F paper-cli
```

![image-20230901111422101](/images/2023-08-28/20230901111422101.png)



![image-20230901111512779](/images/2023-08-28/20230901111512779.png)



#### 自动安装依赖模块

ora 注意版本号 不支持CommonJS导入语法

![image-20230901171215754](/images/2023-08-28/20230901171215754.png)



参考资料：

1. https://zhuanlan.zhihu.com/p/621073227
2. [Monorepo VS Multi-repo] https://zhuanlan.zhihu.com/p/632244532 