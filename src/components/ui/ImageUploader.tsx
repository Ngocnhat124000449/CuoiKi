'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import styles from './ImageUploader.module.scss'

type UploadedImage = {
  url     : string
  publicId: string
  width   : number
  height  : number
}

type Props = {
  productId?: string
  variantId?: string
  isPrimary?: boolean
  label?    : string
  onSuccess : (image: UploadedImage) => void
}

export default function ImageUploader({
  productId, variantId, isPrimary = false, label = 'Tải ảnh lên', onSuccess
}: Props) {
  const [preview,   setPreview]   = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [progress,  setProgress]  = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    setProgress(30)

    const formData = new FormData()
    formData.append('file', file)
    if (productId) formData.append('productId', productId)
    if (variantId) formData.append('variantId', variantId)
    formData.append('isPrimary', String(isPrimary))

    try {
      setProgress(60)
      const res  = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProgress(100)
      onSuccess(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload thất bại')
      setPreview(null)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className={styles.wrap}>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onDragOver={e => e.preventDefault()}
        className={`${styles.dropzone} ${uploading ? styles.uploading : ''}`}
      >
        {preview ? (
          <div className={styles.preview}>
            <Image src={preview} alt="Preview" fill className={styles.previewImg} />
          </div>
        ) : (
          <div className={styles.placeholder}>
            <p className={styles.icon}>📷</p>
            <p className={styles.label}>{label}</p>
            <p className={styles.hint}>Kéo thả hoặc click để chọn</p>
            <p className={styles.hint}>JPG, PNG, WEBP — tối đa 5MB</p>
          </div>
        )}
        {uploading && (
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif"
        className={styles.input} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />

      {uploading && <p className={styles.status}>⏳ Đang upload...</p>}
      {error     && <p className={styles.error}>❌ {error}</p>}
    </div>
  )
}
