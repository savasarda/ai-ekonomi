-- Drop limit column from accounts table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'limit') THEN
        ALTER TABLE accounts DROP COLUMN "limit";
    END IF;
END $$;
