import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authSessionCheck, authSessionOpenid } from '@/service/index/user'

const initState = { uid: 0, nickname: '', avatar: '' }

export const useUserStore = defineStore(
  'user',
  () => {
    const sessionid = ref<string>(null)

    const userInfo = ref<IUserInfo>({ ...initState })

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

    // 获取用户信息
    const getUserInfo = async () => {
      try {
        const loginFlow = () => {
          wx.login({
            success: async function ({ code }) {
              try {
                let { data } = await authSessionOpenid(code)

                // 由于首次登录时 userinfo 为空，为了简化后续业务逻辑，这里重新获取一次
                // 参考文档: https://wiki.w7.com/document/35/1026
                if (!data?.userinfo) {
                  data = (await authSessionOpenid(code)).data
                }

                setSessionid(data.sessionid)
                setUserInfo(data.userinfo)
              } catch {
                clearUserInfo()
              }
            },
          })
        }
        if (sessionid.value) {
          checkSessionid() // 调用检查 sessionid 是否过期
        } else {
          loginFlow() // 调用登录
        }
      } catch (error) {
        clearUserInfo()
      }
    }

    // 一般没有reset需求，不需要的可以删除
    const reset = () => {
      userInfo.value = { ...initState }
    }

    const isLogined = computed(() => !!sessionid.value)

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
    }
  },
  {
    persist: true,
  },
)
