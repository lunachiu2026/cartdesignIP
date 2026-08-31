<script setup>
import { computed } from 'vue'
import { useMarketStore } from '../stores/market'

const props = defineProps({ product: { type: Object, required: true } })
const store = useMarketStore()
const creator = computed(() => store.getCreator(props.product.creatorId))
const availability = computed(() => store.getProductAvailability(props.product))
const purchasable = computed(() => store.isProductPurchasable(props.product))
const addButtonTitle = computed(() => purchasable.value
  ? '加入選物袋'
  : `暫停販售${availability.value.reason ? `：${availability.value.reason}` : ''}`)
const formatPrice = (value) => new Intl.NumberFormat('zh-TW').format(value)

function addToCart() {
  if (purchasable.value) store.addToCart(props.product.id)
}
</script>

<template>
  <article class="product-card h-100">
    <RouterLink class="product-image-wrap" :to="`/products/${product.id}`">
      <img :src="product.image" :alt="product.name" class="product-image" />
      <span v-if="!purchasable" class="card-note paused-note">暫停販售</span>
      <span v-else-if="product.featured" class="card-note">本週精選</span>
    </RouterLink>
    <div class="product-card-body">
      <RouterLink class="creator-name" :to="`/creators/${creator?.id}`">{{ creator?.name }}</RouterLink>
      <RouterLink class="product-title" :to="`/products/${product.id}`">{{ product.name }}</RouterLink>
      <div class="d-flex justify-content-between align-items-center mt-auto pt-3">
        <strong class="product-price">NT$ {{ formatPrice(product.price) }}</strong>
        <button class="round-add" type="button" :disabled="!purchasable" :title="addButtonTitle" :aria-label="addButtonTitle" @click="addToCart">
          <i :class="purchasable ? 'bi bi-plus-lg' : 'bi bi-bag-x'" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.paused-note { color: #842029; background: #f8d7da; }
.round-add:disabled { border-color: #a6aaa8; color: #747a77; background: #e4e4df; cursor: not-allowed; }
</style>
