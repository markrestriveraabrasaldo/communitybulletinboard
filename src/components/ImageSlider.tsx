'use client'

import { useState } from 'react'

interface ImageSliderProps {
  images: string[]
  alt: string
  className?: string
}

export default function ImageSlider({ images, alt, className = '' }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) return null

  if (images.length === 1) {
    return (
      <div className={`relative w-full h-80 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
        <img
          src={images[0]}
          alt={alt}
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
    )
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  return (
    <div className={`relative w-full h-80 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
      <img
        src={images[currentIndex]}
        alt={`${alt} - Image ${currentIndex + 1}`}
        className="w-full h-full object-contain rounded-lg"
      />
      
      {/* Image counter */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded-md">
        {currentIndex + 1}/{images.length}
      </div>
      
      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-opacity"
        aria-label="Previous image"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-opacity"
        aria-label="Next image"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* Dot indicators */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}