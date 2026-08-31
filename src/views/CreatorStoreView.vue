<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import { useMarketStore } from '../stores/market'

const route = useRoute()
const store = useMarketStore()
const creator = computed(() => {
  const item = store.getCreator(route.params.id)
  return item?.status === 'approved' ? item : null
})
const creatorProducts = computed(() => store.activeProducts.filter((item) => item.creatorId === route.params.id))
</script>

<template>
  <div v-if="creator">
    <section class="creator-cover" :style="{ backgroundImage: `linear-gradient(90deg, rgba(28,45,36,.82), rgba(28,45,36,.25)), url(${creator.cover})` }">
      <div class="container creator-cover-content"><img :src="creator.avatar" :alt="creator.name" /><p class="eyebrow text-white-50">Maker story</p><h1>{{ creator.name }}</h1><p>{{ creator.bio }}</p><div class="d-flex gap-3 small"><span><i class="bi bi-patch-check"></i> 集所認證創作者</span><span><i class="bi bi-grid"></i> {{ creatorProducts.length }} 件作品</span></div></div>
    </section>
    <section class="section-space"><div class="container"><div class="row"><div class="col-lg-3"><p class="eyebrow">About the maker</p><h2 class="h3">關於 {{ creator.owner }}</h2><p class="section-copy mt-3">從材質與日常裡採集靈感，以雙手反覆試驗，讓每件作品保留細微而真實的差異。</p><div class="maker-tag mt-4">{{ creator.category }}</div></div><div class="col-lg-8 offset-lg-1 mt-5 mt-lg-0"><h2 class="mb-4">工作室選物</h2><div v-if="creatorProducts.length" class="row g-4"><div v-for="product in creatorProducts" :key="product.id" class="col-6 col-md-4"><ProductCard :product="product" /></div></div><div v-else class="empty-state"><i class="bi bi-brush"></i><p>創作者正在準備新作品。</p></div></div></div></div></section>
  </div>
  <div v-else class="empty-state section-space"><i class="bi bi-person-x"></i><h1>找不到這位創作者</h1><RouterLink class="btn btn-primary mt-3" to="/">回到首頁</RouterLink></div>
</template>

<style scoped>
.creator-cover { min-height: 590px; display: flex; align-items: end; padding: 7rem 0 5rem; color: white; background-position: center; background-size: cover; }.creator-cover-content { max-width: 1180px; }.creator-cover-content > img { width: 100px; height: 100px; margin-bottom: 1.5rem; object-fit: cover; border: 6px solid rgba(255,255,255,.78); border-radius: 50%; }.creator-cover h1 { font-size: clamp(3rem, 6vw, 5rem); }.creator-cover p:not(.eyebrow) { max-width: 600px; color: rgba(255,255,255,.84); font-size: 1.05rem; line-height: 1.8; }.maker-tag { display: inline-block; padding: .5rem .8rem; background: var(--peach); border-radius: 999px; font-size: .8rem; font-weight: 700; }
</style>
