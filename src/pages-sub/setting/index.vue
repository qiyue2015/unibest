<route lang="json5">
{
  needLogin: true,
  style: {
    navigationBarTitleText: '个人信息',
    backgroundColor: '#f5f5f5',
  },
}
</route>

<template>
  <view class="min-h-screen bg-[#f5f5f5] flex flex-col gap-2">
    <!-- #ifdef MP-WEIXIN -->
    <xc-privacy-popup></xc-privacy-popup>
    <!-- #endif -->
    <wd-cell-group border>
      <wd-cell title="头像" custom-class="cell-class" center is-link>
        <view class="relative h-8 overflow-hidden">
          <view
            class="w-8 h-8 rounded-full overflow-hidden absolute top-0 right-0 z-36"
            style="--wot-button-primary-bg-color: transparent"
          >
            <wd-button open-type="chooseAvatar" :round="false" @chooseavatar="onChooseAvatar" />
          </view>
          <view class="inline-flex w-8 h-8 bg-gray rounded-full overflow-hidden">
            <wd-img :src="userInfo.avatar" custom-class="custom-avatar"></wd-img>
          </view>
        </view>
      </wd-cell>
      <wd-cell title="昵称" custom-class="cell-class" :value="fromData.nickname" center is-link @click="onNickname" />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { useMessage, useToast } from 'wot-design-uni'
import { useUserStore } from '@/store'
import { updateUserinfo, uploadAvatarBase64 } from '@/api/user'
import { ref, computed, reactive } from 'vue'

const toast = useToast()
const message = useMessage()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const fromData = reactive({
  avatar: userInfo.value.avatar,
  nickname: userInfo.value.nickname,
})

const loading = ref(false)

const onChooseAvatar = async (e) => {
  try {
    // 微信小程序端上传头像
    // #ifdef MP-WEIXIN
    // 对临时图片链接进行base64编码
    var base64Str = 'data:image/jpeg;base64,' + wx.getFileSystemManager().readFileSync(e.avatarUrl, 'base64')
    const response = await uploadAvatarBase64(base64Str)
    if (response?.errno === 0) {
      fromData.avatar = base64Str
      userStore.setUserInfo({ ...userInfo.value, avatar: base64Str })
      toast.show('头像已更新')
    } else {
      toast.show(response?.message || '头像上传失败，请稍后重试')
    }
    // #endif
  } catch (error) {
    toast.show('头像上传失败，请稍后重试')
    wx.getFileSystemManager().unlinkSync(e.avatarUrl)
  } finally {
    loading.value = false
  }
}

const onNickname = () => {
  message
    .prompt({
      title: '修改昵称',
      inputPlaceholder: '请填写您的昵称',
      inputType: 'nickname',
    })
    .then((resp) => {
      if (resp.action === 'confirm') {
        fromData.nickname = String(resp.value)
        updateUserinfo({ nickname: fromData.nickname })
          .then((res) => {
            if (res && res.errno === 0) {
              userStore.info()
              toast.show('昵称已更新')
            } else {
              toast.show((res && res.message) || '昵称更新失败，请稍后重试')
            }
          })
          .catch(() => {
            toast.show('昵称更新失败，请稍后重试')
          })
      }
    })
    .catch((error) => {
      console.log(error)
    })
}
</script>
<style lang="scss">
:deep(.cell-class) {
  .wd-cell__right {
    height: 36px;
    line-height: 36px;
  }
  .wd-cell__body {
    @apply items-center;
  }
}

.custom-avatar {
  @apply w-full h-full object-cover;
}
</style>
