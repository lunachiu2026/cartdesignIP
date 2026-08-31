<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import { useMarketStore } from '../stores/market'

const route = useRoute()
const router = useRouter()
const store = useMarketStore()
const product = computed(() => store.activeProducts.find((item) => item.id === route.params.id))
const creator = computed(() => product.value ? store.getCreator(product.value.creatorId) : null)
const availability = computed(() => product.value ? store.getProductAvailability(product.value) : null)
const purchasable = computed(() => product.value ? store.isProductPurchasable(product.value) : false)
const pauseReason = computed(() => availability.value?.reason || availability.value?.label || '這件作品目前暫停販售。')
const selectedImage = ref(0)
const qty = ref(1)
const added = ref(false)
const related = computed(() => store.activeProducts.filter((item) => item.id !== product.value?.id && (item.creatorId === product.value?.creatorId || item.category === product.value?.category)).slice(0, 3))
const formatPrice = (value) => new Intl.NumberFormat('zh-TW').format(value)

function add() {
  if (!purchasable.value) return
  store.addToCart(product.value.id, qty.value)
  added.value = true
  window.setTimeout(() => { added.value = false }, 1800)
}
</script>

<template>
  <div v-if="product">
    <section class="section-space product-detail">
      <div class="container">
        <nav class="small text-secondary mb-4"><RouterLink to="/products">所有選物</RouterLink><span class="mx-2">/</span><span>{{ product.category }}</span></nav>
        <div class="row g-5">
          <div class="col-lg-6">
            <div class="main-product-image"><img :src="product.images?.[selectedImage] || product.image" :alt="product.name" /></div>
            <div v-if="product.images?.length > 1" class="d-flex gap-3 mt-3"><button v-for="(image, index) in product.images" :key="image" class="thumb-button" :class="{ active: selectedImage === index }" @click="selectedImage = index"><img :src="image" alt="商品其他角度" /></button></div>
          </div>
          <div class="col-lg-5 offset-lg-1">
            <RouterLink class="creator-chip" :to="`/creators/${creator.id}`"><img :src="creator.avatar" alt="" /><span>{{ creator.name }}</span><i class="bi bi-arrow-up-right"></i></RouterLink>
            <h1 class="product-heading mt-4">{{ product.name }}</h1>
            <div class="d-flex align-items-center gap-3 mt-3"><span class="stars">★★★★★</span><small class="text-secondary">4.9（24 則收藏心得）</small></div>
            <div class="detail-price mt-4">NT$ {{ formatPrice(product.price) }}</div>
            <p class="section-copy py-4 border-top border-bottom mt-4">{{ product.description }}</p>
            <div v-if="purchasable" class="d-flex align-items-center gap-2 mb-4"><i class="bi bi-box2-heart text-success"></i><span class="small">尚有 {{ product.stock }} 件，由 {{ creator.name }} 親自包裝寄出</span></div>
            <div v-else class="availability-notice mb-4" role="status"><i class="bi bi-pause-circle" aria-hidden="true"></i><span><strong>暫停販售</strong>{{ pauseReason }}</span></div>
            <div class="d-flex gap-3 flex-wrap">
              <div class="qty-control" :class="{ disabled: !purchasable }" role="group" aria-label="商品數量"><button type="button" :disabled="!purchasable || qty <= 1" aria-label="減少數量" @click="qty = Math.max(1, qty - 1)">−</button><span>{{ qty }}</span><button type="button" :disabled="!purchasable || qty >= product.stock" aria-label="增加數量" @click="qty = Math.min(product.stock, qty + 1)">＋</button></div>
              <button class="btn btn-accent flex-grow-1" type="button" :disabled="!purchasable" :title="purchasable ? '放入選物袋' : pauseReason" @click="add"><i :class="purchasable ? (added ? 'bi bi-check2' : 'bi bi-bag-plus') : 'bi bi-bag-x'" class="me-2" aria-hidden="true"></i>{{ purchasable ? (added ? '已放入選物袋' : '放入選物袋') : '暫停販售' }}</button>
            </div>
            <button class="btn btn-link text-secondary w-100 mt-2" @click="router.push('/cart')">直接前往選物袋</button>
            <div class="detail-notes mt-4"><span><i class="bi bi-truck"></i> 滿 NT$ 1,000 免運</span><span><i class="bi bi-shield-check"></i> 七日安心鑑賞</span></div>
          </div>
        </div>
      </div>
    </section>
    <section v-if="related.length" class="section-space section-soft"><div class="container"><div class="d-flex justify-content-between mb-4"><div><p class="eyebrow">You may also like</p><h2>再看看這些作品</h2></div><RouterLink :to="`/creators/${creator.id}`" class="text-link align-self-end">走進品牌頁 <i class="bi bi-arrow-right"></i></RouterLink></div><div class="row g-4"><div v-for="item in related" :key="item.id" class="col-6 col-lg-4"><ProductCard :product="item" /></div></div></div></section>
  </div>
  <div v-else class="empty-state section-space"><i class="bi bi-box-seam"></i><h1>找不到這件作品</h1><RouterLink class="btn btn-primary mt-3" to="/products">回到所有選物</RouterLink></div>
</template>

<style scoped>
.availability-notice { display: flex; align-items: flex-start; gap: .7rem; padding: .9rem 1rem; color: #842029; background: #f8d7da; border: 1px solid #f1aeb5; border-radius: 12px; }.availability-notice i { margin-top: .15rem; }.availability-notice span { display: flex; flex-direction: column; gap: .2rem; font-size: .85rem; }.qty-control.disabled { border-color: #a6aaa8; color: #747a77; background: #e4e4df; }.qty-control button:disabled { color: #8c918e; cursor: not-allowed; }
.main-product-image { aspect-ratio: 1; overflow: hidden; background: #ece8df; border-radius: 40% 40% 18px 18px; }.main-product-image img { width: 100%; height: 100%; object-fit: cover; }.thumb-button { width: 90px; height: 75px; padding: 3px; overflow: hidden; border: 1px solid var(--line); border-radius: 12px; background: white; }.thumb-button.active { border: 2px solid var(--terracotta); }.thumb-button img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }.creator-chip { display: inline-flex; align-items: center; gap: .6rem; color: var(--terracotta); font-weight: 700; }.creator-chip img { width: 38px; height: 38px; object-fit: cover; border-radius: 50%; }.product-heading { font-size: clamp(2.1rem, 4vw, 3.8rem); line-height: 1.3; }.stars { color: var(--gold); letter-spacing: .12em; }.detail-price { font-family: 'Noto Serif TC', serif; font-size: 1.8rem; font-weight: 700; }.qty-control { display: flex; align-items: center; border: 1px solid var(--ink); border-radius: 999px; }.qty-control button { width: 42px; border: 0; background: transparent; }.qty-control span { width: 38px; text-align: center; }.detail-notes { display: flex; flex-wrap: wrap; gap: 1rem; color: var(--ink-soft); font-size: .82rem; }.detail-notes i { margin-right: .3rem; color: var(--sage-deep); }.text-link { color: var(--terracotta); font-weight: 700; }
</style>
