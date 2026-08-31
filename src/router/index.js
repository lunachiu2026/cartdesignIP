import { createRouter, createWebHistory } from 'vue-router'
import { useMarketStore } from '../stores/market'
import BackofficeLayout from '../components/BackofficeLayout.vue'
import HomeView from '../views/HomeView.vue'
import ProductsView from '../views/ProductsView.vue'
import ProductView from '../views/ProductView.vue'
import CreatorStoreView from '../views/CreatorStoreView.vue'
import CartView from '../views/CartView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import OrderCompleteView from '../views/OrderCompleteView.vue'
import BackofficeAuthView from '../views/BackofficeAuthView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import CustomerAuthView from '../views/account/CustomerAuthView.vue'
import CustomerOrdersView from '../views/account/CustomerOrdersView.vue'
import CustomerOrderDetailView from '../views/account/CustomerOrderDetailView.vue'
import CustomerProfileView from '../views/account/CustomerProfileView.vue'
import CreatorDashboardView from '../views/creator/CreatorDashboardView.vue'
import CreatorProductsView from '../views/creator/CreatorProductsView.vue'
import ProductFormView from '../views/creator/ProductFormView.vue'
import CreatorOrdersView from '../views/creator/CreatorOrdersView.vue'
import CreatorProfileView from '../views/creator/CreatorProfileView.vue'
import CreatorOnboardingView from '../views/creator/CreatorOnboardingView.vue'
import CreatorSubscriptionCheckoutView from '../views/creator/CreatorSubscriptionCheckoutView.vue'
import CreatorSubscriptionSuccessView from '../views/creator/CreatorSubscriptionSuccessView.vue'
import CreatorSubscriptionView from '../views/creator/CreatorSubscriptionView.vue'
import CreatorMailView from '../views/creator/CreatorMailView.vue'
import AdminDashboardView from '../views/admin/AdminDashboardView.vue'
import AdminCreatorsView from '../views/admin/AdminCreatorsView.vue'
import AdminCreatorDetailView from '../views/admin/AdminCreatorDetailView.vue'
import AdminProductsView from '../views/admin/AdminProductsView.vue'
import AdminCategoriesView from '../views/admin/AdminCategoriesView.vue'
import AdminOrdersView from '../views/admin/AdminOrdersView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/products', name: 'products', component: ProductsView },
    { path: '/products/:id', name: 'product', component: ProductView },
    { path: '/creators/:id', name: 'creator-store', component: CreatorStoreView },
    { path: '/cart', name: 'cart', component: CartView },
    { path: '/checkout', name: 'checkout', component: CheckoutView, meta: { customerOnly: true } },
    { path: '/order-complete/:ids', name: 'order-complete', component: OrderCompleteView, meta: { customerOnly: true } },
    { path: '/account/login', name: 'account-login', component: CustomerAuthView },
    { path: '/account/register', name: 'account-register', component: CustomerAuthView },
    { path: '/account/orders', name: 'account-orders', component: CustomerOrdersView, meta: { customerOnly: true } },
    { path: '/account/orders/:id', name: 'account-order-detail', component: CustomerOrderDetailView, meta: { customerOnly: true } },
    { path: '/account/profile', name: 'account-profile', component: CustomerProfileView, meta: { customerOnly: true } },
    { path: '/creator/login', name: 'creator-login', component: BackofficeAuthView, meta: { layout: 'auth' } },
    { path: '/creator/register', name: 'creator-register', component: BackofficeAuthView, meta: { layout: 'auth' } },
    { path: '/creator/mail', name: 'creator-mail', component: CreatorMailView },
    { path: '/muguang/admin', name: 'admin-login', component: BackofficeAuthView, meta: { layout: 'auth' } },
    {
      path: '/creator',
      component: BackofficeLayout,
      props: { role: 'creator' },
      meta: { layout: 'backoffice', role: 'creator' },
      children: [
        { path: '', redirect: '/creator/dashboard' },
        { path: 'onboarding', name: 'creator-onboarding', component: CreatorOnboardingView },
        { path: 'subscription', name: 'creator-subscription', component: CreatorSubscriptionView },
        { path: 'subscription/checkout', name: 'creator-subscription-checkout', component: CreatorSubscriptionCheckoutView },
        { path: 'subscription/success', name: 'creator-subscription-success', component: CreatorSubscriptionSuccessView },
        { path: 'dashboard', name: 'creator-dashboard', component: CreatorDashboardView, meta: { creatorApproved: true } },
        { path: 'products', name: 'creator-products', component: CreatorProductsView, meta: { creatorApproved: true } },
        { path: 'products/new', name: 'creator-product-new', component: ProductFormView, meta: { creatorApproved: true, creatorPublish: true } },
        { path: 'products/:id/edit', name: 'creator-product-edit', component: ProductFormView, meta: { creatorApproved: true } },
        { path: 'orders', name: 'creator-orders', component: CreatorOrdersView, meta: { creatorApproved: true } },
        { path: 'profile', name: 'creator-profile', component: CreatorProfileView },
      ],
    },
    {
      path: '/admin',
      component: BackofficeLayout,
      props: { role: 'admin' },
      meta: { layout: 'backoffice', role: 'admin' },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard', name: 'admin-dashboard', component: AdminDashboardView },
        { path: 'creators', name: 'admin-creators', component: AdminCreatorsView },
        { path: 'creators/:id', name: 'admin-creator-detail', component: AdminCreatorDetailView },
        { path: 'products', name: 'admin-products', component: AdminProductsView },
        { path: 'categories', name: 'admin-categories', component: AdminCategoriesView },
        { path: 'orders', name: 'admin-orders', component: AdminOrdersView },
      ],
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
  ],
})

router.beforeEach((to) => {
  const store = useMarketStore()
  store.initialize()
  if (to.meta.customerOnly && !store.customerSession) {
    return { path: '/account/login', query: { redirect: to.fullPath } }
  }
  if ((to.name === 'account-login' || to.name === 'account-register') && store.customerSession) return '/account/orders'
  if (['creator-login', 'creator-register', 'admin-login'].includes(String(to.name)) && store.backofficeSession) {
    return store.backofficeSession.role === 'admin' ? '/admin/dashboard' : '/creator/dashboard'
  }
  const requiredRole = to.meta.role
  if (!requiredRole) return true
  if (!store.backofficeSession) return requiredRole === 'admin' ? '/muguang/admin' : '/creator/login'
  if (store.backofficeSession.role !== requiredRole) return store.backofficeSession.role === 'admin' ? '/admin/dashboard' : '/creator/dashboard'
  if (requiredRole === 'creator') {
    if (to.meta.creatorApproved && store.currentCreator?.status !== 'approved') return '/creator/onboarding'
    if (to.meta.creatorPublish && !store.canCreatorPublish(store.currentCreator?.id)) return store.currentCreator?.status === 'approved' ? '/creator/subscription' : '/creator/onboarding'
  }
  return true
})

export default router
