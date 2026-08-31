<script setup>
import { computed, onMounted, ref } from 'vue'
import { useMarketStore } from '../../stores/market'

const store = useMarketStore()
const fetchedOrders = ref([])
const loading = ref(false)
const demoLoading = ref('')
const error = ref('')

const creator = computed(() => store.currentCreator)
const subscriptionResult = computed(() => store.getCreatorSubscriptionStatus(creator.value))
const subscription = computed(() => typeof subscriptionResult.value === 'object' && subscriptionResult.value
  ? subscriptionResult.value
  : creator.value?.subscription || {})
const subscriptionStatus = computed(() => typeof subscriptionResult.value === 'string'
  ? subscriptionResult.value
  : subscriptionResult.value?.status || 'locked')
const canPublish = computed(() => Boolean(creator.value?.id && store.canCreatorPublish(creator.value.id)))
const orders = computed(() => {
  const source = fetchedOrders.value.length ? fetchedOrders.value : (store.subscriptionOrders || [])
  return [...source]
    .filter((order) => !creator.value?.id || !order.creatorId || order.creatorId === creator.value.id)
    .sort((a, b) => String(b.createdAt || b.paidAt || '').localeCompare(String(a.createdAt || a.paidAt || '')))
})

const statusDetails = {
  unpaid: { label: '等待首期付款', icon: 'credit-card', className: 'grace', title: '尚未進入平台審核', copy: '完成 NT$299 首期付款後，平台才會開始審核品牌資料。' },
  prepaid: { label: '首期已付款', icon: 'hourglass-split', className: 'active', title: '付款完成，等待審核', copy: '月租週期尚未起算，核准當日才會開始第一個月。' },
  refunded: { label: '首期已退款', icon: 'arrow-counterclockwise', className: 'locked', title: '申請未通過', copy: '首期付款已建立模擬退款紀錄，重新送審前需再次付款。' },
  active: { label: '訂閱有效', icon: 'check-circle', className: 'active', title: '訂閱運作正常', copy: '你的創作者訂閱權益已啟用。' },
  grace: { label: '3 天寬限期', icon: 'hourglass-split', className: 'grace', title: '續訂付款尚未完成', copy: '請在寬限期截止前完成續訂，避免發佈權限遭到鎖定。' },
  locked: { label: '訂閱已鎖定', icon: 'lock', className: 'locked', title: '訂閱權限目前暫停', copy: '完成 NT$299 續訂後，可恢復符合資格的工作室權限。' },
}

const orderStatuses = {
  paid: { label: '付款完成', className: 'history-paid' },
  refunded: { label: '已退款', className: 'history-refunded' },
  failed: { label: '付款失敗', className: 'history-failed' },
  pending: { label: '處理中', className: 'history-pending' },
}

const detail = computed(() => statusDetails[subscriptionStatus.value] || statusDetails.unpaid)
const showRenewal = computed(() => creator.value?.status === 'approved' && ['grace', 'locked'].includes(subscriptionStatus.value))

function formatDate(value) {
  if (!value) return '尚未建立'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
}

function formatCurrency(value) {
  return `NT$${Number(value ?? 299).toLocaleString('zh-TW')}`
}

function paymentLabel(method) {
  return { credit_card: '信用卡', bank_transfer: '銀行轉帳', digital_wallet: '行動支付', refund: '原付款方式' }[method] || method || '模擬付款'
}

async function loadOrders() {
  if (!creator.value?.id) return
  loading.value = true
  error.value = ''
  try {
    const result = await Promise.resolve(store.getCreatorSubscriptionOrders(creator.value.id))
    if (Array.isArray(result)) fetchedOrders.value = result
    else if (Array.isArray(result?.orders)) fetchedOrders.value = result.orders
  } catch (loadError) {
    error.value = loadError?.message || '目前無法載入訂閱紀錄'
  } finally {
    loading.value = false
  }
}

async function setScenario(scenario) {
  demoLoading.value = scenario
  error.value = ''
  try {
    await Promise.resolve(store.setDemoSubscriptionScenario(scenario))
    await loadOrders()
  } catch (scenarioError) {
    error.value = scenarioError?.message || '無法切換展示情境'
  } finally {
    demoLoading.value = ''
  }
}

async function resetScenario() {
  demoLoading.value = 'reset'
  error.value = ''
  try {
    await Promise.resolve(store.clearDemoSubscriptionScenario())
    await loadOrders()
  } catch (scenarioError) {
    error.value = scenarioError?.message || '無法重設展示情境'
  } finally {
    demoLoading.value = ''
  }
}

onMounted(loadOrders)
</script>

<template>
  <section class="subscription-page">
    <div class="page-heading">
      <div><p class="eyebrow mb-2">Subscription</p><h1>訂閱與付款</h1><p>掌握方案效期、付款與退款紀錄。</p></div>
      <RouterLink class="btn btn-outline-ink" to="/creator/onboarding">查看合作進度</RouterLink>
    </div>

    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <template v-if="creator">
      <article class="status-hero" :class="`status-${detail.className}`">
        <div class="status-main">
          <span class="status-icon"><i :class="`bi bi-${detail.icon}`"></i></span>
          <div><span class="status-label">{{ detail.label }}</span><h2>{{ detail.title }}</h2><p>{{ detail.copy }}</p></div>
        </div>
        <div class="plan-price"><small>創作者月訂閱</small><strong>NT$299<span>／月</span></strong></div>
        <RouterLink v-if="showRenewal" class="btn btn-accent" to="/creator/subscription/checkout">立即續訂 NT$299</RouterLink>
      </article>

      <div class="row g-4 mt-1">
        <div class="col-lg-8">
          <article class="panel-card mb-4">
            <div class="card-heading"><div><p class="eyebrow mb-1">Plan details</p><h2>方案資訊</h2></div><span class="permission-badge" :class="canPublish ? 'permission-on' : 'permission-off'"><i :class="`bi bi-${canPublish ? 'unlock' : 'lock'}`"></i> {{ canPublish ? '可發佈商品' : '不可發佈商品' }}</span></div>
            <dl class="date-grid">
              <div><dt>計費起始日</dt><dd>{{ formatDate(subscription.startedAt || subscription.approvedAt || creator.approvedAt) }}</dd></div>
              <div><dt>本期開始</dt><dd>{{ formatDate(subscription.currentPeriodStart || subscription.periodStart) }}</dd></div>
              <div><dt>本期到期</dt><dd>{{ formatDate(subscription.currentPeriodEnd || subscription.periodEnd || subscription.nextBillingDate) }}</dd></div>
              <div v-if="subscriptionStatus === 'grace'"><dt>寬限期截止</dt><dd class="text-warning-emphasis">{{ formatDate(subscription.graceEndsAt || subscription.graceEnd) }}</dd></div>
              <div v-else><dt>下次續訂日</dt><dd>{{ subscriptionStatus === 'active' ? formatDate(subscription.nextBillingDate || subscription.currentPeriodEnd) : '完成續訂後重新計算' }}</dd></div>
            </dl>
            <div class="terms-reminder"><i class="bi bi-info-circle"></i><p><strong>計費規則</strong>通過審核當日才開始計算月週期；續訂失敗有 3 天寬限期，逾期後訂閱轉為鎖定。</p></div>
          </article>

          <article class="panel-card">
            <div class="card-heading"><div><p class="eyebrow mb-1">Billing history</p><h2>付款與退款紀錄</h2></div><span class="text-secondary small">共 {{ orders.length }} 筆</span></div>
            <div v-if="loading" class="loading-state"><span class="spinner-border spinner-border-sm"></span> 載入紀錄中</div>
            <div v-else-if="orders.length" class="history-list">
              <div v-for="order in orders" :key="order.id" class="history-item">
                <span class="history-icon" :class="orderStatuses[order.status]?.className"><i :class="`bi bi-${order.status === 'refunded' ? 'arrow-counterclockwise' : order.status === 'failed' ? 'exclamation-lg' : 'receipt'}`"></i></span>
                <div class="history-copy"><div><strong>{{ order.status === 'refunded' ? '訂閱退款' : '創作者月訂閱' }}</strong><span class="history-status" :class="orderStatuses[order.status]?.className">{{ orderStatuses[order.status]?.label || order.status }}</span></div><small>{{ order.id }}・{{ paymentLabel(order.paymentMethod) }}</small></div>
                <div class="history-amount"><strong>{{ order.status === 'refunded' ? '-' : '' }}{{ formatCurrency(order.amount) }}</strong><time>{{ formatDate(order.refundedAt || order.paidAt || order.createdAt) }}</time></div>
              </div>
            </div>
            <div v-else class="empty-history"><i class="bi bi-receipt-cutoff"></i><p>目前還沒有付款或退款紀錄。</p></div>
          </article>
        </div>

        <div class="col-lg-4">
          <aside class="demo-card">
            <div class="demo-tag"><i class="bi bi-stars"></i> 展示工具</div>
            <h2>切換訂閱情境</h2>
            <p>快速預覽不同訂閱狀態下的畫面與權限。此操作僅供 Demo 使用。</p>
            <div class="demo-options">
              <button type="button" :class="{ selected: subscriptionStatus === 'active' }" :disabled="Boolean(demoLoading)" @click="setScenario('active')"><span class="scenario-dot active-dot"></span><span><strong>Active</strong><small>訂閱正常有效</small></span><i v-if="demoLoading === 'active'" class="spinner-border spinner-border-sm"></i></button>
              <button type="button" :class="{ selected: subscriptionStatus === 'grace' }" :disabled="Boolean(demoLoading)" @click="setScenario('grace')"><span class="scenario-dot grace-dot"></span><span><strong>Grace</strong><small>3 天付款寬限</small></span><i v-if="demoLoading === 'grace'" class="spinner-border spinner-border-sm"></i></button>
              <button type="button" :class="{ selected: subscriptionStatus === 'locked' }" :disabled="Boolean(demoLoading)" @click="setScenario('locked')"><span class="scenario-dot locked-dot"></span><span><strong>Locked</strong><small>逾期鎖定權限</small></span><i v-if="demoLoading === 'locked'" class="spinner-border spinner-border-sm"></i></button>
            </div>
            <button class="reset-button" type="button" :disabled="Boolean(demoLoading)" @click="resetScenario"><span v-if="demoLoading === 'reset'" class="spinner-border spinner-border-sm me-2"></span><i v-else class="bi bi-arrow-repeat me-2"></i>重設展示情境</button>
          </aside>
        </div>
      </div>
    </template>

    <div v-else class="missing-card"><i class="bi bi-person-x"></i><h2>找不到創作者資料</h2><p>請登入後再查看訂閱資訊。</p><RouterLink class="btn btn-accent" to="/creator/login">前往登入</RouterLink></div>
  </section>
</template>

<style scoped>
.subscription-page { max-width: 1160px; margin: 0 auto; }
.page-heading { display: flex; align-items: end; justify-content: space-between; gap: 2rem; margin-bottom: 2rem; }
.page-heading h1 { margin-bottom: .5rem; font-size: clamp(2rem, 4vw, 3rem); }
.page-heading p:last-child { margin: 0; color: var(--ink-soft); }
.status-hero { display: flex; gap: 2rem; align-items: center; padding: clamp(1.5rem, 4vw, 2.4rem); color: white; border-radius: 26px 26px 8px 26px; background: var(--ink); box-shadow: var(--shadow); }
.status-main { display: flex; gap: 1.2rem; align-items: center; flex: 1; }
.status-icon { display: grid; width: 58px; height: 58px; flex: 0 0 58px; place-items: center; background: rgba(255,255,255,.12); border-radius: 18px; font-size: 1.5rem; }
.status-label { color: #bcd1c1; font-size: .72rem; font-weight: 700; letter-spacing: .12em; }
.status-main h2 { margin: .25rem 0; font-size: 1.55rem; }
.status-main p { margin: 0; color: rgba(255,255,255,.68); font-size: .85rem; }
.status-grace { background: #70512e; }
.status-locked { background: #65423b; }
.plan-price { display: grid; padding: 0 2rem; border-right: 1px solid rgba(255,255,255,.18); border-left: 1px solid rgba(255,255,255,.18); }
.plan-price small { color: rgba(255,255,255,.6); }
.plan-price strong { font-family: 'Noto Serif TC', serif; font-size: 1.8rem; }
.plan-price span { font-family: 'Noto Sans TC', sans-serif; font-size: .75rem; }
.panel-card, .demo-card, .missing-card { padding: clamp(1.4rem, 3vw, 2rem); background: var(--paper); border: 1px solid var(--line); border-radius: 22px 22px 7px 22px; }
.card-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
.card-heading h2 { margin: 0; font-size: 1.3rem; }
.permission-badge { padding: .4rem .7rem; border-radius: 999px; font-size: .7rem; font-weight: 700; }
.permission-on { color: #39704b; background: #dcebdd; }
.permission-off { color: #984537; background: #f4dcd6; }
.date-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; overflow: hidden; background: var(--line); border: 1px solid var(--line); border-radius: 14px; }
.date-grid div { padding: 1rem; background: var(--paper); }
.date-grid dt { margin-bottom: .35rem; color: var(--ink-soft); font-size: .74rem; font-weight: 500; }
.date-grid dd { margin: 0; font-weight: 700; }
.terms-reminder { display: flex; gap: .7rem; margin-top: 1rem; padding: 1rem; color: var(--ink-soft); background: var(--cream); border-radius: 12px; font-size: .78rem; line-height: 1.65; }
.terms-reminder p { margin: 0; }
.terms-reminder strong { display: block; color: var(--ink); }
.history-list { display: grid; }
.history-item { display: flex; gap: 1rem; align-items: center; padding: 1.1rem 0; border-top: 1px solid var(--line); }
.history-item:first-child { border-top: 0; }
.history-icon { display: grid; width: 42px; height: 42px; flex: 0 0 42px; place-items: center; color: #39704b; background: #dcebdd; border-radius: 13px; }
.history-icon.history-refunded { color: #506267; background: #e4e9e8; }
.history-icon.history-failed { color: #984537; background: #f4dcd6; }
.history-copy { display: grid; flex: 1; gap: .3rem; }
.history-copy > div { display: flex; flex-wrap: wrap; gap: .6rem; align-items: center; }
.history-copy small, .history-amount time { color: var(--ink-soft); font-size: .72rem; }
.history-status { padding: .22rem .45rem; border-radius: 999px; color: #39704b; background: #dcebdd; font-size: .65rem; font-weight: 700; }
.history-status.history-refunded { color: #506267; background: #e4e9e8; }
.history-status.history-failed { color: #984537; background: #f4dcd6; }
.history-status.history-pending { color: #936024; background: #f7e4c5; }
.history-amount { display: grid; justify-items: end; }
.loading-state, .empty-history { padding: 2.5rem 1rem; color: var(--ink-soft); text-align: center; }
.empty-history i { display: block; margin-bottom: .5rem; font-size: 2rem; }
.demo-card { position: sticky; top: 1.5rem; color: white; background: var(--ink); border-color: var(--ink); }
.demo-tag { display: inline-flex; gap: .4rem; margin-bottom: 1rem; padding: .35rem .6rem; color: #f2d6c9; background: rgba(201,111,75,.16); border-radius: 999px; font-size: .68rem; font-weight: 700; }
.demo-card h2 { font-size: 1.35rem; }
.demo-card > p { color: rgba(255,255,255,.62); font-size: .82rem; line-height: 1.7; }
.demo-options { display: grid; gap: .65rem; margin: 1.5rem 0; }
.demo-options button { display: flex; gap: .8rem; align-items: center; padding: .85rem; color: white; text-align: left; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); border-radius: 12px; }
.demo-options button.selected { background: rgba(255,255,255,.14); border-color: rgba(255,255,255,.45); }
.demo-options button > span:nth-child(2) { display: grid; flex: 1; }
.demo-options small { color: rgba(255,255,255,.55); }
.scenario-dot { width: 10px; height: 10px; border-radius: 50%; }
.active-dot { background: #8fc99c; }.grace-dot { background: #e4b765; }.locked-dot { background: #d27768; }
.reset-button { width: 100%; padding: .7rem; color: rgba(255,255,255,.75); background: transparent; border: 1px solid rgba(255,255,255,.25); border-radius: 999px; font-weight: 700; }
.reset-button:hover { color: var(--ink); background: white; }
.missing-card { padding: 4rem 2rem; text-align: center; }
.missing-card > i { color: var(--sage-deep); font-size: 3rem; }
@media (max-width: 991.98px) {
  .status-hero { align-items: start; flex-direction: column; }
  .plan-price { width: 100%; padding: 1rem 0; border: 0; border-top: 1px solid rgba(255,255,255,.18); border-bottom: 1px solid rgba(255,255,255,.18); }
  .demo-card { position: static; }
}
@media (max-width: 575.98px) {
  .page-heading { align-items: start; flex-direction: column; }
  .date-grid { grid-template-columns: 1fr; }
  .history-item { align-items: start; }
  .history-amount { justify-items: start; width: 100%; }
  .history-item { flex-wrap: wrap; }
}
</style>
