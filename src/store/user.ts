import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authSessionCheck, authSessionOpenid, getUserinfo } from '@/api/user'

const initState = { uid: 0, mobile: undefined, nickname: '', avatar: '' }

export const useUserStore = defineStore(
  'user',
  () => {
    const sessionid = ref<string>(null)

    const userInfo = ref<IUserInfo>({ ...initState })

    const isLogined = computed(() => !!sessionid.value && !!userInfo.value.mobile)

    const setSessionid = (val: string) => {
      sessionid.value = val
    }

    const setUserInfo = (val: IUserInfo) => {
      userInfo.value = val
    }

    const clearUserInfo = () => {
      sessionid.value = null
      userInfo.value = { ...initState }
    }

    const info = async () => {
      const res = await getUserinfo()
      setUserInfo(res.data)
    }

    // 获取用户信息
    const getUserInfo = async () => {
      try {
        if (isLogined.value) {
          await checkSessionid() // 调用检查 sessionid 是否过期
          return userInfo.value // 已登录直接返回当前用户信息
        }
        // 登录流程，改为异步写法，修正类型
        const loginRes = await new Promise<{ code: string }>((resolve, reject) => {
          wx.login({
            success: (res) => resolve(res as { code: string }),
            fail: reject,
          })
        })
        const { code } = loginRes
        let { data } = await authSessionOpenid(code)
        setSessionid(data.sessionid)
        // 获取用户信息
        const res = await getUserinfo()
        setUserInfo(res.data)
        return res.data // 返回获取到的用户信息
      } catch (error) {
        clearUserInfo()
        return null // 失败时返回 null
      }
    }

    // 检查 sessionid 是否过期
    const checkSessionid = async () => {
      if (!sessionid.value) {
        return
      }

      try {
        await authSessionCheck()
      } catch {
        clearUserInfo()
      }
    }

    // 一般没有reset需求，不需要的可以删除
    const reset = () => {
      userInfo.value = { ...initState }
    }

    return {
      sessionid,
      setSessionid,
      userInfo,
      setUserInfo,
      clearUserInfo,
      isLogined,
      reset,
      checkSessionid,
      getUserInfo,
      info,
    }
  },
  {
    persist: true,
  },
)
