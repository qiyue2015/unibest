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
import { useMessage, useToast } from 'wot-design-uni'

const toast = useToast()
const message = useMessage()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const agree = ref(false)

// 用户登录
const onLogin = async () => {
  if (!agree.value) {
    message
      .confirm({
        title: '用户隐私协议须知',
        msg: '请阅读《用户隐私协议》，点击“确认”即视为你已同意。',
      })
      .then(async () => {
        agree.value = true
        uni.showLoading({ title: '登录中' })
        await fetchUserInfo()
        uni.hideLoading()
        toast.success({
          msg: '登录成功',
          duration: 1000,
          closed: () => {
            uni.navigateBack({ delta: 1 })
          },
        })
      })
    return
  }

  try {
    toast.success({
      msg: '登录成功',
      duration: 1000,
      closed: () => {
        uni.navigateBack({ delta: 1 })
      },
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 取消登录
const onCancelLogin = () => {
  userStore.clearUserInfo()
  uni.switchTab({ url: '/pages/index/index' })
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    toast.loading({
      msg: '加载中…',
      duration: 0,
    })
    await userStore.getUserInfo()
  } finally {
    toast.close()
  }
}

// 绑定手机号
// const onBindPhone = async ({ code }) => {
//   if (!agree.value) {
//     toast.error({ msg: '请先阅读并同意相关协议', duration: 1500 })
//     return
//   }
//   try {
//     toast.loading({ msg: '登录中', duration: 0, direction: 'vertical' })
//     await userStore.getUserInfo()
//     if (userStore.userInfo?.mobile) {
//       await bindPhone(code)
//     }
//     uni.switchTab({ url: '/pages/index/index' })
//   } finally {
//     toast.close()
//   }
// }

// 实时获取手机号
const onRealtimePhone = async ({ detail }) => {
  if (detail.errMsg === 'getPhoneNumber:ok') {
    if (!agree.value) {
      message
        .confirm({
          title: '用户隐私协议须知',
          msg: '请阅读《用户隐私协议》，点击“确认”即视为你已同意。',
        })
        .then(() => {
          agree.value = true
        })
      return
    }
    try {
      toast.loading({ msg: '登录中', duration: 0 })
      await bindPhone(detail.code)
      await userStore.getUserInfo()
      uni.navigateBack({ delta: 1 })
    } finally {
      toast.close()
    }
  } else {
    toast.error({
      msg: '获取手机号失败，请重试',
      duration: 1000,
    })
  }
}

// 同意协议变更处理
const onAgreeChange = (e: any) => {
  if (e.value && !userInfo.value?.mobile) {
    fetchUserInfo()
  }
}

const handleOpenPrivacyContract = () => {
  // #ifdef MP-WEIXIN
  uni.openPrivacyContract({
    success: () => {
      console.log('打开隐私协议成功')
    },
    fail: (res) => {
      console.error('打开隐私协议失败', res)
    },
  })
  // #endif
}
</script>

<template>
  <view class="main flex flex-col items-center justify-between">
    <!-- #ifdef MP-WEIXIN -->
    <xc-privacy-popup></xc-privacy-popup>
    <!-- #endif -->
    <view class="w-full flex-1">
      <view class="text-center my-20">
        <image
          src="https://wx.qlogo.cn/mmhead/McYMgia19V0UZvyQQ38YTib9vzXiaaPUtKwQbSNAT6qmK8BwqsFf8iaGAqicedqRI1VxYvJxk2ofQRYU/0"
          class="w-20 h-20 bg-white rounded-full"
          mode="aspectFill"
        />
        <view class="text-gray-500 text-sm mt-2">凉山州蓝球协会</view>
      </view>

      <view class="mx-20">
        <view></view>
        <view v-if="!userInfo?.mobile && agree" class="rounded-full overflow-hidden">
          <button type="primary" open-type="getPhoneNumber" @getphonenumber="onRealtimePhone">登录</button>
        </view>
        <view v-else class="rounded-full overflow-hidden">
          <button type="primary" block @click="onLogin">登录</button>
        </view>
        <view class="mt4">
          <wd-button type="info" size="large" block @click="onCancelLogin">取消登陆</wd-button>
        </view>
      </view>
    </view>

    <view class="flex items-center mb-2 mt-6">
      <wd-checkbox v-model="agree" @change="onAgreeChange">已阅读并同意</wd-checkbox>
      <text class="text-blue-500 mx-1" style="font-size: var(--wot-checkbox-label-fs, 14px)" @click="handleOpenPrivacyContract">
        《用户隐私协议》
      </text>
    </view>

    <wd-gap safe-area-bottom height="0" />
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
