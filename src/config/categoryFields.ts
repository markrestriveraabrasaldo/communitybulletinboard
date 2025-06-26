export interface FormField {
  id: string
  type: 'text' | 'textarea' | 'datetime-local' | 'select' | 'number' | 'file'
  label: string
  placeholder?: string
  required: boolean
  options?: Array<{ value: string; label: string }>
  accept?: string // for file inputs
  min?: number
  max?: number
  rows?: number // for textareas
}

export interface CategoryFieldConfig {
  categoryName: string
  fields: FormField[]
}

export const categoryFieldConfigs: Record<string, CategoryFieldConfig> = {
  'Carpool': {
    categoryName: 'Carpool',
    fields: [
      {
        id: 'title',
        type: 'text',
        label: 'Trip Title',
        placeholder: 'e.g., Daily commute to downtown',
        required: true
      },
      {
        id: 'date',
        type: 'datetime-local',
        label: 'Date & Time',
        required: true
      },
      {
        id: 'pickup_points',
        type: 'textarea',
        label: 'Pickup Points',
        placeholder: 'List pickup locations (one per line)',
        required: true,
        rows: 3
      },
      {
        id: 'destination',
        type: 'text',
        label: 'Destination',
        placeholder: 'Where are you going?',
        required: true
      }
    ]
  },
  'Food Selling': {
    categoryName: 'Food Selling',
    fields: [
      {
        id: 'title',
        type: 'text',
        label: 'Food Item',
        placeholder: 'e.g., Homemade Lasagna',
        required: true
      },
      {
        id: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Describe your food item, ingredients, etc.',
        required: false,
        rows: 4
      },
      {
        id: 'image',
        type: 'file',
        label: 'Food Photo',
        accept: 'image/*',
        required: false
      }
    ]
  },
  'Services': {
    categoryName: 'Services',
    fields: [
      {
        id: 'title',
        type: 'text',
        label: 'Service Title',
        placeholder: 'e.g., Plumbing Repair Services',
        required: true
      },
      {
        id: 'description',
        type: 'textarea',
        label: 'Service Description',
        placeholder: 'Describe your services, experience, availability...',
        required: true,
        rows: 4
      },
      {
        id: 'service_type',
        type: 'select',
        label: 'Service Type',
        required: true,
        options: [
          { value: 'carpentry', label: 'Carpentry' },
          { value: 'plumbing', label: 'Plumbing' },
          { value: 'electrical', label: 'Electrical' },
          { value: 'cleaning', label: 'Cleaning' },
          { value: 'gardening', label: 'Gardening' },
          { value: 'moving', label: 'Moving/Delivery' },
          { value: 'tutoring', label: 'Tutoring' },
          { value: 'other', label: 'Other' }
        ]
      }
    ]
  },
  'Lost & Found': {
    categoryName: 'Lost & Found',
    fields: [
      {
        id: 'title',
        type: 'text',
        label: 'Item Name',
        placeholder: 'e.g., Blue Backpack, iPhone 13',
        required: true
      },
      {
        id: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Detailed description of the item...',
        required: true,
        rows: 4
      },
      {
        id: 'location',
        type: 'text',
        label: 'Location',
        placeholder: 'Where was it lost/found?',
        required: true
      },
      {
        id: 'date_lost',
        type: 'datetime-local',
        label: 'Date Lost/Found',
        required: false
      },
      {
        id: 'image',
        type: 'file',
        label: 'Photo of Item',
        accept: 'image/*',
        required: false
      }
    ]
  },
  'Events': {
    categoryName: 'Events',
    fields: [
      {
        id: 'title',
        type: 'text',
        label: 'Event Title',
        placeholder: 'e.g., Community BBQ Night',
        required: true
      },
      {
        id: 'description',
        type: 'textarea',
        label: 'Event Description',
        placeholder: 'What is this event about? What should people expect?',
        required: true,
        rows: 4
      },
      {
        id: 'date',
        type: 'datetime-local',
        label: 'Event Date & Time',
        required: true
      },
      {
        id: 'location',
        type: 'text',
        label: 'Location',
        placeholder: 'Where will this event take place?',
        required: true
      },
      {
        id: 'image',
        type: 'file',
        label: 'Event Photo/Flyer',
        accept: 'image/*',
        required: false
      }
    ]
  },
  'Others': {
    categoryName: 'Others',
    fields: [
      {
        id: 'title',
        type: 'text',
        label: 'Title',
        placeholder: 'Enter a descriptive title',
        required: true
      },
      {
        id: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Provide details about your post',
        required: true,
        rows: 4
      },
      {
        id: 'image',
        type: 'file',
        label: 'Image (Optional)',
        accept: 'image/*',
        required: false
      }
    ]
  }
}

export function getCategoryFields(categoryName: string): FormField[] {
  const config = categoryFieldConfigs[categoryName]
  return config ? config.fields : categoryFieldConfigs['Others'].fields
}

export function validateCategoryFields(categoryName: string, formData: Record<string, unknown>): string[] {
  const fields = getCategoryFields(categoryName)
  const errors: string[] = []

  fields.forEach(field => {
    if (field.required && (!formData[field.id] || formData[field.id] === '')) {
      errors.push(`${field.label} is required`)
    }

    if (field.type === 'number' && formData[field.id]) {
      const fieldValue = formData[field.id]
      const value = parseFloat(typeof fieldValue === 'string' ? fieldValue : String(fieldValue))
      if (isNaN(value)) {
        errors.push(`${field.label} must be a valid number`)
      } else {
        if (field.min !== undefined && value < field.min) {
          errors.push(`${field.label} cannot be less than ${field.min}`)
        }
        if (field.max !== undefined && value > field.max) {
          errors.push(`${field.label} cannot be greater than ${field.max}`)
        }
      }
    }
  })

  return errors
}