<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'
import { useAppStore, useUserStore } from '@/store'
import { checkUpdate } from '@/utils/checkUpdate'

const appStore = useAppStore()
const userStore = useUserStore()

onLaunch(() => {
  console.log('App Launch')
})

onShow(async () => {
  // #ifdef MP-WEIXIN
    // 检查 sessionid
    if (userStore.isLogined) {
      await userStore.checkSessionid()
    }

    // 版本更新检查
    checkUpdate()
  // #endif
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
body,
page {
  background-color: #f5f5f5;
}

/* stylelint-disable selector-type-no-unknown */
button::after {
  border: none;
}

swiper,
scroll-view {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

image {
  width: 100%;
  height: 100%;
  vertical-align: middle;
}

// 单行省略，优先使用 unocss: text-ellipsis
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 两行省略
.ellipsis-2 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

// 三行省略
.ellipsis-3 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
