<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMarketStore } from '../../stores/market'

const route = useRoute()
const store = useMarketStore()

const loading = ref(false)
const fetchedNotifications = ref([])
const selectedNotification = ref(null)
const resolvedToken = ref('')
const state = ref('missing')
const errorMessage = ref('')

const requestedEmail = computed(() => String(route.query.email || store.currentCreator?.email || '').trim())
const notifications = computed(() => {
  const source = fetchedNotifications.value.length ? fetchedNotifications.value : (store.creatorNotifications || [])
  return source.filter((notification) => !requestedEmail.value
    || !notification.email
    || notification.email.toLowerCase() === requestedEmail.value.toLowerCase())
})
const mail = computed(() => selectedNotification.value || notifications.value[0] || null)
const mailEmail = computed(() => mail.value?.email || requestedEmail.value)
const creatorName = computed(() => mail.value?.creatorName || mail.value?.name || store.currentCreator?.name || '創作者')
const approvalPath = computed(() => ({
  path: '/creator/login',
  query: { approvalToken: resolvedToken.value, email: mailEmail.value },
}))
const displayApprovalUrl = computed(() => {
  if (!resolvedToken.value || !mailEmail.value) return ''
  const origin = typeof window === 'undefined' ? 'https://muguang.tw' : window.location.origin
  return `${origin}/creator/login?approvalToken=${encodeURIComponent(resolvedToken.value)}&email=${encodeURIComponent(mailEmail.value)}`
})
const isExpired = computed(() => {
  if (state.value === 'expired') return true
  if (!mail.value?.expiresAt) return false
  const expiresAt = new Date(mail.value.expiresAt)
  return !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() < Date.now()
})

function formatDate(value) {
  if (!value) return '剛剛'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('zh-TW', { dateStyle: 'long', timeStyle: 'short' }).format(date)
}

function getNotificationToken(notification) {
  return String(notification?.approvalToken || notification?.token || '').trim()
}

async function loadMail() {
  loading.value = true
  state.value = 'missing'
  errorMessage.value = ''
  selectedNotification.value = null
  fetchedNotifications.value = []

  try {
    if (requestedEmail.value) {
      const notificationResult = await Promise.resolve(store.getCreatorNotifications(requestedEmail.value))
      if (Array.isArray(notificationResult)) fetchedNotifications.value = notificationResult
      else if (Array.isArray(notificationResult?.notifications)) fetchedNotifications.value = notificationResult.notifications
    }

    const queryToken = String(route.query.approvalToken || route.query.token || '').trim()
    const fallbackMail = notifications.value.find((notification) => getNotificationToken(notification)) || notifications.value[0]
    resolvedToken.value = queryToken || getNotificationToken(fallbackMail)

    if (!resolvedToken.value) {
      selectedNotification.value = fallbackMail || null
      state.value = fallbackMail ? 'missing_token' : 'missing'
      return
    }

    const approvalResult = await Promise.resolve(store.getApprovalNotification(resolvedToken.value))
    if (approvalResult?.ok === false) {
      selectedNotification.value = approvalResult.notification || fallbackMail || null
      const reason = String(approvalResult.reason || approvalResult.code || approvalResult.message || '').toLowerCase()
      state.value = approvalResult.expired || reason.includes('expired') || reason.includes('過期') ? 'expired' : 'missing'
      errorMessage.value = approvalResult.message || ''
      return
    }

    selectedNotification.value = approvalResult?.notification || approvalResult || fallbackMail || null
    if (!selectedNotification.value) {
      state.value = 'missing'
      return
    }
    state.value = 'ready'
    if (isExpired.value) state.value = 'expired'
  } catch (mailError) {
    state.value = 'error'
    errorMessage.value = mailError?.message || '目前無法載入模擬通知信'
  } finally {
    loading.value = false
  }
}

watch(
  () => [route.query.email, route.query.approvalToken, route.query.token],
  loadMail,
  { immediate: true },
)
</script>

<template>
  <section class="mail-page">
    <div class="mail-heading">
      <div><p class="eyebrow mb-2">Demo mailbox</p><h1>創作者模擬信箱</h1><p>在展示環境中查看平台寄出的審核通知與安全登入連結。</p></div>
      <RouterLink class="btn btn-outline-ink" to="/creator/onboarding">返回合作進度</RouterLink>
    </div>

    <div class="mail-shell">
      <aside class="mail-sidebar">
        <div class="mailbox-title"><span class="brand-seal">暮</span><div><strong>暮光郵務</strong><small>Creator Mail</small></div></div>
        <nav>
          <span class="active"><i class="bi bi-inbox-fill"></i> 收件匣 <b>{{ notifications.length }}</b></span>
          <span><i class="bi bi-star"></i> 已加星號</span>
          <span><i class="bi bi-archive"></i> 封存郵件</span>
        </nav>
        <div class="demo-notice"><i class="bi bi-info-circle"></i><p><strong>這是模擬信箱</strong>不會寄送真實郵件，僅用於展示審核流程。</p></div>
      </aside>

      <main class="mail-content">
        <div class="mail-toolbar"><span><i class="bi bi-shield-lock"></i> 平台內部安全檢視</span><span v-if="mailEmail">收件人：{{ mailEmail }}</span></div>

        <div v-if="loading" class="mail-state"><span class="spinner-border text-secondary"></span><p>正在安全載入郵件</p></div>

        <article v-else-if="state === 'ready' && mail && !isExpired" class="email-paper">
          <header class="email-header">
            <div class="sender-avatar">暮</div>
            <div class="sender-copy"><strong>暮光集所・創作者團隊</strong><span>creator@muguang.tw</span><small>寄給 {{ mailEmail }}</small></div>
            <time>{{ formatDate(mail.createdAt || mail.sentAt) }}</time>
          </header>

          <div class="email-body">
            <div class="email-brand"><span class="brand-seal">暮</span><span>暮光集所</span></div>
            <p class="email-kicker">CREATOR REVIEW NOTICE</p>
            <h2>{{ mail.subject || mail.title || '你的創作者合作申請已有審核結果' }}</h2>
            <p>{{ creatorName }}，你好：</p>
            <p>{{ mail.message || mail.body || '我們已完成你的創作者合作申請審核。請使用下方安全連結登入工作室，查看完整審核結果與下一步說明。' }}</p>

            <div class="result-card">
              <i class="bi bi-patch-check-fill"></i>
              <div><small>申請狀態已更新</small><strong>登入後安全查看審核結果</strong></div>
            </div>

            <RouterLink class="secure-button" :to="approvalPath"><i class="bi bi-shield-lock-fill"></i> 安全登入並查看結果</RouterLink>

            <div class="secure-link-box">
              <div><i class="bi bi-lock-fill"></i><span><strong>專屬安全連結</strong><small>連結包含一次性審核憑證，請勿轉寄他人。</small></span></div>
              <code>{{ displayApprovalUrl }}</code>
              <small v-if="mail.expiresAt">有效期限：{{ formatDate(mail.expiresAt) }}</small>
            </div>

            <p class="email-signoff">謝謝你耐心等待，<br /><strong>暮光集所・創作者合作團隊</strong></p>
          </div>

          <footer class="email-footer"><i class="bi bi-shield-check"></i> 此郵件由暮光集所展示系統產生。登入時會同時驗證帳號密碼與審核憑證。</footer>
        </article>

        <div v-else-if="state === 'expired' || isExpired" class="mail-state state-expired">
          <span class="state-icon"><i class="bi bi-clock-history"></i></span>
          <h2>這封審核通知已過期</h2>
          <p>{{ errorMessage || '安全憑證已超過有效期限，無法再從這個連結登入。請回到創作者登入頁，或聯繫平台取得協助。' }}</p>
          <div class="d-flex flex-wrap justify-content-center gap-2"><RouterLink class="btn btn-accent" :to="{ path: '/creator/login', query: { email: mailEmail } }">前往一般登入</RouterLink><a class="btn btn-outline-ink" href="mailto:hello@muguang.tw">聯繫平台</a></div>
        </div>

        <div v-else class="mail-state">
          <span class="state-icon"><i :class="`bi bi-${state === 'error' ? 'exclamation-triangle' : 'envelope-x'}`"></i></span>
          <h2>{{ state === 'missing_token' ? '郵件缺少安全憑證' : state === 'error' ? '郵件暫時無法載入' : '找不到這封通知信' }}</h2>
          <p>{{ errorMessage || (state === 'missing_token' ? '這筆通知沒有可用的審核憑證，請由最新的審核通知重新進入。' : '連結可能不完整、通知已不存在，或收件信箱不正確。') }}</p>
          <RouterLink class="btn btn-outline-ink" to="/creator/onboarding">返回合作進度</RouterLink>
        </div>
      </main>
    </div>
  </section>
</template>

<style scoped>
.mail-page { max-width: 1220px; margin: 0 auto; }
.mail-heading { display: flex; align-items: end; justify-content: space-between; gap: 2rem; margin-bottom: 2rem; }
.mail-heading h1 { margin-bottom: .5rem; font-size: clamp(2rem, 4vw, 3rem); }
.mail-heading p:last-child { margin: 0; color: var(--ink-soft); }
.mail-shell { display: grid; grid-template-columns: 245px minmax(0, 1fr); min-height: 680px; overflow: hidden; background: var(--paper); border: 1px solid var(--line); border-radius: 26px 26px 8px 26px; box-shadow: var(--shadow); }
.mail-sidebar { display: flex; flex-direction: column; padding: 1.5rem; background: #e8eee5; border-right: 1px solid var(--line); }
.mailbox-title { display: flex; gap: .7rem; align-items: center; margin-bottom: 2rem; }
.mailbox-title div { display: grid; }
.mailbox-title small { color: var(--ink-soft); font-size: .65rem; letter-spacing: .08em; }
.mail-sidebar nav { display: grid; gap: .35rem; }
.mail-sidebar nav span { display: flex; gap: .7rem; align-items: center; padding: .7rem .8rem; color: var(--ink-soft); border-radius: 10px; font-size: .83rem; }
.mail-sidebar nav span.active { color: var(--ink); background: var(--paper); font-weight: 700; }
.mail-sidebar nav b { margin-left: auto; padding: .1rem .4rem; color: white; background: var(--terracotta); border-radius: 999px; font-size: .62rem; }
.demo-notice { display: flex; gap: .6rem; margin-top: auto; padding: .9rem; color: var(--ink-soft); background: rgba(255,255,255,.5); border-radius: 12px; font-size: .7rem; line-height: 1.6; }
.demo-notice p { margin: 0; }
.demo-notice strong { display: block; color: var(--ink); }
.mail-content { min-width: 0; background: #f5f3ed; }
.mail-toolbar { display: flex; justify-content: space-between; gap: 1rem; padding: 1rem 1.5rem; color: var(--ink-soft); background: var(--paper); border-bottom: 1px solid var(--line); font-size: .72rem; }
.email-paper { width: min(calc(100% - 3rem), 760px); margin: 1.5rem auto; background: white; border: 1px solid #deded7; border-radius: 12px; box-shadow: 0 12px 35px rgba(42,57,48,.08); }
.email-header { display: flex; gap: .8rem; align-items: center; padding: 1.2rem; border-bottom: 1px solid #e7e7e2; }
.sender-avatar { display: grid; width: 42px; height: 42px; flex: 0 0 42px; place-items: center; color: white; background: var(--ink); border-radius: 50%; font-family: 'Noto Serif TC', serif; }
.sender-copy { display: grid; flex: 1; font-size: .78rem; }
.sender-copy span, .sender-copy small, .email-header time { color: #778079; font-size: .68rem; }
.email-body { padding: clamp(1.5rem, 5vw, 3rem); color: #34453d; }
.email-brand { display: flex; gap: .6rem; align-items: center; margin-bottom: 2rem; font-family: 'Noto Serif TC', serif; font-weight: 700; }
.email-brand .brand-seal { width: 32px; height: 32px; }
.email-kicker { margin-bottom: .6rem !important; color: var(--terracotta) !important; font-size: .65rem; font-weight: 700; letter-spacing: .15em; }
.email-body h2 { margin-bottom: 1.5rem; font-size: clamp(1.5rem, 4vw, 2.1rem); line-height: 1.5; }
.email-body > p { color: #596b62; line-height: 1.9; white-space: pre-line; }
.result-card { display: flex; gap: 1rem; align-items: center; margin: 1.6rem 0; padding: 1.2rem; background: #e9f0e7; border-left: 4px solid var(--sage-deep); }
.result-card > i { color: var(--sage-deep); font-size: 1.6rem; }
.result-card div { display: grid; }
.result-card small { color: var(--ink-soft); }
.secure-button { display: flex; gap: .6rem; align-items: center; justify-content: center; width: 100%; margin: 1.5rem 0; padding: .9rem 1.2rem; color: white; background: var(--terracotta); border-radius: 999px; font-weight: 700; }
.secure-button:hover { color: white; background: #b95f3d; }
.secure-link-box { display: grid; gap: .7rem; padding: 1rem; background: #f7f7f3; border: 1px solid #e3e3dc; border-radius: 10px; }
.secure-link-box > div { display: flex; gap: .7rem; align-items: center; }
.secure-link-box span { display: grid; }
.secure-link-box small { color: #737d76; font-size: .68rem; }
.secure-link-box code { padding: .7rem; overflow-wrap: anywhere; color: #3d6250; background: white; border: 1px solid #e2e5e1; border-radius: 6px; font-size: .68rem; }
.email-signoff { margin-top: 2rem; }
.email-footer { padding: 1rem 1.5rem; color: #7b857f; background: #f4f4ef; border-top: 1px solid #e7e7e2; border-radius: 0 0 12px 12px; font-size: .68rem; text-align: center; }
.mail-state { display: grid; min-height: 590px; align-content: center; justify-items: center; padding: 2rem; color: var(--ink-soft); text-align: center; }
.mail-state p { max-width: 520px; line-height: 1.8; }
.state-icon { display: grid; width: 72px; height: 72px; margin-bottom: 1.2rem; place-items: center; color: var(--terracotta); background: var(--peach); border-radius: 24px 24px 7px 24px; font-size: 2rem; }
.state-expired .state-icon { color: #936024; background: #f7e4c5; }
@media (max-width: 991.98px) {
  .mail-shell { grid-template-columns: 1fr; }
  .mail-sidebar { display: none; }
}
@media (max-width: 575.98px) {
  .mail-heading { align-items: start; flex-direction: column; }
  .mail-toolbar { align-items: start; flex-direction: column; }
  .email-paper { width: calc(100% - 1rem); margin: .5rem; }
  .email-header { align-items: start; flex-wrap: wrap; }
  .email-header time { width: 100%; padding-left: 50px; }
}
</style>
