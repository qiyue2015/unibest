import { http } from '@/utils/http'

export const getModuleSetting = () => {
  return http.get('/app/index.php?a=wxapp&c=entry&m=qiyue_workorder&do=setting&op=display')
}

export const getActivityDetail = (id: number) => {
  return http.get('/app/index.php?a=wxapp&c=entry&m=basketball&do=activity&op=detail', {
    id,
  })
}

// 赛事赛程例表
export const getScheduleList = () => {
  return http.get<any>('/app/index.php?a=wxapp&c=entry&m=basketball&do=schedule&op=list')
}

// 赛事赛程详情
export const getScheduleDetail = (id: number) => {
  return http.get('/app/index.php?a=wxapp&c=entry&m=basketball&do=schedule&op=detail', {
    id,
  })
}
