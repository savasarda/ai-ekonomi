-- Drop color column from users table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'color') THEN
        ALTER TABLE users DROP COLUMN color;
    END IF;
END $$;
