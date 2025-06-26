# Community Bulletin Board

A modern web application for neighborhood communities to share information about carpools, food selling, services, and more. Built with Next.js and Supabase.

## Features

### ✅ Core Features
- **User Authentication**: Facebook OAuth login via Supabase Auth
- **Categories**: Organized posting in Carpool, Food Selling, Services, Lost & Found, Events, and Others
- **Post Management**: Create, view, edit, and delete posts with optional image uploads
- **Status Tracking**: Mark posts as resolved or sold
- **Real-time Updates**: Posts update in real-time across all users

### 🔐 Security Features
- Row Level Security (RLS) policies
- User-owned content protection
- Admin-only delete functionality
- Secure image storage

### 📱 User Experience
- Responsive design for all devices
- Category filtering and browsing
- User profiles with Facebook integration
- Image upload and preview

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Authentication**: Supabase Auth with Facebook OAuth
- **File Storage**: Supabase Storage for post images

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Supabase account and project
- A Facebook App for OAuth (optional for basic testing)

### 1. Clone and Install
```bash
cd community-bulletin-board
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your keys
3. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
4. Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Set up Database

Run the SQL schema in your Supabase SQL Editor:
```bash
# Copy the contents of supabase-schema.sql and run it in your Supabase SQL Editor
```

This creates:
- `categories` table with default categories
- `posts` table for user posts
- Row Level Security policies
- Storage bucket for images
- Proper indexes for performance

### 4. Configure Facebook OAuth (Optional)

1. Create a Facebook App at [developers.facebook.com](https://developers.facebook.com)
2. In Supabase Dashboard > Authentication > Providers:
   - Enable Facebook provider
   - Add your Facebook App ID and App Secret
   - Set redirect URL to: `https://your-project.supabase.co/auth/v1/callback`
3. In Facebook App settings:
   - Add `https://your-project.supabase.co/auth/v1/callback` to Valid OAuth Redirect URIs

### 5. Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your community bulletin board!

## Usage Guide

### For Users
1. **Sign In**: Click "Sign in with Facebook" to authenticate
2. **Browse Categories**: Click category cards to view posts in that category
3. **Create Posts**: Fill out the form with title, description, category, and optional image
4. **Manage Posts**: Mark your posts as resolved/sold or delete them
5. **Filter Posts**: Use the filter buttons to view active, resolved, or sold posts

### For Admins
- Set user role to 'admin' in Supabase Auth user metadata: `{"role": "admin"}`
- Admin users can delete any post (shows "Admin Delete" button)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── category/[id]/     # Category-specific pages
│   ├── auth/callback/     # OAuth callback handler
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── page.tsx           # Homepage with categories
├── components/            # React components
│   ├── CategoryCard.tsx   # Category display cards
│   ├── LoginButton.tsx    # Authentication button
│   ├── PostCard.tsx       # Individual post display
│   ├── PostForm.tsx       # Post creation form
│   └── PostList.tsx       # Posts listing with filters
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication state management
├── lib/                   # Utility libraries
│   ├── supabase.ts        # Basic Supabase client
│   ├── supabase-client.ts # Browser Supabase client
│   └── supabase-server.ts # Server Supabase client
└── types/                 # TypeScript type definitions
    └── database.ts        # Database schema types
```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app works on any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Docker

## Customization

### Adding New Categories
1. Insert new categories in the `categories` table via Supabase dashboard
2. Add corresponding icons in `CategoryCard.tsx`

### Styling
- All styling uses Tailwind CSS
- Modify `globals.css` for global styles
- Component styles are inline with Tailwind classes

### Adding Features
- Posts support custom fields (modify database schema)
- Add search functionality with PostgreSQL full-text search
- Implement email notifications with Supabase Edge Functions
- Add real-time chat with Supabase Realtime

## Troubleshooting

### Common Issues

**Auth not working:**
- Check Facebook App configuration
- Verify Supabase Auth provider settings
- Ensure redirect URLs match exactly

**Database errors:**
- Run the complete SQL schema
- Check RLS policies are enabled
- Verify user permissions

**Image upload fails:**
- Check Supabase Storage bucket exists
- Verify storage policies are configured
- Ensure file size limits

**Build errors:**
- Clear `.next` folder and reinstall dependencies
- Check environment variables are set
- Verify TypeScript types match database schema

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your community!

---

Built with ❤️ for neighborhood communities everywhere.