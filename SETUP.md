# Quick Setup Guide

Follow these steps to get your Community Bulletin Board running locally.

## 1. Environment Setup

Copy the environment template:
```bash
cp .env.local.example .env.local
```

Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for setup to complete

### Get API Keys
1. Go to Project Settings > API
2. Copy the Project URL and anon public key
3. Update your `.env.local` file

### Run Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Copy the entire contents of `supabase-schema.sql`
3. Paste and run the SQL

This will create:
- Categories table with default entries
- Posts table with proper relationships
- Row Level Security policies
- Storage bucket for images
- All necessary indexes

## 4. Facebook OAuth (Optional)

### Create Facebook App
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create new app > Consumer
3. Add Facebook Login product

### Configure Facebook App
1. In Facebook Login settings:
   - Add Valid OAuth Redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Save changes

### Configure Supabase Auth
1. In Supabase Dashboard > Authentication > Providers
2. Enable Facebook provider
3. Add your Facebook App ID and App Secret
4. Save configuration

## 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Verification Checklist

✅ Environment variables set  
✅ Dependencies installed  
✅ Supabase project created  
✅ Database schema applied  
✅ Facebook OAuth configured (optional)  
✅ Application running locally  

## Quick Test

1. Visit the homepage - you should see 6 category cards
2. Click on a category - you should see the category page with a post form
3. Sign in with Facebook (if configured) - login button should work
4. Create a test post - form should submit successfully
5. View your post - it should appear in the posts list

## Troubleshooting

**Can't see categories?**
- Check database schema was applied correctly
- Verify environment variables are set

**Auth not working?**
- Check Facebook app configuration
- Verify Supabase auth provider settings
- Ensure redirect URLs match exactly

**Image upload fails?**
- Check storage bucket was created
- Verify storage policies in schema

**Need help?**
- Check the main README.md for detailed troubleshooting
- Review the Supabase dashboard for any error messages
- Check browser console for JavaScript errors