'use client'

import { useMemo } from 'react'
import { 
  PriceData, 
  PriceInputProps, 
  PriceType, 
  PriceUnit,
  DEFAULT_PRICE_DATA,
  PRICE_UNITS,
  validatePriceData,
  formatPriceDisplay
} from '@/types/pricing'

export default function PriceInput({
  value = DEFAULT_PRICE_DATA,
  onChange,
  required = false,
  disabled = false,
  error,
  className = '',
  showUnits = true,
  availableUnits = PRICE_UNITS.map(u => u.value)
}: PriceInputProps) {
  // Compute validation errors from current value
  const validationErrors = useMemo(() => {
    const validation = validatePriceData(value)
    return validation.errors
  }, [value])

  const handleTypeChange = (newType: PriceType) => {
    const newPriceData: PriceData = {
      ...value,
      type: newType,
      // Clear values when changing type
      value: newType === 'fixed' ? value.value : undefined,
      min: newType === 'range' ? value.min : undefined,
      max: newType === 'range' ? value.max : undefined
    }
    onChange(newPriceData)
  }

  const handleValueChange = (field: keyof PriceData, newValue: string | number | boolean | undefined) => {
    const newPriceData: PriceData = {
      ...value,
      [field]: newValue
    }
    onChange(newPriceData)
  }

  const handleNumberInput = (field: 'value' | 'min' | 'max', inputValue: string) => {
    const numValue = inputValue === '' ? undefined : parseFloat(inputValue)
    if (inputValue === '' || (!isNaN(numValue!) && numValue! >= 0)) {
      handleValueChange(field, numValue)
    }
  }

  const filteredUnits = PRICE_UNITS.filter(unit => availableUnits.includes(unit.value))
  const displayErrors = error ? [error] : validationErrors

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Price Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Type {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex space-x-4">
          {(['fixed', 'range', 'free'] as PriceType[]).map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="radio"
                name="price-type"
                value={type}
                checked={value.type === type}
                onChange={(e) => handleTypeChange(e.target.value as PriceType)}
                disabled={disabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">
                {type === 'fixed' ? 'Fixed Price' : type === 'range' ? 'Price Range' : 'Free'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Inputs */}
      {value.type === 'fixed' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            value={value.value ?? ''}
            onChange={(e) => handleNumberInput('value', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={disabled}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>
      )}

      {value.type === 'range' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Price {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              value={value.min ?? ''}
              onChange={(e) => handleNumberInput('min', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={disabled}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              value={value.max ?? ''}
              onChange={(e) => handleNumberInput('max', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={disabled}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
        </div>
      )}

      {value.type === 'free' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">
            This item/service is offered for free.
          </p>
        </div>
      )}

      {/* Additional Options */}
      <div className="space-y-3">
        {/* Negotiable Toggle */}
        {value.type !== 'free' && (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value.negotiable}
              onChange={(e) => handleValueChange('negotiable', e.target.checked)}
              disabled={disabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Negotiable pricing
            </span>
          </label>
        )}

        {/* Unit Selection */}
        {showUnits && value.type !== 'free' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              value={value.unit}
              onChange={(e) => handleValueChange('unit', e.target.value as PriceUnit)}
              disabled={disabled}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              {filteredUnits.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Price Preview */}
      {value.type !== 'free' && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatPriceDisplay(value, '', 'detailed')}
          </p>
        </div>
      )}

      {/* Error Messages */}
      {displayErrors.length > 0 && (
        <div className="space-y-1">
          {displayErrors.map((errorMsg, index) => (
            <p key={index} className="text-sm text-red-600">
              {errorMsg}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}