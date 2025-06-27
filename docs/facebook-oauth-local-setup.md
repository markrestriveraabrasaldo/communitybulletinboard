# Facebook OAuth Local Development Setup Guide

This guide explains how to configure Facebook OAuth to work in local development environment.

## Root Cause

Facebook OAuth works in production but not locally because:
1. **Redirect URI mismatch**: Local development uses `http://localhost:3000` while production uses `https://domain.com`
2. **Facebook OAuth app configuration**: May not include localhost URLs
3. **Supabase redirect URL configuration**: May not include localhost URLs

## Configuration Steps

### 1. Facebook OAuth App Configuration

#### Option A: Development Mode (Recommended)
1. Go to [Facebook Developers Console](https://developers.facebook.com/apps/)
2. Select your app
3. In the top-right corner, ensure your app is in **Development Mode**
4. When in Development Mode, localhost redirects are automatically allowed
5. Add `localhost` to **App Domains** in Basic Settings
6. Set **Site URL** to `http://localhost:3000/`

#### Option B: Production Mode
If your app is in Production Mode, you need to explicitly add redirect URIs:
1. Go to Facebook Login > Settings
2. Add `http://localhost:3000/auth/callback` to **Valid OAuth Redirect URIs**

### 2. Supabase Configuration

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to Authentication > URL Configuration
3. Add the following to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```

### 3. Environment Variables

Ensure your `.env.local` file contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Test Configuration

1. Run the validation script:
   ```bash
   npm run dev
   # In another terminal:
   node scripts/validate-auth-setup.js
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Test Facebook login and check browser console for debugging logs

## Debugging

### Enhanced Logging
The auth callback route now includes enhanced logging for local development:
- Environment detection
- Parameter validation
- Cookie debugging
- Supabase client configuration

### Common Issues

**Issue**: "URL Blocked" error from Facebook
- **Cause**: Redirect URI not whitelisted
- **Solution**: Ensure app is in Development Mode or add localhost URL to Valid OAuth Redirect URIs

**Issue**: "Invalid redirect URL" from Supabase
- **Cause**: Localhost URL not in Supabase redirect allowlist
- **Solution**: Add `http://localhost:3000/**` to Supabase URL Configuration

**Issue**: Authentication succeeds but session not persisted
- **Cause**: Cookie issues or environment variable problems
- **Solution**: Check browser console for detailed logs, verify environment variables

### Validation Checklist

- [ ] Facebook app is in Development Mode OR localhost URLs added to Valid OAuth Redirect URIs
- [ ] `localhost` added to Facebook App Domains
- [ ] Site URL set to `http://localhost:3000/`
- [ ] Supabase redirect URLs include `http://localhost:3000/auth/callback`
- [ ] Environment variables are properly set in `.env.local`
- [ ] No errors in browser console during auth flow

## Production Considerations

When deploying to production:
1. Switch Facebook app to Production Mode
2. Add production URLs to Facebook Valid OAuth Redirect URIs
3. Update Supabase redirect URLs to include production domain
4. Ensure environment variables are set in production environment

## Next Steps

After configuration:
1. Test the complete authentication flow
2. Verify user session persistence
3. Test protected routes access
4. Validate logout functionality