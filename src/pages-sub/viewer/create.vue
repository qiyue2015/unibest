<route lang="json5">
{
  needLogin: true,
  style: {
    navigationBarTitleText: '观演人信息',
  },
}
</route>

<script lang="ts" setup>
import { deleteViewer, saveViewer, updateViewer } from '@/api/viewer'
import { useMessage, useToast } from 'wot-design-uni'
import { FormRules } from 'wot-design-uni/components/wd-form/types'

const toast = useToast()
const message = useMessage()

// 基本信息，带ID的为不可编辑
const isEditable = ref(false)
// 有的信息带ID但是没有手机号，这种情况是需要单独编辑手机号
const isMobileEditable = ref(false)
// 不允许编辑的情况
const formDisabled = computed(() => isEditable.value && isMobileEditable.value)

const viewerId = ref<string | undefined>(undefined)
const formRef = ref()
const formData = reactive({ realname: '', idcard: '', mobile: undefined })

// 新增时的校验规则
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
  mobile: [
    { required: true, message: '请输入手机号码' },
    { required: false, message: '手机号码格式不正确', validator: (val) => /^1[3-9]\d{9}$/.test(val) },
  ],
}

// 只校验手机号
const mobileRules: FormRules = {
  mobile: [
    { required: !isMobileEditable, message: '请输入手机号码' },
    { required: false, message: '手机号码格式不正确', validator: (val) => /^1[3-9]\d{9}$/.test(val) },
  ],
}

const handleSubmit = () => {
  formRef.value.validate().then(async ({ valid }) => {
    if (valid) {
      try {
        toast.loading({ msg: '保存中...', duration: 0 })
        if (viewerId.value) {
          await updateViewer(viewerId.value, formData)
        } else {
          await saveViewer(formData)
        }
        toast.success({
          msg: '保存成功',
          duration: 1000,
          closed() {
            uni.navigateBack({ delta: 1 })
            uni.$emit('updateViewer', formData) // 通知其他页面更新观演人信息
          },
        })
      } catch {
        toast.close()
      }
    }
  })
}

// 删除
const onDeleteViewer = async (id: string) => {
  message
    .confirm({
      title: '删除确认',
      msg: '确定要删除该观演人信息吗？删除后将无法恢复。',
    })
    .then(async () => {
      try {
        toast.loading({ msg: '删除中...', duration: 0 })
        await deleteViewer(id)
        toast.success({
          msg: '删除成功',
          duration: 1000,
          closed() {
            uni.navigateBack({ delta: 1 })
          },
        })
      } catch {
        toast.close()
        uni.navigateBack({ delta: 1 })
      }
    })
    .catch(() => {
      console.log('点击了取消按钮')
    })
}

// 获取页面传参
onLoad(({ viewer }) => {
  if (viewer) {
    const parsedViewer = JSON.parse(decodeURIComponent(viewer))
    viewerId.value = parsedViewer.id
    isEditable.value = !!parsedViewer.id
    isMobileEditable.value = !!parsedViewer.mobile
    Object.assign(formData, {
      realname: parsedViewer.realname || '',
      idcard: parsedViewer.idcard || '',
      mobile: parsedViewer.mobile || undefined,
    })
  }
})
</script>

<template>
  <view class="min-h-screen relative m-4">
    <wd-form
      ref="formRef"
      :model="formData"
      :rules="viewerId ? mobileRules : formRules"
      error-type="toast"
      @submit="handleSubmit"
    >
      <view class="flex flex-col gap-4">
        <view class="rounded-xl overflow-hidden">
          <wd-cell-group title="观演人信息" border>
            <template #value>
              <text v-if="viewerId" class="text-red" @click="onDeleteViewer(viewerId)">删除</text>
            </template>
            <wd-input
              v-model="formData.realname"
              :readonly="isEditable"
              label="真实姓名"
              label-width="5.6em"
              size="large"
              prop="realname"
              clearable
              placeholder="请填写观演人真实姓名"
            />
            <wd-input
              v-model="formData.idcard"
              :readonly="isEditable"
              label="身份证号"
              label-width="5.6em"
              size="large"
              prop="idcard"
              clearable
              placeholder="请填写观演人身份证号码"
            />
          </wd-cell-group>
        </view>

        <view class="rounded-xl overflow-hidden">
          <wd-cell-group title="联系方式" border>
            <wd-input
              v-model="formData.mobile"
              :readonly="formDisabled"
              label="手机号码"
              label-width="5.6em"
              size="large"
              prop="mobile"
              clearable
              type="tel"
              placeholder="请填写观演人手机号码"
            />
            <wd-cell custom-class="custom-cell-class" size="large" center>
              <template #label>
                <text class="text-size-xs text-red">请填写观演人手机号码，用于电子门票查询与核验。</text>
              </template>
            </wd-cell>
          </wd-cell-group>
        </view>

        <view class="rounded-xl overflow-hidden bg-white text-gray-500">
          <wd-cell-group title="温馨提示">
            <view class="px-4 pb-2 text-size-sm">
              <view class="mb-2">
                根据相关法律及防疫要求，购票需实名制。我们会严格保护您的姓名和身份证信息，仅用于出票、入场核验及应急调查。为确保信息真实有效，我们可能会通过权威渠道进行验证。
              </view>
            </view>
          </wd-cell-group>
        </view>
      </view>
      <view v-if="!formDisabled" class="mx-4 fixed left-0 right-0 bottom-0 z-10 safe-area-inset-bottom">
        <wd-button type="primary" size="large" block @click="handleSubmit">保存</wd-button>
      </view>
    </wd-form>
  </view>
</template>

<style lang="scss">
.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

:deep(.wd-cell.custom-cell-class) {
  .wd-cell__right {
    flex: none;
  }
}
</style>
