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
  function handleSocketClose() {
    wsConnected.value = false
    options.onClose && options.onClose()
  }
  function handleSocketError(err: any) {
    wsConnected.value = false
    options.onError && options.onError(err)
  }

  async function connect(override: { module: string; query?: Record<string, any> }) {
    const queryStr = getQueryStr(override)
    if (!override.module || wsConnected.value) return
    try {
      await uni.connectSocket({ url: buildUrl(override) })
      lastQueryStr = queryStr
    } catch (e) {
      options.onError && options.onError(e)
      return
    }
    if (!wsEventRegistered) {
      uni.onSocketOpen(handleSocketOpen)
      uni.onSocketMessage(handleSocketMessage)
      uni.onSocketClose(handleSocketClose)
      uni.onSocketError(handleSocketError)
      wsEventRegistered = true
    }
  }

  function send(msg: string) {
    if (wsConnected.value) {
      uni.sendSocketMessage({ data: msg })
    }
  }

  function close() {
    if (wsConnected.value) {
      uni.closeSocket({ code: 1000, reason: '页面卸载关闭' })
    }
    wsConnected.value = false
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
