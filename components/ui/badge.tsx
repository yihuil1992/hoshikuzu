import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-[2px] border px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.16em] transition-[color,border-color,background-color,box-shadow,opacity] duration-150 ease-[var(--ease-out-quint)] [a&]:active:opacity-85 [&>svg]:size-3 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[2px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border-primary/50 bg-primary/8 text-primary [a&]:hover:bg-primary/14",
        secondary:
          "border-border bg-secondary/55 text-muted-foreground [a&]:hover:text-foreground",
        destructive:
          "border-destructive/40 bg-destructive/10 text-destructive [a&]:hover:bg-destructive/16 focus-visible:ring-destructive/20",
        outline:
          "border-border bg-transparent text-muted-foreground [a&]:hover:border-ring/45 [a&]:hover:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
