<template>
  <text class="font-normal" :class="statusClass">{{ statusText }}</text>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  status: string | number
}>()

const statusMap: Record<number, string> = {
  0: '待支付',
  1: '待使用',
  2: '已完成',
  3: '已关闭',
  4: '申请退款中',
  5: '已退款',
  6: '申请退款中', // 退款失败
}

const statusText = computed(() => {
  const key = Number(props.status)
  return statusMap[key] ?? ''
})

const statusClass = computed(() => {
  const key = Number(props.status)
  switch (key) {
    case 0: // 待支付
      return 'text-orange-500'
    case 1: // 待使用
      return 'text-blue-500'
    case 2: // 已完成
      return 'text-green-500'
    case 3: // 已取消
      return 'text-gray-400'
    case 4: // 申请退款中
      return 'text-red-500'
    case 5: // 已退款
      return 'text-gray-400'
    case 6: // 退款失败
      return 'text-red-500'
    default:
      return ''
  }
})
</script>
