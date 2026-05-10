'use client'

type Props = {
  action: (formData: FormData) => Promise<void>
  confirmMessage: string
  hiddenFields: Record<string, string>
  className?: string
  label?: string
}

export default function DeleteConfirmBtn({
  action,
  confirmMessage,
  hiddenFields,
  className,
  label = 'Xóa',
}: Props) {
  return (
    <form action={action}>
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        type="submit"
        className={className}
        onClick={(e) => { if (!confirm(confirmMessage)) e.preventDefault() }}
      >
        {label}
      </button>
    </form>
  )
}
