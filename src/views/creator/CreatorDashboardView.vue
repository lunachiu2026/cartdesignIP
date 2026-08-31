<script setup>
import { computed } from 'vue'
import { useMarketStore } from '../../stores/market'

const store = useMarketStore()

const creatorId = computed(() => store.backofficeSession?.creatorId)
const creatorProducts = computed(() => store.products.filter((product) => product.creatorId === creatorId.value))
const subscriptionStatus = computed(() => store.getCreatorSubscriptionStatus(store.currentCreator)?.status)
const canPublish = computed(() => store.canCreatorPublish(creatorId.value))
const creatorOrders = computed(() => store.orders.filter((order) => order.creatorId === creatorId.value))
const activeProductCount = computed(() => creatorProducts.value.filter((product) => product.status === 'active').length)
const processingOrderCount = computed(() => creatorOrders.value.filter((order) => order.status === 'processing').length)
const totalRevenue = computed(() => creatorOrders.value.reduce((total, order) => total + Number(order.total || 0), 0))
const recentOrders = computed(() => [...creatorOrders.value]
  .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  .slice(0, 5))

const statusLabels = {
  processing: '處理中',
  shipped: '已出貨',
  completed: '已完成',
}

const formatCurrency = (value) => new Intl.NumberFormat('zh-TW', {
  style: 'currency',
  currency: 'TWD',
  maximumFractionDigits: 0,
}).format(value)

const itemSummary = (items = []) => items.map((item) => `${item.name} x ${item.qty}`).join('、')
</script>

<template>
  <section>
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
      <div>
        <p class="eyebrow mb-2">Creator Studio</p>
        <h1 class="dashboard-title">工作室總覽</h1>
        <p class="dashboard-subtitle mb-0">
          {{ store.currentCreator?.name ? `${store.currentCreator.name}，` : '' }}掌握商品與訂單的最新動態。
        </p>
      </div>
      <RouterLink v-if="canPublish" class="btn btn-accent align-self-start" to="/creator/products/new">
        <i class="bi bi-plus-lg me-1"></i>新增商品
      </RouterLink>
    </div>
    <div v-if="subscriptionStatus === 'grace'" class="alert alert-warning d-flex gap-3 align-items-start mb-4"><i class="bi bi-hourglass-split fs-4"></i><div><strong class="d-block mb-1">月租已到期，現在是 3 天付款寬限期</strong>寬限期內仍可正常販售，請儘快完成續訂。 <RouterLink class="fw-bold" to="/creator/subscription">前往續訂</RouterLink></div></div>
    <div v-if="subscriptionStatus === 'locked'" class="alert alert-danger d-flex gap-3 align-items-start mb-4"><i class="bi bi-lock fs-4"></i><div><strong class="d-block mb-1">上架功能已鎖定</strong>既有訂單仍可持續處理；前台商品目前顯示暫停販售，補繳後會自動恢復原本上架狀態。 <RouterLink class="fw-bold" to="/creator/subscription">立即補繳</RouterLink></div></div>

    <div v-if="store.currentCreator?.status === 'pending'" class="alert alert-warning d-flex gap-3 align-items-start mb-4" role="alert">
      <i class="bi bi-hourglass-split fs-4"></i>
      <div>
        <strong class="d-block mb-1">品牌資料審核中</strong>
        平台正在確認你的申請資料；審核通過前，商品將不會公開顯示。如需補充資訊，可先至品牌設定更新。
      </div>
    </div>
    <div v-if="store.currentCreator?.status === 'rejected'" class="alert alert-danger d-flex gap-3 align-items-start mb-4" role="alert">
      <i class="bi bi-exclamation-circle fs-4"></i>
      <div><strong class="d-block mb-1">合作申請需要補件</strong>{{ store.currentCreator.reviewNote || '請至品牌設定補充資料後重新送審。' }} <RouterLink class="fw-bold ms-1" to="/creator/profile">前往品牌設定</RouterLink></div>
    </div>

    <div class="row g-3 g-xl-4 mb-4">
      <div class="col-6 col-xl-3">
        <div class="stat-card">
          <span class="stat-icon"><i class="bi bi-box-seam"></i></span>
          <div class="stat-value">{{ creatorProducts.length }}</div>
          <div class="text-secondary small">全部商品</div>
        </div>
      </div>
      <div class="col-6 col-xl-3">
        <div class="stat-card">
          <span class="stat-icon"><i class="bi bi-shop-window"></i></span>
          <div class="stat-value">{{ activeProductCount }}</div>
          <div class="text-secondary small">上架中</div>
        </div>
      </div>
      <div class="col-6 col-xl-3">
        <div class="stat-card">
          <span class="stat-icon"><i class="bi bi-hourglass-split"></i></span>
          <div class="stat-value">{{ processingOrderCount }}</div>
          <div class="text-secondary small">待處理訂單</div>
        </div>
      </div>
      <div class="col-6 col-xl-3">
        <div class="stat-card">
          <span class="stat-icon"><i class="bi bi-wallet2"></i></span>
          <div class="stat-value fs-4">{{ formatCurrency(totalRevenue) }}</div>
          <div class="text-secondary small">累計訂單金額</div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
        <div>
          <h2 class="h5 mb-1">近期訂單</h2>
          <p class="text-secondary small mb-0">最近收到的五筆訂單</p>
        </div>
        <RouterLink class="btn btn-sm btn-outline-ink" to="/creator/orders">查看全部</RouterLink>
      </div>

      <div v-if="recentOrders.length" class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th>訂單編號</th>
              <th>日期</th>
              <th>顧客</th>
              <th>商品</th>
              <th class="text-end">金額</th>
              <th class="text-center">狀態</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order.id">
              <td class="fw-semibold text-nowrap">{{ order.id }}</td>
              <td class="text-nowrap">{{ order.createdAt }}</td>
              <td>{{ order.customer?.name || '未提供' }}</td>
              <td class="text-secondary small" style="min-width: 220px">{{ itemSummary(order.items) }}</td>
              <td class="text-end text-nowrap fw-semibold">{{ formatCurrency(order.total) }}</td>
              <td class="text-center text-nowrap">
                <span class="status-pill" :class="`status-${order.status}`">
                  {{ statusLabels[order.status] || order.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <i class="bi bi-receipt"></i>
        <h3 class="h5">還沒有訂單</h3>
        <p class="text-secondary mb-0">新訂單成立後，會顯示在這裡。</p>
      </div>
    </div>
  </section>
</template>
