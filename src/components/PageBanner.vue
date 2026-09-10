<script setup>
import { computed } from 'vue'
import { resolveBannerImage } from '../utils/bannerImage'

const props = defineProps({
  banner: { type: Object, default: () => ({}) },
  imageOnly: { type: Boolean, default: false },
})

const bannerStyle = computed(() => ({
  backgroundImage: props.imageOnly
    ? `url(${resolveBannerImage(props.banner.image)})`
    : `linear-gradient(90deg, rgba(23, 35, 29, .82), rgba(23, 35, 29, .25)), url(${resolveBannerImage(props.banner.image)})`,
  backgroundPosition: props.banner.position || 'center',
  backgroundSize: props.banner.fit === 'contain' ? 'contain' : 'cover',
}))
</script>

<template>
  <section v-if="banner.enabled && banner.image" class="page-ad-banner" :class="{ 'image-only': imageOnly }" :style="bannerStyle">
    <div v-if="!imageOnly" class="container py-5">
      <div class="banner-copy">
        <p class="eyebrow text-white-50 mb-2">Featured</p>
        <h2 v-if="banner.title">{{ banner.title }}</h2>
        <p v-if="banner.description">{{ banner.description }}</p>
        <RouterLink v-if="banner.link?.startsWith('/') && banner.buttonLabel" class="btn btn-light mt-3" :to="banner.link">{{ banner.buttonLabel }}</RouterLink>
        <a v-else-if="banner.link && banner.buttonLabel" class="btn btn-light mt-3" :href="banner.link" target="_blank" rel="noopener noreferrer">{{ banner.buttonLabel }}</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-ad-banner { min-height: 300px; display: flex; align-items: center; color: white; background-color: var(--paper); background-repeat: no-repeat; }
.banner-copy { max-width: 620px; }
.banner-copy h2 { margin: 0; color: white; font-size: clamp(2rem, 5vw, 3.6rem); line-height: 1.25; }
.banner-copy > p:not(.eyebrow) { max-width: 540px; margin: 1rem 0 0; color: rgba(255,255,255,.82); line-height: 1.8; }
@media (max-width: 575.98px) { .page-ad-banner { min-height: 260px; } }
</style>
