<script setup>
import { computed, ref } from 'vue'
import { useMarketStore } from '../../stores/market'

const store = useMarketStore()
const newName = ref('')
const editing = ref('')
const editName = ref('')
const message = ref('')
const rows = computed(() => store.categories.map((name) => ({
  name,
  count: store.products.filter((product) => product.category === name).length,
})))

function add() {
  message.value = store.addCategory(newName.value) ? '分類已新增。' : '分類名稱不可空白或重複。'
  if (message.value === '分類已新增。') newName.value = ''
}

function startEdit(name) {
  editing.value = name
  editName.value = name
  message.value = ''
}

function saveEdit() {
  message.value = store.renameCategory(editing.value, editName.value) ? '分類與相關商品已更新。' : '分類名稱不可空白或重複。'
  if (message.value.startsWith('分類與')) editing.value = ''
}

function remove(row) {
  if (row.count) {
    message.value = '仍有商品使用此分類，請先調整商品分類。'
    return
  }
  if (window.confirm(`確定刪除「${row.name}」分類？`)) {
    store.deleteCategory(row.name)
    message.value = '分類已刪除。'
  }
}
</script>

<template>
  <section>
    <div class="mb-4"><p class="eyebrow mb-2">Catalog structure</p><h1 class="dashboard-title">分類管理</h1><p class="dashboard-subtitle mb-0">維護前台選物分類；更名時會同步更新既有商品。</p></div>
    <div class="row g-4">
      <div class="col-lg-4">
        <div class="panel"><h2 class="h5 mb-3">新增分類</h2><label class="form-label" for="new-category">分類名稱</label><input id="new-category" v-model.trim="newName" class="form-control" placeholder="例如：金工飾品" @keyup.enter="add" /><button class="btn btn-accent w-100 mt-3" @click="add"><i class="bi bi-plus-lg me-1"></i>新增分類</button></div>
      </div>
      <div class="col-lg-8">
        <div class="panel"><div class="d-flex justify-content-between align-items-center mb-3"><h2 class="h5 mb-0">目前分類</h2><span class="text-secondary small">共 {{ rows.length }} 個</span></div><div v-if="message" class="alert alert-light border py-2 small">{{ message }}</div><div class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th>分類名稱</th><th>商品數</th><th class="text-end">操作</th></tr></thead><tbody><tr v-for="row in rows" :key="row.name"><td><div v-if="editing === row.name" class="input-group"><input v-model.trim="editName" class="form-control form-control-sm" @keyup.enter="saveEdit" /><button class="btn btn-sm btn-primary" @click="saveEdit">儲存</button></div><strong v-else>{{ row.name }}</strong></td><td>{{ row.count }} 件</td><td class="text-end text-nowrap"><button v-if="editing !== row.name" class="btn btn-sm btn-link" @click="startEdit(row.name)">更名</button><button class="btn btn-sm btn-link text-danger" @click="remove(row)">刪除</button></td></tr></tbody></table></div></div>
      </div>
    </div>
  </section>
</template>
