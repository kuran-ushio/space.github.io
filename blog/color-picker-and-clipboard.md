---
slug: "/blog/color-picker-and-clipboard"
title: "颜色选择器&复制到剪贴板"
date: "2023-03-29 22:01:48"
brief: "工作中遇到的颜色选择器功能，ant design目前的版本中还没有单独封装为组件，那就自己动手吧，另外这次还了解了选中文本复制到剪贴板的小功能。"
tag: "react"
---



## 颜色选择器

> 使用 `react-color` 实现。
>
> 官网文档：[http://casesandberg.github.io/react-color/](http://casesandberg.github.io/react-color/) 

### 基本使用

```tsx
import React, { Suspense, useState } from 'react';
import type { FC } from 'react';
import { ChromePicker } from 'react-color';

const Page: FC = () => {
  const [color, setColor] = useState<string>('#CB82F0');

  return (
    <div>
      <Popover
        trigger="click"
        content={
          <ChromePicker
            color={warningColor}
            onChangeComplete={(color) => setWarningColor(color.hex)}
          />
        }
        className={styles.colorPicker}
        overlayClassName={styles.colorPickerPanel}
      >
        <div
          className={styles.pickerView} 
          style={{ backgroundColor: color }}
        >
        </div>
        <a className={styles.pickerBtn}>修改</a>
      </Popover>
    </div>
  );
};

export default Page;
```



### 效果预览

![color-picker-3](/images/2023-03-29/color-picker-3.png)



### 补充说明

内置了多种风格的颜色选择器。

![color-picker-1](/images/2023-03-29/color-picker-1.png)

![color-picker-2](/images/2023-03-29/color-picker-2.png)





## 复制到剪贴板

> 使用 `react-copy-to-clipboard` 实现。



### 基本使用

```tsx
import React, { Suspense, useState } from 'react';
import type { FC } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { message, Tooltip } from 'antd';

const Page: FC = () => {
  const [caseNo, setCaseNo] = useState<string>('（2023）杭桐1737人调（市）字第38号');

  return (
    <div>
      <Tooltip title="点击案号快速复制">
        <CopyToClipboard text={caseNo} onCopy={() => message.success('案号已复制')}>
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            案号：{caseNo}
          </span>
        </CopyToClipboard>
      </Tooltip>
    </div>
  );
};

export default Page;
```

这样就实现了通过代码将内容添加到剪贴板。
