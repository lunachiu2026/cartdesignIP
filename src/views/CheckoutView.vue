<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '../stores/market'

const store = useMarketStore()
const router = useRouter()
const submitted = ref(false)
const processing = ref(false)
const payment = ref('信用卡')
const customer = reactive({
  name: store.currentCustomer?.name || '',
  email: store.currentCustomer?.email || '',
  phone: store.currentCustomer?.phone || '',
  city: store.currentCustomer?.city || '',
  address: store.currentCustomer?.address || '',
  note: '',
})
const shipping = computed(() => {
  const groups = store.cartDetails.reduce((result, line) => {
    result[line.product.creatorId] = (result[line.product.creatorId] || 0) + line.lineTotal
    return result
  }, {})
  return Object.values(groups).reduce((total, subtotal) => total + (subtotal >= 1000 ? 0 : 80), 0)
})
const grandTotal = computed(() => store.cartSubtotal + shipping.value)
const valid = computed(() => customer.name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) && customer.phone && customer.city && customer.address)
const unavailableLines = computed(() => store.cartDetails.filter((line) => !store.isProductPurchasable(line.product) || line.qty > line.product.stock))
const hasUnavailable = computed(() => unavailableLines.value.length > 0)
const formatPrice = (value) => new Intl.NumberFormat('zh-TW').format(value)

function unavailableReason(line) {
  if (line.qty > line.product.stock && store.isProductPurchasable(line.product)) return `目前庫存僅剩 ${line.product.stock} 件。`
  const availability = store.getProductAvailability(line.product)
  return availability.reason || availability.label || '這件作品目前暫停販售。'
}

function submit() {
  submitted.value = true
  if (!valid.value || !store.cartDetails.length || hasUnavailable.value) return
  processing.value = true
  window.setTimeout(() => {
    if (!store.cartDetails.length || hasUnavailable.value) {
      processing.value = false
      return
    }
    const ids = store.placeOrder({ ...customer, address: `${customer.city}${customer.address}` }, payment.value)
    if (ids.length) router.push(`/order-complete/${ids.join(',')}`)
    else processing.value = false
  }, 650)
}
</script>

<template>
  <section class="checkout-section section-space">
    <div class="container">
      <div class="checkout-steps mb-5"><span class="done">1 選物袋</span><i class="bi bi-chevron-right"></i><span class="active">2 填寫資料</span><i class="bi bi-chevron-right"></i><span>3 完成訂單</span></div>
      <div v-if="store.cartDetails.length && !hasUnavailable" class="row g-5">
        <div class="col-lg-7">
          <p class="eyebrow">Checkout</p><h1 class="display-5 mb-4">填寫收件資料</h1>
          <form class="checkout-form" novalidate @submit.prevent="submit">
            <div class="form-section"><h2><span>01</span> 聯絡資訊</h2><div class="row g-3"><div class="col-md-6"><label class="form-label">收件人姓名 *</label><input v-model.trim="customer.name" class="form-control" :class="{ 'is-invalid': submitted && !customer.name }" /><div class="invalid-feedback">請填寫收件人姓名</div></div><div class="col-md-6"><label class="form-label">手機號碼 *</label><input v-model.trim="customer.phone" class="form-control" :class="{ 'is-invalid': submitted && !customer.phone }" placeholder="09xx-xxx-xxx" /><div class="invalid-feedback">請填寫手機號碼</div></div><div class="col-12"><label class="form-label">電子信箱 *</label><input v-model.trim="customer.email" type="email" class="form-control" :class="{ 'is-invalid': submitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) }" /><div class="invalid-feedback">請輸入有效的電子信箱</div></div></div></div>
            <div class="form-section"><h2><span>02</span> 配送地址</h2><div class="row g-3"><div class="col-md-4"><label class="form-label">縣市 *</label><select v-model="customer.city" class="form-select" :class="{ 'is-invalid': submitted && !customer.city }"><option value="" disabled>請選擇</option><option>台北市</option><option>新北市</option><option>桃園市</option><option>台中市</option><option>台南市</option><option>高雄市</option><option>其他縣市</option></select><div class="invalid-feedback">請選擇縣市</div></div><div class="col-md-8"><label class="form-label">詳細地址 *</label><input v-model.trim="customer.address" class="form-control" :class="{ 'is-invalid': submitted && !customer.address }" /><div class="invalid-feedback">請填寫配送地址</div></div><div class="col-12"><label class="form-label">給創作者的話（選填）</label><textarea v-model="customer.note" class="form-control" rows="3" placeholder="例如：希望簡約包裝、送禮用途"></textarea></div></div></div>
            <div class="form-section"><h2><span>03</span> 付款方式</h2><div class="payment-options"><label :class="{ selected: payment === '信用卡' }"><input v-model="payment" type="radio" value="信用卡" /><i class="bi bi-credit-card"></i><span><strong>信用卡</strong><small>展示版不會收取真實款項</small></span></label><label :class="{ selected: payment === 'ATM 轉帳' }"><input v-model="payment" type="radio" value="ATM 轉帳" /><i class="bi bi-bank"></i><span><strong>ATM 轉帳</strong><small>訂單成立後顯示轉帳資訊</small></span></label></div></div>
          </form>
        </div>
        <div class="col-lg-4 offset-lg-1">
           <div class="checkout-summary"><h2>這次帶回</h2><div v-for="line in store.cartDetails" :key="line.productId" class="checkout-item"><div class="position-relative"><img :src="line.product.image" :alt="line.product.name" /><span>{{ line.qty }}</span></div><p>{{ line.product.name }}<small>{{ store.getCreator(line.product.creatorId)?.name }}</small></p><strong>NT$ {{ formatPrice(line.lineTotal) }}</strong></div><div class="summary-line"><span>商品小計</span><span>NT$ {{ formatPrice(store.cartSubtotal) }}</span></div><div class="summary-line"><span>運費</span><span>{{ shipping ? `NT$ ${formatPrice(shipping)}` : '免運' }}</span></div><div class="grand-total"><span>應付金額</span><strong>NT$ {{ formatPrice(grandTotal) }}</strong></div><button class="btn btn-accent w-100 mt-4" type="button" :disabled="processing" @click="submit"><span v-if="processing" class="spinner-border spinner-border-sm me-2"></span>{{ processing ? '正在建立訂單' : '確認送出訂單' }}</button><p class="privacy-note"><i class="bi bi-lock"></i> 送出即代表同意展示版交易流程，本頁不會傳送任何真實付款資訊。</p></div>
        </div>
      </div>
      <div v-else-if="hasUnavailable" class="empty-state checkout-blocked" role="alert"><i class="bi bi-exclamation-triangle"></i><h2>選物袋內容目前無法結帳</h2><p>以下商品已暫停販售或數量需要調整，訂單尚未送出。</p><ul><li v-for="line in unavailableLines" :key="line.productId"><strong>{{ line.product.name }}</strong><span>{{ unavailableReason(line) }}</span></li></ul><RouterLink class="btn btn-primary mt-3" to="/cart">回到選物袋處理</RouterLink></div>
      <div v-else class="empty-state"><i class="bi bi-bag-x"></i><h2>沒有可以結帳的商品</h2><RouterLink class="btn btn-primary mt-3" to="/products">回到選物頁</RouterLink></div>
    </div>
  </section>
</template>

<style scoped>
.checkout-blocked { max-width: 620px; margin: 0 auto; padding: 3rem 1.5rem; }
.checkout-blocked > p { color: var(--ink-soft); }
.checkout-blocked ul { display: grid; gap: .7rem; max-width: 480px; margin: 1.5rem auto 0; padding: 0; list-style: none; text-align: left; }
.checkout-blocked li { display: flex; flex-direction: column; padding: .8rem 1rem; color: #842029; background: #f8d7da; border: 1px solid #f1aeb5; border-radius: 10px; }
.checkout-blocked li span { margin-top: .15rem; font-size: .8rem; }
.checkout-section { background: #f3f0e8; }.checkout-steps { display: flex; justify-content: center; align-items: center; gap: 1rem; color: #9aa39e; font-size: .8rem; }.checkout-steps .active { color: var(--terracotta); font-weight: 700; }.checkout-steps .done { color: var(--ink); }.form-section { margin-bottom: 1.5rem; padding: 1.7rem; background: var(--paper); border: 1px solid var(--line); border-radius: 20px; }.form-section h2 { margin-bottom: 1.4rem; font-size: 1.2rem; }.form-section h2 span { display: inline-grid; width: 36px; height: 36px; margin-right: .4rem; place-items: center; color: white; background: var(--sage-deep); border-radius: 50%; font-family: 'Noto Sans TC', sans-serif; font-size: .7rem; }.payment-options { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }.payment-options label { display: flex; align-items: center; gap: .8rem; padding: 1rem; border: 1px solid var(--line); border-radius: 14px; cursor: pointer; }.payment-options label.selected { border-color: var(--sage-deep); background: #edf3ec; }.payment-options input { display: none; }.payment-options i { font-size: 1.4rem; }.payment-options span { display: flex; flex-direction: column; }.payment-options small { margin-top: .2rem; color: var(--ink-soft); font-size: .65rem; }.checkout-summary { position: sticky; top: 105px; padding: 1.7rem; background: var(--paper); border: 1px solid var(--line); border-radius: 24px; }.checkout-summary h2 { margin-bottom: 1.5rem; }.checkout-item { display: grid; grid-template-columns: 58px 1fr auto; align-items: center; gap: .8rem; margin-bottom: 1rem; }.checkout-item img { width: 58px; height: 58px; object-fit: cover; border-radius: 10px; }.checkout-item div > span { position: absolute; top: -6px; right: -6px; display: grid; width: 20px; height: 20px; place-items: center; color: white; background: var(--ink); border-radius: 50%; font-size: .65rem; }.checkout-item p { display: flex; flex-direction: column; margin: 0; font-size: .8rem; font-weight: 600; }.checkout-item small { margin-top: .2rem; color: var(--terracotta); font-weight: 400; }.checkout-item > strong { font-size: .75rem; white-space: nowrap; }.summary-line, .grand-total { display: flex; justify-content: space-between; padding-top: 1rem; color: var(--ink-soft); font-size: .85rem; }.grand-total { align-items: end; margin-top: 1rem; border-top: 1px solid var(--line); color: var(--ink); }.grand-total strong { font-family: 'Noto Serif TC', serif; font-size: 1.4rem; }.privacy-note { margin: 1rem 0 0; color: var(--ink-soft); font-size: .68rem; line-height: 1.6; text-align: center; }
@media (max-width: 575.98px) { .checkout-steps { gap: .4rem; }.payment-options { grid-template-columns: 1fr; }.form-section { padding: 1.2rem; } }
</style>
