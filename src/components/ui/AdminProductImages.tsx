'use client'

import { useState } from 'react'
import Image from 'next/image'
import ImageUploader from './ImageUploader'
import styles from './AdminProductImages.module.scss'

type Img = { url: string; publicId: string }

export default function AdminProductImages({ productId }: { productId: string }) {
  const [images, setImages] = useState<Img[]>([])

  const handleDelete = async (img: Img) => {
    const publicId = encodeURIComponent(img.publicId)
    await fetch(`/api/upload/${publicId}`, { method: 'DELETE' })
    setImages(prev => prev.filter(i => i.publicId !== img.publicId))
  }

  return (
    <div className={styles.wrap}>
      <h3 className={styles.title}>Ảnh sản phẩm</h3>

      <ImageUploader
        productId={productId}
        isPrimary={images.length === 0}
        label="Thêm ảnh sản phẩm"
        onSuccess={img => setImages(prev => [...prev, img])}
      />

      {images.length > 0 && (
        <div className={styles.grid}>
          {images.map((img, i) => (
            <div key={img.publicId} className={styles.item}>
              <div className={styles.imageWrap}>
                <Image src={img.url} alt={`Ảnh ${i + 1}`} fill className={styles.image} />
              </div>
              {i === 0 && (
                <span className={styles.primaryBadge}>
                  Chính
                </span>
              )}
              <button onClick={() => handleDelete(img)}
                className={styles.deleteBtn}
                type="button"
                aria-label="Xóa ảnh">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
