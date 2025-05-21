import { http } from '@/utils/http'

export interface IAuthUserInfo {
  uid: number
  nickname: string
  avatar: string
  openid?: string
}

export interface IAuthItem {
  sessionid: string
  userinfo?: IAuthUserInfo
}

export const authSessionCheck = () => {
  return http.post('/app/index.php?c=auth&a=session&do=check')
}

export const authSessionOpenid = (code: string) => {
  return http.get<IAuthItem>('/app/index.php?c=auth&a=session&do=openid', { code })
}

// 用户授权微信绑定手机号
export const bindPhone = (code: string) => {
  return http.post<IAuthItem>('/app/index.php?a=wxapp&c=entry&m=qiyue_workorder&do=user&op=bind_phone', { code })
}

// 获取模块用户信息
export const getUserinfo = () => {
  return http.get('/app/index.php?c=wxapp&a=me&do=profile')
}
