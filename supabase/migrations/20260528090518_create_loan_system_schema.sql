/*
  # Create Peer-to-Peer Loan System

  1. New Tables
    - `loans` - Main loan records between users
    - `loan_repayments` - Track repayment history
    - `defaulter_flags` - Flag users who default on loans
    - `loan_offers` - Lenders can create loan offers with terms
    - `loan_requests` - Borrowers can request loans

  2. Features
    - Interest rates: 0% to 14%
    - Duration: 1 to 12 months
    - Smart contract-like enforcement with status tracking
    - Defaulter flagging system visible to all users
    - Reputation system based on loan history

  3. Security
    - RLS enabled on all tables
    - Users can only access their own loans
    - Public can view defaulter flags
    - Lenders can manage loans they provide
*/

-- Create loan statuses enum type
CREATE TYPE loan_status AS ENUM (
  'pending',           -- Loan requested/offered but not accepted
  'active',            -- Loan is active and being repaid
  'completed',         -- Loan fully repaid
  'defaulted',         -- Loan defaulted by borrower
  'cancelled',         -- Loan cancelled before activation
  'flagged'            -- Loan has defaulter flag raised
);

-- Create loan offers table (lenders create offers)
CREATE TABLE IF NOT EXISTS loan_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Loan terms
  principal_amount integer NOT NULL CHECK (principal_amount > 0),
  interest_rate decimal(5,2) NOT NULL CHECK (interest_rate >= 0 AND interest_rate <= 14),
  duration_months integer NOT NULL CHECK (duration_months >= 1 AND duration_months <= 12),
  
  -- Calculated amounts (stored, not generated)
  total_repayment integer,
  monthly_emi integer,
  
  -- Terms and conditions
  description text,
  terms text DEFAULT 'Standard loan terms apply. Interest rate is annual percentage.',
  
  -- Status
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create loan requests table (borrowers request loans)
CREATE TABLE IF NOT EXISTS loan_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Request details
  requested_amount integer NOT NULL CHECK (requested_amount > 0),
  purpose text,
  
  -- Preferred terms
  preferred_interest_rate decimal(5,2) CHECK (preferred_interest_rate >= 0 AND preferred_interest_rate <= 14),
  preferred_duration integer CHECK (preferred_duration >= 1 AND preferred_duration <= 12),
  
  -- Urgency
  urgency text CHECK (urgency IN ('low', 'medium', 'high')) DEFAULT 'medium',
  
  -- Status
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create main loans table
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants
  lender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  borrower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Source (either from offer or request)
  loan_offer_id uuid REFERENCES loan_offers(id) ON DELETE SET NULL,
  loan_request_id uuid REFERENCES loan_requests(id) ON DELETE SET NULL,
  
  -- Loan terms
  principal_amount integer NOT NULL CHECK (principal_amount > 0),
  interest_rate decimal(5,2) NOT NULL CHECK (interest_rate >= 0 AND interest_rate <= 14),
  duration_months integer NOT NULL CHECK (duration_months >= 1 AND duration_months <= 12),
  
  -- Calculated amounts (stored values)
  total_repayment integer,
  monthly_emi integer,
  
  -- Dates
  start_date date,
  end_date date,
  
  -- Repayment tracking
  amount_repaid integer DEFAULT 0,
  months_paid integer DEFAULT 0,
  next_payment_date date,
  
  -- Status
  status loan_status DEFAULT 'pending',
  
  -- Smart contract terms
  terms_accepted_by_borrower boolean DEFAULT false,
  terms_accepted_by_lender boolean DEFAULT false,
  contract_timestamp timestamptz,
  
  -- Metadata
  purpose text,
  notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT different_users CHECK (lender_id != borrower_id)
);

-- Create loan repayments tracking
CREATE TABLE IF NOT EXISTS loan_repayments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  
  -- Payment details
  amount integer NOT NULL CHECK (amount > 0),
  payment_date timestamptz DEFAULT now(),
  payment_method text,
  
  -- Tracking
  month_number integer NOT NULL,
  is_late boolean DEFAULT false,
  notes text,
  
  created_at timestamptz DEFAULT now()
);

-- Create defaulter flags table
CREATE TABLE IF NOT EXISTS defaulter_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference to defaulted loan
  loan_id uuid NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  borrower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Flag details
  reason text NOT NULL,
  amount_defaulted integer NOT NULL,
  default_date date DEFAULT CURRENT_DATE,
  
  -- Evidence
  evidence_urls text[],  -- Array of URLs to evidence documents
  
  -- Resolution
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolution_notes text,
  
  -- Visibility
  is_public boolean DEFAULT true,  -- Public by default to alert community
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Prevent duplicate flags for same loan
  UNIQUE(loan_id)
);

-- Add defaulter count to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS defaulter_flags_count integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_loans_borrowed integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_loans_lent integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS successful_repayments integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation_score decimal(5,2) DEFAULT 50.00;

-- Create indexes for performance
CREATE INDEX idx_loans_lender ON loans(lender_id);
CREATE INDEX idx_loans_borrower ON loans(borrower_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loan_repayments_loan ON loan_repayments(loan_id);
CREATE INDEX idx_defaulter_flags_borrower ON defaulter_flags(borrower_id);
CREATE INDEX idx_loan_offers_lender ON loan_offers(lender_id);
CREATE INDEX idx_loan_requests_borrower ON loan_requests(borrower_id);

-- Enable RLS
ALTER TABLE loan_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE defaulter_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loan_offers
CREATE POLICY "Users can view active loan offers"
  ON loan_offers FOR SELECT
  TO authenticated
  USING (is_active = true OR lender_id = auth.uid());

CREATE POLICY "Lenders can create loan offers"
  ON loan_offers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = lender_id);

CREATE POLICY "Lenders can update their own offers"
  ON loan_offers FOR UPDATE
  TO authenticated
  USING (auth.uid() = lender_id)
  WITH CHECK (auth.uid() = lender_id);

CREATE POLICY "Lenders can delete their own offers"
  ON loan_offers FOR DELETE
  TO authenticated
  USING (auth.uid() = lender_id);

-- RLS Policies for loan_requests
CREATE POLICY "Users can view active loan requests"
  ON loan_requests FOR SELECT
  TO authenticated
  USING (is_active = true OR borrower_id = auth.uid());

CREATE POLICY "Borrowers can create loan requests"
  ON loan_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = borrower_id);

CREATE POLICY "Borrowers can update their own requests"
  ON loan_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = borrower_id)
  WITH CHECK (auth.uid() = borrower_id);

CREATE POLICY "Borrowers can delete their own requests"
  ON loan_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = borrower_id);

-- RLS Policies for loans
CREATE POLICY "Users can view their own loans"
  ON loans FOR SELECT
  TO authenticated
  USING (auth.uid() = lender_id OR auth.uid() = borrower_id);

CREATE POLICY "Users can create loans"
  ON loans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = lender_id OR auth.uid() = borrower_id);

CREATE POLICY "Lenders and borrowers can update loans"
  ON loans FOR UPDATE
  TO authenticated
  USING (auth.uid() = lender_id OR auth.uid() = borrower_id)
  WITH CHECK (auth.uid() = lender_id OR auth.uid() = borrower_id);

-- RLS Policies for loan_repayments
CREATE POLICY "Users can view repayments for their loans"
  ON loan_repayments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM loans
      WHERE loans.id = loan_repayments.loan_id
      AND (loans.lender_id = auth.uid() OR loans.borrower_id = auth.uid())
    )
  );

CREATE POLICY "Borrowers can create repayments"
  ON loan_repayments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM loans
      WHERE loans.id = loan_repayments.loan_id
      AND loans.borrower_id = auth.uid()
    )
  );

-- RLS Policies for defaulter_flags (PUBLIC visibility)
CREATE POLICY "Public can view defaulter flags"
  ON defaulter_flags FOR SELECT
  TO authenticated
  USING (is_public = true OR lender_id = auth.uid() OR borrower_id = auth.uid());

CREATE POLICY "Lenders can create defaulter flags"
  ON defaulter_flags FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = lender_id
    AND EXISTS (
      SELECT 1 FROM loans
      WHERE loans.id = defaulter_flags.loan_id
      AND loans.lender_id = auth.uid()
    )
  );

CREATE POLICY "Lenders can update their flags"
  ON defaulter_flags FOR UPDATE
  TO authenticated
  USING (auth.uid() = lender_id)
  WITH CHECK (auth.uid() = lender_id);