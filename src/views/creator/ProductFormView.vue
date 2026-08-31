<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMarketStore } from '../../stores/market'

const route = useRoute()
const router = useRouter()
const store = useMarketStore()

const form = reactive({
  name: '',
  category: '',
  price: '',
  stock: '',
  status: 'inactive',
  image: '',
  description: '',
})
const errors = reactive({})
const editingId = ref(null)
const loadError = ref('')
const previewFailed = ref(false)
const saving = ref(false)
const uploadError = ref('')
const isEdit = computed(() => Boolean(editingId.value))

function resetErrors() {
  Object.keys(errors).forEach((key) => delete errors[key])
}

function isValidUrl(value) {
  if (!value) return true
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

function loadProduct(id) {
  resetErrors()
  loadError.value = ''
  editingId.value = null
  Object.assign(form, {
    name: '', category: '', price: '', stock: '', status: 'inactive', image: '', description: '',
  })

  if (!id || id === 'new') return
  const product = store.getProduct(String(id))
  if (!product) {
    loadError.value = '找不到這項商品，可能已被刪除。'
    return
  }
  if (product.creatorId !== store.backofficeSession?.creatorId) {
    loadError.value = '你沒有權限編輯這項商品。'
    return
  }

  editingId.value = product.id
  Object.assign(form, {
    name: product.name || '',
    category: product.category || '',
    price: product.price ?? '',
    stock: product.stock ?? '',
    status: product.status || 'inactive',
    image: product.image || product.images?.[0] || '',
    description: product.description || '',
  })
}

watch(() => route.params.id, loadProduct, { immediate: true })
watch(() => form.image, () => { previewFailed.value = false })

function handleImageFile(event) {
  const file = event.target.files?.[0]
  uploadError.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    uploadError.value = '請選擇圖片檔案。'
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    uploadError.value = '展示版圖片請控制在 2MB 以內。'
    return
  }
  const reader = new FileReader()
  reader.onload = () => { form.image = String(reader.result) }
  reader.readAsDataURL(file)
}

function validate() {
  resetErrors()
  if (!form.name.trim()) errors.name = '請輸入商品名稱。'
  if (!form.category.trim()) errors.category = '請輸入商品分類。'
  if (form.price === '' || Number(form.price) < 0 || !Number.isFinite(Number(form.price))) errors.price = '請輸入大於或等於 0 的售價。'
  if (form.stock === '' || Number(form.stock) < 0 || !Number.isInteger(Number(form.stock))) errors.stock = '請輸入大於或等於 0 的整數庫存。'
  if (!['active', 'inactive'].includes(form.status)) errors.status = '請選擇商品狀態。'
  if (!form.image.startsWith('data:image/') && !isValidUrl(form.image.trim())) errors.image = '請輸入有效的圖片網址或上傳圖片。'
  if (!form.description.trim()) errors.description = '請輸入商品說明。'
  return Object.keys(errors).length === 0
}

async function submitForm() {
  if (!validate() || loadError.value) return

  if (editingId.value) {
    const currentProduct = store.getProduct(editingId.value)
    if (!currentProduct || currentProduct.creatorId !== store.backofficeSession?.creatorId) {
      loadError.value = '你沒有權限編輯這項商品。'
      return
    }
  }

  saving.value = true
  const image = form.image.trim()
  const saved = store.saveProduct({
    ...(editingId.value ? { id: editingId.value } : {}),
    name: form.name.trim(),
    category: form.category.trim(),
    price: Number(form.price),
    stock: Number(form.stock),
    status: form.status,
    image,
    images: image ? [image] : [],
    description: form.description.trim(),
  })
  if (!saved) {
    saving.value = false
    loadError.value = '目前沒有新增或上架商品的權限，請確認品牌審核與月租狀態。'
    return
  }
  await router.push('/creator/products')
  saving.value = false
}
</script>

<template>
  <section>
    <div class="mb-4">
      <RouterLink class="text-secondary small d-inline-flex align-items-center gap-1 mb-3" to="/creator/products">
        <i class="bi bi-arrow-left"></i>返回商品列表
      </RouterLink>
      <p class="eyebrow mb-2">Product Editor</p>
      <h1 class="dashboard-title">{{ isEdit ? '編輯商品' : '新增商品' }}</h1>
      <p class="dashboard-subtitle mb-0">完整呈現作品資訊，讓顧客更了解創作細節。</p>
    </div>

    <div v-if="loadError" class="panel empty-state">
      <i class="bi bi-shield-exclamation"></i>
      <h2 class="h5">無法開啟商品</h2>
      <p class="text-secondary">{{ loadError }}</p>
      <RouterLink class="btn btn-primary" to="/creator/products">返回商品列表</RouterLink>
    </div>

    <form v-else novalidate @submit.prevent="submitForm">
      <div class="row g-4">
        <div class="col-12 col-xl-8">
          <div class="panel h-100">
            <h2 class="h5 mb-4">基本資訊</h2>
            <div class="row g-3">
              <div class="col-12 col-md-8">
                <label class="form-label" for="product-name">商品名稱 <span class="text-danger">*</span></label>
                <input id="product-name" v-model="form.name" class="form-control" :class="{ 'is-invalid': errors.name }" maxlength="80" autocomplete="off">
                <div class="invalid-feedback">{{ errors.name }}</div>
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label" for="product-category">分類 <span class="text-danger">*</span></label>
                <input id="product-category" v-model="form.category" class="form-control" :class="{ 'is-invalid': errors.category }" placeholder="例如：紙品">
                <div class="invalid-feedback">{{ errors.category }}</div>
              </div>
              <div class="col-6 col-md-4">
                <label class="form-label" for="product-price">售價（NT$）<span class="text-danger">*</span></label>
                <input id="product-price" v-model="form.price" class="form-control" :class="{ 'is-invalid': errors.price }" type="number" min="0" step="1" inputmode="numeric">
                <div class="invalid-feedback">{{ errors.price }}</div>
              </div>
              <div class="col-6 col-md-4">
                <label class="form-label" for="product-stock">庫存 <span class="text-danger">*</span></label>
                <input id="product-stock" v-model="form.stock" class="form-control" :class="{ 'is-invalid': errors.stock }" type="number" min="0" step="1" inputmode="numeric">
                <div class="invalid-feedback">{{ errors.stock }}</div>
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label" for="product-state">商品狀態 <span class="text-danger">*</span></label>
                <select id="product-state" v-model="form.status" class="form-select" :class="{ 'is-invalid': errors.status }">
                  <option value="active">上架</option>
                  <option value="inactive">下架</option>
                </select>
                <div class="invalid-feedback">{{ errors.status }}</div>
              </div>
              <div class="col-12">
                <label class="form-label" for="product-description">商品說明 <span class="text-danger">*</span></label>
                <textarea id="product-description" v-model="form.description" class="form-control" :class="{ 'is-invalid': errors.description }" rows="8" maxlength="1200" placeholder="描述作品特色、尺寸、材質與使用方式"></textarea>
                <div class="invalid-feedback">{{ errors.description }}</div>
                <div class="form-text text-end">{{ form.description.length }} / 1200</div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-4">
          <div class="panel">
            <h2 class="h5 mb-4">商品圖片</h2>
            <div class="ratio ratio-4x3 rounded-3 overflow-hidden bg-light mb-3">
              <img v-if="form.image && !previewFailed" :src="form.image" alt="商品圖片預覽" class="w-100 h-100 object-fit-cover" @error="previewFailed = true">
              <div v-else class="d-flex flex-column align-items-center justify-content-center text-secondary">
                <i class="bi bi-image fs-1 mb-2"></i>
                <span class="small">圖片預覽</span>
              </div>
            </div>
            <label class="form-label" for="product-image">圖片網址</label>
            <input id="product-image" v-model="form.image" class="form-control" :class="{ 'is-invalid': errors.image }" type="url" placeholder="https://example.com/product.jpg">
            <div class="invalid-feedback">{{ errors.image }}</div>
            <div class="text-center text-secondary small my-2">或</div>
            <label class="btn btn-outline-ink w-100" for="product-file"><i class="bi bi-upload me-2"></i>從電腦選擇圖片</label>
            <input id="product-file" class="visually-hidden" type="file" accept="image/*" @change="handleImageFile">
            <p v-if="uploadError" class="text-danger small mt-2 mb-0">{{ uploadError }}</p>
            <p class="form-text mb-0">建議使用清晰、比例接近 4:3 的圖片，展示版上限 2MB。</p>
          </div>
        </div>
      </div>

      <div class="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 mt-4">
        <RouterLink class="btn btn-outline-ink" to="/creator/products">取消</RouterLink>
        <button class="btn btn-accent" type="submit" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
          {{ saving ? '儲存中' : '儲存商品' }}
        </button>
      </div>
    </form>
  </section>
</template>
