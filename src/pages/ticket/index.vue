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
    <template v-if="isLogin">
      <wd-tabs v-model="current" custom-class="m-tabs" auto-line-width swipeable @change="onChange">
        <block v-for="tab in tabs" :key="tab">
          <wd-tab :title="tab.title" :value="tab.value">
            <wd-status-tip v-if="isEmpty" image="content" tip="暂无相关门票" />
            <block v-for="row in list" :key="row.id">
              <view class="mx-4 m-3 rounded-xl overflow-hidden" @click="goDetail(row)">
                <wd-cell-group use-slot>
                  <template #title>
                    <view class="center">
                      <text class="mr-2">{{ row.schedule.date }}</text>
                      <wd-tag v-if="row.type === 'gift'" type="primary" mark>赠票</wd-tag>
                    </view>
                  </template>
                  <template #value>
                    <ticket-status :status="row.status" />
                  </template>
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
    </template>
    <template v-else>
      <wd-status-tip image="search" tip="登录账号后查看门票" />
      <view class="flex justify-center mt-4">
        <view class="w-32">
          <wd-button type="primary" @click="goLogin" block>登录</wd-button>
        </view>
      </view>
    </template>
  </view>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { getMyTicket } from '@/api/order'
import TicketStatus from '@/components/TicketStatus.vue'

const userStore = useUserStore()

// 计算是否登录
const isLogin = computed(() => userStore.sessionid)

const current = ref(0)
const tabs = reactive([
  { title: '可使用', value: 0 },
  { title: '已使用', value: 1 },
  { title: '已过期', value: 3 },
])

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
  query.status = tabs[index].value
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

// 去登录
const goLogin = () => {
  uni.navigateTo({
    url: '/pages/login/index?redirectUrl=' + encodeURIComponent('/pages/ticket/index'),
  })
}

onShow(async () => {
  if (isLogin.value) {
    list.value = []
    await fetchData()
  }
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
