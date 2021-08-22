exports.ICON_TAG_MAP = {
  antd: {
    title: 'Ant Design',
    icon: 'icon-antd.svg',
  },
  d3: {
    title: 'D3.js',
    icon: 'icon-d3.png',
  },
  h5: {
    title: 'H5',
    icon: 'icon-h5.svg',
  },
  react: {
    title: 'React',
    icon: 'icon-react.svg',
  },
  redux: {
    title: 'Redux',
    icon: 'icon-redux.svg',
  },
  vue: {
    title: 'Vue',
    icon: 'icon-vue.png',
  },
  vant: {
    title: 'Vant',
    icon: 'icon-vant.png',
  },
}

// 客户端类型
exports.CLIENT_TYPES = [
  {
    icon: 'pc',
    label: 'PC端(Web)'
  },
  {
    icon: 'mobile',
    label: 'Mobile(Web)'
  },
  {
    icon: 'wx-mini',
    label: '小程序'
  },
  {
    icon: 'android',
    label: 'Android APP'
  },
  {
    icon: 'ios',
    label: 'IOS APP'
  }
];

exports.works = [
  {
    slug: 'takeout',
    title: '仿外卖APP Web版',
    techs: 'vue,vue-router,vuex,vant',
    desc: '基于 Vue.js 2.x 实现的仿外卖APP Web版练习',
    side: '2',
    date: '2020-05-03 10:00',
    images:
      '1588647448423.png,1588647476647.png,1588647488239.png,1588647501715.png,1588647515883.png',
  },
  {
    slug: 'weixin-music-player',
    title: '音乐播放器',
    link: '1553269237445.png',
    techs: '微信小程序,js',
    desc: '音乐播放器 个人微信小程序练习',
    side: '3',
    date: '2018-11-25 19:00',
    images: '1553269237445.png',
  },
]
