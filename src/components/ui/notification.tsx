"use client"

import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner"
import { CheckCircle, XCircle, AlertCircle, Info, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Notification types
export type NotificationType = "success" | "error" | "warning" | "info" | "loading"

export interface NotificationOptions {
    id?: string | number
    title?: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
    duration?: number
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"
    dismissible?: boolean
    icon?: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

// Notification component with rich features
export function Notification({
    type = "info",
    title,
    description,
    action,
    icon: customIcon,
    className,
    ...props
}: NotificationOptions & { type?: NotificationType }) {
    const getDefaultIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle className="h-5 w-5 text-green-500" />
            case "error":
                return <XCircle className="h-5 w-5 text-red-500" />
            case "warning":
                return <AlertCircle className="h-5 w-5 text-yellow-500" />
            case "loading":
                return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            default:
                return <Info className="h-5 w-5 text-blue-500" />
        }
    }

    const icon = customIcon || getDefaultIcon()

    return (
        <div
            className={cn(
                "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
                "bg-background text-foreground border-border",
                className
            )}
            {...props}
        >
            <div className="flex flex-1 items-center space-x-3">
                <div className="flex-shrink-0 pt-0.5">
                    {icon}
                </div>
                <div className="flex-1 space-y-1">
                    {title && (
                        <div className="text-sm font-semibold leading-tight">
                            {title}
                        </div>
                    )}
                    {description && (
                        <div className="text-sm opacity-90 leading-tight">
                            {description}
                        </div>
                    )}
                </div>
            </div>

            {action && (
                <div className="flex-shrink-0">
                    <button
                        onClick={action.onClick}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs"
                    >
                        {action.label}
                    </button>
                </div>
            )}

            <button
                onClick={() => sonnerToast.dismiss(props.id?.toString())}
                className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
        </div>
    )
}

// Main notification hook
export function useNotification() {
    const show = (type: NotificationType) => (options: NotificationOptions) => {
        const { id, title, description, action, duration, position, dismissible, icon, className, style } = options

        const toastOptions = {
            id,
            duration: duration ?? (type === "loading" ? Infinity : 5000),
            position: position ?? "bottom-right",
            dismissible: dismissible ?? true,
            style,
            className: cn(
                "!p-0 !bg-transparent !shadow-none !border-none",
                className
            ),
        }

        return sonnerToast.custom(
            (toastId) => (
                <Notification
                    type={type}
                    id={toastId}
                    title={title}
                    description={description}
                    action={action}
                    icon={icon}
                    className={className}
                />
            ),
            toastOptions
        )
    }

    return {
        success: show("success"),
        error: show("error"),
        warning: show("warning"),
        info: show("info"),
        loading: show("loading"),
        dismiss: sonnerToast.dismiss,
        promise: <T,>(
            promise: Promise<T>,
            options: {
                loading: NotificationOptions
                success: NotificationOptions | ((data: T) => NotificationOptions)
                error: NotificationOptions | ((error: Error) => NotificationOptions)
            }
        ) => {
            return sonnerToast.promise(
                promise,
                {
                    loading: (
                        <Notification
                            type="loading"
                            {...options.loading}
                        />
                    ),
                    success: (data: T) => {
                        const successOptions = typeof options.success === 'function'
                            ? options.success(data)
                            : options.success
                        return <Notification type="success" {...successOptions} />
                    },
                    error: (error: Error) => {
                        const errorOptions = typeof options.error === 'function'
                            ? options.error(error)
                            : options.error
                        return <Notification type="error" {...errorOptions} />
                    },
                }
            )
        }
    }
}

// Preset notification functions for common use cases
export const notification = {
    success: (options: NotificationOptions) => {
        const { success } = useNotification()
        return success(options)
    },

    error: (options: NotificationOptions) => {
        const { error } = useNotification()
        return error(options)
    },

    warning: (options: NotificationOptions) => {
        const { warning } = useNotification()
        return warning(options)
    },

    info: (options: NotificationOptions) => {
        const { info } = useNotification()
        return info(options)
    },

    loading: (options: NotificationOptions) => {
        const { loading } = useNotification()
        return loading(options)
    },

    promise: <T,>(
        promise: Promise<T>,
        options: {
            loading: NotificationOptions
            success: NotificationOptions | ((data: T) => NotificationOptions)
            error: NotificationOptions | ((error: Error) => NotificationOptions)
        }
    ) => {
        const { promise: showPromise } = useNotification()
        return showPromise(promise, options)
    },

    dismiss: (id?: string | number) => {
        sonnerToast.dismiss(id?.toString())
    }
}


// Enhanced Toaster component with better positioning and styling
export function NotificationToaster() {
    return (
        <SonnerToaster
            position="bottom-right"
            expand={true}
            richColors={false}
            closeButton={false}
            toastOptions={{
                className: "!p-0 !bg-transparent !shadow-none !border-none",
                style: {
                    background: "transparent",
                    border: "none",
                    boxShadow: "none",
                    padding: 0,
                },
            }}
        />
    )
}

// Specialized notification components for common patterns
export function SuccessNotification({ title, description, ...props }: NotificationOptions) {
    return <Notification type="success" title={title} description={description} {...props} />
}

export function ErrorNotification({ title, description, ...props }: NotificationOptions) {
    return <Notification type="error" title={title} description={description} {...props} />
}

export function WarningNotification({ title, description, ...props }: NotificationOptions) {
    return <Notification type="warning" title={title} description={description} {...props} />
}

export function InfoNotification({ title, description, ...props }: NotificationOptions) {
    return <Notification type="info" title={title} description={description} {...props} />
}

export function LoadingNotification({ title, description, ...props }: NotificationOptions) {
    return <Notification type="loading" title={title} description={description} {...props} />
}

// Form field notification component
export function FieldNotification({
    message,
    type = "error"
}: {
    message: string
    type?: "error" | "warning" | "success"
}) {
    const iconMap = {
        error: <XCircle className="h-4 w-4 text-red-500" />,
        warning: <AlertCircle className="h-4 w-4 text-yellow-500" />,
        success: <CheckCircle className="h-4 w-4 text-green-500" />,
    }

    const colorMap = {
        error: "text-red-600 border-red-200 bg-red-50",
        warning: "text-yellow-600 border-yellow-200 bg-yellow-50",
        success: "text-green-600 border-green-200 bg-green-50",
    }

    return (
        <div className={cn(
            "flex items-center space-x-2 px-3 py-2 rounded-md border text-sm",
            colorMap[type]
        )}>
            {iconMap[type]}
            <span>{message}</span>
        </div>
    )
}