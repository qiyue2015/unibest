<route lang="json5" type="home">
{
  style: {
    navigationBarTitleText: '赛程',
  },
}
</route>

<template>
  <!-- bg-[#06398d] -->
  <!-- navigationStyle: 'custom', -->
  <view class="h-screen overflow-hidden bg-[#f5f5f5]">
    赛程
  </view>
</template>

<script lang="ts" setup>
import { useAppStore, useUserStore } from '@/store'
import { ref, computed } from 'vue'

defineOptions({ name: 'Home' })

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

onLoad(() => {
//
})
</script>

<style>

page {
  height: 100vh;
  overflow: hidden;
}
.main-title-color {
  color: #d14328;
}
</style>
