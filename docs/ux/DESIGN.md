# 🌿 DATERRA Smart — Design System & Visual Guidelines (DESIGN.md)

> **Projeto:** DATERRA Smart — PWA SaaS Suite Agrícola Offline-First  
> **Master Blueprint:** Modelo Canónico de 3 Camadas (Ecrã Limpo + DaterraKeypad Sheet + Modal Guia)  

---

## 1. O Modelo Canónico de Calculadoras (Regra Anti-Poluição Visual)

### 🚫 O QUE É ESTRITAMENTE PROIBIDO:
- **Proibido colocar paredes de texto, explicações longas ou FAQs no meio dos inputs da calculadora.** O agricultor no campo e no trator precisa de foco máximo e zero distrações.
- **Proibido colocar botões repetidos de "Ajuda" em cada campo.**

### 🏛️ A ARQUITETURA DE 3 CAMADAS (MODELO OFICIAL):

```
┌────────────────────────────────────────────────────────┐
│  CAMADA 1: ECRÃ PRINCIPAL DA FERRAMENTA (IMAGE-1)      │
│  • Topo: Voltar às Ferramentas + Badge Ferramenta Ativa│
│  • Título Curto + Categoria (ex: PULVERIZAÇÃO)         │
│  • Cartão de Resultado Verde em destaque               │
│  • Seletor de Modo (ex: [Planta Jovem] [Planta Adulta])│
│  • Cartão "Valores Introduzidos":                      │
│    - Linha 1: Volume a Preparar (L)        400 L  ✏️   │
│    - Linha 2: Concentração do Produto   100 mL/hL ✏️   │
│  • Barra Inferior Fixa:                                │
│    [ Guardar Histórico ]  [ Histórico (N) ]  [ Guia ]  │
└────────────────────────────────────────────────────────┘
                           │
       Ao tocar num campo  │  Ao tocar em [ Guia ]
       (ex: 400 L)         ▼
┌───────────────────────────────────┐ ┌──────────────────────────────────┐
│ CAMADA 2: DATERRAKEYPAD (IMAGE-3) │ │ CAMADA 3: MODAL DE GUIA          │
│ • Resumo do cálculo fixo no topo  │ │ • Abertura em Modal / Sheet      │
│ • Campo ativo [A EDITAR]          │ │ • Toda a informação técnica DGAV │
│ • Atalhos de depósito (200, 400…) │ │ • Parâmetros explicados          │
│ • Teclado numérico/aritmético     │ │ • Fórmulas e microlearning       │
│ • Botões: [CANCELAR] [CONCLUIR]   │ │ • FAQs completas sem poluição    │
└───────────────────────────────────┘ └──────────────────────────────────┘
```

---

## 2. Tipografia e Cores Oficiais

### Tipografia:
- **Títulos, Botões, Etiquetas e Textos:** `Plus Jakarta Sans`, sans-serif (Bold 700 / SemiBold 600).
- **Valores Numéricos, Doses e Visores:** `JetBrains Mono`, monospace (Bold 700 / Black 900 com algarismos tabulares).
- **Regra:** ZERO fontes serifadas.

### Cores Oficiais:
- **Fundo da App:** `#F2F2F2` (Cinza claro solar).
- **Topbar e Cartão de Resultado:** Verde floresta escuro `#114037`.
- **Botões Principais e Ação:** Verde vibrante `#3CA64C`.
- **Cartão de Parâmetros ("Valores Introduzidos"):** Fundo `#FFFFFF`, cantos `rounded-2xl`, linhas com separador subtil e ícone de edição (✏️).
- **Barra de Rodapé:**
  - Botão Primário (*Guardar Histórico*): Verde escuro `#114037` com texto branco.
  - Botão Secundário (*Histórico*): `#E2E8F0` / `#FFFFFF` com badge circular.
  - Botão de Apoio (*Guia*): Cinza suave `#E2E8F0` ou `#EEF2F6`.

---

## 3. Adaptação para Outras Ferramentas da Suite

Este modelo é **idêntico e replicável** para todas as outras calculadoras (Débito Total, Dose por Hectare, Calibração de Bicos, Drones):
1. O cartão verde de topo adapta-se ao resultado principal da ferramenta (ex: `96,0 L/min` no Débito Total).
2. O cartão "Valores Introduzidos" lista os parâmetros específicos daquela ferramenta (ex: `Velocidade (km/h)`, `Largura da Barra (m)`, `Volume Pretendido (L/ha)`).
3. O `DaterraKeypad` abre com os atalhos adequados para cada parâmetro (ex: atalhos de velocidade `4, 6, 8, 10` ou atalhos de depósito `200, 400, 600, 1000`).
