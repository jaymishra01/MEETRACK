-- Create demo data for loan system

-- First create additional users
INSERT INTO users (id, email, full_name, company, position, reputation_score, defaulter_flags_count)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'lender1@demo.com', 'Rajesh Kumar', 'Kumar Finance Ltd', 'CEO', 85.00, 0),
  ('22222222-2222-2222-2222-222222222222', 'lender2@demo.com', 'Priya Sharma', 'Sharma Investments', 'Director', 78.00, 0),
  ('33333333-3333-3333-3333-333333333333', 'borrower1@demo.com', 'Amit Patel', 'Tech Solutions', 'Manager', 45.00, 2),
  ('44444444-4444-4444-4444-444444444444', 'borrower2@demo.com', 'Neha Gupta', 'Gupta Traders', 'Owner', 72.00, 0),
  ('55555555-5555-5555-5555-555555555555', 'borrower3@demo.com', 'Sanjay Verma', 'Verma Exports', 'Partner', 25.00, 1)
ON CONFLICT (id) DO NOTHING;

-- Create loan offers from lenders
INSERT INTO loan_offers (lender_id, principal_amount, interest_rate, duration_months, total_repayment, monthly_emi, description, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 20000, 5.00, 6, 21000, 3500, 'Available for small business loans. Quick approval process.', true),
  ('11111111-1111-1111-1111-111111111111', 50000, 7.00, 12, 53500, 4458, 'Medium-term business expansion loan. Competitive rates.', true),
  ('22222222-2222-2222-2222-222222222222', 15000, 4.00, 6, 15600, 2600, 'Interest-friendly loan for verified businesses.', true),
  ('22222222-2222-2222-2222-222222222222', 30000, 6.00, 9, 31800, 3533, 'Quick disbursement within 24 hours after approval.', true)
ON CONFLICT DO NOTHING;

-- Create loan requests from borrowers
INSERT INTO loan_requests (borrower_id, requested_amount, purpose, preferred_interest_rate, preferred_duration, urgency, is_active)
VALUES
  ('33333333-3333-3333-3333-333333333333', 25000, 'Need urgent working capital for inventory purchase. Repayment assured from existing contracts.', 8.00, 6, 'high', true),
  ('44444444-4444-4444-4444-444444444444', 40000, 'Expanding business operations. Need funds for new equipment and marketing.', 6.00, 12, 'medium', true),
  ('55555555-5555-5555-5555-555555555555', 15000, 'Emergency funds required for medical expenses. Will repay within 3 months.', null, 3, 'high', true)
ON CONFLICT DO NOTHING;

-- Create active loans
INSERT INTO loans (id, lender_id, borrower_id, principal_amount, interest_rate, duration_months, total_repayment, monthly_emi, start_date, end_date, amount_repaid, months_paid, next_payment_date, status, purpose, terms_accepted_by_borrower, terms_accepted_by_lender, contract_timestamp)
VALUES
  -- Active loan in good standing
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '11111111-1111-1111-1111-111111111111',
   '44444444-4444-4444-4444-444444444444',
   30000, 5.00, 6, 31500, 5250,
   CURRENT_DATE - INTERVAL '2 months',
   CURRENT_DATE + INTERVAL '4 months',
   10500, 2,
   CURRENT_DATE + INTERVAL '1 month',
   'active',
   'Business expansion loan',
   true, true, NOW() - INTERVAL '2 months'),

  -- Defaulted loan
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '22222222-2222-2222-2222-222222222222',
   '33333333-3333-3333-3333-333333333333',
   20000, 6.00, 6, 21200, 3533,
   CURRENT_DATE - INTERVAL '8 months',
   CURRENT_DATE - INTERVAL '2 months',
   3533, 1,
   CURRENT_DATE - INTERVAL '6 months',
   'defaulted',
   'Working capital loan',
   true, true, NOW() - INTERVAL '8 months'),

  -- Another defaulted loan
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '11111111-1111-1111-1111-111111111111',
   '55555555-5555-5555-5555-555555555555',
   15000, 7.00, 6, 16050, 2675,
   CURRENT_DATE - INTERVAL '10 months',
   CURRENT_DATE - INTERVAL '4 months',
   2675, 1,
   CURRENT_DATE - INTERVAL '8 months',
   'defaulted',
   'Emergency loan',
   true, true, NOW() - INTERVAL '10 months')
ON CONFLICT DO NOTHING;

-- Create defaulter flags for the defaulted loans
INSERT INTO defaulter_flags (loan_id, borrower_id, lender_id, reason, amount_defaulted, default_date, is_public, is_resolved)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '33333333-3333-3333-3333-333333333333',
   '22222222-2222-2222-2222-222222222222',
   'Borrower stopped responding after first EMI. Multiple attempts to contact failed. No response to emails or phone calls for over 6 months. Complete default on loan terms.',
   17667,
   CURRENT_DATE - INTERVAL '4 months',
   true,
   false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '55555555-5555-5555-5555-555555555555',
   '11111111-1111-1111-1111-111111111111',
   'Borrower made only one payment and then disappeared. Attempts to reach out were unsuccessful. Loan is in complete default. Warning to other lenders about this borrower.',
   13375,
   CURRENT_DATE - INTERVAL '5 months',
   true,
   false)
ON CONFLICT DO NOTHING;

-- Update user statistics
UPDATE users SET
  total_loans_borrowed = 2,
  defaulter_flags_count = 2,
  reputation_score = 25.00,
  successful_repayments = 0
WHERE id = '33333333-3333-3333-3333-333333333333';

UPDATE users SET
  total_loans_borrowed = 1,
  successful_repayments = 2,
  reputation_score = 75.00
WHERE id = '44444444-4444-4444-4444-444444444444';

UPDATE users SET
  total_loans_borrowed = 1,
  defaulter_flags_count = 1,
  reputation_score = 35.00,
  successful_repayments = 0
WHERE id = '55555555-5555-5555-5555-555555555555';

UPDATE users SET
  total_loans_lent = 2,
  reputation_score = 80.00
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE users SET
  total_loans_lent = 1,
  reputation_score = 78.00
WHERE id = '22222222-2222-2222-2222-222222222222';

SELECT 'Demo data created successfully' as status;
