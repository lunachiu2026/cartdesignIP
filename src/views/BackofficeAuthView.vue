<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMarketStore } from '../stores/market'

const route = useRoute()
const router = useRouter()
const store = useMarketStore()

const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const showRegistrationModal = ref(false)
const registrationAcknowledged = ref(false)
const registeredBrand = ref('')
const isAdmin = computed(() => route.name === 'admin-login')
const isRegister = computed(() => route.name === 'creator-register')
const approvalToken = computed(() => String(route.query.approvalToken || '').trim())
const hasApprovalInvitation = computed(() => !isAdmin.value && Boolean(approvalToken.value))
const loginForm = reactive({ email: '', password: '' })
const registerForm = reactive({
  name: '', owner: '', email: '', password: '', phone: '', category: '紙品與插畫', location: '',
  bio: '', craftStory: '', materials: '', portfolio: '', social: '', applicationReason: '',
  acceptedTerms: false,
})

watch(
  () => [route.name, route.query.email],
  ([, email]) => {
    error.value = ''
    loginForm.email = typeof email === 'string' ? email : ''
    loginForm.password = ''
  },
  { immediate: true },
)

function fillDemo() {
  loginForm.email = isAdmin.value ? 'admin@muguang.tw' : 'creator@demo.tw'
  loginForm.password = isAdmin.value ? 'admin123' : '123456'
}

async function login() {
  error.value = ''
  if (!loginForm.email || !loginForm.password) {
    error.value = '請輸入完整帳號與密碼'
    return
  }

  loading.value = true
  try {
    const result = await Promise.resolve(store.backofficeLogin(
      loginForm.email,
      loginForm.password,
      isAdmin.value ? 'admin' : 'creator',
      approvalToken.value || undefined,
    ))
    if (!result?.ok) {
      error.value = result?.message || '登入失敗，請確認資料後再試一次'
      return
    }
    await router.push(isAdmin.value ? '/admin/dashboard' : '/creator/onboarding')
  } catch (loginError) {
    error.value = loginError?.message || '目前無法登入，請稍後再試'
  } finally {
    loading.value = false
  }
}

async function register() {
  error.value = ''
  const required = ['name', 'owner', 'email', 'phone', 'location', 'bio', 'craftStory', 'materials', 'applicationReason']
  if (required.some((key) => !registerForm[key].trim()) || registerForm.password.length < 6) {
    error.value = '請完整填寫所有必填資料，密碼至少需要 6 個字元'
    document.querySelector('#application-form')?.scrollIntoView({ behavior: 'smooth' })
    return
  }
  if (!registerForm.acceptedTerms) {
    error.value = '請先閱讀並同意創作者訂閱與審核條款'
    return
  }

  loading.value = true
  try {
    const { acceptedTerms, ...payload } = registerForm
    const result = await Promise.resolve(store.registerCreator(payload))
    if (!result?.ok) {
      error.value = result?.message || '送出申請時發生問題，請稍後再試'
      return
    }
    registeredBrand.value = registerForm.name
    registrationAcknowledged.value = false
    showRegistrationModal.value = true
  } catch (registerError) {
    error.value = registerError?.message || '目前無法送出申請，請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="isRegister" class="register-page">
    <header class="register-nav">
      <RouterLink class="brand-mark" to="/"><span class="brand-seal">暮</span><span>暮光集所</span></RouterLink>
      <div class="d-flex align-items-center gap-3">
        <span class="d-none d-sm-inline small text-secondary">已有創作者帳號？</span>
        <RouterLink class="btn btn-sm btn-outline-ink" to="/creator/login">登入工作室</RouterLink>
      </div>
    </header>

    <main>
      <section class="register-hero">
        <div class="container position-relative">
          <div class="row align-items-center g-5">
            <div class="col-lg-7">
              <p class="eyebrow">Creator partnership</p>
              <h1>讓好手藝，被懂得的人好好看見。</h1>
              <p class="hero-copy">暮光集所邀請重視材料、製程與文化故事的創作者，一起建立真誠而長久的生活選物市場。</p>
              <div class="d-flex flex-wrap gap-3">
                <a class="btn btn-accent" href="#application-form">開始合作申請</a>
                <a class="btn btn-outline-light" href="#creator-plan">了解訂閱方案</a>
              </div>
            </div>
            <div class="col-lg-5">
              <div class="hero-note">
                <span class="note-pin"></span>
                <p class="serif mb-3">「每件作品都有來處，每位創作者都值得一個安穩經營的位置。」</p>
                <small>暮光集所・創作者共好計畫</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="creator-plan" class="section-space plan-section">
        <div class="container">
          <div class="row g-5 align-items-center">
            <div class="col-lg-5">
              <p class="eyebrow">Simple monthly plan</p>
              <h2 class="section-title">一份透明的月費，陪你把心力留給創作。</h2>
              <p class="section-copy mb-0">通過審核後才開始計費，不收刊登費，也不在申請階段增加負擔。</p>
            </div>
            <div class="col-lg-7">
              <article class="pricing-card">
                <div>
                  <span class="pricing-kicker">創作者訂閱方案</span>
                  <div class="price"><small>NT$</small>299<span>／月</span></div>
                  <p class="text-secondary mb-0">每月自動續訂，可隨時於工作室查看紀錄。</p>
                </div>
                <ul class="inclusion-list">
                  <li><i class="bi bi-check2-circle"></i> 專屬品牌頁與商品上架工具</li>
                  <li><i class="bi bi-check2-circle"></i> 訂單、庫存與出貨管理</li>
                  <li><i class="bi bi-check2-circle"></i> 平台選品曝光與營運支援</li>
                  <li><i class="bi bi-check2-circle"></i> 清楚的訂閱與退款紀錄</li>
                </ul>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="section-space flow-section">
        <div class="container">
          <div class="text-center mx-auto section-heading">
            <p class="eyebrow">How it works</p>
            <h2 class="section-title">四步，讓作品走進市場</h2>
          </div>
          <div class="row g-4 mt-4">
            <div v-for="(step, index) in [
              ['register', '填寫申請', '完整分享品牌、材料與創作方式。'],
              ['pay', '完成付款', '選擇模擬付款方式，建立每月 NT$299 訂閱。'],
              ['review', '平台審核', '付款後開始審核，結果將以通知信寄出。'],
              ['sell', '開始販售', '核准後開啟上架權限，安心經營工作室。'],
            ]" :key="step[0]" class="col-sm-6 col-lg-3">
              <article class="flow-card">
                <span class="flow-number">0{{ index + 1 }}</span>
                <i :class="`bi bi-${['pencil-square', 'credit-card', 'search-heart', 'shop-window'][index]}`"></i>
                <h3>{{ step[1] }}</h3>
                <p>{{ step[2] }}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="section-space terms-section">
        <div class="container">
          <div class="row g-5">
            <div class="col-lg-4">
              <p class="eyebrow">Fair terms</p>
              <h2 class="section-title">先說清楚，合作才能走得長久。</h2>
            </div>
            <div class="col-lg-8">
              <div class="term-grid">
                <article><i class="bi bi-calendar-check"></i><div><h3>核准日起計費</h3><p>付款後進入審核；正式月週期自平台核准合作當日開始計算。</p></div></article>
                <article><i class="bi bi-hourglass-split"></i><div><h3>續費有 3 天寬限期</h3><p>續訂付款未完成時保留 3 天寬限，期間可補繳並維持經營權限。</p></div></article>
                <article><i class="bi bi-arrow-counterclockwise"></i><div><h3>未通過自動退款</h3><p>若申請未通過，該筆首次訂閱款將原路自動退回，不需另行申請。</p></div></article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-space faq-section">
        <div class="container faq-wrap">
          <p class="eyebrow text-center">Frequently asked</p>
          <h2 class="section-title text-center mb-5">申請前，常見的幾個問題</h2>
          <div class="accordion accordion-flush" id="creator-faq">
            <details open><summary>送出申請後多久會收到結果？</summary><p>完成付款後即進入審核，平台會依申請資料逐件確認，並透過模擬通知信提供結果與後續入口。</p></details>
            <details><summary>付款就代表一定會通過嗎？</summary><p>不是。付款用於建立訂閱資格，平台仍會審查創作原創性、製程資訊與品牌內容；未通過將自動退款。</p></details>
            <details><summary>何時可以開始上架商品？</summary><p>創作者狀態為「已核准」且訂閱狀態可用時，才會開放商品發佈權限。</p></details>
            <details><summary>續訂扣款失敗會立刻下架嗎？</summary><p>不會。系統提供 3 天寬限期供補繳；超過期限仍未完成付款，訂閱將鎖定並暫停發佈權限。</p></details>
          </div>
        </div>
      </section>

      <section id="application-form" class="section-space application-section">
        <div class="container">
          <div class="application-shell">
            <div class="application-intro">
              <p class="eyebrow">Application</p>
              <h2>把你的創作故事，完整交給我們。</h2>
              <p>標示 * 的欄位為必填。資料將作為選品審核依據，請盡可能提供具體內容。</p>
              <div class="application-aside"><i class="bi bi-shield-check"></i><span><strong>資料安心使用</strong><small>僅用於合作審核與後續聯繫。</small></span></div>
            </div>
            <div class="application-form-wrap">
              <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
              <form @submit.prevent="register">
                <h3 class="form-section-title"><span>01</span>品牌與聯絡資料</h3>
                <div class="row g-3 mb-5">
                  <div class="col-sm-6"><label class="form-label">品牌名稱 *</label><input v-model.trim="registerForm.name" class="form-control" required /></div>
                  <div class="col-sm-6"><label class="form-label">負責人姓名 *</label><input v-model.trim="registerForm.owner" class="form-control" required /></div>
                  <div class="col-sm-6"><label class="form-label">電子信箱 *</label><input v-model.trim="registerForm.email" type="email" class="form-control" autocomplete="email" required /></div>
                  <div class="col-sm-6"><label class="form-label">登入密碼 *</label><input v-model="registerForm.password" type="password" class="form-control" minlength="6" autocomplete="new-password" required /><div class="form-text">至少 6 個字元</div></div>
                  <div class="col-sm-6"><label class="form-label">聯絡電話 *</label><input v-model.trim="registerForm.phone" type="tel" class="form-control" required /></div>
                  <div class="col-sm-6"><label class="form-label">工作室所在地 *</label><input v-model.trim="registerForm.location" class="form-control" placeholder="例如：台南市中西區" required /></div>
                  <div class="col-12"><label class="form-label">創作類別 *</label><select v-model="registerForm.category" class="form-select"><option>紙品與插畫</option><option>陶藝器皿</option><option>織品與生活</option><option>木作</option><option>金工飾品</option><option>其他手作</option></select></div>
                </div>

                <h3 class="form-section-title"><span>02</span>創作內容與理念</h3>
                <div class="row g-3 mb-5">
                  <div class="col-12"><label class="form-label">品牌介紹 *</label><textarea v-model.trim="registerForm.bio" class="form-control" rows="3" placeholder="品牌如何開始？希望傳達什麼價值？" required></textarea></div>
                  <div class="col-12"><label class="form-label">創作理念與製作方式 *</label><textarea v-model.trim="registerForm.craftStory" class="form-control" rows="5" placeholder="請描述設計、製作流程，以及作品與你的關係。" required></textarea></div>
                  <div class="col-12"><label class="form-label">主要材料與來源 *</label><textarea v-model.trim="registerForm.materials" class="form-control" rows="3" placeholder="材料來源、製作媒材或安全資訊" required></textarea></div>
                </div>

                <h3 class="form-section-title"><span>03</span>作品參考與合作期待</h3>
                <div class="row g-3">
                  <div class="col-sm-6"><label class="form-label">作品集網址</label><input v-model.trim="registerForm.portfolio" type="url" class="form-control" placeholder="https://" /></div>
                  <div class="col-sm-6"><label class="form-label">社群網址</label><input v-model.trim="registerForm.social" type="url" class="form-control" placeholder="https://" /></div>
                  <div class="col-12"><label class="form-label">為什麼想加入暮光集所？ *</label><textarea v-model.trim="registerForm.applicationReason" class="form-control" rows="4" placeholder="期待在這裡遇見什麼樣的顧客與合作？" required></textarea></div>
                </div>

                <div class="form-check terms-check mt-4">
                  <input id="accepted-terms" v-model="registerForm.acceptedTerms" class="form-check-input" type="checkbox" />
                  <label class="form-check-label" for="accepted-terms">我已閱讀並同意：月費為 NT$299、核准日起計費、續費有 3 天寬限期，申請未通過將自動退款。</label>
                </div>
                <button class="btn btn-accent w-100 mt-4" :disabled="loading" type="submit"><span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>{{ loading ? '正在建立申請' : '送出申請，前往訂閱付款' }}</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div v-if="showRegistrationModal" class="registration-modal" role="dialog" aria-modal="true" aria-labelledby="registration-modal-title">
      <div class="modal-backdrop-custom"></div>
      <div class="registration-dialog">
        <div class="success-seal"><i class="bi bi-check-lg"></i></div>
        <p class="eyebrow mb-2">Application received</p>
        <h2 id="registration-modal-title">{{ registeredBrand }}，申請資料已建立</h2>
        <p class="text-secondary">下一步請完成首期 NT$299 訂閱付款。付款完成後，平台才會正式開始審核你的品牌資料。</p>
        <div class="modal-summary">
          <span><i class="bi bi-credit-card"></i> 首期付款 NT$299</span>
          <span><i class="bi bi-search"></i> 付款後開始審核</span>
          <span><i class="bi bi-arrow-counterclockwise"></i> 未通過自動退款</span>
        </div>
        <div class="form-check acknowledgement">
          <input id="registration-acknowledgement" v-model="registrationAcknowledged" class="form-check-input" type="checkbox" />
          <label class="form-check-label" for="registration-acknowledgement">我了解送出申請不等同審核通過，並同意先完成訂閱付款。</label>
        </div>
        <RouterLink class="btn btn-accent w-100" :class="{ disabled: !registrationAcknowledged }" :aria-disabled="!registrationAcknowledged" :tabindex="registrationAcknowledged ? 0 : -1" to="/creator/subscription/checkout">確認並前往付款</RouterLink>
        <small class="d-block text-center text-secondary mt-3">此視窗確認後才能繼續，不會自動前往工作室。</small>
      </div>
    </div>
  </div>

  <div v-else class="auth-page" :class="{ 'admin-auth': isAdmin }">
    <RouterLink class="brand-mark auth-brand" to="/"><span class="brand-seal">暮</span><span>暮光集所</span></RouterLink>
    <div class="auth-visual d-none d-lg-flex">
      <div><p class="eyebrow text-white-50">{{ isAdmin ? 'Platform operations' : 'Creator studio' }}</p><h1>{{ isAdmin ? '讓每一份創作，都在安心的地方發生。' : '回到工作室，繼續讓手藝發光。' }}</h1><p>{{ isAdmin ? '管理創作者、商品與訂單，維護平台每一天的信任。' : '查看審核與訂閱進度，照顧作品上架後的每一段旅程。' }}</p></div>
      <span>後台入口與顧客會員完全分離。</span>
    </div>
    <main class="auth-content">
      <div class="auth-card">
        <p class="eyebrow">{{ isAdmin ? 'Admin portal' : 'Creator portal' }}</p>
        <h1>{{ isAdmin ? '平台管理登入' : '創作者工作室登入' }}</h1>
        <p class="auth-subtitle">此入口僅供{{ isAdmin ? '平台授權管理人員' : '已申請合作的創作者' }}使用。</p>
        <div v-if="hasApprovalInvitation" class="approval-banner" role="status">
          <i class="bi bi-patch-check-fill"></i>
          <div><strong>你正透過審核通知連結登入</strong><span>信箱已預先帶入，登入後即可安全查看審核結果。</span></div>
        </div>
        <div v-if="error" class="alert alert-danger py-2 small">{{ error }}</div>
        <form @submit.prevent="login">
          <div class="mb-3"><label class="form-label">電子信箱</label><input v-model.trim="loginForm.email" type="email" class="form-control" autocomplete="username" required /></div>
          <div class="mb-4"><label class="form-label">密碼</label><div class="password-wrap"><input v-model="loginForm.password" :type="showPassword ? 'text' : 'password'" class="form-control" autocomplete="current-password" required /><button type="button" :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'" @click="showPassword = !showPassword"><i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i></button></div></div>
          <button class="btn btn-accent w-100" :disabled="loading"><span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>{{ loading ? '安全驗證中' : '安全登入' }}</button>
        </form>
        <button class="demo-account" type="button" @click="fillDemo"><i class="bi bi-key"></i><span>展示模式：點此帶入{{ isAdmin ? '管理員' : '創作者' }}測試帳號</span></button>
        <p v-if="!isAdmin" class="text-center small mt-4 mb-0">還沒有合作帳號？ <RouterLink class="auth-link" to="/creator/register">申請加入</RouterLink></p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.register-page { min-height: 100vh; overflow: hidden; background: var(--cream); }
.register-nav { position: absolute; z-index: 10; top: 0; left: 50%; display: flex; width: min(100% - 3rem, 1320px); align-items: center; justify-content: space-between; padding: 1.5rem 0; transform: translateX(-50%); }
.register-nav .brand-mark { color: white; }
.register-nav .btn { color: white; border-color: rgba(255,255,255,.65); }
.register-hero { position: relative; display: flex; min-height: 720px; align-items: center; padding: 9rem 0 6rem; color: white; background: linear-gradient(90deg, rgba(26,45,36,.94) 0%, rgba(26,45,36,.76) 56%, rgba(26,45,36,.35) 100%), url('https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1800&q=88') center/cover; }
.register-hero::after { position: absolute; right: -90px; bottom: -90px; width: 280px; height: 280px; border: 1px solid rgba(255,255,255,.2); border-radius: 50%; content: ''; }
.register-hero h1 { max-width: 760px; margin-bottom: 1.6rem; font-size: clamp(2.8rem, 6vw, 5.4rem); line-height: 1.25; letter-spacing: .02em; }
.hero-copy { max-width: 650px; margin-bottom: 2rem; color: rgba(255,255,255,.8); font-size: 1.08rem; line-height: 2; }
.hero-note { position: relative; margin-left: auto; padding: 2.2rem; color: var(--ink); background: rgba(255,253,248,.94); border-radius: 4px 28px 4px 28px; box-shadow: 0 24px 70px rgba(0,0,0,.2); transform: rotate(2deg); }
.hero-note p { font-size: 1.3rem; line-height: 1.8; }
.hero-note small { color: var(--ink-soft); }
.note-pin { position: absolute; top: -9px; left: 50%; width: 18px; height: 18px; background: var(--terracotta); border: 3px solid rgba(255,255,255,.9); border-radius: 50%; }
.section-heading { max-width: 650px; }
.plan-section { background: var(--paper); }
.pricing-card { display: grid; grid-template-columns: .9fr 1.1fr; gap: 2rem; padding: clamp(2rem, 5vw, 3.5rem); border: 1px solid var(--line); border-radius: 36px 36px 8px 36px; background: linear-gradient(135deg, #f6eadf, #eef3e9); box-shadow: var(--shadow); }
.pricing-kicker { color: var(--terracotta); font-weight: 700; }
.price { margin: .65rem 0; font-family: 'Noto Serif TC', serif; font-size: clamp(3.5rem, 7vw, 5.5rem); font-weight: 700; line-height: 1; }
.price small { margin-right: .3rem; font-family: 'Noto Sans TC', sans-serif; font-size: 1rem; }
.price span { color: var(--ink-soft); font-family: 'Noto Sans TC', sans-serif; font-size: 1rem; font-weight: 500; }
.inclusion-list { display: grid; align-content: center; gap: 1rem; margin: 0; padding: 0; list-style: none; }
.inclusion-list i { margin-right: .45rem; color: var(--sage-deep); }
.flow-section { background: #f0eee6; }
.flow-card { position: relative; height: 100%; min-height: 265px; padding: 2rem; overflow: hidden; background: var(--paper); border: 1px solid rgba(36,56,47,.12); border-radius: 24px 24px 6px 24px; }
.flow-card > i { display: block; margin: 2rem 0 1.5rem; color: var(--terracotta); font-size: 2rem; }
.flow-card h3 { font-size: 1.2rem; }
.flow-card p { margin: 0; color: var(--ink-soft); line-height: 1.75; }
.flow-number { position: absolute; top: 1rem; right: 1.4rem; color: #e8e2d5; font-family: 'Noto Serif TC', serif; font-size: 3.6rem; font-weight: 700; }
.terms-section { color: white; background: var(--ink); }
.terms-section .section-title { color: white; }
.term-grid { display: grid; gap: 1px; background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.15); }
.term-grid article { display: flex; gap: 1.3rem; padding: 1.6rem; background: var(--ink); }
.term-grid i { color: var(--gold); font-size: 1.5rem; }
.term-grid h3 { margin-bottom: .5rem; font-size: 1.1rem; }
.term-grid p { margin: 0; color: rgba(255,255,255,.68); line-height: 1.75; }
.faq-section { background: var(--paper); }
.faq-wrap { max-width: 900px; }
.faq-section details { border-bottom: 1px solid var(--line); }
.faq-section summary { position: relative; padding: 1.4rem 3rem 1.4rem 0; cursor: pointer; font-family: 'Noto Serif TC', serif; font-size: 1.08rem; font-weight: 700; list-style: none; }
.faq-section summary::after { position: absolute; top: 1.25rem; right: .4rem; color: var(--terracotta); font-size: 1.5rem; content: '+'; }
.faq-section details[open] summary::after { content: '−'; }
.faq-section details p { padding: 0 2.5rem 1.5rem 0; color: var(--ink-soft); line-height: 1.85; }
.application-section { background: #e7ece3; }
.application-shell { display: grid; grid-template-columns: minmax(260px, .65fr) minmax(0, 1.35fr); overflow: hidden; background: var(--paper); border: 1px solid var(--line); border-radius: 36px 36px 8px 36px; box-shadow: var(--shadow); }
.application-intro { padding: clamp(2rem, 5vw, 4rem); color: white; background: var(--ink); }
.application-intro h2 { margin-bottom: 1.4rem; font-size: clamp(2rem, 4vw, 3rem); line-height: 1.4; }
.application-intro > p:not(.eyebrow) { color: rgba(255,255,255,.7); line-height: 1.9; }
.application-aside { display: flex; gap: 1rem; align-items: center; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,.15); }
.application-aside i { color: var(--gold); font-size: 1.8rem; }
.application-aside span { display: grid; }
.application-aside small { color: rgba(255,255,255,.6); }
.application-form-wrap { padding: clamp(1.5rem, 5vw, 4rem); }
.form-section-title { display: flex; gap: .8rem; align-items: center; margin-bottom: 1.4rem; font-size: 1.2rem; }
.form-section-title span { display: grid; width: 34px; height: 34px; place-items: center; color: white; background: var(--terracotta); border-radius: 50%; font-family: 'Noto Sans TC', sans-serif; font-size: .72rem; }
.terms-check { padding: 1.2rem 1.2rem 1.2rem 2.8rem; background: var(--cream); border-radius: 14px; line-height: 1.7; }
.registration-modal { position: fixed; z-index: 2000; inset: 0; display: grid; place-items: center; padding: 1rem; }
.modal-backdrop-custom { position: absolute; inset: 0; background: rgba(19,32,26,.74); backdrop-filter: blur(6px); }
.registration-dialog { position: relative; width: min(100%, 570px); padding: clamp(2rem, 6vw, 3rem); background: var(--paper); border: 1px solid rgba(255,255,255,.5); border-radius: 30px 30px 8px 30px; box-shadow: 0 30px 90px rgba(0,0,0,.28); }
.registration-dialog h2 { margin-bottom: 1rem; font-size: 1.8rem; }
.success-seal { display: grid; width: 58px; height: 58px; margin-bottom: 1.4rem; place-items: center; color: white; background: var(--sage-deep); border-radius: 20px 20px 6px 20px; font-size: 1.6rem; }
.modal-summary { display: grid; gap: .55rem; margin: 1.5rem 0; padding: 1rem; background: var(--sage); border-radius: 14px; font-size: .88rem; }
.modal-summary i { width: 24px; color: var(--sage-deep); }
.acknowledgement { margin-bottom: 1.5rem; padding: 1rem 1rem 1rem 2.5rem; border: 1px solid var(--line); border-radius: 12px; line-height: 1.65; }
.auth-page { min-height: 100vh; display: grid; grid-template-columns: 43% 57%; background: var(--cream); }
.auth-brand { position: fixed; z-index: 2; top: 2rem; left: 2.5rem; color: white; }
.auth-visual { position: fixed; inset: 0 auto 0 0; width: 43%; flex-direction: column; justify-content: space-between; padding: 11rem 4rem 3rem; color: white; background: linear-gradient(rgba(27,48,38,.48), rgba(27,48,38,.84)), url('https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=85') center/cover; }
.admin-auth .auth-visual { background-image: linear-gradient(rgba(27,48,38,.58), rgba(27,48,38,.84)), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85'); }
.auth-visual h1 { font-size: clamp(2.3rem, 3.5vw, 4rem); line-height: 1.35; }
.auth-visual p:not(.eyebrow) { color: rgba(255,255,255,.78); line-height: 1.8; }
.auth-visual > span { color: rgba(255,255,255,.64); font-family: 'Noto Serif TC', serif; }
.auth-content { grid-column: 2; display: grid; min-height: 100vh; place-items: center; padding: 7rem 2rem 3rem; }
.auth-card { width: min(100%, 520px); padding: 2rem; }
.auth-card h1 { font-size: 2rem; }
.auth-subtitle { margin-bottom: 2rem; color: var(--ink-soft); line-height: 1.7; }
.approval-banner { display: flex; gap: .85rem; margin-bottom: 1.5rem; padding: 1rem; color: #315f41; background: #deecdf; border: 1px solid #bdd4c0; border-radius: 14px; }
.approval-banner i { font-size: 1.25rem; }
.approval-banner div { display: grid; gap: .2rem; }
.approval-banner span { font-size: .8rem; line-height: 1.5; }
.password-wrap { position: relative; }
.password-wrap input { padding-right: 3rem; }
.password-wrap button { position: absolute; top: 50%; right: .7rem; transform: translateY(-50%); border: 0; background: transparent; }
.demo-account { width: 100%; display: flex; gap: .6rem; margin-top: 1.2rem; padding: .8rem; border: 0; color: var(--ink-soft); background: var(--sage); border-radius: 10px; font-size: .75rem; }
.auth-link { color: var(--terracotta); font-weight: 700; }
@media (max-width: 991.98px) {
  .register-nav { position: relative; width: 100%; padding: 1rem 1.5rem; background: var(--ink); }
  .register-hero { min-height: auto; padding-top: 6rem; }
  .hero-note { margin-top: 1rem; }
  .pricing-card, .application-shell { grid-template-columns: 1fr; }
  .auth-page { display: block; }
  .auth-brand { position: absolute; color: var(--ink); }
  .auth-content { padding-top: 7rem; }
  .auth-card { padding: 1.2rem; }
}
@media (max-width: 575.98px) {
  .register-nav { padding-inline: 1rem; }
  .register-hero { padding: 4.5rem 0; }
  .register-hero h1 { font-size: 2.65rem; }
  .pricing-card { padding: 1.5rem; border-radius: 24px 24px 6px 24px; }
  .price { font-size: 3.6rem; }
  .application-shell { border-radius: 24px 24px 6px 24px; }
  .registration-dialog { max-height: calc(100vh - 2rem); overflow-y: auto; }
}
</style>
