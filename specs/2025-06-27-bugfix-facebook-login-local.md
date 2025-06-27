# Bug Fix Spec: Facebook Login Not Working on Local Development

**Created**: 2025-06-27  
**Status**: Investigation  
**Priority**: High

## Problem Description

**Symptoms**: Facebook OAuth login works perfectly in production (Vercel deployment) but fails to work in local development environment.

**Reproduction Steps**:
1. Run the application locally (`npm run dev`)
2. Navigate to the home page
3. Click on the Facebook login button
4. Complete Facebook OAuth flow
5. Get redirected back to the application
6. Authentication fails to persist or complete properly

**Impact**: 
- Developers cannot test authentication features locally
- Slows down development and debugging of auth-related features
- Creates friction in the development workflow

## Root Cause Analysis

**Investigation**: Based on code examination, the authentication system uses:
- Supabase Auth with Facebook OAuth provider
- Next.js App Router with Server Components
- @supabase/ssr for server-side rendering support
- Cookie-based session management through middleware

**Potential Root Causes**:

1. **Redirect URI Mismatch**: 
   - Production: `https://communitybulletinboard.vercel.app/auth/callback`
   - Local: `http://localhost:3000/auth/callback`
   - Facebook OAuth apps typically require exact URL matches

2. **Environment Configuration Issues**:
   - Missing or incorrect environment variables in local `.env.local`
   - Supabase project configuration differences between environments

3. **HTTPS vs HTTP Protocol Issues**:
   - Production uses HTTPS, local uses HTTP
   - Facebook OAuth may have security restrictions on HTTP callbacks
   - Cookie security settings might differ between protocols

4. **Local Development Server Configuration**:
   - Next.js dev server may handle cookies differently
   - Port conflicts or localhost resolution issues

**Contributing Factors**:
- OAuth providers often have strict security requirements
- Local development environments lack production-level security
- Cookie handling differences between development and production

## Solution Design

**Primary Approach**: Configure Facebook OAuth app to support both production and local development URLs

**Implementation Steps**:

### 1. Facebook OAuth App Configuration
- Add local development redirect URI to Facebook OAuth app settings
- Ensure both `https://communitybulletinboard.vercel.app/auth/callback` and `http://localhost:3000/auth/callback` are registered

### 2. Environment Variable Verification
- Ensure local `.env.local` has correct Supabase configuration
- Verify environment variables match production settings
- Check for any whitespace or formatting issues

### 3. Supabase Auth Configuration
- Verify redirect URLs are configured in Supabase Auth settings
- Ensure Facebook provider is properly configured for both environments
- Check site URL configuration in Supabase

### 4. Local Development Enhancements
- Add better error logging for local development
- Consider HTTPS setup for local development if needed
- Implement development-specific debugging

**Side Effects**:
- May require updating Facebook OAuth app settings
- Could temporarily affect production if misconfigured
- May need to coordinate with Supabase configuration

**Alternative Solutions**:
1. **HTTPS Local Development**: Set up local HTTPS with self-signed certificates
2. **Environment-Specific OAuth Apps**: Create separate Facebook OAuth apps for dev/prod
3. **OAuth Proxy**: Use a proxy service to handle OAuth redirects

## Implementation Plan

### Phase 1: Investigation & Verification
- [ ] Check current `.env.local` configuration
- [ ] Verify Facebook OAuth app redirect URI settings
- [ ] Test current local authentication flow with detailed logging
- [ ] Compare Supabase Auth configuration between environments

### Phase 2: Configuration Updates
- [ ] Add local development redirect URI to Facebook OAuth app
- [ ] Update Supabase Auth redirect URL configuration if needed
- [ ] Ensure environment variables are correctly set
- [ ] Test authentication flow after configuration changes

### Phase 3: Enhanced Debugging
- [ ] Add development-specific error logging
- [ ] Implement AuthDebug component for local testing
- [ ] Create documentation for local development setup
- [ ] Add troubleshooting guide

### Phase 4: Validation & Documentation
- [ ] Test complete authentication flow locally
- [ ] Verify production authentication still works
- [ ] Document the fix and prevention measures
- [ ] Update development setup instructions

## Testing Strategy

**Local Development Testing**:
- Fresh browser session tests
- Incognito mode testing
- Cookie clearing between tests
- Multiple browser testing

**Integration Testing**:
- Verify auth state persistence
- Test protected route access
- Validate user session data
- Check auth callback error handling

**Production Verification**:
- Ensure production login still works
- No regression in deployed application
- Monitor production auth success rates

## Prevention Measures

**Documentation Updates**:
- Add local development auth setup to README
- Document Facebook OAuth app configuration requirements
- Create troubleshooting guide for common auth issues

**Development Process**:
- Include auth testing in local development checklist
- Add environment setup validation script
- Consider automated testing for auth flows

**Monitoring**:
- Add logging for auth failures in development
- Monitor auth success rates across environments
- Alert on configuration mismatches

## Success Metrics

**Primary Success Criteria**:
- [ ] Facebook login works consistently in local development
- [ ] No regression in production authentication
- [ ] Developers can test auth features locally without issues

**Secondary Success Criteria**:
- [ ] Improved error messages for auth failures
- [ ] Documentation prevents similar issues
- [ ] Faster development iteration on auth features

## Technical Notes

**Current Architecture**:
- **Auth Flow**: Facebook OAuth → Supabase Auth → Next.js middleware → Protected routes
- **Session Management**: Supabase cookies handled via @supabase/ssr
- **Redirect Handling**: `/auth/callback` route with proper cookie setting

**Key Files**:
- `middleware.ts:10-11` - Environment variable cleaning
- `src/app/auth/callback/route.ts:25-77` - OAuth callback handling
- `src/lib/supabase-client.ts:5-19` - Client-side Supabase configuration
- `src/lib/supabase-server.ts:6-33` - Server-side Supabase configuration

**Environment Requirements**:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- Facebook OAuth app configured with correct redirect URIs