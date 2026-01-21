-- Add status column to existing tables for Soft Delete support
-- Default is 1 (Active). 0 will be treated as Deleted.

DO $$
BEGIN
    -- Users Table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE users ADD COLUMN status NUMERIC DEFAULT 1;
    END IF;

    -- Accounts Table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'status') THEN
        ALTER TABLE accounts ADD COLUMN status NUMERIC DEFAULT 1;
    END IF;

    -- Transactions Table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'status') THEN
        ALTER TABLE transactions ADD COLUMN status NUMERIC DEFAULT 1;
    END IF;

    -- User Limits Table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_limits' AND column_name = 'status') THEN
        ALTER TABLE user_limits ADD COLUMN status NUMERIC DEFAULT 1;
    END IF;
END $$;
