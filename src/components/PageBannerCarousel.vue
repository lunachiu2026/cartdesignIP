<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import PageBanner from './PageBanner.vue'

const props = defineProps({
  banners: { type: Array, default: () => [] },
  embedded: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false },
})
const activeIndex = ref(0)
const paused = ref(false)
let timer = null

const activeBanners = computed(() => props.banners.filter((banner) => banner.enabled && banner.image))
const activeBanner = computed(() => activeBanners.value[activeIndex.value])

function goTo(index) {
  activeIndex.value = index
}

function next() {
  if (activeBanners.value.length > 1 && !paused.value) activeIndex.value = (activeIndex.value + 1) % activeBanners.value.length
}

watch(() => activeBanners.value.length, (length) => {
  if (!length || activeIndex.value >= length) activeIndex.value = 0
})

onMounted(() => { timer = window.setInterval(next, 5000) })
onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <section v-if="activeBanner" class="banner-carousel" :class="{ embedded, 'full-width': fullWidth }" aria-label="首頁廣告輪播" @mouseenter="paused = true" @mouseleave="paused = false" @focusin="paused = true" @focusout="paused = false">
    <Transition name="banner-fade" mode="out-in">
      <PageBanner :key="`${activeIndex}-${activeBanner.image}`" :banner="activeBanner" image-only />
    </Transition>
    <div v-if="activeBanners.length > 1" class="carousel-controls" aria-label="選擇輪播圖片">
      <button v-for="(_, index) in activeBanners" :key="index" type="button" :class="{ active: index === activeIndex }" :aria-label="`顯示第 ${index + 1} 張 Banner`" :aria-current="index === activeIndex ? 'true' : undefined" @click="goTo(index)"></button>
    </div>
  </section>
</template>

<style scoped>
.banner-carousel { position: relative; overflow: hidden; background: var(--ink); }
.banner-carousel.embedded { aspect-ratio: 16 / 9; background: transparent; border-radius: 0; box-shadow: none; }
.banner-carousel.full-width { width: 100%; aspect-ratio: 21 / 9; }
.banner-carousel.embedded :deep(.page-ad-banner) { width: 100%; height: 100%; min-height: 0; }
.carousel-controls { position: absolute; z-index: 2; right: 0; bottom: 1rem; left: 0; display: flex; justify-content: center; gap: .55rem; }
.carousel-controls button { width: 9px; height: 9px; padding: 0; background: rgba(255,255,255,.48); border: 0; border-radius: 999px; transition: width .2s, background .2s; }
.carousel-controls button.active { width: 28px; background: white; }
.banner-fade-enter-active, .banner-fade-leave-active { transition: opacity .35s ease; }
.banner-fade-enter-from, .banner-fade-leave-to { opacity: 0; }
@media (max-width: 767.98px) { .banner-carousel.full-width { min-height: 620px; aspect-ratio: auto; } }
</style>
