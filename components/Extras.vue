<script setup lang='ts'>
import { useProductStore } from '~~/stores/store'

const productStore = useProductStore()
const showSettings = useState('settings', () => false)
const connected = useState('ws-connected', () => false)
const logs = computed(() => productStore.logs)

</script>

<template>
  <div v-if="showSettings">
    <p class="text-xs">
      WS Connected: {{ connected }}
    </p>

    <br><br>

    <div v-for="log in logs">
      <p class="text-blue-800 dark:text-blue-500 text-xs">
        {{ log }}
      </p>
    </div>
  </div>
  <div v-else />
</template>
