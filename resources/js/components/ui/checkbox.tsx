import * as React from "react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  checked,
  onChange,
  onCheckedChange,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onCheckedChange"> & {
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      checked={checked}
      onChange={(e) => {
        onCheckedChange?.(e.target.checked)
        onChange?.(e)
      }}
      className={cn(
        "peer border-input accent-primary size-4 shrink-0 rounded-[4px] border shadow-xs outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

export { Checkbox }
