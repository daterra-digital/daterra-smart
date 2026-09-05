# DATERRA Smart - Checklist de QA & Validação de Campo (Versão 1.1)

> **Módulo:** Comparador de Bicos de Pulverização (Versão 1.1 • Revisão Final)  
> **Fórmula Oficial:** $Q_2 = Q_1 \times \sqrt{P_2 / P_1}$ (texto simples: `Q2 = Q1 × sqrt(P2 / P1)`; código: `Q2 = Q1 * Math.sqrt(P2 / P1)`)  
> **Normas de Referência:** ISO 10625:2018, ISO 5682-1, ISO 25358, BCPC / ASABE S572.1, Manuais Oficiais DGAV e EPPO PP 1/239.  
> **Estado dos Testes Automatizados:** 34/34 Aprovados (100%)  
> **Estado do Build:** `npm run build` (PWA Offline precache gerado)

---

## 📋 Matriz de Verificação dos 30 Requisitos da Versão 1.1

| # | Requisito / Funcionalidade | Procedimento de Teste | Resultado Esperado | Estado |
|---|---|---|---|:---:|
| **1** | **Identificação Modular** | Selecionar `Albuz` $\to$ `Disc & Core` | Apresenta dropdowns de *Difusor* e *Disco / Pastilha*. | ✅ Aprovado |
| **2** | **Ocultação de Difusor** | Selecionar `Albuz` $\to$ `ATR` | Não renderiza dropdown de Difusor. | ✅ Aprovado |
| **3** | **Ocultação de Disco/Pastilha** | Selecionar `TeeJet` $\to$ `XR` | Não renderiza dropdown de Disco/Pastilha. | ✅ Aprovado |
| **4** | **Bico por Cor sem Código ISO** | Selecionar `Albuz` $\to$ `ATR 80` | Apresenta Cor e nota "Código ISO: Não aplicável". | ✅ Aprovado |
| **5** | **Bico com Cor ISO & Código ISO** | Selecionar `TeeJet` $\to$ `XR 110-02` | Apresenta etiqueta "ISO 02" e cor "Amarelo". | ✅ Aprovado |
| **6** | **Bico por Referência** | Selecionar bico monobloco | Apresenta "Referência do fabricante". | ✅ Aprovado |
| **7** | **Ângulo Nominal Fixo** | Inspecionar bico de ângulo fixo | Exibe `"Ângulo nominal: 80°"`. | ✅ Aprovado |
| **8** | **Ângulo a Pressão de Ref.** | Ajustar $P = P_{ref}$ | Exibe `"Ângulo: 80° a 3,0 bar"`. | ✅ Aprovado |
| **9** | **Ângulo Variável com Pressão** | Inspecionar bicos com variação angular | Exibe `"Ângulo: 70°–79°, consoante a pressão"`. | ✅ Aprovado |
| **10** | **Ângulo Não Disponível** | Bico sem dados angulares | Exibe `"Ângulo: Não disponível"`. | ✅ Aprovado |
| **11** | **Dois Modos no Início** | Aceder ao ecrã inicial do módulo | Dois botões grandes: `[ Comparar dois bicos ]` e `[ Encontrar alternativas ]`. | ✅ Aprovado |
| **12** | **Pesquisa por Débito Desejado** | Modo Alternativas $\to$ Inserir `0,80 L/min` | Lista todos os bicos com débito correspondente à pressão. | ✅ Aprovado |
| **13** | **Pesquisa por Pressão** | Modo Alternativas $\to$ Ajustar pressão | Recalcula débitos dinamicamente. | ✅ Aprovado |
| **14** | **Filtro por Marca** | Filtrar por `Lechler` | Apresenta apenas alternativas da marca Lechler. | ✅ Aprovado |
| **15** | **Filtro por Tipo de Bico** | Filtrar por `Cone vazio` | Apresenta apenas bicos do tipo cone vazio. | ✅ Aprovado |
| **16** | **Filtro por Modelo** | Filtrar por `ATR` | Apresenta apenas variantes do modelo ATR. | ✅ Aprovado |
| **17** | **Filtros de Tolerância** | Alternar entre $\pm 5\%$, $\pm 10\%$ e $\pm 15\%$ | Expansão progressiva do número de alternativas listadas. | ✅ Aprovado |
| **18** | **Ordenação Primária** | Inspecionar lista de alternativas | Bicos ordenados por menor diferença $|\Delta Q|$ de débito. | ✅ Aprovado |
| **19** | **Ordenação Secundária** | Empate em $|\Delta Q|$ | Prioriza menor sensibilidade potencial à deriva. | ✅ Aprovado |
| **20** | **Metadados do Fabricante** | Clicar "Ver detalhes" em qualquer bico | Mostra País, Grupo empresarial, Nicho, Gamas e Tecnologia. | ✅ Aprovado |
| **21** | **Ausência de Medição Lab.** | Variante sem ensaio laboratorial | Exibe `"Medição laboratorial: Não disponível"`. | ✅ Aprovado |
| **22** | **Estrutura de Evidência Lab.** | Consultar ensaio acreditado | Mostra nome real da entidade, método e data do ensaio. | ✅ Aprovado |
| **23** | **Rótulo Espectro Fabricante** | Dados oficiais de catálogo | Exibe `"Espectro de gotas indicado pelo fabricante"`. | ✅ Aprovado |
| **24** | **Rótulo Medição Lab.** | Dados de ensaio independente | Exibe `"Espectro de gotas obtido por medição laboratorial"`. | ✅ Aprovado |
| **25** | **Rótulo Estimativa Espectro** | Dados inferidos sem ensaio | Exibe `"Indicação estimada de espectro de gotas"` com nota. | ✅ Aprovado |
| **26** | **Débito Total do Conjunto** | Expandir secção $\to$ Inserir 24 bicos | Calcula $Q_{total} = Q_{bico} \times N$ com nota oficial de proveta. | ✅ Aprovado |
| **27** | **Sem Cálculo de L/ha** | Verificar secção de débito da barra | Não calcula volume por hectare (L/ha) nesta versão. | ✅ Aprovado |
| **28** | **Terminologia Rigorosa** | Verificar toda a interface e textos | Usa "Bico A/B", "Débito" e proíbe "caudal" / "Ponta A/B". | ✅ Aprovado |
| **29** | **Persistência Completa** | Guardar e carregar no Histórico | Repõe marca, modelo, difusor, disco, pressão e modo. | ✅ Aprovado |
| **30** | **Microlearning (15 Tópicos)** | Abrir modal de Microlearning | 15 tópicos canónicos com rigor pedagógico DGAV/EPPO. | ✅ Aprovado |

---

## 🔬 Três Casos de Confirmação Hidráulica

- **Caso 1 ($0,80\text{ L/min a 3 bar} \to 6\text{ bar}$)**: $Q_2 = 0,80 \times \sqrt{6/3} \approx 1,13\text{ L/min}$ ($+41,4\%$, NÃO $+100\%$)
- **Caso 2 ($0,80\text{ L/min a 3 bar} \to 12\text{ bar}$)**: $Q_2 = 0,80 \times \sqrt{12/3} = 1,60\text{ L/min}$
- **Caso 3 ($0,79\text{ L/min a 3 bar} \to 2\text{ bar}$)**: $Q_2 = 0,79 \times \sqrt{2/3} \approx 0,65\text{ L/min}$
