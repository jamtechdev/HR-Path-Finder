import * as React from "react"

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
  ...props
}: React.ComponentProps<"button">) {
  const ctx = React.useContext(CollapsibleContext)

  return (
    <button
      type="button"
      data-slot="collapsible-trigger"
      onClick={(e) => {
        ctx?.setOpen(!ctx.open)
        onClick?.(e)
      }}
      {...props}
    />
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
