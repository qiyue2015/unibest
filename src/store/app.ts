import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getModuleSetting } from '@/api/app'

const initState = { uniacid: 0, name: '', bg_home: '' }

export const useAppStore = defineStore(
  'app',
  () => {
    const scene = ref<number>(0) // 小程序场景值
    const accountInfo = ref<any>({ ...initState })

    // 设置场景值
    const setScene = (val: number) => {
      scene.value = val
    }

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

    // console.log('useAppStore init')
    // #ifdef MP-WEIXIN
    // console.log('uni.getSystemSetting', uni.getSystemSetting())
    // console.log('uni.getAppAuthorizeSetting', uni.getAppAuthorizeSetting())
    // #endif
    // console.log('uni.getDeviceInfo', uni.getDeviceInfo())
    // console.log('uni.getWindowInfo', uni.getWindowInfo())
    // console.log('uni.getAppBaseInfo', uni.getAppBaseInfo())

    // 计算顶部安全区域和胶囊高度（状态栏 + 自定义导航栏高度）
    const statusBarHeight = ref<number>(0)
    const topBarHeight = ref<number>(0)
    const menuButtonRect = ref(null)

    const calcTopBarHeight = () => {
      const windowInfo = uni.getWindowInfo()
      statusBarHeight.value = windowInfo.statusBarHeight || 0
      topBarHeight.value = windowInfo.screenTop
      // #ifdef MP-WEIXIN
      menuButtonRect.value = uni.getMenuButtonBoundingClientRect()
      topBarHeight.value = menuButtonRect.value.top - windowInfo.statusBarHeight + menuButtonRect.value.bottom
      // #endif
    }

    // 初始化时计算一次
    calcTopBarHeight()

    return {
      scene,
      setScene,
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
