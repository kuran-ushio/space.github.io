---
slug: "/blog/export-and-print-html_1"
title: "html内容导出PDF和打印（一）"
date: "2020-07-07 10:18:52"
brief: "html页面导出PDF和打印在PC端的管理系统中是十分常见的功能，此处尝试实现单页内容的打印。"
tag: "h5"
cover: "1597115494807.png"
---

html页面导出PDF和打印在PC端的管理系统中是十分常见的功能，完全基于前端JS的实现如下:

### 效果预览
![](/images/1597115446591.png)


### 导出为PDF
> A4纸张的尺寸是 21cm * 29.7cm，此处涉及 px / cm / pt 等单位问题。

导出PDF功能基于 html2canvas 和 jsPDF 实现。
1. 将需要导出的页面内容的元素处理成 [html2canvas](http://html2canvas.hertzen.com/) 支持的格式
检查支持的元素标签和css样式，如 canvas 标签替换为 img。
（若导出的内容和页面显示的内容不完全一致，可以将导出的内容使用绝对定位放到视野之外的位置）

2. 使用 html2canvas 将导出的内容转换为1张图片3. 使用 [jsPDF](https://github.com/MrRio/jsPDF) 将生成的图片插入到 pdf 文件中![导出后的PDF](//47.97.96.97/images/zone/articles/1597115494807.png)
核心代码实现：
```js
html2canvas(el).then(function (canvas) {
  var ctW = canvas.width,
    ctH = canvas.height;
  
  // A4纸的尺寸 595.28pt * 841.89pt
  var pageH = (ctW / 592.28) * 841.89;
  var imgW = 595.28;
  var imgH = (592.28 / ctW) * ctH;
  var pageData = canvas.toDataURL("image/jpeg", 1.0);
  var pdf = new jsPDF("", "pt", "a4");
  
  // 当内容未超过pdf一页显示的范围，无需分页
  var position = 0, leftH = ctH;
  if (leftH < pageH) {
    pdf.addImage(pageData, "JPEG", 0, 0, imgW, imgH);
  } else {
    // 分页
    while (leftH > 0) {
      pdf.addImage(pageData, "JPEG", 0, position, imgW, imgH);
      leftH -= pageH;
      position -= 841.89;
      
      // 避免添加空白页
      if (leftH > 0) {
        pdf.addPage();
      }
    }
  }
  pdf.save("文件名.pdf");
})
```

### 打印浏览器自带API
`window.print()`  可以直接打印完整 html 页面。指定打印内容区域，最好是将指定的内容放入到新的html页面中，再完整打印。

![打印预览](/images/1597115546157.png)

核心代码实现：

```js
function print() {
  var newWindow = window.open(),
      doc = newWindow.document;  doc.open("text/html");
  doc.write($(".print").eq(0).html());
  doc.close();
  
  // 添加样式
  var oLink = doc.createElement("link");
  oLink.setAttribute("rel", "stylesheet");
  oLink.setAttribute("type", "text/css");
  oLink.setAttribute("href", "style.css");
  doc.head.appendChild(oLink);
  
  setTimeout(function() {
    newWindow.print();
  }, 50);
}
```

