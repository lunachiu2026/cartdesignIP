<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMarketStore } from '../../stores/market'

const route = useRoute()
const store = useMarketStore()

const order = computed(() => store.getCustomerOrder(String(route.params.id || '')))
const creator = computed(() => order.value ? store.getCreator(order.value.creatorId) : null)
const statusSteps = [
  { value: 'processing', label: '準備中', note: '創作者正在整理與包裝作品', icon: 'bi-box-seam' },
  { value: 'shipped', label: '已出貨', note: '作品已踏上前往你身邊的路', icon: 'bi-truck' },
  { value: 'completed', label: '已完成', note: '謝謝你讓創作走進日常', icon: 'bi-house-heart' },
]
const currentStep = computed(() => Math.max(0, statusSteps.findIndex((step) => step.value === order.value?.status)))
const shippingAddress = computed(() => {
  const customer = order.value?.customer
  if (!customer) return '未提供'
  const city = customer.city?.trim() || ''
  const address = customer.address?.trim() || ''
  if (city && address.startsWith(city)) return address
  return `${city}${address}` || '未提供'
})

const formatPrice = (value) => new Intl.NumberFormat('zh-TW').format(Number(value) || 0)
</script>

<template>
  <section class="order-detail-page section-space">
    <div class="container">
      <template v-if="order">
        <RouterLink class="back-link" to="/account/orders"><i class="bi bi-arrow-left"></i> 回到我的訂單</RouterLink>

        <header class="detail-heading">
          <div>
            <p class="eyebrow">Order journey</p>
            <h1>訂單 {{ order.id }}</h1>
            <p>{{ order.createdAt }} 下單</p>
          </div>
          <span class="status-pill" :class="`status-${order.status}`">
            {{ statusSteps.find((step) => step.value === order.status)?.label || '處理中' }}
          </span>
        </header>

        <div class="timeline-card">
          <div class="status-timeline">
            <div
              v-for="(step, index) in statusSteps"
              :key="step.value"
              class="timeline-step"
              :class="{ done: index < currentStep, active: index === currentStep }"
            >
              <div class="step-mark"><i class="bi" :class="index < currentStep ? 'bi-check-lg' : step.icon"></i></div>
              <div>
                <strong>{{ step.label }}</strong>
                <span>{{ step.note }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4 align-items-start">
          <div class="col-lg-8">
            <article class="detail-card items-card">
              <div class="card-title-row">
                <div>
                  <span>01</span>
                  <h2>這次收藏的作品</h2>
                </div>
                <strong>{{ order.items.length }} 項</strong>
              </div>

              <div v-for="item in order.items" :key="`${order.id}-${item.productId}`" class="order-item">
                <img :src="item.image" :alt="item.name">
                <div class="item-copy">
                  <strong>{{ item.name }}</strong>
                  <span>{{ creator?.name || '暮光集所創作者' }}</span>
                  <small>NT$ {{ formatPrice(item.price) }} × {{ item.qty }}</small>
                </div>
                <strong class="line-total">NT$ {{ formatPrice(item.price * item.qty) }}</strong>
              </div>
            </article>

            <article class="detail-card shipping-card">
              <div class="card-title-row">
                <div>
                  <span>02</span>
                  <h2>收件與配送資訊</h2>
                </div>
              </div>
              <dl class="info-grid">
                <div><dt>收件人</dt><dd>{{ order.customer?.name || '未提供' }}</dd></div>
                <div><dt>聯絡電話</dt><dd>{{ order.customer?.phone || '未提供' }}</dd></div>
                <div><dt>電子信箱</dt><dd>{{ order.customer?.email || '未提供' }}</dd></div>
                <div class="full"><dt>配送地址</dt><dd>{{ shippingAddress }}</dd></div>
                <div v-if="order.customer?.note" class="full"><dt>給創作者的話</dt><dd>{{ order.customer.note }}</dd></div>
              </dl>
            </article>
          </div>

          <div class="col-lg-4">
            <aside class="summary-card">
              <div class="creator-sign">
                <img v-if="creator?.avatar" :src="creator.avatar" :alt="creator.name">
                <span v-else><i class="bi bi-shop"></i></span>
                <div><small>為你準備作品</small><strong>{{ creator?.name || '暮光集所創作者' }}</strong></div>
              </div>

              <div class="summary-section">
                <h2>付款摘要</h2>
                <div><span>付款方式</span><strong>{{ order.payment || '未提供' }}</strong></div>
                <div><span>商品小計</span><span>NT$ {{ formatPrice(order.subtotal) }}</span></div>
                <div><span>運費</span><span>{{ order.shipping ? `NT$ ${formatPrice(order.shipping)}` : '免運' }}</span></div>
              </div>
              <div class="grand-total"><span>訂單總額</span><strong>NT$ {{ formatPrice(order.total) }}</strong></div>
              <p><i class="bi bi-shield-check"></i> 付款與個人資料僅供此筆訂單使用</p>
            </aside>
          </div>
        </div>
      </template>

      <div v-else class="not-found-card">
        <span class="not-found-seal">尋</span>
        <p class="eyebrow">Order not found</p>
        <h1>找不到這張訂單</h1>
        <p>訂單可能不存在，或不屬於目前登入的會員。請回到訂單列表重新確認。</p>
        <RouterLink class="btn btn-primary" to="/account/orders">回到我的訂單</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.order-detail-page { min-height: 70vh; background: #f3f0e8; }
.back-link { display: inline-flex; align-items: center; gap: .55rem; margin-bottom: 2rem; color: var(--terracotta); font-size: .84rem; font-weight: 700; }
.detail-heading { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; margin-bottom: 2rem; }
.detail-heading h1 { margin-bottom: .45rem; font-size: clamp(2rem, 4vw, 3.2rem); }
.detail-heading p:last-child { margin: 0; color: var(--ink-soft); font-size: .84rem; }
.detail-heading .status-pill { padding: .55rem .9rem; font-size: .8rem; }
.timeline-card { margin-bottom: 2rem; padding: 1.8rem 2rem; overflow: hidden; background: var(--ink); border-radius: 24px 24px 8px 24px; }
.status-timeline { display: grid; grid-template-columns: repeat(3, 1fr); }
.timeline-step { position: relative; display: flex; align-items: center; gap: .8rem; color: rgba(255, 255, 255, .44); }
.timeline-step:not(:last-child)::after { position: absolute; z-index: 0; top: 23px; right: 1rem; left: 58px; height: 1px; background: rgba(255, 255, 255, .18); content: ''; }
.timeline-step.done:not(:last-child)::after, .timeline-step.active:not(:last-child)::after { background: var(--gold); }
.step-mark { position: relative; z-index: 1; display: grid; flex: 0 0 auto; width: 46px; height: 46px; place-items: center; background: #40534a; border: 1px solid rgba(255, 255, 255, .16); border-radius: 50%; }
.timeline-step.done .step-mark { color: var(--ink); background: var(--gold); border-color: var(--gold); }
.timeline-step.active { color: white; }
.timeline-step.active .step-mark { color: white; background: var(--terracotta); border-color: #dc8865; box-shadow: 0 0 0 6px rgba(201, 111, 75, .15); }
.timeline-step > div:last-child { position: relative; z-index: 1; display: flex; flex-direction: column; padding-right: .7rem; background: var(--ink); }
.timeline-step strong { font-size: .9rem; }
.timeline-step span { margin-top: .2rem; font-size: .68rem; line-height: 1.5; }
.detail-card { margin-bottom: 1.5rem; padding: 1.6rem; background: var(--paper); border: 1px solid var(--line); border-radius: 22px; }
.card-title-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--line); }
.card-title-row > div { display: flex; align-items: center; gap: .7rem; }
.card-title-row span { display: grid; width: 36px; height: 36px; place-items: center; color: white; background: var(--sage-deep); border-radius: 50%; font-size: .67rem; }
.card-title-row h2 { margin: 0; font-size: 1.15rem; }
.card-title-row > strong { color: var(--ink-soft); font-size: .75rem; }
.order-item { display: grid; grid-template-columns: 82px 1fr auto; align-items: center; gap: 1rem; padding: 1.2rem 0; border-bottom: 1px solid var(--line); }
.order-item:last-child { padding-bottom: 0; border-bottom: 0; }
.order-item img { width: 82px; height: 82px; object-fit: cover; border-radius: 14px; }
.item-copy { display: flex; flex-direction: column; min-width: 0; }
.item-copy > strong { overflow: hidden; font-family: 'Noto Serif TC', serif; text-overflow: ellipsis; white-space: nowrap; }
.item-copy span { margin-top: .25rem; color: var(--terracotta); font-size: .74rem; }
.item-copy small { margin-top: .5rem; color: var(--ink-soft); }
.line-total { font-size: .9rem; white-space: nowrap; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.4rem 2rem; margin: 1.5rem 0 0; }
.info-grid .full { grid-column: 1 / -1; }
.info-grid dt { margin-bottom: .3rem; color: var(--ink-soft); font-size: .72rem; font-weight: 500; }
.info-grid dd { margin: 0; font-size: .88rem; line-height: 1.6; }
.summary-card { position: sticky; top: 105px; padding: 1.6rem; background: #ece3d5; border: 1px solid #d7cbbb; border-radius: 24px 24px 8px 24px; }
.creator-sign { display: flex; align-items: center; gap: .8rem; padding-bottom: 1.35rem; border-bottom: 1px solid #cfc2b1; }
.creator-sign > img, .creator-sign > span { width: 54px; height: 54px; object-fit: cover; border-radius: 50%; }
.creator-sign > span { display: grid; place-items: center; color: var(--sage-deep); background: var(--sage); }
.creator-sign div { display: flex; flex-direction: column; }
.creator-sign small { margin-bottom: .2rem; color: var(--ink-soft); font-size: .68rem; }
.summary-section { padding: 1.4rem 0; border-bottom: 1px solid #cfc2b1; }
.summary-section h2 { margin-bottom: 1.2rem; font-size: 1.15rem; }
.summary-section > div { display: flex; justify-content: space-between; gap: 1rem; margin-top: .8rem; color: var(--ink-soft); font-size: .82rem; }
.summary-section > div:first-of-type { margin-bottom: 1.4rem; padding-bottom: 1rem; border-bottom: 1px dashed #c9bcab; }
.summary-section strong { color: var(--ink); }
.grand-total { display: flex; align-items: end; justify-content: space-between; gap: 1rem; padding-top: 1.3rem; }
.grand-total span { font-size: .86rem; }
.grand-total strong { font-family: 'Noto Serif TC', serif; font-size: 1.35rem; white-space: nowrap; }
.summary-card > p { margin: 1.2rem 0 0; color: var(--ink-soft); text-align: center; font-size: .68rem; }
.not-found-card { max-width: 680px; margin: 2rem auto; padding: 4rem 2rem; text-align: center; background: var(--paper); border: 1px solid var(--line); border-radius: 32px 32px 10px 32px; box-shadow: var(--shadow); }
.not-found-seal { display: grid; width: 78px; height: 78px; margin: 0 auto 1.5rem; place-items: center; color: white; background: var(--terracotta); border-radius: 50% 50% 12px 50%; font-family: 'Noto Serif TC', serif; font-size: 1.45rem; }
.not-found-card > p:not(.eyebrow) { max-width: 480px; margin: 1rem auto 1.7rem; color: var(--ink-soft); line-height: 1.8; }
@media (max-width: 767.98px) { .status-timeline { gap: .8rem; }.timeline-step { align-items: center; flex-direction: column; text-align: center; }.timeline-step:not(:last-child)::after { top: 23px; right: calc(-50% + 28px); left: calc(50% + 28px); }.timeline-step > div:last-child { padding: .4rem 0 0; }.timeline-step span { display: none; }.detail-heading { align-items: start; flex-direction: column; }.summary-card { position: static; } }
@media (max-width: 575.98px) { .timeline-card { padding: 1.4rem .8rem; }.step-mark { width: 42px; height: 42px; }.timeline-step:not(:last-child)::after { top: 21px; }.detail-card { padding: 1.2rem; }.order-item { grid-template-columns: 66px 1fr; }.order-item img { width: 66px; height: 66px; }.line-total { grid-column: 2; }.info-grid { grid-template-columns: 1fr; }.info-grid .full { grid-column: auto; } }
</style>
