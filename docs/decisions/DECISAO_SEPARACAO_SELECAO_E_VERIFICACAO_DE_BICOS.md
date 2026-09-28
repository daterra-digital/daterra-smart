# Decisão Arquitetural: Separação de Âmbito na Calibração de Pulverizadores
## Seleção de Bicos vs. Verificação de Desgaste (ISO 16122)

**Data:** 08/09/2026  
**Módulo:** `calc_calibracao_pulverizador` (DATERRA Smart)  
**Estado:** Aprovado / Implementado  

---

### 1. Contexto e Motivação

A calculadora `calc_calibracao_pulverizador` foi concebida para orientar o utilizador no planeamento agronómico e operacional de tratamentos fitossanitários em culturas arbóreas e arbustivas, integrando os modelos normalizados LWA (*Leaf Wall Area* — EPPO PP 1/239) e TRV (*Tree Row Volume*).

Durante a evolução do módulo, foi inicialmente incluída uma secção de "Fase C — Verificação do débito dos bicos", que comparava o volume recolhido numa proveta graduada diretamente com o débito teórico requerido calculado na Fase B ($Q_{\text{bico}}$), aplicando a tolerância de $\pm 10\%$ da norma ISO 16122.

---

### 2. Fundamentação Técnica e Normativa da Decisão

A aplicação direta da tolerância de $\pm 10\%$ entre o débito requerido pela Fase B e uma medição isolada de proveta é tecnicamente incorreta pelos seguintes motivos:

1. **Âmbito da Norma ISO 16122 (e Diretiva de Inspeção Periódica de Pulverizadores):**  
   A tolerância de $\pm 10\%$ (e $\pm 5\%$ para novos equipamentos) da ISO 16122 destina-se exclusivamente à comparação entre:
   $$\text{Débito medido no bico instalado} \quad \text{vs.} \quad \text{Débito nominal tabelado pelo fabricante para esse bico, à pressão de ensaio}$$
   Essa medição serve para diagnosticar o **desgaste mecânico, erosão do orifício ou entupimento** do bico em relação à sua curva original de fábrica.

2. **Diferença entre Débito Requerido ($Q_{\text{bico}}$) e Débito Nominal de Fábrica:**  
   O débito requerido ($Q_{\text{bico}} = \frac{V \times S \times W}{600 \times N}$) calculado na Fase B é uma **meta agronómica** (ex: $0,612\text{ L/min}$). O agricultor não dispõe necessariamente de um bico cujo catálogo indique exatamente $0,612\text{ L/min}$ a uma pressão padrão; em vez disso, seleciona um bico comercial (ex: ISO 02 Amarelo ou ISO 015 Verde) e ajusta a pressão de trabalho no manómetro para obter a vazão aproximada pretendida.

3. **Ausência de Metadados de Catálogo no Módulo Atual:**  
   A calculadora `calc_calibracao_pulverizador` não recolhe nem armazena:
   - Marca do bico (Albuz, TeeJet, Lechler, Arag, etc.);
   - Modelo (leque, cone oco, antideriva/injeção de ar);
   - Calibre/Cor ISO (01, 015, 02, 025, 03, etc.);
   - Tabela de débitos nominais em função da pressão ($1\text{ a }20\text{ bar}$).

Portanto, emitir um diagnóstico de conformidade ou desgaste com base apenas em $Q_{\text{bico}}$ induzia em erro técnico e normativo.

---

### 3. Delimitação Estrita do Âmbito de `calc_calibracao_pulverizador`

O ciclo de vida da calculadora `calc_calibracao_pulverizador` fica estritamente circunscrito a:

- **Fase A — Planeamento Agronómico:**  
  Determinação da área foliar tratada (LWA em $\text{m}^2/\text{ha}$) ou volume de copa (TRV em $\text{m}^3/\text{ha}$), volume de calda recomendado ($V$ em $\text{L/ha}$), dosagem e produto por depósito.
- **Fase B — Ajuste Operacional:**  
  Determinação da velocidade de avanço ($S$ em $\text{km/h}$), largura de trabalho ($W$ em $\text{m}$), número de bicos ativos ($N$), resultando em:
  - Débito Total Requerido ($Q_{\text{total}} = \frac{V \times S \times W}{600}\text{ L/min}$);
  - Débito Requerido por Bico ($Q_{\text{bico}} = \frac{Q_{\text{total}}}{N}\text{ L/min}$);
  - Tempo Teórico por Hectare ($T = \frac{600}{S \times W}\text{ min/ha}$).

A ferramenta encerra o seu resultado no valor de referência $Q_{\text{bico}}$, com a salvaguarda clara ao operador:  
> *"Este é um valor de referência para selecionar e regular os bicos. Confirme as especificações do fabricante antes de aplicar."*

---

### 4. Roteiro de Ferramentas Futuras (Arquitetura Modular)

Para cobrir integralmente as necessidades operacionais e regulamentares do agricultor, serão disponibilizadas duas ferramentas dedicadas e independentes:

1. **Ferramenta / Assistente de Seleção de Bicos:**  
   Recebe o débito requerido ($Q_{\text{bico}}$) e a gama de pressões admissíveis, consultando a base de dados de fabricantes para sugerir as cores/calibres ISO e tipos de bico adequados.
2. **Ferramenta de Verificação de Desgaste e Uniformidade (ISO 16122):**  
   Recebe o modelo de bico instalado, a pressão de manómetro aferida e as leituras individuais de proveta, calculando:
   - Desvio relativo face ao débito nominal de fábrica ($\text{Desvio \%} = \frac{Q_{\text{medido}} - Q_{\text{nominal}}}{Q_{\text{nominal}}} \times 100$);
   - Uniformidade entre bicos da mesma barra/arco ($\le 10\%$);
   - Alertas de substituição individual ou de conjunto completo.

---

### 5. Conclusão

Esta separação garante rigor agronómico, conformidade estrita com os referenciais da DGAV e ISO 16122, elimina falsos diagnósticos no campo e mantém a arquitetura da DATERRA Smart limpa, modular e extensível.
