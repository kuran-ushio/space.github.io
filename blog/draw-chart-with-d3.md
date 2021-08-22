---
slug: "/blog/draw-chart-with-d3"
title: "d3.js 绘制svg图表初探"
date: "2019-08-22 20:45:41"
brief: "目前echarts提供的配置项暂时无法较高的定制需求，转而尝试d3.js绘制需求中的svg图表。"
tag: "d3"
cover: "1586317236748.png"
---

## svg图表绘制效果

效果1：d3绘制图表-logbook
![效果1：d3绘制图表-logbook](/images/1586317214860.png)

效果2: d3绘制图表-trends
![效果2: d3绘制图表-trends](/images/1586317236748.png)

### svg图表交互效果
效果1：d3绘制图表-logbook
![效果1：d3绘制图表-logbook](/images/svg-chart-logbook.gif)

效果2: d3绘制图表-trends
![效果2: d3绘制图表-trends](/images/svg-chart-trends.gif)


## 知识点学习整理

### API文档相关

- [D3.js Graph Gallery](https://www.d3-graph-gallery.com/index.html) 
- [D3.js v3 API 中文文档](https://github.com/d3/d3/wiki/API--%E4%B8%AD%E6%96%87%E6%89%8B%E5%86%8C) 
- [D3.js v4.x API 中文文档](https://github.com/tianxuzhang/d3.v4-API-Translation) 



### 比例尺

`svg` 左上角为原点。（进行 transform 变换前的初始原点坐标）

#### `d3.scaleLinear()` 连续线性比例尺

适用于 **连续线性的数据** 映射到 **连续线性的范围** 。

例如，建立水平方向（从左到右）的比例尺。

```js
  const chart = {
    WIDTH: 800,
    HEIGHT: 520,
    X_AXIS_HEIGHT: 30,
    Y_AXIS_WIDTH: 44,
    SPACE_WIDTH: 10
  }
  
  d3.scaleLinear()
    .domain([0, 24 * 3600])
    .range([chart.Y_AXIS_WIDTH, chart.WIDTH - chart.SPACE_WIDTH * 2]);
```

例如，建立垂直方向（从下到上）的比例尺。

```js
const chart = {
  WIDTH: 800,
  HEIGHT: 520,
  X_AXIS_HEIGHT: 30,
  Y_AXIS_WIDTH: 44,
  SPACE_WIDTH: 10,
  X_AXIS_LABELS: ["12 am", "3 am", "6 am", "9 am", "12 pm", "3 pm", "6 pm", "9 pm"],
  COLORS: ["#00a0e9", "#77c332", "#ff0000"]
}

d3.scaleLinear()
  .domain([0, 31])
  .range([chart.HEIGHT, chart.X_AXIS_HEIGHT]);
```



####  `d3.scalePoint()` 序数点比例尺

适用于 **离散的数据** 映射到 **连续线性的范围** 。

```js
const chart = {
  WIDTH: 800,
  HEIGHT: 520,
  X_AXIS_HEIGHT: 30,
  Y_AXIS_WIDTH: 44,
  SPACE_WIDTH: 10,
  X_AXIS_LABELS: ["12 am", "3 am", "6 am", "9 am", "12 pm", "3 pm", "6 pm", "9 pm"],
  COLORS: ["#00a0e9", "#77c332", "#ff0000"]
}

const gridWidth = chart.WIDTH - chart.Y_AXIS_WIDTH - chart.SPACE_WIDTH * 2;

d3.scalePoint()
  .domain([0, 1, 2, 3, 4, 5, 6, 7])
  .range([
  	chart.Y_AXIS_WIDTH + gridWidth / 16,
  	chart.WIDTH - chart.SPACE_WIDTH * 2 - gridWidth / 16
	]);
```



#### `d3.scaleOrdinal()` 序数比例尺

适用于 **离散的数据** 映射到 **离散的范围** 。

```js
const chart = {
  WIDTH: 800,
  HEIGHT: 520,
  X_AXIS_HEIGHT: 30,
  Y_AXIS_WIDTH: 44,
  SPACE_WIDTH: 10,
  X_AXIS_LABELS: ['12 am', '3 am', '6 am', '9 am', '12 pm', '3 pm', '6 pm', '9 pm'],
  COLORS: ['#00a0e9', '#77c332', '#ff0000']
}

d3.scaleOrdinal()
  .domain([0, 1, 2])
  .range(chart.COLORS);
```



### 插入新元素并绑定数据

```js
d3.select()
  .selectAll()
  .data()
  .enter()
  .append()
  .attr()
  .style()
```

```js
const dataset = [
  {
    time: 6 * 3600,
    value: 4.1,
    level: 0
  },
  {
    time: 11 * 3600 + 32 * 60,
    value: 6.9,
    level: 1
  },
  {
    time: 17 * 3600,
    value: 17.2,
    level: 2
  }
];

const chart = {
  WIDTH: 800,
  HEIGHT: 520,
  X_AXIS_HEIGHT: 30,
  Y_AXIS_WIDTH: 44,
  SPACE_WIDTH: 10,
  COLORS: ['#00a0e9', '#77c332', '#ff0000']
}

const xScale = d3.scaleLinear()
	.domain([0, 24 * 3600])
	.range([chart.Y_AXIS_WIDTH, chart.WIDTH - chart.SPACE_WIDTH * 2]);

const yScale = d3.scaleLinear()
	.domain([0, 31])
	.range([chart.HEIGHT, chart.X_AXIS_HEIGHT]);

const colorScale = d3.scaleOrdinal()
	.domain([0, 1, 2])
	.range(chart.COLORS);

// 获取已存在的dom元素
d3.select('.data-dot-container')
	// 选中那些待插入的新元素，参数传入字符串名
  .selectAll('dot')
	// 绑定的数组数据
  .data(dataset)
	// 实例化新元素
  .enter()
	// 添加到dom树中，参数是HTML/SVG元素名
  .append('circle')
	// 设置标签属性，第1个参数: 属性名；第2个参数：值或回调函数返回值 (d, i) => {} d代表当前元素绑定的数据，i代表下标
	.attr('cx', d => xScale(d.time))
	.attr('cy', d =\u0026gt; yScale(d.value))
  .attr('r', 5)
	// 设置样式属性
	.style('fill', d =\u0026gt; colorScale(d.level))
  
```



#### **.data()  多种传参** 

- 第1个参数：数组

  ```js
  const dataset = [1, 2, 3];
  
  d3.select('.data-dot-container')
    .selectAll('dot')
    .data(dataset)
  ```

  

- 第1个参数：数组，

  第2个参数：回调函数 `(d, i) => {}` 。

  若数组的每一项是对象，则可用于指定将哪个属性值绑定到元素上（非必须）。例如此处只需绑定value属性。

  ```js
  const dataset = [
    {
      value: 4.1,
      level: 0
    },
    {
      value: 6.9,
      level: 1
    },
    {
      value: 17.2,
      level: 2
    }
  ];
  
  d3.select('.data-dot-container')
    .selectAll('dot')
    .data(dataset, d => d.value)
  ```



- 第1个参数：回调函数返回数组 `d => {}` ，

  第2个参数：回调函数 `(d, i) => {}` 

  ```js
  const dataset = [
    {
      date: '2019-08-07',
      data: []
    },
    {
      date: '2019-08-06',
      data: [
        {
          time: 6 * 3600,
          value: 4.1,
          level: 0
        },
        {
          time: 11 * 3600 + 32 * 60,
          value: 6.9,
          level: 1
        },
        {
          time: 17 * 3600,
          value: 17.2,
          level: 2
        }
      ]
    }
  ];
  
  const chart = {
    WIDTH: 800,
    HEIGHT: 520,
    X_AXIS_HEIGHT: 30,
    Y_AXIS_WIDTH: 44,
    SPACE_WIDTH: 10,
    COLORS: ['#00a0e9', '#77c332', '#ff0000']
  }
  
  const xScale = d3.scaleLinear()
  	.domain([0, 24 * 3600])
  	.range([chart.Y_AXIS_WIDTH, chart.WIDTH - chart.SPACE_WIDTH * 2]);
  
  const yScale = d3.scaleLinear()
  	.domain([0, 31])
  	.range([chart.HEIGHT, chart.X_AXIS_HEIGHT]);
  
  const colorScale = d3.scaleOrdinal()
  	.domain([0, 1, 2])
  	.range(chart.COLORS);
  
  d3.select('.data-dot-container')
    .selectAll('g')
    .data(dataset)
    .enter()
    .append('g')
    .attr('class', d => `dots-${d.date}`)
    .selectAll('dot')
    .data(d => d.data, d => d.value)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.time))
    .attr('cy', d => yScale(d.value))
    .attr('r', 5)
    .style('fill', d => colorScale(d.level));
  ```
  
  

#### 绑定数据并根据数据变化更新

```js
let u = d3.select()
	.selectAll()
	.data();

u.enter()
  .append()
  .merge()
  .attr()
  .style();

u.exit().remove();
```

只能控制 使用 `.data()` **直接绑定**的元素，若该元素内部依然有元素使用了绑定的数据，则数据变化对内部元素并不生效。可以移除所有元素重新绑定...



### 过渡动画 

```js
selection.transition()
  .ease() // 参数可传入缓动函数（非必须）
  .duration() // 过渡动画时间
  .attr() // 变化的标签属性
  .style() // 变化的样式属性
```

例如，圆点变大的过渡动画。

```js
d3.select('data-line-dots')
  .selectAll('circle')
  .data(dataset)
  .enter()
  .append('circle')
  .attr('cx', 100)
  .attr('cy', 50)
  .attr('r', 2)
  .style('fill', 'skyblue')
  .style('fill-opacity', 0.35);

d3.select('data-line-dots')
  .selectAll('circle')
  .transition()
  .duration(800)
  .attr('r', 6)
  .style('fill-opacity', 0.8);
```



### 事件绑定

```js
selection.on(eventName, function(d) {})
/*  事件函数 默认带有当前元素绑定的数据d作为形参  事件函数内部 this 指向当前元素*/
```



## 拖拽事件

```js
// 定义拖拽事件函数
const dragFn = function(d) {
  // 通过 d3.event 获取拖拽行为引起的元素变化量, 例如 d3.event.dy 可获取垂直方向的变化量
}

// 定义拖拽行为
const drag = d3.drag()
	.on('drag', dragFn)
  
// 给元素绑定拖拽事件
d3.select('.slider').call(drag);
```

