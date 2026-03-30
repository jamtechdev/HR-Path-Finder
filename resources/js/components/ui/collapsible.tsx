import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

type CollapsibleContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}
const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null)

function Collapsible({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const resolvedOpen = open ?? internalOpen

  const setOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <CollapsibleContext.Provider value={{ open: resolvedOpen, setOpen }}>
      <div data-slot="collapsible" {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

function CollapsibleTrigger({
  onClick,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean; children?: React.ReactNode }) {
  const ctx = React.useContext(CollapsibleContext)
  const Comp: any = asChild ? Slot : "button"

  return (
    <Comp
      type="button"
      data-slot="collapsible-trigger"
      onClick={(e: any) => {
        ctx?.setOpen(!ctx.open)
        onClick?.(e)
      }}
      {...props}
    >
      {children}
    </Comp>
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<"div">) {
  const ctx = React.useContext(CollapsibleContext)
  if (!ctx?.open) return null

  return (
    <div data-slot="collapsible-content" {...props} />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
