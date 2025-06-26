import { createClient } from '@/lib/supabase-server'
import LoginButton from '@/components/LoginButton'
import HomePage from '@/components/HomePage'

interface CategoryWithCount {
  id: string;
  name: string;
  description: string | null;
  postCount: number;
  created_at: string;
}

export default async function Home() {
  let categoriesWithCounts: CategoryWithCount[] = []
  
  try {
    const supabase = await createClient()
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      console.log('Using fallback categories due to database error')
      // Fallback to default categories if database fails
      categoriesWithCounts = [
        { id: 'carpool', name: 'Carpool', description: 'Share rides and transportation', postCount: 0, created_at: new Date().toISOString() },
        { id: 'food-selling', name: 'Food Selling', description: 'Buy and sell food items', postCount: 0, created_at: new Date().toISOString() },
        { id: 'services', name: 'Services', description: 'Carpentry, plumbing, and other services', postCount: 0, created_at: new Date().toISOString() },
        { id: 'lost-found', name: 'Lost & Found', description: 'Lost and found items', postCount: 0, created_at: new Date().toISOString() },
        { id: 'events', name: 'Events', description: 'Community events and gatherings', postCount: 0, created_at: new Date().toISOString() },
        { id: 'others', name: 'Others', description: 'Everything else', postCount: 0, created_at: new Date().toISOString() }
      ]
    } else if (!categories || categories.length === 0) {
      console.log('No categories found in database, using fallback categories')
      // Fallback to default categories if database returns empty
      categoriesWithCounts = [
        { id: 'carpool', name: 'Carpool', description: 'Share rides and transportation', postCount: 0, created_at: new Date().toISOString() },
        { id: 'food-selling', name: 'Food Selling', description: 'Buy and sell food items', postCount: 0, created_at: new Date().toISOString() },
        { id: 'services', name: 'Services', description: 'Carpentry, plumbing, and other services', postCount: 0, created_at: new Date().toISOString() },
        { id: 'lost-found', name: 'Lost & Found', description: 'Lost and found items', postCount: 0, created_at: new Date().toISOString() },
        { id: 'events', name: 'Events', description: 'Community events and gatherings', postCount: 0, created_at: new Date().toISOString() },
        { id: 'others', name: 'Others', description: 'Everything else', postCount: 0, created_at: new Date().toISOString() }
      ]
    } else {
      // Get post counts for each category
      categoriesWithCounts = await Promise.all(
        (categories || []).map(async (category) => {
          const { count } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('status', 'active')
          
          return {
            ...category,
            postCount: count || 0
          }
        })
      )
    }
    
    console.log('Final categories with counts:', categoriesWithCounts)
  } catch (error) {
    console.error('Database connection error:', error)
    console.log('Using fallback categories due to connection error')
    // Fallback to default categories
    categoriesWithCounts = [
      { id: 'carpool', name: 'Carpool', description: 'Share rides and transportation', postCount: 0, created_at: new Date().toISOString() },
      { id: 'food-selling', name: 'Food Selling', description: 'Buy and sell food items', postCount: 0, created_at: new Date().toISOString() },
      { id: 'services', name: 'Services', description: 'Carpentry, plumbing, and other services', postCount: 0, created_at: new Date().toISOString() },
      { id: 'lost-found', name: 'Lost & Found', description: 'Lost and found items', postCount: 0, created_at: new Date().toISOString() },
      { id: 'events', name: 'Events', description: 'Community events and gatherings', postCount: 0, created_at: new Date().toISOString() },
      { id: 'others', name: 'Others', description: 'Everything else', postCount: 0, created_at: new Date().toISOString() }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Community Bulletin Board
              </h1>
              <p className="text-sm text-gray-600">
                Your neighborhood hub for carpools, food, services & more
              </p>
            </div>
            <LoginButton />
          </div>
        </div>
      </header>

      <HomePage categories={categoriesWithCounts} />
    </div>
  )
}