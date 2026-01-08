"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Ban, RotateCcw } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SelectionCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  ariaLabel?: string
}

/**
 * Checkbox component for row selection in data tables
 */
export function SelectionCheckbox({
  checked,
  onCheckedChange,
  disabled = false,
  ariaLabel = "Select row",
}: SelectionCheckboxProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className="translate-y-[2px] dark:border-slate-400 dark:data-[state=unchecked]:bg-slate-800/50"
    />
  )
}

interface SelectAllCheckboxProps {
  checked: boolean | "indeterminate"
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

/**
 * Checkbox component for selecting all rows in the header
 */
export function SelectAllCheckbox({
  checked,
  onCheckedChange,
  disabled = false,
}: SelectAllCheckboxProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label="Select all"
      className="translate-y-[2px] dark:border-slate-400 dark:data-[state=unchecked]:bg-slate-800/50"
    />
  )
}

interface ExcludeRowButtonProps {
  onClick: () => void
  disabled?: boolean
  isExcluded?: boolean
}

/**
 * Button to exclude a single row from calculations
 */
export function ExcludeRowButton({
  onClick,
  disabled = false,
  isExcluded = false,
}: ExcludeRowButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            disabled={disabled || isExcluded}
          >
            <Ban className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isExcluded ? "Already excluded" : "Exclude from calculations"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface RestoreRowButtonProps {
  onClick: () => void
  disabled?: boolean
}

/**
 * Button to restore a previously excluded row
 */
export function RestoreRowButton({
  onClick,
  disabled = false,
}: RestoreRowButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            disabled={disabled}
          >
            <RotateCcw className="h-4 w-4 text-muted-foreground hover:text-green-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Restore to calculations</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface ExcludeSelectedButtonProps {
  selectedCount: number
  onClick: () => void
  disabled?: boolean
}

/**
 * Button shown when rows are selected to exclude them in bulk
 */
export function ExcludeSelectedButton({
  selectedCount,
  onClick,
  disabled = false,
}: ExcludeSelectedButtonProps) {
  if (selectedCount === 0) return null

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="gap-2"
    >
      <Ban className="h-4 w-4" />
      Exclude Selected ({selectedCount})
    </Button>
  )
}

interface RestoreSelectedButtonProps {
  selectedCount: number
  onClick: () => void
  disabled?: boolean
}

/**
 * Button shown when excluded rows are selected to restore them in bulk
 */
export function RestoreSelectedButton({
  selectedCount,
  onClick,
  disabled = false,
}: RestoreSelectedButtonProps) {
  if (selectedCount === 0) return null

  return (
    <Button
      variant="default"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="gap-2"
    >
      <RotateCcw className="h-4 w-4" />
      Restore Selected ({selectedCount})
    </Button>
  )
}

