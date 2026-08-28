Módulo 1: Geometria da Cultura e Expressão de Dose (Norma EPPO PP 1/239)

1. Área de Parede Foliar (LWA - Leaf Wall Area)
Nome: Área de Parede Foliar
Objetivo: Calcular a área vertical de folhagem tratada por hectare, assumindo o tratamento de ambas as faces da linha da cultura.
Variáveis: h ou tCH (Altura da vegetação tratada); r ou Ww (Distância entrelinha).
Unidades: h (m); r (m); LWA (m2 LWA/ha)
Fórmula: LWA = (h x 2 x 10000) / r
Regras: O divisor (r) não pode ser zero e o resultado deve ser apresentado como número inteiro.
Limites: 0.5 < h < 6.0; 1.5 < r < 10.0
Exemplo: h = 3.5; r = 4.0; LWA =  (3.5 x 2 x 10000) / 4.0 = 17500 m2 LWA/ha
Ambiguidades: Multiplicidade de símbolos entre as fontes para a mesma métrica (ex: a distância entrelinha é referida como r, Ww ou R).

2. Volume de Copa (TRV - Tree Row Volume)
Nome: Volume de Copa
Objetivo: Calcular o volume tridimensional em metros cúbicos ocupado pela vegetação por hectare.
Variáveis: h (Altura da copa); w (Largura média da copa); r (Distância entrelinha).
Unidades: h (m); w (m); r (m); TRV (m3 TRV/ha)
Fórmula: TRV = (h x w x 10000) / r
Regras: O divisor (r) não pode ser zero e o valor deve ter no máximo uma casa décimal.
Limites: 0.5 < h < 6.0; 0.2 < w < 5.0; 1.5 < r < 10.0
Exemplo: h = 3.5; w = 0.7; r = 4.0. TRV = (3.5 x 0.7 x 10000) / 4.0 = 6125 m3 TRV/ha
Ambiguidades: Nenhuma identificada além da nomenclatura variável das letras.

3. Conversão de Concentração para Dose de Área de Superfície (D_GA)
Nome: Dose por Área de Superfície
Objetivo: Determinar a dose absoluta por área de superfície a partir da recomendação de concentração de calda indicada no rótulo.
Variáveis: D_hl (Concentração do pesticida); V (Volume de Calda).
Unidades: D_hl (%); V (L/ha); DGA (L_ai/ha ou kg/ha)
Fórmula: D_GA = (D_hl x V) / 100
Regras: V não pode ser zero e a saída exige precisão de duas a três casas decimais.
Limites: Específico para cálculos a partir da concentração em percentagem.
Exemplo: D_hl = 0.23, V = 600. D_GA = (0.23 x 600) / 100 = 1.38 L_ai/ha
Ambiguidades: A concentração (D_hl) apresenta-se por vezes em g/hl, o que invalida a divisão estrita por 100 descrita para a percentagem sem ajuste prévio de unidades.

4. Conversão de Área de Superficie para Parede Foliar (D_LWA)
Nome: Dose de Parede Foliar
Objetivo: Normalizar a dose 2D para a unidade padrão EPPO de 10.000 m2 de parede foliar.
Variáveis: D_GA (Dose por área de superfície); LWA (Área de parede foliar).
Unidades: D_GA (L_ai/ha ou kg/ha); LWA (m2 LWA/ha); D_LWA (L_ai/10.000 m2 LWA)
Fórmula: D_LWA = (D_GA x 10000) / LWA
Regras: LWA > 0, exigindo 2 a 3 casas decimais de precisão
Limites: N/A
Exemplo: D_GA = 1.38; LWA = 17500. D_LWA = (1.38 x 10000) / 17500 = 0.78 L_ai/10.000 m2 LWA

5. Conversão de Parede Foliar para Volume de Copa (D_TRV)
Nome: Dose de Volume de Copa
Objetivo: Transitar a recomendação de superfície foliar para o volume tridimensional exato da árvore.
Variáveis: D_LWA (Quantidade de pesticida por LWA); w (Largura média da copa).
Unidades: D_LWA (L_ai / 10.000 m2 LWA); w (m); D_TRV (L_ai / 10.000 m3 TRV)
Fórmula: D_TRV = (D_LWA x 2) / w
Regras: w > 0, com 2 a 3 casas decimias.
Limites: 0.2 < w < 5.0
Exemplo: D_LWA = 0.78; w = 0.7. D_TRV = (0.78 x 2) / 0.7 = 2.22 L_ai/10.000 m3 TRV
Ambiguidades: O arredondamento do passo anterior (D_LWA) afeta este cálculo (0.788 x 2 / 0.7 = 2.55, mas o documento cita o exemplo como 2.22)

6. Conversão de Dose Volume de Copa para Concentração (D_hl)
Nome: Concentração da Calda
Objetivo: Devolver a percentagem exata de produto a adicionar ao depósito, ajustada ao volume real da copa e água usada.
Variáveis: D_TRV (Dose de Volume de Copa); TRV (Volume de Copa); V (Volume de Calda)
Unidades: D_TRV (L_ai / 10.000 m3); TRV (m3/ha); V (L/ha); D_hl (%)
Fórmula: D_hl = (D_TRV x TRV x 100) / (V x 10000)
Regras: V > 0.
Limites: N/A
Exemplo: D_TRV = 2.22; TRV = 6125; V = 600. D_hl = (2.22 x 6125 x 100) / (600 x 10000) = 0.226% (Aprox. 0.23%)
Ambiguidade: Nenhuma

Módulo 2: Calibração Hidráulica e Aeronáutica
7. Aferição da Velocidade Real de Trabalho (v)
Nome: Velocidade Real de Trabalho
Objetivo: Calcular a velocidade real da máquina no campo para validar e corrigir as possíveis imprecisões do painel do trator.
Variáveis: d (Distância do percurso); t (Tempo necessário para percorrer a distância do percurso).
Unidades: d (m); t (s); v (km/h)
Fórmula: v = (3.6 x d) / t
Regras: t deve ser maior que 0
Limites: Para drones, a velocidade não deve exceder 13 a 15 m/s (risco de quebra da aerodinâmica downwash)
Exemplo: Cálculo demonstrativo d = 100, t = 45. v = (3.6 x 100) / 45 = 8.0 km/h
Ambiguidades: Nenhuma

8. Volume de Calda Adequado por TRV (Q)
Nome: Volume de Calda Adequado
Objetivo: Estimar o volume de calda exigido com base na densidade foliar e na arquitetura volumétrica da copa.
Variáveis: k (Coeficiente de densidade foliar); W (Largura da copa); H (Altura da Copa); Ww (Distância entrelinha).
Unidades: k (L/m3); W (m); H (m); Ww (m); Q (L/ha)
Fórmula: Q = (k x W x H x 10000) / Ww
Regras: Ww > 0.
Limites: k oscila tipicamente entre 0.020 e 0.060 L/m3 consoante o estádio fenológico da cultura, a poda e a arquitetura da copa.
Exemplo: (Cálculo demonstrativo para macieira) k = 0.033, W = 0.7, H = 3.5, Ww = 4.0. Q = (0.033 x 0.7 x 3.5 x 10000) / 4.0 = 202.1 L/ha
Ambiguidades: Volume por vezes notado como V em calibrações terrestres gerais e como Q em modelos avançados TRV

9. Débito Total do Pulverizador Terrestre (Qt)
Nome: Débito Total do Pulverizador
Objetivo: Determinar o débito contínuo do pulverizador necessário por hectare.
Variáveis: Q ou V (Volume de Calda); Ww ou R (Largura de trabalho ou entrelinha); v (Velocidade de trabalho)
Unidades: Q (L/ha); Ww (m); v (km/h); Qt (L/min)
Fórmula: Q_t = (Q x Ww x v) / 600
Regras: 600 é uma constante fixa de conversão de unidades.
Limites: N/A
Exemplo: Q = 300, Ww = 24, v = 8.0. Qt = (300 x 24 x 8) / 600 = 96 L/min
Ambiguidades: "Largura de trabalho" pode referir-se à largura total da barra horizontal (culturas baixas), à distância entre bicos em barras horizontais - neste caso o resultado final é o débito do bico de pulverização também em L/min (culturas baixas) ou à distância entrelinhas em culturas 3D.

10. Débito Unitário por Bico (Qn)
Nome: Débito Unitário por Bico
Objetivo: Calcular o débito individual por bico para identificar a cor do bico ISO ou outro na tabela do fabricante.
Variáveis: Qt (L/min); nBicos (Número total de bicos abertos)
Fórmula: Q_n = Q_t / nBicos
Regras: O número de bicos não pode ser zero. Esta fórmula apenas faz sentido para culturas cuja arquitetura da copa é semelhante a uma parede de folha como é o caso da vinha, isto porque, cada bico irá ter o mesmo débito, significando que cada bico é responsável por a mesma quantidade de folha.
Limites: Em pulverizadores pneumáticos (atomizadores) com secções diferenciadas ou em culturas 3D com arquiteturas de copa como vazos, eixos revestidos entre outros como se verifica em fruteiras, deve calcular-se de forma ponderada (soma do débito por bico = débito total)
Exemplo: Qt = 96, nBicos = 48. Q_n = 96 / 48 = 2.0 L/min
Ambiguidades: Nenhuma

11. Débito Total para Drones (Q_drone)
Nome: Débito Total para Drones
Objetivo: Calcular o débito exigido à bomba do drone substituindo os bicos/barra pela faixa aerodinâmica (Swath Width).
Variáveis: V (Volume pretendido); v_drone (Velocidade do drone); S_width (Largura da faixa)
Unidades: V (L/ha); v_drone (km/h); S_width (m); Q_drone (L/min)
Fórmula: Q_drone = (V x v_drone x S_width) / 600
Regras: N/A
Limites: Velocidade > 13 a 15 m/s invalida o cálculo aerodinâmico.
Exemplo: (Cálculo demonstrativo) V = 30, v_drone = 15 km/h, S_width = 4. Q_drone = (30 x 15 x 4) / 600 = 3.0 L/min
Ambiguidades: Nos drones, algumas referências cruzam as métricas em m/s na teoria, o que obriga a converter para km/h no algoritmo.

12. Swath Width (Validação de Aerodinâmica de Drones)
Nome: Largura de Faixa Efetiva de Drones (Swath Width)
Objetivo: Validar em campo a largura útil pulverizada onde a deposição hídrica da calda se mantém aceitável.
Variáveis: Densidade de gotas medidas em papel hidrossensível (WPS).
Unidades: Densidade em gotas/cm2 e Distância em metros (m).
Fórmula matemática (inequação lógica): S_width = Distância total onde Densidade de Gotas >= (0.5 x Densidade Média Central).
Regras: Requer análise real ou simulação de papéis hidrossensíveis WSP no terreno ( módulo de Visão por computador)
Limites: INCOMPLETA como álgebra pura (depende de matriz de dados de campo)
Exemplo: Se no centro se medem 60 gotas/cm2, a faixa efetiva termina nos metros laterais em que se detetem 30 gotas/cm2.
Ambiguidades: Não constitui um algoritmo algébrico de backend contínuo, mas um validor de array de distribuição espacial.

Módulo 3: Preparação da Calda no Tanque
13. Quantidade de Pesticida através da Dose
Nome: Quantidade de Pesticida (por Dose)
Objetivo: Calcular a quantidade absoluta de produto a colocar no depósito do pulverizador com base na dose/ha registada no rótulo.
Variáveis: C_d (Capacidade do depósito); D (Dose); V (Volume de Calda).
Unidades: C_d (L); D (L/ha ou kg/ha); V (L/ha); Q_p (ml ou g) - Quantidade de pesticida por depósito.
Fórmula: Q_p = (C_d x D x 1000) / V
Regras: O volume de calda e a capacidade do depósito devem ser maiores que 0
Limites: O multiplicador 1000 converte diretamente de kg/L para g/ml
Exemplo: C_d = 800 L, D = 3 L/ha, V = 300 L/ha. Q_p = (800 x 3 x 1000) / 300 = 8000 ml (8 L)
Ambiguidades: Nenhuma

14. Quantidade de Pesticida através da Concentração na Fase Inicial
Nome: Quantidade de Pesticida (por Concentração Fase Inicial)
Objetivo: Calcular a quantidade absoluta de pesticida a colocar no depóstio do pulverizador com base na concentração recomendada para plantas nos estados fenológicos (fases iniciais vegetativas).
Variáveis: C (Concentração); C_d (Capacidade do depósito)
Unidades: C (ml/hl ou g/hl); C_d (L); Q_p (ml ou g) - Quantidade de pesticida por depósito
Fórmula: Q_p = (C x C_d) / 100
Regras: Divisão por 100 normaliza de hectolitros para os lidtros do depósito.
Limites: Aplicável preferencialmente no primeiro terço do ciclo das culturas.
Exemplo: C = 300 g/hl, C_d = 800 L. Q_p = (300 x 800) / 100 = 2400 g (2,4 kg).
Ambiguidades: Nenhuma

15. Quantidade de Pesticida através da Concentração em Pleno Desenvolvimento
Nome:Quantidade de Pesticida (por Concentração Pleno Desenvolvimento)
Objetivo: Calcular a quantidade absoluta de pesticida a colocar no depósito do pulverizador com base na concentração recomendada para plantas nos estados fenológicos em pleno desenvolvimento (copa adulta).
Variáveis: C_d (Capacidade do depósito); C (Concentração); V_r (Volume Recomendado); V_a (Volume Aplicado)
Unidades: C_d (L); C (ml/hl ou g/hl); V_r (L/ha); V_a (L/ha); Q_p (ml ou g) - Quantidade de pesticida por depósito
Fórmula: Q_p = (C_d x C x V_r) / (V_a x 100)
Regras: O volume aplicado deve ser superior a zero.
Limites: Ferramenta crítica de compensação (aumenta a proporção de pesticida no depósito se faltar água na máquina)
Exemplo: C_d = 800 L; C = 300 g/hl; V_r = 1000 L/ha; V_a = 300 L/ha. Q_p = (800 x 300 x 1000) / (300 x 100) = 8000 g (8 kg)
Ambiguidades: Nenhuma

Módulo 4: Segurança, Ambiente e Custos
16. Índice de Lixiviação de GUS
Nome: Índice Infiltração
Objetivo: Prever o potencial ecotoxicológico de um químico penetrar no solo e contaminar os lençóis freáticos através do índice de infiltração/lixiviação (GUS - Groundwater Ubiquity Score).
Variáveis: DT50_solo (Meia-vida da degradação no solo); Koc (Coeficiente de adsorção de carbono orgânico).
Unidades: DT50_solo (dias); Koc (Sem unidade explicita no texto)
Fórmula: GUS = log10 (DT50_solo) x (4 - log10 (Koc))
Regras: As variáveis não podem ser zero ou negativas.
Limites: Quando GUS > 2.8, emite aviso compulsivo para bloquear a aplicação perante a iminência de chuva.
Exemplo: (Demonstrativo) DT50 = 30, Koc = 10. GUS = log10(30) x (4 - log10(10)) = 1.477 x (4 - 1)= 4.43 (Classificação: Liviviável).
Ambiguidades: A unidade métrica do valor "Koc" está omitida nas fontes do projeto.

17. Quociente ApisTox de Risco para Polinizadores
Nome: Risco para Polinizadores
Objetivo: Determinar o perigo de mortalidade para abelhas e emitir restrições operacionais crepusculares.
Variáveis: D (Dose por hectare); LD50_oral (Dose Letal 50).
Unidades: D (g/ha ou ml/ha); LD50_oral (μg/abelha); R (Risco)
Fórmula: R = D / LD50_oral
Regras: Divisor positivo e superior a zero.
Limites: Obriga a aplicação pós-pôr do sol se limite for excedido.
Exemplo: (Demonstrativo) D = 100 g/há; LD50_oral = 5 μg. R = 100 / 5 = 20
Ambiguidades: INCOMPLETA dimensionalmente nas fontes. O cruzamento direto de g no dividendo e μg no divisor pressupõe que o algoritmo ou os fatores de quociente de conversão absorvem a métrica.

18. Modelador Numérico de Deriva
Nome: Determinação Risco de Deriva
Objetivo: Produzir um valor físico baseado nos fatores aerodinâmicos do equipamento e evaporação termodinâmica da água.
Variáveis: V_vento, H (Altura), D_gota (Diâmetro da gota), T_ar (Temperatura do ar), RH (Humidade), f_tipo-bico (Mitigador do bico).
Unidades: Omitidas explicitamente no texto-fonte.
Fórmula: Deriva_base = (V_vento x H) / D_gota | Deriva_corrigida = Deriva_base x (T_ar / RH) x f_tipo-bico
Regras: Diâmetro da gota e humidade superior a zero para não anular a equação.
Limites: Trata-se de um modelo quantitativo abstrato de alerta.
Exemplo: INCOMPLETO
Ambiguidades: INCOMPLETA. Faltam unidades de correlação rigorosas (como fator dimensional na humidade ou temperatura) para ser implementado sem ajustes matemáticos intermédios.

19. Rendimento de Baterias em Drones (Área por Voo)
Nome: Rendimento de Baterias
Objetivo: Estimar logisticamente quantos hectares cobre um abastecimento para prever o número de baterias e paragens.
Variáveis: C_d (Capacidade do depósito do drone); V (Volume de calda)
Unidades: C_d (L); V (L/ha); A_voo - Área/voo (ha)
Fórmula: A_voo = C_d / V
Regras: V não pode ser zero
Limites: N/A
Exemplo: (Demonstrativo) C_d = 40 L, V = 20 L/ha. A_voo = 40 / 20 = 2 ha por voo
Ambiguidades: Nenhuma

20. Custo da Operação por Hectare (C_ha)
Nome: Custo da Operação
Objetivo: Somatório integral de desgaste para formular um orçamento para clientes.
Variáveis: labor, drone_depr, bat, travel, overhead, Área (A), Margem (m)
Unidades: Componentes (€ totais); A (ha); Margem (5)
Fórmula: C_total = labor + drone_depr + bat + travel + overhead | C_ha = C_total / A | P_ha = C_ha x (1 + (m / 100))
Regras: A área e o custo não podem ser nulos.
Limites: N/A
Exemplo: (Demonstrativo) Custos Totais Acumulados = 100 €, Área = 2 ha, Margem = 20%. C_ha = 100 / 2 = 50 €. P_ha = 50 x ( 1 + 0.20) = 60 €/ha
Ambiguidades: Nenhuma

21. Diâmetro Real da Gota por Imagem (WSP)
Nome: Diâmetro Real da Gota
Objetivo: O algoritmo limpa o efeito espalhado que o líquido cria nos papéis hidrossensíveis na validação da aplicação.
Variáveis: Diametro_Pixel; Spread Factor
Unidades: Diametro_Pixel (Píxeis ou micrometros inferidos); Spread Factor (Adimensional)
Fórmula: Diametro_Real = Diametro_Pixel / Spread_Factor
Regras: Aplica obrigatoriamente um limite que elimina manchas < 3 píxeis (30 μm) como ruído CCD.
Limites: O Spread Factor base assume-se como 2.0 caso a marca do cartão seja omitida pelo utilizador.
Exemplo: (Demonstrativo) Tamanho na matriz = 400 μm, Spread Factor = 2.0. Diametro_Real = 400 / 2.0 = 200 μm originais de bico.
Ambiguidades: As fontes misturam semanticamente "píxeis" com "micrometros" no dividendo, devendo o desenvolvedor parametrizar a escala via calibração PPI.



MÓDULOS DE APIs

1. PI@ntNet API
Nome da API: PI@ntNet API
Objetivo prático: Fornecer acesso computacional a um motor de inteligência artificial profunda (deep learning) para a identificação visual de espécies botânicas e doenças vegetais.
Casos de uso na DATERRA Smart 2: Integrada como o motor de inferência fotográfica da ferramenta Premium "SmartTarget AI", atuando no diagnóstico imediato de doenças nas folhas das culturas e na identificação de plantas infestantes.
Método de autenticação exigido: A Chave de API (API Key) privada tem de ser obrigatoriamente incluída como um parâmetro de consulta (query parameter) na URL do pedido. Para ambientes em navegador (client-side) é obrigatório autorizar previamente os domínios para acesso CORS e, opcionalmente, restringir os endereços IP (IPv4) do servidor que faz o pedido.
Endpoints principais: Endpoint primário de identificação: POST /v2/identify. Endpoint especializado em patologia: POST /v2/diseases/identify. Endpoint secundário: GET /v2/diseases.
Parâmetros de entrada obrigatórios: Submissão multipart de até 5 ficheiros de imagem (em formato JPEG ou PNG) em simultâneo, garantindo que todas as imagens num único pedido representam o mesmo indivíduo vegetal. Existe um limite global de peso de 50 MB por requisição POST.
Parâmetros opcionais: organs (associa cada imagem à componente botânica: leaf, flower, fruit, bark ou auto); lang (define o idioma para os nomes populares e descrições); no-reject (booleano que instrui a não rejeição prévia de imagens com fundos complexos/mãos humanas); nb-results (número máximo de resultados de doenças devolvidos).
Formato esperado da resposta: JSON
Campos principais devolvidos: score (grau de probabilidade de acerto do modelo matemático, com valor entre 0 e 1); nomes científicos do patógeno/planta; código oficial da EPPO correlacionado com a doença; indicação da versão atual do modelo de inferência e os créditos diários remanescentes na conta do utilizador.
Limites e restrições: Cada requisição de identificação de espécie consome 1 crédito. Limite fixo de 50 MB no total dos ficheiros anexados.
Regras de validação: No tratamento visual, utilizar no-reject=true para forçar a avaliação em fundos que seriam bloqueados. Na reaproveitação de imagens obtidas através da API, é compulsório o cumprimento da licença Creative Commons BY-SA, exigindo o crédito explícito ao autor e à plataforma.
Possíveis erros de integração: Erros de CORS se o pedido originar de um domínio não pré-cadastrado no painel; bloqueio não autorizado se o IP do servidor diferir da whitelist; erro 404 de espécie não encontrada se existirem fundos ruidosos e a flag no-reject não for invocada.
Exemplo completo: INCOMPLETO (as fontes apenas referenciam extratos e regras conceptuais, omitindo um log literal com o payload do request e do JSON de retorno).
Ambiguidades / Dados em falta: Omissão da estrutura exata do corpo JSON da resposta e da árvore de preços dos créditos comerciais.
STATUS INCOMPLETA

2. Plantix API Toolkit (Vision API)
Nome da API: Plantix API Toolkit
Objetivo prático: Proporcionar o diagnóstico fotográfico instantâneo (em menos de 5 segundos) de mais de 750 doenças, pragas e deficiências nutricionais englobando 50 espécies de culturas.
Casos de uso na DATERRA Smart 2: Operar como "Agrónomo de Bolso", suportando o diagnóstico, gerando bibliotecas enciclopédicas de apoio e orientando o plano automático de pesticidas ou recomendações nutricionais (fertilizantes) para o agricultor.
Método de autenticação exigido: Autenticação no cabeçalho HTTP através da passagem de Bearer Token (Authorization: Bearer YOUR_TOKEN).
Endpoints principais: O servidor live encontra-se em https://api.plantix.net. A API é segmentada nos módulos conceptuais: Crop Health API, Pest and Disease Library API, Treatment Recommendations API e Fertiliser Calculator API.
Parâmetros de entrada obrigatórios: Submissão fotográfica processada segundo os standards da especificação OpenAPI 3.1.0.
Parâmetros opcionais: INCOMPLETO.
Formato esperado da resposta: Suportado na especificação OpenAPI 3.1.0.
Campos principais devolvidos: Identificação da patologia, dados biológicos multilíngues, orientações de controlo químico baseadas em pesticidas autorizados, dosagens técnicas, planos macro e micronutrientes e práticas de gestão integrada de pragas.
Limites e restrições: As fontes referem orçamentação à medida para os níveis comerciais. Escala computacional testada em mais de 20 imagens processadas por segundo. Tempo estimado de lançamento da infraestrutura: 4 a 6 semanas.
Regras de validação: INCOMPLETO.
Possíveis erros de integração: INCOMPLETO.
Exemplo completo: INCOMPLETO.
Ambiguidades / Dados em falta: Não são fornecidos os URLs exatos de cada endpoit interno, não há demonstração de submissões HTTP ou estruturas JSON.
STATUS INCOMPLETA

3. Agrio API (Sailog)
Nome da API: Agrio API
Objetivo prático: Processar imagens foliares para o diagnóstico de anomalias botânicas e agregar inferências preditivas epidemiológicas através do cruzamento de modelos climáticos e rastreio georreferenciado.
Casos de uso na DATERRA Smart 2: Complementar a IA fitossanitária e potenciar módulos de alerta preditivo (AgrioShield), notificando os produtores de possíveis frentes de infeção fúngica reportadas nas imediações geográficas com base nas espécies botânicas ali cultivadas.
Método de autenticação exigido: A Chave de API pode ser injetada de duas formas: através de um cabeçalho HTTP dedicado ou como parâmetro associado no query string do URL (?key=YOUR_API_KEY).
Endpoints principais: API Gateway documentado em https://agrio-api-gateway-6it0wqn1.uc.gateway.dev/v1.
Parâmetros de entrada obrigatórios: Envio obrigatório dos ficheiros através do tipo de codificação de formulário multipart/form-data, aceitando exclusivamente extensões JPEG ou PNG.
Parâmetros opcionais: INCOMPLETO.
Formato esperado da resposta: JSON.
Campos principais devolvidos: Resultado com uma validação preliminar do hospedeiro biológico e uma análise previsional exta do patógeno acompanhada de pontuações de confiança (confidence score), detalhando rótulos científicos e informais.
Limites e restrições: O peso máximo da imagem transmitida restringe-se a 32 MB. O débito no balanço financeiro consiste num rácio estrito de 1 requisição efetiva de predição (doença ou alerta meteorológico) por 1 crédito. Rotinas meramente verificativas são processadas sem custos de rede. Uma subscrição matricial fixa começa nos 100 dólares norte-americanos em troca de 1.000 créditos.
Regras de validação: O fluxo processa-se em validação bidirecional, devendo o programa ler primeiro o índice de certeza devolvido para a "cultura" antes de avaliar o "patógeno" retornado no JSON.
Possíveis erros de integração: Bloqueio da chamada caso o peso associado da imagem em base64 ultrapasse o teto de 32 MB.
Exemplo completo: INCOMPLETO.
Ambiguidades / Dados em falta: A fonte carece da árvore exata das URLs e não exibe os blocos nativos de código das requisições, retornos JSON integrais e códigos de erro de servidor HTTP.
STATUS INCOMPLETA

4. Agromonitoring (Agro-API)
Nome da API: Agromonitoring (Agro-API)
Objetivo prático: Agregação integral de dados orbitais via satélite (Sentinel-2, Landsat 8), com fornecimento automatizado de processamentos espetrais, modelação climatológica aprofundada de humidade no solo profundo, precipitação cumulativa e radiação ultravioleta.
Casos de uso na DATERRA Smart 2: Nutrir algoritmos de vigilância preditiva da lavoura através do cálculo constante de valores numéricos como Graus-Dia de Crescimento (GDD) combinados com declínios no vigor fotossintético (NDVI), disparando alarmes programados sobre o ciclo metamórfico (eclosão) de populações de pragas em fases de suscetibilidade a pesticidas.
Método de autenticação exigido: INCOMPLETO (Assume-se por chaves criadas por painel Sign in, contudo não há uma menção literal à construção do cabeçalho ou parâmetro URL).
Endpoints principais: Polygons API ( /api/polygons) que comanda todo o ecossistema posterior. Secundários incluem rotas específicas de dados geoespaciais, nomeadamente /api/images, /api/history-ndvi, /api/current-weather, /api/history-weather, /api/accumulated-temperature, /api/accumulated-precipitation, /api/current-soil, /api/history-soil, e as APIs voltadas ao índice UVI.
Parâmetros de entrada obrigatórios: Submissão das coordenadas perimetrais delineadas da exploração nos moldes do standard cartográfico GeoJSON. Subsequentemente, o atributo ID do polígno obtido nesta etapa é compulsório em todos os pedidos analíticos sequentes.
Parâmetros opcionais: INCOMPLETO.
Formato esperado da resposta: O retorno visual processa blocos raster em formatos PNG e ficheiros escaláveis de georreferenciação em GeoTIFF, emitindo matrizes matemáticas em estatística zonal (arquitetura JSON).
Campos principais devolvidos: Imagens tratadas com sobreposição de dados espetrais e índices (NDVI, EVI, EVI2, NDWI, DSWI, NRI). Fornece medições de precipitação agregadas, humidade capilar do subsolo, temperatura radicular das plantas (Graus-Dia) e predições horárias num raio temporal de 5 dias englobando ventos e índices de radiação (UVI).
Limites e restrições: As infraestruturas "Free Account" possuem restrições arquiteturais que vetam expressamente as pesquisas a repositórios temporais de histórica meteorológica e dados retrospectivos de solo agrícola.
Regras de validação: INCOMPLETO.
Possíveis erros de integração: INCOMPLETO.
Exemplo completo: INCOMPLETO.
Ambiguidades / Dados em falta: Carência de métodos de validação no cabeçalho (headers de autorização), blocos com código e payloads da resposta padronizada JSON.
STATUS INCOMPLETA.

5. EPPO Data Services API (via pestr / eppoFindeR)
Nome da API: EPPO Data Services API
Objetivo prático: Base global oficial e padronizador do léxico botânico para agências quarentenárias.
Casos de uso na DATERRA Smart 2: Trata-se do Eixo Regulatório Central: intercepta o output das redes neurais (Agrio ou Pl@ntNet), transcodifica a nomenclatura científica da planta num identificador universal exclusivo (Código EPPO alfa-numérico) e utiliza-o para pesquisar os produtos fitofarmacêuticos legislados pela UE/DGAV.
Método de autenticação exigido: Utiliza API Token privado. As pesquisas relativas a mapas mundiais biogeográficos dispensam autenticação ou submissão do token nos scripts.
Endpoints principais: A infraestrutura encontra-se sob o nó https://data.eppo.int/apis/. Em termos lógicos, expõe endpoints classificados nas vertentes eppo_tabletools_cat (avaliações de quarentena), eppo_tabletools_hosts (vínculos planta-patógeno), eppo_tabletools_taxo (hierarquia da família biológica) e eppo_tabletools_distri (regiões invadidas e surtos estaduais).
Parâmetros de entrada obrigatórios: Submissão dos termos nominais patológicos, dependente de extração num ficheiro banco local relacional formatado em SQLite descarregado nativamente do site da EPPO.
Parâmetros opcionais: INCOMPLETO.
Formato esperado da resposta: O pipeline retorna coleções multidimensionais de estruturas matriciais contendo o cruzamento de até quatro tabelas interligadas em listas globais.
Campos principais devolvidos: Código EPPO gerado univocamente, status da categorização sanitária (Lista A1/A2), sinónimos botânicos desatualizados, vetor primário do surto e coordenadas intercontinentais do problema agrometeorológico.
Limites e restrições: Serviço gratuito, legislado sob licença europeia Open Data (EUPL-1.2). O acesso ao mapeamento de novos códigos requer taxas de serviço. Acesso programático a transferências do ficheiro SQLite central da instituição deixou de ser autorizado, obrigando ao salvamento em regime manual pelo analista.
Regras de validação: Validação prévia de nomenclaturas através do banco sqlite (eppo_names_tables) antes de escalar a transação via internet (evita falhas de requests infundados).
Possíveis erros de integração: Quebra sistemática e paralisação das sub-rotinas dependentes do SQLite se o download no terminal host for descurado pelos desenvolvedores após revogações.
Exemplo completo: INCOMPLETO.
Ambiguidades / Dados em falta: A fonte relata a mecânica apenas do lado de bibliotecas R-Studio (como pestr), suprimindo as rotas lógicas HTTP (ex: /api/v1/taxa), a composição das variáveis query e o esqueleto integral JSON.
STATUS INCOMPLETA

6. DG SANTE - EU Pesticides Database API
Nome da API: EU Pesticides Database API / DG SANTE Catalog
Objetivo prático: Base central europeia com busca em lote de status legal sobre substâncias químicas ativas e fixação matemática dos Limites Máximos de Resíduos (MRLs) em bens de nutrição orgânica e alimentar.
Casos de uso na DATERRA Smart 2: Avaliação e barreira jurídica em tempo real aquando de uma exportação ou da geração final de receitas agrícolas; bloqueia o receituário do sistema perante componentes banidos em mercado ou em regimes transitórios do SIFITO.
Método de autenticação exigido: INCOMPLETO (a fonte não evidencia mecanismos, listando a interface com a menção abstrata à máquina API M2M).
Endpoints principais: Consta na documentação de base europeia em https://developer.datalake.sante.service.ec.europa.eu/api-details#api=016c2aae-ad89-452e-b91f-2f2141a11a4f e as descargas em lote MRL residem em rotas anexas como /backend/api/mrl/download/link?filename=Publication1.xml.
Parâmetros de entrada obrigatórios: INCOMPLETO.
Parâmetros opcionais: INCOMPLETO.
Formato esperado da resposta: O ecossistema exporta volumosas faturas do repositório utilizando blocos estruturados na diretriz XML. Assumem-se fluxos JSON na arquitetura REST paralela.
Campos principais devolvidos: Aprovação fitossanitária governamental ou cancelamento legislativo, dados diários de expiração e restrições legais cruzadas (MRL) para colheitas europeias ou frutas e vegetais isolados.
Limites e restrições: Livre de encargos operacionais, no entanto, é sublinhado com extrema cautela o desprovimento completo de validade perante qualquer esfera jurídica (o Diário Oficial retém total superioridade).
Regras de validação: INCOMPLETO.
Possíveis erros de integração: INCOMPLETO.
Exemplo completo: INCOMPLETO.
Ambiguidades / Dados em falta: A fonte descura a demonstração textual nativa da API, omitindo métodos primários, rotas de filtragem (ex: via Cas Number da substância) e as credenciais. 
STATUS: INCOMPLETA.

7. CDSAPI (Copernicus Climate Data Store)
Nome da API: CDSAPI (ECMWF) / CDS-Beta.
Objetivo prático: Operacionalizar modelos estocásticos com o envio contínuo de grelhas massivas baseadas em observações do planeta por agências espaciais e previsões temporais alargadas (Sazonais, ERA5, ERA5-Land, CERRA, ORAS5).
Casos de uso na DATERRA Smart 2: Fornecimento analítico do histórico vetorial atmosférico em formulações de deriva de defensivos para drones (velocidade do vento e fatores termodinâmicos).
Método de autenticação exigido: INCOMPLETO (a API é fechada, mas não há referências específicas nas fontes sobre o formato explícito da chave do portal).
Endpoints principais: A infraestrutura atravessou um processo dramático de obsolescência forçada com transição em setembro de 2024 para servidores novos denominados logicamente de plataforma CDS-Beta. A fonte do fórum não expõe os identificadores literais das URIs.
Parâmetros de entrada obrigatórios: INCOMPLETO.
Parâmetros opcionais: INCOMPLETO.
Formato esperado da resposta: INCOMPLETO.
Campos principais devolvidos: Constelações de variáveis do ciclo do clima (nomeadamente as tabelas relativas à extração ERA5 hourly data que traçam radiação e temperatura do ar por passos temporais de hora em hora).
Limites e restrições: Regras absolutas de sistema barraram a extração de dados: uma única comunicação à API não pode ser superior a 120.000 unidades transacionais ("itens" / "fields") no contexto horário e estagnada nos 10.000 itens para levantamento mensal.
Regras de validação: O integrador computacional é advertido da álgebra imperiosa de um pedido de grelha que considera a matriz dimensional: 1 item/field = 1 variável * 1 nível de profundidade/altitude * 1 unidade temporal.
Possíveis erros de integração: Falhas sistemáticas definitivas por desligamento letal do nó legado (a partir de 26 de Setembro de 2024 a API legacy foi encerrada, gerando falhas permanentes de integração se as bases URL não transitaram para as métricas CDS-Beta). Estouro do max_number_fields ou latência na fila virtual do servidor ECMWF ("queue delay") devida a congestionamentos nas janelas diárias de utilização global de grelhas climáticas.
Exemplo completo: INCOMPLETO.
Ambiguidades / Dados em falta: A fonte decorre das bases num fórum técnico de suporte ao consumidor do organismo europeu, faltando a descrição dos invólucros literais de requisição e das strings da versão nova (API CDS-Beta). 
STATUS: INCOMPLETA.

§























