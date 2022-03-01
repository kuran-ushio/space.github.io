---
slug: '/blog/vue-image-processor'
title: '基于canvas实现简易图片处理器'
date: '2022-02-28 15:25:27'
brief: '利用 cropper.js 和 caman.js 对图片进行一些处理，包括裁剪、旋转、水平镜像、色彩调整等操作。'
tag: 'vue'
cover: 'vue-image-processor.png'
---



### 相关依赖

- [caman.js](https://github.com/meltingice/CamanJS) 
- [cropper.js](https://github.com/fengyuanchen/cropperjs) 
- [wx-caman](https://github.com/ChrisCindy/wx-caman) 

<br/>

### 色彩调整

通常的实现思路就是通过 canvas 去操作图片每个像素点，对每个像素点的色彩值 rgba 进行处理。

比如调节图片亮度：

```js
const canvasEl = document.getElementById('canvas')
const ctx = canvasEl.getContext('2d')
const imageData = ctx.getImageData(0, 0, width, height)

// brightness 的取值范围是[-100, 100]
let adjust = Math.floor(255 * (brightness / 100))

const pixels = imageData.data
for (let i = 0, len = pixels.length; i < len; i += 4) {
  pixels[i] += adjust
  pixels[i + 1] += adjust
  pixels[i + 2] += adjust
}

ctx.putImageData(imageData, 0, 0)
```

但是需求实现还有对比度、饱和度、自然饱和度、曝光度、清晰度、色调、黑白、负片……这些需要数学公式支持，有些还挺复杂的，该如何解决呢？

我找到了一个相对专业的图像处理 JS 库`CamanJS` ，虽然已经停止维护了。这个库可以在浏览器和 `nodejs` 环境下使用，但是无法在 webpack 环境下使用（即一般的 vue 和 react 项目），因为其中关于 `nodejs` 环境的判断不准确。

那么最好的选择，就是将这个库用ES6重写。但是这个库的源码是用 `CoffeeScript` 写的，没有一定的基础阅读起来会有困难。

在npm上查找之后发现有个 `wx-caman` 的包，是为了在微信小程序的环境下支持使用 `CamanJS` ，里面关于 `CamanJS` 的核心代码都已实现 `ES6` 化，只要微调部分代码即可使用。

色彩选项的调整就变得容易了，实现思路如下：

```js
export default {
  setup() {
    onMounted(() => {
      const canvasEl = canvasRef.value
			const ctx = canvasEl.getContext('2d')
      
      const img = new Image()
      img.src = ...
      img.onload = function () {
        // 绘制图片
        ctx.drawImage()
        
        // 初始化Caman实例
        canvasEl.caman = new Caman(canvasEl)
      }
    })
  }
}
```

```js
// 需要调整亮度
const brightness = ref(0)
canvasRef.value.caman.brightness(brightness.value)
```

需要注意一点，若不处理，即使是相同类型的操作，每一次色彩调整的效果也是叠加的。例如，第一次调节亮度（基于未调整时的canvas像素数据），第二次再调节亮度时就是根据前一次处理的结果。

因此，需要及时做好图片数据的备份与恢复。

<br/>

实现效果如下：

亮度

![brightness.png](/images/img-brightness.png)

<br/>

对比度

![contrast.png](/images/img-contrast.png)

<br/>

自然饱和度

![vibrance.png](/images/img-vibrance.png)

<br/>

饱和度

![saturation.png](/images/img-saturation.png)

<br/>

曝光度

![exposure.png](/images/img-exposure.png)

<br/>

清晰度

![clarity.png](/images/img-clarity.png)

<br/>

色调

![hue.png](/images/img-hue.png)

<br/>

噪点

![noise.png](/images/img-noise.png)

<br/>

修剪

![clip.png](/images/img-clip.png)

<br/>

黑白

![greyscale.png](/images/img-greyscale.png)

<br/>

负片

![invert.png](/images/img-invert.png)

<br/>

### 尺寸处理

包括旋转、镜像、裁剪等操作。

#### 旋转

通过 canvas 坐标系旋转变换，然后再重新绘制图片实现。

![rotate.png](/images/img-rotate.png)

<br/>

#### 镜像

通过操作 canvas 中的像素点，对称的像素点互换位置。

![mirror.png](/images/img-mirror.png)

<br/>

#### 裁剪

基于 `cropper.js` 实现。

![crop.gif](/images/img-crop.gif)
