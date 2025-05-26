<route lang="json5">
{
  style: {
    navigationBarTitleText: '用户登陆',
  },
}
</route>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { bindPhone } from '@/api/user'
import { useToast } from 'wot-design-uni'

const toast = useToast()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 用户登录
const onLogin = async () => {
  try {
    toast.success({
      msg: '登录成功',
      duration: 1000,
      closed: () => {
        uni.switchTab({ url: '/pages/index/index' })
      },
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 绑定手机号
const onBindPhone = async ({ code }) => {
  try {
    toast.loading({ msg: '登录中', duration: 0, direction: 'vertical' })
    await userStore.getUserInfo()
    if (userStore.userInfo?.mobile) {
      await bindPhone(code)
    }
    uni.switchTab({ url: '/pages/index/index' })
  } finally {
    toast.close()
  }
}

// 实时获取手机号
const onGetRealtimePhone = async ({ detail }) => {
  // {"errMsg":"getPhoneNumber:ok","code":"a7b82b355371679cd1f6b25b7bd240cc58d2e365473df6097a45e018d6e85481"}
  if (detail.errMsg === 'getPhoneNumber:ok') {
    try {
      toast.loading({ msg: '登录中', duration: 0 })
      await bindPhone(detail.code)
      await userStore.getUserInfo()
      uni.switchTab({ url: '/pages/index/index' })
    } finally {
      toast.close()
    }
  } else {
    toast.error({ msg: '获取手机号失败，请重试', duration: 1000 })
  }
}

// 用户协议
const onUserAgreement = () => {
  uni.navigateTo({
    url: '/pages-sub/agreement/index',
  })
}

// 隐私政策
const onPrivacyPolicy = () => {
  uni.navigateTo({
    url: '/pages-sub/privacy/index',
  })
}

onShow(() => {
  toast.loading({ msg: '加载中', duration: 0 })
  userStore.getUserInfo().finally(() => {
    toast.close()
  })
})
</script>

<template>
  <view class="main flex flex-col items-center">
    <view class="text-center my-20">
      <image src="/static/images/avatar.png" class="w-20 h-20 rounded-full mb-2" mode="aspectFill" />
      <view class="text-gray-500 text-sm">凉山州蓝球协会</view>
    </view>
    <view class="w-full">
      <view class="mx-10">
        <block v-if="userInfo?.mobile">
          <wd-button size="large" block @click="onLogin">登录</wd-button>
        </block>
        <block v-else>
          <button type="primary" open-type="getRealtimePhoneNumber" @getrealtimephonenumber="onGetRealtimePhone">
            一键授权登录
          </button>
        </block>
      </view>
    </view>
    <view class="flex items-center text-size-xs text-gray-400 mt-4">
      登录即视为同意
      <text class="text-pink-500 mx-1" @click="onUserAgreement">《用户协议》</text>
      和
      <text class="text-pink-500 ml-1" @click="onPrivacyPolicy">《隐私政策》</text>
    </view>
  </view>
</template>

<style lang="scss">
body,
page,
.main {
  @apply w-full h-screen overflow-hidden;
  background-color: #f8f8f8;
}

.bg-image {
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: cover;
}
</style>
