import type { ReactNode } from 'react'

interface FormFieldProps {
  id: string
  label: string
  children: ReactNode
  required?: boolean
  helperText?: string
  error?: string
}

export function FormField({
  id,
  label,
  children,
  required,
  helperText,
  error,
}: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {required ? (
          <>
            <span aria-hidden="true"> *</span>
            <span className="sr-only"> required</span>
          </>
        ) : null}
      </label>
      {children}
      {error ? (
        <p className="form-field__error" id={`${id}-error`}>
          {error}
        </p>
      ) : helperText ? (
        <p className="form-field__help" id={`${id}-help`}>
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
