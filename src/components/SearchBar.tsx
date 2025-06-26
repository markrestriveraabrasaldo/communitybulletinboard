'use client'

import { useState, useEffect } from 'react'
import { getSearchSuggestions, logSearch } from '@/lib/searchAnalytics'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  isLoading?: boolean
  className?: string
  categoryId?: string
  categoryName?: string
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search posts...", 
  isLoading = false,
  className = "",
  categoryId,
  categoryName
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [dynamicSuggestions, setDynamicSuggestions] = useState<{
    popular: string[]
    trending: string[]
    combined: string[]
  }>({
    popular: [],
    trending: [],
    combined: []
  })
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

  // Load dynamic suggestions when component mounts or category changes
  useEffect(() => {
    let mounted = true
    
    const loadSuggestions = async () => {
      setSuggestionsLoading(true)
      try {
        const suggestions = await getSearchSuggestions(categoryId, categoryName)
        if (mounted) {
          setDynamicSuggestions(suggestions)
        }
      } catch (error) {
        console.error('Failed to load suggestions:', error)
      } finally {
        if (mounted) {
          setSuggestionsLoading(false)
        }
      }
    }

    loadSuggestions()
    
    return () => {
      mounted = false
    }
  }, [categoryId, categoryName])

  // Debounce the search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query)
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [query, onSearch])

  const handleClear = () => {
    setQuery('')
    onSearch('')
    setShowSuggestions(false)
  }

  const handleFocus = () => {
    setShowSuggestions(true)
  }

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    onSearch(suggestion)
    setShowSuggestions(false)
    
    // Log high-quality intentional search when user clicks suggestion
    if (suggestion.length >= 3) {
      logSearch(suggestion, categoryId, categoryName, 0)
        .catch(err => console.warn('Failed to log suggestion click:', err))
    }
  }

  // Get display suggestions with trending indicators
  const getDisplaySuggestions = () => {
    const { trending, combined } = dynamicSuggestions
    return combined.map(suggestion => ({
      text: suggestion,
      isTrending: trending.includes(suggestion),
      isPopular: !trending.includes(suggestion)
    }))
  }

  const displaySuggestions = getDisplaySuggestions()

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white transition-colors"
        />

        {/* Loading Spinner or Clear Button */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isLoading ? (
            <svg 
              className="animate-spin h-5 w-5 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : query && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <svg 
                className="h-5 w-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Search Suggestions */}
      {showSuggestions && !query && !isLoading && displaySuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {categoryName ? `Trending in ${categoryName}` : 'Popular searches'}
              </p>
              {suggestionsLoading && (
                <div className="w-3 h-3 animate-spin rounded-full border border-gray-300 border-t-gray-600"></div>
              )}
            </div>
          </div>
          <div className="p-2">
            {displaySuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>{suggestion.text}</span>
                </div>
                {suggestion.isTrending && (
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      Hot
                    </span>
                  </div>
                )}
                {suggestion.isPopular && !suggestion.isTrending && (
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Popular
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
          {dynamicSuggestions.combined.length === 0 && !suggestionsLoading && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No popular searches yet. Be the first to search!
            </div>
          )}
        </div>
      )}
    </div>
  )
}