'use client'

import { useState } from 'react'
import PostFormModal from '@/components/PostFormModal'
import SearchWithServerActions from '@/components/SearchWithServerActions'
import PostCard from '@/components/PostCard'
import { Category, PostWithCategory } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

interface CategoryPageClientProps {
  initialPosts: PostWithCategory[]
  categories: Category[]
  category: Category
  categoryId: string
}

export default function CategoryPageClient({
  initialPosts,
  categories,
  category,
  categoryId
}: CategoryPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user } = useAuth()

  const handlePostCreated = () => {
    // Refresh the page to show the new post
    window.location.reload()
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Posts in {category.name}
        </h2>
        {user && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Create Post
          </button>
        )}
      </div>

      {/* Search with Server Actions */}
      <SearchWithServerActions
        categoryId={categoryId}
        categoryName={category.name}
        placeholder={`Search posts in ${category.name}...`}
        className="mb-6"
        showResults={true}
        categories={categories}
      />

      {/* Default posts display when no search is active */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">All Posts</h3>
        
        {initialPosts.length === 0 ? (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-600">No posts in this category yet.</p>
            {user && (
              <p className="text-sm text-gray-500 mt-2">
                Be the first to create a post!
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {initialPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                categories={categories}
                onPostUpdated={handlePostCreated}
              />
            ))}
          </div>
        )}
      </div>

      {/* Post Form Modal */}
      <PostFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        selectedCategoryId={categoryId}
        categoryName={category.name}
        onPostCreated={handlePostCreated}
      />
    </>
  )
}