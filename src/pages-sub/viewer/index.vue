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
    <view class="flex flex-col gap-4 m-4">
      <view v-for="(item, index) in list" :key="index" class="rounded-xl overflow-hidden">
        <wd-cell-group>
          <wd-cell :title="item.realname" :label="item.idcard" size="large" center>
            <view class="flex gap-3 justify-end">
              <wd-icon name="edit-outline" size="1.5em" />
              <wd-icon name="delete" size="1.5em" @click="onDeleteViewer(item.id)" />
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
import { deleteViewer, getViewerList } from '@/api/viewer'
import { useMessage, useToast } from 'wot-design-uni'

const toast = useToast()
const message = useMessage()

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

// 添加观众演人
const addViewer = () => {
  uni.navigateTo({
    url: '/pages-sub/viewer/create',
  })
}

// 删除
const onDeleteViewer = async (id: string) => {
  message
    .confirm({
      title: '删除确认',
      msg: '确定要删除该观演人信息吗？删除后将无法恢复。',
    })
    .then(async () => {
      try {
        toast.loading({ msg: '删除中...', duration: 0 })
        await deleteViewer(id)
        await fetchData()
      } finally {
        toast.close()
      }
    })
    .catch(() => {
      console.log('点击了取消按钮')
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
