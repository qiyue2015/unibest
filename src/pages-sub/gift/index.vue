<route lang="json5">
{
  style: {
    navigationBarTitleText: '领取门票',
  },
}
</route>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import { useAppStore, useUserStore } from '@/store'
import { bindPhone, receiveTicket } from '@/api/user'

const toast = useToast()
const appStore = useAppStore()
const userStore = useUserStore()

const EXPIRE_SECONDS = 10 // 二维码超时时间（秒），可随时调整
const isExpired = ref(false)

const formRef = ref()
const formData = ref({ promoter_id: 0, realname: '', idcard: '' })

const userInfo = computed(() => userStore.userInfo)
const canSubmit = computed(() => formData.value.realname && formData.value.idcard)
const scene = computed(() => appStore.scene)

// 直接领取门票
const onSubmit = async () => {
  formRef.value.validate().then(async ({ valid }) => {
    if (valid) {
      try {
        toast.loading({ msg: '正在领取门票，请稍候', duration: 0 })
        await receiveTicket(formData.value)
        toast.success({
          msg: '门票领取成功',
          duration: 2000,
          closed: () => {
            uni.reLaunch({ url: '/pages/ticket/index' })
          },
        })
      } catch ({ data }) {
        toast.error({
          msg: data.message || '领取失败，请稍后重试',
          duration: 2000,
        })
      }
    }
  })
}

// 绑定手机后领取门票
const onRealtimePhone = async ({ detail }) => {
  if (detail.errMsg === 'getPhoneNumber:ok') {
    try {
      toast.loading({ msg: '正在领取门票，请稍候', duration: 0 })
      await bindPhone(detail.code)
      await userStore.getUserInfo()
      await receiveTicket(formData.value)
      toast.success({
        msg: '门票领取成功',
        duration: 2000,
        closed: () => {
          uni.reLaunch({ url: '/pages/ticket/index' })
        },
      })
    } catch ({ data }) {
      toast.error({
        msg: data.message || '领取失败，请稍后重试',
        duration: 2000,
      })
    }
  } else {
    // 用户拒绝授权
    uni.showToast({
      title: '请授权以获取您的手机号',
      icon: 'none',
    })
  }
}

onLoad(async (options) => {
  let timestamp = null
  if (options.scene && options.scene.includes('-')) {
    // 分割
    const parts = options.scene.split('-')
    formData.value.promoter_id = Number(parts[0])
    timestamp = Number(parts[1])
  } else {
    timestamp = Number(decodeURIComponent(options.scene))
  }
  const now = Date.now()
  // 判断时间戳单位（秒/毫秒），假设小于1e12为秒，否则为毫秒
  const ts = timestamp < 1e12 ? timestamp * 1000 : timestamp
  if (now - ts > EXPIRE_SECONDS * 1000) {
    isExpired.value = true
    uni.showToast({
      title: '二维码已过期，请重新扫码领取',
      icon: 'none',
    })
  }
})

onShow(async () => {
  try {
    uni.showLoading({ title: '正在加载，请稍候' })
    await userStore.getUserInfo()
  } finally {
    uni.hideLoading()
  }
})
</script>

<template>
  <view class="h-screen overflow-hidden">
    <!-- #ifdef MP-WEIXIN -->
    <xc-privacy-popup></xc-privacy-popup>
    <!-- #endif -->

    <!-- 扫码进入小程序 -->
    <template v-if="scene === 1047">
      <!-- 超过时间 -->
      <wd-status-tip image="network" tip="二维码已失效，请重新扫码" v-if="isExpired" />

      <!-- 正常可以领取门票 -->
      <template v-else>
        <view class="m-4 flex flex-col gap-4">
          <view class="rounded-xl overflow-hidden bg-white text-gray-500">
            <wd-cell-group title="观演人信息">
              <wd-form ref="formRef" :model="formData">
                <view class="pb-2 text-size-sm">
                  <wd-input
                    v-model="formData.realname"
                    label="姓名"
                    label-width="5.5em"
                    size="large"
                    prop="realname"
                    placeholder="请输入姓名"
                    :rules="[{ required: true, message: '请输入姓名' }]"
                  />
                  <wd-input
                    v-model="formData.idcard"
                    label="身份证号"
                    label-width="5.5em"
                    type="idcard"
                    size="large"
                    prop="idcard"
                    placeholder="请输入身份证号"
                    :rules="[{ required: true, message: '请输入身份证号' }]"
                  />
                </view>
              </wd-form>
            </wd-cell-group>
          </view>
          <view class="rounded-xl overflow-hidden bg-white text-gray-500">
            <wd-cell-group title="温馨提示">
              <view class="px-4 pb-2 text-size-sm">
                <view class="mb-2">
                  根据相关法律法规要求，门票需实名制。我们会严格保护您的姓名和身份证信息，仅用于出票、入场核验及应急调查。为确保信息真实有效，我们可能会通过权威渠道进行验证。
                </view>
              </view>
            </wd-cell-group>
          </view>
          <view class="rounded-xl overflow-hidden">
            <template v-if="canSubmit">
              <template v-if="userInfo.mobile">
                <!-- 已经绑定过手机的用户 -->
                <button type="primary" @click="onSubmit">领取门票</button>
              </template>
              <template v-else>
                <!-- 未绑定过手机的用户 -->
                <button type="primary" open-type="getPhoneNumber" @getphonenumber="onRealtimePhone">领取门票</button>
              </template>
            </template>
            <template v-else>
              <button type="primary" disabled>领取门票</button>
            </template>
          </view>
        </view>
        <view class="center">
          <text class="text-gray-300">{{ scene }}</text>
        </view>
      </template>
    </template>
    <template v-else>
      <!-- 不是扫码进入小程序 -->
      <wd-status-tip image="network" tip="请扫码进入小程序" />
    </template>
  </view>
</template>
