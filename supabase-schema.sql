-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Carpool', 'Share rides and transportation'),
  ('Food Selling', 'Buy and sell food items'),
  ('Services', 'Carpentry, plumbing, and other services'),
  ('Lost & Found', 'Lost and found items'),
  ('Events', 'Community events and gatherings'),
  ('Others', 'Everything else');

-- Create posts table
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  details JSONB,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name VARCHAR(100),
  user_avatar_url TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'sold', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_status ON posts(status);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (read-only for all authenticated users)
CREATE POLICY "Categories are viewable by authenticated users" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for posts
-- Users can view all posts
CREATE POLICY "Posts are viewable by authenticated users" ON posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can insert their own posts
CREATE POLICY "Users can insert their own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Admin users can delete any post (requires admin role)
CREATE POLICY "Admins can delete any post" ON posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);

-- Storage policies for post images
CREATE POLICY "Post images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can upload post images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own post images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'post-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own post images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'post-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );