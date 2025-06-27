import { z } from 'zod'

// Post creation and update schema
export const postSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  
  description: z.string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters')
    .trim(),
  
  categoryId: z.string()
    .min(1, 'Category is required'),
  
  details: z.record(z.any()).optional(),
  
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
})

export const updatePostSchema = postSchema.extend({
  postId: z.string().min(1, 'Post ID is required'),
})

// Search schema
export const searchSchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(100, 'Search query must be less than 100 characters')
    .trim(),
  
  categoryId: z.string().optional(),
})

// Image upload schema
export const imageUploadSchema = z.object({
  image: z.instanceof(File)
    .refine((file) => file.size > 0, 'No file selected')
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
      'Only JPEG, PNG, GIF, and WebP images are allowed'
    ),
})

// Category-specific validation schemas
export const carpoolDetailsSchema = z.object({
  departure_time: z.string().min(1, 'Departure time is required'),
  departure_location: z.string().min(1, 'Departure location is required'),
  destination: z.string().min(1, 'Destination is required'),
  available_seats: z.number()
    .min(1, 'At least 1 seat must be available')
    .max(8, 'Maximum 8 seats allowed'),
  contact_method: z.enum(['phone', 'email', 'message'], {
    required_error: 'Contact method is required',
  }),
})

export const foodSellingDetailsSchema = z.object({
  food_type: z.string().min(1, 'Food type is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  expiry_date: z.string().min(1, 'Expiry date is required'),
  pickup_location: z.string().min(1, 'Pickup location is required'),
  pricing: z.object({
    type: z.enum(['fixed', 'range']),
    value: z.number().positive('Price must be positive').optional(),
    min: z.number().positive('Minimum price must be positive').optional(),
    max: z.number().positive('Maximum price must be positive').optional(),
    negotiable: z.boolean(),
    unit: z.string(),
  }).refine((data) => {
    if (data.type === 'fixed' && !data.negotiable) {
      return data.value !== undefined && data.value > 0
    }
    if (data.type === 'range') {
      return data.min !== undefined && data.max !== undefined && data.min < data.max
    }
    return true
  }, 'Invalid pricing configuration'),
})

export const servicesDetailsSchema = z.object({
  service_type: z.string().min(1, 'Service type is required'),
  availability: z.string().min(1, 'Availability is required'),
  location: z.string().min(1, 'Location is required'),
  experience: z.string().min(1, 'Experience is required'),
  pricing: z.object({
    type: z.enum(['fixed', 'range']),
    value: z.number().positive('Price must be positive').optional(),
    min: z.number().positive('Minimum price must be positive').optional(),
    max: z.number().positive('Maximum price must be positive').optional(),
    negotiable: z.boolean(),
    unit: z.enum(['service', 'hour', 'day']),
  }).optional(),
})

export const lostFoundDetailsSchema = z.object({
  item_type: z.enum(['lost', 'found'], {
    required_error: 'Item type is required',
  }),
  item_description: z.string().min(1, 'Item description is required'),
  location: z.string().min(1, 'Location is required'),
  date_time: z.string().min(1, 'Date and time is required'),
  contact_info: z.string().min(1, 'Contact information is required'),
})

export const eventsDetailsSchema = z.object({
  event_date: z.string().min(1, 'Event date is required'),
  event_time: z.string().min(1, 'Event time is required'),
  location: z.string().min(1, 'Location is required'),
  capacity: z.number()
    .min(1, 'Capacity must be at least 1')
    .max(1000, 'Capacity cannot exceed 1000'),
  registration_required: z.boolean(),
  contact_info: z.string().min(1, 'Contact information is required'),
})

// Function to get category-specific schema
export function getCategorySchema(categoryName: string) {
  switch (categoryName) {
    case 'Carpool':
      return carpoolDetailsSchema
    case 'Food Selling':
      return foodSellingDetailsSchema
    case 'Services':
      return servicesDetailsSchema
    case 'Lost & Found':
      return lostFoundDetailsSchema
    case 'Events':
      return eventsDetailsSchema
    default:
      return z.object({}) // Empty schema for other categories
  }
}

// Validation function for form data
export function validatePostData(data: unknown, categoryName: string) {
  try {
    // First validate basic post structure
    const basicData = postSchema.parse(data)
    
    // Then validate category-specific details if they exist
    if (basicData.details) {
      const categorySchema = getCategorySchema(categoryName)
      if (categorySchema) {
        categorySchema.parse(basicData.details)
      }
    }
    
    return { success: true, data: basicData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return {
      success: false,
      errors: ['Validation failed']
    }
  }
}

// Type exports
export type PostFormData = z.infer<typeof postSchema>
export type UpdatePostFormData = z.infer<typeof updatePostSchema>
export type SearchFormData = z.infer<typeof searchSchema>
export type ImageUploadData = z.infer<typeof imageUploadSchema>
export type CarpoolDetails = z.infer<typeof carpoolDetailsSchema>
export type FoodSellingDetails = z.infer<typeof foodSellingDetailsSchema>
export type ServicesDetails = z.infer<typeof servicesDetailsSchema>
export type LostFoundDetails = z.infer<typeof lostFoundDetailsSchema>
export type EventsDetails = z.infer<typeof eventsDetailsSchema>