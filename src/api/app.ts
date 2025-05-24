import { http } from '@/utils/http'

export const getModuleSetting = () => {
  return http.get('/app/index.php?a=wxapp&c=entry&m=qiyue_workorder&do=setting&op=display')
}

export const getActivityDetail = (id: number) => {
  return http.get('/app/index.php?c=entry&m=basketball&do=activity&op=detail', {
    id
  })
}