---
slug: "/blog/vue-tree2select"
title: "树的数据动态渲染成（单选/多选）下拉列表"
date: "2021-04-06 12:15:23"
brief: "之前在工作中遇到过这样业务需求：需要根据接口返回的树的数据动态渲染支持单/多选的下拉列表。由于整个项目前端环境是 jQuery + easyui 的，实现完成之后感觉有些繁琐，所以在此用 vue + element-ui 重新梳理一番。"
tag: "vue"
cover: "vue-tree2select.gif"
---
### 业务背景

> 之前在工作中遇到过这样业务需求：需要根据接口返回的树的数据动态渲染支持单/多选的下拉列表。由于整个项目前端环境是 jQuery + easyui 的，实现完成之后感觉有些繁琐，所以在此用 vue + element-ui 重新梳理一番。

<br/>

### 效果预览

![vue-tree2select](/images/vue-tree2select.gif)



### 数据格式
树的数据格式如下：
```json
[
  {
    "id": 1,
    "label": "道路等级",
    "required": true,
    "multiple": false,
    "children": [
      {
        "id": 2,
        "label": "城市道路",
        "required": true,
        "multiple": false,
        "children": [
          {
            "id": 3,
            "label": "国道",
            "required": true,
            "multiple": true,
            "children": [
              {
                "id": 4,
                "label": "出口",
                "required": true,
                "multiple": false
              },
              {
                "id": 5,
                "label": "入口",
                "required": true,
                "multiple": false
              },
              {
                "id": 6,
                "label": "路面",
                "required": true,
                "multiple": false
              }
            ]
          },
          {
            "id": 7,
            "label": "省道",
            "required": true,
            "multiple": true,
            "children": [
              {
                "id": 8,
                "label": "出口",
                "required": true,
                "multiple": false
              },
              {
                "id": 9,
                "label": "入口",
                "required": true,
                "multiple": false
              },
              {
                "id": 10,
                "label": "路面",
                "required": true,
                "multiple": false
              }
            ]
          },
          {
            "id": 11,
            "label": "县道",
            "required": true,
            "multiple": true,
            "children": [
              {
                "id": 12,
                "label": "出口",
                "required": true,
                "multiple": false
              },
              {
                "id": 13,
                "label": "入口",
                "required": true,
                "multiple": false
              },
              {
                "id": 14,
                "label": "路面",
                "required": true,
                "multiple": false
              }
            ]
          },
          {
            "id": 15,
            "label": "乡道",
            "required": true,
            "multiple": true,
            "children": [
              {
                "id": 16,
                "label": "出口",
                "required": true,
                "multiple": false
              },
              {
                "id": 17,
                "label": "入口",
                "required": true,
                "multiple": false
              },
              {
                "id": 18,
                "label": "路面",
                "required": true,
                "multiple": false
              }
            ]
          }
        ]
      },
      {
        "id": 19,
        "label": "公路",
        "required": true,
        "multiple": true,
        "children": [
          {
            "id": 20,
            "label": "出口",
            "required": true,
            "multiple": false
          },
          {
            "id": 21,
            "label": "入口",
            "required": true,
            "multiple": false
          },
          {
            "id": 22,
            "label": "路面",
            "required": true,
            "multiple": false
          }
        ]
      }
    ]
  },
  {
    "id": 23,
    "label": "所属道路",
    "required": true,
    "multiple": false,
    "children": [
      {
        "id": 24,
        "label": "翠苑北路",
        "required": true,
        "multiple": false
      },
      {
        "id": 25,
        "label": "梦湖路",
        "required": true,
        "multiple": false
      },
      {
        "id": 26,
        "label": "天目山路",
        "required": true,
        "multiple": false
      },
      {
        "id": 27,
        "label": "文一路",
        "required": true,
        "multiple": false
      }
    ]
  },
  {
    "id": 28,
    "label": "监控场所",
    "fullPath": "28",
    "required": false,
    "multiple": true,
    "children": [
      {
        "id": 29,
        "label": "学校",
        "required": false,
        "multiple": false
      },
      {
        "id": 30,
        "label": "事业单位",
        "required": false,
        "multiple": false
      },
      {
        "id": 31,
        "label": "企业",
        "required": false,
        "multiple": false
      }
    ]
  }
]
```
数据结构相关约定：表单中下拉框部分的值提交格式，形如 `["1$2$7$8/10", "23$25"]` ，若无选中项则为 `[]`。**每个下拉框的选中值用 `$` 拼接，同一个下拉框中的多选值用 `/` 拼接。** 

<br/>

### 实现思路
1. **根据层级和根节点处理节点数据在 vue 中使用 `v-for` 进行渲染时，外层 `v-for` 循环渲染行，内层循环渲染列。**

  为了便于处理数据，需要根据树的根节点（这里是个多叉树）以及所在列数（层级）去找到某个下拉框相关的信息。所以，先处理一下上述树的数据。处理后的数据格式如下（以下仅展示部分数据）：

  ```json
  [
    {
      "root": {
        "node": null,
        "children": [
          {
            "id": "1",
            "label": "道路等级",
            "pid": "root",
            "aid": "1",
            "required": true,
            "multiple": false,
            "level": 0
          },
          {
            "id": "23",
            "label": "所属道路",
            "pid": "root",
            "aid": "23",
            "required": true,
            "multiple": false,
            "level": 0
          },
          {
            "id": "28",
            "label": "监控场所",
            "pid": "root",
            "aid": "28",
            "required": false,
            "multiple": true,
            "level": 0
          }
        ]
      }
    },
    {
      "1": {
        "node": {
          "id": 1,
          "label": "道路等级",
          "pid": "root",
          "aid": "1",
          "required": true,
          "multiple": false,
          "level": 0
        },
        "children": [
          {
            "id": "2",
            "label": "城市道路",
            "pid": "1",
            "aid": "1",
            "required": true,
            "multiple": false,
            "level": 1
          },
          {
            "id": "19",
            "label": "公路",
            "pid": "1",
            "aid": "1",
            "required": true,
            "multiple": true,
            "level": 1
          }
        ]
      }
    }
  ]
  ```
  表单中渲染的数据按列来分层级，可以分为 0层、1层、2层...不同层级的数据放在数组对应下标的对象中。数组的每个对象含义为
  ```js
  {
    父节点id（根节点的父节点id值为root）: {
      "node": 父节点对象,
      "children":  当前父节点下的子节点们
    }
  }
  ```
  - 根节点的层级 level 为 0；
  - 层级为 0 的地方（也就是数组的第一项）渲染的是 label 文本（数据取自下方的 `root` 属性），层级大于0表示渲染的是下拉框；- 每个节点的属性 `pid`表示父节点id，`aid`表示根节点id，`required` 表示下级下拉框是否必填（用于表单校验），`multiple` 表示下级下拉框是否可多选。

  <br/>

2. **下拉框的下拉列表数据在 vue 组件的 `data` 属性中定义 `selectListData` 属性用于存放用于渲染下拉列表选项的数据。** 

  ```js
  selectListData: {
    `pid_${pid}_list`: []
  }
  ```
  根据上一步处理好的数据，可以较容易地获得以下数据：
  ```js
  selectListData: {
    "pid_root_list": [
      {
        "id": "1",
        "label": "道路等级",
        "pid": "root",
        "aid": "1",
        "required": true,
        "multiple": false,
        "level": 0
      },
      {
        "id": "23",
        "label": "所属道路",
        "pid": "root",
        "aid": "23",
        "required": true,
        "multiple": false,
        "level": 0
      },
      {
        "id": "28",
        "label": "监控场所",
        "pid": "root",
        "aid": "28",
        "required": false,
        "multiple": true,
        "level": 0
      }
    ],
    "pid_1_list": [...]
  }
  ```
  <br/>

3. **下拉框的选中值在 vue 组件的 `data` 属性中定义 `selectForm` 属性用于存放用于渲染下拉框选中的数据。** 

  ```js
  selectForm: {
    `aid_${aid}_level_${level}`: '' // 多选时初始化为[]
  }
  ```
  数据初始化时，只需初始化层级为1的下拉框。为了在 `v-for` 时便于控制渲染数量（毕竟现在还无法判断一个下拉框是否需要渲染），在 `data` 属性中再定义一个 `selectRows`，只要渲染某个**下拉框**，就把该下拉框的父节点id放进来。
  ```js
  selectRows: {
    `${pid}`: [level为1的下拉框的父节点id, level为2的下拉框的父节点id, ...]
  }
  ```
  根据这个数据就知道每一行要渲染多少个下拉框了。
  <br/>

4. **下拉框选中值变化的事件处理当我们改变某个下拉框的选中值时，需要更新两处数据**：

  - 将当前下拉框的选中值更新；将下级的下拉框（如果有下级）的选中值重置，就是 `selectForm` 中的相关数据更新为 `""` 或 `[]` 。
  - `selectRows` 中的数据更新：若当前选中值变化的下拉框无下级，则无需更新；反之，则将其中对应的所有下级下拉框数据全部移除，并更新当前下拉框对应的数据。
  <br/>

5. **填充表单数据接口返回的下拉框选中数据格式**如下：

  ```json
  ["1$2$7$8/10", "23$25"]
  ```
  上一步已经完成下拉框选中值的初始化，因此接收到数据后，只需更新 `selectForm` 和 `selectRows` 中的数据。
  <br/>

6. 代码最终 vue 的 `template` 部分基本如下：
  ```vue
  <template>
    <el-form
      ref="selectForm"
      :model="selectForm"
      label-width="80px"
      size="small"
      v-if="hasGotSelectList"
    >
      <el-form-item
        :label="row.label"
        v-for="row in selectListData.pid_root_list"
        :key="row.id"
      >
        <div
          class="select-item"
          v-for="(item, index) in selectRows[row.id]"
          :key="item"
        >
          <el-form-item
            :prop="`aid_${row.id}_level_${index + 1}`"
            :rules="treeDataGroupByLevel[(index + 1).toString()][item].node.required ? rules.tag : []"
          >
            <custom-select
              v-if="index < 1 || selectForm[`aid_${row.id}_level_${index}`]"
              v-model="selectForm[`aid_${row.id}_level_${index + 1}`]"
              :multiple="treeDataGroupByLevel[(index + 1).toString()][item].node.multiple"
              filterable
              :popper-append-to-body="false"
              :custom-multiple="treeDataGroupByLevel[(index +1).toString()][item].node.multiple"
              placeholder="请选择"
              size="small"
              style="width: 220px"
              @change="handleSelectChange(row.id, index + 1)"
            >
              <el-option
                v-for="item in selectListData[`pid_${item}_list`]"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              >
              </el-option>
            </custom-select>
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button
          size="medium"
          type="primary"
          @click="handleSubmitForm('selectForm')"
        >保存</el-button>
        <el-button
          size="medium"
          @click="handleResetForm('selectForm')"
        >重置</el-button>
      </el-form-item>
    </el-form>
  </template>
  ```
  其中 `custom-select` 组件就是基于 element 的 select 做了细微的改动。