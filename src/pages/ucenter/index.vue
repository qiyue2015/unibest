<route lang="json5">
  {
    style: {
      navigationBarTitleText: '我的',
    },
  }
</route>
<!-- needLogin: true, -->
    <template>
      <view class="bg-white overflow-hidden">
        <wd-tabs v-model="tab" sticky>
          <block v-for="item in tabs" :key="item">
            <wd-tab :title="item">
              <view class="content text-center">内容{{ item}}</view>
            </wd-tab>
          </block>
        </wd-tabs>
      </view>
    </template>
    
    <script lang="ts" setup>
    import { useUserStore } from '@/store'
    
    defineOptions({
      name: 'Ucenter',
    })
    
    const userStore = useUserStore()
    
    const tab = ref<number>(0)
    const tabs = ref(['全部', '待回复', '已回复', '已关闭'])

    onLoad(() => {
      console.log('项目作者:')
    })
    </script>
    
    <style>
    .main-title-color {
      color: #d14328;
    }
    </style>
    