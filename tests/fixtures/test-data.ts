/**
 * Test data fixtures for consistent testing
 */

export const TEST_USER = {
  email: 'test@example.com',
  name: 'Test User',
  avatar: 'https://via.placeholder.com/150'
};

export const TEST_CATEGORIES = {
  CARPOOL: 'Carpool',
  FOOD_SELLING: 'Food Selling',
  SERVICES: 'Services',
  LOST_FOUND: 'Lost & Found',
  EVENTS: 'Events',
  OTHERS: 'Others'
};

export const TEST_POSTS = {
  carpool: {
    title: 'Daily Commute to Makati',
    description: 'Looking for carpool partners for daily commute to Makati CBD',
    date: '2024-01-15T08:00',
    pickup_points: 'Alabang\nMuntinlupa\nSucat',
    destination: 'Makati CBD'
  },
  
  food: {
    title: 'Homemade Adobo',
    description: 'Fresh homemade chicken adobo, perfect for lunch',
    pricing: {
      type: 'fixed',
      value: 150,
      negotiable: false,
      unit: 'item'
    }
  },
  
  service: {
    title: 'Plumbing Services',
    description: 'Professional plumbing repair and installation services',
    service_type: 'plumbing',
    pricing: {
      type: 'range',
      min: 500,
      max: 2000,
      negotiable: true,
      unit: 'service'
    }
  },
  
  event: {
    title: 'Community BBQ Night',
    description: 'Join us for a fun community BBQ night with neighbors',
    date: '2024-01-20T18:00',
    location: 'Community Park'
  },
  
  lostFound: {
    title: 'Lost Blue Backpack',
    description: 'Lost blue Jansport backpack with laptop inside',
    location: 'Near Starbucks Alabang',
    date_lost: '2024-01-10T14:00'
  }
};

export const TEST_SEARCH_QUERIES = [
  'makati',
  'plumbing',
  'food delivery',
  'lost keys',
  'community event',
  'carpool morning'
];

export const PRICING_TEST_CASES = [
  {
    type: 'fixed',
    value: 100,
    negotiable: false,
    unit: 'item',
    expected: '100'
  },
  {
    type: 'range',
    min: 50,
    max: 200,
    negotiable: true,
    unit: 'service',
    expected: '50 - 200 (Negotiable)'
  },
  {
    type: 'free',
    negotiable: false,
    unit: 'item',
    expected: 'Free'
  }
];

export const MOBILE_VIEWPORTS = [
  { width: 375, height: 667, name: 'iPhone SE' },
  { width: 414, height: 896, name: 'iPhone 11' },
  { width: 360, height: 740, name: 'Android' }
];

export const DESKTOP_VIEWPORTS = [
  { width: 1920, height: 1080, name: 'Desktop Large' },
  { width: 1366, height: 768, name: 'Desktop Medium' },
  { width: 1024, height: 768, name: 'Desktop Small' }
];