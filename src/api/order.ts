import { http } from '@/utils/http'

export const getOrderList = (params: any) => {
  return http.get<any>('/app/index.php?c=entry&a=wxapp&m=basketball&do=order&op=list', params)
}
