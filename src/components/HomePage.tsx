'use client'

import { useAuth } from '@/contexts/AuthContext'
import CategoryCard from './CategoryCard'
import LatestPostsGrid from './LatestPostsGrid'
import SearchWithServerActions from './SearchWithServerActions'
import { Category } from '@/types/database'

interface HomePageProps {
  categories: (Category & { postCount: number })[]
}

export default function HomePage({ categories }: HomePageProps) {
  const { user, loading } = useAuth()

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
          <SearchWithServerActions
            placeholder="Search across all posts and categories..."
            className="w-full"
            showResults={true}
            categories={categories}
          />
        </section>

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                postCount={category.postCount}
              />
            ))}
          </div>
        </section>
      </main>
    )
  }

  // Unauthenticated user - show welcome message + categories (read-only)
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Welcome to Community Bulletin Board
          </h2>
          <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
            Your neighborhood hub for carpools, food selling, services, events, and more. 
            Connect with your community and discover what&apos;s happening around you.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
            <p className="text-blue-100 text-sm">
              👋 Sign in with Facebook to start creating posts and connecting with your neighbors
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section for Unauthenticated Users */}
      <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <span className="text-gray-700">📂 Community Categories</span>
          </h2>
          <p className="text-gray-600">
            Explore the different categories available in our community board
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>
    </main>
  )
}