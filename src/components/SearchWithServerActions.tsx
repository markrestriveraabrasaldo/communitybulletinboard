'use client'

import { useState, useEffect, startTransition, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { searchPosts, searchPostsInCategory } from '@/lib/actions/search'
import { PostWithCategory, Category } from '@/types/database'
import PostCard from './PostCard'
import ErrorDisplay from './ErrorDisplay'
import LoadingSpinner from './LoadingSpinner'

interface SearchResult {
  posts: PostWithCategory[]
  error?: string
}

async function handleSearchAction(_prevState: SearchResult, formData: FormData): Promise<SearchResult> {
  const query = formData.get('query') as string
  const categoryId = formData.get('categoryId') as string

  if (!query?.trim()) {
    return { posts: [] }
  }

  if (categoryId) {
    return await searchPostsInCategory(query, categoryId)
  } else {
    return await searchPosts(query)
  }
}

function SearchButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="absolute inset-y-0 right-0 pr-3 flex items-center"
      aria-label={pending ? "Searching..." : "Search"}
    >
      {pending ? (
        <LoadingSpinner size="sm" />
      ) : (
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
      )}
    </button>
  )
}

interface SearchWithServerActionsProps {
  categoryId?: string
  categoryName?: string
  placeholder?: string
  className?: string
  showResults?: boolean
  categories?: Category[]
}

export default function SearchWithServerActions({
  categoryId,
  categoryName,
  placeholder = "Search posts...",
  className = "",
  showResults = true,
  categories = []
}: SearchWithServerActionsProps) {
  const [state, formAction] = useActionState(handleSearchAction, { posts: [] } as SearchResult)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      const formData = new FormData()
      formData.append('query', debouncedQuery)
      if (categoryId) {
        formData.append('categoryId', categoryId)
      }
      
      startTransition(() => {
        formAction(formData)
      })
    }
  }, [debouncedQuery, categoryId, formAction])

  const handleClear = () => {
    setQuery('')
    setDebouncedQuery('')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Form */}
      <form action={formAction} className="relative">
        <input type="hidden" name="categoryId" value={categoryId || ''} />
        
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
            name="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white transition-colors"
          />

          {/* Clear Button or Search Button */}
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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
          ) : (
            <SearchButton />
          )}
        </div>
      </form>

      {/* Search Results */}
      {showResults && (
        <div>
          {state.error && (
            <ErrorDisplay
              error={state.error}
              title="Search Error"
              onRetry={() => {
                if (debouncedQuery) {
                  const formData = new FormData()
                  formData.append('query', debouncedQuery)
                  if (categoryId) {
                    formData.append('categoryId', categoryId)
                  }
                  startTransition(() => {
                    formAction(formData)
                  })
                }
              }}
              showRetry={true}
              className="mb-4"
            />
          )}

          {query && debouncedQuery && state.posts.length === 0 && !state.error && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-600 text-sm">
                  No posts found for &ldquo;<strong>{debouncedQuery}</strong>&rdquo;
                  {categoryName && (
                    <span> in <strong>{categoryName}</strong></span>
                  )}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Try searching with different keywords
                </p>
              </div>
            </div>
          )}

          {state.posts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Search Results
                  {categoryName && ` in ${categoryName}`}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {state.posts.length} result{state.posts.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {state.posts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    categories={categories}
                    onPostUpdated={() => {
                      // Optionally refresh search results
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}