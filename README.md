# Cách chạy đồ án PhoneShop

## 1. Clone source code

```bash
git clone https://github.com/Ngocnhat124000449/CuoiKi.git
cd CuoiKi/my-myapp
```

## 2. Cài package

```bash
npm install
```

## 3. Tạo file môi trường

Tạo file `.env.local` trong thư mục `CuoiKi`.

```env
DATABASE_URL="postgresql://neondb_owner:npg_xgDF63oPRXVj@ep-divine-flower-aoyryaf3-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
CLOUDINARY_CLOUD_NAME="dkczxprrd"

CLOUDINARY_API_KEY="644759851737567"

CLOUDINARY_API_SECRET="4WoskVAzsT7Wc5p9BB6yXhSg6hM"

AUTH_SECRET=BZlUSpX8KEUSDiPdLgKp/XBjdCapK1HaZzRnLQ9DC6o=


```

Dữ liệu demo đã được seed trong quá trình phát triển đồ án.

Khi dùng database của đồ án, không cần chạy lại migrate hoặc seed.

## 4. Chạy website trên localhost

```bash
npm run dev
```

Mở trình duyệt tại:

```bash
http://localhost:3000
```

## 5. Build kiểm tra production

```bash
npm run build
```

---

# Giới thiệu dự án

PhoneShop là website thương mại điện tử bán điện thoại và thiết bị công nghệ.

Dự án được xây dựng cho học phần **111100 - Lập trình Front-End**.

Mục tiêu của dự án là xây dựng website bằng **Next.js**, **TypeScript**, routing rõ ràng, dữ liệu động và giao diện hoàn chỉnh.

## Thông tin sinh viên

| Nội dung | Thông tin |
|---|---|
| Sinh viên | Nguyễn Ngọc Nhật |
| MSSV | 124000449 |
| Học phần | 111100 - Lập trình Front-End |
| Tên đề tài | PhoneShop - Website thương mại điện tử bán điện thoại |

## Chức năng chính

### Người dùng

- Xem trang chủ.
- Xem danh sách sản phẩm.
- Tìm kiếm sản phẩm.
- Lọc sản phẩm theo danh mục, thương hiệu và khoảng giá.
- Xem chi tiết sản phẩm theo dynamic route `/products/[slug]`.
- Chọn biến thể sản phẩm.
- Thêm sản phẩm vào giỏ hàng.
- Thanh toán đơn hàng.
- Đăng ký và đăng nhập.
- Xem thông tin tài khoản.
- Xem lịch sử đơn hàng.
- Gửi liên hệ.

### Quản trị

- Xem dashboard quản trị.
- Quản lý sản phẩm.
- Quản lý danh mục.
- Quản lý thương hiệu.
- Quản lý đơn hàng.
- Quản lý người dùng.
- Quản lý mã giảm giá.
- Upload ảnh sản phẩm qua Cloudinary.

## Các route chính

| Route | Chức năng |
|---|---|
| `/` | Trang chủ |
| `/products` | Danh sách sản phẩm |
| `/products/[slug]` | Chi tiết sản phẩm |
| `/cart` | Giỏ hàng |
| `/checkout` | Thanh toán |
| `/contact` | Liên hệ |
| `/about` | Giới thiệu |
| `/login` | Đăng nhập |
| `/register` | Đăng ký |
| `/account` | Tài khoản người dùng |
| `/admin` | Trang quản trị |
| `/api/products` | API danh sách sản phẩm |
| `/api/products/[slug]` | API chi tiết sản phẩm |

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 16.2.4 - App Router |
| Ngôn ngữ | TypeScript 5 |
| UI | React 19.2.4 |
| Styling | SCSS Modules, Sass |
| Database | PostgreSQL |
| ORM | Prisma 7.8.0 |
| Auth | NextAuth v5 beta |
| Upload ảnh | Cloudinary |
| Package manager | npm |

## Cấu trúc thư mục

```txt
my-myapp/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── contact/
│   │   ├── account/
│   │   ├── admin/
│   │   └── api/
│   ├── components/
│   ├── lib/
│   └── styles/
├── package.json
└── next.config.ts
```

## Script chính

| Lệnh | Mục đích |
|---|---|
| `npm run dev` | Chạy project trên localhost |
| `npm run build` | Build production |
| `npm run start` | Chạy bản production sau khi build |
| `npm run lint` | Kiểm tra lint |
| `npm run seed` | Seed dữ liệu khi tự tạo database mới |

## Ghi chú dữ liệu

Database dùng cho demo đã có dữ liệu sản phẩm, danh mục, thương hiệu và tài khoản trong quá trình phát triển.

Chỉ chạy `npm run seed` khi tạo database mới.

## Video demo

Video demo cá nhân sẽ trình bày:

- Cách tải source từ GitHub.
- Cách cài package.
- Cách tạo file môi trường.
- Cách chạy website trên localhost.
- Demo tối thiểu 3 trang.
- Phần việc cá nhân đã thực hiện.

Link video: cập nhật sau khi quay.
