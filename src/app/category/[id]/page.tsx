'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PostFormModal from '@/components/PostFormModal'
import PostList from '@/components/PostList'
import { Category, PostWithCategory } from '@/types/database'
import { searchPostsInCategory } from '@/lib/searchQueries'
import { useAuth } from '@/contexts/AuthContext'

interface CategoryPageProps {
  params: Promise<{
    id: string
  }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [category, setCategory] = useState<Category | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<PostWithCategory[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [categoryId, setCategoryId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const { user, session, loading: authLoading } = useAuth()

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await params
        setCategoryId(id)

        // Fetch category
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single()

        let category = categoryData

        // Use fallback data if database fetch fails
        if (categoryError || !categoryData) {
          const fallbackCategories = [
            { id: 'carpool', name: 'Carpool', description: 'Share rides and transportation', created_at: new Date().toISOString() },
            { id: 'food-selling', name: 'Food Selling', description: 'Buy and sell food items', created_at: new Date().toISOString() },
            { id: 'services', name: 'Services', description: 'Carpentry, plumbing, and other services', created_at: new Date().toISOString() },
            { id: 'lost-found', name: 'Lost & Found', description: 'Lost and found items', created_at: new Date().toISOString() },
            { id: 'events', name: 'Events', description: 'Community events and gatherings', created_at: new Date().toISOString() },
            { id: 'others', name: 'Others', description: 'Everything else', created_at: new Date().toISOString() }
          ]
          
          category = fallbackCategories.find(cat => cat.id === id)
          
          if (!category) {
            notFound()
            return
          }
        }

        setCategory(category)

        // Fetch all categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        if (categoriesError || !categoriesData || categoriesData.length === 0) {
          // Use fallback categories if database fails
          const fallbackCategories = [
            { id: 'carpool', name: 'Carpool', description: 'Share rides and transportation', created_at: new Date().toISOString() },
            { id: 'food-selling', name: 'Food Selling', description: 'Buy and sell food items', created_at: new Date().toISOString() },
            { id: 'services', name: 'Services', description: 'Carpentry, plumbing, and other services', created_at: new Date().toISOString() },
            { id: 'lost-found', name: 'Lost & Found', description: 'Lost and found items', created_at: new Date().toISOString() },
            { id: 'events', name: 'Events', description: 'Community events and gatherings', created_at: new Date().toISOString() },
            { id: 'others', name: 'Others', description: 'Everything else', created_at: new Date().toISOString() }
          ]
          setCategories(fallbackCategories)
        } else {
          setCategories(categoriesData)
        }

        // Fetch posts only if user is authenticated and has session
        if (user && session && !authLoading) {
          // Ensure Supabase client has the session for category data fetching too
          await supabase.auth.setSession(session)
          await fetchPosts(id)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params, user, session, authLoading])

  const fetchPosts = async (categoryId: string, query: string = '') => {
    // Only fetch if user is authenticated and has session
    if (!user || !session || authLoading || isFetching) {
      return
    }

    setIsFetching(true)
    try {
      // Ensure Supabase client has the session
      if (session) {
        await supabase.auth.setSession(session)
      }
      
      if (query) {
        // Use search query if provided
        setIsSearching(true)
        try {
          const searchResults = await searchPostsInCategory(
            query,
            categoryId,
            category?.name || ''
          )
          setPosts(searchResults)
        } catch (error) {
          console.error('Search error:', error)
          setPosts([])
        } finally {
          setIsSearching(false)
        }
      } else {
        // Regular fetch without search
        try {
          const { data: postsData, error } = await supabase
            .from('posts')
            .select(`
              *,
              categories (
                id,
                name
              )
            `)
            .eq('category_id', categoryId)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Error fetching posts:', error)
            setPosts([])
          } else {
            setPosts(postsData || [])
          }
        } catch (error) {
          console.error('Error fetching posts:', error)
          setPosts([])
        }
      }
    } finally {
      setIsFetching(false)
    }
  }

  // Handle search functionality
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    if (categoryId && user && session && !authLoading) {
      await fetchPosts(categoryId, query)
    }
  }, [categoryId, category?.name, user, session, authLoading])

  const handlePostCreated = () => {
    // Refresh posts when a new post is created
    if (categoryId && user && session && !authLoading) {
      fetchPosts(categoryId)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    notFound()
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Categories
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">
                {category.name}
              </h1>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Create Post
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PostList 
          posts={posts} 
          categories={categories}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          isSearching={isSearching}
          showSearch={true}
          categoryId={categoryId}
          categoryName={category?.name}
        />
      </main>

      {/* Post Form Modal */}
      <PostFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        selectedCategoryId={categoryId}
        categoryName={category.name}
        onPostCreated={handlePostCreated}
      />
    </div>
  )
}