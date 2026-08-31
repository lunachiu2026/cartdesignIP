<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import { useMarketStore } from '../stores/market'

const store = useMarketStore()
const route = useRoute()
const router = useRouter()
const search = ref(route.query.q || '')
const category = ref(route.query.category || '全部')
const sort = ref('featured')
const maxPrice = ref(1500)
const categories = computed(() => ['全部', ...new Set(store.activeProducts.map((item) => item.category))])
const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  const result = store.activeProducts.filter((item) => {
    const creator = store.getCreator(item.creatorId)
    return (!term || `${item.name}${item.description}${creator?.name}`.toLowerCase().includes(term)) &&
      (category.value === '全部' || item.category === category.value) && item.price <= maxPrice.value
  })
  return [...result].sort((a, b) => sort.value === 'priceLow' ? a.price - b.price : sort.value === 'priceHigh' ? b.price - a.price : Number(b.featured) - Number(a.featured))
})

watch([search, category], () => router.replace({ query: { ...(search.value && { q: search.value }), ...(category.value !== '全部' && { category: category.value }) } }))
watch(() => route.query.category, (value) => { category.value = value || '全部' })
</script>

<template>
  <div>
    <section class="listing-header">
      <div class="container py-5"><p class="eyebrow">Curated objects</p><div class="row align-items-end"><div class="col-lg-7"><h1 class="display-4">把喜歡的日常，慢慢收進生活。</h1></div><div class="col-lg-4 ms-auto"><p class="section-copy mb-2">來自獨立創作者的紙品、器物與布作，每一件都有自己的手感與故事。</p></div></div></div>
    </section>
    <section class="section-space pt-5">
      <div class="container">
        <div class="row g-5">
          <aside class="col-lg-3">
            <div class="filter-panel">
              <div class="mb-4"><label class="form-label">搜尋選物</label><div class="input-group"><span class="input-group-text"><i class="bi bi-search"></i></span><input v-model="search" class="form-control" placeholder="商品或創作者" /></div></div>
              <div class="mb-4"><label class="form-label d-block">作品分類</label><button v-for="item in categories" :key="item" class="category-filter" :class="{ active: category === item }" @click="category = item"><span>{{ item }}</span><small>{{ item === '全部' ? store.activeProducts.length : store.activeProducts.filter((p) => p.category === item).length }}</small></button></div>
              <div><label class="form-label d-flex justify-content-between"><span>價格上限</span><span>NT$ {{ maxPrice }}</span></label><input v-model.number="maxPrice" type="range" class="form-range" min="200" max="1500" step="100" /></div>
            </div>
          </aside>
          <div class="col-lg-9">
            <div class="d-flex justify-content-between align-items-center mb-4"><span class="text-secondary">找到 {{ filtered.length }} 件作品</span><select v-model="sort" class="form-select sort-select"><option value="featured">編輯推薦</option><option value="priceLow">價格由低至高</option><option value="priceHigh">價格由高至低</option></select></div>
            <div v-if="filtered.length" class="row g-4"><div v-for="product in filtered" :key="product.id" class="col-6 col-xl-4"><ProductCard :product="product" /></div></div>
            <div v-else class="empty-state"><i class="bi bi-search-heart"></i><h3>暫時找不到合適的作品</h3><p class="text-secondary">試著調整關鍵字、分類或價格範圍。</p><button class="btn btn-outline-ink" @click="search = ''; category = '全部'; maxPrice = 1500">清除篩選</button></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.listing-header { background: #e7eee5; border-bottom: 1px solid var(--line); }.listing-header h1 { line-height: 1.35; }.filter-panel { position: sticky; top: 105px; padding: 1.4rem; background: var(--paper); border: 1px solid var(--line); border-radius: 20px; }.input-group-text { background: var(--paper); border-color: #bdc7c0; border-radius: 12px 0 0 12px; }.input-group .form-control { border-left: 0; }.category-filter { width: 100%; display: flex; justify-content: space-between; padding: .7rem .8rem; border: 0; border-radius: 10px; color: var(--ink-soft); background: transparent; text-align: left; }.category-filter.active { color: var(--ink); background: var(--peach); font-weight: 700; }.category-filter small { display: grid; width: 24px; height: 24px; place-items: center; background: rgba(255,255,255,.7); border-radius: 50%; }.sort-select { width: 180px; padding-top: .55rem; padding-bottom: .55rem; }
@media (max-width: 575.98px) { .filter-panel { position: static; }.sort-select { width: 155px; } }
</style>
