<route lang="json5">
{
  style: {
    navigationBarTitleText: '帮助中心',
  },
}
</route>

<template>
  <view>
    <wd-img
      src="/static/images/help-qrcode-1.png"
      preview-src="/static/images/help-qrcode-2.png"
      mode="widthFix"
      width="100%"
      height="100%"
      enable-preview
    />
  </view>
</template>

<style lang="scss">
body,
page,
.main {
  @apply h-screen overflow-hidden;
}
</style>
