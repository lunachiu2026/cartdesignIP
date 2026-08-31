<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMarketStore } from '../../stores/market'

const store = useMarketStore()
const { orders } = storeToRefs(store)
const search = ref('')
const statusFilter = ref('all')

const statusOptions = [
  { value: 'all', label: '全部狀態' },
  { value: 'processing', label: '處理中' },
  { value: 'shipped', label: '已出貨' },
  { value: 'completed', label: '已完成' },
]

const editableStatuses = statusOptions.slice(1)
const orderStatus = {
  processing: { label: '處理中', className: 'status-processing' },
  shipped: { label: '已出貨', className: 'status-shipped' },
  completed: { label: '已完成', className: 'status-completed' },
}

const filteredOrders = computed(() => {
  const keyword = search.value.trim().toLocaleLowerCase('zh-TW')
  return [...orders.value]
    .filter((order) => {
      const creator = store.getCreator(order.creatorId)
      const matchesStatus = statusFilter.value === 'all' || order.status === statusFilter.value
      const searchable = [
        order.id,
        order.customer?.name,
        order.customer?.email,
        order.customer?.phone,
        creator?.name,
        ...order.items.map((item) => item.name),
      ].join(' ').toLocaleLowerCase('zh-TW')
      return matchesStatus && (!keyword || searchable.includes(keyword))
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})

function formatCurrency(value) {
  return `NT$ ${Number(value).toLocaleString('zh-TW')}`
}

function creatorName(id) {
  return store.getCreator(id)?.name || '未知創作者'
}

function itemSummary(order) {
  const quantity = order.items.reduce((sum, item) => sum + item.qty, 0)
  const firstName = order.items[0]?.name || '商品資料未提供'
  return order.items.length > 1 ? `${firstName} 等 ${quantity} 件` : `${firstName} × ${quantity}`
}

function changeStatus(order, event) {
  const status = event.target.value
  if (status === order.status) return
  store.updateOrderStatus(order.id, status)
}
</script>

<template>
  <section>
    <div class="mb-4">
      <p class="eyebrow mb-2">Order management</p>
      <h1 class="dashboard-title">全站訂單</h1>
      <p class="dashboard-subtitle mb-0">追蹤跨品牌訂單進度，協助交易順利完成。</p>
    </div>

    <div class="panel">
      <div class="row g-3 align-items-center mb-4">
        <div class="col-12 col-md">
          <label class="visually-hidden" for="order-search">搜尋訂單</label>
          <div class="input-group">
            <span class="input-group-text bg-transparent border-end-0 rounded-start-3"><i class="bi bi-search"></i></span>
            <input id="order-search" v-model="search" class="form-control border-start-0" type="search" placeholder="搜尋訂單編號、顧客、品牌或商品">
          </div>
        </div>
        <div class="col-12 col-md-auto">
          <label class="visually-hidden" for="order-status">狀態篩選</label>
          <select id="order-status" v-model="statusFilter" class="form-select">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </div>
        <div class="col-12 col-md-auto text-secondary small">共 {{ filteredOrders.length }} 筆</div>
      </div>

      <div v-if="filteredOrders.length" class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th>訂單／日期</th>
              <th>顧客</th>
              <th>創作者</th>
              <th>商品摘要</th>
              <th>訂單金額</th>
              <th>狀態</th>
              <th>更新狀態</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td class="text-nowrap">
                <div class="fw-semibold">{{ order.id }}</div>
                <small class="text-secondary">{{ order.createdAt }}</small>
              </td>
              <td>
                <div class="fw-semibold text-nowrap">{{ order.customer?.name }}</div>
                <small class="text-secondary text-nowrap">{{ order.customer?.email }}</small>
              </td>
              <td class="text-nowrap">{{ creatorName(order.creatorId) }}</td>
              <td style="min-width: 220px">
                <div>{{ itemSummary(order) }}</div>
                <small class="text-secondary">{{ order.payment }}</small>
              </td>
              <td class="fw-semibold text-nowrap">{{ formatCurrency(order.total) }}</td>
              <td>
                <span class="status-pill text-nowrap" :class="orderStatus[order.status]?.className">
                  {{ orderStatus[order.status]?.label || order.status }}
                </span>
              </td>
              <td>
                <label class="visually-hidden" :for="`order-status-${order.id}`">更新 {{ order.id }} 狀態</label>
                <select
                  :id="`order-status-${order.id}`"
                  class="form-select form-select-sm text-nowrap"
                  :value="order.status"
                  style="min-width: 110px"
                  @change="changeStatus(order, $event)"
                >
                  <option v-for="option in editableStatuses" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <i class="bi bi-receipt-cutoff"></i>
        <h2 class="h5">找不到符合條件的訂單</h2>
        <p class="text-secondary mb-0">請調整搜尋關鍵字或狀態篩選。</p>
      </div>
    </div>
  </section>
</template>
