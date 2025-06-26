'use client'

interface SearchHighlightProps {
  text: string
  searchTerm: string
  className?: string
}

export default function SearchHighlight({ text, searchTerm, className = '' }: SearchHighlightProps) {
  if (!searchTerm.trim()) {
    return <span className={className}>{text}</span>
  }

  // Escape special regex characters
  const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi')
  const parts = text.split(regex)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (regex.test(part)) {
          return (
            <mark
              key={index}
              className="bg-yellow-200 px-1 rounded text-gray-900 font-medium"
            >
              {part}
            </mark>
          )
        }
        return part
      })}
    </span>
  )
}