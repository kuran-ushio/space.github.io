---
slug: "/blog/dnd-kit-base-usage"
title: "基于@dnd-kit处理拖拽应用"
date: "2023-06-07 20:41:04"
brief: "上个月听同事分享了HTML5原生拖拽API的基本用法，在实际项目中觉得较为繁琐，于是去了解了当下比较流行的拖拽库，增长工具储备。"
tag: "react"
---



## 背景描述

在 **HTML5 Drag and Drop API** 诞生之前，处理元素拖动相关的需求一般是通过以下原生API实现的：

- [MouseEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent) 鼠标事件：`mousedown`  /  `mousemove`  /  `mouseup` 
- [TouchEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/TouchEvent) 触摸事件：`touchstart`  /  `touchmove`  /  `touchend` 
- [KeyboardEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent) 键盘事件：`keydown` 



然后，**HTML5 Drag and Drop API** 诞生了，它有以下显著特点：

1. 支持从桌面拖拽，支持窗口间拖拽
2. 只支持鼠标事件，不支持触摸设备和键盘事件 
   - Event ← UIEvent ← MouseEvent ← DragEvent / PointerEvent
   - Event ← UIEvent ← TouchEvent
   - Event ← UIEvent ← KeyboardEvent

![Event API继承关系](/images/2023-06-07/event-api.png)



## 方案对比

因此，对于拖拽库的封装就有两种选择：是否使用 HTML5 拖拽 API 。

**`react-dnd`** 

- 依赖 `redux` 
- 还需要安装 `react-dnd-html5-backend` 或 `react-dnd-touch-backend`，前者用 HTML5拖拽API 实现鼠标拖拽，后者则使用HTML5拖拽API诞生之前的实现方式



**`@dnd-kit`** 

- 没有引入额外的第三方库，使用 React 中的 `useReducer` 、`useContext` 
- 使用HTML5拖拽API诞生之前的实现方式，并在此基础上添加了对于 **[PointerEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/Pointer_events)** （指针事件，一个用来处理鼠标、触控笔、单点或多点的手指触摸的统一DOM事件模型）的支持。



为什么选择 `@dnd-kit` ?

- 业务中无需支持从桌面拖拽、窗口间拖拽的功能；
- 支持鼠标、键盘、触摸操作，支持添加参数设置操作限制；
- 内置了基础的碰撞检测算法，支持自定义；
- 便于添加过渡动画，提升交互体验。



## 开始使用

### 官方文档

https://dndkit.com/



### 核心概念

- 拖拽的上下文环境 `<DndContext>`  嵌套在这里面的才能应用拖拽

- 可拖拽元素（`Draggable elements`）：将 `useDraggable` 返回的参数传递给组件

  - attributes  html标签属性，如 role、tabindex 等
  - setNodeRef 绑定被拖拽Node节点
  - listeners 被拖拽Node节点添加事件监听器
  - transform 可获取Node节点当前位置坐标等数据
  - 构建时在 data 中传入自定义数据，可以在拖拽的时候获取到构建时传入 
  - disabled (类型：boolean) 可以控制节点是否能被拖拽

  ![代码1](/images/2023-06-07/dnd-kit-code-1.png)

  ![代码2](/images/2023-06-07/dnd-kit-code-2.png)

- 可拖拽区域（`Droppable areas`）：将 `useDroppable` 返回的参数传递给组件

- 传感器（`Sensors`）：鼠标、触摸、键盘

- 添加拖拽的一些限制（`Modifiers`）

- 拖拽中的特色场景——拖拽列表：`<SortableContext>` 和 `useSortable` 结合使用

  ![代码3](/images/2023-06-07/dnd-kit-code-3.png)

  ![代码4](/images/2023-06-07/dnd-kit-code-4.png)



## 基础示例

1. 在页面中拖拽元素

   ![在页面中拖拽元素](/images/2023-06-07/dnd-kit-demo-1.png)

   列表拖拽

   ![列表拖拽](/images/2023-06-07/dnd-kit-demo-2.png)

   嵌套列表拖拽

   ![嵌套列表拖拽](/images/2023-06-07/dnd-kit-demo-3.png)

2. @dnd-kit 官方示例(https://master--5fc05e08a4a65d0021ae0bf2.chromatic.com/?path=/story/core-draggable-hooks-usedraggable--basic-setup) 

   @dnd-kit 源码[包含示例](https://github.com/clauderic/dnd-kit) 