<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMarketStore } from '../../stores/market'

const store = useMarketStore()
const { creators, products } = storeToRefs(store)
const search = ref('')
const statusFilter = ref('all')

const statusOptions = [
  { value: 'all', label: '全部狀態' },
  { value: 'awaiting_payment', label: '等待付款' },
  { value: 'pending', label: '待審核' },
  { value: 'approved', label: '合作中' },
  { value: 'rejected', label: '未通過' },
  { value: 'suspended', label: '已停權' },
]

const creatorStatus = {
  awaiting_payment: { label: '等待付款', className: 'status-inactive' },
  pending: { label: '待審核', className: 'status-pending' },
  approved: { label: '合作中', className: 'status-approved' },
  rejected: { label: '未通過', className: 'status-suspended' },
  suspended: { label: '已停權', className: 'status-suspended' },
}

const filteredCreators = computed(() => {
  const keyword = search.value.trim().toLocaleLowerCase('zh-TW')
  return creators.value.filter((creator) => {
    const matchesStatus = statusFilter.value === 'all' || creator.status === statusFilter.value
    const searchable = [creator.name, creator.owner, creator.email, creator.category].join(' ').toLocaleLowerCase('zh-TW')
    return matchesStatus && (!keyword || searchable.includes(keyword))
  })
})

function productCount(creatorId) {
  return products.value.filter((product) => product.creatorId === creatorId).length
}
</script>

<template>
  <section>
    <div class="mb-4">
      <p class="eyebrow mb-2">創作者管理</p>
      <h1 class="dashboard-title">創作者管理</h1>
      <p class="dashboard-subtitle mb-0">審核品牌申請並維護平台合作資格。</p>
    </div>

    <div class="panel">
      <div class="row g-3 align-items-center mb-4">
        <div class="col-12 col-md">
          <label class="visually-hidden" for="creator-search">搜尋創作者</label>
          <div class="input-group">
            <span class="input-group-text bg-transparent border-end-0 rounded-start-3"><i class="bi bi-search"></i></span>
            <input id="creator-search" v-model="search" class="form-control border-start-0" type="search" placeholder="搜尋品牌、負責人、Email 或類別">
          </div>
        </div>
        <div class="col-12 col-md-auto">
          <label class="visually-hidden" for="creator-status">狀態篩選</label>
          <select id="creator-status" v-model="statusFilter" class="form-select">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </div>
        <div class="col-12 col-md-auto text-secondary small">共 {{ filteredCreators.length }} 位</div>
      </div>

      <div v-if="filteredCreators.length" class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th>品牌／負責人</th>
              <th>聯絡資訊</th>
              <th>創作類別</th>
              <th>商品數</th>
              <th>狀態</th>
              <th class="text-end">管理操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="creator in filteredCreators" :key="creator.id">
              <td>
                <div class="d-flex align-items-center gap-3" style="min-width: 190px">
                  <img :src="creator.avatar" :alt="creator.name" class="rounded-circle object-fit-cover flex-shrink-0" width="46" height="46">
                  <div>
                    <div class="fw-semibold">{{ creator.name }}</div>
                    <small class="text-secondary">{{ creator.owner }}</small>
                  </div>
                </div>
              </td>
              <td>
                <div class="small text-nowrap">{{ creator.email }}</div>
                <div class="small text-secondary text-nowrap">{{ creator.phone || '未提供電話' }}</div>
              </td>
              <td class="text-nowrap">{{ creator.category }}</td>
              <td>{{ productCount(creator.id) }}</td>
              <td>
                <span class="status-pill text-nowrap" :class="creatorStatus[creator.status]?.className">
                  {{ creatorStatus[creator.status]?.label || creator.status }}
                </span>
              </td>
              <td>
                <div class="d-flex justify-content-end gap-2 text-nowrap">
                  <RouterLink class="btn btn-sm btn-outline-ink" :to="`/admin/creators/${creator.id}`">查看申請</RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <i class="bi bi-person-x"></i>
        <h2 class="h5">找不到符合條件的創作者</h2>
        <p class="text-secondary mb-0">請調整搜尋關鍵字或狀態篩選。</p>
      </div>
    </div>
  </section>
</template>
