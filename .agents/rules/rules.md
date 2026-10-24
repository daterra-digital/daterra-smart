---
trigger: alwaysOn
description: Diretivas globais e intransigentes de arquitetura, qualidade de código, UI/UX (ISO 9241-210), branding, lista canónica de produção e regras offline-first para o ecossistema DATERRA Smart.
---

<system_prompt>
  <instructions>
    ESTAS REGRAS SÃO ABSOLUTAS E INVIOLÁVEIS. Qualquer subagente que opere neste repositório deve obedecer aos seguintes princípios em cada alteração de código ou documentação:

    1. BRANDING VISUAL, CORES E TIPOGRAFIA (Minimalismo):
       - **Cores Oficiais:** Utilize estritamente a paleta botânica de alto contraste (WCAG 2.2 AA): Verde Primário (`#114D37` / `#114037`), Verde Secundário (`#5CA64C` / `#1D734B`) e Texto/Ícones (`#FFFFFF` sobre escuro, `#1F2937` sobre claro).
       - **Tipografia e Ícones:** Uniformize as fontes (Cabeçalhos H1/H2 a 24-32px Bold 700; Corpo a 16px Regular 400; Dicas a 12-14px Light 300). Utilize uma única biblioteca de ícones (Lucide) com espessura de traço fixa de 2px.
       - **Tema e Hierarquia:** A interface deve suportar a função CSS `light-dark()` para adaptação nativa e automática do tema. Aplique um "Glassmorphism" subtil estritamente para a hierarquização do App Shell.

    2. UNIFORMIZAÇÃO DE COMPONENTES E RESPONSIVIDADE:
       - **Nomenclatura UI:** É estritamente proibido utilizar a designação "Microlearning" como label de botões visíveis para o agricultor (este é apenas o conceito arquitetural de fundo). Todos os botões de suporte didático devem ser padronizados obrigatoriamente com a label **"Guia"** ou **"Ajuda"**, acompanhados do respetivo ícone pedagógico. Em campos de formulário (inputs), o apoio contextual deve ser prestado unicamente através de ícones interativos de informação `( i )` ou dúvida `( ? )`, sem texto adjacente, para otimizar o espaço em smartphones. Botões primários ("Guardar", "Instalar", "Calcular") devem partilhar o mesmo padding, border-radius e hover.
       - **Desktop (Ecrãs Panorâmicos):** Utilize a largura total disponível (`max-w-7xl` ou fluid) com distribuição organizada em colunas (ex: Dashboard panorâmico e Catálogo em Grid 3x3).
       - **Tablet (Toque Otimizado):** Distribua ferramentas em Grid 2x2. Aumente o espaçamento entre elementos para evitar toques acidentais no campo.
       - **Mobile-First (Smartphones):** Utilize 100% da largura (`w-full`) com padding lateral fixo (16px). Limite a informação visível estritamente ao necessário para a ação imediata. NUNCA introduza texto acessório ou widgets redundantes. Oculte gavetas ou históricos acessórios que exijam scroll excessivo no ecrã inicial.

    3. ERGONOMIA COGNITIVA (ISO 9241-210 e Lei de Fitts):
       - **Zonas de Toque (Touch Targets):** Todos os botões e áreas interativas devem ter um tamanho mínimo de toque de 48x48 dp.
       - **Operação com Uma Mão:** Posicione sempre a navegação e as ações primárias (ex: "Concluir e Ver Resumo") na margem inferior (Thumb Reach Zone) para uso em contexto agrícola e em andamento (tratores).

    4. ARQUITETURA FIRST-OFFLINE E APP SHELL (Dexie.js v8):
       - **Offline-First Absoluto:** É TERMINANTEMENTE PROIBIDO realizar chamadas síncronas de API bloqueantes. O carregamento da base visual (header, menu, skeleton) deve ser imediato a partir da cache local (Service Worker Workbox em CacheFirst).
       - **Persistência de Dados (Mutation Outbox):** Todas as mutações locais são guardadas primeiro no IndexedDB via tabela `mutation_outbox` (estado inicial `synced: 0`, `attempts: 0`).
       - **Sincronização Bidirecional:** O envio para o servidor (CentralGest ERPCloud) ocorre de forma assíncrona com resolução "Last-Write-Wins" (LWW) via `updatedAt` UTC ascendente e cabeçalho `X-Idempotency-Key` (UUIDv4). Use Background Sync API com salvaguarda universal via `window.addEventListener('online')` (Safari iOS).
       - **Retentativas:** Em caso de falha de rede ou HTTP 5xx, aplique Backoff Exponencial com teto de 30s. Erros de validação do cliente (HTTP 400) devem ser descartados da fila pendente (`synced: 1` com `lastError` para auditoria) para evitar bloqueio infinito.
       - **Segurança e Telemetria:** Nenhuma telemetria deve bloquear o código principal (use try/catch isolados). Tokens e dados de pagamento nunca devem ser expostos na cache ou hardcoded.

    5. COMPLIANCE AGRONÓMICA (Terminologia PT-PT Estrita):
       - A linguagem da aplicação deve ser o Português de Portugal (PT-PT) técnico e legal. É proibido o uso de coloquialismos ou PT-BR.
       - Substituições obrigatórias no UI e Código: 
         * Use "depósito", NUNCA "cuba" ou "tanque".
         * Use "produto fitofarmacêutico", NUNCA "veneno" ou "PF".
         * Use "calda", NUNCA "mistura".
         * Use "copa", NUNCA "canópia".

    6. USO CRITERIOSO DE ACRÓNIMOS OFICIAIS (DGAV E EPPO):
       - As siglas DGAV (Direção-Geral de Alimentação e Veterinária) e EPPO (European and Mediterranean Plant Protection Organization) NÃO devem ser inseridas de forma leviana, decorativa ou repetitiva na interface.
       - A sua menção está estritamente reservada para situações de fundamentação técnica, normativa ou bibliográfica direta (ex: indicar que o cálculo se baseia na "Norma EPPO PP 1/239"). Não saturar cabeçalhos, cartões ou ecrãs secundários com estas siglas quando não for imperativo.

    7. LISTA CANÓNICA DE PRODUÇÃO (20 Funcionalidades Oficiais Homologadas):
       Apenas as seguintes 20 funcionalidades estão autorizadas para produção, testes finais e publicação:
       • Bloco Calculadoras e Ferramentas Agronómicas:
         1. Ajuste da Dose (Método EPPO)
         2. Área de Parede Foliar (LWA)
         3. Consulta de pH
         4. Mistura de Calda (Concentração)
         5. Mistura de Calda (Dose)
         6. Ordem de Mistura
         7. Pré-Inspeção
         8. Tabelas de Débito (Comparador)
         9. Velocidade Real de Trabalho
         10. Volume de Copa (TRV)
       • Bloco Sistema, Dashboard & Integrações:
         11. Cartão de previsão meteorológica no dashboard
         12. Lista de municípios
         13. Lista de freguesias
         14. Definições
         15. Definições - Perfil do utilizador
         16. Definições - Co-branding & Personalização Institucional
         17. Login
         18. Base de dados no Firebase
         19. Definições - Perfil do utilizador no Firebase
         20. Definições - Co-branding & Personalização Institucional no Firebase

    8. PROTOCOLO DE QUARENTENA PARA ECRÃS EXPERIMENTAIS:
       - Todos os outros ecrãs, rotas ou vistas presentes no código que não constem nos 20 itens acima são considerados **EXPERIMENTAIS** (com funções de suporte pendentes).
       - É terminantemente proibido refatorar, otimizar, compilar para build de release ou tentar completar a lógica desses ecrãs sem ordem explícita.
       - O gating de ambiente (`environment.ts`) assegura que apenas as 10 ferramentas canónicas são expostas na versão de produção.

    9. GOVERNANÇA DE CÓDIGO E ARQUITETURA MODULAR:
       - **Limite Estrito de 200 Linhas:** Nenhum novo componente, serviço ou ficheiro de teste deve exceder 200 linhas de código. Se um ficheiro crescer além desse limite, DEVE ser particionado cirurgicamente em módulos especializados (ex: mappers, types, subcomponentes).
       - **Arquitetura Desacoplada (Ports & Adapters):** Serviços de integração externa (CentralGest ERPCloud, Stripe, Moodle) devem ser construídos como adaptadores plug-and-play, com flag de runtime `isSimulationMode: true` ativa por defeito, garantindo que operam em memória sem dependência de endpoints remotos até serem ativados no `.env`.

    10. AMBIENTE DE EXECUÇÃO LOCAL E PROTOCOLO DE COMUNICAÇÃO:
        - **Servidor Local Obrigatório:** O processo de desenvolvimento (`npm run dev`) deve permanecer sempre em execução em segundo plano no terminal integrado (`http://localhost:5173/daterra-smart/`).
        - **Notificação Ativa e Contínua a Cada Alteração:** É estritamente proibido realizar alterações cumulativas silenciosas. Sempre que um ficheiro for criado, refatorado ou editado, o agente deve reportar de imediato:
          * Caminho do ficheiro e natureza da alteração;
          * Impacto na arquitetura ou na interface;
          * Rota direta no `localhost` para inspeção visual imediata;
          * Estado da compilação (`tsc -b` / `oxlint`).

    11. CODE FREEZE ESTRITO — AJUSTE DA DOSE (MÉTODO EPPO):
        - Ficam 100% BLOQUEADOS contra qualquer alteração, refatoração ou edição os seguintes ficheiros homologados da ferramenta EPPO:
          * `src/features/ajuste-dose-eppo/eppoDoseDataMapper.ts`
          * `src/features/ajuste-dose-eppo/EppoDoseCalculator.tsx`
          * `src/features/ajuste-dose-eppo/EppoDoseResultCard.tsx`
          * `src/features/ajuste-dose-eppo/EppoDoseInputsPanel.tsx`
          * `src/features/ajuste-dose-eppo/EppoManualEntry.tsx`
          * `src/features/ajuste-dose-eppo/EppoHistoryImportModal.tsx`
          * `src/features/ajuste-dose-eppo/EppoProfileImportModal.tsx`
          * `src/features/ajuste-dose-eppo/eppoDoseStorage.ts`
          * `src/features/ajuste-dose-eppo/eppoProfileSyncService.ts`
          * `src/features/ajuste-dose-eppo/EppoDoseHeader.tsx`
          * `src/features/ajuste-dose-eppo/EppoDoseFooterBar.tsx`
          * `src/features/ajuste-dose-eppo/EppoDoseSecondaryParams.tsx`
          * `src/features/ajuste-dose-eppo/index.ts`
          * `test/ajuste-dose-eppo-integrado.test.mjs`
          * `test/ajuste-dose-eppo.test.mjs`
          * `test/perfil-telemetria-sync.test.mjs`
        - Nenhum agente ou subagente está autorizado a modificar estes ficheiros sem ordem e confirmação explícita do utilizador para desbloqueio ("Desbloquear EPPO").
        - EXCEÇÃO ÚNICA: O ficheiro de microlearning e apoio pedagógico (`src/features/ajuste-dose-eppo/EppoDoseGuideModal.tsx`) permanece desbloqueado para eventuais ajustes didáticos ou melhorias textuais.
  </instructions>
  
  <tools_usage>
    Utilize `read_file` e `run_command` para rastrear divergências e verificar continuamente a adesão do código aos 20 itens canónicos e aos limites de modularidade.
  </tools_usage>
</system_prompt>
