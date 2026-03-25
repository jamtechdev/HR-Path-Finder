import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

export function Toaster() {
  const { toasts } = useToast()
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof document === "undefined") return

    let node = document.getElementById("app-toast-root") as HTMLElement | null
    if (!node) {
      node = document.createElement("div")
      node.id = "app-toast-root"
      document.body.appendChild(node)
    }

    setPortalNode(node)
  }, [])

  if (!portalNode) return null

  return createPortal(
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, onOpenChange: _onOpenChange, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  , portalNode)
}
