<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
    // 页面不允许上下滑动
    enablePullDownRefresh: false,
  },
}
</route>

<template>
  <view class="overflow-hidden" :style="{ marginTop: safeAreaInsets?.top + 'px' }">
    <view class="page">
      <view class="p-10">
        <view class="text-xl mb-4">
          Wot Design Uni
          <text class="version">@{{ packageConfig.version }}</text>
        </view>
        <view class="text-sm text-justify">
          Wot Design Uni 是一个基于Vue3+TS开发的uni-app组件库，提供70+高质量组件，支持暗黑模式、国际化和自定义主题。
        </view>
      </view>
      <view class="px-4">
        <block v-for="(item, index) in list" :key="index">
          <view class="mb-2 rounded overflow-hidden">
            <wd-cell-group :title="item.name" border>
              <template #value>
                <view class="w-5 h-5 overflow-hidden line-height-none">
                  <image class="w-full h-full" :src="item.icon" />
                </view>
              </template>
              <wd-cell
                v-for="(page, idx) in item.pages"
                :key="idx"
                :title="page.name"
                title-width="80%"
                is-link
                @click="handleClick(page.url)"
              />
            </wd-cell-group>
          </view>
        </block>
      </view>
      <view class="my-4">
        <view class="text-center text-sm">当前平台是：{{ PLATFORM.platform }} 组件版本：v{{ packageConfig.version }}</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import homeList from '@/data/homeList.json'
import PLATFORM from '@/utils/platform'
// eslint-disable-next-line
// @ts-ignore
import packageConfig from '../../../package.json'

defineOptions({
  name: 'Home',
})

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

const imgModules: any = import.meta.glob('../../static/index/*.png', { eager: true })

// 将驼峰式组件名转换为短横线式
const toKebabCase = (name: string) => {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

const list = homeList.map((item) => {
  return {
    ...item,
    icon: imgModules['../../static/index/' + item.icon].default,
    pages: item.pages.map((page) => {
      return {
        ...page,
        url: '/pages-' + toKebabCase(item.id) + '/' + toKebabCase(page.id) + '/index',
      }
    }),
  }
})

const handleClick = (url: string) => {
  uni.navigateTo({ url })
}

// 测试 uni API 自动引入
onLoad(() => {
  console.log('onLoad')
})
</script>
