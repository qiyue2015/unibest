// 全局要用的类型放到这里

declare global {
  type IResData<T> = {
    errno: number
    message: string
    data: T
  }

  // uni.uploadFile文件上传参数
  type IUniUploadFileOptions = {
    file?: File
    files?: UniApp.UploadFileOptionFiles[]
    filePath?: string
    name?: string
    formData?: any
  }

  type IUserInfo = {
    uid?: number
    nickname?: string
    avatar?: string
    /** 微信的 openid，非微信没有这个字段 */
    openid?: string
  }
}

export {} // 防止模块污染
