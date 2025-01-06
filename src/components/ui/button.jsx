import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-green-600 text-white hover:bg-green-500 active:bg-green-700 focus-visible:outline-green-600",
        destructive: "bg-red-600 text-white hover:bg-red-500 active:bg-red-700 focus-visible:outline-red-600",
        outline: "border border-slate-200 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-100 active:text-slate-900/60 focus-visible:outline-green-600",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80 active:bg-slate-100/80",
        ghost: "hover:bg-slate-100 hover:text-slate-900 active:bg-slate-100 active:text-slate-900/60",
        link: "text-slate-900 underline-offset-4 hover:underline",
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
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
