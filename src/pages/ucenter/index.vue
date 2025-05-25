<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '我的',
  },
}
</route>

<template>
  <view class="main flex flex-col relative box-border">
    // #ifdef MP-WEIXIN
    <view class="box-border w-full center" :style="headerStyle">
      <view class="text-lg font-bold text-black w-full text-center">我的</view>
    </view>
    // #endif

    <view class="z-36 mx-4 flex flex-col gap-4">
      <!-- 顶部头像昵称区域 -->
      <view class="w-full pt-4 pb-4 flex justify-between items-center">
        <view class="flex items-center">
          <image :src="userInfo.avatar" class="w-12 h-12 rounded-full bg-dark" mode="aspectFill" />
          <view class="ml-2" @click="goSetting">
            <view class="text-base font-bold text-black">{{ userInfo.nickname }}</view>
            <view class="text-sm text-gray-500">{{ userInfo.mobile }}</view>
          </view>
        </view>
        <wd-button icon="edit-outline" type="icon" @click="goTo('/pages-sub/setting/index', true)" />
      </view>

      <!-- 功能入口区域 -->
      <view class="rounded-xl overflow-hidden">
        <wd-cell-group border>
          <wd-cell title="我的订单" size="large" is-link center @click="goOrder">
            <template #icon>
              <image src="https://mp-img1.wifixc.com/static/images/dingdan.svg" class="w-8 h-8 mr-3" mode="aspectFill" />
            </template>
          </wd-cell>
          <wd-cell title="常用观演人" size="large" is-link center @click="goTo('/pages-sub/viewer/index', true)">
            <template #icon>
              <image src="https://mp-img1.wifixc.com/static/images/viewerHL.svg" class="w-8 h-8 mr-3" mode="aspectFill" />
            </template>
          </wd-cell>
        </wd-cell-group>
      </view>

      <!-- 菜单列表 -->
      <view class="rounded-xl overflow-hidden">
        <wd-cell-group border>
          <block v-for="item in menuList" :key="item.title">
            <wd-cell
              :title="item.title"
              :center="true"
              size="large"
              is-link
              @click="goTo(item.url, item.need_login)"
              class="menu-card"
            >
              <template #icon>
                <image :src="item.icon" class="w-8 h-8 mr-3" mode="aspectFill" />
              </template>
            </wd-cell>
          </block>
        </wd-cell-group>
      </view>

      <!-- 设置 -->
      <view class="rounded-xl overflow-hidden">
        <wd-cell-group border>
          <wd-cell title="设置" size="large" is-link center @click="goTo('/pages-sub/setting/index', true)">
            <template #icon>
              <image src="https://mp-img1.wifixc.com/static/images/shezhi.svg" class="w-8 h-8 mr-3" mode="aspectFill" />
            </template>
          </wd-cell>
        </wd-cell-group>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from 'wot-design-uni'
import { useAppStore, useUserStore } from '@/store'

const appStore = useAppStore()
const userStore = useUserStore()
const message = useMessage()

const headerStyle = computed(() => {
  return {
    height: `${appStore.topBarHeight}px`,
    paddingTop: `${appStore.statusBarHeight}px`,
  }
})

const userInfo = computed(() => {
  return {
    avatar: userStore.userInfo.avatar || '/static/images/avatar.png',
    nickname: userStore.isLogined ? userStore.userInfo.nickname || '设置昵称' : '登录 / 注册',
    mobile: userStore.userInfo.mobile || '开启您的快乐时光',
  }
})

const menuList = [
  {
    title: '帮助与客服',
    icon: 'https://mp-img1.wifixc.com/static/images/kefu.svg',
    url: '/pages-sub/help/index',
    need_login: false,
  },
  {
    title: '关于我们',
    icon: 'https://mp-img1.wifixc.com/static/images/about.svg',
    url: '/pages-sub/about/index',
    need_login: false,
  },
]

// 封装跳转
const goTo = (url: string, needLogin = true) => {
  // 如果需要登录且用户未登录
  if (needLogin && !userStore.isLogined) {
    message
      .confirm({
        msg: '登录后可使用该功能，是否前往登录？',
        title: '请先登录',
      })
      .then(() => {
        uni.navigateTo({ url: '/pages/login/index' })
      })
      .catch(() => {
        // 取消登录
      })
    return
  }

  // 跳转到指定页面
  uni.navigateTo({ url })
}

// 我的订单
const goOrder = () => goTo('/pages/order/index', true)

// 设置
const goSetting = () => goTo('/pages-sub/setting/index', true)

onLoad(() => {})
</script>

<style lang="scss">
body,
page,
main {
  @apply h-screen overflow-hidden;
  background-image: url(https://mp-img1.wifixc.com/static/images/topBg.png);
  background-size: 100% auto;
  background-position: top center;
  background-repeat: no-repeat;
  background-color: #f7f7f7;
}
</style>
