<route lang="json5">
    {
      style: {
        navigationStyle: 'custom',
        navigationBarTitleText: '用户登陆',
      }
    }
</route>

<script lang="ts" setup>
import { useAppStore, useUserStore } from '@/store'
import { bindPhone, getUserinfo } from '@/api/user'

const appStore = useAppStore()
const userStore = useUserStore()

const setting = computed(() => appStore.accountInfo)
const userInfo = computed(() => userStore.userInfo)

const loading = ref(true)

// 绑定手机号
const onBindPhone = async ({ code }) => {
    try {
        wx.showLoading({ title: '登录中', mask: true })
        await bindPhone(code)
        const { data } = await getUserinfo()
        userStore.setUserInfo(data)
        uni.switchTab({
            url: '/pages/index/index'
        });
    } finally {
        wx.hideLoading()
    }
}

const onLogin = async () => {
    uni.switchTab({
        url: '/pages/index/index'
    });
}

onLoad(async () => {
    try {
        loading.value = true
        await userStore.getUserInfo()
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <view class="w-full h-screen overflow-hidden flex items-end bg-image"
        :style="{ backgroundImage: setting?.home_bg ? `url(${setting?.home_bg})` : '' }">
        <view v-if="!loading" class="w-64 mb-20 mx-auto gap-lg">
            <!-- <wd-button
                :loading="loading" 
                open-type="getRealtimePhoneNumber" 
                size="large" 
                block
                @getrealtimephonenumber="bindPhone"
            >
                手机号实时验证组件
            </wd-button> -->
            <!-- <wd-button
                :loading="loading" 
                open-type="getPhoneNumber" 
                size="large" 
                block
                @getphonenumber="onBindPhone"
            >
                手机号快速验证组件
            </wd-button> -->
            <!-- 已绑定手机 -->
            <template v-if="userInfo.mobile">
                <wd-button :loading="loading" size="large" block @click="onLogin">进入</wd-button>
            </template>
            <template v-else>
                <wd-button :loading="loading" open-type="getPhoneNumber" size="large" block @getphonenumber="onBindPhone">授权登陆</wd-button>
                <!-- <wd-button :loading="loading" open-type="getRealtimePhoneNumber" size="large" block @getrealtimephonenumber="onBindPhone">
                    授权登陆
                </wd-button> -->
            </template>
        </view>
    </view>
</template>

<style>
.bg-image {
    background-repeat: no-repeat;
    background-position: center bottom;
    background-size: cover;
}
</style>