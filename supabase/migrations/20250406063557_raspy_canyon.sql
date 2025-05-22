/*
  # Add phone number field to users table

  1. Changes
    - Add phone_number column to users table (unique)
    - Add phone_verified column to users table
    - Add phone_verification_code column to users table

  2. Security
    - Maintain existing RLS policies
*/

DO $$ 
BEGIN
  -- Add phone_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE users ADD COLUMN phone_number text UNIQUE;
  END IF;

  -- Add phone_verified column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE users ADD COLUMN phone_verified boolean DEFAULT false;
  END IF;

  -- Add phone_verification_code column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone_verification_code'
  ) THEN
    ALTER TABLE users ADD COLUMN phone_verification_code text;
  END IF;
END $$;