import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { db } from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params
    const decoded = decodeURIComponent(publicId)

    await cloudinary.uploader.destroy(decoded)

    await db.productImage.deleteMany({
      where: { url: { contains: decoded } },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[DELETE /api/upload]', error)
    return NextResponse.json({ error: 'Xóa thất bại' }, { status: 500 })
  }
}