---
slug: "/blog/travel-of-learning-RN"
title: "React Native 学习之旅"
date: "2020-06-04 00:34:29"
brief: "跨端APP开发的一次尝试。"
tag: "react"
---

React Native 的生态日趋成熟，对于熟悉React使用的前端来说上手的门槛也比较低。虽然在项目开发过程中很可能会涉及到 iOS 以及 Android 原生知识（毕竟也不是所有第三方模块都是符合自己需求的，可能要改造，这方面对于一个纯web前端来说确实还是很困难），不过通过 React Native 学习开发跨端APP体验还是不错的（如果真的遇到要接触原生，那就只能迎难而上了）。

### 搭建环境

> react-native 0.62.2
>
> MacOS 10.15
>
> Genymotion
>
> VSCode

根据[开发文档](https://reactnative.cn/docs/getting-started.html)中的步骤一步步执行下来。

- Q: 当前版本需要安装`cocoapods`，直接访问总是会提示访问CDN出错（因为没有稳定的科学上网工具）。 

  A: 在项目 ios 目录下的 `Podfile` 文件顶部添加 `cocoapods` 的国内镜像地址，如下:

   ```  source 'https://mirrors.tuna.tsinghua.edu.cn/git/CocoaPods/Specs.git'  ```  

  然后 `cd ios`  =>  `pod install`  =>  `cd ..` 

  

- Q: 需要使用图标库 `react-native-vector-icons`。  步骤：使用 `yarn` 或 `npm` 命令安装完成；切换到 ios 目录下完成了 `pod update`；但在 iOS 环境运行，红屏报错：*Unrecognized font family 'XXX'* 。在 Android 模拟器上也报错。  

  A: react-native 0.60之后不再强制使用 `react-native link` 命令去手动关联原生依赖了（如若使用了手动link的方式，此处会提示其他错误），默认使用 [Autolinking](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md) 。

  除以上步骤外，还需要加一步。在 ios 目录下的 `Info.plist` 文件中将字体信息添加进来，如下：

  ```ruby
  <key>UIAppFonts</key>
  <array>
    <string>AntDesign.ttf</string>
    <string>Entypo.ttf</string>
    <string>EvilIcons.ttf</string>
    <string>Feather.ttf</string>
    <string>FontAwesome.ttf</string>
    <string>FontAwesome5_Brands.ttf</string
    <string>FontAwesome5_Regular.ttf</string>
    <string>FontAwesome5_Solid.ttf</string>
    <string>Fontisto.ttf</string>
    <string>Foundation.ttf</string>
    <string>Ionicons.ttf</string>
    <string>MaterialIcons.ttf</string>
    <string>MaterialCommunityIcons.ttf</string>
    <string>SimpleLineIcons.ttf</string>
    <string>Octicons.ttf</string>
    <string>Zocial.ttf</string>
  </array>
  ```

  关于 Android，查看 `android/app/src/main/assets/fonts/` 目录下是否有字体文件，没有的话就从 `node_modules/react-native-vector-icons/Fonts` 这个目录拷贝过来。

  

- Q: Android 9 以上的系统发起 HTTP 请求会红屏报错。

  A: Android 9 起系统的网络安全性提高，查阅网上资料设置了一番之后，在genymotion上并不如预料。建议还是换 HTTPS 吧。

