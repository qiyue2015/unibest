<route lang="json5">
{
  style: {
    disableScroll: true,
    navigationBarTitleText: '我的票夹',
    navigationBarBackgroundColor: '#f5f5f5',
    backgroundColor: '#f5f5f5',
  },
}
</route>

<template>
  <view class="h-screen overflow-hidden">
    <wd-tabs v-model="query.status" custom-class="m-tabs" auto-line-width swipeable @change="onChange">
      <block v-for="tab in tabs" :key="tab">
        <wd-tab :title="tab">
          <block v-for="row in list" :key="row.id">
            <view class="mx-4 m-3 rounded-xl overflow-hidden">
              <wd-cell-group :title="row.realname">
                <template #title>{{ row.realname }} {{ row.idcard }}</template>
                <template #value><ticket-status :status="row.status" /></template>
                <view class="grid grid-cols-3 text-gray text-size-sm px-4 pb-4 min-h-10 items-center">
                  <block v-for="item in row.schedule.venues" :key="item.id">
                    <view>{{ row.schedule.date }}</view>
                    <view>{{ item.time }}</view>
                    <view class="whitespace-nowrap">{{ item.team }}</view>
                  </block>
                </view>
              </wd-cell-group>
            </view>
          </block>
        </wd-tab>
      </block>
    </wd-tabs>
    <wd-status-tip v-if="isEmpty" image="content" tip="暂无可用门票" />
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
  } finally {
    uni.hideLoading()
  }
}

const onChange = ({ index }) => {
  query.status = index
  list.value = []
  fetchData()
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
