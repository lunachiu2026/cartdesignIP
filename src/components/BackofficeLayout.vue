<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '../stores/market'

const props = defineProps({ role: { type: String, required: true } })
const store = useMarketStore()
const router = useRouter()
const open = ref(false)
const isAdmin = computed(() => props.role === 'admin')
const displayName = computed(() => isAdmin.value ? '暮光管理員' : store.currentCreator?.name)
const links = computed(() => {
  if (isAdmin.value) return [
    { to: '/admin/dashboard', icon: 'grid', label: '總覽' },
    { to: '/admin/creators', icon: 'people', label: '創作者管理' },
    { to: '/admin/products', icon: 'box-seam', label: '全站商品' },
    { to: '/admin/categories', icon: 'tags', label: '分類管理' },
    { to: '/admin/orders', icon: 'receipt', label: '全站訂單' },
  ]
  if (store.currentCreator?.status !== 'approved') return [
    { to: '/creator/onboarding', icon: 'signpost-split', label: '合作進度' },
    { to: '/creator/subscription', icon: 'credit-card', label: '訂閱與付款' },
    { to: '/creator/profile', icon: 'shop', label: '品牌資料' },
  ]
  const creatorLinks = [
    { to: '/creator/dashboard', icon: 'grid', label: '工作室總覽' },
    { to: '/creator/products', icon: 'box-seam', label: '我的商品' },
  ]
  if (store.canCreatorPublish(store.currentCreator.id)) creatorLinks.push({ to: '/creator/products/new', icon: 'plus-circle', label: '新增商品' })
  creatorLinks.push(
    { to: '/creator/orders', icon: 'receipt', label: '訂單管理' },
    { to: '/creator/subscription', icon: 'credit-card', label: '訂閱與付款' },
    { to: '/creator/profile', icon: 'shop', label: '品牌設定' },
  )
  return creatorLinks
})

function logout() {
  store.backofficeLogout()
  router.push(isAdmin.value ? '/muguang/admin' : '/')
}
</script>

<template>
  <div class="backoffice-shell">
    <aside class="backoffice-sidebar" :class="{ show: open }">
      <div class="d-flex justify-content-between align-items-center mb-5">
        <RouterLink class="brand-mark" to="/">
          <span class="brand-seal">暮</span><span>暮光集所</span>
        </RouterLink>
        <button class="d-lg-none btn-close" aria-label="關閉" @click="open = false"></button>
      </div>
      <p class="sidebar-label">{{ isAdmin ? '平台營運中心' : '創作者工作室' }}</p>
      <nav class="sidebar-nav">
        <RouterLink v-for="link in links" :key="link.to" :to="link.to" @click="open = false">
          <i :class="`bi bi-${link.icon}`"></i>{{ link.label }}
        </RouterLink>
      </nav>
      <div class="sidebar-help mt-auto">
        <i class="bi bi-lightbulb"></i>
        <strong>需要協助嗎？</strong>
        <span>hello@muguang.tw</span>
      </div>
    </aside>
    <div class="backoffice-main">
      <header class="backoffice-topbar">
        <button class="btn d-lg-none p-0" type="button" @click="open = true"><i class="bi bi-list fs-2"></i></button>
        <div class="ms-auto d-flex align-items-center gap-3">
          <RouterLink to="/" class="topbar-site-link"><i class="bi bi-arrow-up-right"></i> 前往商店</RouterLink>
          <span class="avatar-mini">{{ displayName?.slice(0, 1) }}</span>
          <span class="d-none d-sm-inline fw-semibold">{{ displayName }}</span>
          <button class="btn btn-link logout-link" @click="logout">登出</button>
        </div>
      </header>
      <main class="backoffice-content"><RouterView /></main>
    </div>
  </div>
</template>
