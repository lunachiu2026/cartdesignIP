<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '../stores/market'

const store = useMarketStore()
const router = useRouter()
const open = ref(false)
const customerName = computed(() => store.currentCustomer?.name || '會員')

function logoutCustomer() {
  store.customerLogout()
  open.value = false
  router.push('/')
}
</script>

<template>
  <header class="site-header sticky-top">
    <nav class="navbar navbar-expand-lg container py-3">
      <RouterLink class="brand-mark" to="/" @click="open = false">
        <span class="brand-seal">暮</span>
        <span>暮光集所</span>
      </RouterLink>
      <button class="navbar-toggler border-0" type="button" aria-label="切換選單" @click="open = !open">
        <i class="bi bi-list fs-2"></i>
      </button>
      <div class="navbar-collapse" :class="{ show: open }">
        <div class="navbar-nav mx-auto gap-lg-4">
          <RouterLink class="nav-link" to="/products" @click="open = false">逛選物</RouterLink>
          <RouterLink class="nav-link" to="/?section=creators" @click="open = false">遇見創作者</RouterLink>
          <RouterLink class="nav-link" to="/?section=story" @click="open = false">關於集所</RouterLink>
        </div>
        <div class="d-flex align-items-center gap-2 py-2 py-lg-0">
          <div v-if="store.customerSession" class="dropdown">
            <button class="customer-menu" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <span class="customer-avatar">{{ customerName.slice(0, 1) }}</span><span class="d-none d-xl-inline">{{ customerName }}</span><i class="bi bi-chevron-down small"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end account-dropdown">
              <li class="account-greeting"><small>歡迎回來</small><strong>{{ customerName }}</strong></li>
              <li><hr class="dropdown-divider" /></li>
              <li><RouterLink class="dropdown-item" to="/account/orders" @click="open = false"><i class="bi bi-receipt"></i>我的訂單</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/account/profile" @click="open = false"><i class="bi bi-person-gear"></i>會員資料</RouterLink></li>
              <li><hr class="dropdown-divider" /></li>
              <li><button class="dropdown-item text-danger" type="button" @click="logoutCustomer"><i class="bi bi-box-arrow-right"></i>登出</button></li>
            </ul>
          </div>
          <RouterLink v-else class="customer-login-link" to="/account/login" @click="open = false">
            <i class="bi bi-person me-1"></i>登入／註冊
          </RouterLink>
          <RouterLink class="cart-link" to="/cart">
            <i class="bi bi-bag me-1"></i>選物袋
            <span class="cart-count">{{ store.cartCount }}</span>
          </RouterLink>
        </div>
      </div>
    </nav>
  </header>
</template>
