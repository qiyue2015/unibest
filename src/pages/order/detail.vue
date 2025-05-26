<route lang="json5">
{
  needLogin: true,
  style: {
    navigationBarTitleText: '订单详情',
    navigationBarBackgroundColor: '#f5f5f5',
    backgroundColor: '#f5f5f5',
  },
}
</route>

<template>
  <view class="main">
    <!-- 支付状态 -->
    <view class="flex flex-col items-center justify-center gap-2 py-6 min-h-28">
      <!-- 0待支付 -->
      <template v-if="detail.status === 0">
        <view class="text-size-xl">待支付</view>
        <view class="text-gray text-size-sm">请在09分59秒内完成支付，超时订单将会关闭</view>
        <view class="grid grid-cols-2 gap-2 mt-3">
          <wd-button type="primary" @click="onPayOrder">立即支付</wd-button>
          <wd-button type="info" @click="onCloseOrder">取消订单</wd-button>
        </view>
      </template>
      <!-- 1付款成功 -->
      <template v-if="detail.status === 1">
        <view class="text-size-xl">付款成功</view>
        <view class="text-gray text-size-sm">订单已支付成功，电子门票可在订单详情中查看</view>
      </template>
      <!-- 3已退款 4退款失败 5未支付关闭 -->
      <template v-if="detail.status >= 3">
        <view class="text-size-xl">已关闭</view>
        <template v-if="detail.status === 5">
          <view class="text-gray text-size-sm">订单已手动取消，交易已关闭</view>
        </template>
        <template v-if="detail.status === 4">
          <view class="text-gray text-size-sm">您的退款已受理，预计1-3个工作日到账</view>
        </template>
        <template v-if="detail.status === 3">
          <view class="text-gray text-size-sm">退款成功，款项将原路退回，请注意查收。</view>
        </template>
      </template>
    </view>

    <!-- 购买票品 -->
    <view class="mx-4 mb-4 rounded-xl overflow-hidden min-h-36">
      <wd-cell-group title="购买票品" border>
        <view class="bg-gray-100 mx-4 mt-4 rounded-1 px-3 py-2">
          <view class="flex justify-between mb-2">
            <text>{{ detail.date }}</text>
            <text>x1张</text>
          </view>
          <view v-for="(venue, idx) in detail.venues" :key="idx" class="text-size-sm text-gray-500 my-2 text-justify w-full">
            {{ venue.team }} {{ venue.time }}
          </view>
        </view>
        <wd-cell title="票品总价" :value="'¥' + detail.total_amount" :border="false" />
        <wd-cell title="合计支付">
          <text class="text-rose">¥{{ detail.total_amount }}</text>
        </wd-cell>
      </wd-cell-group>
    </view>

    <!-- 订单详情 -->
    <view class="mx-4 mb-4 rounded-xl overflow-hidden min-h-36">
      <wd-cell-group custom-class="order-detail" title="订单信息" border>
        <wd-cell title="订单编号">
          <view class="flex justify-between">
            <text>{{ detail.tid }}</text>
            <text class="text-rose">复制</text>
          </view>
        </wd-cell>
        <wd-cell title="下单时间" :value="detail.created_at" />
        <wd-cell title="支付时间" :value="detail.pay_at || '-'" />
        <wd-cell title="联&nbsp;系&nbsp;人" :value="detail.contact_name || '-'" />
        <wd-cell title="联系手机" :value="detail.mobile" />
      </wd-cell-group>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import { closeOrder, getOrderInfo } from '@/api/order'
import { payOrder } from '@/api/app'

const toast = useToast()
const orderId = ref<string | null>(null)
const detail = reactive({
  tid: undefined,
  contact_name: '',
  mobile: '',
  status: 0,
  total_amount: '0.00',
  date: '',
  venues: [],
  pay_at: '',
  refund_at: '',
  created_at: '',
})

const fetchData = async () => {
  try {
    toast.loading({ msg: '加载中...', direction: 'vertical', duration: 0 })
    const { data } = await getOrderInfo(orderId.value)
    Object.assign(detail, data)
    toast.close()
  } catch {
    toast.error({ msg: '订单不存在', duration: 1000 })
    uni.redirectTo({ url: '/pages/order/index' })
  }
}

// 关闭订单
const onCloseOrder = async () => {
  try {
    toast.loading({ msg: '正在关闭订单...', direction: 'vertical', duration: 0 })
    await closeOrder(detail.tid)
    toast.success({ msg: '订单已关闭', duration: 1000 })
    fetchData()
  } catch (error) {
    // toast.error({ msg: '关闭订单失败，请稍后再试' })
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

onLoad((options) => {
  if (!options?.id) {
    toast.error({
      msg: '订单ID不能为空',
      duration: 1000,
      closed() {
        uni.navigateBack({ delta: 1 })
      },
    })
    return
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
