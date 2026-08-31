<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMarketStore } from '../../stores/market'

const route = useRoute()
const store = useMarketStore()

const orderId = computed(() => String(route.query.orderId || route.params.orderId || '').trim())
const creator = computed(() => store.currentCreator)
const subscriptionResult = computed(() => store.getCreatorSubscriptionStatus(creator.value))
const subscriptionStatus = computed(() => typeof subscriptionResult.value === 'string'
  ? subscriptionResult.value
  : subscriptionResult.value?.status || 'active')
</script>

<template>
  <section class="success-page">
    <div class="success-card">
      <div class="success-mark"><i class="bi bi-check-lg"></i><span></span><span></span></div>
      <p class="eyebrow">Payment completed</p>
      <h1>付款完成，審核已經開始</h1>
      <p class="lead-copy">謝謝你完成創作者月訂閱。暮光集所已收到 {{ creator?.name || '你的品牌' }} 的申請，平台現在開始檢視品牌與創作資料。</p>

      <div class="receipt">
        <div><span>付款結果</span><strong><i class="bi bi-check-circle-fill"></i> 已完成</strong></div>
        <div><span>本次金額</span><strong>NT$299</strong></div>
        <div><span>訂閱狀態</span><strong>{{ subscriptionStatus === 'active' ? '有效' : subscriptionStatus }}</strong></div>
        <div><span>訂單編號</span><strong>{{ orderId || '系統處理中' }}</strong></div>
      </div>

      <div class="review-started">
        <span class="review-icon"><i class="bi bi-search-heart"></i></span>
        <div><h2>接下來是平台審核</h2><p>結果會寄到 {{ creator?.email || '申請信箱' }}。若未通過，這筆首期款將自動原路退回。</p></div>
      </div>

      <div class="d-flex flex-column flex-sm-row justify-content-center gap-3">
        <RouterLink class="btn btn-accent" to="/creator/onboarding">查看合作進度</RouterLink>
        <RouterLink class="btn btn-outline-ink" to="/creator/subscription">查看付款紀錄</RouterLink>
      </div>
      <p class="footnote"><i class="bi bi-envelope-check"></i> 你也可以稍後從模擬通知信的安全連結回來查看結果。</p>
    </div>
  </section>
</template>

<style scoped>
.success-page { display: grid; min-height: calc(100vh - 160px); padding: 2rem 0; place-items: center; }
.success-card { width: min(100%, 760px); padding: clamp(2rem, 6vw, 4rem); text-align: center; background: var(--paper); border: 1px solid var(--line); border-radius: 36px 36px 10px 36px; box-shadow: var(--shadow); }
.success-mark { position: relative; display: grid; width: 84px; height: 84px; margin: 0 auto 1.6rem; place-items: center; color: white; background: var(--sage-deep); border-radius: 30px 30px 8px 30px; font-size: 2.2rem; }
.success-mark span { position: absolute; width: 8px; height: 8px; background: var(--gold); border-radius: 50%; }
.success-mark span:first-of-type { top: -12px; right: 5px; }
.success-mark span:last-of-type { right: -15px; bottom: 10px; width: 12px; height: 12px; background: var(--terracotta); }
.success-card h1 { margin-bottom: 1.2rem; font-size: clamp(2rem, 5vw, 3.2rem); }
.lead-copy { max-width: 610px; margin: 0 auto 2rem; color: var(--ink-soft); line-height: 1.9; }
.receipt { display: grid; grid-template-columns: repeat(2, 1fr); margin-bottom: 2rem; padding: 1rem 1.5rem; background: var(--cream); border: 1px dashed #b9b9ae; border-radius: 18px; text-align: left; }
.receipt div { display: grid; gap: .2rem; padding: .8rem; }
.receipt span { color: var(--ink-soft); font-size: .75rem; }
.receipt strong { overflow-wrap: anywhere; }
.receipt i { color: var(--sage-deep); }
.review-started { display: flex; gap: 1rem; align-items: center; margin-bottom: 2rem; padding: 1.3rem; background: var(--sage); border-radius: 18px; text-align: left; }
.review-icon { display: grid; width: 48px; height: 48px; flex: 0 0 48px; place-items: center; color: var(--terracotta); background: var(--paper); border-radius: 15px; font-size: 1.25rem; }
.review-started h2 { margin-bottom: .3rem; font-size: 1rem; }
.review-started p { margin: 0; color: var(--ink-soft); font-size: .82rem; line-height: 1.65; }
.footnote { margin: 1.5rem 0 0; color: var(--ink-soft); font-size: .78rem; }
@media (max-width: 575.98px) {
  .receipt { grid-template-columns: 1fr; }
  .receipt div + div { border-top: 1px solid var(--line); }
  .review-started { align-items: start; }
}
</style>
