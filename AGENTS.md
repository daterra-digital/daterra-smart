# 📋 AGENTS.md — Protocolo de Desenvolvimento DATERRA Smart

> Este ficheiro é a diretriz mestre e obrigatória para todos os agentes de IA (Antigravity) que operam no repositório `daterra-smart-app`.
> Todas as instruções abaixo têm prioridade máxima sobre comportamentos padrão.

---

## 🚦 1. PROTOCOLO OBRIGATÓRIO DE APROVAÇÃO (Gate de 3 Tópicos)

**REGRA DE OURO:** O agente está **terminantemente proibido de alterar ou criar ficheiros de código** diretamente após um pedido do utilizador sem antes apresentar o plano resumido e obter autorização expressa.

Sempre que o utilizador fizer um pedido, o agente deve responder **exclusivamente com este formato conciso de 3 tópicos**:

```markdown
### 🎯 Proposta de Implementação
1. **O que vai ser feito:** [Descrição em 1-2 frases do elemento exato a criar ou ajustar]
2. **O que NÃO vai ser tocado:** [Lista explícita dos componentes e ficheiros existentes que ficam 100% blindados contra alterações]
3. **Impacto Visual & Agronómico:** [O que o agricultor/utilizador vai ver no ecrã e como afeta a experiência mobile-first]

👉 *Aprova esta abordagem ou pretende algum ajuste antes de avançar para o código?*
```

* Se o utilizador responder **"Aprovado"**, **"Avança"**, **"Sim"** ou **"OK"**: o agente avança para a implementação.
* Se o utilizador pedir alterações: o agente ajusta a proposta e aguarda nova aprovação.

---

## 🎨 2. FLUXO VISUAL FIRST (Sketch $\rightarrow$ Maquete $\rightarrow$ Código)

1. Para qualquer alteração visual ou nova ferramenta, se o utilizador fornecer um rascunho (sketch), descrição de ideia ou pedir melhorias visuais:
   * O agente deve primeiro renderizar uma **Maquete Visual Interativa num Artifact** (usando Tailwind CSS com os tokens oficiais da DATERRA).
   * O utilizador pode visualizar, clicar e aprovar o layout no painel lateral do Antigravity.
   * **Nenhum ficheiro em `src/` deve ser modificado** até a maquete ser validada visualmente pelo utilizador.
2. **Integração Google Stitch:**
   * O agente suporta especificações, tokens e componentes desenhados no **Google Stitch** via servidor MCP ou código exportado.
   * Ao importar do Google Stitch, o agente deve mapear automaticamente as cores e tipografias para os tokens existentes em `src/index.css`.

---

## 🛡️ 3. BLINDAGEM CONTRA REGRESSÕES & BLUEPRINT DE UX

1. **Modularidade Cirúrgica (Proibido Inchar Monólitos):**
   * **Nenhum novo componente deve exceder 200 linhas de código.**
   * Se for necessário adicionar uma nova funcionalidade a um ficheiro grande (como `UniversalCalculatorTemplate.tsx` ou `ExplorationView.tsx`), o agente **DEVE criar um ficheiro novo e isolado** em `src/features/...` e apenas importá-lo no ficheiro principal.
   * **Nunca reescrever ficheiros inteiros** quando uma edição pontual é suficiente.
2. **Validação Automática Pós-Implementação:**
   * Após qualquer alteração de código, o agente deve executar obrigatoriamente:
     1. Verificação de código com Oxlint: `npm run lint`
     2. Suite de testes de validação matemática: `node test/calibracao-pulverizador-fase-a.test.mjs`, etc.
   * Se algum teste falhar, o agente deve corrigir a regressão **antes** de dar a tarefa como concluída.
3. **Master Blueprint das Calculadoras (Padrão Oficial IMAGE-1 & IMAGE-3):**
   * **Zero Poluição Visual:** Proibido colocar parágrafos de ajuda, notas de rodapé ou botões "Ajuda" repetidos no meio dos inputs.
   * **Estrutura Obrigatória do Ecrã de Cálculo:**
     1. Topo: `< Voltar às Ferramentas` + Badge `Ferramenta Ativa`.
     2. Título curto e Categoria em maiúsculas (ex: `PULVERIZAÇÃO`).
     3. Cartão de Resultado Verde `#114037` no topo com números grandes `JetBrains Mono`.
     4. Seletor de Modo/Estratégia (quando aplicável).
     5. Cartão **"Valores Introduzidos"**: Lista limpa de parâmetros com valor atual e ícone de edição (✏️).
     6. Barra de Rodapé Fixa: Botão verde `Guardar Histórico` + Botão `Histórico (N)` + Botão `Guia`.
   * **Acionamento do DaterraKeypad:** O toque em qualquer parâmetro do cartão abre o `DaterraKeypad` em bottom sheet, mantendo o resultado visível no topo e atalhos rápidos específicos.
   * **Centralização de Conteúdo Didático no Botão [Guia]:** Todo o microlearning, FAQs, manuais DGAV/EPPO e explicações detalhadas residem 100% dentro do modal acionado pelo botão `Guia`.

---

## 🌾 4. RIGOR AGRONÓMICO & TERMINOLOGIA INSTITUCIONAL (DGAV / EPPO)

1. **Termos Expressamente Proibidos (PT-PT Obrigatório):**
   * ❌ **Proibido usar "cuba"** $\rightarrow$ Utilizar sempre **"depósito"**.
   * ❌ **Proibido usar "PF"** $\rightarrow$ Utilizar sempre **"produto fitofarmacêutico"** ou **"calda"**.
   * ❌ **Proibido usar variantes de português do Brasil** na interface principal e nos dicionários `pt.json`.
2. **Vocabulário Oficial Estabelecido:**
   * *Calda, débito, entrelinha, volume de calda sugerido, bicos, parede foliar (LWA), volume de copa (TRV).*
3. **Ergonomia de Campo Mobile-First:**
   * Inputs numéricos devem acionar obrigatoriamente o componente `DaterraKeypad`.
   * Botões e zonas de toque devem ter no mínimo **48px de altura** (`.touch-target`).
   * Alto contraste solar (fundo `#F2F2F2`, verde floresta `#114037`, acento verde `#3CA64C`).

---

## 🔒 5. SEGURANÇA E DEPLOY

1. **Proteção de Segredos:**
   * Nunca escrever, comitar ou expor variáveis de ambiente de produção, credenciais FTP do cPanel ou chaves secretas do Supabase.
2. **Deploy Controlado:**
   * A publicação em cPanel só ocorre mediante autorização explícita e através do workflow `.github/workflows/deploy-cpanel.yml`.
