<route lang="json5">
{
  needLogin: true,
  style: {
    // navigationStyle: 'custom',
    navigationBarTitleText: '昭觉县移风易俗',
  },
}
</route>
<template>
  <view class="bg-white overflow-hidden pt-2 px-4">
    <view class="flex flex-row gap-4">
      <view>我要留言</view>
      <view>我要写信</view>
    </view>>
  </view>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'

defineOptions({
  name: 'Home',
})

const userStore = useUserStore()

console.log('当前平台:', userStore.isLogined)

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const author = ref('菲鸽')
const description = ref(
  'unibest 是一个集成了多种工具和技术的 uniapp 开发模板，由 uniapp + Vue3 + Ts + Vite4 + UnoCss + UniUI + VSCode 构建，模板具有代码提示、自动格式化、统一配置、代码片段等功能，并内置了许多常用的基本组件和基本功能，让你编写 uniapp 拥有 best 体验。',
)
// 测试 uni API 自动引入
onLoad(() => {
  console.log('项目作者:', author.value)
})
</script>

<style>
.main-title-color {
  color: #d14328;
}
</style>
