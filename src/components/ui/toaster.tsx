"use client"

import * as ToastPrimitive from "@radix-ui/react-toast"
import { useToast } from "./use-toast"
import { CheckCircle2, XCircle, X, Info } from "lucide-react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
      {toasts.map((t) => {
        const isSuccess = t.variant === "success"
        const isError = t.variant === "error"

        return (
          <ToastPrimitive.Root
            key={t.id}
            open
            onOpenChange={(open) => { if (!open) dismiss(t.id) }}
            className={`
              group pointer-events-auto relative flex items-start gap-3 w-full max-w-sm rounded-xl border p-4 shadow-lg transition-all
              data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-4 data-[state=open]:fade-in-0 data-[state=open]:duration-300
              data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full data-[state=closed]:fade-out-0 data-[state=closed]:duration-200
              data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]
              data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform
              data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right-full
              ${isSuccess
                ? "bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800"
                : isError
                  ? "bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              }
            `}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {isSuccess ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              ) : isError ? (
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : (
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <ToastPrimitive.Title
                className={`text-sm font-semibold ${
                  isSuccess
                    ? "text-emerald-900 dark:text-emerald-100"
                    : isError
                      ? "text-red-900 dark:text-red-100"
                      : "text-slate-900 dark:text-slate-100"
                }`}
              >
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description
                  className={`mt-1 text-xs ${
                    isSuccess
                      ? "text-emerald-700 dark:text-emerald-300"
                      : isError
                        ? "text-red-700 dark:text-red-300"
                        : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>

            {/* Close button */}
            <ToastPrimitive.Close className="shrink-0 rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/5 dark:hover:bg-white/10">
              <X className="h-4 w-4 text-slate-500" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        )
      })}

      <ToastPrimitive.Viewport className="fixed bottom-20 right-4 z-[100] flex flex-col-reverse gap-2 w-full max-w-sm outline-none sm:bottom-6" />
    </ToastPrimitive.Provider>
  )
}
