<route lang="json5">
    {
      style: {
        navigationStyle: 'custom'
      },
    }
</route>

<template>
  <view v-if="detail" class="main">
    <view class="w-750rpx min-h-562rpx overflow-hidden">
      <wd-img width="100%" height="100%" :src="detail.cover" />
    </view>
    <view class="max-w-686rpx mb-10 text-white text-size-md">
      <view v-for="row in detail.group" :key="row.title" class="flex mb-2">
        <view class="whitespace-nowrap">{{ row.title }}：</view>
        <view class="flex-1 flex flex-col m-0">
          <view v-for="v in row.items" :key="v">
            {{ v }}
          </view>
        </view>
      </view>
    </view>
    <view class="w-full absolute bottom-20 text-center">
      <view class="mb-4 mx-12">
        <wd-button size="large" block @click="goToHome">
          查看赛程
        </wd-button>
      </view>
      <view class="mx-12">
        <wd-button size="large" plain hairline block @click="goToTicket">
          我的门票
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useToast } from 'wot-design-uni'
import { getActivityDetail } from '@/api/app'

const toast = useToast()
const id = ref<number | null>(null)
const detail = ref<any>(null)

// 获取数据
const fetchData = async () => {
  try {
    toast.loading({ 
      msg: '加载中...', 
      position: 'middle',
      direction: 'vertical',
      duration: 0,
    })
    const { data } = await getActivityDetail(id.value)
    detail.value = data
    toast.close()
  } catch {
    toast.error({ msg: '未找到活动', duration: 1000 })
    uni.switchTab({ url: '/pages/index/index' })
  }
}

const goToHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

const goToTicket = () => {
  uni.switchTab({ url: '/pages/ticket/index' })
}

onLoad(async (options) => {
  id.value = options?.id
})

onShow(async() => fetchData())
</script>

<style>
page,
.main {
  @apply w-full h-screen overflow-hidden bg-[#06398d];
}

.main {
  @apply flex flex-col items-center h-screen overflow-hidden;
}
</style>