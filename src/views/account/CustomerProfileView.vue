<script setup>
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '../../stores/market'

const router = useRouter()
const store = useMarketStore()
const form = reactive({ name: '', email: '', phone: '', city: '', address: '' })
const errors = reactive({})
const saving = ref(false)
const saved = ref(false)
const formError = ref('')

watch(
  () => store.currentCustomer,
  (customer) => {
    if (!customer) return
    Object.assign(form, {
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      city: customer.city || '',
      address: customer.address || '',
    })
  },
  { immediate: true },
)

function clearErrors() {
  Object.keys(errors).forEach((key) => delete errors[key])
}

function validate() {
  clearErrors()
  if (!form.name.trim()) errors.name = '請填寫姓名。'
  if (!form.phone.trim()) errors.phone = '請填寫聯絡電話。'
  if (!form.city.trim()) errors.city = '請填寫縣市。'
  if (!form.address.trim()) errors.address = '請填寫詳細地址。'
  return Object.keys(errors).length === 0
}

async function saveProfile() {
  saved.value = false
  formError.value = ''
  if (!validate()) return

  saving.value = true
  try {
    const result = await store.updateCustomer({
      name: form.name.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
    })
    if (result === false || result?.ok === false) {
      formError.value = result?.message || '資料未能儲存，請稍後再試。'
      return
    }
    saved.value = true
  } catch (error) {
    formError.value = error?.message || '資料未能儲存，請稍後再試。'
  } finally {
    saving.value = false
  }
}

async function logout() {
  await store.customerLogout()
  await router.push('/')
}
</script>

<template>
  <section class="profile-page section-space">
    <div class="container">
      <div class="profile-heading">
        <div>
          <p class="eyebrow">Member profile</p>
          <h1 class="display-5">會員資料</h1>
          <p>把常用的收件資訊安放好，下一次選物就能更從容。</p>
        </div>
        <RouterLink class="orders-link" to="/account/orders"><i class="bi bi-receipt"></i>我的訂單</RouterLink>
      </div>

      <div v-if="!store.currentCustomer" class="missing-profile">
        <div><i class="bi bi-person-exclamation"></i></div>
        <h2>目前無法讀取會員資料</h2>
        <p>請重新登入後，再回來整理你的收件資訊。</p>
        <RouterLink class="btn btn-primary" :to="{ name: 'account-login', query: { redirect: '/account/profile' } }">前往會員登入</RouterLink>
      </div>

      <div v-else class="row g-4 align-items-start">
        <div class="col-lg-4">
          <aside class="member-card">
            <span class="paper-thread" aria-hidden="true"></span>
            <div class="member-avatar">{{ form.name.trim().charAt(0) || '會' }}</div>
            <p class="eyebrow">Muguang member</p>
            <h2>{{ form.name || '集所會員' }}</h2>
            <span class="member-email">{{ form.email }}</span>
            <div class="member-note"><i class="bi bi-heart"></i><span>謝謝你支持在地創作，讓手藝繼續在生活裡發光。</span></div>
            <button class="logout-button" type="button" @click="logout"><i class="bi bi-box-arrow-right"></i>登出會員帳號</button>
          </aside>
        </div>

        <div class="col-lg-8">
          <form class="profile-form" novalidate @submit.prevent="saveProfile">
            <div class="form-heading">
              <div>
                <span>日常收件簿</span>
                <h2>基本與配送資料</h2>
              </div>
              <i class="bi bi-pencil"></i>
            </div>

            <div v-if="saved" class="alert alert-success d-flex align-items-center gap-2" role="status">
              <i class="bi bi-check-circle-fill"></i>會員資料已更新。
            </div>
            <div v-if="formError" class="alert alert-danger d-flex align-items-center gap-2" role="alert">
              <i class="bi bi-exclamation-circle-fill"></i>{{ formError }}
            </div>

            <div class="row g-4">
              <div class="col-md-6">
                <label class="form-label" for="profile-name">姓名</label>
                <input id="profile-name" v-model="form.name" class="form-control" :class="{ 'is-invalid': errors.name }" autocomplete="name">
                <div class="invalid-feedback">{{ errors.name }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label" for="profile-phone">聯絡電話</label>
                <input id="profile-phone" v-model="form.phone" class="form-control" :class="{ 'is-invalid': errors.phone }" type="tel" autocomplete="tel">
                <div class="invalid-feedback">{{ errors.phone }}</div>
              </div>
              <div class="col-12">
                <label class="form-label" for="profile-email">電子信箱</label>
                <div class="readonly-field">
                  <i class="bi bi-lock"></i>
                  <input id="profile-email" v-model="form.email" class="form-control" type="email" readonly aria-describedby="email-note">
                </div>
                <div id="email-note" class="form-text">電子信箱是你的登入帳號，如需變更請聯繫集所。</div>
              </div>
              <div class="col-md-4">
                <label class="form-label" for="profile-city">縣市</label>
                <input id="profile-city" v-model="form.city" class="form-control" :class="{ 'is-invalid': errors.city }" autocomplete="address-level1" placeholder="例如：台中市">
                <div class="invalid-feedback">{{ errors.city }}</div>
              </div>
              <div class="col-md-8">
                <label class="form-label" for="profile-address">詳細地址</label>
                <input id="profile-address" v-model="form.address" class="form-control" :class="{ 'is-invalid': errors.address }" autocomplete="street-address">
                <div class="invalid-feedback">{{ errors.address }}</div>
              </div>
            </div>

            <div class="form-actions">
              <span><i class="bi bi-shield-check"></i>資料僅用於會員服務與訂單配送</span>
              <button class="btn btn-accent px-4" type="submit" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                {{ saving ? '儲存中' : '儲存會員資料' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.profile-page { min-height: 70vh; background: radial-gradient(circle at 90% 8%, rgba(220, 231, 220, .8), transparent 28%), #f3f0e8; }
.profile-heading { display: flex; align-items: end; justify-content: space-between; gap: 2rem; margin-bottom: 2.5rem; }
.profile-heading h1 { margin-bottom: .7rem; }
.profile-heading p:last-child { margin: 0; color: var(--ink-soft); }
.orders-link { display: inline-flex; align-items: center; gap: .55rem; padding: .7rem 1rem; background: var(--paper); border: 1px solid var(--line); border-radius: 999px; font-size: .84rem; font-weight: 700; }
.member-card { position: relative; overflow: hidden; padding: 2.2rem; color: white; background: var(--ink); border-radius: 28px 28px 8px 28px; }
.member-card::after { position: absolute; right: -45px; bottom: 45px; width: 140px; height: 140px; border: 1px solid rgba(255, 255, 255, .1); border-radius: 50%; content: ''; }
.paper-thread { position: absolute; top: 0; right: 2rem; width: 42px; height: 70px; background: var(--terracotta); clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%); }
.member-avatar { display: grid; width: 84px; height: 84px; margin-bottom: 1.7rem; place-items: center; color: var(--ink); background: #e8d6b6; border: 5px solid rgba(255, 255, 255, .12); border-radius: 50% 50% 14px 50%; background-clip: padding-box; font-family: 'Noto Serif TC', serif; font-size: 2rem; }
.member-card .eyebrow { color: #e9c78e; }
.member-card h2 { margin-bottom: .35rem; }
.member-email { color: rgba(255, 255, 255, .6); font-size: .78rem; }
.member-note { position: relative; z-index: 1; display: flex; gap: .75rem; margin-top: 2rem; padding: 1rem; color: rgba(255, 255, 255, .72); background: rgba(255, 255, 255, .07); border-radius: 15px; font-size: .76rem; line-height: 1.7; }
.member-note i { color: #e9c78e; }
.logout-button { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: .5rem; margin-top: 2rem; padding: 0; color: #eab79f; background: transparent; border: 0; font-size: .8rem; font-weight: 700; }
.profile-form { padding: clamp(1.4rem, 4vw, 2.3rem); background: var(--paper); border: 1px solid var(--line); border-radius: 28px; box-shadow: 0 16px 45px rgba(42, 57, 48, .07); }
.form-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; padding-bottom: 1.3rem; border-bottom: 1px solid var(--line); }
.form-heading span { color: var(--terracotta); font-size: .72rem; font-weight: 700; letter-spacing: .12em; }
.form-heading h2 { margin: .3rem 0 0; font-size: 1.35rem; }
.form-heading > i { display: grid; width: 42px; height: 42px; place-items: center; color: var(--sage-deep); background: var(--sage); border-radius: 50%; }
.readonly-field { position: relative; }
.readonly-field i { position: absolute; z-index: 2; top: 50%; left: 1rem; transform: translateY(-50%); color: var(--ink-soft); font-size: .8rem; }
.readonly-field input { padding-left: 2.5rem; color: var(--ink-soft); background: #eeeee8; }
.form-text { color: var(--ink-soft); font-size: .7rem; }
.form-actions { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--line); }
.form-actions > span { color: var(--ink-soft); font-size: .72rem; }
.form-actions > span i { margin-right: .35rem; color: var(--sage-deep); }
.missing-profile { max-width: 680px; margin: 0 auto; padding: 4rem 2rem; text-align: center; background: var(--paper); border: 1px solid var(--line); border-radius: 30px; }
.missing-profile > div { display: grid; width: 80px; height: 80px; margin: 0 auto 1.5rem; place-items: center; color: var(--sage-deep); background: var(--sage); border-radius: 50%; font-size: 2rem; }
.missing-profile p { margin: 1rem 0 1.5rem; color: var(--ink-soft); }
@media (max-width: 991.98px) { .member-card { display: grid; grid-template-columns: auto 1fr; column-gap: 1.2rem; align-items: center; }.member-avatar { grid-row: 1 / 4; margin: 0; }.member-card .eyebrow, .member-card h2 { margin-bottom: .2rem; }.member-note, .logout-button { grid-column: 1 / -1; } }
@media (max-width: 767.98px) { .profile-heading { align-items: start; flex-direction: column; }.form-actions { align-items: stretch; flex-direction: column; }.form-actions button { width: 100%; } }
@media (max-width: 575.98px) { .member-card { display: block; }.member-avatar { margin-bottom: 1.4rem; }.profile-form { border-radius: 22px; } }
</style>
