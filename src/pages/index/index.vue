<route lang="json5" type="home">
{
  style: {
    disableScroll: true,
    navigationBarTitleText: '赛程',
    navigationBarBackgroundColor: '#f5f5f5',
    backgroundColor: '#f5f5f5',
  },
}
</route>

<template>
  <view class="main">
    <wd-tabs v-model="active" custom-class="m-tabs" slidable="always" animated auto-line-width swipeable>
      <block v-for="item in list" :key="item">
        <wd-tab :title="item.title">
          <block v-for="row in item.items" :key="row.id">
            <view class="mx-4 m-3 rounded-xl overflow-hidden">
              <wd-cell-group :title="row.date" border>
                <block v-for="(venue, index) in row.venues" :key="index">
                  <wd-cell :title="venue.team" :value="venue.time" size="large" center />
                </block>
                <wd-cell size="large" center :is-link="row.sale_status === 1" @click="onOrder(row)">
                  <template #title>
                    <text class="text-amber">¥ {{ row.price }}</text>
                  </template>
                  <text v-if="row.sale_status !== 1">售罄</text>
                </wd-cell>
              </wd-cell-group>
            </view>
          </block>
        </wd-tab>
      </block>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { getScheduleList } from '@/api/app'
import { useAppStore, useUserStore } from '@/store'

defineOptions({
  name: 'Home',
  options: {
    styleIsolation: 'shared',
  },
})

const appStore = useAppStore()
const userStore = useUserStore()

const active = ref(0)
const value = ref<number>(0)
const handleConfirm = (date: Date) => {
  console.log('选中的日期:', date)
}

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function formatDate(date: Date) {
  return `${date.getMonth() + 1}.${date.getDate()}`
}

function getWeekList(startDate: Date) {
  const list = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    list.push({
      date: formatDate(d),
      weekday: weekDays[d.getDay()],
    })
  }
  return list
}

const today = new Date() // 可替换为指定日期
const weekList = ref(getWeekList(today))

// 获取数据
const list = ref<any[]>([])
const fetchData = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const { data } = await getScheduleList()
    list.value = data
  } finally {
    uni.hideLoading()
  }
}

const onOrder = (row: any) => {
  if (row.sale_status !== 1) return
  uni.navigateTo({ url: `/pages/index/confirm?schedule_id=${row.id}` })
}

onShow(() => {
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
