---
slug: '/blog/visual-layout-ui'
title: '可视化拖拽（小程序）布局编辑器'
date: '2022-04-05 15:52:30'
brief: 'PC端的布局比较复杂，拖拽布局实现起来复杂度和难度都较高，目前暂时只考虑小程序的，等今后遇到PC端的实际项目需求再继续深究。本篇基于vue实现了比较简易的可视化拖拽（小程序）布局编辑器。'
tag: 'vue'
---



### 需求背景

网上有许多类似可视化拖拽布局的业务需求，我一直以来也都有关注，但对于其中的一些细节还有些疑惑。直到看到了 [《手把手带你写 Vue 可视化拖拽页面编辑器》](https://juejin.cn/post/6924156555617271821) 这篇文章，通过作者细致的讲解，终于明白了实现思路。



### 实现效果

#### 静态效果图

![静态效果图](/images/visual-layout-ui.png)



#### 动态效果图

![动态效果图](/images/visual-layout-ui.gif)



### 实现思路

#### 拖拽行为

给元素设置 `draggable` 为 `true` ，使得它能够被拖拽；

使用自定义属性 `data-type` 来标识被拖拽的元素要对应放入的组件类型。

```vue
<template>
  <ul
    class="component-list clearfix"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <li
      class="component-item"
      v-for="item in componentList"
      :key="item.type"
      :draggable="true"
      :data-type="item.type"
    >
      <i :class="['component-item__icon', 'icon-' + item.icon]"></i>
      <span class="component-item__title">{{ item.title }}</span>
    </li>
  </ul>
</template>
```



#### 拖拽过程处理

在拖拽事件 `dragover` 和 `drop` 中添加 `e.preventDefault()` 让元素能够重叠在目标容器上方。

添加 ` e.stopPropagation()` ，此处没必要冒泡。

还需要记录几个状态：

- 当前是否处于拖拽状态 `isDragging` 
- 当前拖拽的元素对应的组件类型 `draggingViewType` 
- 是否已经在预览视图中放入了此次拖拽对应的组件 `hasPush` 



##### 开始拖拽 `dragstart` 

- `isDragging` -> true
- `draggingViewType` -> 被拖拽元素的 `data-type` 



##### 拖拽过程中 `dragover` 

一旦拖拽元素进入目标容器，就要向目标容器中添加对应的组件。

```javascript
const className =
      e.target.className !== 'view-content' ? 'item' : 'view-content'
let defaultData
if (!hasPush.value) {
  const { data, options } = componentList[draggingViewType.value]
  defaultData = {
    type: draggingViewType.value,
    status: 2, // 2=渲染成占位组件，1=渲染成对应的视图组件
    id: Date.now(),
    data: data ? JSON.parse(JSON.stringify(data)) : [],
    options: options ? JSON.parse(JSON.stringify(options)) : {},
  }
}
```

添加的位置是个问题，需要处理。

如果视图容器中尚未添加对应组件，且需要放入的位置是外层视图容器的空白区域，无其他组件，那么可以直接释放；

```javascript
if (className === 'view-content') {
  if (!hasPush.value) {
    draggingViewIndex.value = views.value.length
    hasPush.value = true
    views.value.push(defaultData)
  }
} else {
  // ...
}
```

如果需要放入的位置正好有其他组件，那么要根据当前拖拽的位置在该组件的上/下半部分而定，上半部分就插在前面，下半部分就插在后面。

如果是已经生成了对应组件但鼠标一直未释放，此时就要移动原来生成的组件到当前位置。

```javascript
let [y, h, curIndex] = [
  e.offsetY,
  e.target.offsetHeight,
  +e.target.dataset.index,
]

// 鼠标所处在元素的位置，决定组件释放在当前元素的上下方
let direction = y < h / 2
if (!hasPush.value) {
  // 第一次插入
  if (direction) {
    views.value.splice(curIndex, 0, defaultData)
  } else {
    curIndex += 1
    views.value.splice(curIndex, 0, defaultData)
  }
} else {
  // moving
  let i
  if (direction) {
    i = curIndex === 0 ? 0 : curIndex - 1
  } else {
    i = curIndex + 1
  }

  // 拖拽位置正好是原先要放入的位置
  if (i < views.value.length && views.value[i].status === 2) return

  const blockData = views.value.splice(draggingViewIndex.value, 1)
  views.value.splice(curIndex, 0, blockData[0])
}

draggingViewIndex.value = curIndex
hasPush.value = true
```



##### 拖拽结束，释放鼠标 `drop` & `dragend`

相关状态复位，以及将新生成的组件的 `status` 修改为 1 表示可以渲染视图（此前渲染的是占位用的）。



##### 视图容器内的组件拖拽排序

使用 `vuedraggable` 实现。



#### 配置组件数据

视图内的组件数据格式如下：

```javascript
[
  {
    type: "header",
    options: {
      title: '页面标题', 
      desc: '', 
      backgroundColor: '#f8f8f8', 
      bottomTabsEnable: true,
      bottomTabsData: [
        {
          id: 1649153768776,
          link: "", // 跳转地址
          name: "菜单",
          url: "" // 图片地址
        }
      ]
    },
  },
  {
    id: 1649153748781, // 组件标识，以防使用多个同类型组件
    type: "tab",
    options: { // 样式等参数设置
      themeColor: '#409eff'
    },
    data: [ // 数据源
      {id: 1, title: '推荐', link: ''},
      {id: 2, title: '搜索', link: ''},
      {id: 3, title: '我的', link: ''},
    ],
    status: 1,
  },
  {
    id: ,
    type: "banner",
    data: [
    	{
    		id: 1649154143475, 
    		name: 'banner1.jpeg', 
    		link: '', // 跳转地址
    		url: '', // 图片地址
  		},
  		{
        {
        	id: 1649154143477, 
        	name: 'banner2.jpeg', 
        	link: '', // 跳转地址
        	url: '' // 图片地址
      }
    ],
  	options: { // 样式等参数设置
      indicatorType: "rect"
    }
  }
]
```

这份数据需要传入中间的视图预览组件和右侧的面板参数配置组件。

使用Vue提供的动态组件 `<component is="" />` 来渲染对应的面板组件。



核心的思路总结完毕，但目前只处理了一个页面的拖拽布局，后续待到时间充裕时还需要添加多个页面，实现页面间的导航。