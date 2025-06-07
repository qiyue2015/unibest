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

// 封装返回上一页方法
const goBackOrHome = () => {
  uni.navigateBack({
    delta: 1,
    fail: () => {
      uni.reLaunch({ url: '/pages/index/index' })
    },
  })
}

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
        toast.loading({
          msg: '登录中',
          duration: 1000,
          closed: () =>
            toast.success({
              msg: '登录成功',
              duration: 1000,
              closed: goBackOrHome,
            }),
        })
      })
      .catch(() => {
        agree.value = false
      })
    return
  }

  try {
    toast.loading({
      msg: '登录中',
      duration: 1000,
      closed: () =>
        toast.success({
          msg: '登录成功',
          duration: 1000,
          closed: goBackOrHome,
        }),
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 实时获取手机号
const onRealtimePhone = async ({ detail }) => {
  if (detail.errMsg === 'getPhoneNumber:ok') {
    try {
      toast.loading({ msg: '登录中', duration: 0 })
      await bindPhone(detail.code)
      await userStore.getUserInfo()
      goBackOrHome()
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

// 取消登录
const onCancelLogin = () => {
  userStore.clearUserInfo()
  uni.switchTab({ url: '/pages/index/index' })
}

const handleOpenPrivacyContract = () => {
  // #ifdef MP-WEIXIN
  wx.openPrivacyContract({
    success: () => {
      console.log('打开隐私协议成功')
    },
    fail: (res) => {
      console.error('打开隐私协议失败', res)
    },
  })
  // #endif
}

onLoad(async () => {
  try {
    uni.showLoading({ title: '加载中' })
    await userStore.getUserInfo()
  } finally {
    uni.hideLoading()
  }
})
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
        <view v-if="!userInfo?.mobile" class="rounded-full overflow-hidden">
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
      <wd-checkbox v-model="agree">已阅读并同意</wd-checkbox>
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
