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
          return
        }
        // 登录流程
        wx.login({
          success: async function ({ code }) {
            try {
              let { data } = await authSessionOpenid(code)
              setSessionid(data.sessionid)
              // 获取取用户信息
              const res = await getUserinfo()
              setUserInfo(res.data)
            } catch (e) {
              clearUserInfo()
            }
          },
          fail: function (err) {
            clearUserInfo()
          },
        })
      } catch (error) {
        clearUserInfo()
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
