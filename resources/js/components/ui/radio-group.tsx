import * as React from "react"

import { cn } from "@/lib/utils"

type RadioGroupContextValue = {
  name?: string
  value?: string
  onValueChange?: (value: string) => void
}
const RadioGroupContext = React.createContext<RadioGroupContextValue>({})

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    name?: string
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
  }
>(({ className, name, value, defaultValue, onValueChange, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const current = value ?? internalValue

  const handleValueChange = (next: string) => {
    if (value === undefined) setInternalValue(next)
    onValueChange?.(next)
  }

  return (
    <RadioGroupContext.Provider value={{ name, value: current, onValueChange: handleValueChange }}>
      <div ref={ref} className={cn("grid gap-2", className)} {...props} />
    </RadioGroupContext.Provider>
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "onCheckedChange"> & {
    onCheckedChange?: (checked: boolean) => void
  }
>(({ className, value = "", checked, onChange, onCheckedChange, ...props }, ref) => {
  const group = React.useContext(RadioGroupContext)
  const computedChecked = checked ?? (group.value !== undefined ? group.value === value : undefined)

  return (
    <input
      type="radio"
      ref={ref}
      name={group.name}
      value={value}
      checked={computedChecked}
      onChange={(e) => {
        group.onValueChange?.(String(value))
        onCheckedChange?.(e.target.checked)
        onChange?.(e)
      }}
      className={cn(
        "h-4 w-4 accent-primary rounded-full border border-primary disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
