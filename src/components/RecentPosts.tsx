'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { PostWithCategory, Category } from '@/types/database'

interface RecentPostsProps {
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

export default function RecentPosts({ categories }: RecentPostsProps) {
  const [postsByCategory, setPostsByCategory] = useState<Record<string, PostWithCategory[]>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const postsData: Record<string, PostWithCategory[]> = {}
        
        // Fetch 5 recent posts for each category
        await Promise.all(
          categories.map(async (category) => {
            const { data: posts } = await supabase
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
              .limit(5)
            
            postsData[category.id] = posts || []
          })
        )
        
        setPostsByCategory(postsData)
      } catch (error) {
        console.error('Error fetching recent posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentPosts()
  }, [categories, supabase])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">Loading recent posts...</span>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {categories.map((category) => {
        const posts = postsByCategory[category.id] || []
        
        if (posts.length === 0) return null

        return (
          <div key={category.id} className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{categoryIcons[category.name] || '📋'}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600 font-medium">
                    {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
                  </div>
                  <div className="text-xs text-gray-500">Sign in to view all</div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {posts.slice(0, 3).map((post) => (
                  <div key={post.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                        {post.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          by {post.user_name || 'Community Member'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(post.created_at)}
                        </span>
                      </div>
                    </div>
                    {post.image_url && (
                      <div className="flex-shrink-0">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {posts.length > 3 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    +{posts.length - 3} more posts in this category
                  </p>
                </div>
              )}
              
              {category.postCount > 0 && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Sign in to view all posts and create your own</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}