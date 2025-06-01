<route lang="json5">
{
  style: {
    disableScroll: true,
    navigationBarTitleText: '我的票夹',
  },
}
</route>

<template>
  <view class="h-screen overflow-hidden">
    <wd-tabs v-model="query.status" custom-class="m-tabs" auto-line-width swipeable @change="onChange">
      <block v-for="tab in tabs" :key="tab">
        <wd-tab :title="tab">
          <wd-status-tip v-if="isEmpty" image="content" tip="暂无相关门票" />
          <block v-for="row in list" :key="row.id">
            <view class="mx-4 m-3 rounded-xl overflow-hidden" @click="goDetail(row)">
              <wd-cell-group use-slot>
                <template #title>{{ row.schedule.date }}</template>
                <template #value><ticket-status :status="row.status" /></template>
                <view class="text-gray text-size-sm px-4 grid grid-cols-2 gap-8">
                  <view v-for="item in row.schedule.venues" :key="item.id">
                    <view>{{ item.time }}</view>
                    <view class="whitespace-nowrap">{{ item.team }}</view>
                    <view class="whitespace-nowrap">{{ item.venue }}</view>
                  </view>
                </view>
                <wd-divider dashed />
                <view class="flex justify-between px-4 pb-4 font-size-sm text-gray">
                  <text>{{ row.realname }}</text>
                  <text>{{ row.mobile }}</text>
                  <text>{{ row.idcard }}</text>
                </view>
              </wd-cell-group>
            </view>
          </block>
        </wd-tab>
      </block>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { getMyTicket } from '@/api/order'
import TicketStatus from '@/components/TicketStatus.vue'

const tabs = ['可使用', '已使用', '已过期']

const isEmpty = ref(false)
const query = reactive({ status: 0 })
const list = ref<any[]>([])

const fetchData = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const { data } = await getMyTicket(query)
    isEmpty.value = data.length === 0
    list.value = data
  } catch (error) {
    isEmpty.value = true
    console.error('获取门票数据失败:', error)
  } finally {
    uni.hideLoading()
  }
}

const onChange = ({ index }) => {
  query.status = index
  list.value = []
  fetchData()
}

const goDetail = (item: any) => {
  uni.navigateTo({
    url: `/pages/ticket/detail?id=${item.id}`,
    success: () => {
      uni.$emit('ticketData', item)
    },
  })
}

onShow(async () => {
  await fetchData()
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
