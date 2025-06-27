'use server'

import { PostInsert, PostUpdate } from '@/types/database'
import { revalidatePath } from 'next/cache'
import { postSchema, updatePostSchema, imageUploadSchema } from '@/lib/schemas'
import { getAuthenticatedUser } from '@/lib/auth-utils'

export interface CreatePostResult {
  success: boolean
  error?: string
  postId?: string
}

export interface UpdatePostResult {
  success: boolean
  error?: string
}

export interface UploadImageResult {
  success: boolean
  error?: string
  imageUrl?: string
}

export async function createPost(formData: FormData): Promise<CreatePostResult> {
  try {
    // Get authenticated user and supabase client
    const { user, error: authError, supabase } = await getAuthenticatedUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Helper function to get form data with prefix fallback
    const getFormValue = (key: string): string => {
      // Try with prefix first (React useActionState sometimes adds prefixes)
      const prefixed = formData.get(`1_${key}`) as string
      if (prefixed) return prefixed
      
      // Fall back to unprefixed
      const unprefixed = formData.get(key) as string
      if (unprefixed) return unprefixed
      
      return ''
    }

    // Extract and validate form data
    // eslint-disable-next-line prefer-const
    let rawData = {
      title: getFormValue('title'),
      description: getFormValue('description'),
      categoryId: getFormValue('categoryId'),
      details: getFormValue('details'),
      imageUrl: getFormValue('imageUrl'),
    }

    // Parse details JSON
    let details = {}
    if (rawData.details) {
      try {
        details = JSON.parse(rawData.details)
      } catch {
        return { success: false, error: 'Invalid details format' }
      }
    }

    // If title/description are missing from form but present in details, extract them
    if (!rawData.title && details && typeof details === 'object' && 'title' in details) {
      rawData.title = details.title as string
    }
    if (!rawData.description && details && typeof details === 'object' && 'description' in details) {
      rawData.description = details.description as string
    }

    // Validate using Zod schema
    const validationResult = postSchema.safeParse({
      title: rawData.title,
      description: rawData.description,
      categoryId: rawData.categoryId,
      details,
      imageUrl: rawData.imageUrl,
    })

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message)
      return { success: false, error: errorMessages[0] }
    }

    const validatedData = validationResult.data

    // Create post data
    const postData: PostInsert = {
      title: validatedData.title,
      description: validatedData.description,
      details: validatedData.details || {},
      category_id: validatedData.categoryId,
      user_id: user.id,
      user_name: user.user_metadata?.full_name || user.email || 'Anonymous',
      user_avatar_url: user.user_metadata?.avatar_url,
      image_url: validatedData.imageUrl || null,
      status: 'active'
    }

    // Insert post
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select('id')
      .single()

    if (error) {
      console.error('Error creating post:', error)
      return { success: false, error: 'Failed to create post' }
    }

    // Revalidate relevant paths
    revalidatePath('/')
    revalidatePath(`/category/${validatedData.categoryId}`)

    return { success: true, postId: data.id }
  } catch (error) {
    console.error('Server error creating post:', error)
    return { success: false, error: 'Server error occurred' }
  }
}

export async function updatePost(formData: FormData): Promise<UpdatePostResult> {
  try {
    // Get authenticated user and supabase client
    const { user, error: authError, supabase } = await getAuthenticatedUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Helper function to get form data with prefix fallback
    const getFormValue = (key: string): string => {
      // Try with prefix first (React useActionState sometimes adds prefixes)
      const prefixed = formData.get(`1_${key}`) as string
      if (prefixed) return prefixed
      
      // Fall back to unprefixed
      const unprefixed = formData.get(key) as string
      if (unprefixed) return unprefixed
      
      return ''
    }

    // Extract form data
    // eslint-disable-next-line prefer-const
    let rawData = {
      postId: getFormValue('postId'),
      title: getFormValue('title'),
      description: getFormValue('description'),
      categoryId: getFormValue('categoryId'),
      details: getFormValue('details'),
      imageUrl: getFormValue('imageUrl'),
    }

    // Parse details JSON
    let details = {}
    if (rawData.details) {
      try {
        details = JSON.parse(rawData.details)
      } catch {
        return { success: false, error: 'Invalid details format' }
      }
    }

    // If title/description are missing from form but present in details, extract them
    if (!rawData.title && details && typeof details === 'object' && 'title' in details) {
      rawData.title = details.title as string
    }
    if (!rawData.description && details && typeof details === 'object' && 'description' in details) {
      rawData.description = details.description as string
    }

    // Validate using Zod schema
    const validationResult = updatePostSchema.safeParse({
      postId: rawData.postId,
      title: rawData.title,
      description: rawData.description,
      categoryId: rawData.categoryId,
      details,
      imageUrl: rawData.imageUrl,
    })

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message)
      return { success: false, error: errorMessages[0] }
    }

    const validatedData = validationResult.data

    // Verify user owns this post
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', validatedData.postId)
      .single()

    if (fetchError || !existingPost) {
      return { success: false, error: 'Post not found' }
    }

    if (existingPost.user_id !== user.id) {
      return { success: false, error: 'Not authorized to update this post' }
    }

    // Create update data
    const updateData: PostUpdate = {
      title: validatedData.title,
      description: validatedData.description,
      details: validatedData.details || {},
      category_id: validatedData.categoryId,
      image_url: validatedData.imageUrl || null
    }

    // Update post
    const { error: updateError } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', validatedData.postId)

    if (updateError) {
      console.error('Error updating post:', updateError)
      return { success: false, error: 'Failed to update post' }
    }

    // Revalidate relevant paths
    revalidatePath('/')
    revalidatePath(`/category/${validatedData.categoryId}`)

    return { success: true }
  } catch (error) {
    console.error('Server error updating post:', error)
    return { success: false, error: 'Server error occurred' }
  }
}

export async function uploadImage(formData: FormData): Promise<UploadImageResult> {
  try {
    // Get authenticated user and supabase client
    const { user, error: authError, supabase } = await getAuthenticatedUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const file = formData.get('image') as File
    if (!file) {
      return { success: false, error: 'No image file provided' }
    }

    // Validate using Zod schema
    const validationResult = imageUploadSchema.safeParse({ image: file })
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message)
      return { success: false, error: errorMessages[0] }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // Upload image
    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return { success: false, error: 'Failed to upload image' }
    }

    // Get public URL
    const { data } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName)

    return { success: true, imageUrl: data.publicUrl }
  } catch (error) {
    console.error('Server error uploading image:', error)
    return { success: false, error: 'Server error occurred' }
  }
}


export async function deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get authenticated user and supabase client
    const { user, error: authError, supabase } = await getAuthenticatedUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify user owns this post
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('user_id, category_id')
      .eq('id', postId)
      .single()

    if (fetchError || !existingPost) {
      return { success: false, error: 'Post not found' }
    }

    if (existingPost.user_id !== user.id) {
      return { success: false, error: 'Not authorized to delete this post' }
    }

    // Delete post
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (deleteError) {
      console.error('Error deleting post:', deleteError)
      return { success: false, error: 'Failed to delete post' }
    }

    // Revalidate relevant paths
    revalidatePath('/')
    revalidatePath(`/category/${existingPost.category_id}`)

    return { success: true }
  } catch (error) {
    console.error('Server error deleting post:', error)
    return { success: false, error: 'Server error occurred' }
  }
}