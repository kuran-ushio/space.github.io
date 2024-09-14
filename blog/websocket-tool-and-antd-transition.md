---
slug: "/blog/websocket-tool-and-antd-transition"
title: "websocket封装&antd组件过渡动画应用"
date: "2022-12-13 19:35:02"
brief: "公司的绩效考核中每个季度都要进行技术分享了，是时候从攒下的知识库存里抽出一点内容来了。第一部分websocket相关的原生API非常简单，功能也非常基础，在项目中实际使用时可以进行简单地封装，添加断线重连的机制，以便于复用。第二部分是为了符合UI设计图自己定制的下拉组件。"
tag: "react,antd"
---



## WebSocket 工具类封装

这里对 websocket 常用的API进行进一步的封装。

### 工具类

 `InstantWS.ts` 如下：

```typescript
export type Options = {
  /**
   * Websocket实例名称
   */
  name: string;
  /**
   * 最大重连次数
   * @default 10
   */
  reconnectMaxCount: number;
  /**
   * 重连时间间隔
   * @default 1000
   */
  reconnectTimeInterval: number;
  /**
   * 是否开启控制台信息打印
   * @default true
   */
  debugging: boolean;
};

/**
 * websocket 封装
 * 功能：
 * 1. 连接失败会自动重连，超过设置的最大重连次数则不再连接
 * 2. 用户掉线（非用户主动断开连接）则自动重连
 */
export default class InstantWS {
  /**
   * Websocket实例
   */
  ws?: WebSocket;

  /**
   * Websocket实例名称
   */
  name?: string;

  /**
   * 主动断开连接的标识
   */
  protected disconnectFlag: boolean;

  /**
   * 默认最大重连次数
   */
  protected RECONNECT_MAX_COUNT: number;

  /**
   * 默认重连时间间隔（单位：ms）
   */
  protected RECONNECT_TIME_INTERVAL: number;

  /**
   * 失败重连计数
   */
  protected reconnectCount: number;

  /**
   * 失败重连定时器
   */
  protected reconnectTimer?: NodeJS.Timeout;

  /**
   * 是否在控制台打印调试信息
   */
  protected debugging?: boolean;

  constructor(options?: Partial<Options>) {
    const {
      name = '',
      reconnectMaxCount = 10,
      reconnectTimeInterval = 1000,
      debugging = true,
    } = options || {};

    this.name = name;
    this.disconnectFlag = false;
    this.reconnectCount = 0;
    this.RECONNECT_MAX_COUNT = reconnectMaxCount;
    this.RECONNECT_TIME_INTERVAL = reconnectTimeInterval;
    this.debugging = debugging;
  }

  /**
   * 建立websocket连接
   * @param websocketUrl websocket地址
   * @param options 选项
   */
  buildConnect(
    websocketUrl: string,
    options?: {
      /**
       * 初次连接成功的回调
       */
      onFirstConnected?: () => void;
      /**
       * 成功接收到消息的回调
       */
      onMessage?: (message: string) => void;
      /**
       * 重连成功的回调
       */
      onReconnectSuccess?: () => void;
      /**
       * 重连失败的回调
       */
      onReconnectFailed?: () => void;
    },
  ) {
    const { onFirstConnected, onMessage, onReconnectSuccess, onReconnectFailed } = options || {};

    if (!this.getWebSocketStatus()) {
      const ws = (this.ws = new WebSocket(websocketUrl));

      ws.addEventListener('open', () => {
        if (this.reconnectCount > 0) {
          onReconnectSuccess?.();
        } else {
          onFirstConnected?.();
        }

        this.reconnectCount = 0;
        this.debugging && console.log(`[WebSocket]${this.name}: 连接成功`);
      });

      ws.addEventListener('message', (e) => {
        this.debugging && console.log(`[WebSocket]${this.name}: 收到消息`, e.data);
        onMessage?.(e.data);
      });

      ws.addEventListener('close', () => {
        // 用户主动断开连接 则不重连
        if (this.disconnectFlag) {
          this.reconnectCount = 0;
          this.debugging && console.log(`[WebSocket]${this.name}: 已断开连接`);
          return;
        }

        this.debugging && console.log(`[WebSocket]${this.name}: 正在自动重连...`);

        this.reconnectTimer = setTimeout(() => {
          this.reconnectCount += 1;
          this.debugging && console.log(`[WebSocket]${this.name}: 重连次数 ${this.reconnectCount}`);

          if (this.reconnectCount >= this.RECONNECT_MAX_COUNT) {
            this.debugging && console.log(`[WebSocket]${this.name}: 连接失败`);
            clearTimeout(this.reconnectTimer);
            onReconnectFailed?.();
            return;
          }

          this.buildConnect(websocketUrl, options);
        }, this.RECONNECT_TIME_INTERVAL);
      });
    }
  }

  /**
   * 获取连接状态
   * @return boolean
   */
  getWebSocketStatus() {
    let status = false;
    if (this.ws && this.ws.readyState) {
      status = this.ws.readyState === 1;
    }
    this.debugging &&
      console.log(`[WebSocket]${this.name} 连接状态: ${status ? '已连接' : '未连接'}`);
    return status;
  }

  /**
   * 发送数据
   * @param data
   */
  sendMessage(data: string) {
    if (this.getWebSocketStatus()) {
      this.ws?.send(data);
    }
  }

  /**
   * 关闭连接
   */
  close() {
    if (this.getWebSocketStatus()) {
      this.disconnectFlag = true;
      this.ws?.close();
      this.reconnectTimer && clearTimeout(this.reconnectTimer);
    }
  }
}
```



### 测试实例

前端代码：

```tsx
import InstantWS from '@/utils/InstantWS';

const wsUrl = 'ws://localhost:8181/';

useEffect(() => {
  const ws = new InstantWS({
    name: '连接1',
  });

  ws.buildConnect(wsUrl, {
    onMessage(message) {
      const msg = JSON.parse(message);
      console.log(msg);
    },
  });

  return () => {
    ws.close();
  }
}, []);
```



## 定制trigger下拉内容

### 效果预览

![custom-select](/images/2022-12-13/custom-select.png)



### 背景

![final](/images/2022-12-13/final.png)

1. 系统内的查询组件都**没有label**，所有查询组件都是通过 **placeholder** 区分的。
2. 比如这个页面的查询组件，就有两个数值范围查询组件。
3. 更重要的是，原型和UI都只画了两个输入框，只能使用 `Select` 下拉框的模式。

但是 antd 的 Select 定制的自由度不够高。



### 分析

1. 上面的部分 (selector) 和下面的部分 (popup)，以及两者的数据处理
2. 点击 selector 显示 popup，**像 antd 的 Select 组件一样有过渡动画** 



### 方案选择

#### 方案一：使用 Popover

使用 `antd` 的 `Popover` 组件，功能都可以实现，唯一的缺憾就是 antd 在设计 `Select` 组件的时候下拉部分(`popup`) 应用的是 `slide` 过渡动画，而 `Popover` 组件应用的是 `zoom` 过渡动画，体验起来就有点别扭。

具体实现可参考官方案例：[悬停点击弹出窗口](https://ant-design.gitee.io/components/popover-cn/#components-popover-demo-hover-with-click) 

```tsx
<Popover
  content={/* popup */}
  trigger="click"
  open={clicked}
  onOpenChange={handleClickChange}
  placement={placement}
  overlayClassName={styles.popover}
>
  {/* selector */}
</Popover>
```



#### 方案二：模仿 Select 的实现

##### 实现结构

1. antd 的 `Select` 组件

	  > [ant-design 的 Select 组件](https://github.com/ant-design/ant-design/blob/master/components/select/index.tsx) 是基于 `rc-select` 组件封装的。

	```tsx
	import RcSelect, { BaseSelectRef, OptGroup, Option } from 'rc-select';
	```

2. `rc-select` 组件

   > [rc-select](https://github.com/react-component/select/blob/master/src/Select.tsx)  组件的 popup 是基于 `rc-trigger` 组件封装的。

   ```tsx
   // 引入了 BaseSelect
   import BaseSelect, { isMultiple } from './BaseSelect';
   
   // 进入 BaseSelect.tsx 文件查看，查找与 dropdown 有关的实现
   import SelectTrigger from './SelectTrigger';
   
   // 进入 SelectTrigger.tsx 文件查看
   import Trigger from 'rc-trigger';
   ```

3. `rc-trigger` 组件

   根据文档中的参数含义解释，以及在 `rc-select` 中的写法，基本能实现功能了。

   ```shell
   npm i -S rc-dropdown rc-trigger
   ```

   ```tsx
   import Trigger from 'rc-trigger';
   import placements from 'rc-dropdown/lib/placements';
   
   // ...
   
   <Trigger
     action={['click']}
     builtinPlacements={placements}
     popup={/* popup */}
     popupStyle={{ width: 280 }}
     popupVisible={mergedVisible}
     onPopupVisibleChange={onVisibleChange}
     popupPlacement={placement}
     prefixCls="range-dropdown"
     stretch="width"
     getPopupContainer={getPopupContainer}
   >
     {/* selector */}
   </Trigger>
   ```



##### popup 添加过渡动画

既然要和 antd 的 Select 做类似效果，那最好能直接复用 antd 相关的实现代码。所以去读 antd 源码，了解 popup 相关的动画实现。

在 `rc-trigger` 组件文档中，找到了 `popupTransitionName` 这个属性，和 popup 的过渡动画实现有关。顺着 `rc-trigger` => `rc-select` => `antd Select` 组件发现这个属性是一层层传递下来的。所以只需要看 antd 的 `Select` 实现。

```tsx
import { getTransitionDirection, getTransitionName } from '../_util/motion';

<RcSelect
  ...
  transitionName={getTransitionName(
    rootPrefixCls,
    getTransitionDirection(placement),
    props.transitionName,
  )}
  ...
/>
```

`getTransitionDirection` - 根据 placement（popup 的位置）决定使用何种过渡动画 `slide-down` / `slide-up` 。

`getTransitionName` - 对 css 类名进行拼接，在 antd 组件库中所有 css 类名都是 `ant-xxx` 的格式，如果后面想要应用 antd 的样式，`rootPrefixCls` 多半也是传 `ant` 。

然后去相关的 less 文件中找找相关实现验证一下。

```less
/* ant-design\components\select\styles\index.less */
@import '../../style/themes/index';
@import '../../style/mixins/index';
@import '../../input/style/mixin';

// ========================== Popup ==========================
&-dropdown {
  ...
  &.@{ant-prefix}-slide-up-enter.@{ant-prefix}-slide-up-enter-active&-placement-bottomLeft,
  &.@{ant-prefix}-slide-up-appear.@{ant-prefix}-slide-up-appear-active&-placement-bottomLeft {
    animation-name: antSlideUpIn;
  }

  &.@{ant-prefix}-slide-up-enter.@{ant-prefix}-slide-up-enter-active&-placement-topLeft,
  &.@{ant-prefix}-slide-up-appear.@{ant-prefix}-slide-up-appear-active&-placement-topLeft {
    animation-name: antSlideDownIn;
}

  &.@{ant-prefix}-slide-up-leave.@{ant-prefix}-slide-up-leave-active&-placement-bottomLeft {
    animation-name: antSlideUpOut;
  }

  &.@{ant-prefix}-slide-up-leave.@{ant-prefix}-slide-up-leave-active&-placement-topLeft {
    animation-name: antSlideDownOut;
  }

  ...
}
```

这里使用了4种 css 动画，`antSlideUpIn` / `antSlideDownIn` / `antSlideUpOut` / `antSlideDownOut` 。

最后在 `ant-design\components\style\core\motion\slide.less` 中找到了它们的定义。

```less
.slide-motion(@className, @keyframeName) {
  @name: ~'@{ant-prefix}-@{className}';
  .make-motion(@name, @keyframeName);
  .@{name}-enter,
  .@{name}-appear {
    opacity: 0;
    animation-timing-function: @ease-out-quint;
  }
  .@{name}-leave {
    animation-timing-function: @ease-in-quint;
  }
}

.slide-motion(slide-up, antSlideUp);
.slide-motion(slide-down, antSlideDown);
.slide-motion(slide-left, antSlideLeft);
.slide-motion(slide-right, antSlideRight);

@keyframes antSlideUpIn {
  0% {
    transform: scaleY(0.8);
    transform-origin: 0% 0%;
    opacity: 0;
  }

  100% {
    transform: scaleY(1);
    transform-origin: 0% 0%;
    opacity: 1;
  }
}

@keyframes antSlideUpOut {
  0% {
    transform: scaleY(1);
    transform-origin: 0% 0%;
    opacity: 1;
  }

  100% {
    transform: scaleY(0.8);
    transform-origin: 0% 0%;
    opacity: 0;
  }
}

@keyframes antSlideDownIn {
  0% {
    transform: scaleY(0.8);
    transform-origin: 100% 100%;
    opacity: 0;
  }

  100% {
    transform: scaleY(1);
    transform-origin: 100% 100%;
    opacity: 1;
  }
}

@keyframes antSlideDownOut {
  0% {
    transform: scaleY(1);
    transform-origin: 100% 100%;
    opacity: 1;
  }

  100% {
    transform: scaleY(0.8);
    transform-origin: 100% 100%;
    opacity: 0;
  }
}

@keyframes antSlideLeftIn {
  0% {
    transform: scaleX(0.8);
    transform-origin: 0% 0%;
    opacity: 0;
  }

  100% {
    transform: scaleX(1);
    transform-origin: 0% 0%;
    opacity: 1;
  }
}

@keyframes antSlideLeftOut {
  0% {
    transform: scaleX(1);
    transform-origin: 0% 0%;
    opacity: 1;
  }

  100% {
    transform: scaleX(0.8);
    transform-origin: 0% 0%;
    opacity: 0;
  }
}

@keyframes antSlideRightIn {
  0% {
    transform: scaleX(0.8);
    transform-origin: 100% 0%;
    opacity: 0;
  }

  100% {
    transform: scaleX(1);
    transform-origin: 100% 0%;
    opacity: 1;
  }
}

@keyframes antSlideRightOut {
  0% {
    transform: scaleX(1);
    transform-origin: 100% 0%;
    opacity: 1;
  }

  100% {
    transform: scaleX(0.8);
    transform-origin: 100% 0%;
    opacity: 0;
  }
}
```

less 变量 `ant-prefix` 的定义在 `ant-design\components\style\themes\variable.less` 中。

```less
// The prefix to use on all css classes from ant.
@ant-prefix: ant;
```

综上所述，`rc-trigger`  组件在此处的用法是：

```tsx
import { getTransitionDirection, getTransitionName } from 'antd/es/_util/motion';

<Trigger
  action={['click']}
  builtinPlacements={placements}
  popup={/* popup */}
  popupStyle={{ width: 280 }}
  popupVisible={mergedVisible}
  onPopupVisibleChange={onVisibleChange}
  popupPlacement={placement}
  prefixCls="range-dropdown"
  stretch="width"
  getPopupContainer={getPopupContainer}
  popupTransitionName={getTransitionName('ant', getTransitionDirection(placement))}
>
  {/* selector */}
</Trigger>
```

直接用 `popupTransitionName` 属性会提示该属性已弃用，建议使用 `popupMotion` 属性，可以改成下面的写法。

```tsx
import { getTransitionDirection, getTransitionName } from 'antd/es/_util/motion';

<Trigger
  action={['click']}
  builtinPlacements={placements}
  popup={/* popup */}
  popupStyle={{ width: 280 }}
  popupVisible={mergedVisible}
  onPopupVisibleChange={onVisibleChange}
  popupPlacement={placement}
  prefixCls="range-dropdown"
  stretch="width"
  getPopupContainer={getPopupContainer}
  popupMotion={{
    motionName: getTransitionName('ant', getTransitionDirection(placement)),
  }}
>
  {/* selector */}
</Trigger>
```



### 完整实现

```tsx
import React, { useMemo, useRef, useState } from 'react';
import type { FC } from 'react';
import { Button, Popover } from 'antd';
import { CloseCircleFilled, DownOutlined } from '@ant-design/icons';
import Trigger from 'rc-trigger';
import placements from 'rc-dropdown/lib/placements';
import Range from './Range';
import type { ValueType } from './Range';
import styles from './index.less';
import { getTransitionDirection, getTransitionName } from 'antd/es/_util/motion';

// 样式类名前缀
const prefixCls = 'number-range';

export type RangeSelectProps = {
  allowClear?: boolean;
  value?: ValueType;
  onChange?: (value?: ValueType) => void;
  placeholder?: string;
  /** 回显数值前缀 */
  renderPrefix?: string;
  /** 回显分隔符 */
  renderSeparator?: string;
  /** 选择框样式 */
  style?: React.CSSProperties;
  /** dropdown 弹出位置 */
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
  /** dropdown 是否显示 */
  visible?: boolean;
  /** dropdown 显示状态改变时调用 */
  onVisibleChange?: (visible: boolean) => void;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
};

const RangeSelect: FC<RangeSelectProps> = (props) => {
  const {
    allowClear = false,
    value,
    onChange,
    placeholder = '请选择范围',
    placement = 'bottomLeft',
    style,
    renderPrefix = '',
    renderSeparator = '-',
    visible,
    getPopupContainer,
  } = props;
  const [rangeValue, setRangeValue] = useState<ValueType>();
  const [triggerVisible, setTriggerVisible] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const mergedVisible = visible !== undefined ? visible : triggerVisible;

  const triggerRef = React.useRef(null);

  const handleClear: React.MouseEventHandler<HTMLSpanElement> = (event) => {
    setRangeValue(undefined);
    onChange?.(undefined);

    event.stopPropagation();
  };

  const handleOk = () => {
    onChange?.(rangeValue);
    setTriggerVisible(false);
  };

  const handleCancel = () => {
    setRangeValue(undefined);
    setTriggerVisible(false);
  };

  const onRangeValueChange = (value?: ValueType) => {
    setRangeValue(value);
  };

  const onVisibleChange = (newVisible: boolean) => {
    setTriggerVisible(newVisible);
    props.onVisibleChange?.(newVisible);
  };

  const renderedValue = useMemo(() => {
    const isMinEmpty = value?.min === undefined || value.min === null;
    const isMaxEmpty = value?.max === undefined || value.max === null;

    if (isMinEmpty && isMaxEmpty) {
      return undefined;
    } else if (isMinEmpty && !isMaxEmpty) {
      return `不设下限 ${renderSeparator} ${renderPrefix}${value.max}`;
    } else if (!isMinEmpty && isMaxEmpty) {
      return `${renderPrefix}${value.min} ${renderSeparator} 不设上限`;
    } else {
      return `${renderPrefix}${value.min} ${renderSeparator} ${renderPrefix}${value.max}`;
    }
  }, [value]);

  const getPopup = () => (
    <div className={styles.dropdown}>
      {/* 数值范围输入组件 */}    
      <Range value={rangeValue} onChange={onRangeValueChange} withoutForm />

      <div className={styles.btns}>
        <Button type="primary" className={styles.btn} onClick={handleOk}>
          确认
        </Button>
        <Button className={`${styles.btn} ${styles.btnCancel}`} onClick={handleCancel}>
          取消
        </Button>
      </div>
    </div>
  );

  return (
    <Trigger
      action={['click']}
      builtinPlacements={placements}
      popup={getPopup()}
      popupStyle={{ width: 280 }}
      popupVisible={mergedVisible}
      onPopupVisibleChange={onVisibleChange}
      popupPlacement={placement}
      prefixCls={`${prefixCls}-dropdown`}
      stretch="width"
      ref={triggerRef}
      getPopupContainer={getPopupContainer}
      popupMotion={{
        motionName: getTransitionName('ant', getTransitionDirection(placement)),
      }}
    >
      <div
        className={`${styles.rangeSelect} ${mergedVisible ? styles.focused : ''}`}
        style={style}
        ref={wrapperRef}
      >
        <div className={styles.selector}>
          {renderedValue ? (
            <span className={styles.selectedItem}>{renderedValue}</span>
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
        </div>

        <DownOutlined className={styles.arrow} />

        {allowClear && (
          <CloseCircleFilled
            className={`${styles.clear} ${renderedValue ? styles.visible : ''}`}
            onClick={handleClear}
          />
        )}
      </div>
    </Trigger>
  );
};

export default RangeSelect;
```

