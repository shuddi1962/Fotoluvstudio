import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean
}

export default function Card({ padding = true, className = '', children, ...props }: CardProps) {
  return (
    <div className={`card ${padding ? 'p-6' : ''} ${className}`} {...props}>
      {children}
    </div>
  )
}
