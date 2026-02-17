-- ===================================================================
-- FIX: Remove Infinite Recursion in RLS Policies
-- ===================================================================
-- The admin policies cause infinite recursion, so we need to remove them
-- Run this in your Supabase SQL Editor
-- ===================================================================

-- Drop the problematic admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Keep only the simple policies that don't cause recursion
-- Users can read and update their own profile only

-- Verify remaining policies (should only show user-level policies, no admin policies)
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';

-- ===================================================================
-- If admins need to see all profiles, handle it in the app code
-- or use a database function with SECURITY DEFINER
-- ===================================================================
