-- Drop existing foreign key if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reminders_business_card_id_fkey'
  ) THEN
    ALTER TABLE reminders DROP CONSTRAINT reminders_business_card_id_fkey;
  END IF;
END $$;

-- Re-add the foreign key with correct reference
ALTER TABLE reminders
ADD CONSTRAINT reminders_business_card_id_fkey 
FOREIGN KEY (business_card_id) 
REFERENCES business_cards(id) 
ON DELETE SET NULL;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';