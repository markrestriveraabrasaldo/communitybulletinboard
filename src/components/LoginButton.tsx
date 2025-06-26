'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function LoginButton() {
  const { user, loading, signInWithFacebook, signOut } = useAuth();

  console.log('user', user);

  if (loading) {
    return (
      <div className='flex items-center space-x-2'>
        <div className='w-4 h-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent'></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className='flex items-center space-x-4'>
        <div className='flex items-center space-x-2'>
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata?.full_name || 'User'}
              className='w-8 h-8 rounded-full'
            />
          )}
          <span className='text-sm font-medium'>
            {user.user_metadata?.full_name || user.email}
          </span>
        </div>
        <button
          onClick={signOut}
          className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors'
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signInWithFacebook}
      className='flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors'
    >
      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
        <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
      </svg>
      <span>Sign in with Facebook</span>
    </button>
  );
}
