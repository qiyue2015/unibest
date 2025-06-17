<route lang="json5" type="home">
{
  style: {
    disableScroll: true,
    navigationBarTitleText: '赛程安排',
  },
}
</route>

<template>
  <view class="main">
    <wd-tabs v-model="active" custom-class="m-tabs" slidable="always" animated auto-line-width swipeable>
      <block v-for="item in list" :key="item.id">
        <wd-tab :title="item.title">
          <block v-for="row in item.items" :key="row.id">
            <view class="mx-4 m-3 rounded-xl overflow-hidden">
              <wd-cell-group :title="row.date" border>
                <block v-for="(venue, index) in row.venues" :key="index">
                  <wd-cell :title="venue.team" :label="venue.venue" :value="venue.time" size="large" />
                </block>
                <wd-cell size="large" center :is-link="row.sale_status === 1" @click="onOrder(row)">
                  <template #title>
                    <text :class="{ 'text-amber font-bold': row.sale_status === 1, 'text-gray': row.sale_status !== 1 }">
                      ¥ {{ row.price }}
                    </text>
                  </template>
                  <text v-if="row.sale_status === 0" class="text-gray">{{ row.start_sale_time }} 开售</text>
                  <text v-if="row.sale_status === 1" class="text-amber font-bold">立即购买</text>
                  <text v-if="row.sale_status === 2" class="text-gray">已停售</text>
                </wd-cell>
              </wd-cell-group>
            </view>
          </block>
          <wd-status-tip v-if="isEmpty" image="content" tip="暂无相关赛程" />
          <wd-gap safe-area-bottom height="0" />
        </wd-tab>
      </block>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { getScheduleList } from '@/api/app'
import { useUserStore } from '@/store'

defineOptions({
  name: 'Home',
  options: {
    styleIsolation: 'shared',
  },
})

const userStore = useUserStore()

const active = ref(0)
const isEmpty = ref(false)

// 获取数据
const list = ref<any[]>([])
const fetchData = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const { data } = await getScheduleList()
    isEmpty.value = data.length === 0
    list.value = data
    nextTick(() => {
      const defaultActive = data.findIndex((item: any) => item.active)
      active.value = defaultActive
    })
  } finally {
    uni.hideLoading()
  }
}

const onOrder = (row: any) => {
  if (row.sale_status === 1) {
    uni.navigateTo({ url: `/pages/index/confirm?schedule_id=${row.id}` })
  }
}

onShow(async () => {
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
