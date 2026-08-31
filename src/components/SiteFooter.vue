<template>
  <footer class="site-footer">
    <div class="container py-5">
      <div class="row g-4">
        <div class="col-lg-5">
          <RouterLink class="brand-mark mb-3 d-inline-flex" to="/">
            <span class="brand-seal">暮</span><span>暮光集所</span>
          </RouterLink>
          <p class="footer-intro">在作品與生活之間，為台灣文創者留一處被看見的光，也替日常尋找能長久陪伴的物件。</p>
        </div>
        <div class="col-6 col-lg-2 offset-lg-1">
          <h6>開始探索</h6>
          <RouterLink to="/products">所有選物</RouterLink>
          <RouterLink to="/products?category=紙品">紙品插畫</RouterLink>
          <RouterLink to="/products?category=陶藝">陶藝器皿</RouterLink>
          <RouterLink to="/products?category=布作">織品布作</RouterLink>
        </div>
        <div class="col-6 col-lg-2">
          <h6>創作者合作</h6>
          <RouterLink to="/creator/register">申請加入集所</RouterLink>
          <RouterLink to="/creator/login">創作者工作室</RouterLink>
          <RouterLink to="/account/orders">顧客訂單查詢</RouterLink>
        </div>
        <div class="col-lg-2">
          <h6>找到我們</h6>
          <p class="small mb-2">hello@muguang.tw</p>
          <div class="d-flex gap-2">
            <span class="social-circle"><i class="bi bi-instagram"></i></span>
            <span class="social-circle"><i class="bi bi-facebook"></i></span>
            <span class="social-circle"><i class="bi bi-line"></i></span>
          </div>
        </div>
      </div>
      <div class="footer-bottom mt-5 pt-4 d-flex flex-column flex-md-row justify-content-between gap-2">
        <span>© 2026 暮光集所 Muguang Market</span>
        <span>以溫柔的選物，回應認真的創作。</span>
      </div>
    </div>
  </footer>
</template>
