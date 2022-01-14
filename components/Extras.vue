<script setup lang='ts'>
import { useProductStore } from '~~/stores/store'

const productStore = useProductStore()

const showSettings = useState('settings', () => false)
const connected = useState('ws-connected', () => false)

const productText = ref('')
const unwatch = watch(toRef(productStore, 'products'), async(_a, _b) => {
  productText.value = JSON.stringify(productStore.products, null, 2)
  unwatch()
})

const logs = computed(() => productStore.logs)

const onSubmit = () => productStore.updateProductsFromConfig(JSON.parse(productText.value))

</script>

<template>
  <div v-if="showSettings">
    <p class="text-xs">
      WS Connected: {{ connected }}
    </p>

    <br>

    <form @submit.prevent="onSubmit">
      <div>
        <textarea v-model="productText" cols="50" rows="20" class="text-xs text-dark-800"></textarea>
      </div>
      <div>
        <button class="button px-6 py-2 bg-blue-500 font-medium text-sm hover:bg-blue-600 text-blue-100 rounded">
          Submit
        </button>
      </div>
    </form>

    <br>

    <div v-for="log in logs">
      <p class="text-blue-800 dark:text-blue-500 text-xs">
        {{ log }}
      </p>
    </div>
  </div>
  <div v-else />
</template>
