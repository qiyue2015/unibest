import { http } from '@/utils/http'

export interface IViewer {
  id?: number
  realname?: string
  idcard?: string
}

export const getViewerList = () => {
  return http.get<IViewer[]>('/app/index.php?c=entry&m=basketball&do=viewer&op=list')
}

export const saveViewer = (data: IViewer) => {
  return http.post<IViewer>('/app/index.php?c=entry&m=basketball&do=viewer&op=save', data)
}

export const deleteViewer = (id: string) => {
  return http.post<IViewer>('/app/index.php?c=entry&m=basketball&do=viewer&op=delete', { id })
}

export const updateViewer = (data: IViewer) => {
  return http.post<IViewer>('/app/index.php?c=entry&m=basketball&do=viewer&op=update', data)
}
