-- 1. pg_net eklentisini aktif et (HTTP istekleri atabilmek için)
create extension if not exists pg_net;

-- 2. Eski varsa sil (çakışmayı önlemek için)
select cron.unschedule('limit-reminders-job');

-- 3. Her ayın 15'inde sabah 10:00'da çalışacak Cron Job oluştur (Zaman dilimi UTC olduğu için 07:00 yazıyoruz ki TR saati ile 10:00 olsun)
select
  cron.schedule(
    'limit-reminders-job',
    '0 7 15 * *', -- Dakika(0) Saat(7) Gün(15) Ay(*) HaftaGünü(*)
    $$
    select
      net.http_post(
          url:='https://hxmvdgjumbyarikkvuco.supabase.co/functions/v1/limit-reminders',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer AYARLANACAK"}'::jsonb
      )
    $$
  );
