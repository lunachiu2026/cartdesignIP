import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { seedCreatorNotifications, seedCreators, seedCustomers, seedOrders, seedProducts, seedSubscriptionOrders } from '../data/seed.js'

const STORAGE_KEY = 'muguang-market-v3'
const seedCategories = ['紙品', '陶藝', '布作', '木作', '其他手作']

const clone = (value) => JSON.parse(JSON.stringify(value))
const addDays = (value, days) => {
  const date = new Date(value)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}
const addMonth = (value) => {
  const date = new Date(value)
  const originalDay = date.getDate()
  date.setDate(1)
  date.setMonth(date.getMonth() + 1)
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  date.setDate(Math.min(originalDay, lastDay))
  return date.toISOString()
}
const makeToken = () => `approval-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

export const useMarketStore = defineStore('market', () => {
  const initialized = ref(false)
  const creators = ref([])
  const products = ref([])
  const orders = ref([])
  const categories = ref([])
  const customers = ref([])
  const subscriptionOrders = ref([])
  const creatorNotifications = ref([])
  const cart = ref([])
  const customerSession = ref(null)
  const backofficeSession = ref(null)
  const lastOrderIds = ref([])

  const currentCreator = computed(() => creators.value.find((item) => item.id === backofficeSession.value?.creatorId))
  const currentCustomer = computed(() => customers.value.find((item) => item.id === customerSession.value?.customerId))
  const activeProducts = computed(() => products.value.filter((item) => {
    const creator = creators.value.find((entry) => entry.id === item.creatorId)
    return item.status === 'active' && item.stock > 0 && creator?.status === 'approved'
  }))
  const cartCount = computed(() => cart.value.reduce((total, item) => total + item.qty, 0))
  const cartDetails = computed(() => cart.value.map((line) => {
    const product = products.value.find((item) => item.id === line.productId)
    return product ? { ...line, product, lineTotal: product.price * line.qty } : null
  }).filter(Boolean))
  const cartSubtotal = computed(() => cartDetails.value.reduce((total, item) => total + item.lineTotal, 0))

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      creators: creators.value,
      products: products.value,
      orders: orders.value,
      categories: categories.value,
      customers: customers.value,
      subscriptionOrders: subscriptionOrders.value,
      creatorNotifications: creatorNotifications.value,
      cart: cart.value,
      customerSession: customerSession.value,
      backofficeSession: backofficeSession.value,
      lastOrderIds: lastOrderIds.value,
    }))
  }

  function initialize() {
    if (initialized.value) return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        creators.value = data.creators || clone(seedCreators)
        products.value = data.products || clone(seedProducts)
        orders.value = data.orders || clone(seedOrders)
        categories.value = data.categories || clone(seedCategories)
        customers.value = data.customers || clone(seedCustomers)
        subscriptionOrders.value = data.subscriptionOrders || clone(seedSubscriptionOrders)
        creatorNotifications.value = data.creatorNotifications || clone(seedCreatorNotifications)
        cart.value = data.cart || []
        customerSession.value = data.customerSession || null
        backofficeSession.value = data.backofficeSession || null
        lastOrderIds.value = data.lastOrderIds || []
      } catch {
        resetData()
      }
    } else {
      resetData()
    }
    initialized.value = true
  }

  function resetData() {
    const activeAdminSession = backofficeSession.value?.role === 'admin' ? clone(backofficeSession.value) : null
    creators.value = clone(seedCreators)
    products.value = clone(seedProducts)
    orders.value = clone(seedOrders)
    categories.value = clone(seedCategories)
    customers.value = clone(seedCustomers)
    subscriptionOrders.value = clone(seedSubscriptionOrders)
    creatorNotifications.value = clone(seedCreatorNotifications)
    cart.value = []
    customerSession.value = null
    backofficeSession.value = activeAdminSession
    lastOrderIds.value = []
    persist()
  }

  function getCreator(id) {
    return creators.value.find((item) => item.id === id)
  }

  function getProduct(id) {
    return products.value.find((item) => item.id === id)
  }

  function getCreatorSubscriptionStatus(creator) {
    if (!creator) return { status: 'locked' }
    const subscription = creator.subscription || { plan: 'creator-monthly', amount: 299, status: 'unpaid' }
    if (creator.status !== 'approved') return { ...subscription, status: subscription.status || 'unpaid' }
    if (subscription.demoStatus) return { ...subscription, status: subscription.demoStatus }
    const now = Date.now()
    const periodEnd = new Date(subscription.currentPeriodEnd || subscription.periodEnd || 0).getTime()
    const graceEnd = new Date(subscription.graceEndsAt || subscription.graceEnd || 0).getTime()
    if (!periodEnd || !graceEnd || now > graceEnd) return { ...subscription, status: 'locked' }
    if (now > periodEnd) return { ...subscription, status: 'grace' }
    return { ...subscription, status: 'active' }
  }

  function canCreatorPublish(creatorId) {
    const creator = getCreator(creatorId || backofficeSession.value?.creatorId)
    if (!creator || creator.status !== 'approved') return false
    return ['active', 'grace'].includes(getCreatorSubscriptionStatus(creator).status)
  }

  function getProductAvailability(product) {
    if (!product) return { purchasable: false, label: '無法購買', reason: '找不到商品資料。' }
    if (product.status !== 'active') return { purchasable: false, label: '已下架', reason: '創作者目前未上架此商品。' }
    if (product.stock < 1) return { purchasable: false, label: '暫時缺貨', reason: '目前沒有可購買庫存。' }
    const creator = getCreator(product.creatorId)
    if (!creator || creator.status !== 'approved') return { purchasable: false, label: '暫停販售', reason: '品牌目前尚未開放販售。' }
    if (!canCreatorPublish(creator.id)) return { purchasable: false, label: '暫停販售', reason: '創作者月租已逾期，商品目前暫停販售。' }
    return { purchasable: true, label: '販售中', reason: '' }
  }

  function isProductPurchasable(product) {
    return getProductAvailability(product).purchasable
  }

  function addToCart(productId, qty = 1) {
    const product = getProduct(productId)
    if (!isProductPurchasable(product)) return false
    const line = cart.value.find((item) => item.productId === productId)
    if (line) line.qty = Math.min(line.qty + qty, product.stock)
    else cart.value.push({ productId, qty: Math.min(qty, product.stock) })
    persist()
    return true
  }

  function setCartQty(productId, qty) {
    const product = getProduct(productId)
    const line = cart.value.find((item) => item.productId === productId)
    if (!line || !product) return
    line.qty = Math.max(1, Math.min(qty, product.stock))
    persist()
  }

  function removeFromCart(productId) {
    cart.value = cart.value.filter((item) => item.productId !== productId)
    persist()
  }

  function backofficeLogin(email, password, role, approvalToken) {
    if (role === 'admin') {
      if (email === 'admin@muguang.tw' && password === 'admin123') {
        backofficeSession.value = { role: 'admin', name: '暮光管理員', signedInAt: new Date().toISOString() }
        persist()
        return { ok: true }
      }
      return { ok: false, message: '帳號或密碼不正確' }
    }
    const creator = creators.value.find((item) => item.email === email && item.password === password)
    if (!creator) return { ok: false, message: '帳號或密碼不正確' }
    if (creator.status === 'suspended') return { ok: false, message: '此帳號目前已停權' }
    if (approvalToken) {
      const notification = creatorNotifications.value.find((item) => item.approvalToken === approvalToken && item.creatorId === creator.id)
      if (!notification || notification.type !== 'approved') return { ok: false, message: '審核登入連結無效或不屬於此帳號' }
      if (notification.usedAt) return { ok: false, message: '這個審核登入連結已使用，請改用一般登入' }
      if (new Date(notification.expiresAt).getTime() < Date.now()) return { ok: false, message: '審核登入連結已過期' }
      notification.usedAt = new Date().toISOString()
    }
    backofficeSession.value = { role: 'creator', creatorId: creator.id, name: creator.name, signedInAt: new Date().toISOString() }
    persist()
    return { ok: true, pending: creator.status === 'pending' }
  }

  function backofficeLogout() {
    backofficeSession.value = null
    persist()
  }

  function customerLogin(email, password) {
    const customer = customers.value.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password)
    if (!customer) return { ok: false, message: '帳號或密碼不正確' }
    customerSession.value = { role: 'customer', customerId: customer.id, name: customer.name, signedInAt: new Date().toISOString() }
    persist()
    return { ok: true }
  }

  function customerLogout() {
    customerSession.value = null
    persist()
  }

  function registerCustomer(payload) {
    const email = payload.email.trim().toLowerCase()
    if (customers.value.some((item) => item.email.toLowerCase() === email)) return { ok: false, message: '這個 Email 已經註冊' }
    const customer = {
      id: `customer-${Date.now()}`,
      name: payload.name.trim(),
      email,
      password: payload.password,
      phone: payload.phone.trim(),
      city: payload.city,
      address: payload.address.trim(),
      joinedAt: new Date().toLocaleDateString('sv-SE'),
    }
    customers.value.push(customer)
    customerSession.value = { role: 'customer', customerId: customer.id, name: customer.name, signedInAt: new Date().toISOString() }
    persist()
    return { ok: true }
  }

  function updateCustomer(payload) {
    if (!currentCustomer.value || (payload.id && payload.id !== currentCustomer.value.id)) return false
    const index = customers.value.findIndex((item) => item.id === currentCustomer.value.id)
    customers.value[index] = { ...customers.value[index], ...payload, email: customers.value[index].email, password: customers.value[index].password }
    customerSession.value.name = customers.value[index].name
    persist()
    return true
  }

  function getCustomerOrders() {
    if (!customerSession.value) return []
    return orders.value.filter((order) => order.customerId === customerSession.value.customerId)
  }

  function getCustomerOrder(id) {
    if (!customerSession.value) return null
    return orders.value.find((order) => order.id === id && order.customerId === customerSession.value.customerId) || null
  }

  function registerCreator(payload) {
    if (creators.value.some((item) => item.email === payload.email)) return { ok: false, message: '這個 Email 已經註冊' }
    const creator = {
      id: `creator-${Date.now()}`,
      ...payload,
      status: 'awaiting_payment',
      appliedAt: new Date().toLocaleDateString('sv-SE'),
      avatar: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=240&q=80',
      cover: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=85',
      bio: payload.bio || '新的文創品牌正在準備與大家見面。',
      subscription: { plan: 'creator-monthly', amount: 299, status: 'unpaid' },
      reviewHistory: [{ status: 'awaiting_payment', date: new Date().toLocaleDateString('sv-SE'), note: '創作者完成註冊，等待首期月租付款。', reviewer: '系統' }],
    }
    creators.value.push(creator)
    backofficeSession.value = { role: 'creator', creatorId: creator.id, name: creator.name, signedInAt: new Date().toISOString() }
    persist()
    return { ok: true }
  }

  function getCreatorSubscriptionOrders(creatorId) {
    return subscriptionOrders.value.filter((order) => order.creatorId === creatorId)
  }

  function payCreatorSubscription(paymentMethod = 'credit_card') {
    const creator = currentCreator.value
    if (!creator || backofficeSession.value?.role !== 'creator') return { ok: false, message: '請先登入創作者帳號' }
    if (!['awaiting_payment', 'approved'].includes(creator.status)) return { ok: false, message: creator.status === 'rejected' ? '請先更新品牌資料並重新送出申請' : '目前狀態不需要重複付款' }
    if (creator.status === 'approved' && !['grace', 'locked'].includes(getCreatorSubscriptionStatus(creator).status)) return { ok: false, message: '目前訂閱仍在有效期間' }
    const paidAt = new Date().toISOString()
    const order = {
      id: `SUB-${Date.now().toString().slice(-10)}`,
      creatorId: creator.id,
      type: creator.status === 'approved' ? 'renewal' : 'initial',
      amount: 299,
      status: 'paid',
      paymentMethod,
      createdAt: paidAt,
      paidAt,
    }
    subscriptionOrders.value.unshift(order)
    creator.subscription = creator.subscription || { plan: 'creator-monthly', amount: 299 }
    if (creator.status === 'approved') {
      const periodStart = paidAt
      const periodEnd = addMonth(periodStart)
      creator.subscription = {
        ...creator.subscription,
        status: 'active',
        demoStatus: null,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        nextBillingDate: periodEnd,
        graceEndsAt: addDays(periodEnd, 3),
        lastPaidOrderId: order.id,
      }
    } else {
      creator.status = 'pending'
      creator.subscription = { ...creator.subscription, status: 'prepaid', paidOrderId: order.id, demoStatus: null }
      creator.reviewNote = ''
      creator.reviewHistory = creator.reviewHistory || []
      creator.reviewHistory.unshift({ status: 'pending', date: new Date().toLocaleDateString('sv-SE'), note: '首期月租付款完成，申請正式進入審核。', reviewer: '系統' })
    }
    persist()
    return { ok: true, orderId: order.id, order }
  }

  function getCreatorNotifications(email) {
    const normalized = String(email || '').trim().toLowerCase()
    return creatorNotifications.value.filter((item) => !normalized || item.email.toLowerCase() === normalized)
  }

  function getApprovalNotification(token) {
    const notification = creatorNotifications.value.find((item) => item.approvalToken === token)
    if (!notification) return { ok: false, reason: 'missing', message: '找不到這封審核通知' }
    if (new Date(notification.expiresAt).getTime() < Date.now()) return { ok: false, expired: true, reason: 'expired', message: '審核通知連結已過期', notification }
    return { ok: true, notification }
  }

  function setDemoSubscriptionScenario(scenario) {
    const creator = currentCreator.value
    if (!creator || creator.status !== 'approved' || !['active', 'grace', 'locked'].includes(scenario)) return false
    creator.subscription.demoStatus = scenario
    persist()
    return true
  }

  function clearDemoSubscriptionScenario() {
    if (!currentCreator.value?.subscription) return false
    currentCreator.value.subscription.demoStatus = null
    persist()
    return true
  }

  function saveProduct(payload) {
    if (backofficeSession.value?.role !== 'creator') return false
    const creator = currentCreator.value
    if (!creator || creator.status !== 'approved') return false
    if (payload.id) {
      const index = products.value.findIndex((item) => item.id === payload.id)
      if (index < 0 || products.value[index].creatorId !== backofficeSession.value.creatorId) return false
      if (products.value[index].status !== 'active' && payload.status === 'active' && !canCreatorPublish(creator.id)) return false
      products.value[index] = { ...products.value[index], ...payload, creatorId: products.value[index].creatorId }
    } else {
      if (!canCreatorPublish(creator.id)) return false
      const image = payload.image || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=85'
      products.value.unshift({
        ...payload,
        id: `product-${Date.now()}`,
        creatorId: backofficeSession.value.creatorId,
        featured: false,
        images: [image],
      })
    }
    persist()
    return true
  }

  function deleteProduct(id) {
    const product = getProduct(id)
    if (!product || backofficeSession.value?.role !== 'creator' || product.creatorId !== backofficeSession.value.creatorId) return false
    products.value = products.value.filter((item) => item.id !== id)
    cart.value = cart.value.filter((item) => item.productId !== id)
    persist()
    return true
  }

  function toggleProduct(id) {
    const product = getProduct(id)
    const isAdmin = backofficeSession.value?.role === 'admin'
    const isOwner = backofficeSession.value?.role === 'creator' && product?.creatorId === backofficeSession.value.creatorId && currentCreator.value?.status === 'approved'
    const canManage = isAdmin || isOwner
    if (!product || !canManage) return false
    if (!isAdmin && product.status !== 'active' && !canCreatorPublish(product.creatorId)) return false
    product.status = product.status === 'active' ? 'inactive' : 'active'
    persist()
    return true
  }

  function updateOrderStatus(id, status) {
    const order = orders.value.find((item) => item.id === id)
    const canManage = backofficeSession.value?.role === 'admin' || (backofficeSession.value?.role === 'creator' && order?.creatorId === backofficeSession.value.creatorId)
    if (!order || !canManage || !['processing', 'shipped', 'completed'].includes(status)) return false
    order.status = status
    persist()
    return true
  }

  function updateCreator(payload) {
    const canManage = backofficeSession.value?.role === 'admin' || (backofficeSession.value?.role === 'creator' && payload.id === backofficeSession.value.creatorId)
    if (!canManage) return false
    const index = creators.value.findIndex((item) => item.id === payload.id)
    if (index < 0) return false
    creators.value[index] = { ...creators.value[index], ...payload, id: creators.value[index].id, status: creators.value[index].status, reviewHistory: creators.value[index].reviewHistory }
    if (backofficeSession.value?.creatorId === payload.id) backofficeSession.value.name = payload.name
    persist()
    return true
  }

  function setCreatorStatus(id, status, note = '') {
    if (backofficeSession.value?.role !== 'admin' || !['pending', 'approved', 'rejected', 'suspended'].includes(status)) return false
    const creator = getCreator(id)
    if (!creator) return false
    if (status === 'approved' && creator.status === 'pending' && creator.subscription?.status !== 'prepaid') return { ok: false, message: '首期月租尚未付款，不能核准申請' }
    const previousStatus = creator.status
    creator.status = status
    creator.reviewNote = note.trim()
    creator.reviewHistory = creator.reviewHistory || []
    creator.reviewHistory.unshift({ status, date: new Date().toLocaleDateString('sv-SE'), note: note.trim() || (status === 'approved' ? '平台核准合作資格。' : '平台更新合作狀態。'), reviewer: '暮光管理員' })
    let notification = null
    if (status === 'approved' && previousStatus === 'pending') {
      const approvedAt = new Date().toISOString()
      const periodEnd = addMonth(approvedAt)
      creator.approvedAt = approvedAt
      creator.subscription = {
        ...creator.subscription,
        status: 'active',
        startedAt: approvedAt,
        currentPeriodStart: approvedAt,
        currentPeriodEnd: periodEnd,
        nextBillingDate: periodEnd,
        graceEndsAt: addDays(periodEnd, 3),
        demoStatus: null,
      }
      const token = makeToken()
      notification = {
        id: `MAIL-${Date.now()}`,
        creatorId: creator.id,
        creatorName: creator.name,
        email: creator.email,
        type: 'approved',
        subject: `${creator.name}，你的創作者合作申請已通過`,
        message: '品牌資料審核已完成，首期月租從核准日開始計算。請使用下方安全連結登入工作室。',
        approvalToken: token,
        createdAt: approvedAt,
        expiresAt: addDays(approvedAt, 1),
      }
      creatorNotifications.value.unshift(notification)
    }
    if (status === 'rejected' && previousStatus === 'pending') {
      const paidOrder = subscriptionOrders.value.find((order) => order.id === creator.subscription?.paidOrderId && order.status === 'paid')
      if (paidOrder) {
        paidOrder.status = 'refunded'
        paidOrder.refundedAt = new Date().toISOString()
        paidOrder.refundReason = note.trim()
      }
      creator.subscription = { ...creator.subscription, status: 'refunded', refundedAt: new Date().toISOString(), demoStatus: null }
      notification = {
        id: `MAIL-${Date.now()}`,
        creatorId: creator.id,
        creatorName: creator.name,
        email: creator.email,
        type: 'rejected',
        subject: `${creator.name}，你的合作申請需要重新準備`,
        message: `平台審核說明：${note.trim()}。首期 NT$299 已建立模擬退款紀錄。`,
        approvalToken: makeToken(),
        createdAt: new Date().toISOString(),
        expiresAt: addDays(new Date().toISOString(), 30),
      }
      creatorNotifications.value.unshift(notification)
    }
    persist()
    return { ok: true, notification, link: notification ? `/creator/mail?approvalToken=${notification.approvalToken}&email=${encodeURIComponent(notification.email)}` : '' }
  }

  function resubmitCreator() {
    const creator = currentCreator.value
    if (!creator || backofficeSession.value?.role !== 'creator' || creator.status !== 'rejected') return false
    creator.status = 'awaiting_payment'
    creator.subscription = { ...creator.subscription, status: 'unpaid', paidOrderId: null }
    creator.reviewHistory = creator.reviewHistory || []
    creator.reviewHistory.unshift({ status: 'awaiting_payment', date: new Date().toLocaleDateString('sv-SE'), note: '資料更新完成，等待重新支付首期月租後送審。', reviewer: '系統' })
    persist()
    return true
  }

  function addCategory(name) {
    if (backofficeSession.value?.role !== 'admin') return false
    const value = name.trim()
    if (!value || categories.value.includes(value)) return false
    categories.value.push(value)
    persist()
    return true
  }

  function renameCategory(oldName, newName) {
    if (backofficeSession.value?.role !== 'admin') return false
    const value = newName.trim()
    if (!value || (value !== oldName && categories.value.includes(value))) return false
    const index = categories.value.indexOf(oldName)
    if (index < 0) return false
    categories.value[index] = value
    products.value.forEach((product) => {
      if (product.category === oldName) product.category = value
    })
    persist()
    return true
  }

  function deleteCategory(name) {
    if (backofficeSession.value?.role !== 'admin') return false
    if (products.value.some((product) => product.category === name)) return false
    categories.value = categories.value.filter((item) => item !== name)
    persist()
    return true
  }

  function placeOrder(customer, payment) {
    if (!customerSession.value || !currentCustomer.value || !cartDetails.value.length) return []
    const orderable = cartDetails.value.every((line) => {
      return isProductPurchasable(line.product) && line.product.stock >= line.qty
    })
    if (!orderable) return []
    const groups = cartDetails.value.reduce((result, line) => {
      const key = line.product.creatorId
      if (!result[key]) result[key] = []
      result[key].push(line)
      return result
    }, {})
    const created = []
    Object.entries(groups).forEach(([creatorId, lines], index) => {
      const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)
      const shipping = subtotal >= 1000 ? 0 : 80
      const id = `MG-${Date.now().toString().slice(-8)}${index + 1}`
      orders.value.unshift({
        id,
        creatorId,
        customerId: customerSession.value.customerId,
        createdAt: new Date().toLocaleDateString('sv-SE'),
        customer: clone(customer),
        items: lines.map((line) => ({ productId: line.product.id, name: line.product.name, price: line.product.price, qty: line.qty, image: line.product.image })),
        subtotal,
        shipping,
        total: subtotal + shipping,
        status: 'processing',
        payment,
      })
      lines.forEach((line) => { line.product.stock -= line.qty })
      created.push(id)
    })
    lastOrderIds.value = created
    cart.value = []
    persist()
    return created
  }

  return {
    creators, products, orders, categories, customers, subscriptionOrders, creatorNotifications, cart, customerSession, backofficeSession, lastOrderIds,
    currentCreator, currentCustomer, activeProducts, cartCount, cartDetails, cartSubtotal,
    initialize, resetData, getCreator, getProduct, getCreatorSubscriptionStatus, canCreatorPublish, getProductAvailability, isProductPurchasable, addToCart, setCartQty, removeFromCart,
    backofficeLogin, backofficeLogout, customerLogin, customerLogout, registerCustomer, updateCustomer, getCustomerOrders, getCustomerOrder, registerCreator,
    getCreatorSubscriptionOrders, payCreatorSubscription, getCreatorNotifications, getApprovalNotification, setDemoSubscriptionScenario, clearDemoSubscriptionScenario,
    saveProduct, deleteProduct, toggleProduct, updateOrderStatus, updateCreator, setCreatorStatus, resubmitCreator,
    addCategory, renameCategory, deleteCategory, placeOrder,
  }
})
