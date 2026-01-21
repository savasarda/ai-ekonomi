-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT
);

-- 2. Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "limit" NUMERIC DEFAULT 20000
);

-- 3. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL
);

-- 4. User Limits Table
CREATE TABLE IF NOT EXISTS user_limits (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    limit_amount NUMERIC NOT NULL
);

-- Enable Row Level Security (RLS) - FOR NOW, we enable all access for simplicity in testing
-- Note: In production, you should restrict this to authenticated users.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON user_limits FOR ALL USING (true) WITH CHECK (true);
