import { FormField } from '@/config/categoryFields'

/**
 * Converts form data to a details object for storing in the database
 */
export function flattenFormDataToDetails(
  fields: FormField[], 
  formData: Record<string, unknown>
): Record<string, unknown> {
  const details: Record<string, unknown> = {}

  fields.forEach(field => {
    const value = formData[field.id]
    if (value !== undefined && value !== null && value !== '') {
      // Handle different field types
      switch (field.type) {
        case 'number':
          details[field.id] = parseFloat(String(value))
          break
        case 'datetime-local':
          details[field.id] = value
          break
        case 'file':
          // File URLs are handled separately in the form component
          // This will store the uploaded file URL
          details[field.id] = value
          break
        default:
          details[field.id] = value
      }
    }
  })

  return details
}

/**
 * Extracts form field values from a details object
 */
export function extractDetailsToFormData(
  fields: FormField[],
  details: Record<string, unknown> | null
): Record<string, unknown> {
  const formData: Record<string, unknown> = {}

  // Initialize with empty values
  fields.forEach(field => {
    switch (field.type) {
      case 'number':
        formData[field.id] = ''
        break
      case 'datetime-local':
        formData[field.id] = ''
        break
      case 'file':
        formData[field.id] = null
        break
      default:
        formData[field.id] = ''
    }
  })

  // Fill with actual values if details exist
  if (details) {
    fields.forEach(field => {
      if (details[field.id] !== undefined) {
        formData[field.id] = details[field.id]
      }
    })
  }

  return formData
}

/**
 * Gets the initial form state for a category
 */
export function getInitialFormState(fields: FormField[]): Record<string, unknown> {
  return extractDetailsToFormData(fields, null)
}