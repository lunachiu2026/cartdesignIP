<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMarketStore } from '../../stores/market'

const store = useMarketStore()
const { products } = storeToRefs(store)
const search = ref('')
const statusFilter = ref('all')

const statusOptions = [
  { value: 'all', label: '全部狀態' },
  { value: 'active', label: '販售中' },
  { value: 'inactive', label: '已下架' },
]

const productStatus = {
  active: { label: '販售中', className: 'status-active' },
  inactive: { label: '已下架', className: 'status-inactive' },
}

const filteredProducts = computed(() => {
  const keyword = search.value.trim().toLocaleLowerCase('zh-TW')
  return products.value.filter((product) => {
    const creator = store.getCreator(product.creatorId)
    const matchesStatus = statusFilter.value === 'all' || product.status === statusFilter.value
    const searchable = [product.id, product.name, product.category, creator?.name].join(' ').toLocaleLowerCase('zh-TW')
    return matchesStatus && (!keyword || searchable.includes(keyword))
  })
})

function formatCurrency(value) {
  return `NT$ ${Number(value).toLocaleString('zh-TW')}`
}

function creatorName(id) {
  return store.getCreator(id)?.name || '未知創作者'
}

function toggleStatus(product) {
  const nextAction = product.status === 'active' ? '下架' : '重新上架'
  if (!window.confirm(`確定要${nextAction}「${product.name}」嗎？`)) return
  store.toggleProduct(product.id)
}
</script>

<template>
  <section>
    <div class="mb-4">
      <p class="eyebrow mb-2">Product management</p>
      <h1 class="dashboard-title">全站商品</h1>
      <p class="dashboard-subtitle mb-0">檢視所有創作者商品並管理前台販售狀態。</p>
    </div>

    <div class="panel">
      <div class="row g-3 align-items-center mb-4">
        <div class="col-12 col-md">
          <label class="visually-hidden" for="product-search">搜尋商品</label>
          <div class="input-group">
            <span class="input-group-text bg-transparent border-end-0 rounded-start-3"><i class="bi bi-search"></i></span>
            <input id="product-search" v-model="search" class="form-control border-start-0" type="search" placeholder="搜尋商品名稱、編號、類別或創作者">
          </div>
        </div>
        <div class="col-12 col-md-auto">
          <label class="visually-hidden" for="product-status">狀態篩選</label>
          <select id="product-status" v-model="statusFilter" class="form-select">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </div>
        <div class="col-12 col-md-auto text-secondary small">共 {{ filteredProducts.length }} 件</div>
      </div>

      <div v-if="filteredProducts.length" class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th>商品</th>
              <th>創作者</th>
              <th>類別</th>
              <th>售價</th>
              <th>庫存</th>
              <th>狀態</th>
              <th class="text-end">管理操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td>
                <div class="d-flex align-items-center gap-3" style="min-width: 250px">
                  <img :src="product.image" :alt="product.name" class="rounded-3 object-fit-cover flex-shrink-0" width="58" height="58">
                  <div>
                    <div class="fw-semibold">{{ product.name }}</div>
                    <small class="text-secondary">{{ product.id }}</small>
                  </div>
                </div>
              </td>
              <td class="text-nowrap">{{ creatorName(product.creatorId) }}</td>
              <td class="text-nowrap">{{ product.category }}</td>
              <td class="fw-semibold text-nowrap">{{ formatCurrency(product.price) }}</td>
              <td>
                <span :class="{ 'text-danger fw-semibold': product.stock === 0 }">{{ product.stock }}</span>
              </td>
              <td>
                <span class="status-pill text-nowrap" :class="productStatus[product.status]?.className">
                  {{ productStatus[product.status]?.label || product.status }}
                </span>
              </td>
              <td class="text-end">
                <button
                  class="btn btn-sm text-nowrap"
                  :class="product.status === 'active' ? 'btn-outline-danger' : 'btn-outline-ink'"
                  type="button"
                  @click="toggleStatus(product)"
                >
                  {{ product.status === 'active' ? '下架' : '重新上架' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <i class="bi bi-box-seam"></i>
        <h2 class="h5">找不到符合條件的商品</h2>
        <p class="text-secondary mb-0">請調整搜尋關鍵字或狀態篩選。</p>
      </div>
    </div>
  </section>
</template>
