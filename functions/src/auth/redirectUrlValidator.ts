/**
 * DATERRA Smart - Validador de URLs de Redirecionamento (SEC-05)
 * Prevenção de Open Redirect e ataques de Phishing no envio do Magic Link
 * (< 200 LOC)
 */

const ALLOWED_ORIGIN_PATTERNS: (string | RegExp)[] = [
  /^https:\/\/smart\.daterra\.com\.pt(\/|$)/i,
  /^https:\/\/daterra-digital\.github\.io(\/|$)/i,
  /^http:\/\/localhost:(3000|4173|5173|5175)(\/|$)/i,
  /^http:\/\/127\.0\.0\.1:(3000|4173|5173|5175)(\/|$)/i
];

export function validateRedirectUrl(urlCandidate?: string, defaultUrl?: string): string {
  const target = (urlCandidate || defaultUrl || '').trim();
  if (!target) {
    throw new Error('URL de redirecionamento ausente.');
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    throw new Error('URL de redirecionamento com sintaxe inválida.');
  }

  // Validação do protocolo: apenas https ou http local
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Protocolo de redirecionamento não permitido.');
  }

  const isAllowed = ALLOWED_ORIGIN_PATTERNS.some((pattern) => {
    if (typeof pattern === 'string') {
      return parsed.origin === pattern;
    }
    return pattern.test(parsed.origin) || pattern.test(target);
  });

  if (!isAllowed) {
    throw new Error(`Domínio de redirecionamento não autorizado: ${parsed.origin}`);
  }

  return target;
}
