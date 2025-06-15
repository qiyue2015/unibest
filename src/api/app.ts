import { http } from '@/utils/http'

export const getModuleSetting = () => {
  return http({
    url: '/app/index.php?a=wxapp&c=entry&m=qiyue_workorder&do=setting&op=display',
    noAuth: true,
  })
}

export const getActivityDetail = (id: number) => {
  return http({
    url: '/app/index.php?a=wxapp&c=entry&m=basketball&do=activity&op=detail',
    data: { id },
    noAuth: true,
  })
}

// 赛事赛程例表
export const getScheduleList = () => {
  return http<any>({
    url: '/app/index.php?a=wxapp&c=entry&m=basketball&do=schedule&op=list',
    noAuth: true,
  })
}

// 赛事赛程详情
export const getScheduleDetail = (id: number) => {
  return http({
    url: '/app/index.php?a=wxapp&c=entry&m=basketball&do=schedule&op=detail',
    data: { id },
    noAuth: true,
  })
}
