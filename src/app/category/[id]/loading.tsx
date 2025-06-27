import { LoadingGrid } from '@/components/LoadingCard'

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Search bar loading */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Posts loading */}
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <LoadingGrid count={6} />
        </div>
      </main>
    </div>
  )
}