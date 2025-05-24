import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  globalStyle: {
    navigationStyle: 'default',
    navigationBarTitleText: 'unibest',
    navigationBarBackgroundColor: '#f8f8f8',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FFFFFF',
  },
  easycom: {
    autoscan: true,
    custom: {
      '^wd-(.*)': 'wot-design-uni/components/wd-$1/wd-$1.vue',
      '^(?!z-paging-refresh|z-paging-load-more)z-paging(.*)':
        'z-paging/components/z-paging$1/z-paging$1.vue',
    },
  },
  // 如果不需要tabBar，可以注释掉这个配置，或者直接删除
  tabBar: {
    color: '#444444',
    selectedColor: '#00B386',
    backgroundColor: '#F8F8F8',
    borderStyle: 'white',
    height: '50px',
    fontSize: '10px',
    iconWidth: '24px',
    spacing: '3px',
    list: [
      {
        iconPath: 'static/tabbar/home.png',
        selectedIconPath: 'static/tabbar/homeHL.png',
        pagePath: 'pages/index/index',
        text: '赛程',
      },
      {
        iconPath: 'static/tabbar/ticket.png',
        selectedIconPath: 'static/tabbar/ticketHL.png',
        pagePath: 'pages/ticket/index',
        text: '门票',
      },
      {
        iconPath: 'static/tabbar/ucenter.png',
        selectedIconPath: 'static/tabbar/ucenterHL.png',
        pagePath: 'pages/ucenter/index',
        text: '我的',
      },
    ],
  },
})
