<route lang="json5">
{
  needLogin: true,
  style: {
    navigationBarTitleText: '活动中心',
  },
}
</route>

<template>
  <view class="h-screen relative center">
    <view v-if="userStore.isLogined" class="pb-30">
      <wd-status-tip v-if="!isSponsor" image="network" tip="该页面暂时无法访问" />
      <template v-else>
        <wd-img :src="qrCodeUrl" :width="200" :height="200" @click="refreshQrCode" />
        <view class="text-amber mt-4">动态小程序码，请勿截屏使用</view>
      </template>
    </view>
    <wd-gap safe-area-bottom height="0"></wd-gap>
  </view>
</template>

<script lang="ts" setup>
import { checkSponsor } from '@/api/user'
import { useUserStore } from '@/store'
import { getEnvBaseUrl } from '@/utils'

const userStore = useUserStore()

const baseUrl = getEnvBaseUrl()
const uniacid = import.meta.env.VITE_WX_UNIACID
const promoterId = ref(0)
const timestamp = ref(Date.now())
const qrCodeUrl = computed(
  () =>
    `${baseUrl}/app/index.php?i=${uniacid}&c=entry&a=wxapp&m=basketball&do=gift&op=qrcode&promoter_id=${promoterId.value}&timestamp=${timestamp.value}`,
)

const isSponsor = ref(false)
const timer = ref<number | null>(null)
const countdown = ref(10)

const refreshQrCode = () => {
  timestamp.value = Date.now()
}

onMounted(() => {
  countdown.value = 10
  timer.value = setInterval(() => {
    if (countdown.value > 1) {
      countdown.value--
    } else {
      countdown.value = 10
      timestamp.value = Date.now()
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
})

onShow(async () => {
  if (!userStore.isLogined) {
    uni.reLaunch({ url: '/pages/login/index' })
  }

  const { data } = await checkSponsor()
  isSponsor.value = data.is_sponsor
  promoterId.value = data?.promoter?.id || 0
  if (!data.is_sponsor) {
    uni.showToast({ title: '没有权限', icon: 'error', duration: 2000 })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/ucenter/index' })
    }, 2000)
  }
})
</script>
