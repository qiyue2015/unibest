<template>
  <view></view>
</template>

<script setup lang="ts">
import { useToast } from 'wot-design-uni'
import { getPayResult, payOrder } from '@/api/app'

const toast = useToast()

// 支付失败/取消支付返回上一页
const onFail = (message: string) => {
  toast.success({
    msg: message,
    duration: 1000,
    closed: () => {
      uni.navigateBack({
        delta: 1, // 返回上一页
      })
    },
  })
}

onLoad(async (options) => {
  try {
    const { data } = await payOrder(options.tid)
    wx.requestPayment({
      timeStamp: data.timeStamp,
      nonceStr: data.nonceStr,
      package: data.package,
      signType: data.signType,
      paySign: data.paySign,
      success() {
        toast.success({
          msg: '支付成功',
          duration: 1000,
          closed() {
            uni.reLaunch({
              url: `/pages/order/detail?tid=${options.tid}`,
            })
          },
        })
        // 获取支付结果
        // getPayResult(options.tid).then((res) => {
        //   console.log('支付结果:', res)
        //   toast.success({
        //     msg: '支付成功',
        //     duration: 1000,
        //     closed() {
        //       uni.reLaunch({
        //         url: `/pages/order/detail?tid=${options.tid}`,
        //       })
        //     },
        //   })
        // })
      },
      fail() {
        onFail('支付失败，请稍后再试')
      },
    })
  } catch (error) {
    onFail('支付失败，请稍后再试')
  }
})
</script>
