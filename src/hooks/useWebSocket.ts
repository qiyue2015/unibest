import { ref, onUnmounted, isRef, watch, type Ref } from 'vue'

interface UseWebSocketOptions {
  onMessage?: (data: any) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (err: any) => void
}

export function useWebSocket(options: UseWebSocketOptions) {
  const wsConnected = ref(false)
  let wsEventRegistered = false
  let lastQueryStr: string | undefined
  let retryCount = 0
  const maxRetries = 5
  let retryTimer: ReturnType<typeof setTimeout> | null = null
  let lastConnectOverride: { module: string; query?: Record<string, any> } | null = null
  let retrying = false

  // 统一从 .env 读取 wsBaseUrl 和 uniacid
  const wsBaseUrl = import.meta.env.VITE_WEBSOCKET_URL
  const uniacid = import.meta.env.VITE_WX_UNIACID

  function buildUrl(override: { module: string; query?: Record<string, any> }) {
    const params: Record<string, any> = {
      uniacid,
      module: override.module,
      ...(override.query ?? {}),
    }
    const queryStr = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    return `${wsBaseUrl}?${queryStr}`
  }

  function getQueryStr(override: { module: string; query?: Record<string, any> }) {
    let queryObj = override.query
    if (typeof queryObj !== 'object' || queryObj === null) queryObj = {}
    const params: Record<string, any> = Object.assign({}, { uniacid, module: override.module }, queryObj)
    return JSON.stringify(params)
  }

  function handleSocketOpen() {
    wsConnected.value = true
    retryCount = 0
    retrying = false
    retryTimer && clearTimeout(retryTimer)
    retryTimer = null
    options.onOpen && options.onOpen()
  }
  function handleSocketMessage(res: any) {
    try {
      const data = JSON.parse(res.data)
      options.onMessage && options.onMessage(data)
    } catch (e) {
      console.error('WebSocket message parse error:', e)
    }
  }
  // 在达到最大重试次数时清理定时器
  function handleSocketClose() {
    wsConnected.value = false
    options.onClose && options.onClose()
    if (!retrying && retryCount < maxRetries && lastConnectOverride) {
      retrying = true
      retryCount++
      retryTimer && clearTimeout(retryTimer)
      retryTimer = setTimeout(() => {
        retrying = false
        connect(lastConnectOverride!)
      }, 1000 * retryCount)
    } else if (retryCount >= maxRetries) {
      retryTimer && clearTimeout(retryTimer)
      retryTimer = null
      options.onError &&
        options.onError({
          message: 'WebSocket连接失败，已达最大重试次数',
        })
    }
  }
  function handleSocketError(err: any) {
    wsConnected.value = false
    options.onError && options.onError(err)
    if (!retrying && retryCount < maxRetries && lastConnectOverride) {
      retrying = true
      retryCount++
      retryTimer && clearTimeout(retryTimer)
      retryTimer = setTimeout(() => {
        retrying = false
        connect(lastConnectOverride!)
      }, 1000 * retryCount)
    } else if (retryCount >= maxRetries) {
      retryTimer && clearTimeout(retryTimer)
      retryTimer = null
      options.onError &&
        options.onError({
          message: 'WebSocket连接失败，已达最大重试次数',
          error: err,
        })
    }
  }
  // connect 前判断 lastConnectOverride，防止 close 后还重连
  async function connect(override: { module: string; query?: Record<string, any> }) {
    if (!override.module) {
      console.log('[WebSocket] connect return: !override.module', override)
      return
    }
    if (wsConnected.value) {
      console.log('[WebSocket] connect return: wsConnected.value = true')
      return
    }
    if (retrying) {
      console.log('[WebSocket] connect return: retrying = true')
      return
    }
    if (retryCount >= maxRetries) {
      console.log('[WebSocket] connect return: retryCount >= maxRetries')
      return
    }
    lastConnectOverride = override
    try {
      await uni.connectSocket({ url: buildUrl(override) })
      lastQueryStr = getQueryStr(override)
      console.log('[WebSocket] connectSocket called', buildUrl(override))
    } catch (e) {
      console.log('[WebSocket] connectSocket error', e)
    }
    if (!wsEventRegistered) {
      uni.onSocketOpen(handleSocketOpen)
      uni.onSocketMessage(handleSocketMessage)
      uni.onSocketClose(handleSocketClose)
      uni.onSocketError(handleSocketError)
      wsEventRegistered = true
      console.log('[WebSocket] wsEventRegistered = true')
    }
  }

  function send(msg: string) {
    if (wsConnected.value) {
      uni.sendSocketMessage({ data: msg })
    }
  }

  function close() {
    if (retryTimer) {
      clearTimeout(retryTimer)
      retryTimer = null
    }
    retrying = false
    if (wsConnected.value) {
      uni.closeSocket({ code: 1000, reason: '页面卸载关闭' })
    }
    wsConnected.value = false
    retryCount = 0
    lastConnectOverride = null
  }

  onUnmounted(() => {
    close()
  })

  return {
    socketConnected: wsConnected,
    socketConnect: connect,
    socketSend: send,
    socketClose: close,
  }
}
