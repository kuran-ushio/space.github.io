---
slug: "/blog/export-and-print-html_2"
title: "html内容导出PDF和打印（二）"
date: "2020-08-13 17:46:14"
brief: "html页面导出PDF和打印在PC端的管理系统中是十分常见的功能，此处尝试实现多页内容的打印。"
tag: "h5"
cover: "1597312673385.png"
---

导出PDF或打印时，若不加以控制页面截断，内容超出一页时，会自动截断，显示到下一页。若需要在页眉页脚添加信息，则需要自己控制分页。

### 基本思路
1. 根据A4纸的尺寸计算并处理好每页应放置的内容（布局最好使用cm或mm）
2. 将每页的内容依次使用 [html2canvas](http://html2canvas.hertzen.com/) 将导出的内容转换为图片（每页各一张图片）
3. 使用 [jsPDF](https://github.com/MrRio/jsPDF) 将每页生成的图片依次插入到 pdf 文件中
<br/>

### 核心代码
```html
<div class="print">
  <div class="print-container">
    <div class="page"></div>
    <div class="page"></div>
    <div class="page"></div>
    <div class="page"></div>
  </div>
</div>
```

```css
.print {
  position: absolute;
  top: 0;
  left: -9999px;
}
.print-container {
  width: 210mm;
  margin: auto;
}
.print-container .page {
  position: relative;
  width: 210mm;
  min-height: 297mm;
  padding: 2cm 2cm 0;
  box-sizing: border-box;
  color: #565656;
}
```

```js
function exportPDF() {
  var pdf = new jsPDF("", "mm", "a4");
  for (var i = 0, len = $(".print-container .page").length;  i < len;  i++) {
    var canvas = await html2canvas($(".print .print-container .page")[i], {
      background: "#fff",
    });
    var imgW = 210,
        imgH = (210 / canvas.width) * canvas.height;
    var pageData = canvas.toDataURL("image/jpeg", 1.0);
    pdf.addImage(pageData, "JPEG", 0, 0, imgW, imgH);
    
    if (i < len - 1) {
      pdf.addPage();
    }
  }
  pdf.save("感应记录.pdf");
}
```

（打印功能的实现与上一篇随笔中所述相同）
<br/>

### 效果展示

#### 网页显示
![网页显示](/images/1597312673385.png)
<br/>

#### 导出PDF
![导出PDF-1](/images/1597312684239.png)
![导出PDF-2](/images/1597312691112.png)
<br/>

### 打印预览
![打印预览-1](/images/1597312715037.png)
![打印预览-2](/images/1597312729248.png)
![打印预览-3](/images/1597312743262.png)
![打印预览-4](/images/1597312753287.png)
