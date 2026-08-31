<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useMarketStore } from '../../stores/market'

const route = useRoute()
const store = useMarketStore()
const rejectReason = ref('')
const suspendReason = ref('')
const approvalLink = ref('')
const actionError = ref('')

const creator = computed(() => store.getCreator(route.params.id))
const creatorProducts = computed(() => store.products.filter((product) => product.creatorId === route.params.id))
const reviewHistory = computed(() => [...(creator.value?.reviewHistory || [])].reverse())
const subscription = computed(() => creator.value?.subscription || {})
const subscriptionStatus = computed(() => store.getCreatorSubscriptionStatus(creator.value)?.status || 'unpaid')
const subscriptionOrders = computed(() => store.getCreatorSubscriptionOrders(creator.value?.id).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))))
const canApprove = computed(() => creator.value?.status === 'pending' && subscriptionStatus.value === 'prepaid')

const statusDetails = {
  awaiting_payment: { label: '等待付款', className: 'status-inactive' },
  pending: { label: '待審核', className: 'status-pending' },
  approved: { label: '合作中', className: 'status-approved' },
  rejected: { label: '未通過', className: 'status-suspended' },
  suspended: { label: '已停權', className: 'status-suspended' },
}

function displayValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join('、') || '未提供'
  return value || '未提供'
}

function formatDate(value) {
  if (!value) return '未提供'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function formatCurrency(value) {
  return `NT$ ${Number(value || 0).toLocaleString('zh-TW')}`
}

function safeUrl(value) {
  const rawUrl = String(value || '').trim()
  if (!rawUrl) return ''

  try {
    const url = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

function normalizeLinks(value, fallbackLabel) {
  if (!value) return []

  const items = Array.isArray(value)
    ? value
    : typeof value === 'object'
      ? value.url || value.href || value.link
        ? [value]
        : Object.entries(value).map(([label, url]) => ({ label, url }))
      : String(value).split(/[,\n]/).map((url) => url.trim()).filter(Boolean)

  return items.map((item, index) => {
    const rawUrl = typeof item === 'string' ? item : item.url || item.href || item.link
    return {
      label: typeof item === 'string' ? `${fallbackLabel} ${index + 1}` : item.label || item.title || item.name || `${fallbackLabel} ${index + 1}`,
      url: safeUrl(rawUrl),
    }
  }).filter((item) => item.url)
}

function approveCreator() {
  if (!creator.value || !window.confirm(`確定核准「${creator.value.name}」的創作者申請嗎？`)) return
  actionError.value = ''
  const result = store.setCreatorStatus(creator.value.id, 'approved', '管理員核准申請')
  if (!result?.ok) {
    actionError.value = result?.message || '無法核准此申請'
    return
  }
  approvalLink.value = result.link || ''
  rejectReason.value = ''
}

function rejectCreator() {
  const reason = rejectReason.value.trim()
  if (!creator.value || !reason) return
  actionError.value = ''
  const result = store.setCreatorStatus(creator.value.id, 'rejected', reason)
  if (!result?.ok) {
    actionError.value = result?.message || '無法退回此申請'
    return
  }
  rejectReason.value = ''
}

function suspendCreator() {
  const reason = suspendReason.value.trim()
  if (!creator.value || !reason) return
  store.setCreatorStatus(creator.value.id, 'suspended', reason)
  suspendReason.value = ''
}

function restoreCreator() {
  if (!creator.value || !window.confirm(`確定恢復「${creator.value.name}」的合作資格嗎？`)) return
  store.setCreatorStatus(creator.value.id, 'approved', '管理員恢復合作資格')
}
</script>

<template>
  <section>
    <RouterLink class="d-inline-flex align-items-center gap-2 text-decoration-none mb-4" to="/admin/creators">
      <i class="bi bi-arrow-left"></i>
      返回創作者管理
    </RouterLink>

    <div v-if="creator">
      <div class="mb-4">
        <p class="eyebrow mb-2">創作者申請</p>
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <h1 class="dashboard-title mb-2">創作者申請詳情</h1>
            <p class="dashboard-subtitle mb-0">完整檢視申請資料、作品與審核紀錄。</p>
          </div>
          <span class="status-pill" :class="statusDetails[creator.status]?.className">
            {{ statusDetails[creator.status]?.label || creator.status }}
          </span>
        </div>
      </div>

      <div class="panel overflow-hidden p-0 mb-4">
        <div v-if="creator.cover" class="application-cover">
          <img :src="creator.cover" :alt="`${creator.name} 封面`">
        </div>
        <div v-else class="application-cover-placeholder d-flex align-items-center justify-content-center text-secondary">
          <i class="bi bi-image fs-1"></i>
        </div>
        <div class="p-4">
          <div class="d-flex flex-column flex-sm-row align-items-sm-end gap-3 application-identity">
            <img v-if="creator.avatar" :src="creator.avatar" :alt="creator.name" class="application-avatar">
            <div v-else class="application-avatar application-avatar-placeholder d-flex align-items-center justify-content-center">
              <i class="bi bi-person fs-2"></i>
            </div>
            <div class="pb-sm-2">
              <h2 class="h3 mb-1">{{ creator.name }}</h2>
              <p class="text-secondary mb-0">負責人：{{ displayValue(creator.owner) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="approvalLink" class="alert alert-success d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div><strong class="d-block"><i class="bi bi-envelope-check me-2"></i>核准完成，模擬 Email 已建立</strong><span class="small">月租已從今天起算一個月，可開啟通知信確認登入連結。</span></div>
        <RouterLink class="btn btn-sm btn-primary" :to="approvalLink">開啟模擬通知信</RouterLink>
      </div>
      <div v-if="actionError" class="alert alert-danger mb-4">{{ actionError }}</div>

      <div class="row g-4">
        <div class="col-12 col-xl-8">
          <div class="panel mb-4">
            <h2 class="h5 mb-4">基本與聯絡資料</h2>
            <dl class="row application-data mb-0">
              <dt class="col-sm-4 col-lg-3">申請狀態</dt>
              <dd class="col-sm-8 col-lg-9">{{ statusDetails[creator.status]?.label || creator.status }}</dd>
              <dt class="col-sm-4 col-lg-3">申請日期</dt>
              <dd class="col-sm-8 col-lg-9">{{ formatDate(creator.appliedAt) }}</dd>
              <dt class="col-sm-4 col-lg-3">創作類別</dt>
              <dd class="col-sm-8 col-lg-9">{{ displayValue(creator.category) }}</dd>
              <dt class="col-sm-4 col-lg-3">所在地</dt>
              <dd class="col-sm-8 col-lg-9">{{ displayValue(creator.location) }}</dd>
              <dt class="col-sm-4 col-lg-3">Email</dt>
              <dd class="col-sm-8 col-lg-9">
                <a v-if="creator.email" :href="`mailto:${creator.email}`">{{ creator.email }}</a>
                <span v-else>未提供</span>
              </dd>
              <dt class="col-sm-4 col-lg-3">聯絡電話</dt>
              <dd class="col-sm-8 col-lg-9">
                <a v-if="creator.phone" :href="`tel:${creator.phone}`">{{ creator.phone }}</a>
                <span v-else>未提供</span>
              </dd>
            </dl>
          </div>

          <div class="panel mb-4">
            <div class="d-flex justify-content-between align-items-start gap-3 mb-4"><div><h2 class="h5 mb-1">上架月租與付款</h2><p class="text-secondary small mb-0">核准前必須確認首期 NT$299 已付款。</p></div><span class="status-pill" :class="subscriptionStatus === 'active' || subscriptionStatus === 'prepaid' ? 'status-approved' : subscriptionStatus === 'refunded' ? 'status-completed' : 'status-inactive'">{{ { unpaid: '未付款', prepaid: '首期已付款', active: '訂閱有效', grace: '寬限期', locked: '已鎖定', refunded: '已退款' }[subscriptionStatus] || subscriptionStatus }}</span></div>
            <dl class="row application-data mb-4"><dt class="col-sm-4">方案</dt><dd class="col-sm-8">創作者月訂閱 NT$299／月</dd><dt class="col-sm-4">計費起算</dt><dd class="col-sm-8">{{ subscription.startedAt ? formatDate(subscription.startedAt) : '核准當日開始' }}</dd><dt class="col-sm-4">本期到期</dt><dd class="col-sm-8">{{ subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : '尚未起算' }}</dd><dt class="col-sm-4">寬限截止</dt><dd class="col-sm-8">{{ subscription.graceEndsAt ? formatDate(subscription.graceEndsAt) : '尚未起算' }}</dd></dl>
            <div v-if="subscriptionOrders.length" class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th>訂單編號</th><th>金額</th><th>狀態</th><th>日期</th></tr></thead><tbody><tr v-for="order in subscriptionOrders" :key="order.id"><td class="fw-semibold">{{ order.id }}</td><td>NT$ {{ order.amount }}</td><td><span class="status-pill" :class="order.status === 'paid' ? 'status-approved' : 'status-completed'">{{ order.status === 'paid' ? '付款完成' : order.status === 'refunded' ? '已退款' : order.status }}</span></td><td>{{ formatDate(order.refundedAt || order.paidAt) }}</td></tr></tbody></table></div>
            <div v-else class="text-secondary small"><i class="bi bi-receipt me-2"></i>目前沒有月租付款紀錄。</div>
          </div>

          <div class="panel mb-4">
            <h2 class="h5 mb-4">品牌與創作內容</h2>
            <div class="application-section">
              <h3>品牌簡介</h3>
              <p>{{ displayValue(creator.bio) }}</p>
            </div>
            <div class="application-section">
              <h3>創作故事</h3>
              <p>{{ displayValue(creator.craftStory) }}</p>
            </div>
            <div class="application-section">
              <h3>使用材料</h3>
              <p>{{ displayValue(creator.materials) }}</p>
            </div>
            <div class="application-section">
              <h3>申請原因</h3>
              <p>{{ displayValue(creator.applicationReason) }}</p>
            </div>
            <div class="application-section">
              <h3>作品集</h3>
              <div v-if="normalizeLinks(creator.portfolio, '作品集').length" class="d-flex flex-wrap gap-2">
                <a
                  v-for="link in normalizeLinks(creator.portfolio, '作品集')"
                  :key="link.url"
                  class="btn btn-sm btn-outline-ink"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ link.label }} <i class="bi bi-box-arrow-up-right ms-1"></i>
                </a>
              </div>
              <p v-else>未提供</p>
            </div>
            <div class="application-section mb-0">
              <h3>社群連結</h3>
              <div v-if="normalizeLinks(creator.social, '社群').length" class="d-flex flex-wrap gap-2">
                <a
                  v-for="link in normalizeLinks(creator.social, '社群')"
                  :key="`${link.label}-${link.url}`"
                  class="btn btn-sm btn-outline-ink"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ link.label }} <i class="bi bi-box-arrow-up-right ms-1"></i>
                </a>
              </div>
              <p v-else>未提供</p>
            </div>
          </div>

          <div class="panel">
            <div class="d-flex justify-content-between align-items-center gap-3 mb-4">
              <h2 class="h5 mb-0">商品預覽</h2>
              <span class="text-secondary small">共 {{ creatorProducts.length }} 件</span>
            </div>
            <div v-if="creatorProducts.length" class="row g-3">
              <div v-for="product in creatorProducts" :key="product.id" class="col-12 col-sm-6 col-lg-4">
                <article class="card h-100 border-0 bg-body-tertiary overflow-hidden">
                  <img :src="product.image" :alt="product.name" class="product-preview-image card-img-top">
                  <div class="card-body">
                    <p class="small text-secondary mb-1">{{ product.category }}</p>
                    <h3 class="h6 mb-2">{{ product.name }}</h3>
                    <p class="fw-semibold mb-0">{{ formatCurrency(product.price) }}</p>
                  </div>
                </article>
              </div>
            </div>
            <div v-else class="text-center text-secondary py-4">
              <i class="bi bi-box-seam fs-2 d-block mb-2"></i>
              尚未建立商品
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-4">
          <div class="panel mb-4">
            <h2 class="h5 mb-3">審核操作</h2>

            <div v-if="creator.status === 'pending'">
              <button class="btn btn-primary w-100 mb-2" type="button" :disabled="!canApprove" @click="approveCreator">核准申請並寄送通知</button>
              <p v-if="!canApprove" class="text-danger small mb-4">首期月租尚未完成，不能核准。</p>
              <p v-else class="text-secondary small mb-4">核准後將從今天開始計費，並建立含登入連結的模擬 Email。</p>
              <form @submit.prevent="rejectCreator">
                <label class="form-label fw-semibold" for="reject-reason">不通過原因</label>
                <textarea
                  id="reject-reason"
                  v-model="rejectReason"
                  class="form-control mb-3"
                  rows="4"
                  required
                  placeholder="請填寫原因，供申請者了解需改善之處"
                ></textarea>
                <button class="btn btn-outline-danger w-100" type="submit">退回申請</button>
              </form>
            </div>

            <div v-else-if="creator.status === 'awaiting_payment'" class="text-secondary small"><i class="bi bi-hourglass-split me-2"></i>等待創作者完成首期付款後才會進入審核。</div>

            <div v-else-if="creator.status === 'rejected'" class="text-secondary small"><i class="bi bi-arrow-counterclockwise me-2"></i>申請已退回，首期款已退款；等待創作者更新資料並重新付款。</div>

            <form v-else-if="creator.status === 'approved'" @submit.prevent="suspendCreator">
              <label class="form-label fw-semibold" for="suspend-reason">停權原因</label>
              <textarea
                id="suspend-reason"
                v-model="suspendReason"
                class="form-control mb-3"
                rows="4"
                required
                placeholder="請填寫停權原因"
              ></textarea>
              <button class="btn btn-outline-danger w-100" type="submit">停權創作者</button>
            </form>

            <div v-else-if="creator.status === 'suspended'">
              <p class="text-secondary small">恢復後，創作者可重新登入後台並繼續合作。</p>
              <button class="btn btn-primary w-100" type="button" @click="restoreCreator">恢復合作資格</button>
            </div>

            <p v-else class="text-secondary mb-0">此狀態目前沒有可執行的審核操作。</p>
          </div>

          <div class="panel">
            <h2 class="h5 mb-4">審核紀錄</h2>
            <div v-if="reviewHistory.length" class="review-history">
              <div v-for="(review, index) in reviewHistory" :key="review.id || `${review.createdAt || review.date}-${index}`" class="review-entry">
                <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <span class="status-pill" :class="statusDetails[review.status || review.action]?.className">
                    {{ statusDetails[review.status || review.action]?.label || review.status || review.action || '狀態更新' }}
                  </span>
                  <time class="text-secondary small">{{ formatDate(review.createdAt || review.date) }}</time>
                </div>
                <p v-if="review.note || review.reason" class="mb-2 text-break">{{ review.note || review.reason }}</p>
                <small class="text-secondary">審核人員：{{ review.reviewer || review.reviewerName || '管理員' }}</small>
              </div>
            </div>
            <p v-else class="text-secondary mb-0">尚無審核紀錄。</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="panel empty-state">
      <i class="bi bi-person-x"></i>
      <h1 class="h4">找不到這位創作者</h1>
      <p class="text-secondary">此申請可能已被移除，或網址中的編號有誤。</p>
      <RouterLink class="btn btn-primary" to="/admin/creators">返回創作者管理</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.application-cover,
.application-cover-placeholder {
  height: 240px;
  background: var(--cream);
}

.application-cover img,
.product-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.application-identity {
  margin-top: -76px;
}

.application-avatar {
  width: 120px;
  height: 120px;
  flex: 0 0 auto;
  border: 5px solid var(--paper);
  border-radius: 50%;
  background: var(--cream);
  object-fit: cover;
}

.application-data dt,
.application-data dd {
  padding-top: .65rem;
  padding-bottom: .65rem;
  border-bottom: 1px solid var(--line);
}

.application-data dt {
  color: var(--ink-soft);
  font-weight: 500;
}

.application-section {
  margin-bottom: 1.75rem;
}

.application-section h3 {
  margin-bottom: .5rem;
  color: var(--ink-soft);
  font-size: .85rem;
  font-weight: 700;
  letter-spacing: .08em;
}

.application-section p {
  margin-bottom: 0;
  white-space: pre-line;
}

.product-preview-image {
  height: 170px;
}

.review-entry {
  position: relative;
  padding: 0 0 1.25rem 1.25rem;
  border-left: 2px solid var(--line);
}

.review-entry::before {
  position: absolute;
  top: 0;
  left: -6px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ink);
  content: '';
}

.review-entry:last-child {
  padding-bottom: 0;
}

@media (max-width: 575.98px) {
  .application-cover,
  .application-cover-placeholder {
    height: 180px;
  }

  .application-identity {
    margin-top: -64px;
  }

  .application-avatar {
    width: 96px;
    height: 96px;
  }
}
</style>
