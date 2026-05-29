# Thiết kế: Ảnh sản phẩm qua Cloudinary (10 sản phẩm/danh mục)

Ngày: 2026-05-26
Trạng thái: Đã duyệt — tiến hành thực thi

## Mục tiêu

Web hiện chưa có ảnh sản phẩm (không có bản ghi `ProductImage`). Mục tiêu: mỗi danh mục có 10 sản phẩm, mỗi sản phẩm có ảnh chính lấy tự động, upload lên Cloudinary, lưu URL `res.cloudinary.com` vào DB. Verify ảnh khớp sản phẩm theo lưới từng danh mục.

## Quyết định đã chốt

- **Nguồn ảnh: Hybrid** — ưu tiên Wikimedia Commons (ảnh thật, miễn phí bản quyền) → fallback `placehold.co` kèm tên sản phẩm khi không tìm được.
- **Verify: lưới theo danh mục** — sau khi seed xong, mở `/products?categoryId=<id>` (lưới 10 sản phẩm + tên), chụp 1 screenshot/danh mục, đọc, đánh dấu slug ảnh sai, lấy lại ảnh cho các slug đó, chụp lại để xác nhận.
- **Xóa dữ liệu**: wipe toàn bộ sản phẩm cũ theo thứ tự FK, có guard nếu tồn tại `OrderItem` (đơn hàng thật).

## Hạ tầng sẵn có

- `src/lib/cloudinary.ts` — cấu hình SDK từ env (`CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` trong `.env.local`).
- `src/app/api/upload/route.ts` — mẫu upload + lưu `ProductImage`.
- `next.config.ts` — đã cho phép host `res.cloudinary.com`.
- `ProductCard` — render `product.image.url` qua `next/image`, fallback emoji 📱.
- Query `product.ts` — lấy ảnh `where: { isPrimary: true }`.
- Cloudinary hỗ trợ `uploader.upload(remoteUrl, ...)` (tải ảnh từ URL từ xa).

## Danh sách sản phẩm (60 = 6 × 10)

Giữ 9 sản phẩm hiện có (★). Bổ sung brand: Xiaomi, Google, HP, Acer, MSI, Bose, Sennheiser, Razer, Logitech, Anker, Corsair, ViewSonic.

- **Điện thoại**: ★iPhone 15, ★iPhone 15 Pro Max, ★Galaxy S24 Ultra, iPhone 14, Galaxy S24, Galaxy A55, Xiaomi 14, Redmi Note 13 Pro, Pixel 8 Pro, Sony Xperia 1 VI
- **Laptop**: ★MacBook Pro M3 14", ★Dell XPS 13 Plus, ★ROG Zephyrus G14, MacBook Air M3, Dell Inspiron 15, ThinkPad X1 Carbon G12, Legion 5 Pro, HP Spectre x360 14, Acer Swift 14, Zenbook 14 OLED
- **PC**: Mac mini M2, iMac 24" M3, Dell OptiPlex 7010, HP Pavilion TP01, Lenovo IdeaCentre 5, ROG Strix G16, MSI MEG Trident X, Dell XPS Desktop 8960, Legion Tower 5, HP Omen 45L
- **Màn hình**: ★LG UltraWide 34", Samsung Odyssey G9, Dell UltraSharp U2723QE, LG UltraGear 27GP850, ASUS ProArt PA278CV, Samsung ViewFinity S8, ViewSonic VX2758, MSI Optix MAG274QRF, Dell S2722DGM, ASUS TUF VG27AQ
- **Tai nghe**: ★Sony WH-1000XM5, ★JBL Tune 770NC, AirPods Pro 2, AirPods Max, Bose QC Ultra, Sennheiser Momentum 4, Sony WF-1000XM5, JBL Live 660NC, Razer BlackShark V2 Pro, Sennheiser HD 660S
- **Phụ kiện**: Logitech MX Master 3S, MX Keys S, Anker PowerCore 20000, Apple Magic Keyboard, Magic Mouse, Samsung 45W Charger, Razer DeathAdder V3, Corsair K70 RGB, Anker 737 Charger, Apple AirTag

Mỗi sản phẩm mới: `basePrice`, `shortDescription`, vài spec theo `categoryAttribute` của danh mục, ≥1 `ProductVariant` (SKU duy nhất) + `Inventory`.

## Kiến trúc pipeline

Viết lại `prisma/seed.ts`:
1. **Wipe an toàn** sản phẩm cũ (thứ tự FK bên dưới), guard `OrderItem`.
2. Tái tạo base data idempotent: brands (+brand mới), categories, attributes, attributeValues, categoryAttributes.
3. Tạo 60 product + spec + variant + inventory.
4. Với mỗi product: `resolveProductImage(name)` → upload Cloudinary → tạo `ProductImage{ isPrimary:true }`.

Module tách nhỏ:
- `prisma/lib/commons.ts` — `searchCommonsImage(query): Promise<string|null>` gọi Commons API `action=query&generator=search&gsrnamespace=6&prop=imageinfo&iiprop=url|mime&iiurlwidth=800`, lọc mime ảnh + ưu tiên tiêu đề chứa model.
- `prisma/lib/product-images.ts` — `resolveProductImage(name)`: Commons → fallback `placehold.co`; `uploadToCloudinary(url, publicHint)` trả `secure_url`.
- `prisma/refresh-image.ts <slug...>` — lấy lại ảnh cho sản phẩm bị verify đánh dấu sai (thử ứng viên Commons kế tiếp / query tinh chỉnh), không chạy lại toàn bộ seed.

## Thứ tự xóa an toàn (FK)

`productImages → variantOptions → productAttributeValues → cartItems → wishlistItems → inventoryTransactions → inventory → productDiscounts → couponProducts → productTags → productViews → (gỡ ref searchLogs.clickedProductId) → productVariants → products`

Guard: nếu `orderItem` count > 0 tham chiếu variant sắp xóa → dừng, báo lỗi (FK không cascade).

## Verify (lưới theo danh mục)

`npm run dev` (background) → mỗi danh mục: Playwright mở `/products?categoryId=<id>`, screenshot lưới 10 sản phẩm → đọc, lập danh sách slug sai → `refresh-image.ts <slugs>` → screenshot lại danh mục → lặp đến khi cả 6 danh mục đạt.

## File tạo/sửa

- ✏️ `prisma/seed.ts` (viết lại)
- ➕ `prisma/lib/commons.ts`, `prisma/lib/product-images.ts`, `prisma/refresh-image.ts`
- Không đụng UI.

## Rủi ro

Commons không phải lúc nào cũng có ảnh nền trắng đẹp cho mọi model (có thể ra ảnh hộp/teardown/thiếu) → một số sản phẩm rơi vào fallback. Vòng verify giảm thiểu nhưng khó đạt 100% ảnh "đẹp như nhà bán lẻ" khi lấy tự động.
