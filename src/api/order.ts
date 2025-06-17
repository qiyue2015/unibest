import { http } from '@/utils/http'

export const getOrderList = (params: any) => {
  return http.get<any>('/app/index.php?c=entry&a=wxapp&m=basketball&do=order&op=list', params)
}

// 提交订单
export const createOrder = (data: any) => {
  return http<any>({
    url: '/app/index.php?a=wxapp&c=entry&m=basketball&do=order&op=create',
    method: 'POST',
    data: data,
    hideErrorToast: true,
  })
}

// 生成订单支付参数
export const payOrder = (tid: string) => {
  return http.post<any>('/app/index.php?a=wxapp&c=entry&m=basketball&do=pay', {
    tid,
  })
}

// 支付结果
export const getPayResult = (tid: string) => {
  return http.get<any>('/app/index.php?a=wxapp&c=entry&m=basketball&do=payResult', {
    tid,
  })
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

// 门票详情
export const getTicketInfo = (id: string) => {
  return http<any>({
    method: 'GET',
    url: '/app/index.php?c=entry&a=wxapp&m=basketball&do=ticket&op=detail',
    data: { id },
    hideErrorToast: true,
  })
}

// 订单下的门票
export const getOrderTickets = (id: string) => {
  return http.get<any>('/app/index.php?c=entry&a=wxapp&m=basketball&do=order&op=tickets', { id })
}
