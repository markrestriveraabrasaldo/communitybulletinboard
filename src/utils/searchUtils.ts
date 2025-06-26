import { getCategoryFields } from '@/config/categoryFields'

/**
 * Get searchable fields for all categories
 * Returns a list of field IDs that can be searched in the details JSONB
 */
export function getAllSearchableFields(): string[] {
  const allFields = new Set<string>()
  
  // Get fields from all category configurations
  const categoryNames = ['Carpool', 'Food Selling', 'Services', 'Lost & Found', 'Events', 'Others']
  
  categoryNames.forEach(categoryName => {
    const fields = getCategoryFields(categoryName)
    fields.forEach(field => {
      // Only include text-based fields that are searchable
      if (['text', 'textarea', 'select'].includes(field.type) && field.id !== 'image') {
        allFields.add(field.id)
      }
    })
  })
  
  return Array.from(allFields)
}

/**
 * Get searchable fields for a specific category
 */
export function getSearchableFieldsForCategory(categoryName: string): string[] {
  const fields = getCategoryFields(categoryName)
  return fields
    .filter(field => ['text', 'textarea', 'select'].includes(field.type) && field.id !== 'image')
    .map(field => field.id)
}

/**
 * Build search conditions for Supabase query
 * Creates OR conditions for title, description, and dynamic JSONB fields
 */
export function buildSearchConditions(query: string, categoryName?: string): string {
  if (!query.trim()) return ''
  
  const searchTerm = query.trim()
  const conditions: string[] = []
  
  // Search in basic fields
  conditions.push(`title.ilike.%${searchTerm}%`)
  conditions.push(`description.ilike.%${searchTerm}%`)
  
  // Get searchable fields based on category context
  const searchableFields = categoryName 
    ? getSearchableFieldsForCategory(categoryName)
    : getAllSearchableFields()
  
  // Add JSONB field searches
  searchableFields.forEach(fieldId => {
    conditions.push(`details->>${fieldId}.ilike.%${searchTerm}%`)
  })
  
  return `or(${conditions.join(',')})`
}

/**
 * Clean and prepare search query
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .slice(0, 100) // Limit length
}

/**
 * Check if a post matches search criteria (for client-side filtering)
 */
export function doesPostMatchSearch(post: { title: string; description: string; details?: Record<string, unknown> | null }, query: string): boolean {
  if (!query.trim()) return true
  
  const searchTerm = query.toLowerCase()
  
  // Search in title
  if (post.title?.toLowerCase().includes(searchTerm)) return true
  
  // Search in description
  if (post.description?.toLowerCase().includes(searchTerm)) return true
  
  // Search in details JSONB
  if (post.details) {
    const detailsString = JSON.stringify(post.details).toLowerCase()
    if (detailsString.includes(searchTerm)) return true
  }
  
  return false
}

/**
 * Highlight search terms in text (for UI enhancement)
 */
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Get search suggestions based on common category fields
 */
export function getSearchSuggestions(categoryName?: string): string[] {
  const suggestions: string[] = []
  
  if (categoryName) {
    // Add category-specific suggestions
    switch (categoryName) {
      case 'Carpool':
        suggestions.push('downtown', 'morning', 'commute', 'shared ride')
        break
      case 'Food Selling':
        suggestions.push('homemade', 'fresh', 'delivery', 'vegan')
        break
      case 'Services':
        suggestions.push('plumbing', 'cleaning', 'repair', 'home')
        break
      case 'Lost & Found':
        suggestions.push('lost', 'found', 'backpack', 'phone')
        break
      case 'Events':
        suggestions.push('community', 'party', 'meetup', 'gathering')
        break
      default:
        suggestions.push('available', 'needed', 'urgent', 'free')
    }
  } else {
    // Global suggestions
    suggestions.push('free', 'urgent', 'today', 'available', 'new', 'quality')
  }
  
  return suggestions
}