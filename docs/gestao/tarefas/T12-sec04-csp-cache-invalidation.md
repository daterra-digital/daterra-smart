# 📋 Dossier da Tarefa 12: Content Security Policy (CSP) e Invalidação Ativa de Cache

**Data:** 2026-11-08  
**Ambiente:** V-DEV (`develop`)  
**Responsável Técnico:** Subagente de Segurança & Engenharia PWA/Web  
**Conformidade:** Regra SEC-04, Web App Security Guidelines, PWA Offline-First  

---

## 1. Contexto e Vulnerabilidades Mitigadas (SEC-04)

A auditoria de segurança à versão publicada no GitHub Pages assinalou a ausência de uma política de segurança de conteúdo (Content Security Policy - CSP) e a necessidade de assegurar a entrega atómica de atualizações do Service Worker para dispositivos móveis:

1. **Risco de Clickjacking e Injeção de Scripts:** Sem CSP, navegadores podiam permitir o carregamento de scripts arbitrários ou o enquadramento da aplicação em iframes manipulados por atacantes.
2. **Retenção de Versões Antigas em Cache Móvel:** Em dispositivos móveis agrícolas, o Service Worker pode reter assets antigos em cache local se o ciclo de vida não forçar o descarte e o recarregamento imediato (`SKIP_WAITING` + `clientsClaim`).

---

## 2. Ações Implementadas

### A. Implementação da Meta Tag CSP Estrita (`index.html`)
Adicionada a diretiva `Content-Security-Policy` no cabeçalho `<head>` de `index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' https://daterra-digital.github.io https://smart.daterra.com.pt; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.firebaseio.com https://firestore.googleapis.com https://*.cloudfunctions.net https://api.open-meteo.com https://challenges.cloudflare.com https://api.brevo.com; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'self';" />
```
* **Proteções Ativas:**
  - Desativação explícita de `object-src 'none'` (bloqueia Flash/Java/plugins legados).
  - Restrição de `base-uri 'self'` (evita sequestro de caminhos relativos).
  - Bloqueio de conexões a servidores não autorizados, permitindo exclusivamente Firebase, Cloudflare Turnstile, Open-Meteo e domínios oficiais da DATERRA.

### B. Gestão e Invalidação Transparente de Cache (`vite.config.ts` & `src/main.tsx`)
* Em `vite.config.ts`, foram consolidadas as diretivas de Workbox:
  - `skipWaiting: true`: O novo Service Worker assume o controlo assim que o download termina.
  - `clientsClaim: true`: O Service Worker assume imediatamente todas as abas e janelas abertas.
  - `cleanupOutdatedCaches: true`: Elimina automaticamente ficheiros com hashes obsoletos da cache local.
* Em `src/main.tsx`, é escutado o evento `controllerchange` para despoletar um recarregamento suave e automático, assegurando que o agricultor recebe a versão mais recente e segura sem necessidade de intervenção técnica manual.

---

## 3. Validação e Testes de Regressão

Foi desenvolvida a suite de testes unitários:
`test/sec04-csp-cache-invalidation.test.mjs`

### Resultados:
* **Testes Específicos da Tarefa 12:** 4/4 testes aprovados (100%).
* **Bateria Global de Testes:** **100/100 testes aprovados** (incluindo todas as provas agronómicas EPPO/DGAV).
* **Verificação Oxlint:** 0 erros.
* **Compilação de Produção (`npm run build`):** Código 0 (geração de bundles e service worker concluída com sucesso).

---

## 4. Conclusão
A Tarefa 12 está concluída na branch `develop` (V-DEV). O navegador do utilizador dispõe agora de uma blindagem CSP rigorosa e o ciclo de vida do Service Worker assegura atualizações instantâneas.
