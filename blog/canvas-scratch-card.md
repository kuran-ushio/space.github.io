---
slug: "/blog/canvas-scratch-card"
title: "canvas 实现刮刮卡"
date: "2020-06-13 16:58:15"
brief: "刮刮卡在移动端的应用中十分常见，此处利用 html5的新特性中的canvas实现了该功能。"
tag: "h5"
cover: "canvas-scratch-card-1.png"
---

### 效果预览

刮开前

![效果图1：刮刮卡刮开前](/images/canvas-scratch-card-1.png)

刮开后

![效果图2：刮刮卡刮开后](/images/canvas-scratch-card-2.png)

<br/>

### 核心知识点

-  使用 canvas 的 `globalCompositeOperation` 属性实现涂抹时的刮开效果（两个图像的组合）。

  | 值               | 描述                                                         |
  | ---------------- | ------------------------------------------------------------ |
  | source-over      | 在目标图像上显示源图像                                       |
  | source-atop      | 在目标图像顶部显示源图像。源图像位于目标图像之外的部分是不可见的 |
  | source-in        | 在目标图像中显示源图像。只有目标图像内的源图像部分会显示，目标图像是透明的 |
  | source-out       | 在目标图像之外显示源图像。只会显示目标图像之外源图像部分，目标图像是透明的 |
  | destination-over | 在源图像上方显示目标图像                                     |
  | destination-atop | 在源图像顶部显示目标图像。源图像之外的目标图像部分不会被显示 |
  | destination-in   | 在源图像中显示目标图像。只有目标图像内的源图像部分会显示，目标图像是透明的 |
  | destination-out  | 在目标图像外显示源图像。只有源图像外的目标图像部分会被显示，源图像是透明的 |
  | lighter          | 显示源图像 + 目标图像                                        |
  | copy             | 显示源图像。忽略目标图像。只有目标图像内的源图像部分会显示，目标图像是透明的 |
  | xor              | 使用异或操作对源图像与目标图像进行组合。只有目标图像内的源图像部分会显示，目标图像是透明的 |

  

- 通过 `getImageData` 获取画布中每个像素点的信息，以统计被刮开的区域，达到一定比例时，自动刮完剩余部分。

<br/>

### 核心代码

页面DOM结构：

```html
<div id="box" class="box">
  <div class="prize">恭喜获得10积分</div>
  <canvas id="canvas">您的浏览器不支持canvas</canvas>
</div>
```

```js
class ScratchCard {
  constructor(oBox, oCanvas) {
    this.rem = Number.parseFloat(
      getComputedStyle(document.documentElement
    ).fontSize);
    
    // 画布元素
    this._canvasElm = oCanvas;
    const styles = getComputedStyle(oBox),
          padding = Number.parseInt(styles.padding),
          borderWidth = Number.parseInt(styles.borderWidth);
    
    // 画布尺寸
    this.width = oBox.offsetWidth - padding * 2 - borderWidth * 2;
    this.height = oBox.offsetHeight - padding * 2 - borderWidth * 2;
    
    // 画布位置
    let obj = getOffsetToWindow(oCanvas);
    this.left = obj.left;
    this.top = obj.top;
    oCanvas.width = this.width;
    oCanvas.height = this.height;
    this.ctx = oCanvas.getContext("2d");
    
    // 触摸事件相关参数
    this.isTouching = false;
    this.touchedPointers = [];
  }
  
  drawLayerBg() {
    this.ctx.fillStyle = "#ccc";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  
  drawLayerText() {
    this.ctx.fillStyle = "#949494";
    this.ctx.font = Number.parseInt(this.rem * 0.36) + "px 黑体";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("刮开此涂层", this.width / 2, this.height / 2);
  }
  
  drawBrush() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(this.touchedPointers[0][0], this.touchedPointers[0][1]);
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.lineWidth = this.rem * 0.5;
    this.ctx.globalCompositeOperation = "destination-out";
    
    if (this.touchedPointers.length === 1) {
      this.ctx.moveTo(
        this.touchedPointers[0][0] + 1,
        this.touchedPointers[0][1] + 1
      );
    } else {
      for (var i = 0; i < this.touchedPointers.length; i++) {
        this.ctx.lineTo(this.touchedPointers[i][0], this.touchedPointers[i][1]);
        this.ctx.moveTo(this.touchedPointers[i][0], this.touchedPointers[i][1]);
      }
    }
    
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.restore();
  }
  
  onTouchStart(e) {
    this.isTouching = true;
    let touchX = e.targetTouches[0].pageX - this.left,
        touchY = e.targetTouches[0].pageY - this.top;
    
    this.touchedPointers.push([touchX, touchY]);
    this.drawBrush();
  }
  
  onTouchMove(e) {
    if (this.isTouching) {
      let touchX = e.targetTouches[0].pageX - this.left,
          touchY = e.targetTouches[0].pageY - this.top;
      this.touchedPointers.push([touchX, touchY]);
      this.drawBrush();
      this.clearLayerBg(this.getFilledPercent());
    }
  }
  
  onTouchEnd() {
    this.isTouching = false;
    this.touchedPointers = [];
  }
  
  getFilledPercent() {
    // 计算刮过的区域所占比例
    const imgData = this.ctx.getImageData(0, 0, this.width, this.height);
    let pixels = imgData.data,
        brushedPixels = [];
    
    for (let i = 0, len = pixels.length; i < len; i += 4) {
      if (pixels[i + 3] < 128) {
        brushedPixels.push(pixels[i + 3]);
      }
    }
    
    return ((brushedPixels.length / (pixels.length / 4)) * 100).toFixed(2);
  }
  
  clearLayerBg(percent) {
    // 到达阈值时擦除涂层
    percent = percent || 0;
    if (percent >= 60) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
  
  render() {
    // 绘制灰色涂层背景
    this.drawLayerBg();
    
    // 绘制涂层上的文本
    this.drawLayerText();
  }
  
  init() {
    this.render();
    
    // 监听事件
    this._canvasElm.addEventListener(
      "touchstart",
      this.onTouchStart.bind(this)
    );
    this._canvasElm.addEventListener(
      "touchmove",
      this.onTouchMove.bind(this)
    );
    this._canvasElm.addEventListener(
      "touchend", this.onTouchEnd.bind(this));
  }
}

window.onload = function () {
  const oBox = document.getElementById("box"),
        oCanvas = document.getElementById("canvas");
  
  let card = new ScratchCard(oBox, oCanvas);
  card.init();
};

function getOffsetToWindow(el) {
  var offset = { left: 0, top: 0 };
  while (el !== document.body) {
    offset.left += el.offsetLeft;
    offset.top += el.offsetTop;
    el = el.offsetParent;
  }
  return offset;
}
```

