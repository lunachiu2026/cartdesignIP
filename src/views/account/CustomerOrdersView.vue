<script setup>
import { computed, ref } from 'vue'
import { useMarketStore } from '../../stores/market'

const store = useMarketStore()
const statusFilter = ref('all')

const statuses = [
  { value: 'all', label: '全部訂單' },
  { value: 'processing', label: '準備中' },
  { value: 'shipped', label: '已出貨' },
  { value: 'completed', label: '已完成' },
]

const customerOrders = computed(() => {
  const orders = store.getCustomerOrders()
  return Array.isArray(orders) ? orders : []
})
const filteredOrders = computed(() => [...customerOrders.value]
  .filter((order) => statusFilter.value === 'all' || order.status === statusFilter.value)
  .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))))

const formatPrice = (value) => new Intl.NumberFormat('zh-TW').format(Number(value) || 0)
const statusLabel = (status) => statuses.find((item) => item.value === status)?.label || '處理中'
const statusCount = (status) => status === 'all'
  ? customerOrders.value.length
  : customerOrders.value.filter((order) => order.status === status).length
</script>

<template>
  <section class="orders-page section-space">
    <div class="container">
      <div class="orders-heading">
        <div>
          <p class="eyebrow">My collections</p>
          <h1 class="display-5">我的訂單</h1>
          <p>每一份等待，都是創作者細心準備作品的時間。</p>
        </div>
        <RouterLink class="profile-link" to="/account/profile">
          <i class="bi bi-person-circle"></i>會員資料
        </RouterLink>
      </div>

      <div class="status-tabs" role="group" aria-label="訂單狀態篩選">
        <button
          v-for="status in statuses"
          :key="status.value"
          type="button"
          :class="{ active: statusFilter === status.value }"
          @click="statusFilter = status.value"
        >
          {{ status.label }}<span>{{ statusCount(status.value) }}</span>
        </button>
      </div>

      <div v-if="filteredOrders.length" class="orders-list">
        <article v-for="order in filteredOrders" :key="order.id" class="order-card">
          <header class="order-card-head">
            <div>
              <span class="order-date">{{ order.createdAt }}</span>
              <h2>訂單 {{ order.id }}</h2>
            </div>
            <span class="status-pill" :class="`status-${order.status}`">{{ statusLabel(order.status) }}</span>
          </header>

          <div class="order-card-body">
            <div class="creator-block">
              <img v-if="store.getCreator(order.creatorId)?.avatar" :src="store.getCreator(order.creatorId).avatar" :alt="store.getCreator(order.creatorId)?.name || '創作者'">
              <span v-else class="creator-placeholder"><i class="bi bi-shop"></i></span>
              <div>
                <small>由創作者親自準備</small>
                <strong>{{ store.getCreator(order.creatorId)?.name || '暮光集所創作者' }}</strong>
              </div>
            </div>

            <div class="item-summary">
              <div class="item-images">
                <img v-for="item in order.items.slice(0, 3)" :key="item.productId" :src="item.image" :alt="item.name">
                <span v-if="order.items.length > 3">+{{ order.items.length - 3 }}</span>
              </div>
              <div>
                <strong>{{ order.items[0]?.name || '訂購作品' }}</strong>
                <p v-if="order.items.length > 1">另有 {{ order.items.length - 1 }} 項作品</p>
                <p v-else>數量 {{ order.items[0]?.qty || 0 }} 件</p>
              </div>
            </div>

            <div class="order-total">
              <small>訂單總額</small>
              <strong>NT$ {{ formatPrice(order.total) }}</strong>
            </div>

            <RouterLink class="detail-link" :to="`/account/orders/${order.id}`">
              查看訂單 <i class="bi bi-arrow-right"></i>
            </RouterLink>
          </div>
        </article>
      </div>

      <div v-else class="empty-orders">
        <div class="empty-mark"><i class="bi bi-bag-heart"></i></div>
        <p class="eyebrow">A quiet shelf</p>
        <h2>{{ customerOrders.length ? '這個進度暫時沒有訂單' : '你的收藏旅程，正等著開始' }}</h2>
        <p>{{ customerOrders.length ? '換個狀態看看其他作品的旅程。' : '走進集所，遇見適合陪伴日常的台灣創作。' }}</p>
        <button v-if="customerOrders.length" class="btn btn-outline-ink" type="button" @click="statusFilter = 'all'">查看全部訂單</button>
        <RouterLink v-else class="btn btn-primary" to="/products">去逛今日選物</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.orders-page { min-height: 70vh; background: linear-gradient(180deg, #f4f0e7 0, var(--cream) 380px); }
.orders-heading { display: flex; align-items: end; justify-content: space-between; gap: 2rem; margin-bottom: 2.5rem; }
.orders-heading h1 { margin-bottom: .8rem; }
.orders-heading p:last-child { margin-bottom: 0; color: var(--ink-soft); }
.profile-link { display: inline-flex; align-items: center; gap: .55rem; padding: .7rem 1rem; border: 1px solid var(--line); border-radius: 999px; background: rgba(255, 253, 248, .72); font-size: .84rem; font-weight: 700; }
.status-tabs { display: flex; gap: .65rem; margin-bottom: 2rem; overflow-x: auto; scrollbar-width: none; }
.status-tabs::-webkit-scrollbar { display: none; }
.status-tabs button { display: inline-flex; flex: 0 0 auto; align-items: center; gap: .5rem; padding: .65rem 1rem; color: var(--ink-soft); background: transparent; border: 1px solid var(--line); border-radius: 999px; font-size: .82rem; font-weight: 700; }
.status-tabs button span { display: grid; min-width: 21px; height: 21px; padding: 0 .3rem; place-items: center; background: rgba(113, 140, 120, .14); border-radius: 999px; font-size: .68rem; }
.status-tabs button.active { color: white; background: var(--ink); border-color: var(--ink); }
.status-tabs button.active span { background: rgba(255, 255, 255, .18); }
.orders-list { display: grid; gap: 1rem; }
.order-card { overflow: hidden; background: var(--paper); border: 1px solid var(--line); border-radius: 22px 22px 8px 22px; transition: transform .2s ease, box-shadow .2s ease; }
.order-card:hover { transform: translateY(-2px); box-shadow: 0 14px 35px rgba(42, 57, 48, .08); }
.order-card-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.15rem 1.5rem; background: rgba(220, 231, 220, .38); border-bottom: 1px solid var(--line); }
.order-card-head h2 { margin: .2rem 0 0; font-family: 'Noto Sans TC', sans-serif; font-size: .94rem; font-weight: 700; }
.order-date { color: var(--ink-soft); font-size: .72rem; }
.order-card-body { display: grid; grid-template-columns: minmax(190px, .8fr) minmax(280px, 1.5fr) auto auto; align-items: center; gap: 1.5rem; padding: 1.5rem; }
.creator-block, .item-summary { display: flex; align-items: center; gap: .8rem; min-width: 0; }
.creator-block img, .creator-placeholder { flex: 0 0 auto; width: 46px; height: 46px; object-fit: cover; border-radius: 50%; }
.creator-placeholder { display: grid; place-items: center; color: var(--sage-deep); background: var(--sage); }
.creator-block div { display: flex; min-width: 0; flex-direction: column; }
.creator-block small, .order-total small { margin-bottom: .2rem; color: var(--ink-soft); font-size: .68rem; }
.creator-block strong { overflow: hidden; font-size: .86rem; text-overflow: ellipsis; white-space: nowrap; }
.item-images { display: flex; flex: 0 0 auto; }
.item-images img, .item-images span { width: 54px; height: 54px; object-fit: cover; border: 3px solid var(--paper); border-radius: 12px; }
.item-images img + img, .item-images span { margin-left: -15px; }
.item-images span { display: grid; place-items: center; color: white; background: var(--sage-deep); font-size: .72rem; font-weight: 700; }
.item-summary > div:last-child { min-width: 0; }
.item-summary strong { display: block; overflow: hidden; font-size: .84rem; text-overflow: ellipsis; white-space: nowrap; }
.item-summary p { margin: .25rem 0 0; color: var(--ink-soft); font-size: .72rem; }
.order-total { display: flex; flex-direction: column; white-space: nowrap; }
.order-total strong { font-family: 'Noto Serif TC', serif; font-size: 1rem; }
.detail-link { display: inline-flex; align-items: center; gap: .5rem; color: var(--terracotta); font-size: .82rem; font-weight: 700; white-space: nowrap; }
.empty-orders { padding: 5rem 1rem; text-align: center; }
.empty-orders > p:not(.eyebrow) { margin: 1rem auto 1.5rem; color: var(--ink-soft); }
.empty-mark { display: grid; width: 90px; height: 90px; margin: 0 auto 1.5rem; place-items: center; color: var(--sage-deep); background: var(--sage); border-radius: 50% 50% 16px 50%; font-size: 2rem; }
@media (max-width: 991.98px) { .order-card-body { grid-template-columns: 1fr 1.3fr auto; }.creator-block { display: none; } }
@media (max-width: 767.98px) { .orders-heading { align-items: start; flex-direction: column; }.order-card-body { grid-template-columns: 1fr auto; }.item-summary { grid-column: 1 / -1; }.detail-link { justify-self: end; }.order-total { grid-row: 2; }.order-card-head, .order-card-body { padding-inline: 1.1rem; } }
@media (max-width: 575.98px) { .orders-heading { margin-bottom: 1.75rem; }.item-images img, .item-images span { width: 48px; height: 48px; }.order-card-head { align-items: start; }.order-card-head h2 { font-size: .82rem; } }
</style>
