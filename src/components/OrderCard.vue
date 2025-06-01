<template>
  <view>
    <view class="mx-4 mt-6 mb-2 text-size-sm text-gray">{{ '订单号：' + order.tid }}</view>
    <view class="mx-4 mb-2 rounded-xl overflow-hidden" @click="goToDetail">
      <wd-cell-group :title="order.date" border>
        <template #value>
          <OrderStatus :status="order.status" />
        </template>
        <block v-for="(venue, index) in order.venues" :key="index">
          <wd-cell :title="venue.team" :label="venue.venue" :value="venue.time" size="large" center />
        </block>
        <wd-cell size="large" center is-link>
          <text class="text-size-sm text-gray mr-1">实付款</text>
          <text class="text-size-sm text-rose">¥ {{ order.total_amount }}</text>
        </wd-cell>
      </wd-cell-group>
    </view>
  </view>
</template>

<script lang="ts" setup>
import OrderStatus from '@/components/OrderStatus.vue'

const props = defineProps<{ order: any }>()

const goToDetail = () => {
  uni.navigateTo({
    url: `/pages/order/detail?id=${props.order.id}`,
    success: () => {
      // 将订单信息传递给详情页
      uni.$emit('orderData', props.order)
    },
  })
}
</script>
