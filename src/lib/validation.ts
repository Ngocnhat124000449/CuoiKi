// ==========================================================================
// Shared input-validation helpers for admin create/update actions.
// Plain module (no 'use server') so it can export non-async utilities.
// Keeps app-level checks in sync with the database constraints declared in
// prisma/schema.prisma (VarChar lengths, FK relations, enums, unique keys).
// ==========================================================================

// VarChar length limits — mirror prisma/schema.prisma exactly.
export const LIMITS = {
  product:  { name: 255, slug: 270, shortDescription: 500, metaTitle: 160, metaDescription: 320 },
  brand:    { name: 100, slug: 110, websiteUrl: 255, countryOfOrigin: 80 },
  category: { name: 150, slug: 160, metaTitle: 160, metaDescription: 320 },
  coupon:   { code: 50, name: 100, description: 500 },
  variant:  { sku: 100 },
} as const

// slug: lowercase letters, digits, single hyphens between segments (URL-safe).
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug)
}

// Returns the first length violation message, or null when all pass.
export function checkLengths(
  fields: { label: string; value: string | null | undefined; max: number }[]
): string | null {
  for (const f of fields) {
    if (f.value && f.value.length > f.max) {
      return `${f.label} không được vượt quá ${f.max} ký tự`
    }
  }
  return null
}

// Decimal(precision, scale) upper bound, e.g. Decimal(18,2) → 10^16 - 0.01.
export function exceedsDecimal(value: number, precision: number, scale: number): boolean {
  const maxIntDigits = precision - scale
  return Math.abs(value) >= 10 ** maxIntDigits
}

// Translate a Prisma error code into a user-facing Vietnamese message.
// Pass context messages so each entity can phrase unique/FK errors precisely.
export function mapPrismaError(e: unknown, ctx: { unique?: string; fk?: string } = {}): string {
  const code = (e as { code?: string })?.code
  switch (code) {
    case 'P2002': return ctx.unique ?? 'Giá trị bị trùng, hãy kiểm tra lại'
    case 'P2003': return ctx.fk ?? 'Dữ liệu tham chiếu không tồn tại'
    case 'P2000': return 'Dữ liệu nhập vượt quá độ dài cho phép'
    case 'P2025': return 'Bản ghi không tồn tại hoặc đã bị xóa'
    default:      return 'Có lỗi xảy ra, thử lại sau'
  }
}
