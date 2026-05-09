# PhoneShop — Tài liệu dự án

## Mục tiêu dự án

PhoneShop là ứng dụng thương mại điện tử bán điện thoại chính hãng, là **bài cuối kỳ môn Lập trình Frontend**.

**4 chuẩn đầu ra cần đáp ứng:**

1. Dựng giao diện hoàn chỉnh với component library tự xây
2. Responsive đầy đủ (mobile / tablet / desktop)
3. Kết nối API & database thật (không mock)
4. Deploy được lên môi trường production

---

## Tech Stack

| Thành phần    | Công nghệ                           | Ghi chú                            |
|---------------|-------------------------------------|------------------------------------|
| Framework     | Next.js 16.2.4 — App Router         | React Server Component mặc định    |
| Styling       | SCSS Modules + Design System tự xây | Không dùng Tailwind / Bootstrap    |
| Auth          | NextAuth v5 (Auth.js)               | JWT session, RBAC (user / admin)   |
| Database      | PostgreSQL — Neon serverless        | Kết nối qua PrismaClient + pg Pool |
| ORM           | Prisma 7.8                          | Schema tự build, seed script có    |
| Ảnh sản phẩm  | Cloudinary                          | Upload / xóa qua API route         |
| Ngôn ngữ      | TypeScript 5 strict                 |                                    |
| Font          | Geist (next/font)                   |                                    |
| Deploy target | Vercel                              |                                    |

---

## Cấu trúc thư mục

```text
src/
├── app/
│   ├── layout.tsx                  # Root layout + ThemeProvider + no-flash script
│   ├── page.tsx                    # Trang chủ: Hero, FlashSale, Featured, Category, Brand
│   ├── globals.scss                # CSS custom properties (light/dark tokens)
│   ├── products/
│   │   ├── page.tsx                # Danh sách: filter sidebar + ProductGrid
│   │   └── [slug]/page.tsx         # Chi tiết: gallery + VariantSelector + specs + reviews
│   ├── login/page.tsx              # Đăng nhập
│   ├── register/page.tsx           # Đăng ký
│   ├── account/
│   │   ├── layout.tsx              # Layout tài khoản (sidebar nav)
│   │   ├── page.tsx                # Thông tin cá nhân
│   │   ├── orders/page.tsx         # Lịch sử đơn hàng
│   │   └── settings/page.tsx       # Cài đặt tài khoản
│   ├── admin/
│   │   ├── layout.tsx              # Layout admin (sidebar)
│   │   ├── page.tsx                # Dashboard: stats + recent orders
│   │   ├── products/               # CRUD sản phẩm
│   │   ├── categories/             # CRUD danh mục
│   │   ├── brands/                 # CRUD thương hiệu
│   │   ├── orders/                 # Quản lý đơn hàng
│   │   └── users/                  # Quản lý người dùng
│   ├── cart/page.tsx               # Giỏ hàng (chưa có nội dung)
│   ├── about/page.tsx              # Giới thiệu
│   └── api/
│       ├── auth/[...nextauth]/     # NextAuth handler
│       ├── products/               # GET danh sách, GET chi tiết
│       ├── categories/             # GET danh mục
│       └── upload/                 # POST upload, DELETE xóa ảnh
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # Sticky header: logo + search + actions
│   │   ├── TopBar.tsx              # Thanh thông báo trên cùng
│   │   ├── CategoryNav.tsx         # Thanh danh mục nằm ngang
│   │   ├── Footer.tsx              # Footer 4 cột
│   │   ├── SearchBar.tsx           # Ô tìm kiếm
│   │   ├── MobileMenu.tsx          # Drawer menu mobile
│   │   └── UserMenu.tsx            # Dropdown tài khoản (login/logout)
│   ├── product/
│   │   ├── ProductCard.tsx         # Card sản phẩm
│   │   ├── ProductGrid.tsx         # Grid server component
│   │   ├── ProductFilter.tsx       # Filter sidebar (client)
│   │   └── VariantSelector.tsx     # Chọn variant + giá (client)
│   └── ui/
│       ├── ThemeProvider.tsx       # Context: theme + toggle()
│       ├── ThemeToggle.tsx         # Nút bật/tắt dark mode
│       ├── SectionHeader.tsx       # Tiêu đề section (bar + title + link)
│       ├── FlashTimer.tsx          # Đồng hồ đếm ngược flash sale
│       ├── Skeleton.tsx            # Loading skeleton cards
│       ├── ImageUploader.tsx       # Upload ảnh Cloudinary
│       └── AdminProductImages.tsx  # Quản lý ảnh admin
│
├── styles/
│   ├── main.scss                   # Entry point: import tất cả partials
│   ├── abstracts/
│   │   ├── _variables.scss         # Design tokens (SCSS vars → CSS vars ở cuối)
│   │   └── _mixins.scss            # Mixins: card, button, input, skeleton...
│   ├── base/
│   │   ├── _reset.scss
│   │   ├── _typography.scss        # body dùng var(--color-text/bg)
│   │   └── _animations.scss        # shimmer, fadeIn, slideLeft...
│   └── template.scss               # Template codewithsadee (SCSS-converted)
│
└── lib/
    ├── auth.ts                     # NextAuth config (bcryptjs, Prisma adapter)
    ├── db.ts                       # PrismaClient singleton
    ├── cloudinary.ts               # Cloudinary v2
    └── queries/
        ├── product.ts              # getProducts() + getProductBySlug()
        └── category.ts             # getCategories()
```

---

## Design System

### Màu sắc (CSS Custom Properties — thay đổi theo theme)

Định nghĩa trong `src/app/globals.scss`. Tất cả SCSS module dùng biến qua `_variables.scss`.

| Token CSS             | Light     | Dark      | Dùng cho               |
|-----------------------|-----------|-----------|------------------------|
| `--color-bg`          | `#F5F5F5` | `#111113` | Nền trang              |
| `--color-bg-card`     | `#FFFFFF` | `#1C1C1E` | Card, panel            |
| `--color-bg-hover`    | `#F8F8F8` | `#2C2C2E` | Hover, ảnh placeholder |
| `--color-text`        | `#333333` | `#F2F2F7` | Text chính             |
| `--color-text-sec`    | `#666666` | `#ABABAB` | Text phụ               |
| `--color-text-muted`  | `#999999` | `#6B6B6B` | Text mờ, placeholder   |
| `--color-border`      | `#E0E0E0` | `#38383A` | Viền                   |
| `--color-primary`     | `#E30019` | `#E30019` | Brand (không đổi)      |
| `--color-rating-star` | `#FFA500` | `#FFB347` | Sao đánh giá           |
| `--color-badge-*`     | rgba nhạt | rgba đậm  | Badge trạng thái       |

### Cách dùng trong SCSS Module

```scss
@use '../../styles/abstracts/variables' as v;

// Dùng SCSS variable — compile ra var(--...) tự động
.text  { color: v.$color-text; }         // → color: var(--color-text)
.card  { background: v.$color-bg-card; } // → background: var(--color-bg-card)
.badge { background: v.$color-badge-success-bg; }
```

> **Quy tắc:** Không hardcode `#hex` hoặc `rgba()` trực tiếp trong module files.
> Tất cả màu phải đi qua biến SCSS trong `_variables.scss`.

### Dark / Light Mode

- Toggle: `ThemeToggle` (pill switch) nằm trong Header
- Lưu trữ: `localStorage('theme')`
- No-flash: inline `<script>` trong `<head>` chạy synchronous trước CSS
- `suppressHydrationWarning` trên `<html>` để tránh hydration mismatch

---

## Auth & Phân quyền

- **NextAuth v5** với Credentials provider
- Mật khẩu hash bằng `bcryptjs`
- Session: JWT, có trường `isAdmin: boolean`
- Middleware (`src/middleware.ts` / `proxy.ts`): bảo vệ `/account/*` và `/admin/*`
- Redirect về `/login` nếu chưa đăng nhập, về `/` nếu không có quyền admin

---

## API Endpoints

| Method | Endpoint                  | Mô tả                             |
|--------|---------------------------|-----------------------------------|
| GET    | `/api/products`           | Danh sách, filter/sort/phân trang |
| GET    | `/api/products/:slug`     | Chi tiết 1 sản phẩm               |
| GET    | `/api/categories`         | Danh mục gốc + con + productCount |
| POST   | `/api/upload`             | Upload ảnh lên Cloudinary         |
| DELETE | `/api/upload/:publicId`   | Xóa ảnh khỏi Cloudinary           |
| ANY    | `/api/auth/[...nextauth]` | NextAuth handler                  |

**Query params `/api/products`:** `page`, `limit` (max 50), `search`, `categoryId`, `brandId`, `minPrice`, `maxPrice`, `sortBy` (newest / price_asc / price_desc)

---

## Biến môi trường (.env.local)

```env
DATABASE_URL=postgresql://...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

---

## Chạy dự án local

```bash
npm install
# Tạo .env.local
npm run dev      # dev server
npm run build    # production build
npm run seed     # seed dữ liệu mẫu
```

---

## Responsive Breakpoints

| Thiết bị | Breakpoint | Thay đổi chính             |
|----------|------------|----------------------------|
| Mobile   | < 480px    | Grid 2 cột, menu hamburger |
| Tablet   | 480–768px  | Grid 3 cột                 |
| Desktop  | 768–1024px | Grid 4 cột, sidebar hiện   |
| Wide     | ≥ 1280px   | Container max 1200px       |

---

## Tiến độ

### Đã hoàn thành

#### Giao diện & Layout

- [x] Header sticky: logo + search + hotline + user menu + cart + dark toggle
- [x] TopBar thông báo cuộn ngang
- [x] CategoryNav danh mục nằm ngang
- [x] Footer 4 cột (brand / danh mục / sản phẩm / liên hệ)
- [x] Mobile menu (drawer)
- [x] Dark mode / Light mode toggle (no-flash, persist localStorage)
- [x] Dark mode đồng bộ toàn bộ component kể cả footer và admin sidebar (CSS custom properties)
- [x] Animation hệ thống: slideUp, pulseSoft, fadeIn, underlineGrow, stagger grid, icon hover scale, button lift
- [x] `prefers-reduced-motion` — tắt toàn bộ animation khi người dùng bật chế độ giảm chuyển động

#### Trang chủ

- [x] Hero banner (gradient + stats + CTA)
- [x] Flash Sale section (timer đếm ngược)
- [x] Sản phẩm nổi bật (8 sản phẩm mới nhất)
- [x] Danh mục sản phẩm (từ DB)
- [x] Thương hiệu nổi bật
- [x] Promo banners (3 banner màu)

#### Trang sản phẩm

- [x] Danh sách với filter (tìm kiếm, danh mục, giá, sắp xếp)
- [x] URL-based filter (shareable)
- [x] Loading skeleton
- [x] Empty state

#### Trang chi tiết

- [x] Gallery ảnh (main + thumbnails)
- [x] VariantSelector (storage / màu, hiển thị giá + tồn kho)
- [x] Thông số kỹ thuật
- [x] Đánh giá người dùng
- [x] Metadata SEO

#### Xác thực

- [x] Đăng nhập / Đăng ký
- [x] Bảo vệ route bằng middleware
- [x] User dropdown menu (avatar, tên, email)
- [x] Phân quyền admin

#### Trang tài khoản

- [x] Thông tin cá nhân + chỉnh sửa
- [x] Lịch sử đơn hàng (với badge trạng thái)
- [x] Cài đặt tài khoản

#### Admin Panel

- [x] Dashboard (thống kê + đơn hàng gần đây)
- [x] Quản lý sản phẩm (CRUD + upload ảnh Cloudinary)
- [x] Quản lý danh mục (CRUD)
- [x] Quản lý thương hiệu (CRUD)
- [x] Quản lý đơn hàng (xem + cập nhật trạng thái)
- [x] Quản lý người dùng
- [x] Layout sidebar cố định full viewport (`position: fixed; inset: 0`) — tách khỏi layout trang chính
- [x] Sidebar tách thành component con: `AdminBrand`, `AdminNav` (active state), `AdminUserInfo`
- [x] Sidebar responsive: hamburger + drawer overlay trên mobile
- [x] Sidebar đồng bộ light/dark mode theo theme

#### Database & Seed

- [x] Schema mở rộng: `CategoryAttribute` — mỗi danh mục có bộ thông số riêng
- [x] `ProductAttributeValue` hỗ trợ `textValue` (text tự do) bên cạnh `valueId` (predefined)
- [x] Migration `20260509000001` đã deploy lên Neon
- [x] Seed dữ liệu đa danh mục: Điện thoại, Laptop, Tai nghe, Màn hình
  - iPhone 15 (9 variants), iPhone 15 Pro Max (9), Samsung S24 Ultra (4)
  - MacBook Pro M3 14" (2), Dell XPS 13 Plus (2), ASUS ROG G14 (2)
  - Sony WH-1000XM5 (2), JBL Tune 770NC (3), LG UltraWide 34" (1)
- [x] CategoryAttribute seed: thông số theo nhóm cho 5 danh mục (Điện thoại / Laptop / PC / Màn hình / Tai nghe)
- [x] Brands: Apple, Samsung, Dell, Lenovo, Sony, JBL, ASUS, LG

#### Kỹ thuật

- [x] PostgreSQL + Prisma + Neon serverless
- [x] SCSS Design System (variables → CSS custom properties)
- [x] Responsive mobile/tablet/desktop
- [x] TypeScript strict
- [x] `next/script strategy="beforeInteractive"` cho no-flash theme script (React 19 compatible)
- [x] ThemeToggle hydration-safe: icon hiển thị bằng CSS `[data-theme='dark']`, không dùng React state

---

### Chưa hoàn thành / Cần làm

#### Ưu tiên cao

- [ ] Trang giỏ hàng `/cart` (chưa có nội dung)
- [ ] Thêm sản phẩm vào giỏ (logic + state management)
- [ ] Luồng đặt hàng (checkout flow)
- [ ] Bảng thông số kỹ thuật trên trang chi tiết sản phẩm (dùng `CategoryAttribute` + `ProductAttributeValue`)

#### Ưu tiên trung bình

- [ ] Trang `/about` (giới thiệu công ty)
- [ ] Phân trang thật (pagination component)
- [ ] Lọc theo thương hiệu trên trang danh sách
- [ ] Tìm kiếm nâng cao (gợi ý, kết quả real-time)
- [ ] Admin: giao diện nhập thông số sản phẩm theo `CategoryAttribute` khi tạo/sửa sản phẩm

#### Ưu tiên thấp / Nice-to-have

- [ ] Thanh toán (tích hợp VNPAY / MoMo)
- [ ] Wishlist (yêu thích sản phẩm)
- [ ] So sánh sản phẩm
- [ ] Thông báo (notification)
- [ ] Deploy lên Vercel

---

## Lưu ý kỹ thuật quan trọng

### SCSS Variables vs CSS Custom Properties

`_variables.scss` có **hai lớp**:

1. **Static SCSS vars** (đầu file): màu tĩnh như `$color-primary: #E30019`, spacing, radius...
2. **Runtime vars** (cuối file): override semantic vars thành `var(--...)` để dark mode hoạt động

```scss
// Cuối _variables.scss — runtime override
$color-text:     var(--color-text);    // dùng ở module → ra CSS var
$color-bg-card:  var(--color-bg-card); // tự động đổi theo theme
```

### Hydration Warning

`<html suppressHydrationWarning>` trong `layout.tsx` — bắt buộc vì inline script
set `data-theme` trước khi React hydrate, gây mismatch nếu không có flag này.

### No-flash Theme Script (React 19)

React 19 không thực thi `<script>` tag render trong JSX trên client.
Dùng `<Script id="theme-init" strategy="beforeInteractive">` từ `next/script` thay thế.

### ThemeToggle — Hydration Safe

`ThemeToggle` render cả hai icon (sun + moon) cùng lúc.
CSS `[data-theme='dark'] .sunIcon { display: block }` điều khiển icon nào hiện — không dùng `isDark` React state.
Tránh hydration mismatch vì server (light default) và client (đọc localStorage) có thể khác nhau.

### Footer vs Admin Sidebar Colors

Cả footer và admin sidebar đều dùng chung bộ biến `--color-footer-*`.

- **Light mode**: `--color-footer-bg: hsl(220,10%,96%)` — sáng, đổi theo theme
- **Dark mode**: `--color-footer-bg: hsl(220,15%,7%)` — tối navy

Nếu muốn admin sidebar luôn tối bất kể theme → dùng biến SCSS cục bộ `$sb-*` hardcode trong `admin/layout.module.scss`.

### Admin Layout

Admin panel dùng `position: fixed; inset: 0; z-index: 900` — phủ toàn viewport, che hoàn toàn layout trang chính (Header, Footer...).
Sidebar tách thành 3 component con trong `src/app/admin/_components/`: `AdminBrand`, `AdminNav`, `AdminUserInfo`.
`AdminNav` là client component dùng `usePathname()` để highlight mục đang active.

### Schema Thông Số Sản Phẩm

- `CategoryAttribute`: liên kết Category ↔ Attribute, có `groupName` (nhóm hiển thị) và `showInSpec`
- `ProductAttributeValue.textValue`: lưu thông số text tự do (VD: "Apple M3 (4nm)") — dùng cho bảng spec
- `ProductAttributeValue.valueId`: lưu giá trị predefined — dùng cho variant selector (storage, color, ram)
- Unique constraint `(productId, attributeId)` — mỗi sản phẩm chỉ có một giá trị cho mỗi thuộc tính

### Section Spacing

- `.section`: `padding-block: $space-8` (32px)
- `.sectionNoTop`: `padding-top: $space-6` (24px) — không dùng 0 để tránh header bị che khi section đứng đầu
