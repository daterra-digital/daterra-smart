# Procedimento Operacional de Deploy em Produção (cPanel)
**DATERRA Smart | Guia de Publicação PWA, Segurança e Validação Pós-Deploy**

- **Data de Emissão:** 06 de Setembro de 2026  
- **Estado:** `Aprovado para Execução Pós-Ronda 1`  
- **Versão:** 1.0.0  
- **Alvo:** Servidor Web Apache / cPanel DATERRA Smart  
- **Responsável:** Equipa de DevOps & Engenharia de Software  

---

## 1. Verificações Pré-Deploy no Ambiente Local

Antes de qualquer ação de empacotamento ou transferência para o servidor, devem ser executadas e validadas as seguintes etapas locais:

```powershell
# 1. Validação estática de linter
npm.cmd run lint

# 2. Execução da suíte completa de testes automatizados (463 testes)
node --test test/*.test.mjs

# 3. Compilação e geração do pacote de produção (Vite + TypeScript)
npm.cmd run build
```

### Critérios de Aceitação Local:
- [ ] `oxlint` concluído com $0$ erros impeditivos;
- [ ] Suíte de testes com **463 testes aprovados ($100\%$ pass)**;
- [ ] Pasta `dist/` gerada com sucesso contendo `index.html`, `registerSW.js`, `manifest.webmanifest`, `sw.js`, `workbox-*.js` e pasta `assets/`;
- [ ] **Auditoria de Segurança:** Nenhuma chave secreta (`API_SECRET`, `PRIVATE_KEY`, tokens administrativos) presente no código fonte cliente ou ficheiros estáticos gerados.

---

## 2. Configuração do Servidor Web (`.htaccess` para cPanel / Apache)

Para garantir o roteamento SPA, instalação de Service Worker PWA, cabeçalhos de segurança e políticas de cache corretas, o ficheiro `.htaccess` na raiz do diretório de publicação (`public_html/`) deve conter a seguinte configuração:

```apache
# ==============================================================================
# DATERRA Smart — Configuração Oficial .htaccess (PWA / SPA / Apache cPanel)
# ==============================================================================

# 1. Forçar Conexão Segura HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 2. Tipos MIME Corretos para PWA e Módulos Modernos
<IfModule mod_mime.c>
  AddType application/manifest+json .webmanifest
  AddType application/javascript .js .mjs
  AddType image/svg+xml .svg
  AddType font/woff2 .woff2
</IfModule>

# 3. Cabeçalhos de Segurança HTTP
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
</IfModule>

# 4. Políticas de Cache Inteligente para PWA
<IfModule mod_expires.c>
  ExpiresActive On

  # Ficheiros estáticos com hash no nome (Cache imutável de 1 ano)
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"

  # HTML, Manifesto e Service Worker NUNCA devem ficar em cache HTTP persistente
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType application/manifest+json "access plus 0 seconds"
</IfModule>

<IfModule mod_headers.c>
  # Garantir no-cache para o Service Worker e ficheiros de entrada
  <FilesMatch "\.(html|webmanifest)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
  </FilesMatch>

  <FilesMatch "^(sw|registerSW)\.js$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
  </FilesMatch>

  # Cache imutável para a pasta assets
  <FilesMatch "\.(css|js|woff2|png|svg)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>

# 5. Roteamento SPA (Single Page Application)
# Redireciona todas as rotas virtuais não existentes para o index.html
<IfModule mod_rewrite.c>
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# 6. Compressão Gzip / Brotli
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json image/svg+xml
</IfModule>
```

---

## 3. Procedimento Operacional de Upload (Passo a Passo)

1. **Backup da Versão Anterior:**
   - No cPanel File Manager, aceder a `public_html/`;
   - Compactar o conteúdo existente para `backup_anteriores/daterra_smart_backup_YYYYMMDD_HHMM.zip`.
2. **Transferência dos Novos Ficheiros:**
   - Compactar localmente a pasta `dist/` gerada no build (`dist.zip`);
   - Efetuar upload de `dist.zip` para `public_html/` via cPanel File Manager ou SFTP seguro;
   - Extrair os ficheiros diretamente na raiz de `public_html/`;
   - Eliminar o ficheiro `dist.zip` após extração.
3. **Verificação de Permissões:**
   - Confirmar que as pastas têm permissão `755` (`drwxr-xr-x`);
   - Confirmar que os ficheiros têm permissão `644` (`-rw-r--r--`).
4. **Colocação do `.htaccess`:**
   - Assegurar que o ficheiro `.htaccess` configurado está ativo na raiz de `public_html/`.

---

## 4. Checklist de Testes Pós-Deploy em Produção (Smoke Tests)

Imediatamente após a conclusão do upload, o responsável técnico deve validar os seguintes pontos no domínio de produção:

| # | Item de Teste | Ação de Validação | Resultado Esperado | Estado |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Conectividade HTTPS** | Aceder por `http://` no navegador | Redirecionamento automático 301 para `https://` com cadeado SSL válido | [ ] |
| **2** | **Carregamento SPA** | Aceder a `/ferramentas/eppo` diretamente | A página carrega sem erro 404 Apache | [ ] |
| **3** | **Registo Service Worker** | Inspecionar no Chrome DevTools (`Application > Service Workers`) | Service Worker ativo e a correr sem erros | [ ] |
| **4** | **Instalação PWA** | Abrir no Android (Chrome) e iOS (Safari) | Banner/Prompt de instalação operacional | [ ] |
| **5** | **Funcionamento Offline** | Ativar modo de avião e navegar pelas calculadoras | Aplicação funciona fluidamente em cache | [ ] |
| **6** | **Persistência IndexedDB** | Executar cálculo e acionar `[ Guardar no Histórico ]` | Cálculo gravado em `calculation_history_v2` e persistido após refresh | [ ] |
| **7** | **Internacionalização** | Alternar entre os 8 idiomas disponíveis | Rótulos traduzidos com precisão e zero termos "cuba" em PT/BR | [ ] |
| **8** | **Calculadoras do Ecossistema** | Testar cálculo em cada uma das 8 calculadoras ativas | Resultados imediatos em conformidade com as normas oficiais | [ ] |

---

## 5. Plano de Rollback e Contingência

Caso seja detetada qualquer anomalia crítica durante os testes pós-deploy (ex: falha de carregamento do bundle, erro 500 de servidor ou bloqueio de Service Worker):

1. **Ativação Imediata do Rollback:**
   - No cPanel File Manager, mover os ficheiros corrompidos para uma pasta temporária `_quarantine/`;
   - Restaurar o backup `backup_anteriores/daterra_smart_backup_YYYYMMDD_HHMM.zip` diretamente em `public_html/`;
   - Limpar a cache do servidor web (se aplicável via cPanel / Cloudflare).
2. **Tempo Máximo Estimado de Restauração (RTO):** $< 5\text{ minutos}$.
3. **Comunicação:** Notificar a equipa técnica para análise dos logs de erro do Apache (`error_log`).

---

## 6. Agendamento e Responsabilidades

- **Janela Recomendada de Deploy:** Período de baixo tráfego agrícola (ex: Terça ou Quarta-feira, entre as 21:00 e as 23:00 WET).
- **Equipa Responsável:**
  - *Líder de Deploy / DevOps:* Gestão de ficheiros, `.htaccess` e upload;
  - *Responsável de QA / UX:* Execução da checklist de smoke tests em múltiplos dispositivos;
  - *Aprovador Final:* Engenheiro Agrónomo / Diretor de Projeto.
