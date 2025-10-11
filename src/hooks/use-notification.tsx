"use client"

import { useCallback } from "react"
import { useNotification as useNotificationComponent } from "@/components/ui/notification"
import type { NotificationOptions, NotificationType } from "@/components/ui/notification"

// Enhanced hook with additional convenience methods
export function useNotification() {
  const notification = useNotificationComponent()

  // Show a notification with automatic type detection
  const show = useCallback((type: NotificationType, options: NotificationOptions) => {
    return notification[type](options)
  }, [notification])

  // Quick success notification
  const success = useCallback((title: string, description?: string) => {
    return notification.success({ title, description })
  }, [notification])

  // Quick error notification
  const error = useCallback((title: string, description?: string) => {
    return notification.error({ title, description })
  }, [notification])

  // Quick warning notification
  const warning = useCallback((title: string, description?: string) => {
    return notification.warning({ title, description })
  }, [notification])

  // Quick info notification
  const info = useCallback((title: string, description?: string) => {
    return notification.info({ title, description })
  }, [notification])

  // Quick loading notification
  const loading = useCallback((title: string, description?: string) => {
    return notification.loading({ title, description })
  }, [notification])

  // Show a notification for API operations
  const apiOperation = useCallback(async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    const loadingId = loading(messages.loading)
    
    try {
      const result = await promise
      success(messages.success)
      return result
    } catch (err) {
      error(messages.error)
      throw err
    } finally {
      notification.dismiss(loadingId)
    }
  }, [notification, loading, success, error])

  // Form validation notification
  const formError = useCallback((field: string, message: string) => {
    return error(`Validation Error: ${field}`, message)
  }, [error])

  // File upload notification
  const fileUpload = useCallback(async <T,>(
    uploadPromise: Promise<T>,
    fileName: string
  ) => {
    return apiOperation(uploadPromise, {
      loading: `Uploading ${fileName}...`,
      success: `${fileName} uploaded successfully`,
      error: `Failed to upload ${fileName}`
    })
  }, [apiOperation])

  // Network request notification
  const networkRequest = useCallback(async <T,>(
    requestPromise: Promise<T>,
    action: string
  ) => {
    return apiOperation(requestPromise, {
      loading: `${action}...`,
      success: `${action} completed successfully`,
      error: `Failed to ${action.toLowerCase()}`
    })
  }, [apiOperation])

  // Copy to clipboard notification
  const copyToClipboard = useCallback(async (text: string, label = "Text") => {
    try {
      await navigator.clipboard.writeText(text)
      success("Copied to clipboard", `${label} has been copied`)
    } catch (err) {
      error("Copy failed", "Could not copy to clipboard")
    }
  }, [success, error])

  // Show notification with action button
  const withAction = useCallback((
    type: NotificationType,
    options: NotificationOptions & {
      actionLabel: string
      onAction: () => void
    }
  ) => {
    const { actionLabel, onAction, ...notificationOptions } = options
    return show(type, {
      ...notificationOptions,
      action: {
        label: actionLabel,
        onClick: onAction
      }
    })
  }, [show])

  // Show persistent notification (no auto-dismiss)
  const persistent = useCallback((
    type: NotificationType,
    options: Omit<NotificationOptions, 'duration'>
  ) => {
    return show(type, {
      ...options,
      duration: Infinity
    })
  }, [show])

  // Show notification with custom icon
  const withIcon = useCallback((
    type: NotificationType,
    options: NotificationOptions & {
      icon: React.ReactNode
    }
  ) => {
    return show(type, options)
  }, [show])

  // Batch notifications (show multiple at once)
  const batch = useCallback((notifications: Array<{
    type: NotificationType
    options: NotificationOptions
  }>) => {
    return notifications.map(({ type, options }) => show(type, options))
  }, [show])

  // Timed notification (dismiss after custom duration)
  const timed = useCallback((
    type: NotificationType,
    options: NotificationOptions & {
      duration: number
    }
  ) => {
    return show(type, options)
  }, [show])

  // Position-based notification
  const atPosition = useCallback((
    type: NotificationType,
    options: NotificationOptions & {
      position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"
    }
  ) => {
    return show(type, options)
  }, [show])

  return {
    // Basic methods
    show,
    success,
    error,
    warning,
    info,
    loading,
    dismiss: notification.dismiss,
    
    // Convenience methods
    apiOperation,
    formError,
    fileUpload,
    networkRequest,
    copyToClipboard,
    
    // Advanced methods
    withAction,
    persistent,
    withIcon,
    batch,
    timed,
    atPosition,
    
    // Promise support
    promise: notification.promise,
    
    // Raw access to underlying notification system
    raw: notification
  }
}

// Type for the hook return value
export type UseNotificationReturn = ReturnType<typeof useNotification>