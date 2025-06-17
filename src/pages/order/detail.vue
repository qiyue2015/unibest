<route lang="json5">
{
  needLogin: true,
  style: {
    navigationBarTitleText: '订单详情',
  },
}
</route>

<template>
  <view class="main">
    <!-- 支付状态 -->
    <view class="flex flex-col items-center justify-center gap-2 py-4 min-h-20">
      <!-- 0待支付 -->
      <template v-if="detail.status === 0">
        <view class="text-size-xl">等待付款</view>
        <view class="text-gray text-size-sm">{{ countdownText }}</view>
        <view class="grid grid-cols-2 gap-2 mt-3">
          <wd-button type="primary" @click="onPayOrder">立即支付</wd-button>
          <wd-button type="info" @click="onCloseOrder">取消订单</wd-button>
        </view>
      </template>
      <!-- 1付款成功 -->
      <template v-if="detail.status === 1">
        <view class="text-size-xl">购票成功</view>
        <view v-if="detail.paid_amount === '0.00'" class="text-gray text-size-sm">您已成功获得门票，请按时前往观赛</view>
        <view v-else class="text-gray text-size-sm">您已成功购买门票，请按时前往观赛</view>
      </template>
      <!-- 2已完成 -->
      <template v-if="detail.status === 2">
        <view class="text-size-xl">已使用</view>
        <view class="text-gray text-size-sm">订单已使用，感谢您的支持！</view>
      </template>
      <!-- 3已关闭 -->
      <template v-if="detail.status === 3">
        <view class="text-size-xl">已关闭</view>
        <template v-if="detail.cancel_reason === 'timeout_cancel'">
          <view class="text-gray text-size-sm">订单未及时付款，交易已关闭</view>
        </template>
        <template v-else>
          <view class="text-gray text-size-sm">订单已手动取消，交易已关闭</view>
        </template>
      </template>
      <!-- 4申请退款中 5已退款 6退款失败 -->
      <template v-if="detail.status === 4 || detail.status === 6">
        <view class="text-size-xl">退款处理中</view>
        <view class="text-gray text-size-sm">退款申请已提交，预计1-3个工作日完成</view>
      </template>
      <template v-if="detail.status === 5">
        <view class="text-size-xl">退款成功</view>
        <view class="text-gray text-size-sm">款项将原路退回，请注意查收。</view>
      </template>
    </view>

    <!-- 门票信息 -->
    <view class="mx-4 mb-4 rounded-xl overflow-hidden min-h-36">
      <wd-cell-group title="门票信息" border>
        <template #value>
          <text
            v-if="detail.status === 1 && detail.paid_amount !== '0.00'"
            class="text-rose text-size-xs cursor-pointer"
            @click="onRefundOrder"
          >
            申请退款
          </text>
        </template>
        <view class="bg-gray-100 mx-4 mt-4 rounded-1 px-3 py-2">
          <view class="flex justify-between mb-2">
            <text>{{ detail.date }}</text>
            <text>x{{ detail.ticket_count }}张</text>
          </view>
          <view v-for="(venue, idx) in detail.venues" :key="idx" class="text-size-sm text-gray-500 my-2 text-justify w-full">
            <view>{{ venue.team }} {{ venue.time }}</view>
            <view>{{ venue.venue }}</view>
          </view>
        </view>
        <wd-cell title="票品总价" :value="'¥' + detail.total_amount" :border="false" />
        <wd-cell title="合计支付">
          <text class="text-rose">¥{{ detail.paid_amount }}</text>
        </wd-cell>
      </wd-cell-group>
    </view>
    <view v-if="detail.status === 1 || detail.status === 2" class="m-4">
      <wd-notice-bar
        prefix="warn-bold"
        type="warning"
        text="温馨提示：开赛后 20 分钟停止检票，请及时入场"
        :scrollable="false"
      />
    </view>
    <!-- 购买票品 -->
    <view v-if="detail.status === 1 || detail.status === 2" class="mx-4 mb-4 rounded-xl overflow-hidden min-h-12">
      <wd-cell-group title="持票人信息" border>
        <template v-for="ticket in tickets" :key="ticket.id">
          <wd-cell :label="ticket.idcard" center is-link @click="goTicket(ticket)">
            <template #title>
              <view class="flex items-center">
                <text class="mr-2">{{ ticket.realname }}</text>
                <wd-tag v-if="ticket.type === 'gift'" type="primary" mark>赠票</wd-tag>
              </view>
            </template>
            <ticket-status :status="ticket.status" />
          </wd-cell>
        </template>
      </wd-cell-group>
    </view>

    <!-- 订单详情 -->
    <view class="mx-4 mb-4 rounded-xl overflow-hidden min-h-36">
      <wd-cell-group custom-class="order-detail" title="订单信息" border>
        <wd-cell title="订单编号">
          <view class="flex justify-between">
            <text>{{ detail.tid }}</text>
            <text class="text-rose" @click="onCopyOrderId">复制</text>
          </view>
        </wd-cell>
        <wd-cell title="下单时间" :value="detail.created_at" />
        <wd-cell title="支付时间" :value="detail.pay_at || '-'" />
        <wd-cell title="联&nbsp;系&nbsp;人" :value="detail.contact_name || '-'" />
        <wd-cell title="联系手机" :value="detail.mobile" />
      </wd-cell-group>
    </view>

    <wd-gap safe-area-bottom height="0" />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import { closeOrder, getOrderInfo, getOrderTickets } from '@/api/order'
import { payOrder } from '@/api/order'
import TicketStatus from '@/components/TicketStatus.vue'

const toast = useToast()
const orderId = ref<string | null>(null)
const detail = reactive({
  id: undefined,
  tid: undefined,
  contact_name: '',
  mobile: '',
  status: undefined,
  cancel_reason: '',
  total_amount: '0.00',
  paid_amount: '0.00',
  ticket_count: 0,
  date: '',
  venues: [],
  pay_at: '',
  refund_at: '',
  created_at: '',
})

const ticketLoading = ref(false)
const tickets = ref<any[]>([])

let countdownTimer: number | null = null
const PAY_TIMEOUT = 10 * 60 // 10分钟，单位秒
const countdownText = ref('请在09分59秒内完成支付，超时订单将会关闭')

function updateCountdown() {
  if (!detail.created_at) {
    countdownText.value = '请在09分59秒内完成支付，超时订单将会关闭'
    return
  }
  const created = new Date(detail.created_at.replace(/-/g, '/')).getTime()
  const now = Date.now()
  const expire = created + PAY_TIMEOUT * 1000
  let left = Math.floor((expire - now) / 1000)
  if (left <= 0) {
    countdownText.value = '订单已超时，请刷新页面查看最新状态'
    stopCountdown() // 只停止倒计时，不再自动fetchData，避免死循环
    return
  }
  const min = String(Math.floor(left / 60)).padStart(2, '0')
  const sec = String(left % 60).padStart(2, '0')
  countdownText.value = `请在${min}分${sec}秒内完成支付，超时订单将会关闭`
}

function startCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

const fetchData = async () => {
  try {
    toast.loading({ msg: '订单加载中...', direction: 'vertical', duration: 0 })
    const { data } = await getOrderInfo(orderId.value)
    Object.assign(detail, data)

    // 获取门票信息
    await fetchTickets()

    if (detail.status === 0) {
      // 判断是否已超时，超时不再启动倒计时
      const created = new Date(detail.created_at.replace(/-/g, '/')).getTime()
      const now = Date.now()
      const expire = created + PAY_TIMEOUT * 1000
      let left = Math.floor((expire - now) / 1000)
      if (left > 0) {
        startCountdown()
      } else {
        stopCountdown()
        countdownText.value = '订单已超时，请刷新页面查看最新状态'
      }
    } else {
      stopCountdown()
    }

    toast.close()
  } catch {
    toast.error({ msg: '订单不存在', duration: 1000 })
    uni.redirectTo({ url: '/pages/order/index' })
  }
}

const fetchTickets = async () => {
  if (!detail.id || detail?.status === 0) return
  ticketLoading.value = true
  try {
    const { data } = await getOrderTickets(detail.id)
    tickets.value = data || []
  } finally {
    ticketLoading.value = false
  }
}

// 关闭订单
const onCloseOrder = async () => {
  try {
    toast.loading({ msg: '正在关闭订单...', direction: 'vertical', duration: 0 })
    await closeOrder(detail.tid)
    await fetchData()
    toast.success({ msg: '订单已关闭', duration: 1000 })
  } catch (error) {
    toast.error({ msg: error.message })
  }
}

// 支付失败/取消支付返回上一页
const onFail = (message: string) => {
  toast.error({
    msg: message,
    duration: 2000,
  })
}

// 支付订单
const onPayOrder = async () => {
  try {
    const { data } = await payOrder(detail.tid)
    wx.requestPayment({
      timeStamp: data.timeStamp,
      nonceStr: data.nonceStr,
      package: data.package,
      signType: data.signType,
      paySign: data.paySign,
      success() {
        toast.success({ msg: '支付成功', duration: 1000 })
        fetchData()
      },
      fail() {
        onFail('取消支付')
      },
    })
  } catch (error) {
    onFail('支付失败，请稍后再试')
  }
}

// 复制订单号
const onCopyOrderId = () => {
  if (detail.tid) {
    detail.tid && uni.setClipboardData({ data: detail.tid })
  }
}

// 申请退款
const onRefundOrder = async () => {
  if (!detail.tid) return
  uni.showModal({
    title: '提示',
    content: '确定要申请退款吗？',
    confirmText: '申请退款',
    success: async (res) => {
      if (res.confirm) {
        try {
          toast.loading({ msg: '正在申请退款...', direction: 'vertical', duration: 0 })
          await closeOrder(detail.tid)
          await fetchData()
          toast.success({ msg: '退款申请已提交', duration: 1000 })
        } catch (error) {
          // toast.error({ msg: '申请退款失败，请稍后再试' })
          toast.close()
        }
      }
    },
  })
}

const goTicket = (item: any) => {
  if (item && item.id) {
    uni.navigateTo({ url: `/pages/ticket/detail?id=${item.id}` })
  }
}

onLoad((options) => {
  if (!options?.id) {
    uni.navigateBack({ delta: 1 })
  }

  orderId.value = options.id

  // 监听来自其他页面传递的订单数据
  uni.$on('orderData', (order) => {
    orderId.value = order.id
    Object.assign(detail, order)
  })
})

onUnload(() => {
  uni.$off('orderData')
})

onShow(async () => {
  if (orderId.value) {
    await fetchData()
  }
})

onUnmounted(() => {
  stopCountdown()
})
</script>

<style lang="scss" scoped>
.main {
  @apply min-h-screen overflow-hidden;
}

:deep(.order-detail) {
  .wd-cell__left {
    flex: none;
    width: 4.5em;
  }

  .wd-cell__value {
    @apply text-left;
  }
}
</style>
