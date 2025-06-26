'use client'

import { useState } from 'react'
import { PostWithCategory, Category } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase-client'
import { getCategoryFields } from '@/config/categoryFields'
import ImageSlider from './ImageSlider'
import EditPostModal from './EditPostModal'
import { InlinePriceDisplay } from './PriceDisplay'
import { PriceData } from '@/types/pricing'

interface PostCardProps {
  post: PostWithCategory
  onPostUpdated?: () => void
  categories: Category[]
}

export default function PostCard({ post, onPostUpdated, categories }: PostCardProps) {
  const { user } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const supabase = createClient()

  const isOwner = user && user.id === post.user_id
  const isAdmin = user && user.user_metadata?.role === 'admin'

  const formatDate = (dateString: string) => {
    const now = new Date()
    const postDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60))
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInHours < 168) { // 7 days
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    } else {
      return postDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const getPostImages = () => {
    const images: string[] = []
    
    // Add legacy image_url if exists
    if (post.image_url) {
      images.push(post.image_url)
    }
    
    // Add images from details
    if (post.details && post.details.image) {
      if (Array.isArray(post.details.image)) {
        images.push(...post.details.image)
      } else if (typeof post.details.image === 'string') {
        images.push(post.details.image)
      }
    }
    
    // Remove duplicates
    return [...new Set(images)]
  }

  const getResolutionButtonText = (categoryName: string) => {
    switch (categoryName) {
      case 'Carpool':
        return 'Mark as Fully Booked'
      case 'Food Selling':
        return 'Mark as Sold'
      case 'Services':
        return 'Mark as Completed'
      case 'Lost & Found':
        return 'Mark as Found'
      case 'Events':
        return 'Mark as Finished'
      default:
        return 'Mark as Resolved'
    }
  }

  const getResolutionStatus = (categoryName: string) => {
    switch (categoryName) {
      case 'Food Selling':
        return 'sold'
      default:
        return 'resolved'
    }
  }

  // Helper function to get pricing data (new or legacy)
  const getPricingData = (): PriceData | null => {
    if (!post.details || !post.categories) return null
    
    const categoryName = post.categories.name
    const details = post.details as Record<string, unknown>
    
    // Check if already has new pricing structure
    if (details.pricing) {
      return details.pricing as PriceData
    }
    
    // Convert legacy pricing based on category
    if (categoryName === 'Food Selling' && details.price && (typeof details.price === 'string' || typeof details.price === 'number')) {
      return {
        type: 'fixed',
        value: parseFloat(String(details.price)),
        negotiable: false,
        unit: 'item'
      }
    }
    
    if (categoryName === 'Services' && details.price_range) {
      const priceRange = details.price_range
      switch (priceRange) {
        case 'under_50':
          return { type: 'range', min: 0, max: 50, negotiable: false, unit: 'service' }
        case '50_100':
          return { type: 'range', min: 50, max: 100, negotiable: false, unit: 'service' }
        case '100_200':
          return { type: 'range', min: 100, max: 200, negotiable: false, unit: 'service' }
        case 'over_200':
          return { type: 'range', min: 200, max: undefined, negotiable: false, unit: 'service' }
        case 'negotiable':
          return { type: 'fixed', value: undefined, negotiable: true, unit: 'service' }
        default:
          return null
      }
    }
    
    return null
  }

  const renderCategoryDetails = () => {
    if (!post.details || !post.categories) return null
    
    const categoryName = post.categories.name
    const fields = getCategoryFields(categoryName)
    const details = post.details as Record<string, unknown>
    const pricingData = getPricingData()
    
    return (
      <div className="mt-3 space-y-2">
        {/* Render pricing first if available */}
        {pricingData && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-2">Price:</span>
            <InlinePriceDisplay 
              priceData={pricingData} 
              showBadges={true}
            />
          </div>
        )}
        
        {/* Render other category fields */}
        {fields.map(field => {
          const value = details[field.id]
          
          // Skip fields that shouldn't be displayed
          if (!value || 
              field.id === 'title' || 
              field.id === 'description' || 
              field.id === 'image' ||
              field.id === 'price' ||        // Skip legacy price field
              field.id === 'price_range') {  // Skip legacy price_range field
            return null
          }
          
          return (
            <div key={field.id} className="flex items-center text-sm text-gray-600">
              <span className="font-medium mr-2">{field.label}:</span>
              <span>
                {field.type === 'datetime-local' && value && (typeof value === 'string' || typeof value === 'number') ? 
                  new Date(value).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 
                  field.type === 'select' && field.options ?
                    field.options.find(opt => opt.value === value)?.label || String(value) :
                    field.type === 'textarea' && typeof value === 'string' ?
                      value.split('\n').map((line: string, i: number) => (
                        <span key={i}>{line}{i < value.split('\n').length - 1 && <br />}</span>
                      )) :
                      String(value)
                }
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  const handleStatusChange = async (newStatus: 'resolved' | 'sold' | 'inactive' | 'active') => {
    if (!isOwner) return
    
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('posts')
        .update({ status: newStatus })
        .eq('id', post.id)

      if (error) throw error
      
      if (onPostUpdated) {
        onPostUpdated()
      }
    } catch (error) {
      console.error('Error updating post status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleToggleActive = async () => {
    if (!isOwner) return
    
    const newStatus = post.status === 'active' ? 'inactive' : 'active'
    await handleStatusChange(newStatus)
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    resolved: 'bg-blue-100 text-blue-800',
    sold: 'bg-gray-100 text-gray-800',
    inactive: 'bg-red-100 text-red-800'
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${post.status !== 'active' ? 'opacity-75' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="flex items-center space-x-3">
          {post.user_avatar_url ? (
            <img
              src={post.user_avatar_url}
              alt={post.user_name || 'User'}
              className="w-12 h-12 rounded-full ring-2 ring-gray-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 font-medium text-lg">
                {(post.user_name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{post.user_name}</p>
            <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[post.status]}`}>
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
        <p className="text-gray-700 mb-3 leading-relaxed whitespace-pre-wrap">{post.description}</p>
        
        {/* Category-specific details */}
        {renderCategoryDetails()}
      </div>

      {/* Images */}
      {getPostImages().length > 0 && (
        <div className="px-6 pb-4">
          <ImageSlider
            images={getPostImages()}
            alt={post.title}
          />
        </div>
      )}

      {/* Actions */}
      {(isOwner || isAdmin) && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <div className="flex flex-wrap gap-2">
            {isOwner && (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
                >
                  Edit Post
                </button>
                {post.status === 'active' && (
                  <button
                    onClick={() => handleStatusChange(getResolutionStatus(post.categories?.name || ''))}
                    disabled={isUpdating}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    {getResolutionButtonText(post.categories?.name || '')}
                  </button>
                )}
                <button
                  onClick={handleToggleActive}
                  disabled={isUpdating}
                  className={`px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ml-auto ${
                    post.status === 'active' 
                      ? 'text-red-700 bg-red-100 hover:bg-red-200' 
                      : 'text-green-700 bg-green-100 hover:bg-green-200'
                  }`}
                >
                  {post.status === 'active' ? 'Set Inactive' : 'Set Active'}
                </button>
              </>
            )}
            {isAdmin && !isOwner && (
              <button
                onClick={handleToggleActive}
                disabled={isUpdating}
                className={`px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ml-auto ${
                  post.status === 'active' 
                    ? 'text-red-700 bg-red-100 hover:bg-red-200' 
                    : 'text-green-700 bg-green-100 hover:bg-green-200'
                }`}
              >
                Admin {post.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {isEditModalOpen && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          categories={categories}
          post={post}
          onPostUpdated={() => {
            if (onPostUpdated) {
              onPostUpdated()
            }
          }}
        />
      )}
    </div>
  )
}