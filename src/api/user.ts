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
