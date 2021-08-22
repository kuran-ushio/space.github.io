---
slug: "/blog/canvas-lucky-wheel"
title: "canvas 转盘抽奖"
date: "2020-06-15 16:57:55"
brief: "转盘抽奖在移动端的应用中也十分常见。在 html5 中利用 canvas 便可绘制转盘，实现抽奖功能。"
tag: "h5"
cover: "1594093362995.png"
---



### 效果预览

静态页面展示

![转盘抽奖静态](/images/1594093362995.png)

动态交互操作

![转盘抽奖动态](/images/canvas-lucky-wheel.gif)

### 功能描述

- 模拟从后端接口获取的奖品数据及中奖概率
- 支持多次抽奖（设置次数上限）
- 显示中奖的奖品信息

<br/>

### 实现难点

1. 根据设置的概率生成随机数表示抽奖结果？

   通常在 javascript 中生成随机数都是使用 `Math.random()` 方法来实现的，但这样生成的是等概率的。因此此处需要另写算法加以实现。在代码书写中，借鉴了 [Js 控制随机数概率](https://www.cnblogs.com/whnba/p/10214312.html) 这篇博客的方法。

2. 随机数的结果与转盘区域的对应

   每个区域需要转动的角度是确定的，通过随机数控制最终旋转的角度即可。

<br/>

### 核心源码

html 部分

```html
<div class="lucky">
	<div class="lucky__wheel">
    <canvas id="canvas">抱歉，当前浏览器不支持canvas</canvas>
  </div>
  <div class="lucky__pointer" id="pointer">
  </div>
</div>

<!-- 中奖概率公示 -->
<div class="pr">
  <p class="pr__title">中奖概率公示</p>
  <div class="pr__list"></div>
</div>

<!-- 次数 & 抽中的奖品 -->
<div class="result">
  <div class="result__title">
    剩余<strong class="result__count" id="count">0</strong>次抽奖机会
  </div>
  <ul class="result__prize"></ul>
</div>
```

js 部分
```js
"use strict";

class LuckyWheel {
  /**
   *
   * @param {*} oWheel 转盘外圆DOM
   * @param {*} oCanvas 转盘Canvas DOM
   * @param {*} oPointer 指针DOM
   * @param {Number} count 可抽奖总次数
   */
  constructor(oWheel, oCanvas, oPointer, count) {
    this.rem = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize
    )

    // 画布元素 & 转盘指针
    this._wheelElm = oWheel
    this._canvasElm = oCanvas
    this._pointerElm = oPointer

    // 画布尺寸
    this.width = oWheel.offsetHeight
    this.height = this.width

    oCanvas.width = this.width
    oCanvas.height = this.height
    this.ctx = oCanvas.getContext('2d')

    // 绘制各个扇形颜色板配色
    this.colors = [
      '#AE3EFF',
      '#4D3FFF',
      '#FC262C',
      '#3A8BFF',
      '#EE7602',
      '#FE339F',
    ]

    this.textRadius = 2 * this.rem // 文本所在的环的半径
    this.outerRadius = 2.7 * this.rem // 圆盘半径
    this.prizes = []

    this.isRotating = false

    // 转盘转动角度
    this.wheelStatus = {
      rotate: 0,
    }

    // 抽奖结果
    this.result = 0

    // 当前轮次指针停留位置
    this.pointerTo = 4

    // 已转动次数
    this.count = 0

    // 可转动总次数
    this.totalCount = count

    // 转盘每次转动完成后的回调函数
    this.onRotateFinished = null
  }

  // 绘制扇形和奖品
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height)

    const perFanAngle = (Math.PI * 2) / this.prizes.length

    this.ctx.save()
    this.ctx.translate(this.width / 2, this.height / 2)
    this.ctx.rotate((this.wheelStatus.rotate / 180) * Math.PI)

    for (var i = 0, len = prizes.length; i < len; i++) {
      let angle = i * perFanAngle

      this.ctx.beginPath()
      this.ctx.moveTo(0, 0)
      this.ctx.arc(0, 0, this.outerRadius, angle, angle + perFanAngle, false)
      this.ctx.closePath()
      this.ctx.fillStyle = this.colors[i]
      this.ctx.fill()

      this.ctx.save()

      let translateX = Math.cos(angle + perFanAngle / 2) * this.textRadius
      let translateY = Math.sin(angle + perFanAngle / 2) * this.textRadius
      this.ctx.translate(translateX, translateY)
      this.ctx.rotate(angle + perFanAngle / 2 + Math.PI / 2)
      this.ctx.font = this.rem * 0.28 + 'px 黑体'
      this.ctx.fillStyle = '#FFFF00'
      this.ctx.fillText(
        this.prizes[i].name,
        -this.ctx.measureText(prizes[i].name).width / 2,
        0
      )

      this.ctx.restore()
    }

    this.ctx.restore()
  }

  rotate() {
    var rotateAngle =
      360 * 5 + (360 / this.prizes.length) * (this.pointerTo - this.result)

    const _this = this
    var tween = new TWEEN.Tween(this.wheelStatus)
    tween
      .easing(TWEEN.Easing.Quadratic.InOut)
      .to({ rotate: rotateAngle + _this.wheelStatus.rotate }, 5000)
      .start()
      .onComplete(function (){
        _this.isRotating = false
        _this.pointerTo = this.result

        let res = this.prizes[_this.result]
        _this.onRotateFinished && _this.onRotateFinished(res)

        if (_this.count === _this.totalCount) {
          _this._pointerElm.classList.add('elm--disabled')
        }
      })

    animate.call(this)

    function animate() {
      requestAnimationFrame(animate.bind(this))
      TWEEN.update()

      this.render()
    }
  }

  // 根据概率生成随机数
  generateRandom() {
    const len = this.prizes.length

    const percents = this.prizes.map((item, index) => [index, item.pr])

    const random = new RandomNum(0, len)
    random.percentage = new Map(percents)

    random.range()
    // 抽奖结果
    this.result = random.create()
  }

  init() {
    this.render()

    // 点击抽奖
    this._pointerElm.addEventListener('click', () => {
      if (this.isRotating || this.count >= this.totalCount) return

      this.isRotating = true
      this.count++

      this.generateRandom()

      this.rotate()
    })
  }
}
```

```js
"use strict";
// 模拟后端接口获取的数据
const prizes = [
  {
    id: 1,
    type: 1, // 是否中奖
    name: "50元抵扣券",
    pr: 0.005, // 概率
  },
  {
    id: 2,
    type: 0,
    name: "谢谢参与",
    pr: 0.301,
  },
  {
    id: 3,
    type: 1,
    name: "30积分",
    pr: 0.03,
  },
  {
    id: 4,
    type: 0,
    name: "谢谢参与",
    pr: 0.301,
  },
  {
    id: 5,
    type: 1,
    name: "10积分",
    pr: 0.062,
  },
  {
    id: 6,
    type: 0,
    name: "谢谢参与",
    pr: 0.301,
  },
];

window.onload = function () {
  const oCanvas = document.getElementById("canvas"),
        oWheel = document.getElementsByClassName("lucky__wheel")[0],
        oPointer = document.getElementById("pointer");
  
  const oCount = document.getElementById("count"),
        oResult = document.getElementsByClassName("result__prize")[0];
  
  const oPrList = document.getElementsByClassName("pr__list")[0];
  
  // 初始化抽奖次数
  oCount.innerText = 3;
  
  // 显示中奖概率公示
  let htmlStr = "";
  prizes.forEach((item) => {
    if (item.type === 1) {
      htmlStr += `<p>${item.name} <strong>${item.pr * 100}</strong>%</p>`;
    }
  });
  oPrList.innerHTML = htmlStr;
  const wheel = new LuckyWheel(oWheel, oCanvas, oPointer, 3);
  
  // 可通过接口请求获取数据...
  wheel.prizes = prizes;
  
  wheel.onRotateFinished = (res) => {
    oCount.innerText = wheel.totalCount - wheel.count;
    if (res.type === 1) {
      oResult.innerHTML += `<li>${res.name}</li>`;
    }
  };
  
  wheel.init();
  window.addEventListener("resize", function () {
    wheel.render();
  });
};

```
<br/>

### 特别感谢

- [Js 控制随机数概率](https://www.cnblogs.com/whnba/p/10214312.html) 
- [图片素材来源](https://github.com/MiuMiu-S/Draw-a-iottery)  
- [H5 Canvas抽奖大转盘代码实现及总结](https://www.jianshu.com/p/66153577ce01)