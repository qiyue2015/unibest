<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '个人中心',
  },
}
</route>

<template>
  <view class="main flex flex-col relative box-border">
    // #ifdef MP-WEIXIN
    <view class="box-border w-full center" :style="headerStyle">
      <view class="text-lg font-bold text-black w-full text-center">个人中心</view>
    </view>
    // #endif

    <view class="z-36 mx-4 flex flex-col gap-4">
      <!-- 顶部头像昵称区域 -->
      <view class="w-full pt-6 flex justify-between items-center">
        <view class="flex items-center">
          <image :src="userInfo.avatar" class="w-12 h-12 rounded-full bg-dark" mode="aspectFill" />
          <view class="ml-2" @click="goTo('/pages/setting/index', true)">
            <view class="text-base font-bold text-black">{{ userInfo.nickname }}</view>
            <view class="text-sm text-gray-500">{{ userInfo.mobile }}</view>
          </view>
        </view>
        <wd-button icon="setting" size="large" type="icon" @click="goTo('/pages-sub/setting/index', true)" />
      </view>

      <!-- 功能入口区域 -->
      <view class="rounded-xl overflow-hidden">
        <wd-cell-group title="订单中心" border>
          <template #value>
            <navigator class="font-normal text-gray" hover-class="none" url="/pages/order/index?status=0" open-type="navigate">
              查看全部
              <wd-icon name="arrow-right"></wd-icon>
            </navigator>
          </template>
          <wd-grid :gutter="10" :column="4" clickable>
            <wd-grid-item link-type="navigateTo" url="/pages/order/index?status=1" text="待支付" use-icon-slot>
              <template #icon>
                <image src="/static/images/order-status-0.svg" class="slot-img" mode="aspectFill" />
              </template>
            </wd-grid-item>
            <wd-grid-item link-type="navigateTo" url="/pages/order/index?status=2" text="待使用" use-icon-slot>
              <template #icon>
                <image src="/static/images/order-status-1.svg" class="slot-img" mode="aspectFill" />
              </template>
            </wd-grid-item>
            <wd-grid-item link-type="navigateTo" url="/pages/order/index?status=3" text="已使用" use-icon-slot>
              <template #icon>
                <image src="/static/images/order-status-2.svg" class="slot-img" mode="aspectFill" />
              </template>
            </wd-grid-item>
            <wd-grid-item link-type="navigateTo" url="/pages/order/index?status=4" text="已关闭" use-icon-slot>
              <template #icon>
                <image src="/static/images/order-status-3.svg" class="slot-img" mode="aspectFill" />
              </template>
            </wd-grid-item>
          </wd-grid>
        </wd-cell-group>
      </view>

      <!-- 菜单列表 -->
      <view class="rounded-xl overflow-hidden">
        <wd-cell-group title="我的服务" border>
          <wd-grid :gutter="10" :column="4" icon-size="36px" clickable>
            <wd-grid-item
              v-if="isSponsor"
              text="门票发放"
              use-icon-slot
              @itemclick="goTo('/pages-sub/sponsor/index?promoter_id=' + promoter.id, true)"
            >
              <template #icon>
                <image src="/static/tabbar/ticketHL.png" class="slot-img" mode="aspectFill" />
              </template>
            </wd-grid-item>
            <wd-grid-item text="常用信息" use-icon-slot @itemclick="goTo('/pages-sub/viewer/index', true)">
              <template #icon>
                <image src="/static/images/viewer.svg" class="slot-img" mode="aspectFill" />
              </template>
            </wd-grid-item>
            <wd-grid-item text="帮助与客服" use-icon-slot @itemclick="goTo('/pages-sub/help/index', false)">
              <template #icon>
                <image src="/static/images/help.svg" class="slot-img" mode="aspectFill" />
              </template>
            </wd-grid-item>
            <wd-grid-item text="用户隐私协议" use-icon-slot @itemclick="onPrivacyContract">
              <template #icon>
                <image src="/static/images/privacy.svg" class="slot-img" mode="aspectFill" />
              </template>
            </wd-grid-item>
          </wd-grid>
        </wd-cell-group>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from 'wot-design-uni'
import { useAppStore, useUserStore } from '@/store'
import { checkSponsor } from '@/api/user'

const appStore = useAppStore()
const userStore = useUserStore()
const message = useMessage()

const isSponsor = ref(false)
const promoter = ref(null)

const headerStyle = computed(() => {
  return {
    height: `${appStore.topBarHeight}px`,
    paddingTop: `${appStore.statusBarHeight}px`,
  }
})

const userInfo = computed(() => {
  return {
    avatar: userStore.userInfo.avatar || '/static/images/avatar.png',
    nickname: userStore.isLogined ? userStore.userInfo.nickname || '设置昵称' : '登录 / 注册',
    mobile: userStore.userInfo.mobile ? '手机号 ' + userStore.userInfo.mobile : '开启您的快乐时光',
  }
})

// 封装跳转
const goTo = (url: any, needLogin = true) => {
  if (typeof url === 'function') {
    return url()
  }
  // 如果需要登录且用户未登录
  if (needLogin && !userStore.isLogined) {
    message
      .confirm({
        msg: '登录后可使用该功能，是否前往登录？',
        title: '请先登录',
      })
      .then(() => {
        uni.navigateTo({
          url: '/pages/login/index?redirectUrl=' + encodeURIComponent('/pages/ucenter/index'),
        })
      })
      .catch(() => {
        // 取消登录
      })
    return
  }

  // 跳转到指定页面
  console.log('跳转到:', url)
  uni.navigateTo({ url })
}

const onPrivacyContract = () => {
  wx.openPrivacyContract({
    success: (res) => {
      if (res.errMsg === 'openPrivacyContract:ok') {
        console.log('用户已同意隐私协议')
      } else {
        console.log('用户未同意隐私协议')
      }
    },
    fail: (err) => {
      console.error('打开隐私协议失败:', err)
    },
  })
}

onShow(async () => {
  try {
    uni.showLoading({ title: '加载中' })
    const userInfo = await userStore.getUserInfo()
    if (userInfo) {
      const { data } = await checkSponsor()
      isSponsor.value = data.is_sponsor || false
      promoter.value = data.promoter || null
    }
  } finally {
    uni.hideLoading()
  }
})
</script>

<style lang="scss">
body,
page,
.main {
  @apply h-screen overflow-hidden;
  background-image: url(https://mp-img1.wifixc.com/static/images/topBg.png);
  background-size: 100% auto;
  background-position: top center;
  background-repeat: no-repeat;
  background-color: #f7f7f7;
}

.slot-img {
  height: 26px;
  width: 26px;
  overflow: hidden;
}
</style>
