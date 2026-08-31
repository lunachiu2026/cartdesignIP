<script setup>
import { computed } from 'vue'
import { useMarketStore } from '../../stores/market'

const store = useMarketStore()

const creator = computed(() => store.currentCreator)
const creatorStatus = computed(() => creator.value?.status || 'awaiting_payment')
const subscriptionResult = computed(() => store.getCreatorSubscriptionStatus(creator.value))
const subscriptionStatus = computed(() => typeof subscriptionResult.value === 'string'
  ? subscriptionResult.value
  : subscriptionResult.value?.status || 'locked')
const canPublish = computed(() => Boolean(creator.value?.id && store.canCreatorPublish(creator.value.id)))

const creatorStatuses = {
  awaiting_payment: { label: '等待付款', tone: 'warning', icon: 'credit-card', step: 2 },
  pending: { label: '資料審核中', tone: 'info', icon: 'hourglass-split', step: 3 },
  rejected: { label: '申請未通過', tone: 'danger', icon: 'x-circle', step: 3 },
  approved: { label: '合作已核准', tone: 'success', icon: 'patch-check', step: 4 },
}

const subscriptionStatuses = {
  unpaid: { label: '等待付款', className: 'subscription-grace', copy: '完成首期 NT$299 付款後才會開始審核。' },
  prepaid: { label: '首期已付款', className: 'subscription-active', copy: '預付額度已確認，核准當日才開始月租週期。' },
  refunded: { label: '首期已退款', className: 'subscription-locked', copy: '審核未通過，首期付款已建立模擬退款紀錄。' },
  active: { label: '訂閱有效', className: 'subscription-active', copy: '付款狀態正常，訂閱權益已啟用。' },
  grace: { label: '3 天寬限期', className: 'subscription-grace', copy: '續訂付款尚未完成，請在寬限期內補繳。' },
  locked: { label: '訂閱已鎖定', className: 'subscription-locked', copy: '訂閱已逾期，完成續訂後才能恢復發佈權限。' },
}

const steps = [
  { label: '建立申請', icon: 'pencil-square' },
  { label: '訂閱付款', icon: 'credit-card' },
  { label: '平台審核', icon: 'search' },
  { label: '開始販售', icon: 'shop-window' },
]

const currentStep = computed(() => creatorStatuses[creatorStatus.value]?.step || 1)
const statusDetail = computed(() => creatorStatuses[creatorStatus.value] || creatorStatuses.awaiting_payment)
const subscriptionDetail = computed(() => subscriptionStatuses[subscriptionStatus.value] || subscriptionStatuses.unpaid)
</script>

<template>
  <section class="onboarding-page">
    <div class="onboarding-header">
      <div>
        <p class="eyebrow mb-2">Creator onboarding</p>
        <h1>合作進度</h1>
        <p>嗨，{{ creator?.name || '創作者' }}。從申請到開店，每一步都清楚可見。</p>
      </div>
      <RouterLink class="btn btn-outline-ink" to="/creator/subscription">查看訂閱紀錄</RouterLink>
    </div>

    <div class="progress-panel">
      <div class="step-line" aria-hidden="true"><span :style="{ width: `${((currentStep - 1) / 3) * 100}%` }"></span></div>
      <ol class="onboarding-steps" aria-label="合作申請進度">
        <li v-for="(step, index) in steps" :key="step.label" :class="{ complete: index + 1 < currentStep, current: index + 1 === currentStep }">
          <span class="step-icon"><i :class="`bi bi-${index + 1 < currentStep ? 'check-lg' : step.icon}`"></i></span>
          <small>步驟 {{ index + 1 }}</small>
          <strong>{{ step.label }}</strong>
        </li>
      </ol>
    </div>

    <div class="row g-4 mt-1">
      <div class="col-lg-8">
        <article class="status-card" :class="`status-card-${statusDetail.tone}`">
          <div class="status-card-icon"><i :class="`bi bi-${statusDetail.icon}`"></i></div>
          <div class="flex-grow-1">
            <p class="status-overline">目前申請狀態</p>
            <h2>{{ statusDetail.label }}</h2>

            <template v-if="creatorStatus === 'awaiting_payment'">
              <p>申請資料已保存，但尚未進入審核。請完成首期 NT$299 訂閱付款，平台才會開始檢視品牌與作品資料。</p>
              <div class="instruction-box"><strong>付款前請確認</strong><span>核准日起才開始月週期；若申請未通過，首期款會自動原路退回。</span></div>
              <RouterLink class="btn btn-accent" to="/creator/subscription/checkout">前往安全付款</RouterLink>
            </template>

            <template v-else-if="creatorStatus === 'pending'">
              <p>付款已完成，審核正式開始。我們正在確認原創性、材料資訊與品牌內容，結果會寄到 {{ creator?.email }}。</p>
              <div class="instruction-box"><strong>現在不需要做其他事</strong><span>請留意模擬信箱通知；審核完成前尚無法公開發佈商品。</span></div>
              <RouterLink class="btn btn-outline-ink" :to="{ path: '/creator/mail', query: { email: creator?.email } }">查看模擬信箱</RouterLink>
            </template>

            <template v-else-if="creatorStatus === 'rejected'">
              <p>這次申請未能通過，首期訂閱款將依條款自動原路退回。</p>
              <div class="instruction-box instruction-danger"><strong>平台審核說明</strong><span>{{ creator?.reviewNote || '請查看審核通知信中的完整說明；如有疑問，歡迎聯繫平台團隊。' }}</span></div>
              <div class="d-flex flex-wrap gap-2">
                <RouterLink class="btn btn-accent" to="/creator/profile">更新資料並重新申請</RouterLink>
                <RouterLink class="btn btn-outline-ink" :to="{ path: '/creator/mail', query: { email: creator?.email } }">查看審核通知</RouterLink>
                <RouterLink class="btn btn-outline-ink" to="/creator/subscription">查看退款紀錄</RouterLink>
              </div>
            </template>

            <template v-else-if="creatorStatus === 'approved'">
              <p>品牌資格已核准。{{ canPublish ? '訂閱狀態正常，現在可以建立商品並開始販售。' : '目前訂閱權限尚未啟用，完成續訂後即可恢復發佈。' }}</p>
              <div class="instruction-box"><strong>{{ canPublish ? '工作室已準備完成' : '發佈權限暫停' }}</strong><span>{{ canPublish ? '先完善品牌頁，再上架第一件作品，讓顧客完整認識你的創作。' : '前往訂閱中心查看狀態與補繳方式。' }}</span></div>
              <RouterLink v-if="canPublish" class="btn btn-accent" to="/creator/dashboard">進入創作者工作室</RouterLink>
              <RouterLink v-else class="btn btn-accent" to="/creator/subscription">處理訂閱狀態</RouterLink>
            </template>
          </div>
        </article>
      </div>

      <div class="col-lg-4">
        <aside class="subscription-card">
          <div class="d-flex justify-content-between align-items-start gap-3">
            <div><p class="status-overline">訂閱狀態</p><h2 class="h4 mb-0">創作者月訂閱</h2></div>
            <span class="subscription-pill" :class="subscriptionDetail.className">{{ subscriptionDetail.label }}</span>
          </div>
          <div class="subscription-price"><strong>NT$299</strong><span>／月</span></div>
          <p>{{ subscriptionDetail.copy }}</p>
          <hr />
          <div class="permission-row"><span>商品發佈權限</span><strong :class="canPublish ? 'text-success' : 'text-danger'"><i :class="`bi bi-${canPublish ? 'check-circle' : 'lock'}`"></i> {{ canPublish ? '已開放' : '未開放' }}</strong></div>
          <RouterLink class="text-link" to="/creator/subscription">管理訂閱 <i class="bi bi-arrow-right"></i></RouterLink>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.onboarding-page { max-width: 1180px; margin: 0 auto; }
.onboarding-header { display: flex; align-items: end; justify-content: space-between; gap: 2rem; margin-bottom: 2rem; }
.onboarding-header h1 { margin-bottom: .5rem; font-size: clamp(2rem, 4vw, 3rem); }
.onboarding-header p:last-child { margin: 0; color: var(--ink-soft); }
.progress-panel { position: relative; padding: 2rem 1.5rem; background: var(--paper); border: 1px solid var(--line); border-radius: 24px; }
.step-line { position: absolute; top: 3.45rem; right: calc(12.5% + 1.5rem); left: calc(12.5% + 1.5rem); height: 3px; overflow: hidden; background: var(--line); }
.step-line span { display: block; height: 100%; background: var(--sage-deep); transition: width .3s ease; }
.onboarding-steps { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); margin: 0; padding: 0; list-style: none; }
.onboarding-steps li { display: grid; justify-items: center; color: #8c9891; text-align: center; }
.step-icon { display: grid; width: 48px; height: 48px; margin-bottom: .75rem; place-items: center; background: #eeeee8; border: 3px solid var(--paper); border-radius: 50%; font-size: 1.05rem; }
.onboarding-steps small { margin-bottom: .2rem; font-size: .7rem; }
.onboarding-steps strong { font-size: .88rem; }
.onboarding-steps .complete, .onboarding-steps .current { color: var(--ink); }
.onboarding-steps .complete .step-icon { color: white; background: var(--sage-deep); }
.onboarding-steps .current .step-icon { color: white; background: var(--terracotta); box-shadow: 0 0 0 6px var(--peach); }
.status-card, .subscription-card { height: 100%; padding: clamp(1.5rem, 4vw, 2.5rem); background: var(--paper); border: 1px solid var(--line); border-radius: 24px 24px 8px 24px; }
.status-card { display: flex; gap: 1.5rem; border-top: 5px solid var(--gold); }
.status-card-info { border-top-color: #6d94a1; }
.status-card-danger { border-top-color: #b75c4d; }
.status-card-success { border-top-color: var(--sage-deep); }
.status-card-icon { display: grid; width: 54px; height: 54px; flex: 0 0 54px; place-items: center; color: var(--terracotta); background: var(--peach); border-radius: 18px 18px 5px 18px; font-size: 1.4rem; }
.status-card h2 { margin-bottom: 1rem; font-size: 1.65rem; }
.status-card p:not(.status-overline) { color: var(--ink-soft); line-height: 1.8; }
.status-overline { margin-bottom: .35rem; color: var(--terracotta); font-size: .72rem; font-weight: 700; letter-spacing: .12em; }
.instruction-box { display: grid; gap: .35rem; margin: 1.4rem 0; padding: 1rem 1.2rem; background: var(--sage); border-radius: 14px; }
.instruction-box span { color: var(--ink-soft); font-size: .86rem; line-height: 1.65; }
.instruction-danger { background: #f4dfda; }
.subscription-card { box-shadow: var(--shadow); }
.subscription-pill { padding: .35rem .65rem; border-radius: 999px; font-size: .7rem; font-weight: 700; white-space: nowrap; }
.subscription-active { color: #39704b; background: #dcebdd; }
.subscription-grace { color: #936024; background: #f7e4c5; }
.subscription-locked { color: #984537; background: #f4dcd6; }
.subscription-price { margin: 2rem 0 .5rem; }
.subscription-price strong { font-family: 'Noto Serif TC', serif; font-size: 2.2rem; }
.subscription-price span, .subscription-card > p { color: var(--ink-soft); font-size: .86rem; }
.permission-row { display: grid; gap: .5rem; margin: 1.25rem 0 2rem; font-size: .85rem; }
.text-link { color: var(--terracotta); font-weight: 700; }
@media (max-width: 767.98px) {
  .onboarding-header { align-items: start; flex-direction: column; }
  .progress-panel { padding: 1.5rem 1rem; }
  .step-line { display: none; }
  .step-icon { width: 40px; height: 40px; }
  .onboarding-steps strong { font-size: .72rem; }
  .status-card { flex-direction: column; }
}
</style>
