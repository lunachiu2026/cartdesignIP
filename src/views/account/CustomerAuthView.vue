<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMarketStore } from '../../stores/market'

const route = useRoute()
const router = useRouter()
const store = useMarketStore()

const loading = ref(false)
const formError = ref('')
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const errors = reactive({})

const loginForm = reactive({
  email: 'member@demo.tw',
  password: '123456',
})

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
  phone: '',
  city: '',
  address: '',
})

const isRegister = computed(() => route.name === 'account-register')
const redirectTarget = computed(() => {
  const value = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : '/account/orders'
})
const alternateRoute = computed(() => ({
  name: isRegister.value ? 'account-login' : 'account-register',
  query: route.query.redirect ? { redirect: redirectTarget.value } : {},
}))

watch(isRegister, () => {
  formError.value = ''
  clearErrors()
})

function clearErrors() {
  Object.keys(errors).forEach((key) => delete errors[key])
}

function validateRegistration() {
  clearErrors()
  if (!registerForm.name.trim()) errors.name = '請填寫姓名。'
  if (!/^\S+@\S+\.\S+$/.test(registerForm.email.trim())) errors.email = '請輸入有效的電子信箱。'
  if (registerForm.password.length < 6) errors.password = '密碼至少需要 6 個字元。'
  if (registerForm.passwordConfirm !== registerForm.password) errors.passwordConfirm = '兩次輸入的密碼不一致。'
  if (!registerForm.phone.trim()) errors.phone = '請填寫聯絡電話。'
  if (!registerForm.city.trim()) errors.city = '請填寫縣市。'
  if (!registerForm.address.trim()) errors.address = '請填寫詳細地址。'
  return Object.keys(errors).length === 0
}

async function login() {
  formError.value = ''
  if (!loginForm.email.trim() || !loginForm.password) {
    formError.value = '請輸入電子信箱與密碼。'
    return
  }

  loading.value = true
  try {
    const result = await store.customerLogin(loginForm.email.trim(), loginForm.password)
    if (result === false || result?.ok === false) {
      formError.value = result?.message || '帳號或密碼不正確，請再試一次。'
      return
    }
    await router.push(redirectTarget.value)
  } catch (error) {
    formError.value = error?.message || '登入時發生問題，請稍後再試。'
  } finally {
    loading.value = false
  }
}

async function register() {
  formError.value = ''
  if (!validateRegistration()) return

  loading.value = true
  try {
    const result = await store.registerCustomer({
      name: registerForm.name.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password,
      phone: registerForm.phone.trim(),
      city: registerForm.city.trim(),
      address: registerForm.address.trim(),
    })
    if (result === false || result?.ok === false) {
      formError.value = result?.message || '註冊未完成，請確認資料後再試一次。'
      return
    }
    await router.push(redirectTarget.value)
  } catch (error) {
    formError.value = error?.message || '註冊時發生問題，請稍後再試。'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="customer-auth section-space">
    <div class="container">
      <div class="auth-frame">
        <div class="auth-story">
          <div>
            <p class="eyebrow">Member of Muguang</p>
            <h1>把喜歡的島嶼日常，<br>一件件收藏回家。</h1>
            <p>登入會員，查看每份作品從創作者手中出發的旅程，也讓下一次相遇更從容。</p>
          </div>
          <blockquote>
            <span>「</span>
            好物不只被擁有，也讓手藝與心意繼續流動。
          </blockquote>
        </div>

        <div class="auth-panel">
          <div class="auth-heading">
            <span class="auth-knot" aria-hidden="true"></span>
            <p class="eyebrow mb-2">{{ isRegister ? 'Join the market' : 'Welcome back' }}</p>
            <h2>{{ isRegister ? '成為集所會員' : '歡迎回到集所' }}</h2>
            <p>{{ isRegister ? '留下基本資料，往後的選物與訂單都能安心收好。' : '登入後，繼續看看那些有溫度的作品。' }}</p>
          </div>

          <div v-if="formError" class="alert alert-danger py-2 small" role="alert">
            <i class="bi bi-exclamation-circle me-1"></i>{{ formError }}
          </div>

          <form v-if="!isRegister" novalidate @submit.prevent="login">
            <div class="mb-3">
              <label class="form-label" for="customer-login-email">電子信箱</label>
              <input
                id="customer-login-email"
                v-model.trim="loginForm.email"
                class="form-control"
                type="email"
                autocomplete="email"
                required
              >
            </div>
            <div class="mb-4">
              <label class="form-label" for="customer-login-password">密碼</label>
              <div class="password-field">
                <input
                  id="customer-login-password"
                  v-model="loginForm.password"
                  class="form-control"
                  :type="showLoginPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                >
                <button type="button" :aria-label="showLoginPassword ? '隱藏密碼' : '顯示密碼'" @click="showLoginPassword = !showLoginPassword">
                  <i :class="showLoginPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
            </div>
            <button class="btn btn-accent w-100" type="submit" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              {{ loading ? '登入中' : '登入會員帳號' }}
            </button>
            <div class="demo-note">
              <i class="bi bi-key"></i>
              <span><strong>展示帳號</strong> member@demo.tw / 123456</span>
            </div>
          </form>

          <form v-else novalidate @submit.prevent="register">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label" for="customer-name">姓名</label>
                <input id="customer-name" v-model="registerForm.name" class="form-control" :class="{ 'is-invalid': errors.name }" autocomplete="name">
                <div class="invalid-feedback">{{ errors.name }}</div>
              </div>
              <div class="col-12">
                <label class="form-label" for="customer-email">電子信箱</label>
                <input id="customer-email" v-model="registerForm.email" class="form-control" :class="{ 'is-invalid': errors.email }" type="email" autocomplete="email">
                <div class="invalid-feedback">{{ errors.email }}</div>
              </div>
              <div class="col-sm-6">
                <label class="form-label" for="customer-password">密碼</label>
                <div class="password-field">
                  <input id="customer-password" v-model="registerForm.password" class="form-control" :class="{ 'is-invalid': errors.password }" :type="showRegisterPassword ? 'text' : 'password'" autocomplete="new-password">
                  <button type="button" :aria-label="showRegisterPassword ? '隱藏密碼' : '顯示密碼'" @click="showRegisterPassword = !showRegisterPassword">
                    <i :class="showRegisterPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                  <div class="invalid-feedback">{{ errors.password }}</div>
                </div>
              </div>
              <div class="col-sm-6">
                <label class="form-label" for="customer-password-confirm">確認密碼</label>
                <input id="customer-password-confirm" v-model="registerForm.passwordConfirm" class="form-control" :class="{ 'is-invalid': errors.passwordConfirm }" type="password" autocomplete="new-password">
                <div class="invalid-feedback">{{ errors.passwordConfirm }}</div>
              </div>
              <div class="col-12">
                <label class="form-label" for="customer-phone">聯絡電話</label>
                <input id="customer-phone" v-model="registerForm.phone" class="form-control" :class="{ 'is-invalid': errors.phone }" type="tel" autocomplete="tel" placeholder="09xx-xxx-xxx">
                <div class="invalid-feedback">{{ errors.phone }}</div>
              </div>
              <div class="col-sm-4">
                <label class="form-label" for="customer-city">縣市</label>
                <input id="customer-city" v-model="registerForm.city" class="form-control" :class="{ 'is-invalid': errors.city }" autocomplete="address-level1" placeholder="例如：台北市">
                <div class="invalid-feedback">{{ errors.city }}</div>
              </div>
              <div class="col-sm-8">
                <label class="form-label" for="customer-address">詳細地址</label>
                <input id="customer-address" v-model="registerForm.address" class="form-control" :class="{ 'is-invalid': errors.address }" autocomplete="street-address">
                <div class="invalid-feedback">{{ errors.address }}</div>
              </div>
            </div>
            <button class="btn btn-accent w-100 mt-4" type="submit" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              {{ loading ? '建立中' : '建立會員帳號' }}
            </button>
          </form>

          <p class="switch-auth mb-0">
            {{ isRegister ? '已經是會員？' : '第一次來到暮光集所？' }}
            <RouterLink :to="alternateRoute">{{ isRegister ? '回到登入' : '建立帳號' }}</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.customer-auth { position: relative; overflow: hidden; background: radial-gradient(circle at 8% 12%, rgba(216, 170, 96, .15), transparent 25%), #f2eee4; }
.customer-auth::after { position: absolute; right: -90px; bottom: -120px; width: 280px; height: 280px; border: 1px solid rgba(113, 140, 120, .3); border-radius: 50%; content: ''; }
.auth-frame { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(430px, .82fr); min-height: 660px; overflow: hidden; background: var(--paper); border: 1px solid rgba(36, 56, 47, .14); border-radius: 36px 36px 12px 36px; box-shadow: var(--shadow); }
.auth-story { display: flex; flex-direction: column; justify-content: space-between; padding: clamp(2.5rem, 6vw, 5rem); color: white; background: linear-gradient(145deg, rgba(28, 51, 40, .86), rgba(56, 78, 65, .67)), url('https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=85') center/cover; }
.auth-story .eyebrow { color: #efd7af; }
.auth-story h1 { max-width: 620px; margin: 1.1rem 0 1.5rem; font-size: clamp(2.25rem, 4.3vw, 4.25rem); line-height: 1.4; }
.auth-story p:not(.eyebrow) { max-width: 520px; color: rgba(255, 255, 255, .78); line-height: 1.9; }
.auth-story blockquote { max-width: 420px; margin: 3rem 0 0; color: rgba(255, 255, 255, .72); font-family: 'Noto Serif TC', serif; line-height: 1.8; }
.auth-story blockquote span { color: #efd7af; font-size: 2rem; }
.auth-panel { align-self: center; width: 100%; padding: clamp(2rem, 5vw, 4.5rem); }
.auth-heading { margin-bottom: 2rem; }
.auth-heading h2 { margin-bottom: .75rem; font-size: clamp(1.8rem, 3vw, 2.4rem); }
.auth-heading > p:last-child { color: var(--ink-soft); line-height: 1.7; }
.auth-knot { display: block; width: 44px; height: 5px; margin-bottom: 1.25rem; background: var(--terracotta); border-radius: 999px; box-shadow: 16px 8px 0 var(--gold); }
.password-field { position: relative; }
.password-field .form-control { padding-right: 3rem; }
.password-field button { position: absolute; z-index: 4; top: 50%; right: .65rem; width: 34px; height: 34px; padding: 0; transform: translateY(-50%); color: var(--ink-soft); background: transparent; border: 0; }
.password-field:has(.invalid-feedback) button { top: 25px; }
.demo-note { display: flex; align-items: center; gap: .75rem; margin-top: 1rem; padding: .8rem 1rem; color: var(--ink-soft); background: var(--sage); border-radius: 14px; font-size: .76rem; }
.demo-note i { color: var(--sage-deep); font-size: 1rem; }
.switch-auth { margin-top: 1.75rem; color: var(--ink-soft); text-align: center; font-size: .86rem; }
.switch-auth a { color: var(--terracotta); font-weight: 700; }
@media (max-width: 991.98px) { .auth-frame { grid-template-columns: 1fr; }.auth-story { min-height: 390px; }.auth-story blockquote { display: none; }.auth-panel { max-width: 620px; margin: 0 auto; } }
@media (max-width: 575.98px) { .customer-auth { padding: 2.5rem 0; }.auth-frame { border-radius: 24px 24px 8px 24px; }.auth-story { min-height: 300px; padding: 2rem 1.4rem; }.auth-story h1 { font-size: 2rem; }.auth-panel { padding: 2rem 1.25rem; } }
</style>
