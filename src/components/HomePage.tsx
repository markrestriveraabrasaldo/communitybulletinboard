'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import CategoryCard from './CategoryCard'
import RecentPosts from './RecentPosts'
import LatestPostsGrid from './LatestPostsGrid'
import SearchBar from './SearchBar'
import PostList from './PostList'
import { Category, PostWithCategory } from '@/types/database'
import { searchAllPosts } from '@/lib/searchQueries'

interface HomePageProps {
  categories: (Category & { postCount: number })[]
}

export default function HomePage({ categories: initialCategories }: HomePageProps) {
  const { user, session, loading } = useAuth()
  const [categories, setCategories] = useState(initialCategories)
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PostWithCategory[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const supabase = createClient()
  

  // Utility function to check if a string is a valid UUID
  const isValidUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  // Fetch categories when user logs in
  useEffect(() => {
    // Check if we only have fallback categories (string IDs, not UUIDs)
    const hasOnlyFallbackCategories = !categories || categories.length === 0 || !categories.some(cat => isValidUUID(cat.id))
    
    if (user && session && hasOnlyFallbackCategories) {
      setCategoriesLoading(true)
      
      const fetchCategories = async () => {
        try {
          // Ensure Supabase client has the session
          await supabase.auth.setSession(session)
          
          const { data: categoriesData, error } = await supabase
            .from('categories')
            .select('*')
            .order('name')

          if (error) {
            console.error('Error fetching categories:', error)
            return
          }

          // Get post counts for each category
          const categoriesWithCounts = await Promise.all(
            (categoriesData || []).map(async (category) => {
              const { count } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', category.id)
                .eq('status', 'active')
              
              return {
                ...category,
                postCount: count || 0
              }
            })
          )

          setCategories(categoriesWithCounts)
        } catch (error) {
          console.error('Error fetching categories:', error)
        } finally {
          setCategoriesLoading(false)
        }
      }

      fetchCategories()
    }
  }, [user, session, categories])

  // Handle global search
  const handleGlobalSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const results = await searchAllPosts(query, 20)
      setSearchResults(results)
    } catch (error) {
      console.error('Global search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </main>
    )
  }

  if (user) {
    // Authenticated user - show global search + latest posts + categories
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Global Search Section */}
        <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
              <span className="text-gray-700">🔍 Search Community Posts</span>
            </h2>
            <p className="text-gray-600 text-sm">
              Find posts across all categories by title, description, or specific details
            </p>
          </div>
          <SearchBar
            onSearch={handleGlobalSearch}
            placeholder="Search across all posts and categories..."
            isLoading={isSearching}
            className="w-full"
          />
        </section>

        {/* Search Results or Default Content */}
        {searchQuery ? (
          <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <PostList
              posts={searchResults}
              categories={categories}
              searchQuery={searchQuery}
              isSearching={isSearching}
              showSearch={false}
            />
          </section>
        ) : (
          <>
            {/* Latest Posts Section */}
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">✨ Latest Posts</span>
                </h2>
                <p className="text-gray-600">
                  Stay up to date with the newest posts from your community
                </p>
              </div>
              <LatestPostsGrid categories={categories} />
            </section>

            {/* Browse Categories Section */}
            <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                  <span className="text-gray-700">📂 Browse Categories</span>
                </h2>
                <p className="text-gray-600">
                  Click on a category to view posts or create your own
                </p>
              </div>

              {categoriesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  <span className="ml-2 text-gray-600">Loading categories...</span>
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <CategoryCard 
                      key={category.id} 
                      category={category} 
                      postCount={category.postCount}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-3">📂</div>
                  <p className="text-gray-600 mb-2">No categories available</p>
                  <p className="text-sm text-gray-500">Categories will appear here once loaded</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    )
  }

  // Non-authenticated user - show recent posts as landing page
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Your Community
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          See what&apos;s happening in your neighborhood. Sign in to create your own posts.
        </p>
        
        {/* Search for non-authenticated users */}
        <div className="max-w-2xl mx-auto mb-6">
          <SearchBar
            onSearch={handleGlobalSearch}
            placeholder="Search community posts..."
            isLoading={isSearching}
            className="w-full"
          />
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-blue-800 text-sm">
            🔒 Sign in with Facebook to create posts, share rides, sell items, and connect with your neighbors!
          </p>
        </div>
      </div>

      {/* Search Results or Default Content */}
      {searchQuery ? (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <PostList
            posts={searchResults}
            categories={categories}
            searchQuery={searchQuery}
            isSearching={isSearching}
            showSearch={false}
          />
        </div>
      ) : (
        <RecentPosts categories={categories} />
      )}
    </main>
  )
}