import React from "react"
import { cn } from "../../lib/utils"

const buttonVariants = {
  base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  variants: {
    variant: {
      default: "bg-red-600 text-white hover:bg-red-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
      ghost: "hover:bg-gray-100 hover:text-gray-900",
      link: "text-red-600 underline-offset-4 hover:underline",
      porsche: "bg-red-600 text-white shadow-lg hover:bg-red-700 hover:shadow-xl",
      hero: "bg-transparent border border-red-600 text-red-600 hover:bg-red-600 hover:text-white shadow-lg backdrop-blur-sm",
      premium: "bg-white text-gray-900 border border-gray-200 hover:border-red-600 shadow-md hover:shadow-lg",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
}

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  asChild = false, 
  children,
  ...props 
}, ref) => {
  const baseClasses = buttonVariants.base
  const variantClasses = buttonVariants.variants.variant[variant] || buttonVariants.variants.variant.default
  const sizeClasses = buttonVariants.variants.size[size] || buttonVariants.variants.size.default
  
  const combinedClasses = cn(baseClasses, variantClasses, sizeClasses, className)
  
  return (
    <button
      className={combinedClasses}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"

export { Button, buttonVariants }