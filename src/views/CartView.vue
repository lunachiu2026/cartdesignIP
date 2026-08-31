<script setup>
import { computed } from 'vue'
import { useMarketStore } from '../stores/market'
const store = useMarketStore()
const formatPrice = (value) => new Intl.NumberFormat('zh-TW').format(value)

function getLineAvailability(line) {
  const availability = store.getProductAvailability(line.product)
  if (availability.purchasable && line.qty > line.product.stock) {
    return { purchasable: false, label: '數量需調整', reason: `目前庫存僅剩 ${line.product.stock} 件。` }
  }
  return availability
}

const unavailableLines = computed(() => store.cartDetails.filter((line) => !getLineAvailability(line).purchasable))
const hasUnavailable = computed(() => unavailableLines.value.length > 0)
</script>

<template>
  <section class="section-space">
    <div class="container">
      <p class="eyebrow">Your selections</p><h1 class="display-4 mb-5">你的選物袋</h1>
      <div v-if="store.cartDetails.length" class="row g-5">
        <div class="col-lg-8">
          <div v-for="line in store.cartDetails" :key="line.productId" class="cart-item" :class="{ unavailable: !getLineAvailability(line).purchasable }">
            <img :src="line.product.image" :alt="line.product.name" />
            <div class="cart-info"><RouterLink :to="`/products/${line.product.id}`" class="cart-name">{{ line.product.name }}</RouterLink><span>{{ store.getCreator(line.product.creatorId)?.name }}</span><div v-if="!getLineAvailability(line).purchasable" class="line-unavailable" role="status"><strong>{{ getLineAvailability(line).label || '暫停販售' }}</strong><span>{{ getLineAvailability(line).reason }}</span></div><button type="button" @click="store.removeFromCart(line.productId)"><i class="bi bi-trash3" aria-hidden="true"></i> 移除</button></div>
            <div class="cart-price">NT$ {{ formatPrice(line.product.price) }}</div>
            <div class="qty-small" role="group" :aria-label="`${line.product.name} 數量`"><button type="button" :disabled="!store.isProductPurchasable(line.product) || line.qty <= 1" aria-label="減少數量" @click="store.setCartQty(line.productId, line.qty - 1)">−</button><span>{{ line.qty }}</span><button type="button" :disabled="!store.isProductPurchasable(line.product) || line.qty >= line.product.stock" aria-label="增加數量" @click="store.setCartQty(line.productId, line.qty + 1)">＋</button></div>
            <strong class="cart-total">NT$ {{ formatPrice(line.lineTotal) }}</strong>
          </div>
          <RouterLink class="continue-link" to="/products"><i class="bi bi-arrow-left"></i> 繼續逛選物</RouterLink>
        </div>
        <div class="col-lg-4">
          <div class="summary-card"><p class="eyebrow">Order summary</p><h2>訂單摘要</h2><div v-if="hasUnavailable" class="cart-warning" role="alert"><i class="bi bi-exclamation-triangle" aria-hidden="true"></i><span><strong>選物袋中有目前無法購買的商品</strong>請移除暫停販售的商品或調整數量後再結帳。</span></div><div class="summary-row"><span>商品小計</span><strong>NT$ {{ formatPrice(store.cartSubtotal) }}</strong></div><div class="summary-row"><span>運費</span><span>依創作者分別計算</span></div><p class="shipping-note"><i class="bi bi-info-circle"></i> 同一創作者商品滿 NT$ 1,000 免運</p><div class="summary-total"><span>預估金額</span><strong>NT$ {{ formatPrice(store.cartSubtotal) }}</strong></div><RouterLink v-if="!hasUnavailable" class="btn btn-accent w-100 mt-4" to="/checkout">前往結帳 <i class="bi bi-arrow-right ms-1"></i></RouterLink><button v-else class="btn btn-accent w-100 mt-4" type="button" disabled title="請先處理無法購買的商品">暫時無法結帳 <i class="bi bi-lock ms-1" aria-hidden="true"></i></button><div class="safe-note"><i class="bi bi-shield-check"></i> 個人資料僅用於本次訂單配送</div></div>
        </div>
      </div>
      <div v-else class="empty-cart"><div class="empty-bag"><i class="bi bi-bag"></i></div><h2>選物袋還是空的</h2><p>慢慢逛，總會遇見想帶回日常的作品。</p><RouterLink class="btn btn-primary mt-3" to="/products">去看看今日選物</RouterLink></div>
    </div>
  </section>
</template>

<style scoped>
.cart-item.unavailable { margin-inline: -.8rem; padding-inline: .8rem; background: rgba(248, 215, 218, .28); border-radius: 14px; }
.cart-info > span { color: var(--terracotta); font-size: .78rem; }
.line-unavailable { display: flex; flex-direction: column; width: fit-content; margin: .15rem 0; padding: .35rem .55rem; color: #842029; background: #f8d7da; border-radius: 8px; font-size: .72rem; }
.cart-info .line-unavailable span { color: inherit; font-size: .68rem; }
.qty-small button:disabled { color: #9ca19e; cursor: not-allowed; }
.cart-warning { display: flex; align-items: flex-start; gap: .6rem; padding: .8rem; color: #842029; background: #f8d7da; border: 1px solid #f1aeb5; border-radius: 10px; font-size: .76rem; }
.cart-warning span { display: flex; flex-direction: column; gap: .2rem; }
.cart-item { display: grid; grid-template-columns: 100px 1fr auto auto auto; align-items: center; gap: 1.2rem; padding: 1.3rem 0; border-bottom: 1px solid var(--line); }.cart-item > img { width: 100px; height: 100px; object-fit: cover; border-radius: 16px; }.cart-info { display: flex; flex-direction: column; gap: .3rem; }.cart-name { font-family: 'Noto Serif TC', serif; font-weight: 700; }.cart-info span { color: var(--terracotta); font-size: .78rem; }.cart-info button { width: max-content; padding: 0; border: 0; color: #8b8f8c; background: transparent; font-size: .76rem; }.cart-price, .cart-total { font-size: .9rem; white-space: nowrap; }.qty-small { display: flex; align-items: center; border: 1px solid var(--line); border-radius: 999px; }.qty-small button { width: 30px; height: 32px; border: 0; background: transparent; }.qty-small span { width: 25px; text-align: center; font-size: .85rem; }.continue-link { display: inline-block; margin-top: 2rem; color: var(--terracotta); font-weight: 700; }.summary-card { position: sticky; top: 105px; padding: 2rem; background: #eee7da; border: 1px solid #d9cfbf; border-radius: 24px; }.summary-card h2 { margin-bottom: 2rem; }.summary-row { display: flex; justify-content: space-between; margin: 1rem 0; color: var(--ink-soft); font-size: .9rem; }.shipping-note { padding: .7rem; background: rgba(255,255,255,.55); border-radius: 10px; color: var(--ink-soft); font-size: .75rem; }.summary-total { display: flex; justify-content: space-between; align-items: end; padding-top: 1.2rem; border-top: 1px solid #c8beaf; }.summary-total strong { font-family: 'Noto Serif TC', serif; font-size: 1.5rem; }.safe-note { margin-top: 1.2rem; color: var(--ink-soft); text-align: center; font-size: .72rem; }.empty-cart { padding: 4rem 1rem 7rem; text-align: center; }.empty-cart p { color: var(--ink-soft); }.empty-bag { display: grid; width: 100px; height: 100px; margin: 0 auto 1.5rem; place-items: center; background: var(--sage); border-radius: 50% 50% 16px 50%; font-size: 2.5rem; }
@media (max-width: 767.98px) { .cart-item { grid-template-columns: 80px 1fr auto; gap: .8rem; }.cart-item > img { width: 80px; height: 80px; }.cart-price { display: none; }.qty-small { grid-column: 2; width: max-content; }.cart-total { grid-column: 3; grid-row: 2; }.summary-card { position: static; } }
</style>
