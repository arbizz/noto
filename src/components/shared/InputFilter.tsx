"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { categoryOptions, reportReasonOptions, reportStatusOptions } from "@/constants/enums"
import { LucideSearch } from "lucide-react"

type SearchFilterConfig = {
  type: "search"
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSearch: () => void
}

type CategoryFilterConfig = {
  type: "category"
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

type VisibilityFilterConfig = {
  type: "visibility"
  value: string
  onChange: (value: string) => void
}

type ReasonFilterConfig = {
  type: "reason"
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

type OrderFilterConfig = {
  type: "order"
  value: "asc" | "desc"
  onChange: (value: "asc" | "desc") => void
  placeholder?: string
}

type StatusFilterConfig = {
  type: "status"
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

type FilterConfig =
  | SearchFilterConfig
  | CategoryFilterConfig
  | VisibilityFilterConfig
  | ReasonFilterConfig
  | OrderFilterConfig
  | StatusFilterConfig

type InputFilterProps = {
  filters: FilterConfig[]
  showSearch?: boolean
  showCategory?: boolean
  showVisibility?: boolean
  showReason?: boolean
  showOrder?: boolean
  showStatus?: boolean
  className?: string
}

function InputFilter({
  filters,
  showSearch = false,
  showCategory = false,
  showVisibility = false,
  showReason = false,
  showOrder = false,
  showStatus = false,
  className = "",
}: InputFilterProps) {
  const searchFilter = filters.find((f) => f.type === "search") as SearchFilterConfig | undefined
  const categoryFilter = filters.find((f) => f.type === "category") as CategoryFilterConfig | undefined
  const visibilityFilter = filters.find((f) => f.type === "visibility") as VisibilityFilterConfig | undefined
  const reasonFilter = filters.find((f) => f.type === "reason") as ReasonFilterConfig | undefined
  const orderFilter = filters.find((f) => f.type === "order") as OrderFilterConfig | undefined
  const statusFilter = filters.find((f) => f.type === "status") as StatusFilterConfig | undefined

  const visibleFilters = [
    { show: showSearch && searchFilter, component: searchFilter },
    { show: showCategory && categoryFilter, component: categoryFilter },
    { show: showVisibility && visibilityFilter, component: visibilityFilter },
    { show: showReason && reasonFilter, component: reasonFilter },
    { show: showOrder && orderFilter, component: orderFilter },
    { show: showStatus && statusFilter, component: statusFilter },
  ].filter((f) => f.show)

  const nonSearchFilters = visibleFilters.filter((f) => f.component?.type !== "search")

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {showSearch && searchFilter && (
        <InputFilterSearch
          placeholder={searchFilter.placeholder}
          value={searchFilter.value}
          onChange={searchFilter.onChange}
          onSearch={searchFilter.onSearch}
        />
      )}

      {nonSearchFilters.length > 0 && (
        <div className={`grid w-full gap-4 ${
          nonSearchFilters.length === 1 ? "grid-cols-1" :
          nonSearchFilters.length === 2 ? "grid-cols-2" :
          "grid-cols-3"
        }`}>
          {showCategory && categoryFilter && (
            <InputFilterCategory
              value={categoryFilter.value}
              onChange={categoryFilter.onChange}
              placeholder={categoryFilter.placeholder}
            />
          )}

          {showStatus && statusFilter && (
            <InputFilterStatus
              value={statusFilter.value}
              onChange={statusFilter.onChange}
              placeholder={statusFilter.placeholder}
            />
          )}

          {showReason && reasonFilter && (
            <InputFilterReason
              value={reasonFilter.value}
              onChange={reasonFilter.onChange}
              placeholder={reasonFilter.placeholder}
            />
          )}

          {showOrder && orderFilter && (
            <InputFilterOrder
              value={orderFilter.value}
              onChange={orderFilter.onChange}
              placeholder={orderFilter.placeholder}
            />
          )}

          {showVisibility && visibilityFilter && (
            <InputFilterVisibility
              value={visibilityFilter.value}
              onChange={visibilityFilter.onChange}
            />
          )}
        </div>
      )}
    </div>
  )
}

function InputFilterSearch({
  value,
  onChange,
  onSearch,
  placeholder = "Search by title...",
}: {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  placeholder?: string
}) {
  return (
    <div className="flex w-full gap-3">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSearch()
          }
        }}
        className="flex-1"
      />

      <Button type="button" size="icon" onClick={onSearch}>
        <LucideSearch />
      </Button>
    </div>
  )
}

function InputFilterCategory({  
  value,
  onChange,
  placeholder = "Category",
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {categoryOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function InputFilterVisibility({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex w-full justify-between gap-2">
      <Label className="whitespace-nowrap">Visibility:</Label>

      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex flex-1 justify-between"
      >
        <Label className="flex items-center gap-2 border p-2 rounded-md shadow-xs w-full">
          <RadioGroupItem value="all" />
          All
        </Label>

        <Label className="flex items-center gap-2 border p-2 rounded-md shadow-xs w-full">
          <RadioGroupItem value="private" />
          Private
        </Label>

        <Label className="flex items-center gap-2 border p-2 rounded-md shadow-xs w-full">
          <RadioGroupItem value="public" />
          Public
        </Label>
      </RadioGroup>
    </div>
  )
}

function InputFilterReason({
  value,
  onChange,
  placeholder = "Reason",
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {reportReasonOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function InputFilterOrder({
  value,
  onChange,
  placeholder = "Order",
}: {
  value: "asc" | "desc"
  onChange: (value: "asc" | "desc") => void
  placeholder?: string
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="desc">Newest</SelectItem>
        <SelectItem value="asc">Oldest</SelectItem>
      </SelectContent>
    </Select>
  )
}

function InputFilterStatus({
  value,
  onChange,
  placeholder = "Status",
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {reportStatusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { InputFilter }
export type {
  FilterConfig,
  SearchFilterConfig,
  CategoryFilterConfig,
  VisibilityFilterConfig,
  ReasonFilterConfig,
  OrderFilterConfig,
  StatusFilterConfig,
}