<route lang="json5">
{
  needLogin: true,
  style: {
    disableScroll: true,
    navigationBarTitleText: '订单例表',
  },
}
</route>

<template>
  <view class="main">
    <wd-tabs v-model="active" custom-class="m-tabs" auto-line-width swipeable @change="onChange">
      <wd-tab v-for="item in tabs" :key="item.value" :title="item.title">
        <scroll-view scroll-y @scrolltolower="fetchData">
          <order-card v-for="row in list" :key="row.id" :order="row" />
          <wd-status-tip v-if="isEmpty" image="content" tip="暂无相关订单" />
          <wd-gap safe-area-bottom height="0" />
        </scroll-view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { LoadMoreState } from 'wot-design-uni/components/wd-loadmore/types'
import { getOrderList } from '@/api/order'
import OrderCard from '@/components/OrderCard.vue'

const active = ref(1)
const tabs = reactive([
  { title: '全部', value: 0 },
  { title: '待支付', value: 1 },
  { title: '待使用', value: 2 },
  { title: '已完成', value: 3 },
  { title: '已关闭', value: 4 },
])

const queryParams = reactive({ status: 1, current: 1, pageSize: 10 })
const list = ref<any[]>([])
const state = ref<LoadMoreState>('loading')

const fetchData = async () => {
  try {
    uni.showLoading({ title: '加载中…', mask: true })
    const { data } = await getOrderList(queryParams)
    queryParams.current += 1
    list.value = [...list.value, ...data]
    uni.hideLoading()
  } catch {
    state.value = 'error'
  }
}

const onChange = ({ index }) => {
  uni.redirectTo({
    url: `/pages/order/index?status=${tabs[index].value}`,
  })
}

// 计算是否为空
const isEmpty = computed(() => {
  return list.value.length === 0 && state.value === 'finished'
})

onLoad((options) => {
  active.value = options.status ? Number(options.status) : 1
  queryParams.status = active.value
  queryParams.current = 1
  list.value = []
})

onShow(() => {
  queryParams.current = 1
  list.value = []
  fetchData()
})
</script>

<style lang="scss" scoped>
:deep(.wd-tabs.m-tabs) {
  background: #f5f5f5;
  .wd-tabs__nav {
    background: #f5f5f5;
  }

  .wd-tab__body {
    height: calc(100vh - 44px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
