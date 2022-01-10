<script setup lang='ts'>
const showSettings = useState('settings', () => false)
const toggleSettings = useToggle(showSettings)
</script>

<template>
  <button class="!outline-none" @click="toggleSettings()">
    <div class="i-carbon-settings" />
  </button>
</template>
