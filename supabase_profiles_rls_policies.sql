-- ===================================================================
-- FIX: Profiles Table RLS Policies
-- ===================================================================
-- This fixes the issue where users cannot read their own profile data
-- and where new users cannot create their profile during signup
-- 
-- IMPORTANT: After running this SQL, restart your Next.js app!
-- Also ensure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local
--
-- Run this in your Supabase SQL Editor
-- ===================================================================

-- First, ensure the profiles table exists with correct structure
-- (Skip if it already exists - this is just for reference)
/*
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'member',
  phone TEXT,
  city TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

NOTE: If you want to add a username column, run:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
*/

-- Enable Row Level Security (RLS) on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- ===================================================================
-- CORRECT POLICIES
-- ===================================================================

-- 1. Allow users to SELECT (read) their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. Allow users to INSERT their own profile (during signup)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. Allow service role to insert profiles (for signup via API)
CREATE POLICY "Service role can insert profiles"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 4. Allow users to UPDATE their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ===================================================================
-- Optional: If admins need to see/update all profiles
-- ===================================================================

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to update any profile
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ===================================================================
-- Verify the policies are created
-- ===================================================================

-- Run this to see all policies:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
