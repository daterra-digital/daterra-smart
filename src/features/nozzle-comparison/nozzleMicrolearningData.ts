export interface MicrolearningTopic {
  id: string;
  number: number;
  title: string;
  category: 'Física Hidráulica' | 'Tecnologia de Aplicação' | 'Calibração & Normas' | 'Segurança & Manutenção';
  summary: string;
  content: string[];
  practicalExample?: string;
  frequentError?: string;
  technicalWarning?: string;
  keyTakeaway: string;
  referenceStandard?: string;
  sourceType: 'Norma Oficial' | 'Manual DGAV/EPPO' | 'Didático Geral DATERRA';
}

export const NOZZLE_MICROLEARNING_TOPICS: MicrolearningTopic[] = [
  {
    id: 'debito_de_um_bico',
    number: 1,
    title: '1. O Débito de um Bico de Pulverização',
    category: 'Física Hidráulica',
    summary: 'Compreenda o conceito de débito hidráulico unitário medido em litros por minuto (L/min) à saída do orifício calibrado.',
    content: [
      'O débito de um bico é o volume de líquido que atravessa o orifício calibrado por unidade de tempo, expresso em litros por minuto (L/min).',
      'Este valor depende diretamente do diâmetro e geometria do orifício, da pressão hidráulica do circuito e da densidade/viscosidade da calda.',
      'No catálogo oficial, cada fabricante estabelece um débito nominal de referência calibrado com água limpa a uma pressão padronizada, tipicamente 3,0 bar para bicos de fenda destinados a culturas baixas e 10,0 bar para bicos cónicos utilizados em pulverizadores assistidos por ar.'
    ],
    practicalExample: 'Um bico de calibre ISO 02 apresenta um débito nominal de exatamente 0,80 L/min à pressão de referência de 3,0 bar.',
    frequentError: 'Confundir débito unitário do bico (L/min) com volume de calda aplicado por hectare (L/ha). O débito é uma taxa volumétrica temporal; o volume por hectare depende da velocidade do trator e do espaçamento.',
    technicalWarning: 'A presença de calda com pós molháveis ou adjuvantes viscosos pode provocar pequenas variações de débito face ao ensaio com água limpa.',
    keyTakeaway: 'O débito unitário é a grandeza base de calibração: 1 minuto de recolha numa proveta graduada deve corresponder ao valor indicado na tabela técnica.',
    referenceStandard: 'ISO 10625 / ISO 5682-1',
    sourceType: 'Norma Oficial'
  },
  {
    id: 'debito_tabelado_vs_estimado',
    number: 2,
    title: '2. Diferença entre Débito Tabelado e Débito Estimado',
    category: 'Física Hidráulica',
    summary: 'Saiba quando um valor provém diretamente de medição oficial de catálogo ou de modelo matemático de orifício.',
    content: [
      'O "Débito tabelado" é o valor oficial medido pelo fabricante e publicado na ficha técnica para um patamar específico de pressão.',
      'O "Débito estimado" é calculado matematicamente quando o operador seleciona uma pressão intermédia que não consta na grelha do catálogo.',
      'A estimativa DATERRA aplica com rigor a relação física do orifício hidráulico (Bernoulli), garantindo precisão dentro da faixa de trabalho recomendada.'
    ],
    practicalExample: 'Se o catálogo tem dados a 2,0 bar (0,65 L/min) e 3,0 bar (0,80 L/min), a consulta a 2,5 bar gera um débito estimado de 0,73 L/min.',
    frequentError: 'Assumir que uma estimativa linear entre dois pontos é correta. A resposta hidráulica é quadrática, não linear.',
    technicalWarning: 'Nunca extrapole débitos estimados para pressões fora da faixa máxima ou mínima recomendada pelo fabricante.',
    keyTakeaway: 'Privilegie sempre patamares de pressão com débito tabelado oficial e confirme a pressão no manómetro da barra.',
    referenceStandard: 'DGAV / EPPO PP 1/239',
    sourceType: 'Manual DGAV/EPPO'
  },
  {
    id: 'pressao_altera_debito_bernoulli',
    number: 3,
    title: '3. Porque a Pressão Altera o Débito: A Lei do Orifício',
    category: 'Física Hidráulica',
    summary: 'A relação física entre pressão e débito segue a lei da raiz quadrada: para duplicar o débito é necessário quadruplicar a pressão.',
    content: [
      'A relação entre a pressão hidráulica (P) e o débito (Q) num orifício fixo é regida pela equação derivada de Bernoulli: Q₂ = Q₁ × √(P₂ / P₁) [em texto simples: Q2 = Q1 × sqrt(P2 / P1); em código: Q2 = Q1 * Math.sqrt(P2 / P1)].',
      'Isto significa que o débito varia estritamente com a raiz quadrada da pressão relativa. Duplicar a pressão de trabalho (2×) aumenta o débito em apenas cerca de 41,4% (√2 ≈ 1,414) e não 100%.',
      'Para conseguir duplicar efetivamente o débito de calda (2× Q1) mantendo o mesmo bico, seria necessário quadruplicar a pressão (4× P1).'
    ],
    practicalExample: 'Um bico de 0,80 L/min a 3,0 bar, quando sujeito a 6,0 bar (o dobro da pressão), debita ~1,13 L/min (não 1,60 L/min). Para debitar 1,60 L/min precisaria de 12,0 bar.',
    frequentError: 'Aumentar excessivamente a pressão para compensar bicos de calibre insuficiente. Isso fragmenta as gotas em névoa fina e dispara o risco de deriva.',
    technicalWarning: 'Ajustes de pressão devem servir apenas para pequenas afinações de débito (±10% a ±20%). Para variações maiores, substitua o calibre do bico.',
    keyTakeaway: 'A pressão ajusta finamente o débito; o calibre do bico define o patamar de trabalho.',
    referenceStandard: 'Equação do Orifício / Bernoulli',
    sourceType: 'Didático Geral DATERRA'
  },
  {
    id: 'faixa_pressao_indicada',
    number: 4,
    title: '4. Faixa de Pressão Indicada e Limites Operacionais',
    category: 'Física Hidráulica',
    summary: 'Entenda a importância de operar estritamente dentro da janela de pressões recomendada pelo fabricante.',
    content: [
      'Cada modelo de bico possui uma janela de pressões recomendada (ex: 1,5 a 4,0 bar para leque standard; 3,0 a 8,0 bar para indução de ar; 5,0 a 20,0 bar para cone cerâmico em atomizadores).',
      'Operar abaixo do limite mínimo causa colapso do ângulo do leque, distribuição desuniforme e gotas demasiado grossas.',
      'Operar acima do limite máximo gera névoa fina suscetível à evaporação/deriva e acelera exponencialmente o desgaste do orifício.'
    ],
    practicalExample: 'Um bico Albuz ATR 80 tem faixa de 5,0 a 25,0 bar. A 2,0 bar não forma o cone oco pretendido; a 30 bar gera névoa excessiva.',
    frequentError: 'Trabalhar com bicos de baixa pressão em circuitos com manómetro descalibrado, operando sem saber fora da faixa.',
    technicalWarning: 'Quando dois bicos não têm sobreposição de faixas recomendadas, não devem ser comparados à mesma pressão de trabalho.',
    keyTakeaway: 'Consulte sempre o intervalo [P_min, P_max] antes de definir a pressão de trabalho no regulador.',
    referenceStandard: 'ISO 10625 / DGAV',
    sourceType: 'Norma Oficial'
  },
  {
    id: 'formacao_leque_fenda',
    number: 5,
    title: '5. Formação do Leque em Bicos de Fenda',
    category: 'Tecnologia de Aplicação',
    summary: 'Como a geometria elíptica da fenda projeta a lâmina líquida e porque a pressão mínima é crítica.',
    content: [
      'Nos bicos de fenda plana, o líquido é forçado através de uma ranhura elíptica que expande o jato numa lâmina triangular plana em forma de leque.',
      'A energia cinética da pressão é responsável por esticar a película líquida até à sua rutura em filamentos e gotas regulares.',
      'Se a pressão for inferior ao limiar mínimo de abertura (geralmente 1,5 a 2,0 bar), o leque não atinge a abertura angular nominal (ex: 110°).'
    ],
    practicalExample: 'Um bico de 110° operado a 1,0 bar pode abrir apenas 80°, deixando faixas de cultura completamente sem produto.',
    frequentError: 'Baixar a pressão abaixo de 1,5 bar para "cortar a deriva" num bico convencional de fenda em vez de utilizar um bico específico de indução de ar.',
    technicalWarning: 'Atenção: pressão abaixo da recomendada para bicos de fenda causa falhas graves de sobreposição na barra.',
    keyTakeaway: 'Respeite a pressão mínima de abertura para garantir o ângulo nominal completo de 80° ou 110°.',
    referenceStandard: 'ISO 5682-1 / BCPC',
    sourceType: 'Manual DGAV/EPPO'
  },
  {
    id: 'sobreposicao_distribuicao_transversal',
    number: 6,
    title: '6. Sobreposição dos Jatos e Distribuição Transversal',
    category: 'Tecnologia de Aplicação',
    summary: 'A distribuição trapezoidal dos bicos de leque e a exigência de sobreposição de 30% a 50% na barra.',
    content: [
      'Os bicos de leque plano standard possuem um perfil de distribuição volumétrica trapezoidal (maior débito no centro, decrescendo suavemente para as extremidades).',
      'Para obter um depósito perfeitamente uniforme no solo ou na cultura, os jatos dos bicos adjacentes na barra devem sobrepor-se entre 30% e 50%.',
      'A altura da barra (geralmente 50 cm para bicos de 110° espaçados a 50 cm) é determinante para que a sobreposição seja matematicamente uniforme (coeficiente de variação CV < 7%).'
    ],
    practicalExample: 'Com bicos de 110° a 50 cm de espaçamento, a barra a 50 cm de altura garante sobreposição perfeita de 100% da largura útil.',
    frequentError: 'Barra demasiado baixa (faixas estriadas com subdosagem) ou barra demasiado alta (deriva severa e sobreposição descontrolada).',
    technicalWarning: 'Bicos com desgaste desigual alteram o perfil transversal e aumentam o CV acima do limite regulamentar de 10%.',
    keyTakeaway: 'Mantenha a barra estável e à altura correta para garantir a sobreposição uniforme dos leques.',
    referenceStandard: 'EN ISO 16122-2 / DGAV',
    sourceType: 'Norma Oficial'
  },
  {
    id: 'conjuntos_modulares_disco_difusor',
    number: 7,
    title: '7. Disco / Pastilha e Difusor em Conjuntos Modulares',
    category: 'Física Hidráulica',
    summary: 'Como a combinação entre orifício da pastilha e ranhuras do difusor determina o débito e o ângulo do cone.',
    content: [
      'Em pulverizadores assistidos por ar (atomizadores) e lanças de alta pressão, é comum o uso de conjuntos modulares compostos por Disco (pastilha com orifício calibrado) e Difusor (espiral/core com passagens oblíquas).',
      'O difusor imprime uma rotação centrífuga violenta à calda, enquanto o orifício do disco define o débito volumétrico final e o ângulo do cone.',
      'A combinação específica (ex: Albuz Disc AD2 + Difusor AC13, ou Braglia pastilha 1.2 + difusor 1.0) gera um débito único que deve ser consultado na matriz modular do fabricante.'
    ],
    practicalExample: 'Substituir apenas o disco de D1.2 para D1.5 sem trocar o difusor aumenta o débito mantendo o mesmo padrão de rotação da gota.',
    frequentError: 'Montar o difusor invertido no porta-bicos, anulando o vórtice e produzindo um jato irregular em cordão.',
    technicalWarning: 'Utilize sempre peças com desgaste compatível: colocar um disco novo com difusor gasto descalibra o ângulo e o débito.',
    keyTakeaway: 'Em conjuntos modulares, registe sempre o par Disco + Difusor para calibração rigorosa.',
    referenceStandard: 'ISO 10625 / ASJ / Albuz',
    sourceType: 'Didático Geral DATERRA'
  },
  {
    id: 'cores_codigos_iso_10625',
    number: 8,
    title: '8. Cor ISO e Código de Calibre segundo a ISO 10625',
    category: 'Calibração & Normas',
    summary: 'A padronização internacional que universaliza o débito nominal dos bicos agrícolas a 3,0 bar.',
    content: [
      'A norma internacional ISO 10625 define uma correspondência universal entre a cor do corpo do bico, o código de calibre e o débito a 3,0 bar.',
      'Por exemplo, o código 02 (Amarelo) debita 0,80 L/min; o código 03 (Azul) debita 1,20 L/min; o código 04 (Vermelho) debita 1,60 L/min.',
      'Atenção: alguns bicos cónicos para culturas arbustivas e arbóreas (como a gama Albuz ATR) usam códigos de cores próprios do fabricante que NÃO seguem a norma ISO 10625.'
    ],
    practicalExample: 'Um bico TeeJet XR 110-02 e um Lechler LU 120-02 são ambos Amarelos e debitam exatamente 0,80 L/min a 3,0 bar.',
    frequentError: 'Assumir que um bico Albuz ATR Amarelo debita 0,80 L/min. Na tabela Albuz a 10 bar debita 1,03 L/min porque não é cor ISO.',
    technicalWarning: 'Verifique sempre na ferramenta se o bico tem indicação "ISO 10625" ou "Cor do Fabricante".',
    keyTakeaway: 'A cor ISO identifica universalmente o calibre em bicos normalizados a 3,0 bar.',
    referenceStandard: 'ISO 10625:2018',
    sourceType: 'Norma Oficial'
  },
  {
    id: 'o_que_e_espectro_de_gotas',
    number: 9,
    title: '9. O que Significa Espectro de Gotas (VMD, D10, D50, D90)',
    category: 'Tecnologia de Aplicação',
    summary: 'Entenda a distribuição granulométrica das gotas, o diâmetro mediano volumétrico e a cobertura foliar.',
    content: [
      'A pulverização hidráulica não produz gotas de tamanho único, mas sim um espectro contínuo que varia desde micrómetros até frações de milímetro.',
      'O VMD (ou D50) representa o Diâmetro Mediano Volumétrico: 50% do volume da calda é constituído por gotas menores e 50% por gotas maiores que este valor.',
      'As normas BCPC / ASABE S572.1 classificam o espectro em categorias: Muito Fina (VF), Fina (F), Média (M), Grossa (C), Muito Grossa (VC), Extremamente Grossa (XC) e Ultra Grossa (UC).'
    ],
    practicalExample: 'Tratamentos fungicidas de contacto exigem espectro Fino/Médio (150–250 µm) para máxima densidade de impactos por cm².',
    frequentError: 'Avaliar o bico apenas pelo débito sem verificar a classe de gotas produzida na pressão de trabalho.',
    technicalWarning: 'Aumentar a pressão num bico faz descer o VMD, deslocando a classe de gotas de Grossa para Média ou Fina.',
    keyTakeaway: 'O espectro de gotas define o equilíbrio entre cobertura biológica e segurança contra a deriva.',
    referenceStandard: 'ASABE S572.1 / ISO 25358 / BCPC',
    sourceType: 'Norma Oficial'
  },
  {
    id: 'diferenca_fabricante_laboratorio_estimativa',
    number: 10,
    title: '10. Diferença entre Indicação do Fabricante, Medição Laboratorial e Estimativa',
    category: 'Calibração & Normas',
    summary: 'Rigor e transparência na origem dos dados de espectro de gotas e características técnicas.',
    content: [
      'A DATERRA Smart distingue rigorosamente a origem de cada dado apresentado:',
      '1. "Espectro de gotas indicado pelo fabricante": publicado nos catálogos oficiais do produtor do bico com base nos seus ensaios de homologação.',
      '2. "Espectro de gotas obtido por medição laboratorial": apurado em túnel de vento ou analisador laser por entidade científica acreditada independente.',
      '3. "Indicação estimada de espectro de gotas": inferida por modelos matemáticos com base no tipo de bico, ângulo e pressão de trabalho.'
    ],
    practicalExample: 'Um catálogo indica classe "M" a 3 bar (fabricante). Um ensaio no IPB ou JKI com difração laser confirma VMD = 260 µm (medição laboratorial).',
    frequentError: 'Aceitar alegações comerciais sem validação de método, pressão e protocolo de ensaio.',
    technicalWarning: 'Estimativas técnicas não substituem ensaios oficiais nem dados homologados de catálogo.',
    keyTakeaway: 'Consulte sempre a etiqueta de origem dos dados para saber se é medição, catálogo ou estimativa.',
    referenceStandard: 'ISO 25358 / DGAV',
    sourceType: 'Manual DGAV/EPPO'
  },
  {
    id: 'sensibilidade_potencial_deriva',
    number: 11,
    title: '11. Sensibilidade Potencial à Deriva e Mitigação Agronómica',
    category: 'Tecnologia de Aplicação',
    summary: 'Classificação orientadora da suscetibilidade de arrastamento ou deriva pelo vento e regras de mitigação no campo.',
    content: [
      'A deriva ocorre quando gotas de pulverização são desviadas para fora do alvo pela ação do vento ou de correntes térmicas ascendentes.',
      'A sensibilidade potencial à deriva classifica-se em: Menor sensibilidade potencial à deriva, Sensibilidade potencial à deriva intermédia e Maior sensibilidade potencial à deriva.',
      'Gotas com diâmetro inferior a 100–150 µm são as principais responsáveis pelo arraste e evaporação antes de atingirem a cultura.'
    ],
    practicalExample: 'Bicos de indução de ar produzem gotas grossas com bolhas de ar que reduzem o potencial de deriva em até 75% a 90% face a bicos standard.',
    frequentError: 'Afirmar que um bico anti-deriva tem "risco zero". Com vento forte (> 15 km/h) qualquer pulverização é arrastada.',
    technicalWarning: 'Respeite as zonas de não tratamento (ZNT / buffer zones) indicadas no rótulo oficial dos produtos fitofarmacêuticos.',
    keyTakeaway: 'Selecione bicos de menor sensibilidade à deriva junto a linhas de água, habitações e culturas vizinhas.',
    referenceStandard: 'DGAV / ISO 22866 / ISO 22369',
    sourceType: 'Manual DGAV/EPPO'
  },
  {
    id: 'porque_nao_existe_risco_zero',
    number: 12,
    title: '12. Porque Não Existe "Risco Zero" de Deriva',
    category: 'Tecnologia de Aplicação',
    summary: 'A física da atmosfera e a meteorologia determinam que a tecnologia de bicos atenua, mas não anula o risco.',
    content: [
      'Nenhum bico de pulverização consegue garantir 100% de isenção de deriva sob quaisquer condições atmosféricas.',
      'Fatores como velocidade do vento (> 3–4 m/s), temperatura elevada (> 25 °C), humidade relativa baixa (< 50%) e inversões térmicas aumentam o arraste e a evaporação.',
      'A utilização de bicos com redução de deriva certificada (50%, 75% ou 90%) é uma ferramenta essencial de mitigação, mas deve ser sempre combinada com bom senso meteorológico.'
    ],
    practicalExample: 'Mesmo com bico de indução de ar a 90% de redução, pulverizar sob vento de 25 km/h provoca deriva inaceitável.',
    frequentError: 'Confiar cegamente no bico anti-deriva e ignorar as leituras do anemómetro e termo-higrómetro no terreno.',
    technicalWarning: 'Interrompa imediatamente os tratamentos se o vento soprar na direção de cursos de água ou parcelas biológicas sensíveis.',
    keyTakeaway: 'Tecnologia anti-deriva e condições meteorológicas adequadas são complementares e obrigatórias.',
    referenceStandard: 'DGAV Boas Práticas Fitossanitárias',
    sourceType: 'Manual DGAV/EPPO'
  },
  {
    id: 'como_comparar_dois_bicos',
    number: 13,
    title: '13. Como Comparar Dois Bicos no Modo de Comparação',
    category: 'Calibração & Normas',
    summary: 'Metodologia passo a passo para confrontar débitos, espectro de gotas, faixas de pressão e aplicações.',
    content: [
      'No modo "Comparar dois bicos", selecione o Bico A e o Bico B através do seletor adaptativo e defina a pressão de trabalho pretendida.',
      'O módulo calcula instantaneamente o débito unitário de cada bico, a diferença absoluta (L/min), a variação percentual (ΔQ%) e o espectro de gotas.',
      'Analise a matriz técnica para confrontar o ângulo de leque, o filtro mesh recomendado e a faixa comum de pressão de ambos os modelos.'
    ],
    practicalExample: 'Comparar um bico standard XR 110-02 com um bico anti-deriva AIXR 110-02 a 3,0 bar: ambos debitam 0,80 L/min, mas o AIXR oferece menor sensibilidade à deriva.',
    frequentError: 'Comparar dois bicos a uma pressão que está fora da faixa de funcionamento recomendada de um deles sem verificar os alertas.',
    technicalWarning: 'Se não existir faixa de pressão comum entre os bicos, a comparação à mesma pressão é tecnicamente incompatível.',
    keyTakeaway: 'A comparação à mesma pressão permite isolar o efeito da tecnologia do bico no débito e no tamanho de gota.',
    referenceStandard: 'DATERRA Smart v1.1 Guide',
    sourceType: 'Didático Geral DATERRA'
  },
  {
    id: 'como_procurar_alternativa_debito',
    number: 14,
    title: '14. Como Procurar uma Alternativa com Débito Semelhante',
    category: 'Calibração & Normas',
    summary: 'Como encontrar opções equivalentes no catálogo mantendo o volume de calda e otimizando a cobertura ou a deriva.',
    content: [
      'No modo "Encontrar alternativas", defina um bico de referência ou insira diretamente o débito desejado (ex: 0,80 L/min a 3,0 bar).',
      'O algoritmo pesquisa em todo o catálogo oficial (1.666 referências) os bicos que entregam um débito dentro de ±5% (com opção de alargar para ±10% ou ±15%).',
      'Pode filtrar por marca, tipo de bico, bicos de referência frequente no mercado português ou preferência por menor sensibilidade à deriva, e comutar com 1 clique para comparação direta.'
    ],
    practicalExample: 'Procurar alternativa a 1,20 L/min a 3,0 bar dentro de ±5%: a ferramenta lista opções entre 1,14 e 1,26 L/min de diferentes marcas e tecnologias.',
    frequentError: 'Pensar que só existe uma marca com o débito pretendido. Existem múltiplas alternativas ISO e não-ISO com comportamentos distintos.',
    technicalWarning: 'Ao selecionar uma alternativa, confirme se o ângulo do leque e o tipo de jato são adequados à cultura e ao espaçamento da barra.',
    keyTakeaway: 'Use a pesquisa de alternativas para modernizar a sua tecnologia de bicos sem alterar a calibração do trator.',
    referenceStandard: 'DATERRA Smart v1.1 Guide',
    sourceType: 'Didático Geral DATERRA'
  },
  {
    id: 'debito_total_vs_volume_l_ha',
    number: 15,
    title: '15. Porque o Débito Total do Conjunto Não é o Mesmo que Volume em L/ha',
    category: 'Calibração & Normas',
    summary: 'Diferença entre o fluxo total da barra (L/min) e a dose volumétrica distribuída no terreno (L/ha).',
    content: [
      'O "Débito total do conjunto" é o somatório do fluxo de todos os bicos da barra: Q_total (L/min) = Q_bico × Número de bicos.',
      'O volume aplicado por hectare (L/ha) depende de três variáveis: V (L/ha) = (600 × Q_bico) / (Espaçamento em metros × Velocidade em km/h).',
      'Calcular o débito total da barra é indispensável para verificar se a bomba do pulverizador tem capacidade de fluxo suficiente com agitação ativa, mas não determina por si só a dose por hectare.'
    ],
    practicalExample: 'Uma barra com 24 bicos a debitar 1,00 L/min cada consome 24 L/min de calda. Se o trator andar a 6 km/h com bicos a 0,5 m, o volume aplicado é de 200 L/ha.',
    frequentError: 'Confundir a capacidade da barra (L/min) com a taxa de aplicação por hectare (L/ha) e descalibrar a velocidade de avanço.',
    technicalWarning: 'A capacidade nominal da bomba do pulverizador deve exceder o débito total da barra em pelo menos 20% a 30% para garantir agitação adequada no depósito.',
    keyTakeaway: 'O débito total da barra dimensiona a bomba; a velocidade e o espaçamento definem os litros por hectare.',
    referenceStandard: 'ISO 5681 / EN ISO 16122 / DGAV',
    sourceType: 'Manual DGAV/EPPO'
  }
];
