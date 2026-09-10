<script setup>
import { reactive, ref } from 'vue'
import { useMarketStore } from '../../stores/market'
import { resolveBannerImage } from '../../utils/bannerImage'

const store = useMarketStore()
const homeSlides = reactive(store.banners.homeSlides.map((slide) => ({ ...slide, enabled: Boolean(slide.image) })))
const storySlides = reactive(store.banners.storySlides.map((slide) => ({ ...slide, enabled: Boolean(slide.image) })))
const errors = reactive({})
const saved = ref('')

async function prepareBannerImage(file) {
  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('read-error'))
    reader.readAsDataURL(file)
  })
  const image = await new Promise((resolve, reject) => {
    const element = new Image()
    element.onload = () => resolve(element)
    element.onerror = () => reject(new Error('image-error'))
    element.src = source
  })
  const scale = Math.min(1, 1280 / image.naturalWidth, 720 / image.naturalHeight)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/webp', .74)
}

async function handleImageFile(event, target, errorKey) {
  const file = event.target.files?.[0]
  errors[errorKey] = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    errors[errorKey] = '請選擇圖片檔案。'
    event.target.value = ''
    return
  }
  if (file.size > 8 * 1024 * 1024) {
    errors[errorKey] = '圖片檔案請控制在 8MB 以內。'
    event.target.value = ''
    return
  }
  try {
    target.image = await prepareBannerImage(file)
    if (['home', 'story'].includes(errorKey)) target.enabled = true
    saved.value = ''
  } catch {
    errors[errorKey] = '圖片無法讀取，請重新選擇 JPG、PNG 或 WebP 圖片。'
  } finally {
    event.target.value = ''
  }
}

function clearCarouselSlide(slide) {
  slide.image = ''
  slide.enabled = false
  slide.fit = 'cover'
  slide.position = 'center'
  saved.value = ''
}

function carouselSlideStyle(slide) {
  return {
    backgroundImage: `url(${resolveBannerImage(slide.image)})`,
    backgroundSize: slide.fit === 'contain' ? 'contain' : 'cover',
    backgroundPosition: slide.position || 'center',
  }
}

function isValidImage(value) {
  if (value.startsWith('data:image/') || (value.startsWith('/') && !value.startsWith('//'))) return true
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

function saveHomeSlides() {
  errors.home = ''
  saved.value = ''
  for (const [index, slide] of homeSlides.entries()) {
    if (slide.enabled && !slide.image.trim()) {
      errors.home = `第 ${index + 1} 張已啟用，請先設定圖片。`
      return
    }
    if (slide.image && !isValidImage(slide.image.trim())) {
      errors.home = `第 ${index + 1} 張的圖片網址無效。`
      return
    }
  }
  if (!store.saveHomeBanners(homeSlides)) {
    errors.home = '無法儲存首頁輪播。'
    return
  }
  saved.value = 'home'
}

function saveStorySlides() {
  errors.story = ''
  saved.value = ''
  for (const [index, slide] of storySlides.entries()) {
    if (slide.image && !isValidImage(slide.image.trim())) {
      errors.story = `第 ${index + 1} 張的圖片無效。`
      return
    }
  }
  if (!store.saveStoryBanners(storySlides)) {
    errors.story = '無法儲存關於集所輪播。'
    return
  }
  saved.value = 'story'
}
</script>

<template>
  <section>
    <div class="mb-4">
      <p class="eyebrow mb-2">Advertising</p>
      <h1 class="dashboard-title">廣告版位管理</h1>
      <p class="dashboard-subtitle mb-0">設定首頁與「關於集所」區段的輪播圖片。</p>
    </div>

    <div class="row g-4">
      <div class="col-12">
        <form class="panel" novalidate @submit.prevent="saveHomeSlides">
          <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
            <div>
              <h2 class="h5 mb-1">首頁輪播 Banner</h2>
              <p class="small text-secondary mb-0">最多 8 張；儲存後會立即同步前台，並每 5 秒自動輪播。</p>
            </div>
          </div>

          <div class="row g-3">
            <div v-for="(slide, index) in homeSlides" :key="index" class="col-12 col-xl-6">
              <article class="slide-card h-100">
                <div v-if="slide.image" class="slide-thumbnail" :style="carouselSlideStyle(slide)"></div>
                <div v-else class="slide-thumbnail slide-thumbnail-empty"><i class="bi bi-image"></i></div>
                <div class="slide-card-meta">
                  <strong>輪播圖片 {{ index + 1 }}</strong>
                  <button v-if="slide.image" class="btn btn-sm btn-outline-danger" type="button" @click="clearCarouselSlide(slide)"><i class="bi bi-trash3 me-1"></i>刪除圖片</button>
                  <template v-else>
                    <label class="btn btn-sm btn-outline-ink mb-0" :for="`home-empty-slide-file-${index}`"><i class="bi bi-plus-lg me-1"></i>新增圖片</label>
                    <input :id="`home-empty-slide-file-${index}`" class="visually-hidden" type="file" accept="image/*" @change="handleImageFile($event, slide, 'home')">
                  </template>
                </div>
              </article>
            </div>
          </div>
          <p v-if="errors.home" class="text-danger small mt-3 mb-0">{{ errors.home }}</p>
          <div v-if="saved === 'home'" class="alert alert-success py-2 mt-3 mb-0" role="status">首頁輪播已儲存。</div>
          <button class="btn btn-accent w-100 mt-4" type="submit">儲存首頁 8 張輪播</button>
        </form>
      </div>

      <div class="col-12">
        <form class="panel" novalidate @submit.prevent="saveStorySlides">
          <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
            <div>
              <h2 class="h5 mb-1">關於集所輪播</h2>
              <p class="small text-secondary mb-0">管理首頁「關於集所」區段的圖片，最多 8 張。</p>
            </div>
          </div>

          <div class="row g-3">
            <div v-for="(slide, index) in storySlides" :key="index" class="col-12 col-xl-6">
              <article class="slide-card h-100">
                <div v-if="slide.image" class="slide-thumbnail" :style="carouselSlideStyle(slide)"></div>
                <div v-else class="slide-thumbnail slide-thumbnail-empty"><i class="bi bi-image"></i></div>
                <div class="slide-card-meta">
                  <strong>輪播圖片 {{ index + 1 }}</strong>
                  <button v-if="slide.image" class="btn btn-sm btn-outline-danger" type="button" @click="clearCarouselSlide(slide)"><i class="bi bi-trash3 me-1"></i>刪除圖片</button>
                  <template v-else>
                    <label class="btn btn-sm btn-outline-ink mb-0" :for="`story-empty-slide-file-${index}`"><i class="bi bi-plus-lg me-1"></i>新增圖片</label>
                    <input :id="`story-empty-slide-file-${index}`" class="visually-hidden" type="file" accept="image/*" @change="handleImageFile($event, slide, 'story')">
                  </template>
                </div>
              </article>
            </div>
          </div>
          <p v-if="errors.story" class="text-danger small mt-3 mb-0">{{ errors.story }}</p>
          <div v-if="saved === 'story'" class="alert alert-success py-2 mt-3 mb-0" role="status">關於集所輪播已儲存。</div>
          <button class="btn btn-accent w-100 mt-4" type="submit">儲存關於集所輪播</button>
        </form>
      </div>

    </div>
  </section>
</template>

<style scoped>
.slide-card { display: flex; align-items: center; gap: 1rem; padding: .75rem; background: var(--cream); border: 1px solid var(--line); border-radius: 16px; }
.slide-card-meta { display: flex; flex: 1; justify-content: space-between; align-items: center; gap: .75rem; }
.slide-thumbnail { flex: 0 0 96px; width: 96px; aspect-ratio: 16 / 9; background-color: var(--paper); background-repeat: no-repeat; border: 1px solid var(--line); border-radius: 8px; }
.slide-thumbnail-empty { display: grid; place-items: center; color: var(--ink-soft); border-style: dashed; }
@media (max-width: 575.98px) { .slide-thumbnail { flex-basis: 76px; width: 76px; }.slide-card-meta { align-items: flex-start; flex-direction: column; } }
</style>
