<route lang="json5">
{
  needLogin: true,
  style: {
    disableScroll: true,
    navigationBarTitleText: '确认订单',
    navigationBarBackgroundColor: '#f5f5f5',
    backgroundColor: '#f5f5f5',
  },
}
</route>

<template>
  <view class="min-h-screen relative p-4">
    <view class="flex flex-col gap-4">
      <view v-if="schedule" class="rounded-xl overflow-hidden">
        <wd-cell-group use-slot border>
          <template #title>{{ schedule.date }}</template>
          <template #value>
            <view class="text-amber font-bold">¥{{ schedule.price }}/人</view>
          </template>
          <block v-for="(venue, index) in schedule.venues" :key="index">
            <wd-cell :title="venue.team" :value="venue.time" size="large" center />
          </block>
        </wd-cell-group>
      </view>
      <template v-if="viewers.length">
        <view class="rounded-xl overflow-hidden">
          <wd-cell-group border>
            <wd-cell
              v-for="(viewer, index) in viewers"
              :key="index"
              :title="viewer.realname"
              :label="viewer.idcard"
              size="large"
              center
            >
              <wd-icon name="delete" size="18px" @click="removeViewer(index)" />
            </wd-cell>
          </wd-cell-group>
        </view>
      </template>
      <view v-if="viewers.length < 6" class="rounded-xl overflow-hidden">
        <wd-cell-group border>
          <view class="center p-3 gap-2 text-amber" @click="selectViewers">
            <wd-icon name="add-circle" />
            选择观演人
          </view>
        </wd-cell-group>
      </view>
      <view class="flex justify-between items-center mb-4">
        <view>共 {{ viewers.length }} 人</view>
        <view class="text-amber font-bold">总价：¥{{ totalPrice }}</view>
      </view>
      <wd-button type="primary" size="large" block @click="submitOrder" :disabled="viewers.length === 0">提交订单</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { getViewerList } from '@/api/viewer'
import { useToast } from 'wot-design-uni'
import { createOrder, getScheduleDetail, payOrder } from '@/api/app'

defineOptions({
  name: 'ConfirmOrder',
  options: {
    styleIsolation: 'shared',
  },
})

const toast = useToast()
const scheduleId = ref<number | null>(null)
const schedule = ref<any>(null)
const viewers = ref<any[]>([])

const totalPrice = computed(() => {
  const price = Number(schedule.value?.price) || 0
  return price * viewers.value.length
})

const fetchData = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const { data } = await getScheduleDetail(scheduleId.value)
    schedule.value = data
  } finally {
    uni.hideLoading()
  }
}

// 删除已选择的观演人
const removeViewer = (index: number) => {
  viewers.value.splice(index, 1)
}

// 前往选择观演人
const selectViewers = () => {
  uni.navigateTo({
    url: '/pages-sub/viewer/choose?schedule_id=' + scheduleId.value,
    success: () => {
      // 监听选择的观演人 IDs
      const viewerIds = viewers.value.map((v) => v.id)
      uni.$emit('selectedViewerIds', viewerIds)
    },
  })
}

const submitOrder = async () => {
  const { data } = await createOrder({
    schedule_id: scheduleId.value,
    viewers: viewers.value.map((v) => v.id),
  })

  if (!data.tid) {
    toast.error({ msg: '订单创建失败，请稍后再试' })
    return
  }

  toast.success({
    msg: '订单创建成功',
    duration: 1000,
    closed: () => {
      uni.navigateTo({ url: `/pages/order/pay?tid=${data.tid}` })
    },
  })
}

onLoad((options) => {
  if (options?.schedule_id) {
    scheduleId.value = parseInt(options.schedule_id)
    fetchData()
  } else {
    toast.error({
      msg: '无效的赛程信息',
      duration: 1000,
      closed() {
        uni.switchTab({ url: '/pages/index/index' })
      },
    })
  }

  uni.$on('viewersSelected', (items) => {
    viewers.value = items
  })
})

onUnload(() => {
  uni.$off('viewersSelected')
})
</script>

<style lang="scss" scoped></style>
