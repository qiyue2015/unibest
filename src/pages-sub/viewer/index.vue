<route lang="json5">
{
  needLogin: true,
  style: {
    navigationBarTitleText: '常用观演人',
  },
}
</route>

<template>
  <view class="min-h-screen relative">
    <block v-if="isEmpty">
      <wd-status-tip image="search" tip="暂无观众演人信息" />
    </block>
    <view v-else class="flex flex-col gap-4 m-4">
      <view v-for="(item, index) in list" :key="index" class="rounded-xl overflow-hidden">
        <wd-cell-group>
          <wd-cell :title="item.realname" size="large" center>
            <template #label>
              <text v-if="item.mobile">{{ item.idcard }}</text>
              <text v-if="!item?.mobile" class="text-red">联系方式待填写</text>
            </template>
            <view class="flex gap-3 justify-end">
              <wd-icon name="edit-outline" size="1.5em" @click="goToEditViewer(item)" />
            </view>
          </wd-cell>
        </wd-cell-group>
      </view>
    </view>
    <view class="mx-4 fixed left-0 right-0 bottom-0 z-10 safe-area-inset-bottom">
      <wd-button type="primary" size="large" block @click="addViewer">新增观众演人</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { getViewerList } from '@/api/viewer'
import { useToast } from 'wot-design-uni'

const toast = useToast()

const list = ref<any[]>([])

// 计算是否为空
const isEmpty = computed(() => {
  return list.value.length === 0
})

// 获取数据
const fetchData = async () => {
  try {
    toast.loading({ msg: '加载中...', duration: 0 })
    const { data } = await getViewerList()
    list.value = data
  } finally {
    toast.close()
  }
}

// 添加观演人
const addViewer = () => {
  uni.navigateTo({
    url: '/pages-sub/viewer/create',
  })
}

// 编辑观演人
const goToEditViewer = (viewer: any) => {
  viewer = JSON.stringify(viewer)
  uni.navigateTo({
    url: `/pages-sub/viewer/create?viewer=${viewer}`,
  })
}

onShow(() => fetchData())
</script>

<style lang="scss">
body,
page,
main {
  @apply h-screen overflow-hidden;
}

.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
