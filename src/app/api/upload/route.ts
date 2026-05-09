import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const formData  = await req.formData()
    const file      = formData.get('file') as File | null
    const productId = formData.get('productId') as string | null
    const variantId = formData.get('variantId') as string | null
    const isPrimary = formData.get('isPrimary') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'Chưa chọn file' }, { status: 400 })
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Chỉ chấp nhận JPG, PNG, WEBP, AVIF' }, { status: 400 })
    }

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    const result = await cloudinary.uploader.upload(base64, {
      folder        : 'phoneshop/products',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto'  },
      ],
    })

    let savedImage = null
    if (productId) {
      if (isPrimary) {
        await db.productImage.updateMany({
          where: { productId: BigInt(productId) },
          data : { isPrimary: false },
        })
      }
      savedImage = await db.productImage.create({
        data: {
          productId   : BigInt(productId),
          variantId   : variantId ? BigInt(variantId) : null,
          url         : result.secure_url,
          altText     : file.name.replace(/\.[^.]+$/, ''),
          widthPx     : result.width,
          heightPx    : result.height,
          isPrimary,
          displayOrder: 0,
        },
      })
    }

    return NextResponse.json({
      url     : result.secure_url,
      publicId: result.public_id,
      width   : result.width,
      height  : result.height,
      savedImage,
    })

  } catch (error) {
    console.error('[POST /api/upload]', error)
    return NextResponse.json({ error: 'Upload thất bại' }, { status: 500 })
  }
}
