<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '../../stores/market'

const store = useMarketStore()
const router = useRouter()
const paymentMethod = ref('credit_card')
const acceptedTerms = ref(false)
const loading = ref(false)
const error = ref('')
const card = reactive({ number: '4242 4242 4242 4242', expiry: '12/30', cvc: '123', name: '' })

const creator = computed(() => store.currentCreator)
const paymentMethods = [
  { value: 'credit_card', label: '信用卡', note: 'Visa、Mastercard、JCB', icon: 'credit-card-2-front' },
  { value: 'bank_transfer', label: '銀行轉帳', note: '模擬即時轉帳', icon: 'bank' },
  { value: 'digital_wallet', label: '行動支付', note: '模擬電子錢包', icon: 'phone' },
]

async function submitPayment() {
  error.value = ''
  if (!acceptedTerms.value) {
    error.value = '請先確認並同意訂閱與審核條款'
    return
  }
  if (paymentMethod.value === 'credit_card' && (!card.number.trim() || !card.expiry.trim() || !card.cvc.trim() || !card.name.trim())) {
    error.value = '請完整填寫模擬信用卡資料'
    return
  }

  loading.value = true
  try {
    const result = await Promise.resolve(store.payCreatorSubscription(paymentMethod.value))
    if (!result?.ok) {
      error.value = result?.message || '付款未完成，請稍後再試'
      return
    }
    const orderId = result.orderId || result.order?.id || result.id
    if (!orderId) {
      error.value = '付款已送出，但無法取得訂閱訂單編號'
      return
    }
    await router.push({ path: '/creator/subscription/success', query: { orderId } })
  } catch (paymentError) {
    error.value = paymentError?.message || '付款服務暫時無法使用，請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="checkout-page">
    <div class="checkout-heading">
      <RouterLink class="back-link" to="/creator/onboarding"><i class="bi bi-arrow-left"></i> 返回合作進度</RouterLink>
      <p class="eyebrow mb-2">Secure checkout</p>
      <h1>完成創作者訂閱</h1>
      <p>這是展示環境，不會進行真實扣款，也不會儲存付款資料。</p>
    </div>

    <div v-if="creator" class="row g-4 g-xl-5">
      <div class="col-lg-7">
        <form class="payment-panel" @submit.prevent="submitPayment">
          <div class="secure-label"><i class="bi bi-lock-fill"></i> 模擬加密付款頁面</div>
          <h2>選擇付款方式</h2>
          <div class="payment-options">
            <label v-for="method in paymentMethods" :key="method.value" class="payment-option" :class="{ selected: paymentMethod === method.value }">
              <input v-model="paymentMethod" type="radio" name="payment-method" :value="method.value" />
              <i :class="`bi bi-${method.icon}`"></i>
              <span><strong>{{ method.label }}</strong><small>{{ method.note }}</small></span>
              <i class="bi bi-check-circle-fill check-icon"></i>
            </label>
          </div>

          <div v-if="paymentMethod === 'credit_card'" class="card-fields">
            <div class="mb-3"><label class="form-label" for="card-number">卡號</label><input id="card-number" v-model="card.number" class="form-control" inputmode="numeric" autocomplete="cc-number" /></div>
            <div class="row g-3">
              <div class="col-sm-6"><label class="form-label" for="card-expiry">有效期限</label><input id="card-expiry" v-model="card.expiry" class="form-control" placeholder="MM/YY" autocomplete="cc-exp" /></div>
              <div class="col-sm-6"><label class="form-label" for="card-cvc">安全碼</label><input id="card-cvc" v-model="card.cvc" class="form-control" inputmode="numeric" autocomplete="cc-csc" /></div>
              <div class="col-12"><label class="form-label" for="card-name">持卡人姓名</label><input id="card-name" v-model.trim="card.name" class="form-control" autocomplete="cc-name" placeholder="請輸入姓名" /></div>
            </div>
          </div>
          <div v-else class="alternative-payment"><i :class="`bi bi-${paymentMethod === 'bank_transfer' ? 'bank' : 'phone'}`"></i><div><strong>展示付款將即時完成</strong><p>按下付款後，系統會建立一筆模擬成功交易。</p></div></div>

          <div class="terms-box">
            <h3>付款與審核條款</h3>
            <ul>
              <li>本次建立每月 NT$299 自動續訂方案。</li>
              <li>付款完成後開始審核，月週期自核准日開始計算。</li>
              <li>續訂失敗提供 3 天寬限期，逾期將鎖定發佈權限。</li>
              <li>若合作申請未通過，本筆首期款會自動原路退回。</li>
            </ul>
            <div class="form-check">
              <input id="checkout-terms" v-model="acceptedTerms" class="form-check-input" type="checkbox" />
              <label class="form-check-label" for="checkout-terms">我已閱讀並同意上述訂閱、計費與退款條款。</label>
            </div>
          </div>

          <div v-if="error" class="alert alert-danger mt-4 mb-0" role="alert">{{ error }}</div>
          <button class="btn btn-accent w-100 mt-4" type="submit" :disabled="loading"><span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>{{ loading ? '正在完成模擬付款' : '確認付款 NT$299' }}</button>
          <p class="payment-footnote"><i class="bi bi-shield-check"></i> 由暮光集所模擬安全付款服務保護</p>
        </form>
      </div>

      <div class="col-lg-5">
        <aside class="order-card">
          <div class="order-card-head"><span class="brand-seal">暮</span><div><small>暮光集所</small><strong>創作者訂閱訂單</strong></div></div>
          <div class="brand-row"><span>申請品牌</span><strong>{{ creator.name }}</strong></div>
          <hr />
          <div class="order-item"><div><strong>創作者月訂閱</strong><span>首期訂閱費</span></div><strong>NT$299</strong></div>
          <div class="order-total"><span>本次應付</span><strong>NT$299</strong></div>
          <div class="order-note"><i class="bi bi-info-circle"></i><p>付款後立即開始審核。若未通過，本筆款項將自動退款。</p></div>
        </aside>
      </div>
    </div>

    <div v-else class="missing-card"><i class="bi bi-person-x"></i><h2>找不到申請資料</h2><p>請先登入創作者帳號，再回到付款頁面。</p><RouterLink class="btn btn-accent" to="/creator/login">前往登入</RouterLink></div>
  </section>
</template>

<style scoped>
.checkout-page { max-width: 1120px; margin: 0 auto; }
.checkout-heading { max-width: 720px; margin-bottom: 2rem; }
.checkout-heading h1 { margin-bottom: .6rem; font-size: clamp(2rem, 4vw, 3rem); }
.checkout-heading > p:last-child { color: var(--ink-soft); }
.back-link { display: inline-flex; gap: .5rem; align-items: center; margin-bottom: 2rem; color: var(--ink-soft); font-size: .86rem; font-weight: 600; }
.payment-panel, .order-card, .missing-card { background: var(--paper); border: 1px solid var(--line); border-radius: 26px 26px 8px 26px; }
.payment-panel { padding: clamp(1.5rem, 4vw, 2.5rem); }
.payment-panel h2 { margin-bottom: 1.5rem; font-size: 1.45rem; }
.secure-label { display: inline-flex; gap: .45rem; margin-bottom: 1.2rem; padding: .4rem .7rem; color: #39704b; background: #dfecdf; border-radius: 999px; font-size: .7rem; font-weight: 700; }
.payment-options { display: grid; gap: .75rem; }
.payment-option { display: flex; gap: 1rem; align-items: center; padding: 1rem; cursor: pointer; border: 1px solid var(--line); border-radius: 15px; transition: border-color .2s, background .2s; }
.payment-option.selected { background: #f1f5ee; border-color: var(--sage-deep); }
.payment-option input { position: absolute; opacity: 0; pointer-events: none; }
.payment-option > i:not(.check-icon) { display: grid; width: 40px; height: 40px; place-items: center; background: var(--cream); border-radius: 12px; font-size: 1.1rem; }
.payment-option span { display: grid; flex: 1; }
.payment-option small { color: var(--ink-soft); }
.check-icon { color: var(--sage-deep); opacity: 0; }
.selected .check-icon { opacity: 1; }
.card-fields, .alternative-payment { margin-top: 1.5rem; padding: 1.3rem; background: var(--cream); border-radius: 16px; }
.alternative-payment { display: flex; gap: 1rem; align-items: center; }
.alternative-payment > i { color: var(--terracotta); font-size: 1.8rem; }
.alternative-payment p { margin: .25rem 0 0; color: var(--ink-soft); font-size: .82rem; }
.terms-box { margin-top: 1.5rem; padding: 1.3rem; border: 1px solid var(--line); border-radius: 16px; }
.terms-box h3 { font-size: 1rem; }
.terms-box ul { padding-left: 1.2rem; color: var(--ink-soft); font-size: .83rem; line-height: 1.8; }
.terms-box .form-check { padding-top: 1rem; border-top: 1px solid var(--line); font-size: .86rem; }
.payment-footnote { margin: 1rem 0 0; color: var(--ink-soft); font-size: .75rem; text-align: center; }
.order-card { position: sticky; top: 1.5rem; padding: 2rem; overflow: hidden; box-shadow: var(--shadow); }
.order-card::before { position: absolute; top: 0; right: 0; left: 0; height: 7px; background: repeating-linear-gradient(90deg, var(--terracotta) 0 34px, var(--gold) 34px 68px, var(--sage-deep) 68px 102px); content: ''; }
.order-card-head { display: flex; gap: .8rem; align-items: center; margin-bottom: 2rem; }
.order-card-head div { display: grid; }
.order-card-head small { color: var(--ink-soft); }
.brand-row { display: flex; justify-content: space-between; gap: 1rem; font-size: .87rem; }
.brand-row span { color: var(--ink-soft); }
.order-item { display: flex; justify-content: space-between; gap: 1rem; margin: 2rem 0; }
.order-item div { display: grid; }
.order-item span { color: var(--ink-soft); font-size: .8rem; }
.order-total { display: flex; align-items: end; justify-content: space-between; padding: 1.2rem 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.order-total strong { font-family: 'Noto Serif TC', serif; font-size: 1.8rem; }
.order-note { display: flex; gap: .7rem; margin-top: 1.5rem; color: var(--ink-soft); font-size: .8rem; line-height: 1.65; }
.order-note p { margin: 0; }
.missing-card { padding: 4rem 2rem; text-align: center; }
.missing-card > i { color: var(--sage-deep); font-size: 3rem; }
@media (max-width: 991.98px) { .order-card { position: static; } }
</style>
