import * as React from "react"

import { cn } from "@/lib/utils"

function TooltipProvider({
  ...props
}: React.ComponentProps<"div">) {
  return <>{props.children}</>
}

function Tooltip({ ...props }: React.ComponentProps<"div">) {
  return <div data-slot="tooltip" className="relative inline-flex" {...props} />
}

function TooltipTrigger({ ...props }: React.ComponentProps<"div">) {
  return <div data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tooltip-content"
      className={cn(
        "bg-primary text-primary-foreground z-50 max-w-sm rounded-md px-3 py-1.5 text-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
