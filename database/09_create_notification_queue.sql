-- Bildirim kuyruğu tablosu
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, sent, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sadece aile yöneticileri bu tabloya ekleme yapabilsin
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can insert notifications" ON notification_queue
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT created_by FROM families WHERE id = family_id
        )
    );

CREATE POLICY "Admins can view their own queue" ON notification_queue
    FOR SELECT USING (
        auth.uid() IN (
            SELECT created_by FROM families WHERE id = family_id
        )
    );
