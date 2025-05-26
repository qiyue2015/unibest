<template>
  <text class="font-normal" :class="statusClass">{{ statusText }}</text>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  status: string | number
}>()

// 订单状态: 0待支付 1待使用 2已关闭 3已完成 4退款失败 5主动关闭 6超时关闭
const statusMap: Record<number, string> = {
  0: '待支付',
  1: '待使用',
  2: '已关闭',
  3: '已完成',
  4: '退款失败',
  5: '已关闭',
  6: '已关闭',
}

const statusText = computed(() => {
  const key = Number(props.status)
  return statusMap[key] ?? ''
})

const statusClass = computed(() => {
  const key = Number(props.status)
  switch (key) {
    case 0:
      return 'text-orange-500'
    case 1:
      return 'text-blue-500'
    case 2:
    case 5:
    case 6:
      return 'text-gray-400'
    case 3:
      return 'text-green-500'
    case 4:
      return 'text-red-500'
    default:
      return ''
  }
})
</script>
