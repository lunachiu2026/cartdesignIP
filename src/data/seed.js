export const seedCreators = [
  {
    id: 'creator-1',
    name: '森雨製作',
    owner: '林予安',
    email: 'creator@demo.tw',
    password: '123456',
    status: 'approved',
    category: '紙品與插畫',
    avatar: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=240&q=80',
    cover: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=85',
    bio: '從島嶼的林間、雨聲與日常採集靈感，把安靜的風景畫進每一張紙品。',
    phone: '0912-345-678',
    appliedAt: '2026-02-12', location: '台北市', craftStory: '以水彩與鉛筆描繪島嶼植物，所有紙品皆由在地印刷工作室少量製作。', materials: 'FSC 認證紙材、水性油墨', portfolio: 'https://example.com/senyu', social: 'https://www.instagram.com/', applicationReason: '希望讓喜歡紙品的人認識台灣植物，也期待與其他創作者交流。',
    reviewHistory: [{ status: 'approved', date: '2026-02-15', note: '品牌資料與作品來源確認完成。', reviewer: '暮光管理員' }],
    approvedAt: '2026-08-15T09:00:00.000Z',
    subscription: { plan: 'creator-monthly', amount: 299, status: 'active', startedAt: '2026-08-15T09:00:00.000Z', currentPeriodStart: '2026-08-15T09:00:00.000Z', currentPeriodEnd: '2026-09-15T09:00:00.000Z', nextBillingDate: '2026-09-15T09:00:00.000Z', graceEndsAt: '2026-09-18T09:00:00.000Z' },
  },
  {
    id: 'creator-2',
    name: '日陶小室',
    owner: '周映彤',
    email: 'pottery@demo.tw',
    password: '123456',
    status: 'approved',
    category: '陶藝器皿',
    avatar: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=240&q=80',
    cover: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=1400&q=85',
    bio: '慢慢拉坯、慢慢燒製，讓每件器皿保留手掌留下的溫度。',
    phone: '0922-101-226',
    appliedAt: '2026-03-08', location: '新竹市', craftStory: '從拉坯、修坯、上釉到燒成皆在個人工作室完成，接受每次窯燒留下的自然差異。', materials: '台灣陶土、食品器皿安全釉藥', portfolio: 'https://example.com/daypottery', social: 'https://www.instagram.com/', applicationReason: '想讓日常器皿回到使用者手中，成為每日都會觸碰的風景。',
    reviewHistory: [{ status: 'approved', date: '2026-03-12', note: '器皿檢驗與創作流程資料完整。', reviewer: '暮光管理員' }],
    approvedAt: '2026-08-20T09:00:00.000Z',
    subscription: { plan: 'creator-monthly', amount: 299, status: 'active', startedAt: '2026-08-20T09:00:00.000Z', currentPeriodStart: '2026-08-20T09:00:00.000Z', currentPeriodEnd: '2026-09-20T09:00:00.000Z', nextBillingDate: '2026-09-20T09:00:00.000Z', graceEndsAt: '2026-09-23T09:00:00.000Z' },
  },
  {
    id: 'creator-3',
    name: '植光布作',
    owner: '陳沐禾',
    email: 'fabric@demo.tw',
    password: '123456',
    status: 'approved',
    category: '織品與生活',
    avatar: 'https://images.unsplash.com/photo-1528396518501-b53b655eb9b3?auto=format&fit=crop&w=240&q=80',
    cover: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1400&q=85',
    bio: '以天然棉麻與植物色彩，縫製適合長久陪伴日常的生活布物。',
    phone: '0933-876-550',
    appliedAt: '2026-04-20', location: '台中市', craftStory: '從布料選擇、植物染色到縫製皆小量手工完成，並優先利用裁切餘布。', materials: '天然棉麻、植物染料、再生棉線', portfolio: 'https://example.com/greenfabric', social: 'https://www.instagram.com/', applicationReason: '希望推廣耐用、可修補的布製生活用品。',
    reviewHistory: [{ status: 'approved', date: '2026-04-24', note: '永續材料說明與作品資料確認完成。', reviewer: '暮光管理員' }],
    approvedAt: '2026-08-22T09:00:00.000Z',
    subscription: { plan: 'creator-monthly', amount: 299, status: 'active', startedAt: '2026-08-22T09:00:00.000Z', currentPeriodStart: '2026-08-22T09:00:00.000Z', currentPeriodEnd: '2026-09-22T09:00:00.000Z', nextBillingDate: '2026-09-22T09:00:00.000Z', graceEndsAt: '2026-09-25T09:00:00.000Z' },
  },
  {
    id: 'creator-4',
    name: '山眠木工',
    owner: '徐向山',
    email: 'wood@demo.tw',
    password: '123456',
    status: 'pending',
    category: '木作',
    avatar: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=240&q=80',
    cover: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1400&q=85',
    bio: '拾起木頭的紋理，做成留在生活裡的小風景。',
    phone: '0955-333-882',
    appliedAt: '2026-08-28', location: '南投縣', craftStory: '使用修枝木與合法來源國產材，以手工具保留木材原有節理，每件作品皆手工打磨。', materials: '國產相思木、修枝木、天然蜂蠟', portfolio: 'https://example.com/woodsleep', social: 'https://www.instagram.com/', applicationReason: '希望替被忽略的小料找到新的用途，也讓更多人感受國產木材的質地。',
    reviewHistory: [{ status: 'pending', date: '2026-08-28', note: '創作者送出合作申請。', reviewer: '系統' }],
    subscription: { plan: 'creator-monthly', amount: 299, status: 'prepaid', paidOrderId: 'SUB-26082801' },
  },
]

export const seedCustomers = [
  {
    id: 'customer-1',
    name: '張書寧',
    email: 'member@demo.tw',
    password: '123456',
    phone: '0911-222-345',
    city: '台北市',
    address: '大安區和平東路二段 18 號',
    joinedAt: '2026-06-18',
  },
]

export const seedSubscriptionOrders = [
  { id: 'SUB-26082801', creatorId: 'creator-4', type: 'initial', amount: 299, status: 'paid', paymentMethod: 'credit_card', createdAt: '2026-08-28T08:30:00.000Z', paidAt: '2026-08-28T08:30:00.000Z' },
  { id: 'SUB-26081501', creatorId: 'creator-1', type: 'initial', amount: 299, status: 'paid', paymentMethod: 'credit_card', createdAt: '2026-08-15T09:00:00.000Z', paidAt: '2026-08-15T09:00:00.000Z' },
]

export const seedCreatorNotifications = [
  { id: 'MAIL-26081501', creatorId: 'creator-1', creatorName: '森雨製作', email: 'creator@demo.tw', type: 'approved', subject: '森雨製作，你的創作者合作申請已通過', message: '我們已完成品牌資料審核，首期月租已從核准日開始計算。請使用下方連結登入工作室。', approvalToken: 'demo-approved-creator-1', createdAt: '2026-08-15T09:05:00.000Z', expiresAt: '2099-12-31T23:59:59.000Z' },
]

export const seedProducts = [
  {
    id: 'product-1', creatorId: 'creator-1', name: '島嶼植物插畫明信片組', category: '紙品', price: 320, stock: 18, status: 'active', featured: true,
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=85',
    images: ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1000&q=85'],
    description: '收錄六幅台灣常見植物，以溫柔水彩與細緻線條描繪。選用厚磅象牙卡，適合書寫、收藏，也適合送給想念的人。',
  },
  {
    id: 'product-2', creatorId: 'creator-2', name: '晨霧手捏陶杯', category: '陶藝', price: 980, stock: 6, status: 'active', featured: true,
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1000&q=85',
    images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=85'],
    description: '霧白釉色搭配自然土色，每只皆由手工拉坯與修整完成。容量約 280ml，握在手中有溫潤踏實的重量。',
  },
  {
    id: 'product-3', creatorId: 'creator-3', name: '植物染棉麻隨行袋', category: '布作', price: 760, stock: 12, status: 'active', featured: true,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85'],
    description: '以洋蔥皮與福木染製的自然色澤，搭配厚實棉麻布料。內側有一只小口袋，日常散步與採買都合適。',
  },
  {
    id: 'product-4', creatorId: 'creator-1', name: '林間散步紙膠帶', category: '紙品', price: 180, stock: 35, status: 'active', featured: false,
    image: 'https://images.unsplash.com/photo-1607457561901-e6ec3a6d16cf?auto=format&fit=crop&w=1000&q=85',
    images: ['https://images.unsplash.com/photo-1607457561901-e6ec3a6d16cf?auto=format&fit=crop&w=1000&q=85'],
    description: '把蕨類、果實與林間小動物收進 20mm 寬的紙膠帶，適合手帳拼貼與禮物包裝。',
  },
  {
    id: 'product-5', creatorId: 'creator-2', name: '山形釉點心盤', category: '陶藝', price: 680, stock: 8, status: 'active', featured: false,
    image: 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=1000&q=85',
    images: ['https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=1000&q=85'],
    description: '略帶不規則的山形輪廓與青綠釉色，適合盛裝一份午後點心。每件釉色流動皆不相同。',
  },
  {
    id: 'product-6', creatorId: 'creator-3', name: '暮色雙面杯墊組', category: '布作', price: 420, stock: 20, status: 'active', featured: true,
    image: 'https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d?auto=format&fit=crop&w=1000&q=85',
    images: ['https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d?auto=format&fit=crop&w=1000&q=85'],
    description: '使用裁布餘料重新拼接，雙面皆可使用。四色一組，每組的布紋與色塊配置都是唯一。',
  },
  {
    id: 'product-7', creatorId: 'creator-1', name: '四季花草插畫月曆', category: '紙品', price: 550, stock: 10, status: 'active', featured: false,
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1000&q=85',
    images: ['https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1000&q=85'],
    description: '十二個月份、十二種島嶼花草。無年份設計，可自由記下重要日期，陪你慢慢走過一整年。',
  },
  {
    id: 'product-8', creatorId: 'creator-2', name: '月白線香座', category: '陶藝', price: 460, stock: 0, status: 'inactive', featured: false,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=85',
    images: ['https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=85'],
    description: '像一輪微小月亮的白釉線香座，盤面可承接香灰，也能放置戒指與細小飾品。',
  },
]

export const seedOrders = [
  {
    id: 'MG-26083101', creatorId: 'creator-1', customerId: 'customer-1', createdAt: '2026-08-31', customer: { name: '張書寧', email: 'member@demo.tw', phone: '0911-222-345', address: '台北市大安區和平東路二段 18 號' },
    items: [{ productId: 'product-1', name: '島嶼植物插畫明信片組', price: 320, qty: 2, image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=300&q=80' }],
    subtotal: 640, shipping: 80, total: 720, status: 'processing', payment: '信用卡',
  },
  {
    id: 'MG-26083006', creatorId: 'creator-2', customerId: 'customer-1', createdAt: '2026-08-30', customer: { name: '張書寧', email: 'member@demo.tw', phone: '0911-222-345', address: '台北市大安區和平東路二段 18 號' },
    items: [{ productId: 'product-2', name: '晨霧手捏陶杯', price: 980, qty: 1, image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=300&q=80' }],
    subtotal: 980, shipping: 80, total: 1060, status: 'shipped', payment: 'ATM 轉帳',
  },
  {
    id: 'MG-26082803', creatorId: 'creator-1', customerId: 'customer-1', createdAt: '2026-08-28', customer: { name: '張書寧', email: 'member@demo.tw', phone: '0911-222-345', address: '台北市大安區和平東路二段 18 號' },
    items: [{ productId: 'product-4', name: '林間散步紙膠帶', price: 180, qty: 3, image: 'https://images.unsplash.com/photo-1607457561901-e6ec3a6d16cf?auto=format&fit=crop&w=300&q=80' }],
    subtotal: 540, shipping: 80, total: 620, status: 'completed', payment: '信用卡',
  },
]
