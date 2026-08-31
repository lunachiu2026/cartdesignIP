<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import { useMarketStore } from './stores/market'

const route = useRoute()
const store = useMarketStore()
store.initialize()

const isBackoffice = computed(() => route.meta.layout === 'backoffice')
const isAuth = computed(() => route.meta.layout === 'auth')

watch(
  () => route.fullPath,
  () => window.scrollTo({ top: 0, behavior: 'smooth' }),
)
</script>

<template>
  <div class="app-shell">
    <SiteHeader v-if="!isBackoffice && !isAuth" />
    <main :class="{ 'public-main': !isBackoffice && !isAuth }">
      <RouterView />
    </main>
    <SiteFooter v-if="!isBackoffice && !isAuth" />
  </div>
</template>
