import { http } from '@/utils/http'

export const getOrderList = (params: any) => {
  return http.get<any>('/app/index.php?c=entry&a=wxapp&m=basketball&do=order&op=list', params)
}

// 订单详情
export const getOrderInfo = (id: string) => {
  return http.get<any>('/app/index.php?c=entry&a=wxapp&m=basketball&do=order&op=info', { id })
}

// 取消订单
export const closeOrder = (tid: string) => {
  return http.post<any>('/app/index.php?c=entry&a=wxapp&m=basketball&do=order&op=close', { tid })
}

// 我的门票
export const getMyTicket = (params: any) => {
  return http.get<any>('/app/index.php?c=entry&a=wxapp&m=basketball&do=ticket&op=me', params)
}
