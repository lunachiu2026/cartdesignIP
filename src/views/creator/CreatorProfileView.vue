<script setup>
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '../../stores/market'

const store = useMarketStore()
const router = useRouter()
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
const coverUploadError = ref('')
const avatarUploadError = ref('')
const showLeaveConfirmation = ref(false)
const showFinalLeaveWarning = ref(false)
const leaving = ref(false)

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

function handleImageFile(event, field) {
  const file = event.target.files?.[0]
  const error = field === 'cover' ? coverUploadError : avatarUploadError
  error.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    error.value = '請選擇圖片檔案。'
    return
  }
  if (file.size > 1024 * 1024) {
    error.value = '圖片檔案請控制在 1MB 以內。'
    return
  }

  const reader = new FileReader()
  reader.onload = () => { form[field] = String(reader.result) }
  reader.readAsDataURL(file)
}

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
  if (!form.cover.startsWith('data:image/') && !isValidUrl(form.cover.trim())) errors.cover = '請輸入有效的圖片網址或上傳圖片。'
  if (!form.avatar.startsWith('data:image/') && !isValidUrl(form.avatar.trim())) errors.avatar = '請輸入有效的圖片網址或上傳圖片。'
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

async function leavePlatform() {
  leaving.value = true
  const left = store.leaveCreatorPlatform()
  if (left) await router.push('/')
  leaving.value = false
}

function openFinalLeaveWarning() {
  showLeaveConfirmation.value = false
  showFinalLeaveWarning.value = true
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
              <div class="col-12 pt-2">
                <button class="btn btn-accent w-100" type="submit"><i class="bi bi-check-lg me-1"></i>儲存品牌資料</button>
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
            <div class="text-center text-secondary small my-2">或</div>
            <label class="btn btn-outline-ink w-100" for="brand-cover-file"><i class="bi bi-upload me-2"></i>從電腦上傳封面圖片</label>
            <input id="brand-cover-file" class="visually-hidden" type="file" accept="image/*" @change="handleImageFile($event, 'cover')">
            <p v-if="coverUploadError" class="text-danger small mt-2 mb-0">{{ coverUploadError }}</p>
            <p class="form-text mb-0">建議使用比例接近 16:9 的圖片，檔案上限 1MB。</p>
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
            <div class="text-center text-secondary small my-2">或</div>
            <label class="btn btn-outline-ink w-100" for="brand-avatar-file"><i class="bi bi-upload me-2"></i>從電腦上傳頭像圖片</label>
            <input id="brand-avatar-file" class="visually-hidden" type="file" accept="image/*" @change="handleImageFile($event, 'avatar')">
            <p v-if="avatarUploadError" class="text-danger small mt-2 mb-0">{{ avatarUploadError }}</p>
            <p class="form-text mb-0">建議使用正方形圖片，檔案上限 1MB。</p>
          </div>

          <div class="panel border-danger-subtle mt-4">
            <h2 class="h5 text-danger-emphasis mb-2">退出創作平台</h2>
            <p class="small text-secondary mb-3">退出後，品牌與商品會停止公開販售，並取消訂閱及信用卡固定扣款。</p>
            <button class="btn btn-outline-danger w-100" type="button" @click="showLeaveConfirmation = true"><i class="bi bi-box-arrow-right me-2"></i>退出暮光集所</button>
          </div>
        </div>
      </div>

    </form>

    <Teleport to="body">
      <div v-if="showLeaveConfirmation" class="leave-modal-backdrop" role="presentation" @click.self="!leaving && (showLeaveConfirmation = false)">
        <section class="leave-modal" role="dialog" aria-modal="true" aria-labelledby="leave-modal-title">
          <div class="leave-modal-icon"><i class="bi bi-exclamation-triangle"></i></div>
          <h2 id="leave-modal-title">確認退出暮光集所？</h2>
          <p>退出後將取消訂閱及信用卡固定扣款，品牌與商品也會停止公開販售。</p>
          <div class="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 mt-4">
            <button class="btn btn-outline-ink" type="button" :disabled="leaving" @click="showLeaveConfirmation = false">保留帳號</button>
            <button class="btn btn-danger" type="button" @click="openFinalLeaveWarning">退出</button>
          </div>
        </section>
      </div>

      <div v-if="showFinalLeaveWarning" class="leave-modal-backdrop" role="presentation" @click.self="!leaving && (showFinalLeaveWarning = false)">
        <section class="leave-modal" role="alertdialog" aria-modal="true" aria-labelledby="leave-warning-title">
          <div class="leave-modal-icon"><i class="bi bi-shield-exclamation"></i></div>
          <h2 id="leave-warning-title">退出前的重要警告</h2>
          <p>如退出，尚未出貨的商品訂單將會自動取消並退款；若日後需要再次加入暮光集所，必須重新申請並完成平台認證。</p>
          <div class="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 mt-4">
            <button class="btn btn-outline-ink" type="button" :disabled="leaving" @click="showFinalLeaveWarning = false">返回</button>
            <button class="btn btn-danger" type="button" :disabled="leaving" @click="leavePlatform"><span v-if="leaving" class="spinner-border spinner-border-sm me-2"></span>確認退出</button>
          </div>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.leave-modal-backdrop { position: fixed; z-index: 1080; inset: 0; display: grid; place-items: center; padding: 1.5rem; background: rgba(31, 37, 34, .55); }
.leave-modal { width: min(100%, 460px); padding: 2rem; background: var(--paper); border-radius: 22px 22px 7px 22px; box-shadow: 0 20px 60px rgba(0, 0, 0, .24); }
.leave-modal-icon { display: grid; width: 48px; height: 48px; place-items: center; margin-bottom: 1rem; color: #984537; background: #f4dcd6; border-radius: 14px; font-size: 1.35rem; }
.leave-modal h2 { margin-bottom: .7rem; font-size: 1.35rem; }
.leave-modal p { margin: 0; color: var(--ink-soft); line-height: 1.7; }
</style>
