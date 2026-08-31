# GitHub Pages 部署操作

本文件記錄如何將此 Vue 3 + Vite 專案透過 GitHub Actions 自動部署至 GitHub Pages。

## 部署資訊

- GitHub Repository：<https://github.com/lunachiu2026/cartdesignIP>
- GitHub Pages：<https://lunachiu2026.github.io/cartdesignIP/>
- 部署分支：`main`
- 建置輸出目錄：`dist`

## GitHub Pages 設定

進入 GitHub Repository，依序開啟：

1. `Settings`
2. `Pages`
3. 在 `Build and deployment` 的 `Source` 選擇 `GitHub Actions`

本專案目前已經完成這項設定。

## Vite 子路徑設定

因為網站部署在 `cartdesignIP` repository 下，網址不是網域根目錄，所以 `vite.config.js` 必須設定 `base`：

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/cartdesignIP/',
  plugins: [vue()],
})
```

建置後的 JavaScript、CSS 和字型等資源會使用 `/cartdesignIP/assets/` 路徑。

## GitHub Actions Workflow

部署設定位於 `.github/workflows/static.yml`：

```yaml
name: Deploy Vue app to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Add SPA fallback
        run: cp dist/index.html dist/404.html

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

這個 workflow 會在每次 push 到 `main` 時自動執行以下工作：

1. 下載 repository 原始碼。
2. 安裝 Node.js 22。
3. 使用 `npm ci` 安裝鎖定版本的套件。
4. 使用 `npm run build` 建立正式版本。
5. 產生 `dist/404.html`，支援 Vue Router 乾淨網址。
6. 上傳 `dist` 並部署至 GitHub Pages。

也可以前往 GitHub 的 `Actions` 頁面，選擇 `Deploy Vue app to Pages`，使用 `Run workflow` 手動部署。

## 本機建置驗證

提交前先執行：

```bash
npm ci
npm run build
npm run preview
```

預覽網址會顯示在終端機中。確認首頁、商品列表及其他主要路由可以正常顯示。

## 推送並自動部署

完成程式修改後執行：

```bash
git status
git add .
git commit -m "更新內容"
git push origin main
```

Push 完成後，GitHub Actions 會自動開始部署。可以在以下頁面查看執行進度：

<https://github.com/lunachiu2026/cartdesignIP/actions>

看到綠色勾號後，開啟網站：

<https://lunachiu2026.github.io/cartdesignIP/>

GitHub Pages 可能需要短暫時間更新；若仍看到舊內容，可以等待約一分鐘後重新整理。

## Vue Router 內頁處理

本專案使用 `createWebHistory` 和乾淨網址，例如：

```text
https://lunachiu2026.github.io/cartdesignIP/products
```

GitHub Pages 本身沒有伺服器端路由，因此 workflow 會將 `index.html` 複製為 `404.html`。直接開啟或重新整理內頁時，GitHub Pages 會回傳 Vue App，再交由 Vue Router 顯示正確頁面。

這種方式在直接請求內頁時，HTTP 狀態碼仍可能是 `404`，但瀏覽器可以正常顯示網站。若未來需要所有路由都回傳 `200`，可改用 Hash Router，或部署至 Netlify、Vercel、Cloudflare Pages 等支援 SPA rewrite 的平台。

## 常見問題

### 頁面空白或資源載入失敗

確認 `vite.config.js` 包含：

```js
base: '/cartdesignIP/'
```

也要確認 repository 名稱大小寫與 `base` 完全一致。

### Action 成功但網站不是正式建置版本

確認 `actions/upload-pages-artifact` 上傳的是 `dist`：

```yaml
with:
  path: dist
```

不要直接上傳整個 repository 的 `.`。

### Action 沒有自動執行

確認 workflow 監聽 `main`：

```yaml
on:
  push:
    branches: [main]
```

同時確認檔案位於 `.github/workflows/` 目錄，並且已經推送至 GitHub。

### 內頁重新整理後顯示 GitHub 404

確認 workflow 在上傳前執行：

```yaml
- name: Add SPA fallback
  run: cp dist/index.html dist/404.html
```

## 注意事項

- `dist` 已加入 `.gitignore`，不需要提交至 GitHub。
- GitHub Actions 會在雲端重新建立 `dist`。
- 不要將密碼、API Key 或私密環境變數直接寫進 workflow 或原始碼。
- 正式 API 金鑰應儲存在 GitHub Repository 的 `Settings > Secrets and variables > Actions`。
