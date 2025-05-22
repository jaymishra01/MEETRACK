/*
  # Add Task Assignment Support

  1. New Tables
    - `reminders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - Creator of the reminder
      - `assignee_id` (uuid, foreign key) - Person assigned to the task
      - `title` (text)
      - `description` (text)
      - `due_date` (timestamptz)
      - `location` (point) - Meeting location coordinates
      - `radius` (integer) - Acceptable radius in meters
      - `status` (text) - 'pending', 'completed', 'expired'
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)
      - `business_card_id` (uuid, foreign key) - Optional linked business card

    - `reminder_verifications`
      - `id` (uuid, primary key)
      - `reminder_id` (uuid, foreign key)
      - `creator_location` (point)
      - `assignee_location` (point)
      - `verified_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  assignee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamptz NOT NULL,
  location point,
  radius integer DEFAULT 100, -- Default 100 meters
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  business_card_id uuid
);

-- Create reminder verifications table
CREATE TABLE IF NOT EXISTS reminder_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id uuid REFERENCES reminders(id) ON DELETE CASCADE,
  creator_location point NOT NULL,
  assignee_location point NOT NULL,
  verified_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own reminders"
  ON reminders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = assignee_id);

CREATE POLICY "Users can create reminders"
  ON reminders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = assignee_id);

-- Verification policies
CREATE POLICY "Users can read own verifications"
  ON reminder_verifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reminders
      WHERE reminders.id = reminder_id
      AND (auth.uid() = reminders.user_id OR auth.uid() = reminders.assignee_id)
    )
  );

CREATE POLICY "Users can create verifications"
  ON reminder_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reminders
      WHERE reminders.id = reminder_id
      AND (auth.uid() = reminders.user_id OR auth.uid() = reminders.assignee_id)
    )
  );