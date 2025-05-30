<template>
  <wd-config-provider :themeVars="themeVars">
    <slot />
    <wd-toast />
    <wd-message-box />
  </wd-config-provider>
</template>

<script lang="ts" setup>
import type { ConfigProviderThemeVars } from 'wot-design-uni'

const themeVars: ConfigProviderThemeVars = {
  colorTheme: '#07c160',
  buttonPrimaryBgColor: '#00B386',
  // buttonPrimaryColor: '#07c160',
}
</script>
