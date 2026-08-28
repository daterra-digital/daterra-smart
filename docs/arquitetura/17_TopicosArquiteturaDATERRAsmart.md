Ponto 1. Mapa de rotas final

Grupo (marketing)
/ — Landing page (marketing).
/academia — Apresentação da Academia DATERRA (link para Moodle público).
/sobre — Institucional.
/contactos — Formulário / contactos.

Política de privacidade e termos: usa https://daterra.com.pt/politica-de-privacidade/ (link externo).

Grupo (auth)
/login
/registo (email + OTP)
/registo/sso (LinkedIn, Facebook)
/recuperar-senha / OTP flows
/verificar-email

Grupo (app) — autenticado
/dashboard
/ferramentas
/ferramentas/[slug]
/historico
/biblioteca
/biblioteca/culturas
/biblioteca/equipamentos
/biblioteca/bicos
/biblioteca/calibracao
/biblioteca/documentos (artigos / PDFs individuais)
/assistente
/definicoes
/definicoes/perfil
/definicoes/conta
/definicoes/preferencias
/definicoes/notificacoes
/definicoes/dados
/definicoes/suporte
/definicoes/sobre
/sincronizacao
/perfil (alternativa direta ao perfil do utilizador)

Grupo (admin)
/admin
/admin/utilizadores
/admin/planos
/admin/modulos
/admin/documentos
/admin/publicidade
/admin/pedidos-moodle
/admin/assistente-ia
/admin/logs

Notas:
O grupo (legal) fica reduzido porque a política/termos apontam para o site institucional; mantemos páginas legais locais só se necessário.
URLs usam Portuguese-friendly slugs (ex.: /definicoes, /biblioteca) para consistência com público alvo em Portugal.
Referências: Next.js App Router file conventions e route groups (usa-se route groups para organizar layouts sem expor pasta no URL) e boas práticas de project structure.
Estrutura de pastas final (pronta para documento técnico)
Sugestão de pasta inicial no repositório (Next.js App Router):

app/
(marketing)/
layout.tsx
page.tsx
academia/page.tsx
sobre/page.tsx
contactos/page.tsx

(auth)/
layout.tsx
login/page.tsx
registo/page.tsx
registo/sso/page.tsx
recuperar-senha/page.tsx

(app)/
layout.tsx
dashboard/page.tsx

ferramentas/
layout.tsx
page.tsx
[slug]/page.tsx
historico/page.tsx

biblioteca/
layout.tsx
culturas/page.tsx
equipamentos/page.tsx
bicos/page.tsx
calibracao/page.tsx
documentos/[id]/page.tsx
assistente/page.tsx

definicoes/
layout.tsx
perfil/page.tsx
conta/page.tsx
preferencias/page.tsx
notificacoes/page.tsx
dados/page.tsx
suporte/page.tsx
sobre/page.tsx
sincronizacao/page.tsx
perfil/page.tsx

(admin)/
layout.tsx
page.tsx
utilizadores/page.tsx
planos/page.tsx
modulos/page.tsx
documentos/page.tsx
publicidade/page.tsx
pedidos-moodle/page.tsx
assistente-ia/page.tsx
logs/page.tsx
globals.css
layout.tsx (root, shared meta)
components/

ui/
Header.tsx
Footer.tsx
Card.tsx
Modal.tsx
UnitValue.tsx
DidacticHelp.tsx

features/
auth/
dashboard/
ferramentas/
biblioteca/
admin/
lib/
supabaseClient.ts
conversionEngine.ts
hooks/
useAuth.ts
useSync.ts

services/
api/
pdfGenerator/
ia/
store/
zustandPersist.ts

types/
index.d.ts

public/
images/
logos/
scripts/
README.md

Justificação técnica: esta organização segue a recomendação do App Router de usar layouts aninhados, route groups e separar UI de features; facilita ter layouts diferentes por grupo e manter lógica de servidor/cliente clara.
Convenções e regras práticas (curtas)
Layouts por grupo: cada route group tem layout próprio para temas, header/menus e regras de UI.
Componentes UI (no folder components/ui) são atómicos e independentes do domínio.
Features agruparam a lógica e testes relacionados (ex.: features/ferramentas).
Use Server Components para dados não interativos e Client Components apenas onde há interatividade (hooks, estado, eventos).
Páginas administrativas verificam papel do utilizador via Supabase RLS + middleware (segurança dupla).

====

Ponto 2. Modelo de dados do Supabase

A lógica correta para o teu projeto fica assim:
auth.users continua a ser a base de autenticação do Supabase.
public.users passa a ser a tabela principal de perfil do utilizador.
plans guarda os planos comerciais.
subscriptions guarda o estado operacional e histórico de acesso.
Tabelas próprias para módulos, histórico, notas, Moodle, conteúdos, publicidade e logs completam o sistema.

Esta separação é mais limpa do que tentar enfiar tudo numa única tabela, e é especialmente adequada para um SaaS modular com plano free, premium manual e futura automação.

Estrutura final das tabelas
1. users
Tabela principal do perfil do utilizador, ligada a auth.users.

Campos:
id uuid, chave primária e FK para auth.users.id.
first_name.
last_name.
entity.
email.
role.
status.
created_at.
updated_at.

2. plans
Tabela dos planos comerciais.

Campos:
id.
name.
slug.
price.
billing_cycle.
is_active.
features_json.
created_at.
updated_at.

3. subscriptions
Tabela do estado de acesso e histórico operacional do plano.

Campos:
id.
user_id.
plan_id.
access_state.
manual_approval_required.
starts_at.
ends_at.
approved_by.
approved_at.
created_at.
updated_at.

Estados possíveis:
free;
premium pendente;
premium ativo;
premium suspenso;
premium expirado.

4. modules
Tabela dos módulos/ferramentas da app.

Campos:
id.
name.
slug.
category.
description.
is_core.
is_premium.
is_active.
order_index.
created_at.
updated_at.

5. user_modules
Tabela de personalização do que cada utilizador vê/ativa no seu espaço.

Campos:
id.
user_id.
module_id.
is_visible.
is_enabled.
created_at.
updated_at.

6. history
Tabela do histórico completo de cálculos e ações. [query context]

Campos:
id.
user_id.
module_id.
action_type.
input_data.
result_data.
status.
synced.
created_at.
updated_at.

7. notes
Tabela separada para notas editáveis associadas ao histórico. [query context]

Campos:
id.
history_id.
user_id.
title.
content.
created_at.
updated_at.

8. moodle_requests
Tabela para pedidos e ligações ao Moodle. [query context]

Campos:
id.
user_id.
email.
name.
request_type.
state.
admin_notes.
created_at.
updated_at.

9. Tabelas de conteúdos técnicos
Separadas por domínio, como validaste.
culturas
equipamentos
bicos
calibracoes
documents

Campos comuns:
id.
title.
slug.
summary.
content.
source_type.
source_url.
tags.
is_public.
is_premium.
is_active.
created_at.
updated_at.

10. moodle_ads
Tabela para publicidade e campanhas ligadas ao Moodle. [query context]

Campos:
id.
campaign_id.
title.
text.
image_url.
link_url.
priority.
starts_at.
ends_at.
is_active.
created_at.
updated_at.

11. admin_logs
Tabela de auditoria administrativa. [query context]

Campos:
id.
admin_id.
action.
entity_type.
entity_id.
details.
severity.
created_at.

RLS conceptual por tabela
A seguir está o desenho conceptual já orientado para SQL, usando a lógica oficial do Supabase com auth.uid() e cláusulas USING / WITH CHECK.

users
SELECT: o próprio utilizador ou admin.
INSERT: apenas o utilizador autenticado na criação do próprio perfil.
UPDATE: o próprio utilizador; admin pode tudo.
DELETE: apenas admin.

Exemplo conceptual:

sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_or_admin"
ON public.users
FOR SELECT
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "users_insert_own"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own_or_admin"
ON public.users
FOR UPDATE
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "users_delete_admin_only"
ON public.users
FOR DELETE
USING (public.is_admin());

plans
SELECT: público autenticado pode ler.
INSERT/UPDATE/DELETE: apenas admin.

sql
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans_read_authenticated"
ON public.plans
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "plans_admin_write"
ON public.plans
FOR INSERT, UPDATE, DELETE
USING (public.is_admin())
WITH CHECK (public.is_admin());

subscriptions
SELECT: utilizador vê a própria subscrição; admin vê todas.
INSERT: sistema/admin.
UPDATE: admin ou sistema.
DELETE: admin.

sql
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own_or_admin"
ON public.subscriptions
FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "subscriptions_write_admin_only"
ON public.subscriptions
FOR INSERT
WITH CHECK (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "subscriptions_update_admin_only"
ON public.subscriptions
FOR UPDATE
USING (public.is_admin() OR user_id = auth.uid())
WITH CHECK (public.is_admin() OR user_id = auth.uid());

modules
SELECT: utilizadores autenticados leem o catálogo.
INSERT/UPDATE/DELETE: admin.

sql
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modules_read_authenticated"
ON public.modules
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "modules_admin_write"
ON public.modules
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "modules_admin_update"
ON public.modules
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "modules_admin_delete"
ON public.modules
FOR DELETE
USING (public.is_admin());

user_modules
SELECT: utilizador vê os próprios módulos; admin vê todos.
INSERT/UPDATE/DELETE: utilizador sobre os próprios registos; admin em tudo.

sql
ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_modules_select_own_or_admin"
ON public.user_modules
FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_modules_insert_own"
ON public.user_modules
FOR INSERT
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_modules_update_own_or_admin"
ON public.user_modules
FOR UPDATE
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_modules_delete_own_or_admin"
ON public.user_modules
FOR DELETE
USING (user_id = auth.uid() OR public.is_admin());

history
SELECT: o utilizador vê o próprio histórico; admin vê tudo.
INSERT: o utilizador cria o próprio registo.
UPDATE: utilizador edita o que lhe pertence; admin pode tudo.
DELETE: apenas admin ou política especial futura. [query context]

sql
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "history_select_own_or_admin"
ON public.history
FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "history_insert_own"
ON public.history
FOR INSERT
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "history_update_own_or_admin"
ON public.history
FOR UPDATE
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

notes
SELECT: nota do próprio utilizador ou admin.
INSERT: utilizador cria a sua nota.
UPDATE: utilizador edita a sua nota.
DELETE: utilizador ou admin, conforme política final. [query context]

sql
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select_own_or_admin"
ON public.notes
FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "notes_insert_own"
ON public.notes
FOR INSERT
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "notes_update_own_or_admin"
ON public.notes
FOR UPDATE
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

moodle_requests
SELECT: o utilizador vê os seus próprios pedidos; admin vê todos.
INSERT: o utilizador cria o pedido.
UPDATE: apenas admin.
DELETE: apenas admin. [query context]

sql
ALTER TABLE public.moodle_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "moodle_requests_select_own_or_admin"
ON public.moodle_requests
FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "moodle_requests_insert_own"
ON public.moodle_requests
FOR INSERT
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "moodle_requests_admin_update"
ON public.moodle_requests
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "moodle_requests_admin_delete"
ON public.moodle_requests
FOR DELETE
USING (public.is_admin());

Conteúdos técnicos
SELECT: público lê o que for is_public = true; premium lê o que for premium; admin vê tudo.
INSERT/UPDATE/DELETE: apenas admin.

moodle_ads
SELECT: leitura pública dos itens ativos.
INSERT/UPDATE/DELETE: apenas admin. [query context]

admin_logs
SELECT: apenas admin.
INSERT: admin e sistema.
UPDATE/DELETE: idealmente bloqueado ou muito restrito.

Notas importantes de implementação
A documentação do Supabase reforça que RLS deve proteger a API e o acesso aos dados com políticas explícitas, e que o controlo deve ser feito no banco e não só na interface.

Para a DATERRA Smart, isso é especialmente importante porque tens dados de utilizador, planos, histórico, conteúdos internos e processos administrativos que não podem ficar expostos.

Fecho do Ponto 2
O Ponto 2 fica agora estruturado com:
tabela users como perfil principal;
plans e subscriptions separados;
conteúdos técnicos por domínio;
histórico com notas editáveis;
Moodle com tabela própria;
publicidade em campanhas múltiplas;
logs administrativos com severidade;
RLS conceptual desenhado por tabela.

====

Ponto 3 — Políticas de segurança RLS
A DATERRA Smart deve usar Row Level Security como mecanismo principal de proteção dos dados no Supabase. Isto significa que o acesso a cada linha da base de dados deve ser controlado por políticas explícitas, e não apenas por regras visuais dentro da aplicação.

A regra base é simples: o utilizador só vê o que é seu, o admin vê o que lhe compete gerir, e o premium só acede ao que o plano lhe permite. Essa lógica deve ser aplicada em todas as tabelas críticas do sistema.

Princípios gerais
Todas as tabelas sensíveis devem ter RLS ativo.
As policies devem ser pensadas por tabela, por papel e por operação.
O acesso deve depender de auth.uid() e de funções auxiliares de autorização.
A interface da app nunca substitui a segurança da base de dados.
O backend deve sempre seguir o princípio do menor privilégio.

Tabela users
A tabela users guarda o perfil estendido do utilizador e deve permitir acesso apenas ao próprio perfil, com exceção do administrador.

Regras:
SELECT: o próprio utilizador ou admin.
INSERT: apenas o utilizador autenticado ao criar o seu perfil.
UPDATE: o próprio utilizador ou admin.
DELETE: apenas admin.

Tabela plans
A tabela plans contém os planos comerciais da DATERRA Smart. Pode ser lida por utilizadores autenticados, mas apenas o admin pode criar, alterar ou remover planos.

Regras:
SELECT: utilizadores autenticados.
INSERT: apenas admin.
UPDATE: apenas admin.
DELETE: apenas admin.

Tabela subscriptions
A tabela subscriptions guarda o estado operacional do acesso de cada utilizador. Cada utilizador vê a própria subscrição, enquanto o admin vê todas.

Regras:
SELECT: o próprio utilizador ou admin.
INSERT: o próprio utilizador ou admin.
UPDATE: o próprio utilizador ou admin.
DELETE: apenas admin.

Tabela modules
A tabela modules funciona como catálogo central dos módulos da DATERRA Smart. Pode ser lida por utilizadores autenticados, mas a gestão é reservada ao admin.

Regras:
SELECT: utilizadores autenticados.
INSERT: apenas admin.
UPDATE: apenas admin.
DELETE: apenas admin.

Tabela user_modules
A tabela user_modules guarda a personalização dos módulos visíveis por utilizador. Cada pessoa só vê e altera os seus próprios registos, com exceção do admin.

Regras:
SELECT: o próprio utilizador ou admin.
INSERT: o próprio utilizador ou admin.
UPDATE: o próprio utilizador ou admin.
DELETE: o próprio utilizador ou admin.

Tabela history
A tabela history guarda o histórico de ações, cálculos, ferramentas usadas e respetivos resultados. O utilizador só deve ver o seu histórico, e o admin deve poder consultar tudo. [query context]

Regras:
SELECT: o próprio utilizador ou admin.
INSERT: o próprio utilizador ou admin.
UPDATE: o próprio utilizador ou admin.
DELETE: apenas admin.

Tabela notes
A tabela notes guarda as notas editáveis associadas ao histórico. O acesso segue a lógica de ownership: cada utilizador vê e altera as suas notas, e o admin vê todas. [query context]

Regras:
SELECT: o próprio utilizador ou admin.
INSERT: o próprio utilizador ou admin.
UPDATE: o próprio utilizador ou admin.
DELETE: o próprio utilizador ou admin.

Tabela moodle_requests
A tabela moodle_requests regista pedidos de ligação ao Moodle. Cada utilizador deve ver apenas os seus pedidos, enquanto o admin deve gerir todos. [query context]

Regras:
SELECT: o próprio utilizador ou admin.
INSERT: o próprio utilizador.
UPDATE: apenas admin.
DELETE: apenas admin.

Tabelas de conteúdos técnicos
As tabelas de conteúdos técnicos, como culturas, equipamentos, bicos, calibracoes e documents, devem permitir leitura pública dos conteúdos marcados como públicos, leitura premium quando aplicável e edição apenas ao admin.

Regras:
SELECT: conteúdo público para todos os autenticados; conteúdo premium apenas para utilizadores com acesso premium; admin vê tudo.
INSERT: apenas admin.
UPDATE: apenas admin.
DELETE: apenas admin.

Tabela moodle_ads
A tabela moodle_ads guarda campanhas, banners e publicidade da Academia DATERRA. A leitura deve restringir-se aos itens ativos, e a gestão deve ser feita apenas pelo admin. [query context]

Regras:
SELECT: utilizadores autenticados, apenas anúncios ativos.
INSERT: apenas admin.
UPDATE: apenas admin.
DELETE: apenas admin.

Tabela admin_logs
A tabela admin_logs guarda a auditoria administrativa. Deve ser visível apenas para admin e idealmente não deve ser alterada ou eliminada depois de gravada.

Regras:
SELECT: apenas admin.
INSERT: apenas admin ou sistema.
UPDATE: apenas admin.
DELETE: idealmente desativado.

Diferença entre free, premium e admin
A diferenciação entre free e premium não deve existir apenas na interface. Deve ser aplicada diretamente nas policies e na lógica de acesso da base de dados.
Free: acede apenas ao conteúdo gratuito e aos módulos básicos.
Premium pendente: acesso restrito até validação.
Premium ativo: acede ao conteúdo e funcionalidades premium.
Premium suspenso ou expirado: volta a comportamento restrito.
Admin: acesso de gestão e visibilidade ampla.

Regra de segurança principal
A segurança da DATERRA Smart deve sempre obedecer a este princípio: o que não está explicitamente permitido por policy, não está permitido na prática. A base de dados deve ser o guardião real da aplicação, e não apenas o frontend

Objetivo das funções
Estas funções existem para evitar repetir a mesma lógica em dezenas de policies e para manter as regras de acesso consistentes em toda a base de dados. Na DATERRA Smart, as três funções mais importantes são: is_admin(), has_premium_access() e uma função de ownership, por exemplo is_owner(user_id).

A ideia é simples:
is_admin() verifica se o utilizador atual tem papel administrativo.
has_premium_access() verifica se o utilizador tem acesso premium ativo.
is_owner() confirma se a linha pertence ao utilizador autenticado.

1. Função is_admin()
Esta função deve consultar a tabela users e confirmar se a conta autenticada tem o papel de admin. A forma correta é usar uma função SECURITY DEFINER, mas com muito cuidado e com search_path fixo para evitar riscos de segurança.

Estrutura conceptual
sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

Porque esta forma
Evita repetir subconsultas em cada policy.
Centraliza a lógica de admin num só sítio.
Permite que policies fiquem legíveis e curtas.

Regras de segurança
A função deve ser apenas de leitura.
O search_path deve ficar fixo.
O acesso deve ser mínimo e controlado.
A função não deve aceitar parâmetros desnecessários.

2. Função has_premium_access()
Esta função deve verificar se o utilizador tem uma subscrição premium ativa, não expirada, e não suspensa. O objetivo é separar claramente o conceito de “plano” do conceito de “acesso operacional”.

Estrutura conceptual
sql
CREATE OR REPLACE FUNCTION public.has_premium_access()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = auth.uid()
      AND access_state = 'premium_active'
      AND (ends_at IS NULL OR ends_at > now())
  );
$$;

Porque esta forma
Torna a policy premium muito mais simples.
Evita escrever a mesma lógica de expiração em várias tabelas.
Permite evoluir depois para estados como pendente, suspenso ou expirado sem mudar todas as policies.

Regras de segurança
Deve ser usada apenas como verificação.
Não deve expor dados da subscrição.
O resultado deve ser booleano e suficiente para as policies.

3. Função is_owner(row_user_id)
Esta função serve para confirmar se uma linha pertence ao utilizador atual. É útil para histórico, notas, pedidos Moodle, preferências e outros registos pessoais.

Estrutura conceptual
sql
CREATE OR REPLACE FUNCTION public.is_owner(row_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT row_user_id = auth.uid();
$$;

Porque esta forma
Simplifica policies de ownership.
Deixa as policies mais fáceis de ler.
Garante consistência entre tabelas pessoais.

Observação importante
Nos casos em que a policy precisa de acesso adicional para admin, a policy final deve combinar is_owner() com is_admin().

4. Função opcional can_access_content(content_state)
Se quiseres refinar o acesso aos conteúdos técnicos, podes adicionar uma função auxiliar para avaliar se um utilizador pode ler conteúdo público, premium ou interno. Isto ajuda quando os conteúdos começam a ficar mais ricos.

Estrutura conceptual
sql
CREATE OR REPLACE FUNCTION public.can_access_content(is_public boolean, is_premium boolean)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    is_public = true
    OR public.is_admin()
    OR (is_premium = true AND public.has_premium_access());
$$;

Quando usar
Conteúdos técnicos por domínio.
Biblioteca de documentos.
Materiais associados à IA.
Conteúdos freemium com visibilidade diferenciada.

5. Função opcional can_manage_admin(entity_owner_id)
Se quiseres reforçar ainda mais a lógica administrativa, podes criar uma função que valide se o utilizador pode gerir um registo específico. Porém, para o MVP, não considero obrigatória porque is_admin() já cobre a maior parte dos casos.

Estrutura conceptual
sql
CREATE OR REPLACE FUNCTION public.can_manage_admin(row_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR row_user_id = auth.uid();
$$;

6. Ordem de implementação recomendada
Para não complicar, a ordem ideal é esta:
criar is_admin();
criar has_premium_access();
criar is_owner();
testar policies em users, subscriptions, history e moodle_requests;
só depois refinar can_access_content() se for mesmo necessário.

7. Boas práticas obrigatórias
A documentação do Supabase destaca que RLS deve ser implementado com cuidado e que funções auxiliares precisam de ser pensadas para performance e segurança.

Regras práticas para a DATERRA Smart:
usar SET search_path = public;
manter funções pequenas e objetivas;
evitar lógica duplicada dentro de policies;
indexar colunas usadas frequentemente nas policies, como user_id, role, access_state e is_active;
testar sempre com utilizador normal, premium e admin.

8. Como estas funções se ligam às policies
Exemplos de uso conceptual:
users: USING (id = auth.uid() OR public.is_admin())
subscriptions: USING (user_id = auth.uid() OR public.is_admin())
history: USING (public.is_owner(user_id) OR public.is_admin())
moodle_requests: USING (public.is_owner(user_id) OR public.is_admin())
conteúdos premium: USING (is_public = true OR public.is_admin() OR public.has_premium_access())

9. Recomendação final
A minha recomendação para a DATERRA Smart é manter estas três funções como base obrigatória:
is_admin()
has_premium_access()
is_owner()

E deixar as outras como opcionais para fases posteriores, caso o backend comece a ganhar mais complexidade.

====

Ponto 4. Núcleo modular da app

O Ponto 4 deve ser desenhado como um núcleo fixo, com módulos ativáveis e uma camada de ligação clara entre módulos, dashboard, histórico e assistente IA. A ideia é manter a app simples no arranque, mas preparada para crescer sem refazer a base.

Princípio do núcleo modular
O núcleo da DATERRA Smart deve conter sempre as funções essenciais: autenticação, dashboard, histórico, definições, biblioteca, assistente IA, sincronização e administração. Os módulos entram como capacidades adicionais que o utilizador pode ativar, ocultar ou priorizar, sem alterar a estrutura-base da app.

Isto é coerente com uma arquitetura modular por features, em que a aplicação é organizada por domínios funcionais e não apenas por tipo de ficheiro. O App Router do Next.js é compatível com esta abordagem e ajuda a separar rotas, layouts e responsabilidades.

Registo de cada módulo
Cada módulo deve existir como uma entidade registada no backend, com identificação própria, categoria, estado ativo, ordem e se é core ou premium. Isso permite tratar cada ferramenta como um bloco gerível, e não apenas como uma página solta.

O que cada módulo deve ter
nome;
slug;
categoria;
descrição;
estado ativo;
prioridade/ordem;
se é core;
se é premium;
ligação ao histórico;
ligação ao assistente IA.

Decisão proposta
O registo do módulo deve viver em modules, e a visibilidade de cada utilizador em user_modules. Isso dá controlo central à administração e personalização ao utilizador, sem duplicar lógica na interface.

Ativar e desativar módulos
O utilizador deve poder escolher quais os módulos que quer ver no seu espaço, mas essa escolha deve ser limitada pelo plano e pelas regras do sistema. O resultado prático é uma personalização visual e funcional do dashboard, sem mexer na instalação técnica do módulo.

Regras funcionais
módulos core ficam sempre visíveis;
módulos premium só aparecem se o plano permitir;
módulos opcionais podem ser escondidos ou mostrados pelo utilizador;
o admin pode forçar visibilidade em módulos estratégicos.

Efeito prático
A interface deve adaptar o dashboard consoante os módulos visíveis. Assim, um agricultor pode ver apenas as ferramentas que usa, enquanto outro pode ter um espaço mais completo. Isso reduz ruído e aumenta utilidade.

Impacto no dashboard
O dashboard deve ser o centro operacional da experiência. Em vez de ser apenas uma página de resumo, deve refletir os módulos ativos, os últimos registos, alertas e atalhos úteis para o utilizador.

O dashboard deve mostrar
módulos visíveis;
últimos cálculos;
atalhos para ferramentas favoritas;
estado de sincronização;
alertas relevantes;
destaque para conteúdos ou documentos importantes;
acesso ao assistente IA.

Regra prática
O dashboard não deve ser igual para toda a gente. Ele deve ser dinâmico, baseado no perfil, no plano e nos módulos selecionados.

Histórico por módulo
O histórico deve guardar não só a ação do utilizador, mas também o módulo a que essa ação pertence. Isso é importante porque a DATERRA Smart não é uma lista solta de cálculos; é um ecossistema de ferramentas agrícolas com contexto. [query context]

O histórico deve registar
utilizador;
módulo;
tipo de ação;
entrada usada;
resultado;
nota associada;
estado de sincronização;
data.

Vantagem prática
Isto permite filtrar o histórico por cultura, equipamento, bico, calibração ou qualquer outro domínio. Também facilita a futura IA, porque ela poderá recuperar contexto por área de conhecimento.

Assistente IA ligado aos módulos
O assistente IA deve estar ligado aos módulos como um ajudante contextual, e não como um bloco genérico sem memória útil. Quando o utilizador estiver num módulo, o assistente deve perceber esse contexto e sugerir respostas relacionadas com a ferramenta que está em uso.

O assistente deve conseguir
saber em que módulo o utilizador está;
ler conhecimento associado ao módulo;
sugerir explicações e passos;
recuperar dados do histórico daquele módulo;
respeitar o plano do utilizador.

Decisão importante
O assistente não deve ser uma camada separada e isolada. Deve estar integrado com os módulos e com a biblioteca, para funcionar como apoio contextual e não como chatbot solto.

Relação entre app e módulos
A estrutura recomendada é:
a app contém o núcleo;
os módulos vivem como features;
a base de dados define o que existe;
o utilizador define o que vê;
o assistente IA lê o contexto dos módulos.

Isto é compatível com uma arquitetura por features no Next.js App Router e ajuda a manter o código organizado à medida que o produto cresce.

Estrutura operacional recomendada
Para o documento, podes considerar este desenho:
modules regista todas as ferramentas;
user_modules guarda as preferências do utilizador;
history associa cada ação a um módulo;
assistant_context ou equivalente pode ser preparado mais tarde para IA contextual;
o dashboard lê user_modules e history para montar a experiência.

Decisão final do ponto 4
Fica validado que:
o núcleo é fixo;
os módulos são capacidades ativáveis;
o dashboard adapta-se aos módulos;
o histórico guarda referência ao módulo;
o assistente IA usa o módulo como contexto;
a instalação técnica de plugins fica para fase futura.

====

Ponto 6: 

O Ponto 5: Fluxo de administração deve ficar muito claro e separado do resto da aplicação, para não misturar operações públicas, privadas e de gestão. O Supabase já fornece audit logs e RLS para controlo de acesso, e o Next.js App Router permite isolar esta área em grupos e layouts próprios.

Função da área admin
A área admin existe para controlar a operação da DATERRA Smart, gerir utilizadores, planos, módulos, conteúdos, pedidos Moodle, publicidade e registos internos. Não deve ser uma simples página de edição; deve ser um centro de governo do produto.
A regra principal é: tudo o que altera estrutura, acesso, conteúdo ou auditoria deve passar pelo admin e ficar registado.

Login admin
O ecrã de login admin deve ser um ponto de entrada protegido, visualmente simples e separado do login normal do utilizador. Pode usar o mesmo motor de autenticação do Supabase, mas com verificação adicional de papel e acesso.

O que deve fazer
autenticar o utilizador;
confirmar se o papel é admin;
bloquear acessos não autorizados;
redirecionar para /admin apenas quando o acesso for válido.

Decisão prática
O login admin não precisa de ser um sistema separado tecnicamente; precisa de ser uma experiência separada e protegida por role + RLS.

Painel principal
O /admin deve ser o centro de visão geral da operação. Ele deve mostrar os números mais importantes e o estado do ecossistema, de forma rápida e limpa.

Blocos recomendados
utilizadores ativos;
pedidos Moodle pendentes;
subscrições free/premium;
módulos ativos;
conteúdos publicados;
banners ativos;
eventos recentes de auditoria.

Regra de interface
O painel deve privilegiar resumo, alerta e ação rápida. Não deve esconder dados operacionais importantes atrás de menus profundos.

Gestão de utilizadores
A página /admin/utilizadores deve servir para visualizar e gerir os utilizadores da plataforma. Deve permitir consultar perfil, estado de acesso, papel e ligação ao Moodle.

Ações principais
pesquisar utilizadores;
ver perfil e entidade;
alterar papel quando necessário;
alterar estado de conta;
consultar subscrição;
ver histórico de pedidos Moodle;
bloquear ou reativar conta.

Regra de segurança
A edição de utilizadores deve estar sempre protegida por RLS e por checagem de papel no backend.

Gestão de planos
A página /admin/planos deve gerir o catálogo comercial. Aqui entram os planos, os preços, as features e o estado de cada plano.

Ações principais
criar plano;
editar preço e descrição;
ativar/desativar plano;
definir features incluídas;
marcar plano como visível ou oculto.

Regra prática
O plano não deve ser alterado diretamente no frontend público. Toda a gestão comercial deve passar pelo admin.

Gestão de módulos
A página /admin/modulos deve controlar o catálogo de ferramentas. Aqui definem-se módulos core, premium, ordem, estado ativo e visibilidade geral.

Ações principais
criar módulo;
editar módulo;
ativar/desativar módulo;
marcar como core ou premium;
definir ordem de apresentação;
ligar o módulo ao histórico e à IA.

Regra prática
O admin controla o que existe na plataforma; o utilizador controla apenas o que vê no seu espaço.

Gestão de conteúdos
A página /admin/documentos deve concentrar a criação e edição dos conteúdos técnicos, materiais de apoio e conteúdos ligados à biblioteca de conhecimento.

Ações principais
criar conteúdo por domínio;
editar conteúdo existente;
publicar e despublicar;
marcar como público ou premium;
associar tags, fontes e links;
controlar revisão e atualização.

Regra de organização
Os conteúdos devem ser tratados como dados estruturados, e não como texto solto sem controlo.

Gestão da publicidade
A página /admin/publicidade deve gerir banners, campanhas e links da Academia DATERRA e do Moodle. [query context]

Ações principais
criar campanha;
adicionar banners à campanha;
definir prioridade;
agendar datas;
ativar/desativar banners;
trocar links e textos. [query context]

Regra prática
Uma campanha pode ter vários banners, e o sistema deve respeitar prioridade e período de exibição. [query context]

Gestão de pedidos Moodle
A página /admin/pedidos-moodle deve ser o centro de triagem dos pedidos de ligação ao Moodle. [query context]

Ações principais
ver pedidos pendentes;
aprovar pedido;
rejeitar pedido;
adicionar notas administrativas;
alterar estado;
consultar histórico por utilizador. [query context]

Regra de fluxo
O pedido do utilizador não faz a ligação automaticamente; o admin valida e executa a associação. [query context]

Assistente IA no admin
A página /admin/assistente-ia deve servir para gerir a configuração do assistente agrícola com IA.

Ações principais
configurar fontes;
definir limites;
ativar ou desativar conhecimento;
associar conteúdos à IA;
controlar modelos ou prompts internos.

Regra prática
A IA deve ser governada pelo conteúdo e pelas regras do produto, não o contrário.

Auditoria e logs
A página /admin/logs deve mostrar registos estruturados e úteis de ações administrativas. O Supabase já suporta logs de autenticação e logs de plataforma, o que reforça a importância desta camada de auditoria.

O que deve mostrar
ação realizada;
autor da ação;
entidade afetada;
data e hora;
nível/severidade;
detalhes técnicos.

Regra importante
Os logs não devem ser usados como lixo informativo; devem servir rastreabilidade, auditoria e resolução de problemas.

Controlo de acesso
Toda a área admin deve estar protegida por:
autenticação Supabase;
verificação de papel;
RLS no banco;
proteção de rota no Next.js.

Isto é essencial para evitar que um utilizador normal aceda à lógica administrativa apenas porque conhece a URL.

Estrutura operacional final
A área admin deve ficar assim:
/admin
/admin/utilizadores
/admin/planos
/admin/modulos
/admin/documentos
/admin/publicidade
/admin/pedidos-moodle
/admin/assistente-ia
/admin/logs

Decisão final do ponto 5
Fica validado que o fluxo de administração inclui:
login admin protegido;
dashboard administrativo;
gestão de utilizadores;
gestão de planos;
gestão de módulos;
gestão de conteúdos;
gestão de publicidade;
gestão de pedidos Moodle;
gestão da IA;
logs e auditoria.

====

Ponto 6. Assistente agrícola com IA

Sim — o assistente agrícola com IA deve ser definido como um sistema source-grounded, ligado à biblioteca, aos documentos e aos módulos da DATERRA Smart, para reduzir alucinações e manter as respostas úteis e seguras. O Google AI Studio pode acelerar a construção dessa camada, mas a regra de produto tem de nascer primeiro na arquitetura da DATERRA Smart.

Função do assistente
O assistente não deve ser um chatbot genérico. Ele deve ajudar o agricultor a interpretar dados, consultar conhecimento técnico, entender fichas resumidas e receber apoio contextual dentro de cada módulo.
A resposta do assistente deve ser sempre construída com base em fontes autorizadas e associadas ao contexto do utilizador, tal como as plataformas baseadas em fontes fazem para reduzir erros e aumentar confiança.

Fontes autorizadas
As fontes autorizadas de conhecimento devem ser apenas as que a DATERRA Smart reconhece como válidas. Isso evita misturar conhecimento técnico com material não verificado.

Fontes permitidas
Biblioteca interna da DATERRA Smart.
Documentos técnicos validados.
Fichas resumidas mobile.
PDFs originais aprovados.
Conteúdos associados aos módulos.
Conteúdos ligados ao Moodle quando o admin os marcar como válidos.

Fontes não autorizadas por defeito
respostas livres sem fonte;
conteúdos não validados pelo admin;
documentação externa não referenciada;
dados privados de outros utilizadores.

Associação pelo utilizador
O utilizador deve poder associar conhecimento ao seu espaço de forma simples. A ligação deve acontecer por módulo, por documento ou por perfil de conhecimento, sem obrigar o utilizador a gerir complexidade técnica.

Forma recomendada
selecionar um módulo;
associar documentos;
marcar fichas como favoritas;
ligar perfis como culturas, equipamentos, bicos ou calibração;
definir notas ou contexto próprio.

Decisão prática
A associação deve acontecer na biblioteca e nas definições do assistente, não num separador técnico complexo.

Limite entre resposta automática e validação humana
O assistente pode responder automaticamente a perguntas de apoio, explicação e navegação de conhecimento. Mas sempre que a informação afetar decisão crítica, segurança, dosagem, aplicação ou interpretação sensível, o sistema deve indicar necessidade de validação humana.

Resposta automática permitida
explicação de conceitos;
resumo de PDFs;
comparação de fichas;
ajuda de navegação;
contextualização por módulo;
leitura de histórico do próprio utilizador.

Resposta com validação humana
recomendações de campo com impacto agronómico relevante;
decisões sobre tratamento ou aplicação crítica;
valores que dependam de contexto local não fornecido;
qualquer resposta com baixa confiança ou fonte insuficiente.

Regra prática
Quando a certeza não for suficiente, a IA deve assumir postura conservadora e pedir validação humana ou mais contexto.

Integração com PDFs e fichas
A integração com PDFs e fichas resumidas é uma peça central do assistente. O Google AI Studio e o estilo de sistemas orientados por fontes favorecem precisamente este modelo de ingestão e síntese.

Estrutura recomendada
PDF original como fonte completa;
ficha resumida mobile como versão rápida;
associação de ambos ao mesmo conteúdo técnico;
ligação do conteúdo ao módulo ou perfil correspondente. [query context]

Regra de uso
O assistente deve responder com base na ficha resumida quando a pergunta for simples, e aprofundar com o PDF quando a pergunta exigir detalhe.

Regras de segurança e privacidade
A segurança do assistente deve seguir o mesmo princípio do Supabase: menor privilégio, fontes controladas e acesso só ao que o utilizador pode ver. O Supabase reforça que dados sensíveis devem ser protegidos por RLS e que chaves secretas nunca devem ser expostas no cliente.

Regras essenciais
cada utilizador só acede ao seu próprio contexto;
o assistente não vê dados de outros utilizadores;
conteúdos privados não entram nas respostas públicas;
funções com acesso sensível devem correr no backend;
chaves secretas e service role nunca ficam no frontend.

Privacidade de dados
A lógica deve respeitar o princípio de que os dados da organização e do utilizador não são usados para treinar o sistema de forma indiscriminada.

Ligação ao histórico e módulos
O assistente deve ler o contexto do módulo em uso e, quando autorizado, consultar histórico e notas do próprio utilizador para melhorar a resposta. Isso torna o sistema mais útil e mais próximo da realidade de campo. [query context]

O que pode ler
módulo atual;
histórico do próprio utilizador;
notas associadas;
documentos ligados à biblioteca;
PDFs e fichas validadas;
estado de acesso do utilizador. [query context]

Papel do Google AI Studio
O Google AI Studio deve servir para gerar e iterar a camada técnica do assistente, mas sem substituir a regra de negócio da DATERRA Smart. Ele é a ferramenta de construção; a arquitetura de produto continua a ser definida pela biblioteca base.

Decisão final do ponto 6
Fica validado que o assistente agrícola com IA:
trabalha com fontes autorizadas;
permite associação por módulo e documento;
responde automaticamente apenas dentro de limites seguros;
pede validação humana quando necessário;
integra PDFs e fichas resumidas;
respeita privacidade, RLS e menor privilégio;
usa o Google AI Studio como ferramenta de implementação, não como fonte de governação.

====

Ponto 7. Estrutura de preços e monetização

Sim — este ponto deve ficar fechado agora, mas como plano comercial orientador, não como preço definitivo imutável. O modelo mais sensato para a DATERRA Smart é definir uma faixa premium simples, uma margem mínima clara e limites de uso que protejam os custos variáveis de Supabase, IA e infraestrutura.

Estrutura comercial
A monetização deve ter três camadas:
Free, para entrada e adoção.
Premium, para valor recorrente.
Possível evolução futura para planos mais altos, se o produto ganhar escala.

O ponto importante é que o preço não pode ser definido de forma isolada; ele tem de cobrir base técnica, margem operacional e espaço para crescimento. O Supabase cobra por planos e por uso adicional, e o Cloud Run também tem custo por consumo, por isso a lógica tem de ser conservadora.

Preço oficial de teste
Para a fase inicial, a referência mais equilibrada continua a ser 12,90 €/mês como preço oficial de teste do Premium. Esta escolha mantém o produto acessível, mas já suficientemente sério para cobrir infraestrutura e suporte básico.

Se quiseres uma faixa documental mais prudente, a zona válida pode ficar entre 9,90 € e 14,90 €, com 12,90 € como valor central de validação.

Margem mínima
A margem mínima deve existir desde o início. Para um produto com IA e backend pago por uso, a regra prática deve ser nunca operar com margem estrutural demasiado apertada.

Regra recomendada
Margem mínima bruta alvo: 65%.
Margem operacional desejada: 70% ou mais, se possível.
Se um plano cair abaixo disso de forma consistente, o preço ou os limites de uso devem ser ajustados.

Regra de upgrade
O upgrade deve ser simples e transparente. O utilizador entra no Free, percebe valor, e depois sobe para Premium quando precisar de mais módulos, mais histórico, mais IA ou conteúdo avançado.

Regra proposta
Free: descoberta e uso base.
Premium: acesso ampliado a módulos, assistente IA e conteúdos avançados.
O upgrade pode começar manual no backend e evoluir para automático depois.

O que entra no Premium
O Premium deve conter apenas o que realmente tem valor percebido e justifica pagamento, sem matar a versão gratuita.

Sugestão de inclusão no Premium
mais módulos ativos;
conteúdos técnicos premium;
histórico completo e exportável;
assistente IA com contexto avançado;
fichas e documentos adicionais;
recursos de personalização mais amplos;
prioridade em novas funcionalidades.

O que não deve ir tudo para Premium
login básico;
dashboard básico;
histórico mínimo;
biblioteca essencial;
funcionalidades core de utilização.

Limite de uso aceitável
Como a infraestrutura e a IA podem ter custo variável, é essencial definir limites de uso aceitável por utilizador.

Regra prática
utilizador Free: uso moderado, suficiente para experimentar e regressar;
utilizador Premium: uso mais amplo, mas ainda com salvaguardas;
o sistema deve poder limitar consultas intensivas, uploads demasiado grandes e consumo excessivo de IA.

Diretriz concreta
evitar planos sem limites reais;
limitar cargas pesadas de IA por utilizador;
definir quotas por histórico, documentos e uploads;
rever limites quando houver dados reais de utilização.

Resposta à prioridade real
A tua ordem de prioridade está correta e deve ser respeitada no documento. Primeiro estrutura, depois dados, depois segurança, depois módulos, admin, IA e só no fim a monetização operacional. [query context]

A monetização só funciona bem quando o resto já está estável, porque senão o preço nasce de uma base técnica ainda instável.

Decisão final do ponto 7
Fica validado que:
preço oficial de teste do Premium: 12,90 €/mês;
faixa documental aceitável: 9,90 € a 14,90 €;
margem mínima alvo: 65%;
upgrade deve começar simples e evoluir depois;
Premium inclui valor real e não tudo;
uso aceitável deve ter limites.

====

Ponto 8: publicidade e links dinâmicos

Perfeito — o Ponto 8 fica agora fechado como estrutura de publicidade e links dinâmicos da DATERRA Smart. A lógica recomendada é simples: banners e campanhas devem ser geridos no admin, armazenados com segurança no Supabase, e renderizados na app com otimização de imagem e regras claras de ativação.

Função do ponto 8
Este ponto serve para dar visibilidade controlada a campanhas da Academia DATERRA, mensagens comerciais, links de conversão e conteúdos promocionais dentro da PWA. A publicidade não deve ser invasiva; deve ser útil, contextual e administrada como conteúdo de sistema.

O ideal é que os banners apareçam em zonas estratégicas do dashboard, da página pública e, se necessário, em áreas internas selecionadas.

Estrutura recomendada
A solução deve ser baseada em campanhas e banners, não em imagens soltas. Isso permite agrupar várias peças publicitárias numa mesma campanha e controlar prioridade, datas e contexto de exibição.

Entidades principais
moodle_ads_campaigns
moodle_ads_banners
moodle_ads_placements se quiseres evoluir para locais distintos de exibição

Campos essenciais da campanha
id;
title;
description;
is_active;
starts_at;
ends_at;
created_at;
updated_at.

Campos essenciais do banner
id;
campaign_id;
title;
text;
image_url;
link_url;
priority;
is_active;
created_at;
updated_at.

Exibição dos banners
Os banners devem ser escolhidos com base em três fatores:
campanha ativa;
datas válidas;
prioridade de exibição.

No frontend, as imagens devem ser tratadas com next/image para otimizar carregamento, estabilidade visual e desempenho. O componente oficial do Next.js foi criado precisamente para esse tipo de caso.

Regras de UI
imagem com largura e altura bem definidas;
texto curto e legível sobreposto ou em bloco lateral;
link claro para a ação desejada;
comportamento responsivo no mobile e desktop.

Gestão no admin
A página /admin/publicidade deve permitir:
criar campanhas;
adicionar vários banners por campanha;
definir prioridade;
agendar datas;
ativar/desativar;
trocar links;
editar texto e imagem.

Isto dá controlo total à operação sem mexer no código sempre que houver uma campanha nova.

Segurança e storage
As imagens devem ficar no Supabase Storage ou outro storage controlado, com acesso protegido por RLS. O Supabase Storage foi desenhado para trabalhar com RLS em storage.objects, e por defeito não permite uploads sem policies explícitas.

Regras mínimas
uploads apenas por admin;
leitura pública só para assets ativos e aprovados;
ficheiros privados nunca expostos sem policy;
uso de URLs assinados quando necessário.

Regra de negócio
A publicidade não deve ser tratada como spam visual. Só deve aparecer quando houver campanha ativa, objetivo claro e benefício comercial ou informativo para o utilizador.

Decisão final do ponto 8
Fica validado que:
a publicidade é gerida por campanhas e banners;
cada campanha pode ter vários banners;
a ativação depende de datas e prioridade;
a administração é feita no painel admin;
as imagens devem ser otimizadas com next/image;
o storage deve respeitar RLS e controlo de acesso.

=====

Os pontos seguintes são um complemento aos pontos anteriores que ficaram de ser finalizados.

Ponto 9: Modelo de dados final

O modelo de dados final deve ser tratado como o contrato estrutural central da DATERRA Smart, porque é ele que vai garantir que o Google AI Studio gere código consistente ficheiro a ficheiro sem inventar relações ou nomes. O Supabase suporta bem este tipo de desenho porque trabalha diretamente sobre Postgres, com RLS, foreign keys, JSONB, triggers e funções SQL, o que encaixa bem num SaaS modular com controlo por utilizador e papel.

Objetivo do modelo
O objetivo do schema é separar claramente:
identidade do utilizador;
acesso e subscrição;
módulos visíveis;
histórico operacional;
notas e registos;
documentos e biblioteca;
Moodle e pedidos;
publicidade;
administração e auditoria.

Isto evita a mistura de lógica em tabelas genéricas e reduz o risco de alucinação estrutural quando a IA gerar backend, policies e queries.

Convenção base
A convenção recomendada para o projeto é:
tabelas em snake_case;
chaves primárias em uuid;
campos de tempo com created_at e updated_at;
relação com utilizador sempre em user_id ou owner_user_id;
estado controlado por campos status, is_active, is_public e is_premium.

Os nomes finais devem ser consistentes em toda a aplicação, porque isso facilita prompts, RLS, histórico e geração automática de código.

Entidades principais
1. profiles
Tabela principal do perfil estendido do utilizador, ligada a auth.users. Deve conter nome, entidade, papel, estado e preferências base.

Campos sugeridos:
id uuid primary key references auth.users(id) on delete cascade
first_name text not null
last_name text not null
entity text
role text not null default 'user'
status text not null default 'active'
avatar_url text
phone text
language text default 'pt-PT'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()

2. plans
Tabela de planos comerciais. Deve guardar o catálogo comercial e servir de base ao freemium.

Campos sugeridos:
id uuid primary key default gen_random_uuid()
name text not null
slug text not null unique
price numeric(10,2) not null
billing_cycle text not null
description text
features jsonb not null default '{}'::jsonb
is_active boolean not null default true
created_at timestamptz not null default now()
updated_at timestamptz not null default now()

3. subscriptions
Tabela operacional da subscrição do utilizador. Esta separa o plano comercial do estado real de acesso.

Campos sugeridos:
id uuid primary key default gen_random_uuid()
user_id uuid not null references profiles(id) on delete cascade
plan_id uuid not null references plans(id)
access_state text not null
manual_approval_required boolean not null default true
starts_at timestamptz
ends_at timestamptz
approved_by uuid references profiles(id)
approved_at timestamptz
created_at timestamptz not null default now()
updated_at timestamptz not null default now()

Índices recomendados:
index subscriptions_user_id_idx on subscriptions(user_id)
index subscriptions_plan_id_idx on subscriptions(plan_id)
index subscriptions_access_state_idx on subscriptions(access_state)

4. modules
Catálogo mestre dos módulos/ferramentas da app.

Campos sugeridos:
id uuid primary key default gen_random_uuid()
name text not null
slug text not null unique
category text not null
description text
is_core boolean not null default false
is_premium boolean not null default false
is_active boolean not null default true
order_index integer not null default 0
created_at timestamptz not null default now()
updated_at timestamptz not null default now()

5. user_modules
Tabela de personalização do que cada utilizador vê.

Campos sugeridos:
id uuid primary key default gen_random_uuid()
user_id uuid not null references profiles(id) on delete cascade
module_id uuid not null references modules(id) on delete cascade
is_visible boolean not null default true
is_enabled boolean not null default true
created_at timestamptz not null default now()
updated_at timestamptz not null default now()

Constraint única:
unique(user_id, module_id)

6. history
Tabela de histórico de ações, cálculos, navegação ou uso de ferramentas.

Campos sugeridos:
id uuid primary key default gen_random_uuid()
user_id uuid not null references profiles(id) on delete cascade
module_id uuid references modules(id) on delete set null
action_type text not null
input_data jsonb not null default '{}'::jsonb
result_data jsonb not null default '{}'::jsonb
status text not null default 'success'
synced boolean not null default false
created_at timestamptz not null default now()
updated_at timestamptz not null default now()

Índices recomendados:
index history_user_id_idx on history(user_id)
index history_module_id_idx on history(module_id)
index history_created_at_idx on history(created_at desc)

7. notes
Notas editáveis ligadas ao histórico ou a registos próprios do utilizador.

Campos sugeridos:
id uuid primary key default gen_random_uuid()
history_id uuid references history(id) on delete cascade
user_id uuid not null references profiles(id) on delete cascade
title text not null
content text not null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()

8. moodle_requests
Pedidos de ligação ao Moodle, com triagem administrativa.

Campos sugeridos:
id uuid primary key default gen_random_uuid()
user_id uuid not null references profiles(id) on delete cascade
email text not null
name text not null
request_type text not null
state text not null default 'pending'
admin_notes text
created_at timestamptz not null default now()
updated_at timestamptz not null default now()

Constraint útil:
unique(user_id, request_type) se quiseres impedir duplicados imediatos.

9. conteúdos técnicos
Em vez de uma única tabela confusa, o mais limpo é usar uma tabela base content_items com content_type e domain, ou separar por domínio se quiseres máxima clareza. Para a DATERRA Smart, a segunda opção é válida, mas a primeira é mais escalável.

Opção recomendada: tabela única content_items
Campos:
id uuid primary key default gen_random_uuid()
title text not null
slug text not null unique
domain text not null
content_type text not null
summary text
body text not null
source_type text
source_url text
tags text[] default '{}'
is_public boolean not null default false
is_premium boolean not null default false
is_active boolean not null default true
review_status text not null default 'draft'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()

Isto facilita biblioteca, fichas resumidas, PDFs, assistente IA e filtros.

10. moodle_ads_campaigns
Campanhas de publicidade e links dinâmicos.

Campos sugeridos:
id uuid primary key default gen_random_uuid()
title text not null
description text
is_active boolean not null default true
starts_at timestamptz
ends_at timestamptz
created_at timestamptz not null default now()
updated_at timestamptz not null default now()

11. moodle_ads_banners
Banners pertencentes a campanhas.

Campos sugeridos:
id uuid primary key default gen_random_uuid()
campaign_id uuid not null references moodle_ads_campaigns(id) on delete cascade
title text not null
text text
image_url text not null
link_url text not null
priority integer not null default 0
is_active boolean not null default true
created_at timestamptz not null default now()
updated_at timestamptz not null default now()

Índice útil:
index moodle_ads_banners_campaign_id_idx on moodle_ads_banners(campaign_id)

12. admin_logs
Auditoria administrativa estruturada.

Campos sugeridos:
id uuid primary key default gen_random_uuid()
admin_id uuid not null references profiles(id)
action text not null
entity_type text not null
entity_id uuid
details jsonb not null default '{}'::jsonb
severity text not null default 'info'
created_at timestamptz not null default now()

Relações principais
As relações mais importantes devem ser estas:
auth.users 1–1 profiles
profiles 1–N subscriptions
plans 1–N subscriptions
profiles 1–N user_modules
modules 1–N user_modules
profiles 1–N history
modules 1–N history
history 1–N notes
profiles 1–N notes
profiles 1–N moodle_requests
moodle_ads_campaigns 1–N moodle_ads_banners
profiles 1–N admin_logs

Constraints e eliminações
A regra estrutural mais segura é:
usar on delete cascade para dados privados do utilizador, como módulos personalizados, histórico, notas e pedidos Moodle;
usar on delete set null onde o registo deve sobreviver sem o módulo associado, como no histórico;
bloquear eliminação direta de entidades críticas como planos, módulos e logs, ou exigir admin.

Unique constraints importantes
profiles.id é PK e FK.
plans.slug unique.
modules.slug unique.
user_modules(user_id, module_id) unique.
content_items.slug unique.
opcionalmente moodle_requests(user_id, request_type) unique.

Campos e tipos críticos
Os tipos mais úteis para este projeto são:
uuid para IDs;
text para nomes e descrições;
boolean para flags;
integer para ordem e prioridade;
numeric(10,2) para preços;
jsonb para features, entradas e resultados;
timestamptz para datas e auditoria.

O uso de jsonb é muito útil para histórico e conteúdo porque permite guardar resultados estruturados sem forçar uma tabela nova para cada variação.

RLS por contrato
O schema final só fica completo se vier acompanhado por regras de RLS alinhadas com o modelo de dados. O Supabase recomenda políticas por tabela, usando auth.uid() e papéis específicos, precisamente para garantir isolamento por utilizador e por função.

Regra-base
utilizador vê apenas o que lhe pertence;
premium vê o que o plano permite;
admin vê e gere o que lhe compete;
tabela pública só expõe o que foi marcado como público.

Fecho estrutural
Com este modelo, a DATERRA Smart fica preparada para:
autenticação segura;
freemium;
módulos visíveis por utilizador;
histórico com rastreabilidade;
documentos técnicos estruturados;
publicidades e banners controlados;
auditoria administrativa;
IA com contexto confiável.

=====

Ponto 10: Políticas RLS completas

O próximo passo é fechar as políticas RLS completas como um contrato de segurança por tabela, com regras explícitas para leitura, escrita, premium, admin, ownership e auditoria. O Supabase recomenda RLS em todas as tabelas expostas e lembra que, sem políticas, a API fica sem acesso quando se usa a chave pública, o que reforça a importância de definir tudo com precisão.

Princípio de base
A regra-mãe da DATERRA Smart deve ser: tudo o que não estiver explicitamente permitido, está bloqueado. No Supabase, isso encaixa diretamente na lógica de policies por tabela, com TO, USING e WITH CHECK, sempre apoiadas por auth.uid() e funções auxiliares seguras.
A implementação deve privilegiar políticas simples, legíveis e indexadas, porque o próprio Supabase alerta para impacto de performance se as policies forem pesadas ou sem índices.

Funções auxiliares
Antes das policies, convém consolidar três funções auxiliares estáveis:
is_admin();
has_premium_access();
is_owner(row_user_id uuid).

Estas funções reduzem repetição, melhoram consistência e tornam as policies mais fáceis de manter. O Supabase também recomenda usar funções com select e evitar joins desnecessários dentro das policies para melhor desempenho.

Políticas por tabela
profiles
A tabela de perfis deve permitir ao utilizador ver e editar apenas o seu perfil, enquanto o admin vê tudo. A criação do perfil deve estar limitada ao próprio utilizador autenticado.

Regras:
SELECT: utilizador próprio ou admin.
INSERT: apenas o próprio utilizador.
UPDATE: utilizador próprio ou admin.
DELETE: apenas admin.

plans
Os planos devem ser legíveis pelos utilizadores autenticados, mas editáveis apenas pelo admin. Isto é importante porque o catálogo comercial não deve ser alterado por utilizadores normais.

Regras:
SELECT: autenticados.
INSERT: admin.
UPDATE: admin.
DELETE: admin.

subscriptions
A subscrição é sensível, por isso o utilizador só vê a sua própria, e o admin vê todas. A inserção pode ser permitida ao sistema ou ao próprio utilizador, mas a aprovação final deve ficar protegida.

Regras:
SELECT: utilizador próprio ou admin.
INSERT: próprio utilizador ou sistema.
UPDATE: admin ou próprio, se estiveres a permitir autoatualização controlada.
DELETE: admin.

modules
O catálogo de módulos pode ser lido por utilizadores autenticados, mas a manutenção deve ser exclusiva do admin.

Regras:
SELECT: autenticados.
INSERT: admin.
UPDATE: admin.
DELETE: admin.

user_modules
Cada utilizador só deve gerir os seus próprios módulos visíveis. O admin pode consultar e alterar todos os registos.

Regras:
SELECT: utilizador próprio ou admin.
INSERT: utilizador próprio ou admin.
UPDATE: utilizador próprio ou admin.
DELETE: utilizador próprio ou admin.

history
O histórico é privado por utilizador e deve ser bloqueado para terceiros. O admin mantém acesso total para auditoria e apoio operacional.

Regras:
SELECT: utilizador próprio ou admin.
INSERT: utilizador próprio ou admin.
UPDATE: utilizador próprio ou admin.
DELETE: apenas admin.

notes
As notas seguem o mesmo princípio do histórico, com ownership total do utilizador e leitura global do admin.

Regras:
SELECT: utilizador próprio ou admin.
INSERT: utilizador próprio ou admin.
UPDATE: utilizador próprio ou admin.
DELETE: utilizador próprio ou admin.

moodle_requests
Os pedidos Moodle devem ser visíveis ao utilizador que os criou e ao admin. A alteração de estado deve ser exclusiva do admin.

Regras:
SELECT: utilizador próprio ou admin.
INSERT: utilizador próprio.
UPDATE: admin.
DELETE: admin.

content_items
Aqui existe a distinção mais importante: conteúdo público, conteúdo premium e conteúdo privado. O Supabase suporta políticas diferentes por papel, e é aqui que a separação deve ficar fechada.

Regras:
SELECT:
conteúdo público: autenticados e, se quiseres, até anon para partes públicas;
conteúdo premium: apenas utilizadores com acesso premium;
conteúdo privado interno: apenas admin.
INSERT: admin.
UPDATE: admin.
DELETE: admin.

moodle_ads_campaigns e moodle_ads_banners
As campanhas e banners podem ser lidos por utilizadores autenticados quando ativos, mas a gestão deve ser exclusiva do admin.

Regras:
SELECT: autenticados, apenas itens ativos.
INSERT: admin.
UPDATE: admin.
DELETE: admin.

admin_logs
Os logs administrativos devem ser praticamente imutáveis. Idealmente só admitem inserção pelo admin ou sistema, leitura por admin e bloqueio de edição e remoção.

Regras:
SELECT: admin.
INSERT: admin ou sistema.
UPDATE: bloqueado ou só admin em casos excecionais.
DELETE: bloqueado ou extremamente restrito.

Acesso público e anon
O Supabase permite distinguir bem entre anon e authenticated, o que é útil para áreas públicas como landing pages, conteúdos institucionais e partes da publicidade. Mas para a DATERRA Smart, a maior parte dos dados sensíveis deve continuar fechada a authenticated ou admin.

Políticas premium
A lógica premium não deve viver só no frontend. Deve ser imposta diretamente nas policies, usando a função de acesso premium e verificando o estado da subscrição antes de permitir leitura de conteúdo premium ou módulos reservados.

Regra premium
se o conteúdo for is_premium = true, só entra se has_premium_access() devolver verdadeiro;
se o conteúdo for is_public = true, pode ser lido por autenticados;
se o conteúdo for interno, só admin.

Performance das policies
O Supabase recomenda índices nas colunas usadas nas policies e uso de select auth.uid() em vez de chamadas repetidas diretas quando isso fizer sentido. Isso é especialmente importante em user_id, module_id, status e created_at.

Índices mínimos recomendados
profiles(id)
subscriptions(user_id)
subscriptions(plan_id)
history(user_id)
history(module_id)
notes(user_id)
moodle_requests(user_id)
content_items(slug)
content_items(domain)
moodle_ads_banners(campaign_id)

====

Ponto 10: Regras finais de conteúdo

As regras finais de conteúdo devem garantir que biblioteca, PDFs, fichas resumidas, assistente IA e conteúdos premium funcionem como um só sistema editorial, e não como blocos soltos. O Supabase recomenda proteger dados com RLS e usar acesso mínimo necessário, por isso a publicação, revisão e visibilidade de conteúdos têm de estar amarradas a estados claros e a regras de acesso explícitas.

Objetivo editorial
O objetivo é criar uma cadeia simples:
conteúdo nasce como rascunho;
passa por revisão;
é publicado;
pode ser despublicado;
pode ser marcado como público, premium ou interno;
fica ligado a fontes e ao assistente IA.

Isto reduz confusão entre documento técnico original, ficha móvel, conteúdo da biblioteca e fonte usada pela IA.

Estados de conteúdo
Cada item de conteúdo deve ter um estado editorial único, para evitar ambiguidades. A regra ideal é que um conteúdo esteja sempre num destes estados: draft, in_review, published, hidden, archived.

Significado prático
draft: ainda não está pronto.
in_review: está em validação.
published: pode ser visto conforme permissões.
hidden: existe, mas não aparece no frontend.
archived: fica guardado para histórico ou referência, sem uso operacional.

Classificação de visibilidade
Além do estado editorial, cada conteúdo deve ter uma classificação de acesso. Isto separa claramente o estado do item da sua permissão de leitura.

Tipos de visibilidade
public: visível para o público autenticado ou para partes públicas.
premium: visível apenas para utilizadores com acesso premium.
internal: visível apenas para admin ou equipa autorizada.

A combinação de estado + visibilidade é a forma mais segura de evitar erros de publicação e permissões contraditórias.

Regra de publicação
A publicação não deve acontecer de forma direta e definitiva a partir do editor comum. O conteúdo deve passar por revisão antes de poder ser marcado como published. Isto é especialmente importante para fichas resumidas, PDFs técnicos e texto usado pela IA.

Fluxo recomendado
Criar rascunho.
Associar fonte original.
Gerar ou editar ficha resumida.
Rever tecnicamente.
Marcar como publicado.
Tornar visível conforme a classificação.

Regra de revisão
Toda peça técnica deve poder guardar a informação de revisão. Isso ajuda muito em conteúdos agrícolas, porque permite saber se um documento foi validado, por quem e quando.

Campos de revisão recomendados
review_status
reviewed_by
reviewed_at
review_notes
version

Estados de revisão
pending;
approved;
rejected;
needs_update.

PDFs e fichas resumidas
Os PDFs devem ser tratados como fonte completa, e as fichas resumidas como camada de consulta rápida para smartphone. As duas peças devem pertencer ao mesmo conteúdo, mas não devem ser confundidas.

Regra prática
PDF = documento fonte.
Ficha resumida = leitura rápida.
Ambos = ligados ao mesmo item editorial.

Campo útil
source_type: pdf, summary, manual, external_reference.
parent_content_id: liga a ficha ao documento-mãe, se necessário.

Ligação a fontes
Cada conteúdo técnico deve estar sempre ligado à sua origem ou fundamento. Isso é o que permite ao assistente IA responder com base em fontes autorizadas e não em texto solto.

Fontes permitidas
documento original;
PDF validado;
referência técnica oficial;
ficha interna aprovada;
conteúdo do Moodle quando validado pelo admin.

Fontes que não devem entrar por defeito
texto não validado;
respostas geradas sem revisão;
conteúdo importado sem origem clara;
material privado de outros utilizadores.

Relação com o assistente IA
O assistente IA deve ler apenas conteúdos com estado e visibilidade compatíveis com o utilizador e com o contexto. Ele não deve puxar conteúdos ocultos, em revisão ou internos, a menos que o utilizador seja admin e tenha acesso apropriado.

Regra de IA
conteúdo published e public pode apoiar resposta geral;
conteúdo premium só entra se o utilizador tiver acesso premium;
conteúdo internal só entra para admin ou fluxo interno.

Regra de despublicação
Despublicar não significa apagar. Significa retirar da superfície pública sem perder histórico, versões anteriores ou rastreabilidade. Isto é importante para correcções técnicas, revisão agrícola e atualização de normas.

Quando despublicar
erro técnico;
conteúdo desatualizado;
revisão pendente;
conteúdo substituído por nova versão;
risco de informação enganadora.

Versões e histórico
Cada conteúdo deve ter controlo de versão, pelo menos nos materiais mais críticos. Assim, se houver atualização de uma fórmula, de uma ficha ou de um PDF, a plataforma sabe o que mudou e quando.

Regra simples
versão atual publicada;
versões antigas arquivadas;
histórico visível para admin;
logs de alteração guardados.

Regras operacionais finais
Pode publicar
admin ou editor autorizado;
depois de revisão aprovada;
com fonte associada;
com visibilidade definida.

Pode revisar
admin;
responsável editorial;
ou equipa técnica definida pelo sistema.

Pode despublicar
admin;
ou sistema com regra automática de segurança, se necessário.

Pode marcar como premium
apenas admin;
ou workflow editorial aprovado.

Fecho do ponto
Com estas regras, a DATERRA Smart passa a ter uma cadeia editorial clara: conteúdo, revisão, publicação, visibilidade, fonte e consumo pela IA. Isso evita mistura entre biblioteca, PDFs, fichas móveis e conhecimento usado pelo assistente, e torna o sistema muito mais seguro para operar em produção.

=====

Ponto 11: 4. Fronteira IA vs validação humana

A fronteira entre IA e validação humana deve ficar formalizada por níveis de confiança e por tipo de risco, para evitar respostas demasiado prudentes ou demasiado confiantes. O Google AI Studio e o Supabase trabalham bem com lógica server-side e dados protegidos, o que permite separar claramente o que a IA pode responder sozinha e o que precisa de confirmação humana.

Objetivo da fronteira
A regra central da DATERRA Smart deve ser esta: a IA pode explicar, resumir e orientar, mas não deve decidir sozinha quando a resposta envolver risco agronómico, legal, de segurança, de dose ou de privacidade.

Isto mantém o assistente útil no dia a dia e ao mesmo tempo conservador nas áreas críticas.

Níveis de resposta
1. Resposta automática
A IA pode responder automaticamente quando a pergunta for:
explicação conceptual;
leitura de ficha ou PDF já validado;
resumo de conteúdo público ou premium autorizado;
navegação na biblioteca;
comparação de termos;
ajuda de uso da app;
contextualização de um módulo sem implicação crítica.

Nesses casos, a resposta pode sair diretamente, desde que a fonte esteja autorizada e o utilizador tenha acesso ao conteúdo.

2. Resposta com validação humana
A IA deve responder com cautela e pedir validação humana quando a pergunta envolver:
decisão de campo com impacto agronómico relevante;
interpretação de valores de dose;
uso de fórmulas sensíveis;
recomendação com risco ambiental;
análise de dados incompletos;
conteúdo cujo nível de certeza seja médio ou baixo.

Aqui a IA pode dar um aviso, um resumo e uma sugestão, mas não deve assumir o papel de decisor final.

3. Resposta bloqueada
A IA deve bloquear a resposta ou recusar responder quando:
a fonte não estiver autorizada;
o conteúdo estiver em rascunho ou revisão;
a pergunta pedir dados privados de outros utilizadores;
houver conflito entre fontes sem resolução;
a informação puder causar uso perigoso ou ilegal;
faltar base mínima para uma resposta segura.

Gatilhos formais
Gatilhos para resposta automática
source_status = published
visibility = public ou premium com acesso válido
confidence_level >= high
no_critical_risk = true

Gatilhos para validação humana
confidence_level = medium
content_type = agronomic_decision
missing_context = true
result_affects_field_action = true
source_version_pending_review = true

Gatilhos para bloqueio
source_status in {draft, in_review, hidden}
visibility = internal para utilizador não-admin
user_has_no_access = true
conflict_unresolved = true
risk_level = high

Classificação por tipo de pergunta
Perguntas seguras
Podem ser respondidas automaticamente:
“o que significa este termo?”;
“resumir esta ficha”;
“onde está esta ferramenta?”;
“qual é a diferença entre A e B?”;
“mostrar o conteúdo já aprovado”.

Perguntas intermédias
Devem sair com validação humana:
“qual é a melhor opção para o meu caso?”;
“posso aplicar isto nesta situação?”;
“como interpretar este resultado?”;
“qual a dose correta com base nestes dados?”

Perguntas bloqueadas
Devem ser recusadas ou redirecionadas:
“mostra-me dados de outro utilizador”;
“usa este conteúdo ainda não publicado”;
“dá uma recomendação final sem dados suficientes”;
“confirma uma ação de risco sem fonte”.

Regra de confiança
O assistente deve produzir internamente um estado simples:
auto_answer
needs_human_review
block_response

Isto permite ao sistema decidir com previsibilidade e impede que a IA misture prudência excessiva com improviso.

Exemplo prático
Se o utilizador perguntar: “resume esta ficha de TRV”, a IA pode responder automaticamente, porque está a resumir conteúdo validado.
Se o utilizador perguntar: “com estes dados, posso aplicar já?”, a IA deve devolver resposta com validação humana, porque já entra em decisão operacional sensível.
Se o utilizador pedir: “mostra os documentos premium de outro utilizador”, a IA deve bloquear a resposta imediatamente por privacidade e acesso.

Papel do admin
O admin deve poder validar, aprovar ou corrigir fontes e conteúdos que alimentam a IA. Isso é importante porque a qualidade da fronteira depende diretamente da qualidade editorial dos conteúdos.

Fecho do ponto
Fica então definido que a IA da DATERRA Smart:
responde automaticamente em contexto seguro;
pede validação humana quando há risco ou falta de contexto;
bloqueia resposta quando não existe autorização, fonte válida ou segurança suficiente.

=====

Ponto 12: 5. Estrutura operacional das APIs externas

A estrutura operacional das APIs externas deve ser fechada como uma camada separada do resto da app, com regras claras de autenticação, limiares de dados, erros esperados, limites de consumo e estado de integração. O Google AI Studio suporta apps full-stack com runtime server-side, o que é ideal para esconder chaves e chamar APIs externas sem expor segredos no cliente.

Objetivo da camada API
O objetivo não é apenas “ligar uma API”, mas transformar cada integração num módulo controlado, previsível e auditável. Isso é essencial porque algumas fontes já têm documentação incompleta, campos em falta ou autenticação ainda por fechar, e a IA não deve inventar o que não existe.

Regra operacional geral
Toda API externa deve seguir este contrato:
nome da API;
finalidade funcional;
estado de maturidade;
método de autenticação;
tipo de entrada;
formato de resposta;
limites de uso;
erros conhecidos;
dados em falta;
estado final de integração.

Se algum destes blocos não estiver fechado, a API fica em estado incompleta ou validada com ressalvas, e o backend deve tratar essa limitação explicitamente.

Classificação por estado
1. Validada
A API pode ser integrada sem inferências importantes. Os campos, autenticação, resposta e limites estão claros.
2. Validada com ressalvas
A API é utilizável, mas tem pequenas ambiguidades de nomenclatura, unidade, ou comportamento. O sistema deve aceitar isso sem fingir precisão absoluta.
3. Incompleta
Faltam dados essenciais, como payload de resposta, autenticação exata, limites reais, endpoints completos ou regras de validação. Nestes casos, a integração pode ficar preparada, mas não deve ser fechada como definitiva.

Padrão de integração
Entrada
A API deve receber inputs limpos e validados antes da chamada. Isso inclui coordenadas, imagem, texto, parâmetros climáticos ou unidades de medição, conforme o módulo.
Saída
A resposta deve voltar normalizada, com campos consistentes para o frontend, o histórico e a IA. Se a API externa devolver um formato instável, o backend deve converter para um formato interno estável.
Histórico
Toda chamada útil deve poder ser registada em histórico, com nome da ferramenta ou API, entrada resumida, resultado principal e timestamp. Isso ajuda rastreabilidade e auditoria.

Autenticação e segredos
As chaves nunca devem ficar no frontend. O modelo mais seguro para a DATERRA Smart é guardar credenciais no ambiente server-side e executar chamadas externas só do lado do servidor. O Google AI Studio também segue esse princípio quando gera apps full-stack, mantendo segredos no runtime do servidor.

Regras obrigatórias
API key em .env ou secrets server-side;
nenhuma chave em componente cliente;
nenhuma autenticação sensível no browser;
logs sem expor tokens;
rotação futura das chaves quando necessário.

APIs agrícolas e de visão
As APIs agrícolas e de visão já têm utilidade funcional clara, mas muitas ainda precisam de fecho documental. O importante é não forçar a IA a “completar” estruturas que não estão realmente definidas.

O que já pode ser preparado
módulos de upload de imagem;
formulários de input agrícola;
adaptadores de resposta;
histórico das chamadas;
blocos de erro e fallback.

O que ainda não deve ser fechado como definitivo
payload exato de algumas respostas;
regras completas de preços ou créditos;
endpoints internos não documentados;
validações dimensionais ainda incompletas.

Regras de uso por API
APIs de visão computacional
Devem usar upload controlado, validação de formato, limite de peso e conversão da resposta em diagnóstico interno consistente. O sistema deve distinguir entre predição, sugestão e confirmação.

APIs climáticas e geoespaciais
Devem receber coordenadas ou polígonos válidos, e a app deve armazenar apenas o necessário para o uso operacional. A resposta deve ser normalizada para relatórios, alertas e calculadoras.

APIs regulatórias
Devem ser tratadas como suporte normativo e não como decisoras automáticas finais. Se a informação legal estiver incompleta, a app deve sinalizar incerteza.

Fallback quando a API falha
Se a API externa falhar, o sistema deve:
mostrar erro claro;
não inventar resultado;
preservar input original se fizer sentido;
guardar o evento em log técnico;
permitir nova tentativa manual.

Isto evita que uma falha de rede seja confundida com ausência de problema real no campo.

Integração com Google AI Studio
Como o Google AI Studio gera apps com runtime server-side, a estrutura ideal é criar adaptadores por API, com funções isoladas, e não chamadas soltas espalhadas pela app. Isso facilita manutenção e reduz risco de chaves expostas ou lógica duplicada.

Fecho do ponto
Fica então definido que a camada de APIs externas da DATERRA Smart deve:
ter contrato por API;
marcar claramente o estado de maturidade;
esconder chaves no servidor;
normalizar respostas;
registar chamadas no histórico quando útil;
evitar inferências quando a documentação estiver incompleta.

====

Ponto 13: 6. Regras de limites e quotas

As quotas devem ser definidas agora como um sistema de controlo de margem e proteção operacional, não como uma limitação arbitrária. O Supabase e o Cloud Run cobram por uso e oferecem free tiers concretos, por isso a DATERRA Smart deve impor limites compatíveis com esses custos para não deixar a monetização escapar no uso intensivo.

Objetivo das quotas
As quotas existem para:
proteger margem;
evitar abuso;
manter boa experiência no free;
reservar mais capacidade para premium;
reduzir risco de custos imprevisíveis.

A regra ideal é simples: o free mostra valor, mas não permite consumo ilimitado; o premium amplia o uso, mas continua com limites razoáveis.

Limites base por área
IA
A IA deve ter limite por número de interações, tamanho de contexto e quantidade de anexos por período. Isso é importante porque a camada generativa e a eventual infraestrutura de backend podem escalar em custo conforme o volume de uso.

Armazenamento
O armazenamento deve ter teto por utilizador e por tipo de ficheiro. O Supabase inclui 1 GB de storage no Free e 100 GB no Pro, e o upload máximo no Free é 50 MB por ficheiro.

Histórico
O histórico deve ter retenção e paginação, não crescimento infinito sem limite. Mesmo que o utilizador veja muitos registos, o sistema deve manter políticas de limpeza ou arquivamento interno.

PDFs
Os PDFs devem ter peso máximo e número máximo por utilizador, porque ficheiros grandes consomem storage e largura de banda. O Supabase Free inclui 1 GB de storage e o upload máximo por ficheiro é 50 MB, o que dá a referência base para o arranque.

Uploads
Uploads de imagem, documentos e anexos devem ter limites diferentes por tipo. O ideal é dar mais margem ao uso operacional do que ao material de apoio, e bloquear uploads excessivos no free.

Publicidade
Publicidade e banners não precisam de quota de uso de leitura para o utilizador, mas precisam de quota de criação no admin, para evitar campanhas em excesso ou assets mal geridos.

Consultas repetidas
Consultas repetidas à IA, à biblioteca ou a módulos externos devem ter rate limit e cache, sobretudo no free. Isto protege custos e melhora a experiência.

Proposta de limites operacionais
Free
IA: uso moderado, com limite diário ou mensal;
Upload por ficheiro: até 50 MB como referência dura;
Storage total: teto conservador;
Histórico: retenção básica e paginação;
PDFs: poucos por utilizador;
Consultas repetidas: rate limit mais apertado.

Premium
IA: mais consultas, mais contexto, mais anexos;
Uploads: limites mais largos;
Storage: maior espaço;
Histórico: mais profundo;
PDFs: mais ficheiros e maior retenção;
Consultas repetidas: rate limit mais tolerante.

Regra de quota por consumo
O Cloud Run cobra por CPU, memória e requests, e tem free tiers mensais específicos; isso significa que a app deve ser desenhada para reduzir chamadas desnecessárias e evitar processamento pesado no servidor.

Implicação prática
evitar chamadas repetidas iguais;
cache de respostas estáveis;
processar imagens e ficheiros apenas quando necessário;
manter backend leve;
não usar IA em loop sem controlo.

Regra de proteção de margem
A quota não serve apenas para poupar infraestruturas; serve para proteger a margem comercial. Se o free e o premium forem demasiado generosos, a plataforma pode crescer em uso sem crescer em receita de forma proporcional.

Regra simples
free nunca pode consumir como premium;
premium nunca deve ser ilimitado sem revisão;
consumo extremo deve disparar aviso ou bloqueio suave;
a monitoração deve existir desde a fase inicial.

Monitorização necessária
O sistema deve registar:
número de interações com IA;
uploads por utilizador;
tamanho total por tipo de ficheiro;
chamadas repetidas ao mesmo módulo;
consumo de histórico;
utilização de conteúdos premium.

Isso permite ajustar as quotas mais tarde com dados reais, em vez de depender só de estimativas.

Fecho do ponto
Fica então definido que a DATERRA Smart deve usar quotas por utilizador e por plano para IA, storage, PDFs, uploads, histórico, publicidade e consultas repetidas. O princípio é proteger custo e margem sem destruir a utilidade do free, e usar limites coerentes com os planos e free tiers já conhecidos do Supabase e do Cloud Run.

=====

Ponto 14: 7. Padrão editorial final

O padrão editorial final deve funcionar como uma gramática oficial da DATERRA Smart: nomes, mensagens, ajuda, botões i e nomenclatura têm de ser consistentes para a IA não criar variações aleatórias de ecrã para ecrã. O Next.js App Router ajuda a organizar estas camadas por rotas e guias, enquanto o controlo de acesso do Supabase garante que a microcopy e os estados não exponham conteúdo que o utilizador não deve ver.

Objetivo editorial
O objetivo é impedir três problemas:
nomes diferentes para a mesma coisa;
mensagens de erro inconsistentes;
textos de ajuda demasiado longos, vagos ou técnicos.

Quando a app é gerada ficheiro a ficheiro por IA, a consistência editorial é tão importante quanto o schema e as policies, porque reduz alucinação visual e funcional.

Regras de nomenclatura
Ferramentas
Cada ferramenta deve ter:
nome público curto;
nome técnico interno;
categoria funcional;
slug estável;
descrição curta.

Exemplo de padrão
Nome público: “Volume de Calda”.
Nome técnico: volume-calda-adequado.
Categoria: “Calibração e débito”.

Regra
O nome público é para o utilizador; o nome técnico é para base de dados, prompts e logs.

Regras para mensagens
As mensagens de erro devem ser:
claras;
curtas;
acionáveis;
em português de Portugal;
sem termos excessivamente técnicos.

Formato ideal
O que aconteceu.
O que o utilizador deve corrigir.
Quando necessário, o motivo técnico em linguagem simples.

Exemplo
“Falta preencher a altura da vegetação. Introduz um valor válido para continuar.”

Regras para o botão i
O botão i deve existir como apoio contextual fixo. Ele não é decoração; é uma camada de ajuda estruturada.
Estrutura obrigatória do i principal
O que faz.

Utilidades.
Fórmula, quando existir.
Mais Informação, com ligação ao Moodle.
Conteúdo do i por campo
Cada campo deve ter:
explicação curta;
dica prática;
unidade;
intervalo mínimo;
intervalo máximo;
até cinco valores comuns;
exemplo simples, quando útil.

Regras de microcopy
A microcopy deve orientar sem cansar. O texto curto deve substituir explicações longas, e o texto técnico só deve aparecer quando o utilizador pedir ajuda.

Exemplos de microcopy boa
“Guardar para mais tarde.”
“Validado com sucesso.”
“Consulta rápida no terreno.”
“Este conteúdo exige plano Premium.”

O que evitar
frases vagas;
jargão de programação;
textos muito longos;
mensagens de sistema frias ou secas demais.

Regras por tipo de zona
Áreas públicas
A linguagem deve ser mais explicativa e comercial, mas sempre limpa e profissional.
Áreas autenticadas
A linguagem pode ser mais prática, orientada à tarefa e ao módulo em uso.
Área admin
A linguagem deve ser direta, funcional e sem floreados. O foco aqui é operação, auditoria e gestão.
Regras de consistência
A mesma ação deve sempre ter o mesmo verbo:
criar;
editar;
publicar;
despublicar;
ativar;
desativar;
validar;
rever;
associar;
sincronizar.

Se um ecrã usar “ativar” e outro usar “ligar” para a mesma ação, o sistema passa a parecer inconsistente.

Regras de domínio agrícola
Os termos agrícolas devem seguir a terminologia já validada no projeto:
calda;
dose;
bicos;
entrelinha;
parede foliar;
volume de copa;
débito;
cultura;
pulverização.

Não se devem introduzir variantes desnecessárias quando já existe nomenclatura consolidada.

Regras de ajuda e validação
A ajuda deve ser curta por defeito e expandida apenas quando o utilizador pedir mais detalhe. Isto combina bem com o padrão de interface mobile-first e com a lógica de consulta rápida em campo.

Regra prática
primeiro: ajuda essencial;
depois: ajuda expandida;
por fim: ligação ao Moodle ou biblioteca.

Fecho do ponto
Fica então definido que o padrão editorial final da DATERRA Smart deve impor:
nomes estáveis;
mensagens curtas e úteis;
botão i com estrutura fixa;
microcopy consistente;
terminologia agrícola uniforme;
linguagem diferente por zona da app.





























