/**
 * Flexible pricing system types
 * Supports fixed prices, ranges, free items, and negotiable pricing
 * Currency-agnostic design for global use
 */

export type PriceType = 'fixed' | 'range' | 'free'

export type PriceUnit = 
  | 'item'
  | 'hour' 
  | 'day'
  | 'service'
  | 'week'
  | 'month'

export interface PriceData {
  /** Type of pricing: fixed amount, range, or free */
  type: PriceType
  
  /** Fixed price value (when type is 'fixed') */
  value?: number
  
  /** Minimum price (when type is 'range') */
  min?: number
  
  /** Maximum price (when type is 'range') */
  max?: number
  
  /** Whether price is negotiable */
  negotiable: boolean
  
  /** Unit of pricing (per item, per hour, etc.) */
  unit: PriceUnit
  
  /** Optional currency code for display (not stored, used for formatting) */
  currency?: string
}

export interface PriceInputProps {
  /** Current price data */
  value?: PriceData
  
  /** Callback when price data changes */
  onChange: (priceData: PriceData) => void
  
  /** Whether the input is required */
  required?: boolean
  
  /** Whether the input is disabled */
  disabled?: boolean
  
  /** Error message to display */
  error?: string
  
  /** Custom CSS classes */
  className?: string
  
  /** Show unit selection */
  showUnits?: boolean
  
  /** Available units to choose from */
  availableUnits?: PriceUnit[]
}

export interface PriceDisplayProps {
  /** Price data to display */
  priceData: PriceData
  
  /** Display format preference */
  format?: 'compact' | 'detailed'
  
  /** Currency symbol to use (defaults to no symbol) */
  currencySymbol?: string
  
  /** Custom CSS classes */
  className?: string
}

/** Validation result for price data */
export interface PriceValidationResult {
  isValid: boolean
  errors: string[]
}

/** Default price data structure */
export const DEFAULT_PRICE_DATA: PriceData = {
  type: 'fixed',
  value: undefined,
  negotiable: false,
  unit: 'item'
}

/** Common unit options with labels */
export const PRICE_UNITS: Array<{ value: PriceUnit; label: string }> = [
  { value: 'item', label: 'Per item' },
  { value: 'hour', label: 'Per hour' },
  { value: 'day', label: 'Per day' },
  { value: 'service', label: 'Per service' },
  { value: 'week', label: 'Per week' },
  { value: 'month', label: 'Per month' }
]

/** Helper function to validate price data */
export function validatePriceData(priceData: PriceData): PriceValidationResult {
  const errors: string[] = []
  
  switch (priceData.type) {
    case 'fixed':
      if (priceData.value === undefined || priceData.value < 0) {
        errors.push('Fixed price must be a positive number')
      }
      break
      
    case 'range':
      if (priceData.min === undefined || priceData.min < 0) {
        errors.push('Minimum price must be a positive number')
      }
      if (priceData.max === undefined || priceData.max < 0) {
        errors.push('Maximum price must be a positive number')
      }
      if (priceData.min !== undefined && priceData.max !== undefined && priceData.min >= priceData.max) {
        errors.push('Maximum price must be greater than minimum price')
      }
      break
      
    case 'free':
      // No validation needed for free items
      break
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/** Helper function to format price for display */
export function formatPriceDisplay(
  priceData: PriceData, 
  currencySymbol: string = '',
  format: 'compact' | 'detailed' = 'compact'
): string {
  const formatNumber = (num: number) => {
    return num % 1 === 0 ? num.toString() : num.toFixed(2)
  }
  
  const addCurrency = (text: string) => currencySymbol ? `${currencySymbol}${text}` : text
  
  switch (priceData.type) {
    case 'free':
      return 'Free'
      
    case 'fixed':
      if (priceData.value === undefined) return 'Price not set'
      const fixedPrice = addCurrency(formatNumber(priceData.value))
      if (format === 'detailed') {
        const unitText = priceData.unit !== 'item' ? ` ${PRICE_UNITS.find(u => u.value === priceData.unit)?.label.toLowerCase()}` : ''
        const negotiableText = priceData.negotiable ? ' (Negotiable)' : ''
        return `${fixedPrice}${unitText}${negotiableText}`
      }
      return priceData.negotiable ? `${fixedPrice} (Negotiable)` : fixedPrice
      
    case 'range':
      if (priceData.min === undefined || priceData.max === undefined) return 'Price not set'
      const rangePrice = `${addCurrency(formatNumber(priceData.min))} - ${addCurrency(formatNumber(priceData.max))}`
      if (format === 'detailed') {
        const unitText = priceData.unit !== 'item' ? ` ${PRICE_UNITS.find(u => u.value === priceData.unit)?.label.toLowerCase()}` : ''
        const negotiableText = priceData.negotiable ? ' (Negotiable)' : ''
        return `${rangePrice}${unitText}${negotiableText}`
      }
      return priceData.negotiable ? `${rangePrice} (Negotiable)` : rangePrice
      
    default:
      return 'Price not available'
  }
}