"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  /** Selected date as "YYYY-MM-DD" string or null */
  value: string | null
  /** Called with "YYYY-MM-DD" string or null */
  onChange: (value: string | null) => void
  /** Placeholder text when no date is selected */
  placeholder?: string
  /** Additional className for the trigger button */
  className?: string
  /** HTML id for the trigger */
  id?: string
  /** aria-invalid for form integration */
  "aria-invalid"?: boolean
  /** Disable the picker */
  disabled?: boolean
}

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function formatToString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  className,
  id,
  disabled,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = parseDate(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            data-empty={!value}
            aria-invalid={props["aria-invalid"]}
            className={cn(
              "w-full h-11 justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="size-4" />
        {selected
          ? format(selected, "d 'de' MMMM, yyyy", { locale: es })
          : placeholder}
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={selected}
          onSelect={(date) => {
            onChange(date ? formatToString(date) : null)
            setOpen(false)
          }}
          locale={es}
          weekStartsOn={1}
          startMonth={new Date(2020, 0)}
          endMonth={new Date(2030, 11)}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
