<template>
  <view :class="statusClass" class="inline-block px-2 py-0.5 rounded text-xs font-bold align-middle">
    {{ statusText }}
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  status: number | string
}>()

const statusMap = {
  0: { text: '未使用', color: 'bg-green-100 text-green-600' },
  1: { text: '已使用', color: 'bg-gray-100 text-gray-400' },
  2: { text: '已取消', color: 'bg-orange-100 text-orange-500' },
  4: { text: '已过期', color: 'bg-red-100 text-red-500' },
}

const statusText = computed(() => {
  const s = statusMap[props.status as keyof typeof statusMap]
  return s ? s.text : '未知'
})
const baseClass = 'inline-block px-2 py-0.5 rounded text-xs font-bold align-middle'

const statusClass = computed(() => {
  const s = statusMap[props.status as keyof typeof statusMap]
  return `${baseClass} ${s ? s.color : 'bg-gray-100 text-gray-400'}`
})
</script>
