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
        <view class="m-auto rounded-lg" @click="refreshQrcode">
          <wd-img v-if="qrcodeUrl" lazy-load :width="160" :height="160" :src="qrcodeUrl" />
        </view>
        <view class="text-gray-500 text-size-sm mt-2">二维码实时更新 请勿截屏使用</view>
      </view>

      <!-- 票品信息 -->
      <view class="bg-gray-50 rounded-lg mt-4">
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

      <!-- WebSocket 调试信息演示 -->
      <view class="mt-4 p-2 bg-gray-50 rounded text-left">
        <view class="mb-1 text-size-xs text-gray-400">
          通信模式：
          <text :style="{ color: wsFallbackToPolling ? 'orange' : 'green' }">
            {{ wsFallbackToPolling ? 'HTTP 轮询' : 'WebSocket' }}
          </text>
        </view>
        <view v-if="!wsFallbackToPolling" class="mb-1 text-size-xs text-gray-400">
          WebSocket 状态：
          <text :style="{ color: socketConnected ? 'green' : 'red' }">
            {{ socketConnected ? '已连接' : '未连接' }}
          </text>
          <text class="ml-2">重连次数: {{ wsReconnectCount }}</text>
        </view>
        <view class="mb-1 text-size-xs text-gray-400">
          收到消息：
          <text class="text-gray-800">{{ wsMsg }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { getTicketInfo } from '@/api/order'
import TicketStatus from '@/components/TicketStatus.vue'
import { useWebSocket } from '@/hooks/useWebSocket'

const ticketId = ref<string>('')
const ticket = ref<any>(null)
const qrcodeUrl = ref<string>('')

const wsMsg = ref('')
const wsReconnectCount = ref(0)
const wsFallbackToPolling = ref(false)
let pollingTimer: ReturnType<typeof setInterval> | null = null
let refreshTimer: ReturnType<typeof setInterval> | null = null

// WebSocket 相关
const { socketConnect, socketClose, socketConnected } = useWebSocket({
  onMessage: (msg) => {
    if (msg.type === 'ticket_notify') {
      // 如果票已核销，关闭 WebSocket 连接
      if (msg.payload.status === 2) {
        socketClose()
        if (ticket.value) {
          ticket.value.status = 2
        }
      }
    }
    wsMsg.value = msg.payload
  },
  onError() {
    wsReconnectCount.value++
    if (wsReconnectCount.value > 5) {
      wsFallbackToPolling.value = true
      startPolling()
    }
  },
})

// 二维码刷新
const refreshQrcode = () => {
  if (ticket.value && ticket.value.qrcode) {
    qrcodeUrl.value = ticket.value.qrcode + '&t=' + Date.now()
  }
}

// 跳转订单详情
const goOrderDetail = () => {
  if (ticket.value && ticket.value.order_id) {
    uni.navigateTo({ url: `/pages/order/detail?id=${ticket.value.order_id}` })
  }
}

// 统一清理所有副作用
function cleanupAll() {
  stopRefreshQrcode()
  stopPolling()
  socketClose()
  uni.$off('ticketData')
}

// 启动二维码定时刷新，防止重复启动
function startRefreshQrcode() {
  stopRefreshQrcode()
  refreshQrcode()
  refreshTimer = setInterval(refreshQrcode, 10000)
}

function stopRefreshQrcode() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 轮询票据状态
function startPolling() {
  stopPolling()
  pollingTimer = setInterval(async () => {
    if (ticketId.value) {
      const { data } = await getTicketInfo(ticketId.value)
      ticket.value = data
      wsMsg.value = '[HTTP] ' + JSON.stringify(data)
      if (data.status === 2) {
        stopPolling()
      }
    }
  }, 3000)
}

function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

// 获取票据详情，仅做数据获取和赋值，不做副作用管理
const fetchData = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const { data } = await getTicketInfo(ticketId.value)
    ticket.value = data
    refreshQrcode()
  } finally {
    uni.hideLoading()
  }
}

// 监听票据状态变化，统一管理通信方式和二维码刷新
watch(
  () => ticket.value?.status,
  async (status) => {
    // 先清理所有副作用
    stopPolling()
    stopRefreshQrcode()
    if (status === 1) {
      if (!wsFallbackToPolling.value) {
        wsReconnectCount.value = 0
        await socketConnect({
          module: 'basketball',
          query: { ticket_id: ticketId.value },
        })
      } else {
        startPolling()
      }
      startRefreshQrcode()
    }
  },
  { immediate: true },
)

onLoad((options) => {
  if (options.id) {
    ticketId.value = options.id
  }
  uni.$on('ticketData', (data) => {
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

onUnmounted(cleanupAll)
onUnload(cleanupAll)
</script>
