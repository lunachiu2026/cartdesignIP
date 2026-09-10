<script setup>
import { computed } from 'vue'
import { useMarketStore } from '../stores/market'

const store = useMarketStore()
const returnTo = computed(() => store.backofficeSession?.role === 'admin' ? '/admin/dashboard' : '/creator/dashboard')
const returnLabel = computed(() => store.backofficeSession?.role === 'admin' ? '返回管理後台' : '返回創作者工作室')
</script>

<template>
  <section class="panel empty-state text-center mx-auto" style="max-width: 560px">
    <i class="bi bi-shield-lock"></i>
    <h1 class="h4 mt-3">無法存取此後台</h1>
    <p class="text-secondary mb-4">你的帳號沒有平台管理後台的存取權限。</p>
    <RouterLink class="btn btn-accent" :to="returnTo">{{ returnLabel }}</RouterLink>
  </section>
</template>
