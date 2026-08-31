<script setup>
import { computed, ref } from 'vue'
import { useMarketStore } from '../../stores/market'

const store = useMarketStore()
const search = ref('')
const statusFilter = ref('all')
const canPublish = computed(() => store.canCreatorPublish(store.backofficeSession?.creatorId))
const subscriptionStatus = computed(() => store.getCreatorSubscriptionStatus(store.currentCreator)?.status)

const creatorProducts = computed(() => store.products.filter((product) => product.creatorId === store.backofficeSession?.creatorId))
const filteredProducts = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return creatorProducts.value.filter((product) => {
    const matchesStatus = statusFilter.value === 'all' || product.status === statusFilter.value
    const matchesKeyword = !keyword
      || product.name.toLowerCase().includes(keyword)
      || product.category.toLowerCase().includes(keyword)
    return matchesStatus && matchesKeyword
  })
})

const formatCurrency = (value) => new Intl.NumberFormat('zh-TW', {
  style: 'currency',
  currency: 'TWD',
  maximumFractionDigits: 0,
}).format(value)

function toggleStatus(product) {
  if (product.creatorId !== store.backofficeSession?.creatorId) return
  if (product.status !== 'active' && !canPublish.value) return
  store.toggleProduct(product.id)
}

function removeProduct(product) {
  if (product.creatorId !== store.backofficeSession?.creatorId) return
  if (window.confirm(`確定要刪除「${product.name}」嗎？刪除後無法復原。`)) {
    store.deleteProduct(product.id)
  }
}
</script>

<template>
  <section>
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
      <div>
        <p class="eyebrow mb-2">Products</p>
        <h1 class="dashboard-title">我的商品</h1>
        <p class="dashboard-subtitle mb-0">整理商品資訊、庫存與上架狀態。</p>
      </div>
      <RouterLink v-if="canPublish" class="btn btn-accent align-self-start" to="/creator/products/new">
        <i class="bi bi-plus-lg me-1"></i>新增商品
      </RouterLink>
    </div>

    <div v-if="subscriptionStatus === 'locked'" class="alert alert-danger d-flex justify-content-between align-items-center gap-3"><span><i class="bi bi-lock me-2"></i>月租逾期，新增與上架功能已鎖定；已成立訂單不受影響。</span><RouterLink class="btn btn-sm btn-primary" to="/creator/subscription">前往補繳</RouterLink></div>

    <div class="panel">
      <div class="row g-2 mb-4">
        <div class="col-12 col-md">
          <label class="visually-hidden" for="product-search">搜尋商品</label>
          <div class="input-group">
            <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search"></i></span>
            <input id="product-search" v-model="search" class="form-control border-start-0" type="search" placeholder="搜尋商品名稱或分類">
          </div>
        </div>
        <div class="col-12 col-md-auto">
          <label class="visually-hidden" for="product-status">商品狀態</label>
          <select id="product-status" v-model="statusFilter" class="form-select">
            <option value="all">全部狀態</option>
            <option value="active">上架中</option>
            <option value="inactive">已下架</option>
          </select>
        </div>
      </div>

      <div v-if="filteredProducts.length" class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th>商品</th>
              <th>分類</th>
              <th class="text-end">售價</th>
              <th class="text-end">庫存</th>
              <th class="text-center">狀態</th>
              <th class="text-end">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td style="min-width: 240px">
                <div class="d-flex align-items-center gap-3">
                  <img
                    :src="product.image"
                    :alt="product.name"
                    class="rounded-3 flex-shrink-0 object-fit-cover"
                    width="64"
                    height="64"
                  >
                  <div>
                    <div class="fw-semibold">{{ product.name }}</div>
                    <div class="text-secondary small">{{ product.id }}</div>
                  </div>
                </div>
              </td>
              <td class="text-nowrap">{{ product.category }}</td>
              <td class="text-end text-nowrap fw-semibold">{{ formatCurrency(product.price) }}</td>
              <td class="text-end" :class="{ 'text-danger fw-semibold': product.stock === 0 }">{{ product.stock }}</td>
              <td class="text-center text-nowrap">
                <button
                  type="button"
                  class="btn p-0 border-0"
                   :title="product.status === 'active' ? '點擊下架' : canPublish ? '點擊上架' : '月租逾期，無法上架'"
                   :disabled="product.status !== 'active' && !canPublish"
                  @click="toggleStatus(product)"
                >
                  <span class="status-pill" :class="`status-${product.status}`">
                     {{ product.status === 'active' && !canPublish ? '前台暫停販售' : product.status === 'active' ? '上架中' : '已下架' }}
                  </span>
                </button>
              </td>
              <td class="text-end text-nowrap">
                <RouterLink class="btn btn-sm btn-outline-ink me-2" :to="`/creator/products/${product.id}/edit`">
                  <i class="bi bi-pencil"></i><span class="visually-hidden">編輯</span>
                </RouterLink>
                <button class="btn btn-sm btn-outline-danger" type="button" @click="removeProduct(product)">
                  <i class="bi bi-trash3"></i><span class="visually-hidden">刪除</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <i class="bi" :class="creatorProducts.length ? 'bi-search' : 'bi-box-seam'"></i>
        <h2 class="h5">{{ creatorProducts.length ? '找不到符合條件的商品' : '開始建立第一件商品' }}</h2>
        <p class="text-secondary mb-3">
          {{ creatorProducts.length ? '調整搜尋文字或篩選條件後再試一次。' : '把你的作品故事、價格與庫存整理上架。' }}
        </p>
        <RouterLink v-if="!creatorProducts.length && canPublish" class="btn btn-primary" to="/creator/products/new">新增商品</RouterLink>
      </div>
    </div>
  </section>
</template>
