import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getModuleSetting } from '@/api/app';

const initState = { uniacid: 0, name: '' }

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

    return {
      accountInfo,
      setAccountInfo,
      getAccountInfo,
      reset,
    }
  },
  {
    persist: true,
  },
)
