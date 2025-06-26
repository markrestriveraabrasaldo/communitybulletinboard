'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase-client'
import { Category, PostInsert, PostWithCategory, PostUpdate } from '@/types/database'
import { getCategoryFields, validateCategoryFields, FormField } from '@/config/categoryFields'
import { flattenFormDataToDetails, getInitialFormState } from '@/utils/formHelpers'
import { toast } from 'sonner'
import PriceInput from './PriceInput'
import { PriceData, DEFAULT_PRICE_DATA, validatePriceData } from '@/types/pricing'

interface PostFormProps {
  categories: Category[]
  onPostCreated?: () => void
  selectedCategoryId?: string
  isModal?: boolean
  editingPost?: PostWithCategory
}

export default function PostForm({ categories, onPostCreated, selectedCategoryId, isModal = false, editingPost }: PostFormProps) {
  const { user } = useAuth()
  const [categoryId, setCategoryId] = useState(selectedCategoryId || editingPost?.category_id || '')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [pricingData, setPricingData] = useState<PriceData>(DEFAULT_PRICE_DATA)
  const [imageFiles, setImageFiles] = useState<Record<string, File[]>>({})
  const [imagePreviews, setImagePreviews] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()
  const isEditing = !!editingPost

  // Get current category details and fields
  const currentCategory = categories.find(cat => cat.id === categoryId)
  const categoryName = currentCategory?.name || ''
  const fields = getCategoryFields(categoryName)

  // Helper function to convert legacy pricing to new PriceData structure
  const convertLegacyPricing = (post: PostWithCategory, categoryName: string): PriceData => {
    // Check if already has new pricing structure
    if (post.details?.pricing) {
      return post.details.pricing as PriceData
    }
    
    // Convert legacy pricing based on category
    if (categoryName === 'Food Selling' && post.details?.price && (typeof post.details.price === 'string' || typeof post.details.price === 'number')) {
      return {
        type: 'fixed',
        value: parseFloat(String(post.details.price)),
        negotiable: false,
        unit: 'item'
      }
    }
    
    if (categoryName === 'Services' && post.details?.price_range) {
      const priceRange = post.details.price_range
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
          return DEFAULT_PRICE_DATA
      }
    }
    
    return DEFAULT_PRICE_DATA
  }

  // Helper function to populate form data from existing post
  const getFormDataFromPost = (post: PostWithCategory, fields: FormField[]) => {
    const data: Record<string, any> = {}
    
    // Basic fields
    data.title = post.title || ''
    data.description = post.description || ''
    
    // Category-specific fields from details (excluding pricing fields)
    if (post.details) {
      fields.forEach(field => {
        // Skip legacy pricing fields as they'll be handled by PriceInput
        if (field.id === 'price' || field.id === 'price_range') return
        
        if (post.details && post.details[field.id] !== undefined) {
          data[field.id] = post.details[field.id]
        }
      })
    }
    
    return data
  }

  // Check if current category uses pricing
  const categoryUsesPricing = (categoryName: string) => {
    return ['Food Selling', 'Services'].includes(categoryName)
  }

  // Helper function to get existing images for previews
  const getExistingImagePreviews = (post: PostWithCategory) => {
    const previews: Record<string, string[]> = {}
    
    // Add legacy image_url if exists
    if (post.image_url) {
      previews.image = [post.image_url]
    }
    
    // Add images from details
    if (post.details && post.details.image) {
      if (Array.isArray(post.details.image)) {
        previews.image = [...(previews.image || []), ...post.details.image]
      } else if (typeof post.details.image === 'string') {
        previews.image = [...(previews.image || []), post.details.image]
      }
    }
    
    // Remove duplicates
    Object.keys(previews).forEach(key => {
      previews[key] = [...new Set(previews[key])]
    })
    
    return previews
  }

  // Initialize form data when category changes or when editing post
  useEffect(() => {
    if (categoryName) {
      if (isEditing && editingPost) {
        // Populate form with existing post data
        const postData = getFormDataFromPost(editingPost, fields)
        setFormData(postData)
        
        // Handle pricing data separately
        const pricing = convertLegacyPricing(editingPost, categoryName)
        setPricingData(pricing)
        
        setImageFiles({})
        const existingPreviews = getExistingImagePreviews(editingPost)
        setImagePreviews(existingPreviews)
      } else {
        // Initialize empty form
        const initialState = getInitialFormState(fields)
        setFormData(initialState)
        setPricingData(DEFAULT_PRICE_DATA)
        setImageFiles({})
        setImagePreviews({})
      }
    }
  }, [categoryName, fields, isEditing, editingPost])

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          Sign in to Create a Post
        </h3>
        <p className="text-blue-700">
          You need to sign in with Facebook to create posts and ensure community authenticity.
        </p>
      </div>
    )
  }

  const handleInputChange = (fieldId: string, value: string | number | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleImageChange = (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const newFiles = [...(imageFiles[fieldId] || []), ...files]
      setImageFiles(prev => ({ ...prev, [fieldId]: newFiles }))
      
      // Create previews for new files
      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews(prev => ({
            ...prev,
            [fieldId]: [...(prev[fieldId] || []), reader.result as string]
          }))
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (fieldId: string, index: number) => {
    setImageFiles(prev => ({
      ...prev,
      [fieldId]: prev[fieldId]?.filter((_, i) => i !== index) || []
    }))
    setImagePreviews(prev => ({
      ...prev,
      [fieldId]: prev[fieldId]?.filter((_, i) => i !== index) || []
    }))
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return null
    }

    const { data } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!categoryId) {
      toast.error('Please select a category')
      return
    }

    // Validate form fields
    const validationErrors = validateCategoryFields(categoryName, formData)
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0])
      return
    }

    // Validate pricing data if category uses pricing
    if (categoryUsesPricing(categoryName)) {
      const pricingValidation = validatePriceData(pricingData)
      if (!pricingValidation.isValid) {
        toast.error(pricingValidation.errors[0])
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Upload any new images
      const uploadedUrls: Record<string, string[]> = {}
      for (const [fieldId, files] of Object.entries(imageFiles)) {
        if (files && files.length > 0) {
          const urls: string[] = []
          for (const file of files) {
            const imageUrl = await uploadImage(file)
            if (!imageUrl) {
              throw new Error(`Failed to upload ${fieldId} image`)
            }
            urls.push(imageUrl)
          }
          uploadedUrls[fieldId] = urls
        }
      }

      // Merge existing images with new uploaded URLs
      const finalFormData = { ...formData }
      for (const [fieldId, newUrls] of Object.entries(uploadedUrls)) {
        const existingUrls = imagePreviews[fieldId] || []
        const existingImages = existingUrls.filter(url => url.startsWith('http'))
        finalFormData[fieldId] = [...existingImages, ...newUrls]
      }

      // Create details object from form data
      const details = flattenFormDataToDetails(fields, finalFormData)
      
      // Add pricing data if category uses pricing
      if (categoryUsesPricing(categoryName)) {
        details.pricing = pricingData
      }

      // For backward compatibility, extract title and description
      const title = finalFormData.title || ''
      const description = finalFormData.description || ''
      const legacyImageUrl = Array.isArray(finalFormData.image) ? finalFormData.image[0] : finalFormData.image || null

      if (isEditing && editingPost) {
        // Update existing post
        const updateData: PostUpdate = {
          title,
          description,
          details,
          category_id: categoryId,
          image_url: legacyImageUrl
        }

        const { error: updateError } = await supabase
          .from('posts')
          .update(updateData)
          .eq('id', editingPost.id)

        if (updateError) {
          throw updateError
        }

        toast.success('Post updated successfully!')
      } else {
        // Create new post
        const postData: PostInsert = {
          title,
          description,
          details,
          category_id: categoryId,
          user_id: user.id,
          user_name: user.user_metadata?.full_name || user.email || 'Anonymous',
          user_avatar_url: user.user_metadata?.avatar_url,
          image_url: legacyImageUrl,
          status: 'active'
        }

        const { error: insertError } = await supabase
          .from('posts')
          .insert([postData])

        if (insertError) {
          throw insertError
        }

        // Reset form only for new posts
        const initialState = getInitialFormState(fields)
        setFormData(initialState)
        setPricingData(DEFAULT_PRICE_DATA)
        setCategoryId(selectedCategoryId || '')
        setImageFiles({})
        setImagePreviews({})
        
        toast.success(`Post created successfully in ${categoryName}!`)
      }
      
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} post:`, err)
      toast.error(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} post`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id] || ''
    
    // Skip legacy pricing fields - they're handled by PriceInput component
    if (field.id === 'price' || field.id === 'price_range') {
      return null
    }
    
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white transition-colors"
          />
        )
      
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            rows={field.rows || 4}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white transition-colors"
          />
        )
      
      case 'number':
        return (
          <input
            type="number"
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            min={field.min}
            max={field.max}
            step="0.01"
            placeholder={field.placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white transition-colors"
          />
        )
      
      case 'datetime-local':
        return (
          <input
            type="datetime-local"
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white transition-colors"
          />
        )
      
      case 'select':
        return (
          <select
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="custom-select w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white transition-colors appearance-none"
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      case 'file':
        return (
          <div className="space-y-4">
            {/* File Upload Button */}
            <div className="relative">
              <input
                type="file"
                id={field.id}
                accept={field.accept}
                multiple
                onChange={(e) => handleImageChange(field.id, e)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB (Multiple files supported)</p>
                </div>
              </div>
            </div>
            
            {/* Image Previews Grid */}
            {imagePreviews[field.id] && imagePreviews[field.id].length > 0 && (
              <div className="photo-grid">
                {imagePreviews[field.id].map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-contain rounded-lg border border-gray-200 shadow-sm bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(field.id, index)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-xl transition-all duration-200 border-2 border-white ring-1 ring-gray-300"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.225 4.811a1 1 0 00-1.414 1.414L10.586 12 4.81 17.775a1 1 0 101.414 1.414L12 13.414l5.775 5.775a1 1 0 001.414-1.414L13.414 12l5.775-5.775a1 1 0 00-1.414-1.414L12 10.586 6.225 4.81z" />
                      </svg>
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className={isModal ? '' : 'bg-white rounded-lg shadow-md p-6'}>
      {!isModal && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isEditing ? 'Edit Post' : 'Create New Post'}
        </h3>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-800 mb-2">
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            disabled={(isModal && !!selectedCategoryId) || isEditing}
            className="custom-select w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white transition-colors disabled:bg-gray-50 disabled:text-gray-800 disabled:cursor-not-allowed appearance-none"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic fields based on selected category */}
        {categoryId && fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-semibold text-gray-800 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}

        {/* Pricing section for categories that support pricing */}
        {categoryId && categoryUsesPricing(categoryName) && (
          <div>
            <PriceInput
              value={pricingData}
              onChange={setPricingData}
              required={categoryName === 'Food Selling'} // Food selling requires price
              showUnits={true}
              availableUnits={categoryName === 'Services' ? ['service', 'hour', 'day'] : ['item']}
              className="mt-2"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isEditing ? 'Updating Post...' : 'Creating Post...'}
            </div>
          ) : (isEditing ? 'Update Post' : 'Create Post')}
        </button>
      </form>
    </div>
  )
}