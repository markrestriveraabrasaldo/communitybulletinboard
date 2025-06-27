# Bug Fix Spec: Post Creation Validation Error

## Problem Description

**Symptoms**: Users encounter validation error when submitting post creation form without images
**Error Message**: `{"success":false,"error":"Expected string, received null"}`
**Reproduction Steps**: 
1. Navigate to post creation form
2. Fill out required fields (title, description, category)
3. Do NOT upload any images
4. Submit the form
5. Validation error occurs

**Impact**: Users cannot create posts without images, blocking core functionality
**Severity**: High - affects primary user workflow

## Root Cause Analysis

**Investigation Results**:
✅ **Root Cause Identified**: Schema validation mismatch for `imageUrl` field

**Technical Details**:
- **Location**: `src/lib/schemas.ts:20` and `src/lib/actions/posts.ts:39`
- **Issue**: The Zod schema expects `imageUrl` to be either:
  - A valid URL string
  - An empty string `''`
  - Undefined (optional)
- **Actual Behavior**: When no image is uploaded, `formData.get('imageUrl')` returns `null`
- **Schema Definition**: 
  ```typescript
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal(''))
  ```

**Code Flow**:
1. `PostForm.tsx` - When no image uploaded, `imageUrl` field not set in FormData
2. `posts.ts:39` - `formData.get('imageUrl') as string` returns `null`
3. `schemas.ts:20` - Zod validation fails because `null` ≠ `string | undefined | ''`

## Solution Design

**Approach**: Fix the null handling in the server action before validation

**Fix Options**:
1. **Option A** (Recommended): Normalize `null` to `''` in server action
2. **Option B**: Update schema to accept `null`
3. **Option C**: Ensure form always sets empty string

**Selected Solution**: Option A - Normalize in server action
- **Why**: Keeps schema clean and handles the FormData API behavior
- **Impact**: Minimal, isolated change
- **Risk**: Low

## Implementation Plan

### Phase 1: Fix Server Action
- [ ] Update `createPost()` in `src/lib/actions/posts.ts`
- [ ] Update `updatePost()` in `src/lib/actions/posts.ts` 
- [ ] Normalize `null` imageUrl values to empty string

### Phase 2: Testing
- [ ] Test post creation without images
- [ ] Test post creation with images
- [ ] Test post editing scenarios
- [ ] Verify all categories work correctly

### Phase 3: Validation
- [ ] Test in development environment
- [ ] Deploy to production
- [ ] Monitor for related issues

## Code Changes Required

**File**: `src/lib/actions/posts.ts`

**Lines 34-40** - In `createPost()`:
```typescript
// BEFORE:
const rawData = {
  title: formData.get('title') as string,
  description: formData.get('description') as string,
  categoryId: formData.get('categoryId') as string,
  details: formData.get('details') as string,
  imageUrl: formData.get('imageUrl') as string,
}

// AFTER:
const rawData = {
  title: formData.get('title') as string,
  description: formData.get('description') as string,
  categoryId: formData.get('categoryId') as string,
  details: formData.get('details') as string,
  imageUrl: (formData.get('imageUrl') as string) || '',
}
```

**Lines 113-120** - In `updatePost()`:
```typescript
// BEFORE:
const rawData = {
  postId: formData.get('postId') as string,
  title: formData.get('title') as string,
  description: formData.get('description') as string,
  categoryId: formData.get('categoryId') as string,
  details: formData.get('details') as string,
  imageUrl: formData.get('imageUrl') as string,
}

// AFTER:
const rawData = {
  postId: formData.get('postId') as string,
  title: formData.get('title') as string,
  description: formData.get('description') as string,
  categoryId: formData.get('categoryId') as string,
  details: formData.get('details') as string,
  imageUrl: (formData.get('imageUrl') as string) || '',
}
```

## Testing Strategy

### Regression Testing
- [ ] Test all 6 categories (Carpool, Food Selling, Services, Lost & Found, Events, Others)
- [ ] Test with and without images
- [ ] Test with single and multiple images
- [ ] Test editing existing posts

### Edge Cases
- [ ] Empty form submission (should fail validation for required fields)
- [ ] Large image uploads
- [ ] Invalid image types
- [ ] Network failures during image upload

### User Scenarios
- [ ] New user creating first post
- [ ] Existing user creating multiple posts
- [ ] Users editing their posts
- [ ] Posts with category-specific fields

## Success Criteria

- [ ] Users can create posts without images successfully
- [ ] Users can create posts with images successfully  
- [ ] No regression in existing functionality
- [ ] Proper error messages for actual validation failures
- [ ] All categories continue to work correctly

## Prevention Measures

**Immediate**:
- [ ] Add unit tests for FormData null handling
- [ ] Add integration tests for post creation scenarios

**Future**:
- [ ] Consider using a form library with better type safety
- [ ] Add more comprehensive validation error handling
- [ ] Implement better error messages for users

---

**Status**: Ready for Implementation  
**Priority**: High  
**Estimated Effort**: 30 minutes  
**Risk Level**: Low  

**Next Step**: Implement the fix in `posts.ts` server action