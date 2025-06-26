'use client'

import { PriceData, PriceDisplayProps, formatPriceDisplay } from '@/types/pricing'

export default function PriceDisplay({
  priceData,
  format = 'compact',
  currencySymbol = '',
  className = ''
}: PriceDisplayProps) {
  // Don't render anything if no valid price data
  if (!priceData) return null

  const formattedPrice = formatPriceDisplay(priceData, currencySymbol, format)
  
  // Different styling based on price type
  const getTypeStyles = () => {
    switch (priceData.type) {
      case 'free':
        return 'text-green-600 font-semibold'
      case 'fixed':
        return 'text-gray-900 font-medium'
      case 'range':
        return 'text-gray-900 font-medium'
      default:
        return 'text-gray-600'
    }
  }

  const getNegotiableStyles = () => {
    return priceData.negotiable ? 'text-blue-600' : ''
  }

  return (
    <div className={`${className}`}>
      <span className={`${getTypeStyles()} ${getNegotiableStyles()}`}>
        {formattedPrice}
      </span>
      
      {/* Optional: Add visual indicators */}
      {priceData.negotiable && priceData.type !== 'free' && (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Negotiable
        </span>
      )}
      
      {priceData.type === 'free' && (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Free
        </span>
      )}
    </div>
  )
}

/**
 * Simple inline price display for use in lists and cards
 */
export function InlinePriceDisplay({ 
  priceData, 
  currencySymbol = '',
  showBadges = true 
}: { 
  priceData: PriceData
  currencySymbol?: string
  showBadges?: boolean 
}) {
  if (!priceData) return null

  const formattedPrice = formatPriceDisplay(priceData, currencySymbol, 'compact')
  
  return (
    <span className="inline-flex items-center space-x-2">
      <span className={`font-medium ${
        priceData.type === 'free' ? 'text-green-600' : 'text-gray-900'
      }`}>
        {formattedPrice}
      </span>
      
      {showBadges && priceData.negotiable && priceData.type !== 'free' && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          Negotiable
        </span>
      )}
    </span>
  )
}