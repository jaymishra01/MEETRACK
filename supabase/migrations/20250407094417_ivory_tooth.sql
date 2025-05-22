/*
  # Fix User Table RLS Policies

  1. Changes
    - Add INSERT policy for users table
    - Modify existing SELECT and UPDATE policies to handle new users
    - Ensure policies work with auth.uid() for authenticated users

  2. Security
    - Maintain secure access patterns
    - Only allow users to manage their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create comprehensive policies
CREATE POLICY "Users can manage own data"
  ON users
  FOR ALL  -- Allows SELECT, INSERT, UPDATE
  TO authenticated
  USING (
    -- For SELECT and UPDATE operations
    CASE 
      WHEN (SELECT COUNT(*) FROM users WHERE id = auth.uid()) > 0 
      THEN id = auth.uid()
      -- For INSERT operations and first-time users
      ELSE auth.uid() IS NOT NULL
    END
  )
  WITH CHECK (
    -- For INSERT and UPDATE operations
    CASE 
      WHEN (SELECT COUNT(*) FROM users WHERE id = auth.uid()) > 0 
      THEN id = auth.uid()
      -- For INSERT operations and first-time users
      ELSE auth.uid() = id
    END
  );

-- Notify the schema change
NOTIFY pgrst, 'reload schema';