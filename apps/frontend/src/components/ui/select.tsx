"use client"

import * as React from "react"
import { ChevronDownIcon } from "@heroicons/react/24/outline"

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface SelectValueProps {
  placeholder?: string
  className?: string
}

const SelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
} | null>(null)

const Select = ({ value, onValueChange, children, disabled = false }: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  React.useEffect(() => {
    if (disabled) setIsOpen(false)
  }, [disabled])
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = ({ children, className = "" }: SelectTriggerProps) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectTrigger must be used within Select")
  
  const { isOpen, setIsOpen } = context
  
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
      <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  )
}

const SelectValue = ({ placeholder = "Select...", className = "" }: SelectValueProps) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectValue must be used within Select")
  
  const { value } = context
  
  return (
    <span className={`block truncate ${!value ? 'text-gray-500 dark:text-gray-400' : ''} ${className}`}>
      {value || placeholder}
    </span>
  )
}

const SelectContent = ({ children, className = "" }: SelectContentProps) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectContent must be used within Select")
  
  const { isOpen, setIsOpen } = context
  
  React.useEffect(() => {
    const handleClickOutside = () => setIsOpen(false)
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen, setIsOpen])
  
  if (!isOpen) return null
  
  return (
    <div className={`absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-1 shadow-lg ${className}`}>
      {children}
    </div>
  )
}

const SelectItem = ({ value, children, className = "" }: SelectItemProps) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectItem must be used within Select")
  
  const { value: selectedValue, onValueChange, setIsOpen } = context
  const isSelected = selectedValue === value
  
  return (
    <button
      type="button"
      onClick={() => {
        onValueChange(value)
        setIsOpen(false)
      }}
      className={`relative flex w-full cursor-default select-none items-center py-2 px-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
      } ${className}`}
    >
      {children}
    </button>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
