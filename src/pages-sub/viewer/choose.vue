<route lang="json5">
{
  needLogin: true,
  style: {
    disableScroll: true,
    navigationBarTitleText: '选择观演人',
  },
}
</route>

<template>
  <view class="h-screen relative overflow-hidden flex flex-col">
    <view class="flex-1 min-h-0 overflow-hidden">
      <scroll-view scroll-y refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
        <view class="flex flex-col m-4 gap-3">
          <wd-button type="info" size="large" icon="add-circle" block @click="goToCreateViewer">添加观演人</wd-button>
          <view class="rounded-xl overflow-hidden flex-1">
            <wd-cell-group border>
              <wd-checkbox-group v-model="selectedViewers">
                <block v-for="viewer in viewers" :key="viewer.id">
                  <wd-cell size="large" custom-class="cell-custom-class" center>
                    <template #title>
                      <wd-checkbox :model-value="viewer.id" size="large" shape="square">
                        <view class="text-base">{{ viewer.realname }}</view>
                        <view class="text-sm text-gray-500">{{ viewer.idcard }}</view>
                      </wd-checkbox>
                    </template>
                    <wd-button type="icon" icon="edit-outline" @click="goToEditViewer(viewer)" />
                  </wd-cell>
                </block>
              </wd-checkbox-group>
            </wd-cell-group>
          </view>
        </view>
      </scroll-view>
    </view>
    <view class="bg-white p-4 bottom-area">
      <wd-button :disabled="isButtonDisabled" size="large" block @click="onConfirm">
        <view class="center gap-2">
          <view>确认</view>
          <view class="text-size-xs">已选 {{ selectedCount }} / {{ MAX_VIEWERS }} 人</view>
        </view>
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { getViewerList } from '@/api/viewer'

defineOptions({
  name: 'ChooseViewer',
  options: {
    styleIsolation: 'shared',
  },
})

const MAX_VIEWERS = 6 // 最多允许选择多少人
const selectedViewers = ref<any>([])

// 按钮是否可用
const isButtonDisabled = computed(() => {
  return selectedViewers.value.length === 0 || selectedViewers.value.length > MAX_VIEWERS
})

// 计算选择了多少人
const selectedCount = computed(() => {
  return selectedViewers.value.length
})

const goToCreateViewer = () => {
  uni.navigateTo({
    url: '/pages-sub/viewer/create',
  })
}

const goToEditViewer = (viewer: any) => {
  viewer = JSON.stringify(viewer)
  uni.navigateTo({
    url: `/pages-sub/viewer/create?viewer=${viewer}`,
  })
}

// 携带先中选的观演人信息返回上一页
const onConfirm = () => {
  // 拿到选中的观演人对象数组
  const selectedViewersData = viewers.value.filter((v) => selectedViewers.value.includes(v.id))
  uni.navigateBack({
    delta: 1,
    success() {
      uni.$emit('viewersSelected', selectedViewersData)
    },
  })
}

const isRefreshing = ref(false)
const viewers = ref<any[]>([])
const fetchViewers = async () => {
  try {
    isRefreshing.value = true
    uni.showLoading({ title: '加载中...', mask: true })
    const { data } = await getViewerList()
    viewers.value = data || []
  } finally {
    isRefreshing.value = false
    uni.hideLoading()
  }
}

const onRefresh = () => fetchViewers()

onLoad(() => {
  // 监听来自其他页面传递的观演人 IDs
  uni.$on('selectedViewerIds', (items) => {
    selectedViewers.value = items
  })
})

onUnload(() => {
  // 清理监听，避免内存泄漏
  uni.$off('selectedViewerIds')
})

onShow(() => fetchViewers())
</script>

<style lang="scss" scoped>
:deep(.cell-custom-class) {
  .wd-cell__right {
    flex: none;
    width: 100rpx;
  }
}

.bottom-area {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
