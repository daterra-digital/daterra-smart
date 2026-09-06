# 📧 Supabase Edge Function: `send-otp`

Documentação oficial e guia de implementação da Edge Function `send-otp` da **DATERRA Smart**.

---

## 1. 📖 Descrição

A Edge Function `send-otp` é responsável pela geração segura e envio de códigos de acesso de uso único (OTP de 6 dígitos) para autenticação *passwordless* na plataforma **DATERRA Smart**.

Esta função substitui o fluxo padrão de e-mails do Supabase GoTrue, permitindo entregas de e-mails transacionais com ultra-baixa latência (< 2 segundos) através da API REST v3 do **Brevo**, além de contornar as restrições de *rate limiting* nativas do endpoint `/auth/v1/otp`.

### 🔄 Fluxo Completo de Execução

```
┌─────────────────────────┐
│ 1. Frontend PWA         │ (Utilizador insere email e resolve Turnstile)
│    src/views/LoginView  │
└────────────┬────────────┘
             │ HTTP POST (supabase.functions.invoke('send-otp'))
             ▼
┌─────────────────────────┐
│ 2. Edge Function        │ • Responde a preflight OPTIONS (CORS)
│    send-otp             │ • Valida payload
└────────────┬────────────┘
             │ Supabase Admin API (generateLink)
             ▼
┌─────────────────────────┐
│ 3. Supabase Auth Admin  │ • Gera código OTP de 6 dígitos
│    (GoTrue Backend)     │ • Regista token temporário com validade de 10 min
└────────────┬────────────┘
             │ Retorna token OTP à Edge Function
             ▼
┌─────────────────────────┐
│ 4. Brevo API v3 (REST)  │ • Recebe HTML institucional formatado
│    api.brevo.com        │ • Assina via DKIM/SPF do domínio daterra.com.pt
└────────────┬────────────┘
             │ Entrega SMTP prioritária
             ▼
┌─────────────────────────┐
│ 5. Caixa de Correio     │ (Utilizador recebe o código em 1-3 segundos)
│    (Gmail / Outlook)    │
└─────────────────────────┘
```

---

## 2. 🔑 Pré-requisitos e Secrets

Para o correto funcionamento da função, as seguintes variáveis de ambiente (*Secrets*) devem estar configuradas no Supabase:

| Secret | Descrição | Onde Obter |
| :--- | :--- | :--- |
| `BREVO_API_KEY` | Chave de API v3 da conta Brevo (`xkeysib-...`) | [Brevo Dashboard > SMTP & API > API Keys](https://app.brevo.com/settings/keys/api) |
| `SUPABASE_URL` | URL base do teu projeto Supabase | [Supabase Dashboard > Project Settings > API](https://supabase.com/dashboard) *(Injetado automaticamente)* |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave secreta de administração (*Service Role Secret*) | [Supabase Dashboard > Project Settings > API](https://supabase.com/dashboard) |
| `SENDER_EMAIL` | Endereço de e-mail verificado no Brevo | `no-reply@daterra.com.pt` (Configurado no Brevo > Senders) |
| `SENDER_NAME` | Nome do remetente apresentado no e-mail | `DATERRA Smart` |

### 📍 Onde Configurar no Supabase Dashboard
1. Acede a **Project Settings** ➔ **Edge Functions**.
2. Na secção **Secrets**, clica em **Add new secret** e adiciona cada uma das variáveis acima.

---

## 3. ⚙️ Configuração e Deploy

### Opção A: Deploy via Supabase Dashboard (Interface Web)
1. Acede a **Edge Functions** no teu Supabase Dashboard.
2. Clica em **New function** com o nome `send-otp`.
3. Cola o código de [`index.ts`](./index.ts).
4. No separador **Settings** da função:
   * **Enforce JWT Verification:** `OFF` ⚠️ *(Essencial para permitir chamadas de utilizadores não autenticados)*.
5. Clica em **Save and Deploy**.

### Opção B: Deploy via Supabase CLI (Linha de Comandos)
```bash
# 1. Login na tua conta Supabase
npx supabase login

# 2. Configuração dos Secrets
npx supabase secrets set BREVO_API_KEY="xkeysib-..." \
  SENDER_EMAIL="no-reply@daterra.com.pt" \
  SENDER_NAME="DATERRA Smart" \
  SUPABASE_SERVICE_ROLE_KEY="eyJh..." \
  --project-ref mmgslirhkpjpagnvkjtn

# 3. Deploy da função sem verificação de JWT
npx supabase functions deploy send-otp --no-verify-jwt --project-ref mmgslirhkpjpagnvkjtn
```

---

## 4. 🧩 Estrutura do Código (`index.ts`)

O código está estruturado em 5 blocos principais:

1. **Cabeçalhos CORS (`corsHeaders`):**
   * Configuração permissiva (`Access-Control-Allow-Origin: *`) com suporte para os cabeçalhos `authorization`, `x-client-info`, `apikey` e `content-type`.
2. **Preflight Handler (`req.method === "OPTIONS"`):**
   * Responde de imediato com `status 200` para permitir que navegadores web completem pedidos *cross-origin*.
3. **Geração Segura de OTP:**
   * Utiliza `supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email })` para criar o código de verificação oficial no GoTrue sem enviar e-mails padrão.
4. **Template HTML Oficial DATERRA Smart:**
   * E-mail responsivo em tabelas HTML com cabeçalho institucional `#114037`, destaque de 30px em verde `#006633` com espaçamento de 7px para os 6 dígitos do OTP, e aviso de validade de 10 minutos.
5. **Integração com a API do Brevo:**
   * Requisição REST direta via `fetch()` para `https://api.brevo.com/v3/smtp/email` com medição de latência (`performance.now()`).

---

## 5. 🧪 Como Testar

### No Frontend (PWA)
1. Inicia o ambiente de desenvolvimento local: `npm run dev` (ou acede ao GitHub Pages / produção).
2. Acede à página de login (`/login`).
3. Introduz um endereço de e-mail válido e submete o formulário.
4. Confirma que a interface avança imediatamente para o ecrã de 6 dígitos.
5. Verifica a tua caixa de correio e insere o código recebido.

### Verificação de Logs no Supabase Dashboard
1. Acede a **Edge Functions** ➔ **`send-otp`** ➔ separador **Logs** (ou **Invocations**).
2. Procura pelas entradas:
   * `⏱️ [Brevo API] Disparando e-mail transacional...`
   * `✅ [Sucesso] E-mail OTP entregue ao Brevo em Xms! MessageId: ...`

---

## 6. 🛠️ Troubleshooting (Resolução de Problemas)

### Erro `"Failed to request edge functions"` (ou `FunctionsFetchError`)
* **Causa 1:** A função não foi criada ou o nome está diferente de `send-otp`.
* **Causa 2:** A opção **Enforce JWT Verification** está ativa (`ON`), bloqueando utilizadores anónimos. Faz redeploy com `--no-verify-jwt`.
* **Causa 3:** O handler de `OPTIONS` (CORS) foi removido ou está a responder com erro.

### Erro `404 Not Found: "Requested function was not found"`
* A Edge Function não foi publicada no projeto Supabase ativo. Executa o deploy conforme a Secção 3.

### Erro `401 / 403` da API do Brevo
* Verifica se o secret `BREVO_API_KEY` está correto no Supabase Dashboard.
* Confirma se o e-mail de remetente (`no-reply@daterra.com.pt`) está validado no Brevo em **Senders & IP ➔ Senders**.

### E-mail Demora a Chegar ou Não É Entregue
* **Greylisting no Gmail / Outlook:** Confirma que os registos **SPF, DKIM e DMARC** estão configurados e validados no painel do Brevo para o domínio `daterra.com.pt`.
* **Pasta de SPAM:** Verifica a pasta de lixo eletrónico/spam na primeira entrega e marca como "Não é spam".

---

## 7. 🔒 Notas de Segurança

* **Proteção de Secrets:** Nunca incluas a `BREVO_API_KEY` ou a `SUPABASE_SERVICE_ROLE_KEY` em ficheiros commitados no Git ou no código do frontend.
* **Ambiente Local:** Utiliza `.env.local` para variáveis públicas do Vite (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_TURNSTILE_SITE_KEY`).
* **Proteção Anti-Bot:** O frontend integra o **Cloudflare Turnstile** para evitar ataques de força bruta e envio abusivo de e-mails.
* **Cooldown de Reenvio:** O frontend impõe um temporizador de segurança de 60 segundos antes de permitir novo pedido para o mesmo e-mail.

---

## 8. 📚 Referências e Links Úteis

* [Documentação Oficial do Supabase Edge Functions](https://supabase.com/docs/guides/functions)
* [Referência da API v3 do Brevo (Transactional Emails)](https://developers.brevo.com/reference/sendtransacemail)
* [Código Fonte da Função (`index.ts`)](./index.ts)
* [Contexto de Autenticação do Frontend (`AuthContext.tsx`)](../../src/context/AuthContext.tsx)
