import { cn } from "@/lib/utils"

interface FormErrorProps {
  message?: string | null
  children?: React.ReactNode
  className?: string
}

export function FormError({ message, children, className }: FormErrorProps) {
  const content = message || children
  
  if (!content) return null

  return (
    <p className={cn("text-xs text-rose-300 bg-rose-500/10 p-2 rounded border border-rose-500/20 animate-in fade-in duration-200", className)}>
      {content}
    </p>
  )
}
