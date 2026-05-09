"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./movie_dialog"
import { AlertTriangle, Loader2 } from "lucide-react"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  variant = "danger",
}: ConfirmModalProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const variantColors = {
    danger: "bg-rose-600 hover:bg-rose-700 shadow-rose-100",
    warning: "bg-amber-500 hover:bg-amber-600 shadow-amber-100",
    info: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100",
  }

  const iconColors = {
    danger: "text-rose-600 bg-rose-50",
    warning: "text-amber-500 bg-amber-50",
    info: "text-indigo-600 bg-indigo-50",
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader className="items-center text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-inner ${iconColors[variant]}`}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight text-gray-800">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-500 font-medium mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all flex items-center justify-center gap-2 ${variantColors[variant]}`}
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            {confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
