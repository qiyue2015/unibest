const CHECK_KEY = 'last_update_check'
const CHECK_INTERVAL = 60 * 60 * 1000 // 60分钟

export function checkUpdate() {
  const now = Date.now()
  const last = uni.getStorageSync(CHECK_KEY) || 0

  if (now - last < CHECK_INTERVAL) return

  uni.setStorageSync(CHECK_KEY, now)

  if (!wx.canIUse('getUpdateManager')) return

  const updateManager = wx.getUpdateManager()

  updateManager.onCheckForUpdate(() => {})

  updateManager.onUpdateReady(() => {
    wx.showModal({
      title: '更新提示',
      content: '新版本已准备好，是否重启应用？',
      success: (res) => {
        if (res.confirm) updateManager.applyUpdate()
      },
    })
  })

  updateManager.onUpdateFailed(() => {
    wx.showModal({
      title: '更新失败',
      content: '新版本下载失败，请检查网络设置',
      showCancel: false,
    })
  })
}
