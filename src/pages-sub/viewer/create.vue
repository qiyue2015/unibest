<route lang="json5">
{
  needLogin: true,
  style: {
    navigationBarTitleText: '观演人信息',
  },
}
</route>

<script lang="ts" setup>
import { saveViewer } from '@/api/viewer'
import { useToast } from 'wot-design-uni'
import { FormRules } from 'wot-design-uni/components/wd-form/types'

const toast = useToast()

const formData = reactive({ realname: '', idcard: '' })

const formRules: FormRules = {
  realname: [{ required: true, message: '请输入真实姓名' }],
  idcard: [
    { required: true, message: '请输入身份证号' },
    {
      required: false,
      message: '身份证号格式不正确',
      validator: (val) => {
        return /^[1-9]\d{5}(18|19|20)?\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}(\d|X)$/.test(val)
      },
    },
  ],
}

const formRef = ref()
const handleSubmit = () => {
  formRef.value.validate().then(async ({ valid, errors }) => {
    if (valid) {
      try {
        toast.loading({ msg: '保存中...', duration: 0 })
        await saveViewer(formData)
        toast.success({
          msg: '保存成功',
          duration: 1000,
          closed: () => uni.navigateBack(),
        })
      } catch (error) {
        toast.error(error.message)
      }
    }
  })
}
</script>

<template>
  <view class="min-h-screen relative">
    <wd-form ref="formRef" :model="formData" :rules="formRules" error-type="toast" @submit="handleSubmit">
      <view class="m-4 rounded-xl overflow-hidden">
        <wd-cell-group border>
          <wd-input
            label="真实姓名"
            label-width="5.6em"
            size="large"
            prop="realname"
            clearable
            v-model="formData.realname"
            placeholder="请填写观演人真实姓名"
          />
          <wd-input
            label="身份证号"
            label-width="5.6em"
            size="large"
            prop="idcard"
            clearable
            v-model="formData.idcard"
            placeholder="请填写观演人身份证号码"
          />
        </wd-cell-group>
      </view>

      <view class="m-4 rounded-xl overflow-hidden bg-white text-gray-500">
        <wd-cell-group title="温馨提示">
          <view class="px-4 pb-2 text-size-sm">
            <view class="mb-2">
              根据相关法律及防疫要求，购票需实名制。我们会严格保护您的姓名和身份证信息，仅用于出票、入场核验及应急调查。为确保信息真实有效，我们可能会通过权威渠道进行验证。
            </view>
          </view>
        </wd-cell-group>
      </view>
      <view class="mx-4 fixed left-0 right-0 bottom-0 z-10 safe-area-inset-bottom">
        <wd-button type="primary" size="large" block @click="handleSubmit">保存</wd-button>
      </view>
    </wd-form>
  </view>
</template>

<style lang="scss">
.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
