# Database Schema (Supabase / PostgreSQL)

This file contains the SQL Data Definition Language (DDL) for our tables.

---

-- Profiles table to store public user data, linked to the private auth.users table.
CREATE TABLE public.profiles (
id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
username TEXT UNIQUE,
full_name TEXT,
avatar_url TEXT,
updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories for posts
CREATE TABLE public.categories (
id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
name TEXT UNIQUE NOT NULL,
description TEXT
);

-- The main table for all posts on the bulletin board
CREATE TABLE public.posts (
id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
created_at TIMESTAMPTZ DEFAULT NOW(),
title TEXT NOT NULL,
content TEXT,
category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
status TEXT DEFAULT 'active' -- e.g., 'active', 'closed', 'completed'
);

-- Comments on posts
CREATE TABLE public.comments (
id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
created_at TIMESTAMPTZ DEFAULT NOW(),
content TEXT NOT NULL,
post_id BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE
);
