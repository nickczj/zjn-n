<script setup lang='ts'>
const showSettings = useState('settings', () => false)
const connected = useState('ws-connected', () => false)
</script>

<template>
  <div v-if="showSettings">
    <p class="text-light-50 text-xs">
      WS Connected: {{ connected }}
    </p>
  </div>
  <div v-else />
</template>
