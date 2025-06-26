'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { PostWithCategory, Category } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface LatestPostsGridProps {
  categories: (Category & { postCount: number })[]
}

const categoryIcons: Record<string, string> = {
  'Carpool': '🚗',
  'Food Selling': '🍕',
  'Services': '🔧',
  'Lost & Found': '🔍',
  'Events': '🎉',
  'Others': '📋',
}

// Utility function to check if a string is a valid UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default function LatestPostsGrid({ categories }: LatestPostsGridProps) {
  const [latestPosts, setLatestPosts] = useState<PostWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const { user, session, loading: authLoading } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const fetchLatestPosts = async () => {
      // Prevent multiple simultaneous requests
      if (isFetching) return
      
      setIsFetching(true)
      try {
        // Ensure Supabase client has the session
        if (session) {
          await supabase.auth.setSession(session)
        }
        
        // Filter categories to only include those with valid UUID IDs (from database)
        const validCategories = categories.filter(cat => isValidUUID(cat.id))
        
        // Fetch one latest post from each valid category
        const postsPromises = validCategories.map(async (category) => {
          try {
            const { data: posts, error } = await supabase
              .from('posts')
              .select(`
                *,
                categories (
                  id,
                  name
                )
              `)
              .eq('category_id', category.id)
              .eq('status', 'active')
              .order('created_at', { ascending: false })
              .limit(1)
            
            if (error) {
              console.error(`Error fetching posts for category ${category.id}:`, error)
              return null
            }
            
            return posts?.[0] || null
          } catch (error) {
            console.error(`Error fetching posts for category ${category.id}:`, error)
            return null
          }
        })

        const results = await Promise.all(postsPromises)
        const validPosts = results.filter(post => post !== null) as PostWithCategory[]
        
        setLatestPosts(validPosts)
      } catch (error) {
        console.error('Error fetching latest posts:', error)
        setLatestPosts([])
      } finally {
        setLoading(false)
        setIsFetching(false)
      }
    }

    // Only fetch posts when user is authenticated, has session, and auth is not loading
    // Also check if categories have valid UUID IDs (not fallback categories)
    const hasValidCategories = categories && categories.length > 0 && categories.some(cat => isValidUUID(cat.id))
    
    if (user && session && !authLoading && hasValidCategories) {
      fetchLatestPosts()
    } else if (!authLoading) {
      // If not loading and no user/session, or using fallback categories, stop the loading state
      setLoading(false)
      setIsFetching(false)
    }
  }, [categories, user, session, authLoading])

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const postDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return '1 day ago'
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">Loading latest posts...</span>
      </div>
    )
  }

  if (latestPosts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-3">📝</div>
        <p className="text-gray-600 mb-2">No posts yet in your community</p>
        <p className="text-sm text-gray-500">Be the first to create a post!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {latestPosts.map((post) => (
        <Link 
          key={post.id} 
          href={`/category/${post.category_id}`}
          className="group block"
        >
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
            {/* Category Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {categoryIcons[post.categories?.name || ''] || '📋'}
                </span>
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {post.categories?.name}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatTimeAgo(post.created_at)}
              </span>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-3">
                {post.description}
              </p>
            </div>

            {/* Post Image */}
            {post.image_url && (
              <div className="mb-4">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Post Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                {post.user_avatar_url && (
                  <img
                    src={post.user_avatar_url}
                    alt={post.user_name || 'User'}
                    className="w-6 h-6 rounded-full border border-gray-200"
                  />
                )}
                <span className="text-sm text-gray-600">
                  {post.user_name || 'Community Member'}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-blue-600 group-hover:text-blue-700">
                <span className="text-sm font-medium">View</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}