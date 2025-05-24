import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getModuleSetting } from '@/api/app';

const initState = { uniacid: 0, name: '', bg_home:'' }

export const useAppStore = defineStore(
  'app',
  () => {
    const accountInfo = ref<any>({ ...initState })

    const setAccountInfo = (val: IUserInfo) => {
      accountInfo.value = val
    }

    const getAccountInfo = async () => {
      try {
        const { data } = await getModuleSetting()
        accountInfo.value = data
      } catch (error) {
        console.error('获取模块设置失败', error)
      }
    }

    const clearAccountInfo = () => {
      accountInfo.value = { ...initState }
    }

    // 一般没有reset需求，不需要的可以删除
    const reset = () => {
      accountInfo.value = { ...initState }
    }

    // 计算顶部安全区域和胶囊高度（状态栏 + 自定义导航栏高度）
    const statusBarHeight = ref<number>(0)
    const menuButtonRect = ref<UniApp.GetMenuButtonBoundingClientRectRes | null>(null)
    const topBarHeight = ref<number>(0)

    const calcTopBarHeight = () => {
      // #ifdef MP-WEIXIN
      const sysInfo = uni.getSystemInfoSync()
      statusBarHeight.value = sysInfo.statusBarHeight || 0
      menuButtonRect.value = uni.getMenuButtonBoundingClientRect()
      // 胶囊下边距 - 状态栏上边距 + 状态栏高度 = 总高度
      topBarHeight.value = (menuButtonRect.value.bottom - menuButtonRect.value.top) + menuButtonRect.value.top
      // #else
      statusBarHeight.value = 0
      menuButtonRect.value = null
      topBarHeight.value = 44 // 默认导航栏高度
      // #endif
    }

    // 初始化时计算一次
    calcTopBarHeight()

    return {
      accountInfo,
      setAccountInfo,
      getAccountInfo,
      reset,
      // 新增顶部安全区相关
      statusBarHeight,
      menuButtonRect,
      topBarHeight,
      calcTopBarHeight,
    }
  },
  {
    persist: true,
  },
)
