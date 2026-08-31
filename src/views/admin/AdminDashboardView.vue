<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMarketStore } from '../../stores/market'

const store = useMarketStore()
const { creators, products, orders } = storeToRefs(store)

const totalRevenue = computed(() => orders.value.reduce((sum, order) => sum + order.total, 0))
const pendingCreators = computed(() => creators.value.filter((creator) => creator.status === 'pending'))
const activeProductCount = computed(() => products.value.filter((product) => product.status === 'active').length)
const recentOrders = computed(() => [...orders.value]
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  .slice(0, 5))

const stats = computed(() => [
  { label: '平台總營收', value: formatCurrency(totalRevenue.value), note: '累計訂單金額', icon: 'cash-stack' },
  { label: '訂單總數', value: `${orders.value.length} 筆`, note: `${orders.value.filter((order) => order.status === 'processing').length} 筆待處理`, icon: 'receipt' },
  { label: '商品總數', value: `${products.value.length} 件`, note: `${activeProductCount.value} 件販售中`, icon: 'box-seam' },
  { label: '創作者總數', value: `${creators.value.length} 位`, note: `${pendingCreators.value.length} 位等待審核`, icon: 'people' },
])

const orderStatus = {
  processing: { label: '處理中', className: 'status-processing' },
  shipped: { label: '已出貨', className: 'status-shipped' },
  completed: { label: '已完成', className: 'status-completed' },
}

function formatCurrency(value) {
  return `NT$ ${Number(value).toLocaleString('zh-TW')}`
}

function creatorName(id) {
  return store.getCreator(id)?.name || '未知創作者'
}

function resetPlatformData() {
  const confirmed = window.confirm('確定要重設平台資料嗎？目前的創作者、商品、訂單與購物車資料都會還原為初始內容，此操作無法復原。')
  if (confirmed) store.resetData()
}
</script>

<template>
  <section>
    <div class="d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-3 mb-4">
      <div>
        <p class="eyebrow mb-2">Platform overview</p>
        <h1 class="dashboard-title">營運總覽</h1>
        <p class="dashboard-subtitle mb-0">掌握暮光集所的即時營運狀況與待辦事項。</p>
      </div>
      <button class="btn btn-outline-danger align-self-start" type="button" @click="resetPlatformData">
        <i class="bi bi-arrow-counterclockwise me-2"></i>重設示範資料
      </button>
    </div>

    <div class="row g-3 mb-4">
      <div v-for="stat in stats" :key="stat.label" class="col-12 col-sm-6 col-xl-3">
        <article class="stat-card">
          <div class="stat-icon"><i :class="`bi bi-${stat.icon}`"></i></div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="fw-semibold">{{ stat.label }}</div>
          <small class="text-secondary">{{ stat.note }}</small>
        </article>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-12 col-xl-5">
        <section class="panel h-100">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h2 class="h5 mb-1">待審核創作者</h2>
              <p class="small text-secondary mb-0">確認品牌資料後即可開通合作資格</p>
            </div>
            <RouterLink class="btn btn-sm btn-outline-ink" to="/admin/creators">查看全部</RouterLink>
          </div>

          <div v-if="pendingCreators.length" class="d-grid gap-3">
            <article v-for="creator in pendingCreators" :key="creator.id" class="d-flex align-items-center gap-3 border-top pt-3">
              <img :src="creator.avatar" :alt="creator.name" class="rounded-circle object-fit-cover flex-shrink-0" width="48" height="48">
              <div class="min-w-0 flex-grow-1">
                <div class="fw-semibold text-truncate">{{ creator.name }}</div>
                <div class="small text-secondary text-truncate">{{ creator.owner }} · {{ creator.category }}</div>
              </div>
               <RouterLink class="btn btn-sm btn-primary flex-shrink-0" :to="`/admin/creators/${creator.id}`">查看申請</RouterLink>
            </article>
          </div>
          <div v-else class="empty-state py-5">
            <i class="bi bi-patch-check"></i>
            <p class="mb-0 text-secondary">目前沒有等待審核的申請</p>
          </div>
        </section>
      </div>

      <div class="col-12 col-xl-7">
        <section class="panel h-100">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h2 class="h5 mb-1">近期訂單</h2>
              <p class="small text-secondary mb-0">依訂單日期顯示最新交易</p>
            </div>
            <RouterLink class="btn btn-sm btn-outline-ink" to="/admin/orders">訂單管理</RouterLink>
          </div>

          <div v-if="recentOrders.length" class="table-responsive">
            <table class="table align-middle mb-0">
              <thead>
                <tr>
                  <th>訂單編號</th>
                  <th>創作者</th>
                  <th>日期</th>
                  <th>金額</th>
                  <th>狀態</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in recentOrders" :key="order.id">
                  <td class="fw-semibold text-nowrap">{{ order.id }}</td>
                  <td class="text-nowrap">{{ creatorName(order.creatorId) }}</td>
                  <td class="text-secondary text-nowrap">{{ order.createdAt }}</td>
                  <td class="fw-semibold text-nowrap">{{ formatCurrency(order.total) }}</td>
                  <td>
                    <span class="status-pill" :class="orderStatus[order.status]?.className">
                      {{ orderStatus[order.status]?.label || order.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state py-5">
            <i class="bi bi-receipt"></i>
            <p class="mb-0 text-secondary">尚無訂單資料</p>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>
