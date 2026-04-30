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
    // 1. Supabase Client oluştur (Service Role Key ile RLS atlamak için)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

    // Bütün aileleri çek
    const { data: families, error: famErr } = await supabase.from('families').select('id, name')
    if (famErr) throw famErr

    let totalNotificationsSent = 0;

    for (const family of families) {
      const familyId = family.id

      // Ailenin sanal kullanıcılarını (bütçe sahiplerini) çek
      const { data: users } = await supabase.from('users').select('id, name').eq('family_id', familyId).neq('status', 0)
      if (!users || users.length === 0) continue

      // Ailenin limitlerini çek
      const { data: limits } = await supabase.from('user_limits').select('user_id, limit_amount').eq('family_id', familyId)
      if (!limits || limits.length === 0) continue

      // Ailenin hesaplarını çek (hangi işlem kime ait bulmak için)
      const { data: accounts } = await supabase.from('accounts').select('id, user_id').eq('family_id', familyId).neq('status', 0)
      if (!accounts) continue

      // Ailenin bu ayki aktif işlemlerini çek
      const { data: transactions } = await supabase
        .from('transactions')
        .select('account_id, amount')
        .eq('family_id', familyId)
        .eq('status', 1)
        .like('date', `${currentMonth}%`)

      if (!transactions) continue

      // Her kullanıcının limit hesaplamasını yap
      let summaryTextParts = []

      for (const user of users) {
        const userLimit = limits.find(l => l.user_id === user.id)?.limit_amount || 0
        if (userLimit <= 0) continue // Limiti olmayanları atla

        // Kullanıcının hesaplarını bul
        const userAccountIds = accounts.filter(a => a.user_id === user.id).map(a => a.id)
        
        // Kullanıcının bu ayki toplam harcamasını hesapla
        const spent = transactions
          .filter(t => userAccountIds.includes(t.account_id))
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const remaining = userLimit - spent

        // Formatla
        const formatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })
        summaryTextParts.push(`${user.name}: ${formatter.format(remaining)} kaldı`)
      }

      if (summaryTextParts.length === 0) continue

      const messageBody = summaryTextParts.join('\n')
      const title = "Aylık Bütçe Durumu"

      // Ailedeki token'ları bul
      const { data: profiles } = await supabase
        .from('profiles')
        .select('fcm_token')
        .eq('family_id', familyId)
        .not('fcm_token', 'is', null)

      if (!profiles || profiles.length === 0) continue

      const tokens = [...new Set(profiles.map(p => p.fcm_token))]
      
      // Bildirimleri gönder
      const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || '{}')
      const accessToken = await getGoogleAccessToken(serviceAccount)

      for (const token of tokens) {
        await sendFCMNotification(token as string, title, messageBody, accessToken, serviceAccount.project_id)
        totalNotificationsSent++;
      }
    }

    return new Response(JSON.stringify({ success: true, message: `Toplam ${totalNotificationsSent} bildirim gönderildi.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("Limit cron error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

// --- FIREBASE HELPER FUNCTIONS ---

async function getGoogleAccessToken(serviceAccount: any) {
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
  if (!pem) throw new Error("Firebase Private Key eksik!")
  const base64 = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, "")
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0))
}
