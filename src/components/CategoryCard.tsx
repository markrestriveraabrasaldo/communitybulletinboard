'use client'

import Link from 'next/link'
import { Category } from '@/types/database'

interface CategoryCardProps {
  category: Category
  postCount?: number
}

const categoryIcons: Record<string, string> = {
  'Carpool': '🚗',
  'Food Selling': '🍕',
  'Services': '🔧',
  'Lost & Found': '🔍',
  'Events': '🎉',
  'Others': '📋',
}

export default function CategoryCard({ category, postCount = 0 }: CategoryCardProps) {
  return (
    <Link 
      href={`/category/${category.id}`}
      className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
      data-testid="category-card"
    >
      <div className="flex items-center space-x-4">
        <div className="text-4xl">
          {categoryIcons[category.name] || '📋'}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
          <p className="text-xs text-blue-600 mt-2 font-medium">
            {postCount} {postCount === 1 ? 'post' : 'posts'}
          </p>
        </div>
      </div>
    </Link>
  )
}