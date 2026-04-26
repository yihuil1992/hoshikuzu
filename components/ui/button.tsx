import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[2px] text-xs font-semibold uppercase tracking-[0.16em] transition-[border-color,background-color,color,box-shadow,opacity] duration-150 ease-[var(--ease-out-quint)] active:opacity-85 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[2px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "border border-primary/80 bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:bg-primary/90 hover:border-primary",
        destructive:
          "border border-destructive/60 bg-destructive/18 text-destructive hover:bg-destructive/24 focus-visible:ring-destructive/20",
        outline:
          "border border-border bg-card/40 text-foreground hover:border-ring/45 hover:bg-secondary/70",
        secondary:
          "border border-border bg-secondary/80 text-secondary-foreground hover:border-ring/35 hover:bg-secondary",
        ghost:
          "text-muted-foreground hover:bg-secondary/65 hover:text-foreground",
        link: "h-auto px-0 py-0 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
      },
      size: {
        default: "h-9 px-3 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-2.5 has-[>svg]:px-2",
        lg: "h-10 px-4 has-[>svg]:px-3",
        icon: "size-9 p-0",
        "icon-sm": "size-8 p-0",
        "icon-lg": "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
