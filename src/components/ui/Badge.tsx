interface BadgeProps {
  variant?: 'default' | 'gold' | 'success' | 'warning' | 'error'
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-text-muted',
    gold: 'bg-gold-bg text-gold-dark',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-700',
    error: 'bg-red-50 text-red-700',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
