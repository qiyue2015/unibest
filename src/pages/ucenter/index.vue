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

    <view class="z-36 mx-4">
      <!-- 顶部头像昵称区域 -->
      <view class="flex items-center pt-4 pb-8">
        <image :src="userInfo.avatar" class="w-12 h-12 rounded-full bg-dark" mode="aspectFill" />
        <view class="ml-2" @click="goSetting">
          <view class="text-base font-bold text-black">{{ userInfo.nickname }}</view>
          <view class="text-sm text-gray-500">{{ userInfo.mobile }}</view>
        </view>
      </view>

      <!-- 功能入口区域 -->
      <view class="rounded-xl overflow-hidden mb-4">
        <wd-cell-group border>
          <wd-cell title="我的订单" size="large" is-link center @click="goOrder">
            <template #icon>
              <image src="https://mp-img1.wifixc.com/static/images/dingdan.svg" class="w-8 h-8 mr-3" mode="aspectFill" />
            </template>
          </wd-cell>
          <!-- <wd-cell title="我的门票" size="large" is-link center @click="goTicket">
            <template #icon>
              <image src="https://mp-img1.wifixc.com/static/images/youhui.svg" class="w-6 h-6 mr-2" mode="aspectFill" />
            </template>
          </wd-cell> -->
        </wd-cell-group>
      </view>
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
    title: '常用观演人',
    icon: 'https://mp-img1.wifixc.com/static/images/viewerHL.svg',
    url: '/pages-sub/viewer/index',
    need_login: true,
  },
  {
    title: '帮助与客服',
    icon: 'https://mp-img1.wifixc.com/static/images/kefu.svg',
    url: '/pages-sub/help/index',
    need_login: false,
  },
  {
    title: '设置',
    icon: 'https://mp-img1.wifixc.com/static/images/shezhi.svg',
    url: '/pages-sub/setting/index',
    need_login: true,
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

// 我的门票
const goTicket = () => uni.switchTab({ url: '/pages/ticket/index' })

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

.ucenter-bg {
  min-height: 100vh;
  background: url('/static/images/topBg.png') top center no-repeat;
  background-size: 100% auto;
  background-color: #f7f7f7;
}

.ucenter-header {
  background: #fff;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  background: #f3f3f3;
}

.nickname {
  color: #222;
}

.login-btn {
  background: #d14328;
  color: #fff;
  font-size: 16px;
}

.menu-list .menu-card {
  transition: box-shadow 0.2s;
}

.menu-list .menu-card:active {
  box-shadow: 0 2px 8px rgba(209, 67, 40, 0.08);
}
</style>
