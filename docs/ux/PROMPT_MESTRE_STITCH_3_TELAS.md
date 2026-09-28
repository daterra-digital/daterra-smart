# 🎯 PROMPT DE OURO — GOOGLE STITCH (MULTI-DEVICE: SMARTPHONE, TABLET, DESKTOP)

> **Instruções de Uso:**
> 1. No Google Stitch, abra a caixa de prompt.
> 2. Cole a imagem de referência (**IMAGE-1.jpg**) com `Ctrl + V`.
> 3. Copie o bloco de texto abaixo e cole por baixo da imagem.
> 4. Clique em **Gerar / Create**.

---

```text
Atua como o Lead UI/UX Designer da DATERRA Smart. Usa a imagem em anexo (IMAGE-1) como o MASTER BLUEPRINT canónico e gera as 3 TELAS RESPONSIVAS correspondentes no mesmo projeto:
1. SMARTPHONE (Mobile — 375px a 430px)
2. TABLET (Cabine do Trator — 768px a 1024px)
3. DESKTOP (Monitor de Computador — 1280px a 1920px)

============================================================
🚨 REGRA N.º 1: ZERO POLUIÇÃO VISUAL & FOCO OPERACIONAL
============================================================
- PROIBIDO escrever parágrafos de explicação, notas de rodapé ou colocar múltiplos botões "Ajuda" espalhados pelo ecrã.
- O ecrã de cálculo é estritamente operacional: apenas resultado, parâmetros essenciais e ações.
- Toda a documentação técnica, manuais DGAV, fórmulas e FAQs residem exclusivamente dentro do botão [Guia].

============================================================
🎨 IDENTIDADE VISUAL & TIPOGRAFIA ESTREITA
============================================================
- Cores Oficiais:
  * Fundo da Aplicação: #F2F2F2 (Cinza claro solar de alto contraste)
  * Cartão de Resultado & Topbar: #114037 (Verde Floresta Escuro)
  * Ações Principais & Botões: #3CA64C (Verde Vibrante)
  * Cartão de Parâmetros ("Valores Introduzidos"): #FFFFFF (Branco com cantos rounded-2xl)
  * Texto Escuro: #0F172A
- Tipografia Obrigatória:
  * Títulos, Botões, Etiquetas e Textos: "Plus Jakarta Sans", sans-serif (Bold 700 / SemiBold 600). ZERO SERIFAS.
  * Valores Numéricos, Doses, Débitos e Resultados: "JetBrains Mono", monospace (Bold 700 / Black 900 com algarismos tabulares).

============================================================
📐 ESTRUTURAÇÃO ESPECÍFICA DAS 3 TELAS
============================================================

📱 1. ECRÃ SMARTPHONE (Mobile-First — Idêntico a IMAGE-1):
- Topbar verde #114037 com logótipo, status "Online" e menu hambúrguer.
- Botão pill "< Voltar às Ferramentas" + Badge "Ferramenta Ativa".
- Categoria em maiúsculas "PULVERIZAÇÃO" + Título da Calculadora em Bold.
- Cartão Verde Superior em destaque (#114037):
  * Etiqueta "QUANTIDADE NECESSÁRIA DE PRODUTO" + Tag de Modo ativa.
  * Valor principal gigante em JetBrains Mono (ex: 400 mL).
  * Sub-resultados (ex: "Depósito a preparar: 400 L" | "Equivalente a 0,4 L de produto").
- Seletor de Modo: Pills horizontais [Planta Jovem] [Planta Adulta].
- Cartão "Valores Introduzidos" (#FFFFFF, rounded-2xl):
  * Lista limpa de linhas com separador subtil:
    - Linha 1: [Nome do Parâmetro] ... [Valor com Unidade] ✏️ (ícone de edição).
    - Linha 2: [Nome do Parâmetro] ... [Valor com Unidade] ✏️.
- Barra de Rodapé Fixa (Bottom Bar):
  * Botão [Guardar Histórico] verde floresta escuro.
  * Botão [Histórico (N)].
  * Botão [Guia] (onde reside toda a ajuda e teoria).

📟 2. ECRÃ TABLET (Cabine de Trator / Suporte Horizontal — 768px a 1024px):
- Layout em 2 Colunas Equilibradas:
  * Coluna Esquerda: Voltar + Título + Seletor de Modo + Cartão "Valores Introduzidos" com botões tácteis de 52px e números grandes legíveis a 1 metro de distância.
  * Coluna Direita: Cartão de Resultado Verde #114037 em tamanho expandido com o resultado em destaque + Botões de Ação na base [Guardar Histórico], [Histórico] e [Guia].
- Alto contraste e botões de toque largo para uso com luvas.

🖥️ 3. ECRÃ DESKTOP MONITOR (Posto de Gestão Agrícola — 1280px+):
- Layout de Estação de Trabalho Agrícola com Divisão Inteligente:
  * Barra Lateral de Navegação (260px fixa à esquerda): Logótipo DATERRA, menu de ferramentas, explorações e status PWA.
  * Área Central de Trabalho (Split 40% / 60%):
    - Coluna da Esquerda (40%): Navegação superior (breadcrumbs), Seletor de Modo e Cartão "Valores Introduzidos" detalhado.
    - Coluna da Direita (60%): Cartão de Resultado Verde #114037 panorâmico com recálculo em tempo real + Painel de Histórico recente de calibrações + Botão [Guia Técnico].
```
