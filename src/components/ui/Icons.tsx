import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const commonProps = {
  fill: 'none',
  viewBox: '0 0 24 24',
  xmlns: 'http://www.w3.org/2000/svg',
} as const

export function SearchIcon(props: IconProps) {
  return (
    <svg {...commonProps} {...props}>
      <path
        d="m20 20-4.4-4.4m2.4-5.1a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...commonProps} {...props}>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...commonProps} {...props}>
      <path
        d="M2.7 12s3.3-5.5 9.3-5.5 9.3 5.5 9.3 5.5-3.3 5.5-9.3 5.5S2.7 12 2.7 12Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...commonProps} {...props}>
      <path
        d="m14.5 6-6 6 6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function RefreshIcon(props: IconProps) {
  return (
    <svg {...commonProps} {...props}>
      <path
        d="M19 7.5V4m0 0h-3.5M19 4l-2.2 2.2A7 7 0 1 0 19 14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function FolderIcon(props: IconProps) {
  return (
    <svg {...commonProps} {...props}>
      <path
        d="M3.5 7.5h6l1.8 2H20.5v8.8a1.7 1.7 0 0 1-1.7 1.7H5.2a1.7 1.7 0 0 1-1.7-1.7V7.5Zm0 0V5.7A1.7 1.7 0 0 1 5.2 4h4.1l2 2.2"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  )
}

export function AlertIcon(props: IconProps) {
  return (
    <svg {...commonProps} {...props}>
      <path
        d="M12 8v4.5m0 3h.01M10.6 4.8 3.2 18a1.4 1.4 0 0 0 1.2 2h15.2a1.4 1.4 0 0 0 1.2-2L13.4 4.8a1.6 1.6 0 0 0-2.8 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  )
}

export function SortIcon(props: IconProps) {
  return (
    <svg {...commonProps} {...props}>
      <path
        d="m8 7 3-3 3 3m0 10-3 3-3-3M11 4v16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  )
}
