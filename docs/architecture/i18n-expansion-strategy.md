# 🌐 Diretiva Arquitetural: Estratégia de Expansão i18n DATERRA Smart

> **Status:** Aprovado & Em Vigor  
> **Data:** 27 de Outubro de 2026  
> **Âmbito:** Internacionalização e Localização Contínua (i18n / l10n)  
> **Conformidade:** Master Blueprint DATERRA, ISO 9241-210, DGAV / EPPO  

---

## 🎯 1. Princípio Fundamental: Expansão com Zero Refatoração React

A arquitetura de internacionalização da **DATERRA Smart** foi concebida para garantir que a adição de qualquer novo idioma (ex: Espanhol `es-ES`, Francês `fr-FR`, Italiano `it-IT`, Alemão `de-DE`) ocorra com **zero alterações** na camada de componentes visuais (`.tsx`).

Todo o ecossistema de interface consome o hook reativo `useTranslation()` / `useLanguage()`, indexado por chaves canónicas estáveis.

---

## 🏛️ 2. Fonte Canónica e Mapeamento 1:1

### 2.1 Fonte Única de Verdade (`pt-PT.json`)
O ficheiro `src/i18n/locales/pt-PT.json` é a **fonte mestre canónica** de todas as chaves e textos da aplicação. Nenhuma chave pode existir num idioma secundário sem estar previamente validada e registada no dicionário de Português (Portugal).

### 2.2 Paridade Estrita de Chaves (1:1 Key Mapping)
O processo de criação de um novo idioma segue estritamente este fluxo:
1. Duplicar `src/i18n/locales/pt-PT.json` para o novo código IETF BCP 47 (ex: `src/i18n/locales/es-ES.json`).
2. Traduzir os valores preservando rigorosamente:
   - Nomes das chaves (imutáveis).
   - Variáveis dinâmicas no formato `{{variable}}` (ex: `{{name}}`, `{{count}}`).
   - Jargão agronómico institucional aprovado.
3. Não são permitidas chaves adicionais nem chaves em falta (validado por testes automatizados de CI/CD).

---

## 📐 3. Absorção de Variações de Comprimento pelo CSS (Layout Resiliente)

Diferentes línguas apresentam expansões naturais de texto (por exemplo, termos técnicos em Alemão ou Francês podem ser 20% a 40% mais longos do que em Português ou Inglês). A interface da DATERRA Smart absorve estas variações diretamente na camada CSS / Tailwind:

1. **Flexbox Dinâmico e Quebras Controladas:**
   - Uso de `flex-wrap`, `gap-*` e alinhamentos resilientes em cabeçalhos, barras de ferramentas e botões.
   - Proibição de larguras fixas em pixels (`w-[120px]`) em contentores de texto.
2. **Prevenção de Quebras de Layout:**
   - Classes `min-w-0`, `truncate` (com tooltip explicativo quando necessário) ou `break-words` em títulos longos.
3. **Ergonomia e Alvos de Toque (ISO 9241-210):**
   - Altura mínima preservada de $48\text{ px}$ (`touch-target`) independentemente do número de linhas gerado pelo texto.
   - Espaçamento táctil seguro para utilização no campo em dispositivos móveis sob luz solar intensa.

---

## 🚀 4. Protocolo de Introdução de um Novo Idioma

Para ativar um novo idioma no sistema, o engenheiro necessita apenas de cumprir 3 passos cirúrgicos:

```markdown
Passo 1: Criar o dicionário JSON
  📁 src/i18n/locales/es-ES.json (cópia 1:1 traduzida de pt-PT.json)

Passo 2: Registar a opção no LanguageContext
  No ficheiro src/context/LanguageContext.tsx:
  - Adicionar o código ao tipo SupportedLanguage: 'pt-PT' | 'en-GB' | 'es-ES' ...
  - Importar o ficheiro JSON.
  - Adicionar o idioma à constante LANGUAGE_OPTIONS:
    { code: 'es-ES', label: 'Español', flag: '🇪🇸' }

Passo 3: Validação de QA
  Executar a suite de testes: node test/qa-i18n-dom-scan.test.mjs
```

Nenhum ficheiro em `src/views/` ou `src/features/` necessita de intervenção.

---

## 🛡️ 5. Blindagem e Governança

1. **Limpeza Contínua (Zero Hardcoding):**
   - É expressamente proibida a introdução de literais estáticos de texto diretamente no JSX.
2. **Fallback Gracioso:**
   - Caso uma chave não seja encontrada no idioma ativo, o motor `useTranslation` recorre automaticamente ao valor correspondente em `pt-PT` ou ao valor por omissão fornecido no fallback `t('chave', 'Texto Fallback')`.
3. **Auditoria Automatizada:**
   - A suite de regressão visual e sintática assegura paridade total de chaves e conformidade com o teto de 200 LOC por ficheiro.
