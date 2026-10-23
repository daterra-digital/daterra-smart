import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const BREVO_API_KEY = process.env.BREVO_API_KEY || 'STUB_BREVO_API_KEY_CONFIGURAR_NO_FIREBASE';
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'no-reply@daterra.com.pt';
const SENDER_NAME = process.env.SENDER_NAME || 'DATERRA Smart';
const DEFAULT_APP_URL = process.env.APP_URL || 'http://localhost:5173/daterra-smart/login';

/**
 * Template HTML oficial DATERRA Smart com a tag {{MAGIC_LINK}}.
 */
const MAGIC_LINK_HTML_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .header { background-color: #174235; padding: 30px 20px; color: #ffffff; }
  .header h1 { margin: 0; font-size: 24px; }
  .header p { margin: 5px 0 0; font-size: 14px; color: #a3c4b8; }
  .content { padding: 40px 30px; text-align: left; }
  .content h2 { color: #174235; font-size: 22px; margin-top: 0; }
  .content p { color: #4a4a4a; font-size: 16px; line-height: 1.5; }
  .button-container { text-align: center; margin: 40px 0; }
  .action-button { background-color: #f4f4f4; color: #174235; text-decoration: none; padding: 15px 30px; font-size: 24px; font-weight: bold; border: 2px solid #28a745; border-radius: 8px; display: inline-block; letter-spacing: 1px; }
  .footer { background-color: #174235; padding: 20px; text-align: left; color: #ffffff; font-size: 12px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DATERRA Smart</h1>
      <p>Ferramentas digitais para uma agricultura mais eficiente</p>
    </div>
    <div class="content">
      <h2>Confirme o seu acesso</h2>
      <p>Utilize o botão abaixo para confirmar o seu email e entrar na DATERRA Smart:</p>
      <div class="button-container">
        <a href="{{MAGIC_LINK}}" class="action-button">Entrar na DATERRA Smart</a>
      </div>
      <p style="font-size: 14px; color: #666;">Este link é pessoal, temporário e válido durante 10 minutos.</p>
      <p style="font-size: 14px; color: #666;">Não partilhe este link com ninguém. Se não solicitou este acesso, pode ignorar esta mensagem.</p>
    </div>
    <div class="footer">
      DATERRA Smart - Divulgamos conhecimento para quem faz a agricultura acontecer.
    </div>
  </div>
</body>
</html>`;

interface SendCustomMagicLinkPayload {
  email?: string;
  redirectUrl?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export const sendCustomMagicLink = onCall(
  { cors: true, region: 'us-central1' },
  async (request) => {
    const data = (request.data || {}) as SendCustomMagicLinkPayload;
    const cleanEmail = (data.email || '').trim().toLowerCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new HttpsError('invalid-argument', 'Por favor introduza um endereço de e-mail válido.');
    }

    const targetContinueUrl = data.redirectUrl || DEFAULT_APP_URL;

    try {
      // 1. Gerar o link oficial de autenticação via Firebase Admin SDK
      const actionCodeSettings: admin.auth.ActionCodeSettings = {
        url: targetContinueUrl,
        handleCodeInApp: true
      };

      const magicLink = await admin
        .auth()
        .generateSignInWithEmailLink(cleanEmail, actionCodeSettings);

      // 2. Injetar a tag {{MAGIC_LINK}} no template HTML
      const htmlContent = MAGIC_LINK_HTML_TEMPLATE.replace(/\{\{MAGIC_LINK\}\}/g, magicLink);

      // 3. Disparar o e-mail transacional via API REST v3 do Brevo
      const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: SENDER_NAME,
            email: SENDER_EMAIL
          },
          to: [
            {
              email: cleanEmail,
              ...(data.firstName ? { name: `${data.firstName} ${data.lastName || ''}`.trim() } : {})
            }
          ],
          subject: 'O seu link de acesso à DATERRA Smart',
          htmlContent
        })
      });

      if (!brevoResponse.ok) {
        const errBody = await brevoResponse.text();
        console.error('[sendCustomMagicLink] Erro na API Brevo:', brevoResponse.status, errBody);
        throw new HttpsError(
          'internal',
          `Erro ao enviar o e-mail pelo provedor Brevo (${brevoResponse.status}).`
        );
      }

      const brevoResult = (await brevoResponse.json()) as { messageId?: string };

      return {
        success: true,
        messageId: brevoResult?.messageId || 'ok'
      };
    } catch (err: any) {
      console.error('[sendCustomMagicLink] Exceção:', err);
      if (err instanceof HttpsError) {
        throw err;
      }
      throw new HttpsError(
        'internal',
        err?.message || 'Não foi possível gerar ou enviar o link de acesso.'
      );
    }
  }
);
