<script setup>
import { reactive, ref, watch } from 'vue'
import { useMarketStore } from '../../stores/market'

const store = useMarketStore()
const form = reactive({
  name: '',
  owner: '',
  category: '',
  email: '',
  phone: '',
  location: '',
  bio: '',
  craftStory: '',
  materials: '',
  portfolio: '',
  social: '',
  applicationReason: '',
  cover: '',
  avatar: '',
})
const errors = reactive({})
const saved = ref(false)
const coverFailed = ref(false)
const avatarFailed = ref(false)

watch(
  () => store.currentCreator,
  (creator) => {
    if (!creator) return
    Object.assign(form, {
      name: creator.name || '',
      owner: creator.owner || '',
      category: creator.category || '',
      email: creator.email || '',
      phone: creator.phone || '',
      location: creator.location || '',
      bio: creator.bio || '',
      craftStory: creator.craftStory || '',
      materials: creator.materials || '',
      portfolio: creator.portfolio || '',
      social: creator.social || '',
      applicationReason: creator.applicationReason || '',
      cover: creator.cover || '',
      avatar: creator.avatar || '',
    })
  },
  { immediate: true },
)

watch(() => form.cover, () => { coverFailed.value = false })
watch(() => form.avatar, () => { avatarFailed.value = false })

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

function validate() {
  resetErrors()
  if (!form.name.trim()) errors.name = '請輸入品牌名稱。'
  if (!form.owner.trim()) errors.owner = '請輸入負責人姓名。'
  if (!form.category.trim()) errors.category = '請輸入創作類別。'
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = '請輸入有效的 Email。'
  if (!form.phone.trim()) errors.phone = '請輸入聯絡電話。'
  if (!form.location.trim()) errors.location = '請填寫工作室所在地。'
  if (!form.bio.trim()) errors.bio = '請填寫品牌介紹。'
  if (!form.craftStory.trim()) errors.craftStory = '請填寫創作理念與製作方式。'
  if (!form.materials.trim()) errors.materials = '請說明主要使用材料。'
  if (!form.applicationReason.trim()) errors.applicationReason = '請填寫加入平台的原因。'
  if (!isValidUrl(form.portfolio.trim())) errors.portfolio = '請輸入有效的作品集網址。'
  if (!isValidUrl(form.social.trim())) errors.social = '請輸入有效的社群網址。'
  if (!isValidUrl(form.cover.trim())) errors.cover = '請輸入有效的 http 或 https 圖片網址。'
  if (!isValidUrl(form.avatar.trim())) errors.avatar = '請輸入有效的 http 或 https 圖片網址。'
  return Object.keys(errors).length === 0
}

function saveProfile() {
  saved.value = false
  if (!store.currentCreator || !validate()) return
  store.updateCreator({
    id: store.currentCreator.id,
    name: form.name.trim(),
    owner: form.owner.trim(),
    category: form.category.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    location: form.location.trim(),
    bio: form.bio.trim(),
    craftStory: form.craftStory.trim(),
    materials: form.materials.trim(),
    portfolio: form.portfolio.trim(),
    social: form.social.trim(),
    applicationReason: form.applicationReason.trim(),
    cover: form.cover.trim(),
    avatar: form.avatar.trim(),
  })
  saved.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resubmit() {
  if (!validate()) return
  saveProfile()
  if (store.resubmitCreator()) window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <section>
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
      <div>
        <p class="eyebrow mb-2">Brand Profile</p>
        <h1 class="dashboard-title">品牌設定</h1>
        <p class="dashboard-subtitle mb-0">更新品牌故事、聯絡資料與商店視覺。</p>
      </div>
      <span v-if="store.currentCreator" class="status-pill align-self-start" :class="`status-${store.currentCreator.status}`">
        {{ store.currentCreator.status === 'approved' ? '審核通過' : store.currentCreator.status === 'pending' ? '審核中' : store.currentCreator.status === 'awaiting_payment' ? '等待付款送審' : store.currentCreator.status === 'rejected' ? '資料待補件' : '已停權' }}
      </span>
    </div>

    <div v-if="saved" class="alert alert-success d-flex align-items-center gap-2" role="status">
      <i class="bi bi-check-circle-fill"></i>品牌資料已儲存。
    </div>

    <div v-if="store.currentCreator?.status === 'rejected'" class="alert alert-warning mb-4">
      <strong class="d-block mb-1"><i class="bi bi-exclamation-circle me-2"></i>申請資料需要補充</strong>
      <p class="mb-2">{{ store.currentCreator.reviewNote || '請更新品牌資料後重新送審。' }}</p>
      <button class="btn btn-sm btn-primary" type="button" @click="resubmit">儲存並重新送審</button>
    </div>
    <div v-if="store.currentCreator?.status === 'awaiting_payment'" class="alert alert-info mb-4"><strong class="d-block mb-1"><i class="bi bi-credit-card me-2"></i>品牌資料尚未進入審核</strong>請完成首期 NT$299 月租付款後送審。 <RouterLink class="fw-bold" to="/creator/subscription/checkout">前往付款</RouterLink></div>

    <div v-if="!store.currentCreator" class="panel empty-state">
      <i class="bi bi-person-exclamation"></i>
      <h2 class="h5">無法讀取品牌資料</h2>
      <p class="text-secondary mb-0">請重新登入後再試一次。</p>
    </div>

    <form v-else novalidate @submit.prevent="saveProfile">
      <div class="row g-4">
        <div class="col-12 col-xl-8">
          <div class="panel">
            <h2 class="h5 mb-4">品牌資料</h2>
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label" for="brand-name">品牌名稱 <span class="text-danger">*</span></label>
                <input id="brand-name" v-model="form.name" class="form-control" :class="{ 'is-invalid': errors.name }" maxlength="60">
                <div class="invalid-feedback">{{ errors.name }}</div>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label" for="brand-location">工作室所在地 <span class="text-danger">*</span></label>
                <input id="brand-location" v-model="form.location" class="form-control" :class="{ 'is-invalid': errors.location }" placeholder="例如：台中市">
                <div class="invalid-feedback">{{ errors.location }}</div>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label" for="brand-owner">負責人 <span class="text-danger">*</span></label>
                <input id="brand-owner" v-model="form.owner" class="form-control" :class="{ 'is-invalid': errors.owner }" maxlength="40">
                <div class="invalid-feedback">{{ errors.owner }}</div>
              </div>
              <div class="col-12">
                <label class="form-label" for="brand-category">創作類別 <span class="text-danger">*</span></label>
                <input id="brand-category" v-model="form.category" class="form-control" :class="{ 'is-invalid': errors.category }" placeholder="例如：紙品與插畫">
                <div class="invalid-feedback">{{ errors.category }}</div>
              </div>
              <div class="col-12">
                <label class="form-label" for="brand-craft">創作理念與製作方式 <span class="text-danger">*</span></label>
                <textarea id="brand-craft" v-model="form.craftStory" class="form-control" :class="{ 'is-invalid': errors.craftStory }" rows="5" placeholder="說明創作方法、製作流程與作品特色"></textarea>
                <div class="invalid-feedback">{{ errors.craftStory }}</div>
              </div>
              <div class="col-12">
                <label class="form-label" for="brand-materials">主要材料 <span class="text-danger">*</span></label>
                <input id="brand-materials" v-model="form.materials" class="form-control" :class="{ 'is-invalid': errors.materials }" placeholder="例如：天然棉麻、植物染料">
                <div class="invalid-feedback">{{ errors.materials }}</div>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label" for="brand-portfolio">作品集網址</label>
                <input id="brand-portfolio" v-model="form.portfolio" class="form-control" :class="{ 'is-invalid': errors.portfolio }" type="url" placeholder="https://">
                <div class="invalid-feedback">{{ errors.portfolio }}</div>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label" for="brand-social">社群網址</label>
                <input id="brand-social" v-model="form.social" class="form-control" :class="{ 'is-invalid': errors.social }" type="url" placeholder="https://">
                <div class="invalid-feedback">{{ errors.social }}</div>
              </div>
              <div class="col-12">
                <label class="form-label" for="brand-reason">加入平台的原因 <span class="text-danger">*</span></label>
                <textarea id="brand-reason" v-model="form.applicationReason" class="form-control" :class="{ 'is-invalid': errors.applicationReason }" rows="4"></textarea>
                <div class="invalid-feedback">{{ errors.applicationReason }}</div>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label" for="brand-email">聯絡 Email <span class="text-danger">*</span></label>
                <input id="brand-email" v-model="form.email" class="form-control" :class="{ 'is-invalid': errors.email }" type="email" autocomplete="email">
                <div class="invalid-feedback">{{ errors.email }}</div>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label" for="brand-phone">聯絡電話 <span class="text-danger">*</span></label>
                <input id="brand-phone" v-model="form.phone" class="form-control" :class="{ 'is-invalid': errors.phone }" type="tel" autocomplete="tel">
                <div class="invalid-feedback">{{ errors.phone }}</div>
              </div>
              <div class="col-12">
                <label class="form-label" for="brand-bio">品牌介紹 <span class="text-danger">*</span></label>
                <textarea id="brand-bio" v-model="form.bio" class="form-control" :class="{ 'is-invalid': errors.bio }" rows="6" maxlength="500" placeholder="分享品牌理念與創作故事"></textarea>
                <div class="invalid-feedback">{{ errors.bio }}</div>
                <div class="form-text text-end">{{ form.bio.length }} / 500</div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-4">
          <div class="panel mb-4">
            <h2 class="h5 mb-3">商店封面</h2>
            <div class="ratio ratio-16x9 rounded-3 overflow-hidden bg-light mb-3">
              <img v-if="form.cover && !coverFailed" :src="form.cover" alt="商店封面預覽" class="w-100 h-100 object-fit-cover" @error="coverFailed = true">
              <div v-else class="d-flex align-items-center justify-content-center text-secondary"><i class="bi bi-image fs-1"></i></div>
            </div>
            <label class="form-label" for="brand-cover">封面圖片網址</label>
            <input id="brand-cover" v-model="form.cover" class="form-control" :class="{ 'is-invalid': errors.cover }" type="url" placeholder="https://example.com/cover.jpg">
            <div class="invalid-feedback">{{ errors.cover }}</div>
          </div>

          <div class="panel">
            <h2 class="h5 mb-3">品牌頭像</h2>
            <div class="d-flex align-items-center gap-3 mb-3">
              <div class="rounded-circle overflow-hidden bg-light flex-shrink-0" style="width: 88px; height: 88px">
                <img v-if="form.avatar && !avatarFailed" :src="form.avatar" alt="品牌頭像預覽" class="w-100 h-100 object-fit-cover" @error="avatarFailed = true">
                <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-secondary"><i class="bi bi-shop fs-2"></i></div>
              </div>
              <p class="small text-secondary mb-0">建議使用清楚的正方形品牌識別圖片。</p>
            </div>
            <label class="form-label" for="brand-avatar">頭像圖片網址</label>
            <input id="brand-avatar" v-model="form.avatar" class="form-control" :class="{ 'is-invalid': errors.avatar }" type="url" placeholder="https://example.com/avatar.jpg">
            <div class="invalid-feedback">{{ errors.avatar }}</div>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-end mt-4">
        <button class="btn btn-accent px-4" type="submit"><i class="bi bi-check-lg me-1"></i>儲存品牌資料</button>
      </div>
    </form>
  </section>
</template>
