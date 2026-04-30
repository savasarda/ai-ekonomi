import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Webhook'tan gelen veriyi al
    const payload = await req.json()
    const { record } = payload
    const { title, message, family_id } = record

    // 1. O aileye ait tüm FCM Token'ları çek
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('fcm_token')
      .eq('family_id', family_id)
      .not('fcm_token', 'is', null)

    if (pErr) throw pErr
    const tokens = profiles.map(p => p.fcm_token)

    if (tokens.length === 0) {
      return new Response(JSON.stringify({ message: 'Gönderilecek cihaz bulunamadı.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 2. Firebase Service Account'u al
    const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || '{}')
    
    // 3. Google OAuth2 Token Al (FCM v1 API için)
    const accessToken = await getGoogleAccessToken(serviceAccount)

    // 4. Her bir token için bildirimi gönder
    const results = await Promise.all(tokens.map(token => 
      sendFCMNotification(token, title, message, accessToken, serviceAccount.project_id)
    ))

    // 5. Durumu güncelle (Opsiyonel)
    await supabase
      .from('notification_queue')
      .update({ status: 'sent' })
      .eq('id', record.id)

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

async function getGoogleAccessToken(serviceAccount: any) {
  // Basitlik için bir kütüphane yerine manuel JWT oluşturma mantığı veya 
  // Supabase topluluğunun önerdiği bir yardımcı kullanılabilir.
  // Burada standart bir OAuth akışı simüle edilmiştir.
  // Not: Gerçek uygulamada 'google-auth-library' gibi bir paket tercih edilebilir.
  
  const header = b64(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 3600
  const claim = b64(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: serviceAccount.token_uri,
    exp,
    iat
  }))

  const msg = `${header}.${claim}`
  const signature = await crypto.subtle.importKey(
    "pkcs8",
    pemToBinary(serviceAccount.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  ).then(key => crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(msg)))

  const jwt = `${msg}.${b64(new Uint8Array(signature))}`

  const res = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  })
  const data = await res.json()
  return data.access_token
}

async function sendFCMNotification(token: string, title: string, body: string, accessToken: string, projectId: string) {
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: {
        token,
        notification: { title, body },
        webpush: {
            fcm_options: {
                link: "https://ai-ekonomi.netlify.app"
            }
        }
      }
    })
  })
  return res.json()
}

function b64(str: any) {
  const binary = typeof str === 'string' ? new TextEncoder().encode(str) : str
  return btoa(String.fromCharCode(...binary)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function pemToBinary(pem: string) {
  const base64 = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, "")
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0))
}
