<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import { useMarketStore } from '../stores/market'

const store = useMarketStore()
const route = useRoute()
const featured = computed(() => store.activeProducts.filter((item) => item.featured).slice(0, 4))
const approvedCreators = computed(() => store.creators.filter((item) => item.status === 'approved').slice(0, 3))

onMounted(() => {
  if (route.query.section) document.getElementById(route.query.section)?.scrollIntoView({ behavior: 'smooth' })
})
</script>

<template>
  <div>
    <section class="hero-section">
      <div class="hero-orbit orbit-one"></div>
      <div class="hero-orbit orbit-two"></div>
      <div class="container position-relative">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <p class="eyebrow mb-3">Made slowly, kept dearly</p>
            <h1 class="hero-title">讓手作的微光，<br />落進你的日常。</h1>
            <p class="hero-copy mt-4">匯集紙品、陶藝與生活布作，認識作品背後的創作者，挑一件能陪你很久的物件。</p>
            <div class="d-flex flex-wrap gap-3 mt-4">
              <RouterLink class="btn btn-primary px-4" to="/products">開始逛選物</RouterLink>
              <RouterLink class="btn btn-outline-ink px-4" to="/creator/register">成為創作者</RouterLink>
            </div>
            <div class="hero-proof mt-5">
              <div><strong>30+</strong><span>島嶼品牌</span></div>
              <div><strong>180</strong><span>手作選物</span></div>
              <div><strong>4.9</strong><span>平均評價</span></div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="hero-collage">
              <img class="hero-main-image" src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1100&q=85" alt="文創工作桌與紙品" />
              <div class="floating-note"><i class="bi bi-flower1"></i><span>本月主題</span><strong>採集春日</strong></div>
              <img class="hero-small-image" src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=500&q=85" alt="手作陶杯" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="marquee-strip" aria-label="平台特色">
      <div class="container d-flex flex-wrap justify-content-center gap-4 gap-md-5">
        <span><i class="bi bi-patch-check"></i> 創作者實名審核</span>
        <span><i class="bi bi-box2-heart"></i> 安心包裝出貨</span>
        <span><i class="bi bi-chat-heart"></i> 直接支持創作</span>
        <span><i class="bi bi-arrow-repeat"></i> 友善循環材料</span>
      </div>
    </section>

    <section class="section-space">
      <div class="container">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-5">
          <div><p class="eyebrow">Editor's picks</p><h2 class="section-title mb-0">編輯選物</h2></div>
          <RouterLink class="text-link" to="/products">看所有作品 <i class="bi bi-arrow-right"></i></RouterLink>
        </div>
        <div class="row g-4">
          <div v-for="product in featured" :key="product.id" class="col-6 col-lg-3"><ProductCard :product="product" /></div>
        </div>
      </div>
    </section>

    <section id="story" class="section-space story-section">
      <div class="container">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <div class="story-image-wrap">
              <img src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1100&q=85" alt="創作者正在手作" />
              <span class="story-caption">一雙手，一段慢慢成形的故事。</span>
            </div>
          </div>
          <div class="col-lg-5 offset-lg-1">
            <p class="eyebrow">Why Muguang</p>
            <h2 class="section-title">我們不只販售作品，也珍惜創作的來處。</h2>
            <p class="section-copy mt-4">每一件選物都標示創作者與品牌故事。你帶回家的不只是一件商品，也是對獨立創作最直接的支持。</p>
            <div class="story-points mt-4">
              <div><span>01</span><p><strong>真實創作</strong><br />平台審核品牌與商品，保留作品原創價值。</p></div>
              <div><span>02</span><p><strong>友善日常</strong><br />優先選擇可長久使用與低包裝負擔的物件。</p></div>
              <div><span>03</span><p><strong>讓光被看見</strong><br />提供簡單好用的後台，讓創作者專注做好作品。</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="creators" class="section-space creator-section">
      <div class="container">
        <div class="text-center mb-5"><p class="eyebrow">Meet the makers</p><h2 class="section-title">本月創作者</h2><p class="section-copy">順著作品，去認識幾雙認真生活的手。</p></div>
        <div class="row g-4 justify-content-center">
          <div v-for="creator in approvedCreators" :key="creator.id" class="col-md-6 col-lg-4">
            <RouterLink class="creator-feature-card" :to="`/creators/${creator.id}`">
              <img :src="creator.cover" :alt="creator.name" />
              <div class="creator-feature-content">
                <img :src="creator.avatar" alt="" class="creator-avatar" />
                <div><small>{{ creator.category }}</small><h3>{{ creator.name }}</h3><p>{{ creator.bio }}</p></div>
                <span class="arrow-circle"><i class="bi bi-arrow-up-right"></i></span>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <section class="creator-cta">
      <div class="container py-5">
        <div class="row align-items-center g-4">
          <div class="col-lg-8"><p class="eyebrow text-white-50">For creators</p><h2>你的作品，值得一個好好說故事的地方。</h2><p>建立品牌頁、刊登商品、管理訂單，從今天開始被更多人看見。</p></div>
          <div class="col-lg-4 text-lg-end"><RouterLink class="btn btn-light px-4" to="/creator/register">加入暮光集所</RouterLink></div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-section { position: relative; overflow: hidden; padding: 7rem 0 6rem; background: linear-gradient(130deg, #f8f1e8 0%, #edf1e7 100%); }
.hero-title { max-width: 660px; font-size: clamp(3rem, 6.3vw, 5.6rem); line-height: 1.22; letter-spacing: -.04em; }
.hero-copy { max-width: 560px; color: var(--ink-soft); font-size: 1.08rem; line-height: 1.9; }
.hero-proof { display: flex; gap: 2rem; }
.hero-proof div { display: flex; flex-direction: column; }
.hero-proof strong { font-family: 'Noto Serif TC', serif; font-size: 1.35rem; }
.hero-proof span { color: var(--ink-soft); font-size: .75rem; }
.hero-collage { position: relative; min-height: 560px; }
.hero-main-image { width: 85%; height: 500px; margin-left: 8%; object-fit: cover; border-radius: 48% 48% 18px 18px; box-shadow: var(--shadow); }
.hero-small-image { position: absolute; right: 0; bottom: 0; width: 34%; aspect-ratio: 1; object-fit: cover; border: 8px solid var(--cream); border-radius: 50%; }
.floating-note { position: absolute; left: 0; bottom: 60px; display: grid; min-width: 160px; padding: 1rem; background: var(--paper); border-radius: 16px; box-shadow: var(--shadow); }
.floating-note i { color: var(--terracotta); font-size: 1.3rem; }.floating-note span { color: var(--ink-soft); font-size: .7rem; }.floating-note strong { font-family: 'Noto Serif TC', serif; }
.hero-orbit { position: absolute; border: 1px solid rgba(113, 140, 120, .28); border-radius: 50%; }.orbit-one { top: -240px; right: -100px; width: 700px; height: 700px; }.orbit-two { bottom: -350px; left: -260px; width: 650px; height: 650px; }
.marquee-strip { padding: 1.2rem 0; color: white; background: var(--ink); font-size: .85rem; }.marquee-strip i { color: #bfd2bc; margin-right: .35rem; }
.text-link { color: var(--terracotta); font-weight: 700; }
.story-section { background: #ece7dd; }.story-image-wrap { position: relative; }.story-image-wrap img { width: 100%; height: 650px; object-fit: cover; border-radius: 220px 220px 22px 22px; }.story-caption { position: absolute; right: -25px; bottom: 35px; max-width: 230px; padding: 1rem 1.2rem; background: var(--paper); border-radius: 12px; box-shadow: var(--shadow); font-family: 'Noto Serif TC', serif; }
.story-points > div { display: flex; gap: 1rem; margin-top: 1rem; }.story-points span { display: grid; flex: 0 0 42px; place-items: center; height: 42px; border: 1px solid var(--ink); border-radius: 50%; font-size: .72rem; }.story-points p { margin: 0; color: var(--ink-soft); line-height: 1.65; }.story-points strong { color: var(--ink); }
.creator-section { background: var(--paper); }.creator-feature-card { display: block; overflow: hidden; border: 1px solid var(--line); border-radius: 24px; background: var(--cream); transition: transform .25s ease; }.creator-feature-card:hover { transform: translateY(-5px); }.creator-feature-card > img { width: 100%; height: 230px; object-fit: cover; }.creator-feature-content { position: relative; padding: 3rem 1.4rem 1.5rem; }.creator-avatar { position: absolute; top: -36px; left: 1.4rem; width: 70px; height: 70px; object-fit: cover; border: 5px solid var(--cream); border-radius: 50%; }.creator-feature-content small { color: var(--terracotta); }.creator-feature-content h3 { margin: .25rem 0 .65rem; font-size: 1.35rem; }.creator-feature-content p { min-height: 48px; color: var(--ink-soft); font-size: .84rem; line-height: 1.7; }.arrow-circle { position: absolute; right: 1.4rem; bottom: 1.4rem; display: grid; width: 38px; height: 38px; place-items: center; border: 1px solid var(--ink); border-radius: 50%; }
.creator-cta { color: white; background: var(--terracotta); }.creator-cta h2 { font-size: clamp(1.8rem, 4vw, 3rem); }.creator-cta p { margin-bottom: 0; color: rgba(255,255,255,.78); }
@media (max-width: 991.98px) { .hero-section { padding-top: 5rem; }.hero-collage { min-height: 440px; }.hero-main-image { height: 400px; }.story-image-wrap img { height: 500px; }.story-caption { right: 15px; } }
@media (max-width: 575.98px) { .hero-proof { gap: 1rem; justify-content: space-between; }.hero-collage { min-height: 360px; }.hero-main-image { height: 330px; }.floating-note { left: 5px; bottom: 20px; }.story-image-wrap img { height: 420px; }.creator-feature-card > img { height: 190px; } }
</style>
