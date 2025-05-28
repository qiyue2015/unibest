<route lang="json5">
{
  needLogin: true,
  style: {
    disableScroll: true,
    navigationBarTitleText: '门票详情',
    navigationBarBackgroundColor: '#f5f5f5',
    backgroundColor: '#f5f5f5',
  },
}
</route>

<template>
  <view v-if="ticket" class="h-screen overflow-hidden">
    <view class="rounded-xl overflow-hidden m-4 p-4 text-center bg-white flex flex-col rounded">
      <view class="text-left text-gray-300 text-size-xs mb-4 flex items-center justify-between">
        <text>票号 {{ ticket.id }}</text>
        <text class="cursor-pointer text-blue-500" @click="goOrderDetail">订单详情</text>
      </view>
      <!-- 二维码位置 -->
      <view class="py-4">
        <view class="w-36 h-36 m-auto rounded-lg bg-cover">
          <wd-img v-if="qrcodeUrl" lazy-load width="100%" height="100%" :src="qrcodeUrl" />
        </view>
        <view class="text-gray-500 text-size-sm mt-2">二维码实时更新 请勿截屏使用</view>
      </view>

      <!-- 票品信息 -->
      <view class="bg-gray-100 rounded-lg mt-4">
        <view class="flex items-center justify-between mb-2 mx-4 pt-4">
          <text>{{ ticket.schedule.date }}</text>
          <ticket-status :status="ticket.status" />
        </view>
        <view class="text-gray text-size-sm grid grid-cols-2 gap-8 text-left px-4">
          <view v-for="item in ticket.schedule.venues" :key="item.id">
            <view>{{ item.time }}</view>
            <view class="whitespace-nowrap">{{ item.team }}</view>
          </view>
        </view>
        <wd-divider dashed />
        <view class="flex justify-between font-size-sm text-gray pb-4 px-4">
          <text>{{ ticket.realname }}</text>
          <text>{{ ticket.mobile }}</text>
          <text>{{ ticket.idcard }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { getTicketInfo } from '@/api/order'
import TicketStatus from '@/components/TicketStatus.vue'

const ticketId = ref<string>('')
const ticket = ref<any>(null)
const qrcodeLoading = ref<boolean>(true)
const qrcodeUrl = ref<string>('')

const fetchData = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const { data } = await getTicketInfo(ticketId.value)
    ticket.value = data
    // 每次获取后，更新时间戳
    if (ticket.value && ticket.value.qrcode) {
      qrcodeUrl.value = ticket.value.qrcode + '&t=' + Date.now()
    }
  } finally {
    uni.hideLoading()
  }
}

const goOrderDetail = () => {
  if (ticket.value && ticket.value.order_id) {
    uni.navigateTo({ url: `/pages/order/detail?id=${ticket.value.order_id}` })
  }
}

let refreshTimer: any = null

watch(
  () => ticket.value?.status,
  (status) => {
    if (status === 1) {
      // 启动定时刷新二维码
      refreshTimer = setInterval(() => {
        if (ticket.value && ticket.value.qrcode) {
          qrcodeUrl.value = ticket.value.qrcode + '&t=' + Date.now()
        }
      }, 10000)
    } else {
      if (refreshTimer) {
        clearInterval(refreshTimer)
        refreshTimer = null
      }
    }
  },
  { immediate: true },
)

onLoad(async (options) => {
  if (options.id) {
    ticketId.value = options.id
  }

  uni.$on('ticketData', async (data) => {
    ticket.value = data
  })
})

onShow(async () => {
  if (ticketId.value) {
    await fetchData()
  } else {
    uni.navigateBack()
  }
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})

onUnload(() => {
  uni.$off('ticketData')
})
</script>
