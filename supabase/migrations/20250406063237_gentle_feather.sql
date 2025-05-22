/*
  # Add business cards table and relationships

  1. New Tables
    - `business_cards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users.id)
      - `name` (text)
      - `company` (text)
      - `position` (text)
      - `image_url` (text, nullable)
      - `created_at` (timestamp with time zone)

  2. Changes
    - Add foreign key from reminders.business_card_id to business_cards.id

  3. Security
    - Enable RLS on business_cards table
    - Add policies for authenticated users to manage their own cards
*/

-- Create business cards table
CREATE TABLE IF NOT EXISTS business_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  company text NOT NULL,
  position text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE business_cards ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can create their own business cards"
  ON business_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own business cards"
  ON business_cards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add foreign key to reminders table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reminders' 
    AND column_name = 'business_card_id'
  ) THEN
    ALTER TABLE reminders 
    ADD COLUMN business_card_id uuid REFERENCES business_cards(id) ON DELETE SET NULL;
  END IF;
END $$;