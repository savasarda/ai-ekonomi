-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'suggestion', -- suggestion, bug, other
    user_contact TEXT, -- Optional: email or name
    status INTEGER DEFAULT 1 -- 1: new, 2: reviewed, 3: implemented
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public feedback)
CREATE POLICY "Enable insert for everyone" ON public.feedback FOR INSERT WITH CHECK (true);

-- Allow only authenticated/admin users to view (optional, strict by default)
-- For now, we might want to allow reading for debugging or restrict it.
-- Let's stick to insert-only for public users.
