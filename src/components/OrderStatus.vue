<template>
  <text class="font-normal" :class="statusClass">{{ statusText }}</text>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  status: string | number
}>()

const statusMap = {
  0: '待支付',
  1: '待使用',
  2: '已关闭',
  3: '已完成',
}

const statusText = computed(() => {
  const key = Number(props.status)
  return statusMap.hasOwnProperty(key) ? statusMap[key] : ''
})
const statusClass = computed(() => {
  const key = Number(props.status)
  switch (key) {
    case 0:
      return '  text-orange-500'
    case 1:
      return ' text-blue-500'
    case 2:
      return ' text-gray-400'
    case 3:
      return ' text-green-500'
    default:
      return ''
  }
})
</script>
