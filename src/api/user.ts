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
  return http({
    url: '/app/index.php?c=auth&a=session&do=check',
    hideErrorToast: true,
  })
}

export const authSessionOpenid = (code: string) => {
  return http.get<IAuthItem>('/app/index.php?c=auth&a=session&do=openid', { code })
}

// 用户信息
export const getUserinfo = () => {
  return http.get('/app/index.php?c=wxapp&a=me&do=profile')
}

// 授权微信绑定手机号
export const bindPhone = (code: string) => {
  return http.post('/app/index.php?c=wxapp&a=me&do=bind_mobile', { code })
}

// 修改资料
export const updateUserinfo = (data: any) => {
  return http.post('/app/index.php?c=wxapp&a=me&do=update', data)
}

// 上传头像
export const uploadAvatar = (file: File) => {
  const formData = new FormData()
  formData.append('avatar', file)
  return http.post('/app/index.php?c=wxapp&a=me&do=avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 上传头像 base64
export const uploadAvatarBase64 = (image: string) => {
  return http.post('/app/index.php?c=wxapp&a=me&do=avatar_base64', { image })
}

// 领取门票
export const receiveTicket = (data: any) => {
  return http({
    url: '/app/index.php?c=entry&a=wxapp&m=basketball&do=gift&op=receive',
    method: 'POST',
    data: data,
    hideErrorToast: true,
  })
}

// 检查是否为赞助商
export const checkSponsor = () => {
  return http<any>({
    url: '/app/index.php?c=entry&a=wxapp&m=basketball&do=sponsor&op=check',
    method: 'GET',
    hideErrorToast: true,
  })
}
