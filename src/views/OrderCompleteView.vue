<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMarketStore } from '../stores/market'

const route = useRoute()
const store = useMarketStore()
const ids = computed(() => String(route.params.ids || '').split(','))
const orders = computed(() => ids.value.map((id) => store.getCustomerOrder(id)).filter(Boolean))
const total = computed(() => orders.value.reduce((sum, order) => sum + order.total, 0))
const formatPrice = (value) => new Intl.NumberFormat('zh-TW').format(value)
</script>

<template>
  <section class="section-space complete-section">
    <div class="container text-center">
      <div class="success-mark"><i class="bi bi-check2"></i></div><p class="eyebrow mt-4">Order received</p><h1 class="display-4">謝謝你支持一份認真的創作。</h1><p class="section-copy mx-auto complete-copy">訂單已經成立，創作者將親自準備你的選物。展示版不會寄送真實郵件或進行扣款。</p>
      <div v-if="orders.length" class="order-receipt text-start mx-auto mt-5"><div class="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 border-bottom"><div><small>訂單編號</small><strong class="d-block">{{ ids.join('、') }}</strong></div><span class="status-pill status-processing">準備中</span></div><div v-for="order in orders" :key="order.id" class="receipt-group"><p>{{ store.getCreator(order.creatorId)?.name }} 將為你出貨</p><div v-for="item in order.items" :key="item.productId" class="receipt-item"><img :src="item.image" :alt="item.name" /><span>{{ item.name }} × {{ item.qty }}</span><strong>NT$ {{ formatPrice(item.price * item.qty) }}</strong></div></div><div class="receipt-total"><span>訂單總額</span><strong>NT$ {{ formatPrice(total) }}</strong></div></div>
      <div class="d-flex flex-wrap justify-content-center gap-3 mt-5"><RouterLink class="btn btn-primary" to="/account/orders">查看我的訂單</RouterLink><RouterLink class="btn btn-outline-ink" to="/products">繼續逛選物</RouterLink></div>
    </div>
  </section>
</template>

<style scoped>
.complete-section { min-height: 75vh; background: radial-gradient(circle at 50% 20%, #e2ecdf 0, #faf7f0 52%); }.success-mark { display: grid; width: 90px; height: 90px; margin: 0 auto; place-items: center; color: white; background: var(--sage-deep); border: 8px solid rgba(113,140,120,.2); border-radius: 50%; background-clip: padding-box; font-size: 2.5rem; }.complete-copy { max-width: 600px; }.order-receipt { max-width: 700px; padding: 2rem; background: var(--paper); border: 1px solid var(--line); border-radius: 24px; box-shadow: var(--shadow); }.receipt-group { padding: 1.2rem 0; border-bottom: 1px solid var(--line); }.receipt-group > p { color: var(--terracotta); font-size: .8rem; font-weight: 700; }.receipt-item { display: grid; grid-template-columns: 50px 1fr auto; align-items: center; gap: .8rem; margin-top: .7rem; font-size: .85rem; }.receipt-item img { width: 50px; height: 50px; object-fit: cover; border-radius: 9px; }.receipt-total { display: flex; justify-content: space-between; align-items: end; padding-top: 1.2rem; }.receipt-total strong { font-family: 'Noto Serif TC', serif; font-size: 1.5rem; }
</style>
