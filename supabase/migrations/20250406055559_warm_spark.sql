/*
  # Initial Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Maps to Supabase auth user
      - `email` (text)
      - `full_name` (text)
      - `company` (text)
      - `position` (text)
      - `gst_number` (text)
      - `wallet_balance` (integer) - In smallest currency unit (paise)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `amount` (integer) - In smallest currency unit (paise)
      - `type` (text) - 'credit' or 'debit'
      - `description` (text)
      - `status` (text) - 'pending', 'completed', 'failed'
      - `created_at` (timestamp)

    - `plans`
      - `id` (uuid, primary key)
      - `name` (text)
      - `cards` (integer)
      - `storage` (integer) - In GB
      - `price` (integer) - In smallest currency unit (paise)
      - `features` (text[])
      - `created_at` (timestamp)

    - `user_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `plan_id` (uuid, foreign key)
      - `cards_remaining` (integer)
      - `storage_remaining` (integer)
      - `start_date` (timestamp)
      - `end_date` (timestamp)
      - `created_at` (timestamp)

    - `courier_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `courier_id` (uuid, foreign key references users)
      - `pickup_city` (text)
      - `delivery_city` (text)
      - `weight` (integer) - In grams
      - `price` (integer) - In smallest currency unit (paise)
      - `description` (text)
      - `status` (text) - 'pending', 'approved', 'completed', 'rejected'
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  company text,
  position text,
  gst_number text,
  wallet_balance integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cards integer NOT NULL,
  storage integer NOT NULL,
  price integer NOT NULL,
  features text[],
  created_at timestamptz DEFAULT now()
);

-- Create user_plans table
CREATE TABLE IF NOT EXISTS user_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES plans(id) ON DELETE CASCADE,
  cards_remaining integer NOT NULL,
  storage_remaining integer NOT NULL,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create courier_requests table
CREATE TABLE IF NOT EXISTS courier_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  courier_id uuid REFERENCES users(id) ON DELETE SET NULL,
  pickup_city text NOT NULL,
  delivery_city text NOT NULL,
  weight integer NOT NULL,
  price integer NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE courier_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Transactions policies
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Plans policies
CREATE POLICY "Anyone can read plans"
  ON plans
  FOR SELECT
  TO authenticated
  USING (true);

-- User plans policies
CREATE POLICY "Users can read own plans"
  ON user_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plans"
  ON user_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Courier requests policies
CREATE POLICY "Users can read own courier requests"
  ON courier_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = courier_id);

CREATE POLICY "Users can create courier requests"
  ON courier_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own courier requests"
  ON courier_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = courier_id);

-- Insert default plans
INSERT INTO plans (name, cards, storage, price, features) VALUES
  ('Basic', 100, 3, 30000, ARRAY['100 Business Cards', '3GB Cloud Storage', 'Basic Analytics']),
  ('Professional', 250, 10, 60000, ARRAY['250 Business Cards', '10GB Cloud Storage', 'Advanced Analytics', 'Priority Support']),
  ('Enterprise', 500, 20, 90000, ARRAY['500 Business Cards', '20GB Cloud Storage', 'Premium Analytics', '24/7 Support', 'Custom Branding']);