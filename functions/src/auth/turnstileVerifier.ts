/**
 * DATERRA Smart - Verificador de Desafios Cloudflare Turnstile (SEC-03)
 * Prevenção de bots, spam de e-mails e exaustão de quota Brevo
 * (< 200 LOC)
 */

export interface TurnstileVerificationResult {
  success: boolean;
  error?: string;
}

export async function verifyTurnstileToken(
  token?: string,
  remoteIp?: string,
  secretKeyOverride?: string
): Promise<TurnstileVerificationResult> {
  const secretKey = secretKeyOverride || process.env.TURNSTILE_SECRET_KEY;

  // Em ambiente de teste ou emulador sem chave secreta definida, permite modo controlado
  if (!secretKey || secretKey === 'STUB_TURNSTILE_SECRET' || secretKey.trim() === '') {
    if (process.env.NODE_ENV === 'test' || process.env.FUNCTIONS_EMULATOR === 'true') {
      return { success: true };
    }
    console.warn('[Turnstile] TURNSTILE_SECRET_KEY não configurada no ambiente. Validação ignorada em modo permissivo.');
    return { success: true };
  }

  if (!token || token.trim() === '') {
    return {
      success: false,
      error: 'Validação de segurança anti-robô obrigatória. Por favor complete o desafio.'
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token.trim());
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Erro de comunicação com o serviço Turnstile (código ${response.status}).`
      };
    }

    const data = (await response.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (!data.success) {
      const errorCodes = (data['error-codes'] || []).join(', ');
      console.warn('[Turnstile] Desafio falhou:', errorCodes);
      return {
        success: false,
        error: 'Verificação anti-robô falhou ou expirou. Por favor tente novamente.'
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Turnstile] Exceção na chamada Turnstile:', err);
    return {
      success: false,
      error: err?.message || 'Erro inesperado na validação anti-robô.'
    };
  }
}
