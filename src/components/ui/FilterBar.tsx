import type { ChangeEventHandler, ReactNode } from 'react'
import { SearchIcon } from './Icons'

interface SearchFieldProps {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

export function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <label className="filter-field filter-field--search">
      <span className="filter-field__label">Search projects</span>
      <span className="search-input">
        <SearchIcon aria-hidden="true" height="20" width="20" />
        <input
          autoComplete="off"
          onChange={onChange}
          placeholder="Project, contractor, or location"
          type="search"
          value={value}
        />
      </span>
    </label>
  )
}

interface SelectFilterProps {
  label: string
  value: string
  onChange: ChangeEventHandler<HTMLSelectElement>
  children: ReactNode
}

export function SelectFilter({
  label,
  value,
  onChange,
  children,
}: SelectFilterProps) {
  return (
    <label className="filter-field">
      <span className="filter-field__label">{label}</span>
      <select onChange={onChange} value={value}>
        {children}
      </select>
    </label>
  )
}
