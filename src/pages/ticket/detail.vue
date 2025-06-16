<route lang="json5">
{
  needLogin: true,
  style: {
    disableScroll: true,
    navigationBarTitleText: '门票详情',
  },
}
</route>

<template>
  <view v-if="ticket" class="h-screen overflow-hidden">
    <view class="m-4">
      <wd-notice-bar type="warning" text="请注意：开赛后 20 分钟停止检票，请及时入场" :scrollable="false" />
    </view>
    <view class="rounded-xl overflow-hidden m-4 p-4 text-center bg-white flex flex-col rounded">
      <view class="text-left text-gray-300 text-size-xs mb-4 flex items-center justify-between">
        <text>票号 {{ ticket.code }}</text>
        <text class="cursor-pointer text-blue-500" @click="goOrderDetail">订单详情</text>
      </view>
      <!-- 二维码位置 -->
      <view class="py-4 relative">
        <view class="m-auto rounded-lg" @click="refreshQrcode">
          <view
            class="w-38 h-38 m-auto flex items-center justify-center text-size-xs bg-gray-100 rounded-lg"
            :class="{ 'qr-placeholder': ticket.status > 0 }"
          >
            <!-- #ifdef MP-WEIXIN -->
            <canvas v-if="ticket.status === 0" id="ticket-qrcode" type="2d" class="w-38 h-38" />
            <!-- #endif -->
            <view v-if="ticket.status === 1" class="w-30 h-30">
              <wd-img src="/static/images/verified.svg" mode="widthFix" width="100%" height="100%" />
            </view>
            <view v-if="ticket.status === 3" class="w-30 h-30">
              <wd-img src="/static/images/expire.svg" mode="widthFix" width="100%" height="100%" />
            </view>
          </view>
        </view>
        <view v-if="ticket.status === 0" class="text-size-sm mt-2 text-red-500">二维码实时更新 截屏/录屏无法使用</view>
        <view v-if="ticket.status === 1" class="text-size-sm mt-2 text-gray-400">门票已使用</view>
        <view v-if="ticket.status === 2" class="text-size-sm mt-2 text-orange-500">门票已取消</view>
        <view v-if="ticket.status === 3" class="text-size-sm mt-2 text-red-500">门票已过期</view>
      </view>

      <view v-if="ticket.status === 1" class="verification-info">
        <view class="verification-title">
          <wd-icon name="check-circle-filled" color="#28a745" size="22px"></wd-icon>
          <text>验票成功</text>
        </view>
        <view class="verification-details">
          <view>核销时间：{{ ticket.verified_at }}</view>
          <view>核销身份：人工验票</view>
        </view>
      </view>

      <!-- 门票信息 -->
      <view class="bg-gray-50 rounded-lg mt-4" @click="handleTicketInfoClick">
        <view class="flex items-center justify-between mb-2 mx-4 pt-4">
          <view class="center">
            <text class="mr-2">{{ ticket.schedule.date }}</text>
            <wd-tag v-if="ticket.type === 'gift'" type="primary" mark>赠票</wd-tag>
          </view>
          <ticket-status :status="ticket.status" />
        </view>
        <view class="text-gray text-size-sm grid grid-cols-2 gap-8 text-left px-4">
          <view v-for="item in ticket.schedule.venues" :key="item.id">
            <view>{{ item.time }}</view>
            <view class="whitespace-nowrap">{{ item.team }}</view>
            <view class="whitespace-nowrap">{{ item.venue }}</view>
          </view>
        </view>
        <wd-divider dashed />
        <view class="flex justify-between font-size-sm pb-2 px-4">
          <text>持票人信息</text>
          <text></text>
          <text></text>
        </view>
        <view class="flex justify-between font-size-sm text-gray pb-4 px-4">
          <text>{{ ticket.realname }}</text>
          <text>{{ ticket.mobile }}</text>
          <text>{{ ticket.idcard }}</text>
        </view>
      </view>

      <!-- WebSocket 调试信息演示 -->
      <view v-if="showDebugInfo" class="mt-4 p-2 bg-gray-50 rounded text-left">
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
import { useToast } from 'wot-design-uni'
import drawQrcode from 'weapp-qrcode-canvas-2d'

const toast = useToast()

const ticketId = ref<string>('')
const ticket = ref<any>(null)

const wsMsg = ref('')
const wsReconnectCount = ref(0)
const wsFallbackToPolling = ref(false)
let pollingTimer: ReturnType<typeof setInterval> | null = null
let refreshTimer: ReturnType<typeof setInterval> | null = null
let cachedCanvas: any = null

const ticketInfoClickCount = ref(0)

const showDebugInfo = computed(() => {
  return ticketInfoClickCount.value % 5 === 0 && ticketInfoClickCount.value !== 0
})

const handleTicketInfoClick = () => {
  ticketInfoClickCount.value++
}

// WebSocket 相关
const { socketConnect, socketClose, socketConnected } = useWebSocket({
  onMessage: (msg) => {
    if (msg.type === 'ticket_verify') {
      ticket.value.status = msg.payload.status
      // 如果票已核销，关闭 WebSocket 连接
      if (msg.payload.status === 1) {
        ticket.value.verified_at = msg.payload.verified_at
        toast.success('核销成功')
        socketClose()
      }
    }
    wsMsg.value = msg.payload
  },
  onError() {
    wsReconnectCount.value++
    if (wsReconnectCount.value >= 5) {
      wsFallbackToPolling.value = true
      startPolling()
    }
  },
})

// 生成二维码
const generateQrcode = () => {
  const draw = async (canvas: any) => {
    await drawQrcode({
      canvas: canvas,
      canvasId: 'ticket-qrcode',
      width: 260,
      padding: 30,
      background: '#ffffff',
      foreground: '#000000',
      text: ticket.value?.code + Date.now().toString().slice(0, 10),
    })
  }
  if (cachedCanvas) {
    draw(cachedCanvas)
    return
  }
  wx.createSelectorQuery()
    .select('#ticket-qrcode')
    .fields({ node: true, size: true })
    .exec(async (res) => {
      if (!res[0] || !res[0].node) {
        // canvas 未渲染，直接返回，不报错
        return
      }
      cachedCanvas = res[0].node
      await draw(cachedCanvas)
    })
}

// 二维码刷新
const refreshQrcode = () => {
  if (ticket.value && ticket.value.code) {
    nextTick(() => generateQrcode())
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
      if (data.status > 0) {
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
    if (status === 0) {
      if (!wsFallbackToPolling.value) {
        wsReconnectCount.value = 0
        await socketConnect({
          module: 'basketball',
          query: {
            ticket_id: ticketId.value,
          },
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

onUnmounted(() => {
  cleanupAll()
  cachedCanvas = null
})
onUnload(() => {
  cleanupAll()
  cachedCanvas = null
})
</script>

<style lang="scss" scoped>
.qr-placeholder {
  position: relative;
  background-image: linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(-45deg, #ddd 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(-45deg, transparent 75%, #ddd 75%);
  background-size: 10px 10px;
  background-position:
    0 0,
    0 5px,
    5px -5px,
    -5px 0px;
}

.verification-info {
  @apply text-left rounded-xl overflow-hidden p-4;
  background: #f8f9fa;
  border-left: 4px solid #28a745;
}

.verification-title {
  @apply flex flex-row items-center gap-2 text-size-base;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.verification-details {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}
</style>
