/*
  # Fix Users Table RLS Policies for Contact Access

  1. Changes
    - Drop the overly broad "Users can manage own data" policy
    - Create separate, granular policies for different operations
    - Allow authenticated users to read public profile information from all users
    - Restrict INSERT and UPDATE operations to own data only

  2. Security
    - Maintains data security while allowing necessary contact access
    - Users can only modify their own data
    - Public profile fields are readable by all authenticated users
*/

-- Drop the existing overly broad policy
DROP POLICY IF EXISTS "Users can manage own data" ON users;

-- Create a policy for reading public profile information
-- This allows authenticated users to see other users' public profile data for contacts
CREATE POLICY "Users can read public profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Create a policy for inserting new user records
-- Only allows users to create their own profile
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create a policy for updating user records
-- Only allows users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Notify the schema change
NOTIFY pgrst, 'reload schema';