/* eslint-disable @typescript-eslint/no-var-requires */
const { existsSync, mkdirSync, writeFileSync } = require('fs')
const { join, relative } = require('path')

// 读取 JSON 文件
const homeList = require('../src/data/homeList.json')

// 基础路径配置
const BASE_DIR = join(__dirname, '..')

// 将驼峰式组件名转换为短横线式
function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

// Demo 页面模板
const DEMO_TEMPLATE = (category, component) => {
  const kebabComponent = toKebabCase(component.id)
  return `<route lang="json5" type="page">
{
  style: {
    navigationBarTitleText: '${component.name}',
    disableScroll: true,
  },
}
</route>

<template>
  <view class="page-container">
    <view class="p-10">
      <view class="text-xl mb-4">${category.name}</view>
      <view class="text-sm text-justify">${component.name} 组件示例</view>
    </view>
    <view class="px-4">
      <!-- 组件示例将在这里展示 -->
      <!--
      <wd-${kebabComponent}></wd-${kebabComponent}>
      -->
    </view>
  </view>
</template>

<script lang="ts" setup>
//
</script>

<style lang="scss" scoped>
//
</style>
`
}

// 主生成函数
async function generateDemos() {
  try {
    console.log('🚀 开始生成 Demo 页面...')

    // 遍历所有分类
    for (const category of homeList) {
      const categoryDir = join(BASE_DIR, 'src/pages-' + category.id)

      console.log(`\n🔍 处理分类: ${category.name} - ${categoryDir}`)

      // 创建分类目录
      if (!existsSync(categoryDir)) {
        mkdirSync(categoryDir)
        console.log(`📁 创建分类目录: ${relative(BASE_DIR, categoryDir)}`)
      }

      // 遍历组件
      for (const component of category.pages) {
        const componentDir = join(categoryDir, component.id)
        const kebabComponentDir = toKebabCase(componentDir)
        const componentFile = join(kebabComponentDir, 'index.vue')

        // 创建组件目录
        if (!existsSync(kebabComponentDir)) {
          mkdirSync(kebabComponentDir)
        }

        // 仅当文件不存在时才创建
        if (!existsSync(componentFile)) {
          writeFileSync(componentFile, DEMO_TEMPLATE(category, component))
          console.log(`✅ 生成: ${relative(BASE_DIR, componentFile)}`)
        } else {
          console.log(`⏩ 跳过已存在: ${relative(BASE_DIR, componentFile)}`)
        }
      }
    }

    console.log('🎉 Demo 页面生成完成！')
  } catch (error) {
    console.error('❌ 生成失败:', error)
    process.exit(1)
  }
}

// 执行生成
generateDemos()
