interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="mx-auto mb-4 text-text-muted">{icon}</div>}
      <h3 className="text-lg font-headline font-semibold text-text mb-2">{title}</h3>
      {description && <p className="text-text-muted mb-6 max-w-md mx-auto">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
