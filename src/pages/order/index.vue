<route lang="json5">
{
  needLogin: true,
  style: {
    disableScroll: true,
    navigationBarTitleText: '订单例表',
    navigationBarBackgroundColor: '#f5f5f5',
    backgroundColor: '#f5f5f5',
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
          <wd-loadmore v-if="state === 'loading'" :state="state" />
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

const active = ref(0)
const tabs = reactive([
  { title: '全部', value: 'all' },
  { title: '待支付', value: '0' },
  { title: '待使用', value: '1' },
  { title: '已完成', value: '2' },
  { title: '已关闭', value: '3' },
])

const queryParams = reactive({ status: 'all', current: 1, pageSize: 10 })
const list = ref<any[]>([])
const state = ref<LoadMoreState>('loading')

const fetchData = async () => {
  try {
    const { data } = await getOrderList(queryParams)
    queryParams.current += 1
    list.value = [...list.value, ...data]
    if (data.length === 0 || data.length < queryParams.pageSize) {
      state.value = 'finished'
    } else {
      state.value = 'loading'
    }
  } catch {
    state.value = 'error'
  }
}

const onChange = ({ index }) => {
  queryParams.status = tabs[index]?.value
  queryParams.current = 1
  state.value = 'loading'
  list.value = []
  fetchData()
}

// 计算是否为空
const isEmpty = computed(() => {
  return list.value.length === 0 && state.value === 'finished'
})

onShow(() => {
  queryParams.current = 1
  state.value = 'loading'
  list.value = []
  console.log('onShow: 重置查询参数和状态')
  fetchData()
})
</script>

<style lang="scss" scoped>
:deep(.wd-tabs.m-tabs) {
  background: #f5f5f5;
  height: 100vh;
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
