import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import { verifyTurnstileToken } from './auth/turnstileVerifier';
import { checkAuthRateLimit, cleanupExpiredAuthRateLimits } from './auth/rateLimiter';
import { validateRedirectUrl } from './auth/redirectUrlValidator';
import { handleDeleteUserAccount, processPendingAccountDeletions } from './auth/accountDeletion';

if (!admin.apps.length) {
  admin.initializeApp();
}

const BREVO_API_KEY = process.env.BREVO_API_KEY || 'STUB_BREVO_API_KEY_CONFIGURAR_NO_FIREBASE';
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'no-reply@daterra.com.pt';
const SENDER_NAME = process.env.SENDER_NAME || 'DATERRA Smart';
const DEFAULT_APP_URL = process.env.APP_URL || 'http://localhost:5173/daterra-smart/login';

const MAGIC_LINK_HTML_TEMPLATE = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background-color:#f4f4f4;margin:0;padding:20px}
.container{max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden}
.header{background-color:#174235;padding:25px 20px;color:#ffffff}.header h1{margin:0;font-size:22px}
.content{padding:30px 20px}.action-button{background-color:#f4f4f4;color:#174235;padding:12px 24px;font-size:20px;font-weight:bold;border:2px solid #28a745;border-radius:8px;text-decoration:none;display:inline-block}
.footer{background-color:#174235;padding:15px;color:#ffffff;font-size:12px}
</style></head><body><div class="container"><div class="header"><h1>DATERRA Smart</h1><p>Agricultura eficiente</p></div>
<div class="content"><h2>Confirme o seu acesso</h2><p>Utilize o botão abaixo para entrar na DATERRA Smart:</p>
<div style="text-align:center;margin:30px 0"><a href="{{MAGIC_LINK}}" class="action-button">Entrar na DATERRA Smart</a></div>
<p style="font-size:13px;color:#666">Link válido durante 10 minutos. Não partilhe com ninguém.</p></div>
<div class="footer">DATERRA Smart — Divulgamos conhecimento para quem faz a agricultura acontecer.</div></div></body></html>`;

interface SendCustomMagicLinkPayload {
  email?: string;
  redirectUrl?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  captchaToken?: string;
}

export const sendCustomMagicLink = onCall(
  {
    enforceAppCheck: false,
    timeoutSeconds: 60,
    memory: '256MiB'
  },
  async (request) => {
    const rawIp =
      (request.rawRequest?.headers?.['cf-connecting-ip'] as string) ||
      (request.rawRequest?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.rawRequest?.socket?.remoteAddress ||
      'unknown-ip';

    const clientIp = rawIp.replace(/^::ffff:/, '').trim() || 'unknown-ip';
    const data = (request.data || {}) as SendCustomMagicLinkPayload;

    if (!data.email || typeof data.email !== 'string') {
      throw new HttpsError('invalid-argument', 'O parâmetro email é obrigatório.');
    }
    const cleanEmail = data.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new HttpsError('invalid-argument', 'Formato de e-mail inválido.');
    }

    await checkAuthRateLimit(clientIp, cleanEmail);

    const captchaToken = data.captchaToken;
    if (!captchaToken || typeof captchaToken !== 'string') {
      throw new HttpsError('permission-denied', 'Token de verificação humana não fornecido.');
    }
    const isCaptchaValid = await verifyTurnstileToken(captchaToken, clientIp);
    if (!isCaptchaValid || isCaptchaValid.success !== true) {
      console.warn('[sendCustomMagicLink] Turnstile rejeitado para IP:', clientIp, isCaptchaValid?.error);
      throw new HttpsError('permission-denied', 'Falha na verificação de segurança (Turnstile inválido ou expirado).');
    }

    const targetUrl = data.redirectUrl || DEFAULT_APP_URL;
    const validatedRedirectUrl = validateRedirectUrl(targetUrl);

    try {
      const actionCodeSettings = {
        url: validatedRedirectUrl,
        handleCodeInApp: true
      };
      const magicLink = await admin.auth().generateSignInWithEmailLink(cleanEmail, actionCodeSettings);
      const htmlContent = MAGIC_LINK_HTML_TEMPLATE.replace('{{MAGIC_LINK}}', magicLink);

      const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          sender: { email: SENDER_EMAIL, name: SENDER_NAME },
          to: [{ email: cleanEmail, ...(data.firstName ? { name: `${data.firstName} ${data.lastName || ''}`.trim() } : {}) }],
          subject: 'O seu link de acesso à DATERRA Smart',
          htmlContent
        })
      });

      if (!brevoResponse.ok) {
        const errBody = await brevoResponse.text();
        console.error('[sendCustomMagicLink] Erro na API Brevo:', brevoResponse.status, errBody);
        throw new HttpsError('internal', 'Não foi possível gerar ou enviar o link de acesso.');
      }

      const brevoResult = (await brevoResponse.json()) as { messageId?: string };
      return { success: true, messageId: brevoResult?.messageId || 'ok' };
    } catch (err: any) {
      console.error('[sendCustomMagicLink] Exceção:', err);
      if (err instanceof HttpsError) throw err;
      throw new HttpsError('internal', 'Não foi possível gerar ou enviar o link de acesso.');
    }
  }
);

/**
 * Função Autenticada para Cumprimento do Art. 17º do RGPD (Direito ao Apagamento)
 * Timeout estrito de 120s para acomodar operações paginadas com checkpoints.
 */
export const deleteUserAccount = onCall(
  { enforceAppCheck: false, timeoutSeconds: 120 },
  async (request) => {
    return handleDeleteUserAccount(request);
  }
);

/**
 * Retoma Agendada de Operações de Eliminação (Cloud Scheduler)
 * Executa a cada 30 min com timeout de 300s e instância única (maxInstances: 1).
 */
export const scheduledAccountDeletionRetries = onSchedule(
  { schedule: 'every 30 minutes', timeoutSeconds: 300, maxInstances: 1 },
  async () => {
    await processPendingAccountDeletions();
  }
);

/**
 * Limpeza Agendada de Rate Limits Expirados (Cloud Scheduler)
 * Purga documentos de _auth_rate_limits com retenção ultrapassada (> 24h).
 */
export const scheduledAuthRateLimitCleanup = onSchedule(
  { schedule: 'every 30 minutes', timeoutSeconds: 120, maxInstances: 1 },
  async () => {
    await cleanupExpiredAuthRateLimits();
  }
);
