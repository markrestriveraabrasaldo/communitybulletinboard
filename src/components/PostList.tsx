'use client'

import { useState, useEffect, useCallback } from 'react'
import { PostWithCategory, Category } from '@/types/database'
import PostCard from './PostCard'
import SearchBar from './SearchBar'
import { doesPostMatchSearch } from '@/utils/searchUtils'

interface PostListProps {
  posts: PostWithCategory[]
  categories: Category[]
  onSearch?: (query: string) => void
  searchQuery?: string
  isSearching?: boolean
  showSearch?: boolean
  categoryId?: string
  categoryName?: string
}

export default function PostList({ 
  posts: initialPosts, 
  categories, 
  onSearch, 
  searchQuery = '', 
  isSearching = false,
  showSearch = true,
  categoryId,
  categoryName
}: PostListProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved' | 'sold' | 'inactive'>('all')
  const [localSearchQuery, setLocalSearchQuery] = useState('')

  // Update posts when initialPosts changes
  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  // Handle search functionality
  const handleSearch = useCallback((query: string) => {
    setLocalSearchQuery(query)
    if (onSearch) {
      onSearch(query)
    }
  }, [onSearch])

  const handlePostUpdated = (updatedPostId?: string) => {
    // Remove deleted posts or trigger a refresh
    if (updatedPostId) {
      setPosts(prevPosts => prevPosts.filter(post => post.id !== updatedPostId))
    } else {
      // For status updates, we could implement optimistic updates here
      // For now, we'll rely on the parent component to refresh
      window.location.reload()
    }
  }

  // Apply filtering (status + search)
  const filteredPosts = posts.filter(post => {
    // Apply status filter
    if (filter !== 'all' && post.status !== filter) return false
    
    // Apply search filter (use external search query if provided, otherwise local)
    const currentSearchQuery = searchQuery || localSearchQuery
    if (currentSearchQuery && !onSearch) {
      // Client-side search when no external search handler
      return doesPostMatchSearch(post, currentSearchQuery)
    }
    
    return true
  })

  const postCounts = {
    all: posts.length,
    active: posts.filter(p => p.status === 'active').length,
    resolved: posts.filter(p => p.status === 'resolved').length,
    sold: posts.filter(p => p.status === 'sold').length,
    inactive: posts.filter(p => p.status === 'inactive').length,
  }

  // Determine if we're showing search results
  const currentSearchQuery = searchQuery || localSearchQuery
  const isShowingSearchResults = !!currentSearchQuery

  return (
    <div>
      {/* Search Bar - only show if there are posts to search or if already searching */}
      {showSearch && (posts.length > 0 || currentSearchQuery) && (
        <div className="mb-6">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search posts by title, description, or details..."
            isLoading={isSearching}
            className="w-full"
            categoryId={categoryId}
            categoryName={categoryName}
          />
        </div>
      )}

      {/* Header with post count and filters */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {isShowingSearchResults ? (
              <>Search Results ({filteredPosts.length})</>
            ) : (
              <>Posts ({filteredPosts.length})</>
            )}
          </h2>
          {isShowingSearchResults && (
            <p className="text-sm text-gray-600 mt-1">
              Showing results for &quot;{currentSearchQuery}&quot;
            </p>
          )}
        </div>
        
        <div className="flex space-x-1">
          {(['all', 'active', 'resolved', 'sold', 'inactive'] as const).filter(status => 
            status === 'all' || postCounts[status] > 0
          ).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({postCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isSearching && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching posts...</p>
        </div>
      )}

      {/* Empty state */}
      {!isSearching && filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">
            {isShowingSearchResults ? '🔍' : '📋'}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isShowingSearchResults ? 'No search results' : 'No posts yet'}
          </h3>
          <p className="text-gray-600">
            {isShowingSearchResults ? (
              <>
                No posts found matching &quot;{currentSearchQuery}&quot;.
                <br />
                <button
                  onClick={() => handleSearch('')}
                  className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
                >
                  Clear search to see all posts
                </button>
              </>
            ) : filter === 'all' ? (
              'Be the first to create a post in this category!'
            ) : (
              `No ${filter} posts found.`
            )}
          </p>
        </div>
      )}

      {/* Posts List */}
      {!isSearching && filteredPosts.length > 0 && (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              categories={categories}
              onPostUpdated={handlePostUpdated}
            />
          ))}
        </div>
      )}
    </div>
  )
}