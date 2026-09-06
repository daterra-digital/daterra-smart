import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// 1. Cabeçalhos CORS para permitir requisições do browser (PWA / GitHub Pages / Localhost)
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "no-reply@daterra.com.pt";
const SENDER_NAME = Deno.env.get("SENDER_NAME") || "DATERRA Smart";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req: Request) => {
  // 2. Resposta obrigatória ao pedido preflight OPTIONS do browser (CORS)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = performance.now();

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!BREVO_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Configuração incompleta:", {
        hasBrevo: Boolean(BREVO_API_KEY),
        hasUrl: Boolean(SUPABASE_URL),
        hasServiceRole: Boolean(SUPABASE_SERVICE_ROLE_KEY),
      });
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta no Supabase" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. Gerar o OTP de forma segura através do cliente Admin do Supabase
    const cleanEmail = email.trim().toLowerCase();
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: cleanEmail,
    });

    if (linkError) {
      console.error("❌ Erro ao gerar OTP no Supabase Admin:", linkError);
      return new Response(JSON.stringify({ error: linkError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Obter o código OTP gerado
    const otpCode =
      linkData?.properties?.email_otp ||
      linkData?.properties?.hashed_token?.slice(0, 6) ||
      "";

    // 4. Modelo HTML Institucional Oficial DATERRA Smart
    const htmlContent = `<!doctype html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Confirme o seu acesso à DATERRA Smart</title>
</head>

<body style="margin:0; padding:0; background:#f2f2f2; color:#17352f; font-family:Arial, Helvetica, sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; background:#f2f2f2; margin:0; padding:24px 12px;">
    <tr>
      <td align="center">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px; background:#ffffff; border-radius:16px; overflow:hidden;">

          <tr>
            <td style="background:#114037; padding:28px 32px; font-family:Arial, Helvetica, sans-serif;">
              <div style="margin:0; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:22px; line-height:30px; font-weight:700;">
                DATERRA Smart
              </div>

              <div style="margin-top:8px; color:#b9e8c1; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:21px;">
                Ferramentas digitais para uma agricultura mais eficiente
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:32px; font-family:Arial, Helvetica, sans-serif;">

              <div style="margin:0 0 16px; color:#114037; font-family:Arial, Helvetica, sans-serif; font-size:24px; line-height:31px; font-weight:700;">
                Confirme o seu acesso
              </div>

              <div style="margin:0 0 22px; color:#333333; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:25px;">
                Utilize o código abaixo para confirmar o seu email e entrar na DATERRA Smart:
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:18px; background:#f2f2f2; border:2px solid #3ca64c; border-radius:12px; font-family:Arial, Helvetica, sans-serif;">
                    <div style="color:#006633; font-family:Arial, Helvetica, sans-serif; font-size:30px; line-height:36px; font-weight:700; letter-spacing:7px;">
                      ${otpCode}
                    </div>
                  </td>
                </tr>
              </table>

              <div style="margin:24px 0 12px; color:#404040; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:22px;">
                Este código é pessoal, temporário e válido durante 10 minutos.
              </div>

              <div style="margin:0; color:#404040; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:22px;">
                Não partilhe este código com ninguém. Se não solicitou este acesso, pode ignorar esta mensagem.
              </div>

            </td>
          </tr>

          <tr>
            <td style="background:#114037; padding:20px 32px; font-family:Arial, Helvetica, sans-serif;">
              <div style="color:#d9eee0; font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:18px;">
                DATERRA Smart · Divulgamos conhecimento para quem faz a agricultura acontecer.
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;

    // 5. Envio do e-mail via API REST v3 do Brevo
    console.log(`⏱️ [Brevo API] Disparando e-mail transacional para ${cleanEmail}...`);

    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: SENDER_NAME,
          email: SENDER_EMAIL,
        },
        to: [
          {
            email: cleanEmail,
          },
        ],
        subject: `Código de Acesso DATERRA Smart: ${otpCode}`,
        htmlContent: htmlContent,
      }),
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (!brevoResponse.ok) {
      const errorBody = await brevoResponse.text();
      console.error(`❌ [Brevo API Error] Status ${brevoResponse.status}:`, errorBody);
      return new Response(
        JSON.stringify({ error: `Erro no provedor Brevo (${brevoResponse.status})` }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const brevoData = await brevoResponse.json();
    console.log(`✅ [Sucesso] E-mail OTP entregue ao Brevo em ${latencyMs}ms! MessageId: ${brevoData?.messageId || "ok"}`);

    return new Response(
      JSON.stringify({
        success: true,
        latency_ms: latencyMs,
        message_id: brevoData?.messageId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    const errorLatency = Math.round(performance.now() - startTime);
    console.error("❌ [Edge Function Exception]:", err?.message || err);
    return new Response(
      JSON.stringify({
        error: "Erro interno no processamento da Edge Function",
        details: err?.message || String(err),
        latency_ms: errorLatency,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
