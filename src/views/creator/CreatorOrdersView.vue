<script setup>
import { computed, ref } from 'vue'
import { useMarketStore } from '../../stores/market'

const store = useMarketStore()
const statusFilter = ref('all')

const statuses = [
  { value: 'processing', label: '處理中' },
  { value: 'shipped', label: '已出貨' },
  { value: 'completed', label: '已完成' },
]

const creatorOrders = computed(() => store.orders.filter((order) => order.creatorId === store.backofficeSession?.creatorId))
const filteredOrders = computed(() => [...creatorOrders.value]
  .filter((order) => statusFilter.value === 'all' || order.status === statusFilter.value)
  .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))))

const formatCurrency = (value) => new Intl.NumberFormat('zh-TW', {
  style: 'currency',
  currency: 'TWD',
  maximumFractionDigits: 0,
}).format(value)

function changeStatus(order, status) {
  if (order.creatorId !== store.backofficeSession?.creatorId) return
  if (!statuses.some((item) => item.value === status)) return
  store.updateOrderStatus(order.id, status)
}
</script>

<template>
  <section>
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
      <div>
        <p class="eyebrow mb-2">Orders</p>
        <h1 class="dashboard-title">訂單管理</h1>
        <p class="dashboard-subtitle mb-0">查看訂購內容並更新出貨進度。</p>
      </div>
      <div class="align-self-start">
        <label class="visually-hidden" for="order-status-filter">篩選訂單狀態</label>
        <select id="order-status-filter" v-model="statusFilter" class="form-select">
          <option value="all">全部狀態（{{ creatorOrders.length }}）</option>
          <option v-for="status in statuses" :key="status.value" :value="status.value">{{ status.label }}</option>
        </select>
      </div>
    </div>

    <div class="panel">
      <div v-if="filteredOrders.length" class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th>訂單資訊</th>
              <th>顧客與配送</th>
              <th>訂購商品</th>
              <th class="text-end">金額</th>
              <th>付款</th>
              <th style="min-width: 150px">訂單狀態</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td class="text-nowrap">
                <div class="fw-semibold">{{ order.id }}</div>
                <div class="text-secondary small">{{ order.createdAt }}</div>
              </td>
              <td style="min-width: 220px">
                <div class="fw-semibold">{{ order.customer?.name || '未提供' }}</div>
                <div class="text-secondary small">{{ order.customer?.phone || '未提供電話' }}</div>
                <div class="text-secondary small">{{ order.customer?.address || '未提供地址' }}</div>
              </td>
              <td style="min-width: 260px">
                <div v-for="item in order.items" :key="`${order.id}-${item.productId}`" class="d-flex align-items-center gap-2 mb-2 last-item">
                  <img :src="item.image" :alt="item.name" class="rounded-2 object-fit-cover flex-shrink-0" width="44" height="44">
                  <div class="small">
                    <div class="fw-semibold">{{ item.name }}</div>
                    <span class="text-secondary">{{ formatCurrency(item.price) }} x {{ item.qty }}</span>
                  </div>
                </div>
              </td>
              <td class="text-end text-nowrap fw-semibold">{{ formatCurrency(order.total) }}</td>
              <td class="text-nowrap">{{ order.payment || '未提供' }}</td>
              <td>
                <label class="visually-hidden" :for="`status-${order.id}`">更新 {{ order.id }} 狀態</label>
                <select
                  :id="`status-${order.id}`"
                  class="form-select form-select-sm"
                  :value="order.status"
                  @change="changeStatus(order, $event.target.value)"
                >
                  <option v-for="status in statuses" :key="status.value" :value="status.value">{{ status.label }}</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <i class="bi bi-receipt-cutoff"></i>
        <h2 class="h5">{{ creatorOrders.length ? '這個狀態目前沒有訂單' : '目前還沒有訂單' }}</h2>
        <p class="text-secondary mb-0">{{ creatorOrders.length ? '切換其他狀態查看訂單。' : '顧客完成結帳後，訂單會出現在這裡。' }}</p>
      </div>
    </div>
  </section>
</template>
