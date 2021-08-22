---
slug: "/blog/vue-menu-component"
title: "Vue封装PC端UI组件练习--Menu导航菜单"
date: "2020-06-23 10:25:15"
brief: "基于Vue自行封装PC端UI组件的学习笔记，部分参考了Element UI的实现。"
tag: "vue"
cover: "1592914750087.png"
---

此篇仅记录封装过程中遇到的问题及解决办法。

在这一篇中，将对十分常见的左侧导航菜单进行简单封装。

### 效果预览

![menu.png](/images/1592914750087.png)

<br/>

### 遇到的问题及解决办法

1. 收缩展开子菜单的交互过渡动画  这个交互的效果借鉴了 Element 的实现，其中封装后的 transition 还是十分好用的。

2. 跨多层次组件通信 provide / inject 使用  provide中的数据非响应式，即在其他地方修改了数据，并不会被监听到=.= 

   这个在Vue.js的官方文档就提到了。但是现在就需要让它成为响应式的，怎么办呢？

   可以传入可监听对象使之成为响应式，比如将当前组件传下去，Vue组件本身就是响应式的。

<br/>

### 组件使用

```vue
<template>
  <nk-menu
    style="width: 220px"
    default-selected="find"
    :default-opens="['music']"
    :unique-opened="true"
    @select="handleSelect"
    @open-change="handleOpenChange">
    <nk-menu-item key="find">
      <i class="nkicon iconfont icon-music-cd"></i>
      <span>发现音乐</span>
    </nk-menu-item>
    <nk-menu-item key="fm">
      <i class="nkicon iconfont icon-fm"></i>
      <span>私人FM</span>
    </nk-menu-item>
    <nk-menu-item key="mv">
      <i class="nkicon iconfont icon-mv"></i>
      <span>视频</span>
    </nk-menu-item>
    <nk-menu-item key="friend">
      <i class="nkicon iconfont icon-friends"></i>
      <span>朋友</span>
    </nk-menu-item>
    
    <!-- 二级菜单 -->
    <nk-sub-menu key="music">
      <template #title>
        <i class="nkicon iconfont icon-music"></i>
        <span>我的音乐</span>
      </template>
      <nk-menu-item key="music-itunes">iTunes音乐</nk-menu-item>
      <nk-menu-item key="music-download">下载管理</nk-menu-item>
      <nk-menu-item key="music-cloud">我的音乐云盘</nk-menu-item>
      <nk-menu-item key="music-collect">我的收藏</nk-menu-item>
    </nk-sub-menu>
		
    <!-- 分组的二级菜单 -->
    <nk-sub-menu key="sheet">
      <template #title>
        <i class="nkicon iconfont icon-music-list"></i>
        <span>创建的歌单</span>
      </template>
      <nk-menu-item-group title="默认歌单">
        <nk-menu-item key="sheet-1">我喜欢的音乐</nk-menu-item>
      </nk-menu-item-group>
      <nk-menu-item-group>
        <template #title>自建歌单</template>
        <nk-menu-item key="sheet-2">如梦江湖</nk-menu-item>
        <nk-menu-item key="sheet-3">逐梦天下</nk-menu-item>
        <nk-menu-item key="sheet-4">清梦华胥</nk-menu-item>
      </nk-menu-item-group>
    </nk-sub-menu>
  </nk-menu>
</template>

<script>
import NkMenu from "../components/menu/menu";
import NkMenuItem from "../components/menu/menu-item";
import NkSubMenu from "../components/menu/sub-menu";
import NkMenuItemGroup from "../components/menu/menu-item-group";

export default {
  components: {
    NkMenu,
    NkMenuItem,
    NkSubMenu,
    NkMenuItemGroup,
  },
  methods: {
    handleOpenChange(openKeys) {
      console.log(openKeys);
    },
    handleSelect({ item, key, keyPath, domEvent }) {
      console.log(item, key, keyPath, domEvent);
    }
  }
};
</script>
```



### 源码

#### menu.vue

```vue
<template>
  <ul class="nk-menu nk-menu-root">
    <slot></slot>
  </ul>
</template>

<script>
export default {
  name: "nk-menu",
  props: {
    defaultSelected: {
      type: String,
      required: false,
      default: ""
    },
    defaultOpens: {
      type: Array,
      required: false,
      default: () => []
    },
    uniqueOpened: {
      type: Boolean,
      required: false,
      default: false
    },
    collapseTransition: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      activeKey: this.defaultSelected,
      openKeys: this.defaultOpens, // 当前展开的SubMenu
    };
  },
  provide() {
    return {
      rootMenu: this // 传入可监听的对象使之成为响应式
    };
  }
};
</script>

<style>
.nk-menu-root {
  height: 100%;
  border-right: 1px solid #ededed;
  box-sizing: border-box;
  overflow-y: auto;
}
.nk-menu,.nk-menu ul {
  list-style: none;
  color: rgba(0, 0, 0, 0.65);
}
.nk-menu-item,
.nk-submenu__title,
.nk-menu-item-group__title {
  position: relative;
  height: 40px;
  padding: 0 20px;
  line-height: 40px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}
.nk-submenu.is-selected,
.nk-menu-item.is-selected,
.nk-menu-item:hover,
.nk-submenu__title:hover {
  color: #1890ff;
}
.nk-menu-item.is-selected,
.nk-menu-item.is-selected:hover {
  background-color: #e6f7ff;
}
.nk-menu-item .nkicon,
.nk-submenu__title .nkicon {
  margin-right: 10px;
  vertical-align: -0.05em;
}
.nk-menu-sub > .nk-menu-item,
.nk-menu-item-group__list > .nk-menu-item {
  padding-left: 46px;
}
.nk-menu-sub {
  box-sizing: border-box;
}
.nk-menu-item-group__title {
  padding-left: 30px;
  color: #8c8c8c;
  font-size: 12px;
}
.nk-submenu__arrow {
  position: absolute;
  right: 16px;
  top: calc(50% - 8px);
}
.nk-submenu__arrow svg {
  position: relative;
  top: -10px;
  transform: rotate(0deg);
  transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}
.nk-submenu--open .nk-submenu__arrow svg {
  transform: rotate(180deg);
}
.nk-slide-before-enter,
.nk-slide-leave {
  transition: height 3s ease-in-out;
}
</style>
```



#### menu-item.vue

```vue
<template>
  <li
    :class="['nk-menu-item', isSelected ? 'is-selected' : '']"
    role="menuitem"
    @click="handleClick"
  >
    <slot></slot>
  </li>
</template>

<script>
export default {
  name: "nk-menu-item",
  inject: ["rootMenu"],
  computed: {
    isSelected() {
      return this.$vnode.key === this.rootMenu.activeKey;
    }
  },
  methods: {
    handleClick(e) {
      const keyPath = [];
      let node = this;
      while (node) {
        if (node.$options.name === "nk-submenu" || node.$options.name === "nk-menu-item") {
          keyPath.push(node.$vnode.key);
        } else if (node.$options.name === "nk-menu") {
          break;
        }
        
        node = node.$parent;
      }
      
      this.rootMenu.activeKey = this.$vnode.key;// MenuItem被嵌套在Menu的层数不定
      
      if (this.rootMenu.$listeners["select"]) {
        this.rootMenu.$listeners["select"]({
          item: this.$el,
          key: this.$vnode.key,
          keyPath,
          domEvent: e
        });
      }
    }
  },
  mounted() {}
};
</script>
```


#### menu-item-group.vue

```vue
<template>
  <li class="nk-menu-item-group">
    <div class="nk-menu-item-group__title" v-if="title">{{title}}</div>
    <div class="nk-menu-item-group__title" v-else>
      <slot name="title"></slot>
    </div>
    <ul class="nk-menu-item-group__list">
      <slot></slot>
    </ul>
  </li>
</template>

<script>
export default {
  name: "nk-menu-item-group",
  props: {
    title: {
      type: String,
      required: false
    }
  }
};
</script>
```



#### submenu.vue

```vue
<template>
  <li
    :class="[
      'nk-submenu',
      isOpen ? 'nk-submenu--open' : '',
      isActive ? 'is-selected' : ''
    ]"
    role="menuitem"
  >
    <div class="nk-submenu__title" @click="handleToggleMenu">
      <slot name="title"></slot>
      <div class="nk-submenu__arrow">
      	<svg
          t="1591864743298"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="3383"
          width="14"
          height="14"
      	>
          <path
            d="M530.877 673.827l285.857-285.857c10.929-10.929 10.929-29.334 0-40.837-10.929-10.929-29.334-10.929-40.837 0l-265.725 265.725-264.573-264.573c-10.929-10.929-29.334-10.929-40.837 0-10.929 10.929-10.929 29.334 0 40.837l284.703 284.703c12.077 11.502 29.908 11.502 41.41799999 0Z"
            fill="#000000a6"
            p-id="3384"
          />
        </svg>
      </div>
    </div>
    <collapse-transition v-if="needTransition">
      <ul class="nk-menu nk-menu-sub" v-show="isOpen">
        <slot></slot>
      </ul>
    </collapse-transition>
    <ul class="nk-menu nk-menu-sub" v-show="isOpen" v-else>
      <slot></slot>
    </ul>
  </li>
</template>

<script>
import CollapseTransition from "../transitions/collapse-transition";

export default {
  name: "nk-submenu",
  components: {
    CollapseTransition
  },
  inject: ["rootMenu"],
  data() {
    return {
      items: [],
      siblings: []
    };
  },
  computed: {
    isActive() {
      return this.items.indexOf(this.rootMenu.activeKey) > -1;
    },
    isOpen() {
      return this.rootMenu.openKeys.indexOf(this.$vnode.key) > -1;
    },
    needTransition() {
      return this.rootMenu.collapseTransition;
    }
  },
  methods: {
    handleToggleMenu() {
      let openKeys = [...this.rootMenu.openKeys];
      const index = openKeys.findIndex(item => item === this.$vnode.key);
      
      if (index > -1) {
        openKeys.splice(index, 1);
      } else {
        if (this.rootMenu.uniqueOpened) {
          // 求 openKeys - siblings 的差集
          openKeys = openKeys.concat(this.siblings)
            .filter(key => !this.siblings.includes(key));
        }
        openKeys.push(this.$vnode.key);
      }
      this.rootMenu.openKeys = openKeys;
      this.rootMenu.$listeners["open-change"](openKeys);
    },
    getMenuItemKeys(children, results) {
      for (let i = 0; i < children.length; i++) {
        if (children[i].$options.name === "nk-menu-item) {
          results.push(children[i].$vnode.key);
      	}
      	if (children[i].$children.length > 0) {
          this.getMenuItemKeys(children[i].$children, results);
        }
      }
    },
    getSiblings(parent, results) {
      console.log(parent);
      
      // 获取同级的SubMenu
      if (parent.$options.name === "nk-menu" || parent.$options.name === "nk-submenu") {
        for (let i = 0, len = parent.$children.length; i < len; i++) {
          if (parent.$children[i].$options.name === "nk-submenu") {
            results.push(parent.$children[i].$vnode.key);
          }
        }
      } else {
        this.getSiblings(parent.$parent, results);
      }
    }
  },
  mounted() {
  	const items = [],
      siblings = [];
    this.getMenuItemKeys(this.$children, items);
    this.items = items;
    this.getSiblings(this.$parent, siblings);
    this.siblings = siblings;
  }
};
</script>
```



#### collapse-transition.js

```js
const elTransition = "0.3s height ease-in-out, 0.3s padding-top ease-in-out, 0.3s padding-bottom ease-in-out";
const Transition = {
  "before-enter"(el) {
    el.style.transition = elTransition;
    if (!el.dataset) el.dataset = {};
    el.dataset.oldPaddingTop = el.style.paddingTop;
    el.dataset.oldPaddingBottom = el.style.paddingBottom;
    el.style.height = 0;
    el.style.paddingTop = 0;
    el.style.paddingBottom = 0;
  },
  enter(el) {
    el.dataset.oldOverflow = el.style.overflow;
    if (el.scrollHeight !== 0) {
      el.style.height = el.scrollHeight + "px";
      el.style.paddingTop = el.dataset.oldPaddingTop;
      el.style.paddingBottom = el.dataset.oldPaddingBottom;
    } else {
      el.style.height = "";
      el.style.paddingTop = el.dataset.oldPaddingTop;
      el.style.paddingBottom = el.dataset.oldPaddingBottom;
    }
    el.style.overflow = "hidden";
  },
  "after-enter"(el) {
    el.style.transition = "";
    el.style.height = "";
    el.style.overflow = el.dataset.oldOverflow;
  },
  "before-leave"(el) {
    if (!el.dataset) el.dataset = {};
    el.dataset.oldPaddingTop = el.style.paddingTop;
    el.dataset.oldPaddingBottom = el.style.paddingBottom;
    el.dataset.oldOverflow = el.style.overflow;
    el.style.height = el.scrollHeight + "px";
    el.style.overflow = "hidden";
  },
  leave(el) {
    if (el.scrollHeight !== 0) {
      el.style.transition = elTransition;
      el.style.height = 0;
      el.style.paddingTop = 0;
      el.style.paddingBottom = 0;
    }
  },
  "after-leave"(el) {
    el.style.transition = "";
    el.style.height = "";
    el.style.overflow = el.dataset.oldOverflow;
    el.style.paddingTop = el.dataset.oldPaddingTop;
    el.style.paddingBottom = el.dataset.oldPaddingBottom;
  },
};

export default {
  name: "CollapseTransition",
  functional: true,
  render(h, { children }) {
    const data = {
      on: Transition,
    };
    return h("transition", data, children);
  },
};
```

