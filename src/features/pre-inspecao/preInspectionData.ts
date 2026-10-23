// FICHEIRO GERADO AUTOMATICAMENTE POR scripts/generatePreInspectionData.js
// Fonte: PreInspecaoFINAL.csv

export type EquipmentTypeId =
  | 'barras_horizontais'
  | 'culturas_arbustivas'
  | 'pistolas_pulverizacao'
  | 'pulverizador_fixo'
  | 'polvilhador'
  | 'drones_uas';

export type EvaluationMode = 'expresso' | 'detalhado';

export type SubQuestionAnswer = 'conforme' | 'anomalia' | null;

export type EquipmentIconName = 'Tractor' | 'Fan' | 'SprayCan' | 'Factory' | 'Wind' | 'Plane';

export interface PreInspectionCsvRow {
  tipoEquipamento: string;
  categoria: string;
  perguntaGlobal: string;
  informacao: string;
  dica: string;
  subpergunta: string;
  informacaoSub: string;
  dicaSub: string;
  falhas: string;
}

export interface PreInspectionSubQuestion {
  id: string;
  subpergunta: string;
  informacaoSub: string;
  dicaSub: string;
  falhas: string;
}

export interface PreInspectionCategory {
  id: string;
  tipoEquipamento: EquipmentTypeId;
  categoria: string;
  perguntaGlobal: string;
  informacao: string;
  dica: string;
  subperguntas: PreInspectionSubQuestion[];
}

export interface EquipmentOption {
  id: EquipmentTypeId;
  title: string;
  subtitle: string;
  normativeRef?: string;
  iconName: EquipmentIconName;
  disabled?: boolean;
}

export const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  {
    id: 'barras_horizontais',
    title: 'Barras Horizontais',
    subtitle: 'Culturas baixas e herbáceas',
    normativeRef: 'ISO 16122-2',
    iconName: 'Tractor',
    disabled: false
  },
  {
    id: 'culturas_arbustivas',
    title: 'Culturas Arbustivas / Arbóreas',
    subtitle: 'Atomizadores e turbopulverizadores',
    normativeRef: 'ISO 16122-3',
    iconName: 'Fan',
    disabled: false
  },
  {
    id: 'pistolas_pulverizacao',
    title: 'Pistolas de Pulverização',
    subtitle: 'Lanças manuais e semimóveis',
    normativeRef: 'ISO 16122-4',
    iconName: 'SprayCan',
    disabled: false
  },
  {
    id: 'pulverizador_fixo',
    title: 'Pulverizador Fixo (Estufas)',
    subtitle: 'Instalações fixas e semimóveis',
    normativeRef: 'ISO 16122-4',
    iconName: 'Factory',
    disabled: false
  },
  {
    id: 'polvilhador',
    title: 'Polvilhador',
    subtitle: 'Aplicação de pós secos',
    iconName: 'Wind',
    disabled: true
  },
  {
    id: 'drones_uas',
    title: 'Drones / UAS',
    subtitle: 'Pulverização aérea não tripulada',
    iconName: 'Plane',
    disabled: true
  }
];

export const PRE_INSPECTION_CATEGORIES: PreInspectionCategory[] = [
  {
    "id": "cat_barras_horizontais_0_limpeza_geral",
    "tipoEquipamento": "barras_horizontais",
    "categoria": "0. Limpeza Geral",
    "perguntaGlobal": "O pulverizador está perfeitamente lavado (interior e exterior)?",
    "informacao": "A limpeza rigorosa é obrigatória. Sujidade e resíduos químicos ocultam fugas no circuito e fissuras estruturais, impedindo a inspeção e os testes técnicos.",
    "dica": "Efetue a tripla lavagem do depósito e lave o chassis. Equipamentos com restos de calda ou lama impedem a realização da inspeção e comprometem os testes hidráulicos.",
    "subperguntas": [
      {
        "id": "cat_barras_horizontais_0_limpeza_geral_sub_1",
        "subpergunta": "O exterior da máquina está livre de resíduos de produtos, terra ou massas lubrificantes?",
        "informacaoSub": "A inscrustação de sujidade ou químicos oculta fissuras estruturais no chassis e desgaste nas mangueiras, impedindo a inspeção visual e camuflando fugas ativas.",
        "dicaSub": "Efetue a limpeza imediata após a aplicação. Utilize desengordurantes para remover resíduos de óleo e massa lubrificante.",
        "falhas": "Lama acumulada; incrustações de químicos no chassis; excesso de óleo e massa lubrificante nas articulações."
      },
      {
        "id": "cat_barras_horizontais_0_limpeza_geral_sub_2",
        "subpergunta": "O interior do depósito foi lavado e está isento de sedimentos?",
        "informacaoSub": "Resíduos cristalizados obstruem filtros e bicos. O depósito deve estar totalmente limpo para garantir que não existem reações químicas e que os testes usam apenas água limpa.",
        "dicaSub": "Execute a tripla lavagem após cada uso. Remova e lave o crivo de enchimento para evitar a acumulação de sedimentos.",
        "falhas": "Depósitos de sedimentos no fundo; Odor intenso a produto fitofarmacêutico; Presença de espuma na água de teste."
      }
    ]
  },
  {
    "id": "cat_barras_horizontais_1_transmissao_e_seguranca",
    "tipoEquipamento": "barras_horizontais",
    "categoria": "1. Transmissão e Segurança",
    "perguntaGlobal": "As proteções estão intactas e a estrutura sem fissuras?",
    "informacao": "Proteções danificadas na tomada de força apresentam um risco crítico de segurança, podendo resultar em lesões severas. Fissuras no chassis afetam a estabilidade mecânica e a segurança.",
    "dica": "Verifique o copo do cardan, bainha e correntes. Inspecione as principais soldaduras e o engate ao trator.",
    "subperguntas": [
      {
        "id": "cat_barras_horizontais_1_transmissao_e_seguranca_sub_1",
        "subpergunta": "As proteções do cardan e veios estão inteiras e com correntes de retenção acopladas?",
        "informacaoSub": "As proteções completas na tomada de força são essenciais para evitar acidentes graves. Veios em rotação expostos representam um perigo extremo de segurança.",
        "dicaSub": "Fixe as correntes a pontos estáticos da máquina e trator. O copo e a bainha devem cobrir a cruzeta.",
        "falhas": "Copo do cardan danificado; bainha plástica danificada; correntes ausentes ou danificadas; veio exposto."
      },
      {
        "id": "cat_barras_horizontais_1_transmissao_e_seguranca_sub_2",
        "subpergunta": "Existem fissuras visíveis no chassis ou grelhas de ventilador danificadas?",
        "informacaoSub": "Fissuras no chassis afetam a estabilidade e segurança. Em barras com assistência de ar, grelhas de proteção danificada não evitam o contacto com peças móveis.",
        "dicaSub": "Inspecione as soldaduras principais e o engate. Substitua grelhas danificadas para garantir a proteção do operador.",
        "falhas": "Soldaduras com fissuras no chassis; engates deformados; malha da grelha com rutura ou inexistente."
      },
      {
        "id": "cat_barras_horizontais_1_transmissao_e_seguranca_sub_3",
        "subpergunta": "O sistema de bloqueio das barras dobráveis (para transporte) está funcional e seguro?",
        "informacaoSub": "O bloqueio seguro das barras recolhidas é obrigatório para prevenir aberturas acidentais durante o transporte na via pública, evitando acidentes graves.",
        "dicaSub": "Teste os trincos mecânicos ou hidráulicos e garanta que a barra não abre nem oscila livremente quando está fechada.",
        "falhas": "Trincos mecânicos inoperacionais; pinos de segurança ausentes; folga excessiva nos suportes."
      }
    ]
  },
  {
    "id": "cat_barras_horizontais_2_deposito_e_filtragem",
    "tipoEquipamento": "barras_horizontais",
    "categoria": "2. Depósito e Filtragem",
    "perguntaGlobal": "O depósito garante estanquidade, os filtros estão íntegros e a calda é agitada?",
    "informacao": "Fugas no depósito causam contaminação ambiental e inviabilizam a estabilidade do circuito hidráulico. Filtros danificados obstruem bicos, e a agitação é vital para manter a calda homogénea e sem falhas.",
    "dica": "Encha o depósito com água para testar a agitação e procurar gotejamento. Inspecione as malhas de todos os filtros.",
    "subperguntas": [
      {
        "id": "cat_barras_horizontais_2_deposito_e_filtragem_sub_1",
        "subpergunta": "O depósito, tampa ou juntas apresentam fugas de líquido?",
        "informacaoSub": "Qualquer fuga no depósito ou na tampa compromete a segurança e contamina o ambiente. A estanquidade total do sistema é um requisito fundamental para evitar o desperdício.",
        "dicaSub": "Encha o depósito com água até à sua capacidade máxima e simule o movimento dinâmico. Verifique o vedante da tampa e a válvula de purga.",
        "falhas": "Fissuras no polímero do depósito; vedante da tampa com perda de elasticidade ou ausente; gotejamento na purga."
      },
      {
        "id": "cat_barras_horizontais_2_deposito_e_filtragem_sub_2",
        "subpergunta": "Os elementos filtrantes estão limpos e sem ruturas na malha?",
        "informacaoSub": "Malhas com ruturas permitem a passagem de impurezas que obstruem os bicos e desgastam a bomba, alterando a distribuição da calda. Filtros perfeitamente íntegros são vitais para a eficácia.",
        "dicaSub": "Desmonte e lave os filtros de aspiração e de linha. Substitua imediatamente as malhas com perfurações.",
        "falhas": "Malha com rutura ou colapsada; cartucho inexistente; sujidade extrema acumulada no copo do filtro."
      },
      {
        "id": "cat_barras_horizontais_2_deposito_e_filtragem_sub_3",
        "subpergunta": "A agitação da calda é vigorosa e visível no interior do tanque?",
        "informacaoSub": "A agitação é vital para manter a calda homogénea. É tecnicamente necessário que a turbulência seja visível, evitando a decantação.",
        "dicaSub": "Encha o depósito a meio e ative a agitação. Observe pelo bocal se existe turbulência forte e contínua no fundo.",
        "falhas": "Agitador hidráulico obstruído; tubo solto ou perfurado; falta de turbulência; caudal da bomba fraco."
      },
      {
        "id": "cat_barras_horizontais_2_deposito_e_filtragem_sub_4",
        "subpergunta": "O indicador de nível do depósito está legível a partir do ponto de comando ou zona de enchimento?",
        "informacaoSub": "O operador tem de conseguir ler claramente o volume de calda para evitar derrames no enchimento e controlar a aplicação, conforme as melhores práticas de pulverização.",
        "dicaSub": "Limpe a escala graduada e verifique se o flutuador interno (se existir) não está bloqueado.",
        "falhas": "Escala do nível opaca / suja; tubo transparente com rutura ou escurecido; flutuador bloqueado / imobilizado."
      },
      {
        "id": "cat_barras_horizontais_2_deposito_e_filtragem_sub_5",
        "subpergunta": "É possível limpar o filtro de aspiração com o depósito cheio sem derramar calda?",
        "informacaoSub": "O sistema deve possuir uma válvula de isolamento funcional no filtro de aspiração. Retirar o cartucho com o depósito cheio não pode resultar em fuga de líquido.",
        "dicaSub": "Encha o depósito com água limpa, feche a válvula de isolamento e abra o copo do filtro para testar.",
        "falhas": "Válvula de isolamento inoperacional / bloqueado; o-ring da tampa com fuga; derramamento de calda."
      },
      {
        "id": "cat_barras_horizontais_2_deposito_e_filtragem_sub_6",
        "subpergunta": "A válvula de esvaziamento do depósito funciona e permite recolher a calda com segurança?",
        "informacaoSub": "O depósito tem de possuir um sistema de descarga segura que encaminhe o líquido para um recipiente, evitando a contaminação direta do solo.",
        "dicaSub": "Teste a abertura e fecho do tampão ou válvula de purga, garantindo que a água flui sem escorrer pelo chassis.",
        "falhas": "Tampão oxidado / gripado; rosca danificada; gotejamento constante na válvula de descarga do fundo."
      }
    ]
  },
  {
    "id": "cat_barras_horizontais_3_circuito_hidraulico_e_pressao",
    "tipoEquipamento": "barras_horizontais",
    "categoria": "3. Circuito Hidráulico e Pressão",
    "perguntaGlobal": "A bomba não tem fugas, o manómetro está estável e reage aos comandos?",
    "informacao": "Fugas no circuito sob pressão inviabilizam a estabilidade do sistema e desperdiçam calda. A bomba deve garantir fluxo constante e o manómetro tem de estar perfeitamente estável para uma leitura exata.",
    "dica": "Teste o sistema com água limpa à pressão máxima. Se o ponteiro do manómetro apresentar instabilidade ou vibração excessiva, ajuste a pressão de ar do amortecedor da bomba.",
    "subperguntas": [
      {
        "id": "cat_barras_horizontais_3_circuito_hidraulico_e_pressao_sub_1",
        "subpergunta": "A bomba apresenta fugas de óleo/calda ou mangueiras fissuradas?",
        "informacaoSub": "Fugas na bomba ou tubagens sob pressão comprometem a eficácia do tratamento e a estabilidade do sistema. Membranas perfuradas / com rutura misturam calda com óleo, e mangueiras fissuradas podem sofrer rutura sob pressão.",
        "dicaSub": "Verifique se o óleo da bomba apresenta aspeto leitoso (indica água). Inspecione as mangueiras com a máquina na pressão máxima.",
        "falhas": "Bomba a gotejar; óleo com aspeto leitoso (emulsão por água); mangueiras fissuradas ou esmagadas."
      },
      {
        "id": "cat_barras_horizontais_3_circuito_hidraulico_e_pressao_sub_2",
        "subpergunta": "O manómetro está funcional e a leitura é legível e estável?",
        "informacaoSub": "O manómetro garante a dose correta de aplicação. O mostrador deve ter um diâmetro mínimo de 63 mm. Para pressões de trabalho inferiores a 5 bar, a divisão da escala deve ser de, pelo menos, 0,2 bar. O vidro deve estar limpo e o ponteiro totalmente estável, sem oscilações.",
        "dicaSub": "Ligue a máquina à pressão de trabalho. Se o ponteiro apresentar vibração excessiva, ajuste a pressão de ar do amortecedor da bomba.",
        "falhas": "Vidro baço ou danificado; ponteiro com oscilação excessiva ou bloqueado; falta de glicerina; diâmetro inferior a 63 mm; divisão de escala superior a 0,2 bar."
      },
      {
        "id": "cat_barras_horizontais_3_circuito_hidraulico_e_pressao_sub_3",
        "subpergunta": "O comando de regulação está funcional permite estabilizar a pressão desejada?",
        "informacaoSub": "O regulador de pressão define a dose exata de aplicação. A pressão deve manter-se constante, sem quebras ou picos, garantindo um caudal uniforme.",
        "dicaSub": "Teste rodar o manípulo em todo o seu curso. Fixe numa pressão e verifique se o ponteiro do manómetro não desce.",
        "falhas": "Manípulo bloqueado ou oxidado; pressão a cair gradualmente; mola interna danificada; fugas no corpo do regulador."
      },
      {
        "id": "cat_barras_horizontais_3_circuito_hidraulico_e_pressao_sub_4",
        "subpergunta": "O comando de corte geral e as válvulas de secção fecham o fluxo instantaneamente?",
        "informacaoSub": "O corte rápido é exigido para evitar sobreposições excessivas e contaminação nas cabeceiras. O fecho da calda tem de ser absoluto e quase imediato.",
        "dicaSub": "Com a máquina a pulverizar, acione o corte geral e depois cada secção. O fluxo nos bicos tem de ser interrompido imediatamente.",
        "falhas": "Demora no fecho; válvulas oxidadas; gotejamento após o corte; motores elétricos avariados."
      },
      {
        "id": "cat_barras_horizontais_3_circuito_hidraulico_e_pressao_sub_5",
        "subpergunta": "Ao fechar uma ou mais secções da barra, a pressão no manómetro mantém-se inalterada?",
        "informacaoSub": "A pressão não deve variar mais de 10% ao fechar secções (compensação de retorno). Variações maiores alteram a dose nas secções que ficam abertas.",
        "dicaSub": "Com as secções todas abertas, registe a pressão base. Feche uma secção e verifique se o ponteiro se mantém estável na mesma posição.",
        "falhas": "Retornos desregulados; falta de compensação; aumento súbito de pressão ao cortar secções."
      }
    ]
  },
  {
    "id": "cat_barras_horizontais_4_barra_e_distribuicao",
    "tipoEquipamento": "barras_horizontais",
    "categoria": "4. Barra e Distribuição",
    "perguntaGlobal": "A barra está nivelada, com bicos uniformes e o sistema antigota é eficaz?",
    "informacao": "Barras desniveladas e bicos diferentes alteram a dose aplicada. O sistema antigota é obrigatório e tem de cortar o fluxo em menos de 5s para evitar contaminação.",
    "dica": "Abra as barras e verifique o alinhamento visual. Confirme se os bicos são iguais e teste o corte (máx. 5 segundos).",
    "subperguntas": [
      {
        "id": "cat_barras_horizontais_4_barra_e_distribuicao_sub_1",
        "subpergunta": "A estrutura da barra está alinhada, nivelada e mecanicamente estável?",
        "informacaoSub": "Barras desniveladas ou a oscilar alteram a distância ao alvo, causando falhas ou excesso de produto. A estabilidade e o paralelismo em relação ao solo são essenciais.",
        "dicaSub": "Abra as barras num piso plano. Verifique visualmente o alinhamento e teste as molas do sistema de amortecimento.",
        "falhas": "Secções empenadas; barra com deflexão nas extremidades; folgas nas articulações; molas de retorno danificadas."
      },
      {
        "id": "cat_barras_horizontais_4_barra_e_distribuicao_sub_2",
        "subpergunta": "Os bicos são idênticos em toda a barra e o jato é visualmente uniforme?",
        "informacaoSub": "Todos os bicos na barra devem ser do mesmo tipo, tamanho, material e fabricante. Jatos deformados indicam obstrução ou desgaste, afetando a distribuição da calda.",
        "dicaSub": "Verifique a cor e a marca gravada em cada bico. Substitua bicos com jatos assimétricos, com estrias ou falhas no padrão.",
        "falhas": "Bicos de cores / marcas diferentes; jatos assimétricos ou com estrias; bicos obstruídos ou gastos."
      },
      {
        "id": "cat_barras_horizontais_4_barra_e_distribuicao_sub_3",
        "subpergunta": "O fluxo nos bicos é interrompido totalmente em menos de 5 segundos?",
        "informacaoSub": "O sistema antigota é um mecanismo crítico. O fluxo deve parar em menos de 5 segundos para evitar o desperdício de calda e a contaminação do solo em paragens e manobras.",
        "dicaSub": "Limpe e lubrifique a mola da válvula antigota. Substitua membranas ressequidas ou deformadas para garantir o corte.",
        "falhas": "Gotejamento persistente (>5s); membranas perfuradas ou contaminadas; válvulas antigota bloqueadas ou ausentes."
      },
      {
        "id": "cat_barras_horizontais_4_barra_e_distribuicao_sub_4",
        "subpergunta": "O espaçamento entre bicos e a altura da barra são constantes e adequados?",
        "informacaoSub": "O espaçamento (geralmente 50cm) e a altura devem garantir a sobreposição dos jatos. É necessária uma uniformidade total para evitar falhas ou excessos de dose no alvo.",
        "dicaSub": "Verifique se os bicos estão todos à mesma distância. A altura ideal da barra é, habitualmente, 50cm acima do alvo.",
        "falhas": "Espaçamento irregular; barra demasiado alta (deriva) ou baixa (má cobertura); falta de sobreposição."
      },
      {
        "id": "cat_barras_horizontais_4_barra_e_distribuicao_sub_5",
        "subpergunta": "Os bicos estão corretamente orientados e sem obstruções no jato?",
        "informacaoSub": "Os bicos devem estar alinhados para que os jatos não colidam entre si nem intersetem a estrutura da barra. A cortina de pulverização deve ser contínua e sem interferências.",
        "dicaSub": "Incline ligeiramente os bicos (5º-10º) em relação ao eixo da barra para evitar que os jatos vizinhos intersetem.",
        "falhas": "Bicos desalinhados; jato a intersetar a estrutura da barra; bicos obstruídos; interferência entre jatos vizinhos."
      },
      {
        "id": "cat_barras_horizontais_4_barra_e_distribuicao_sub_6",
        "subpergunta": "Os bicos das extremidades têm arcos de proteção ou a barra possui um sistema de segurança contra impactos?",
        "informacaoSub": "Os bicos das pontas estão expostos. Recomenda-se o uso de arcos metálicos ou sistemas que permitam o recuo da barra em caso de choque, protegendo a estrutura e os bicos.",
        "dicaSub": "Confirme se existem arcos protetores ou se a ponta da barra articula para trás ao encontrar um obstáculo.",
        "falhas": "Bicos danificados; falta de arcos; sistema de segurança contra impactos bloqueado ou inexistente."
      }
    ]
  },
  {
    "id": "cat_culturas_arbustivas_0_limpeza_geral",
    "tipoEquipamento": "culturas_arbustivas",
    "categoria": "0. Limpeza Geral",
    "perguntaGlobal": "O pulverizador está perfeitamente lavado (interior e exterior)?",
    "informacao": "A limpeza profunda do equipamento é fundamental. Resíduos de calda e sujidade impedem a deteção de fugas no circuito e fissuras na estrutura, essenciais para garantir a eficácia operacional e segurança.",
    "dica": "Efetue a tripla lavagem e limpe o exterior. A ausência de resíduos de produto ou lama é uma condição prévia obrigatória para iniciar a inspeção.",
    "subperguntas": [
      {
        "id": "cat_culturas_arbustivas_0_limpeza_geral_sub_1",
        "subpergunta": "O exterior da máquina está livre de resíduos de produtos, terra ou massas?",
        "informacaoSub": "A limpeza permite detetar fissuras no chassis e fugas escondidas por lama ou químicos. Sujidade acumulada degrada componentes e contamina o operador e o ambiente.",
        "dicaSub": "Lave com água sob pressão e desengordurante. Foque-se nas articulações e zonas de lubrificação para detetar fugas.",
        "falhas": "Incrustações de químicos; lama seca a tapar soldaduras; acumulação de massa e óleo nos pontos articulados."
      },
      {
        "id": "cat_culturas_arbustivas_0_limpeza_geral_sub_2",
        "subpergunta": "O interior do depósito foi lavado e está isento de sedimentos?",
        "informacaoSub": "Sedimentos no interior obstruem filtros e bicos, comprometendo a pulverização. A limpeza é crucial para evitar reações químicas indesejadas entre tratamentos.",
        "dicaSub": "Utilize o bocal de lavagem interna se disponível. Verifique os cantos e o fundo do depósito, onde o produto decanta.",
        "falhas": "Incrustações de produto seco; lama ou areia no fundo; água de lavagem turva; resíduos de tratamentos anteriores."
      }
    ]
  },
  {
    "id": "cat_culturas_arbustivas_1_transmissao_e_seguranca",
    "tipoEquipamento": "culturas_arbustivas",
    "categoria": "1. Transmissão e Segurança",
    "perguntaGlobal": "As proteções estão intactas e a estrutura sem fissuras?",
    "informacao": "Proteções de veio e ventilador evitam acidentes graves. Fissuras na estrutura comprometem a estabilidade e a segurança operacional, podendo causar falhas mecânicas.",
    "dica": "Verifique a proteção do cardan e grelhas do ventilador. Procure fissuras em soldaduras e pontos de aperto do chassis.",
    "subperguntas": [
      {
        "id": "cat_culturas_arbustivas_1_transmissao_e_seguranca_sub_1",
        "subpergunta": "As proteções do cardan e veios estão inteiras e com correntes de retenção bloqueadas?",
        "informacaoSub": "A proteção do cardan deve cobrir o veio totalmente e as correntes impedem que esta rode. Um cardan sem proteção acarreta um risco extremo de ferimentos fatais ou acidentes severos em campo.",
        "dicaSub": "Verifique se a proteção gira livremente com o motor desligado e se as correntes estão bloqueadas a pontos fixos.",
        "falhas": "Proteção danificada ou curta; falta de correntes; tubo exposto; cones de proteção danificados."
      },
      {
        "id": "cat_culturas_arbustivas_1_transmissao_e_seguranca_sub_2",
        "subpergunta": "Existem fissuras visíveis no chassis ou grelhas de ventilador danificadas?",
        "informacaoSub": "Fissuras no chassis afetam a integridade estrutural. Grelhas danificadas são perigosas, pois falham na prevenção do contacto acidental com as pás do ventilador em rotação.",
        "dicaSub": "Use uma lanterna para ver soldaduras e a fixação da turbina. Garanta que a grelha está firme e não permite a passagem da mão.",
        "falhas": "Soldaduras com fissuras; grelhas com malhas largas ou em falta; pás do ventilador expostas; suportes danificados."
      },
      {
        "id": "cat_culturas_arbustivas_1_transmissao_e_seguranca_sub_3",
        "subpergunta": "O multiplicador (caixa de velocidades) apresenta fugas de óleo ou ruídos anormais?",
        "informacaoSub": "O multiplicador transmite potência ao ventilador. Fugas de óleo ou ruídos metálicos indicam desgaste severo, podendo levar à rutura mecânica severa da turbina em serviço.",
        "dicaSub": "Verifique o nível de óleo e limpe a caixa para detetar exsudação ou gotejamento. Com a máquina ligada, verifique a presença de ruídos mecânicos anómalos.",
        "falhas": "Fugas ativas de óleo; ruído de rolamentos gripados; vibração excessiva na carcaça da turbina."
      },
      {
        "id": "cat_culturas_arbustivas_1_transmissao_e_seguranca_sub_4",
        "subpergunta": "É possível desengatar o ventilador de forma independente da bomba?",
        "informacaoSub": "O equipamento tem de permitir desligar a turbina mantendo a bomba a funcionar. Isto é vital para fazer a agitação da calda ou limpeza sem projeção inadvertida do fluxo de ar.",
        "dicaSub": "Teste a alavanca de desengate. A ventoinha deve parar completamente enquanto o cardan continua a acionar a bomba.",
        "falhas": "Alavanca bloqueada ou danificada; ventilador sempre ligado; impossibilidade de desengate manual."
      }
    ]
  },
  {
    "id": "cat_culturas_arbustivas_2_deposito_e_filtragem",
    "tipoEquipamento": "culturas_arbustivas",
    "categoria": "2. Depósito e Filtragem",
    "perguntaGlobal": "O depósito garante estanquidade total, os filtros estão íntegros e a agitação é eficaz?",
    "informacao": "Fugas no depósito poluem o solo. Filtros íntegros evitam a obstrução dos bicos, e a agitação garante que a calda se mantém homogénea em todo o tratamento.",
    "dica": "Teste a estanquidade com água e inspecione a malha dos filtros. Confirme se a agitação cria turbulência visível no tanque.",
    "subperguntas": [
      {
        "id": "cat_culturas_arbustivas_2_deposito_e_filtragem_sub_1",
        "subpergunta": "O depósito, a tampa e os respetivos vedantes garantem a estanquidade total?",
        "informacaoSub": "Qualquer fuga no depósito ou tampa compromete o tratamento e a segurança ambiental. A estanquidade é obrigatória para proteger o ambiente e o operador de salpicos de calda química.",
        "dicaSub": "Inspecione o vedante da tampa e aperte as ligações das mangueiras. Encha o depósito e procure marcas de humidade.",
        "falhas": "Fissuras no reservatório; vedante da tampa seccionado/fissurado ou inexistente; fugas nas juntas das tubagens."
      },
      {
        "id": "cat_culturas_arbustivas_2_deposito_e_filtragem_sub_2",
        "subpergunta": "A malha de todos os filtros está perfeitamente íntegra e isenta de resíduos?",
        "informacaoSub": "Filtros danificados permitem a passagem de impurezas que desgastam a bomba e obstruem os bicos. A integridade da malha é obrigatória para uma aplicação uniforme.",
        "dicaSub": "Limpe os filtros de aspiração e de pressão. Use uma escova macia para não danificar a malha ao remover detritos.",
        "falhas": "Malha com rutura ou deformada; cartucho de filtro em falta; acumulação de resíduos químicos secos."
      },
      {
        "id": "cat_culturas_arbustivas_2_deposito_e_filtragem_sub_3",
        "subpergunta": "O sistema de agitação garante uma homogeneização vigorosa e contínua da calda?",
        "informacaoSub": "A agitação evita a decantação de produtos no fundo. A mistura deve ser homogénea para garantir a dose correta em todo o tratamento fitossanitário.",
        "dicaSub": "Encha o depósito a meio e ative a bomba. Verifique se existe turbulência forte e contínua no fundo do tanque.",
        "falhas": "Agitador obstruído; tubos soltos ou danificados; falta de turbulência visível; caudal insuficiente."
      },
      {
        "id": "cat_culturas_arbustivas_2_deposito_e_filtragem_sub_4",
        "subpergunta": "O indicador de nível é claramente visível do posto de condução e da zona de enchimento?",
        "informacaoSub": "O operador deve controlar o volume de calda sem sair do trator ou subir à máquina. A escala deve estar limpa e ser precisa para evitar erros de dosagem ou derrames.",
        "dicaSub": "Limpe o tubo transparente ou a escala graduada. Se o nível for eletrónico, confirme se o visor não falha.",
        "falhas": "Tubo de nível escurecido ou opaco; escala graduada ilegível; flutuador interno bloqueado."
      },
      {
        "id": "cat_culturas_arbustivas_2_deposito_e_filtragem_sub_5",
        "subpergunta": "O depósito de água limpa para lavagem das mãos está presente e funcional?",
        "informacaoSub": "É um item de segurança obrigatório. Deve conter apenas água limpa para que o operador possa lavar-se em caso de contacto acidental com produtos químicos.",
        "dicaSub": "Verifique se o depósito está abastecido e se a torneira funciona sem fugas e com caudal suficiente.",
        "falhas": "Depósito inexistente; torneira danificada ou obstruída; água contaminada ou com lodo."
      },
      {
        "id": "cat_culturas_arbustivas_2_deposito_e_filtragem_sub_6",
        "subpergunta": "O dispositivo de esvaziamento (purga) permite recolher o líquido sem contaminar o solo?",
        "informacaoSub": "A válvula de drenagem no fundo do depósito deve ser estanque e permitir o escoamento total da calda para um recipiente, prevenindo a poluição direta do solo e águas.",
        "dicaSub": "Teste a abertura da válvula ou tampão de purga. Certifique-se de que o vedante está em bom estado e não goteja.",
        "falhas": "Válvula de descarga com fuga; rosca do tampão danificada / com desgaste; impossibilidade de esvaziamento total."
      },
      {
        "id": "cat_culturas_arbustivas_2_deposito_e_filtragem_sub_7",
        "subpergunta": "O sistema de enchimento possui um dispositivo anti-retorno para evitar a contaminação da fonte de água?",
        "informacaoSub": "Deve ser evitado o contacto direto da mangueira de enchimento com a água do depósito. Deve existir um sistema que impeça o refluxo da calda para a rede pública ou poço.",
        "dicaSub": "Garanta que a mangueira de enchimento fica fixa acima do nível máximo do depósito (intervalo de ar).",
        "falhas": "Ausência de válvula anti-retorno; mangueira de enchimento mergulhada na calda; fugas no bocal."
      }
    ]
  },
  {
    "id": "cat_culturas_arbustivas_3_circuito_hidraulico_e_pressao",
    "tipoEquipamento": "culturas_arbustivas",
    "categoria": "3. Circuito Hidráulico e Pressão",
    "perguntaGlobal": "A bomba mantém-se estanque, o manómetro é estável e a regulação de pressão é precisa?",
    "informacao": "A bomba e o manómetro são componentes críticos da dinâmica de fluidos. Fugas na bomba desperdiçam produto e manómetros instáveis impedem o controlo da dose, comprometendo a eficácia da aplicação.",
    "dica": "Ligue a TDF e procure fugas na bomba. Verifique se o ponteiro do manómetro se mantém estável durante o trabalho.",
    "subperguntas": [
      {
        "id": "cat_culturas_arbustivas_3_circuito_hidraulico_e_pressao_sub_1",
        "subpergunta": "A bomba e as tubagens principais estão isentas de fugas de óleo, calda ou sinais de fadiga?",
        "informacaoSub": "As fugas na bomba ou mangueiras fissuradas causam perda de pressão e contaminação. A estanquidade total é um requisito crítico para a eficiência hidráulica e proteção ambiental.",
        "dicaSub": "Limpe a bomba antes de ligar. Procure gotas de óleo no chão ou exsudação nas mangueiras, o que indica porosidade estrutural.",
        "falhas": "Fugas nos retentores; membranas com rutura; mangueiras fissuradas ou deformadas; braçadeiras soltas."
      },
      {
        "id": "cat_culturas_arbustivas_3_circuito_hidraulico_e_pressao_sub_2",
        "subpergunta": "O manómetro é perfeitamente legível, possui a escala adequada e o ponteiro é estável?",
        "informacaoSub": "O manómetro deve ter um diâmetro mínimo de 63 mm. Para pressões de trabalho entre 5 e 20 bar, a divisão da escala deve ser de, pelo menos, 1 bar. A estabilidade do ponteiro garante que a pressão lida corresponde à pressão real nos bicos.",
        "dicaSub": "Com a bomba ligada, o ponteiro deve estar firme. Se oscilar, verifique a carga de ar no acumulador da bomba.",
        "falhas": "Escala ilegível; vidro danificado; ponteiro com vibração excessiva; não regressa ao zero parado; diâmetro inferior a 63 mm; divisão de escala superior a 1 bar."
      },
      {
        "id": "cat_culturas_arbustivas_3_circuito_hidraulico_e_pressao_sub_3",
        "subpergunta": "O comando de regulação permite ajustar e estabilizar a pressão de trabalho de forma constante?",
        "informacaoSub": "A válvula de regulação garante a dose exata de aplicação. É exigido tecnicamente que, uma vez definida, a pressão se mantenha estável para assegurar uma distribuição uniforme.",
        "dicaSub": "Rode o manípulo em todo o seu curso. Fixe uma pressão (ex: 10 bar) e verifique se o ponteiro não oscila nem desce sozinho.",
        "falhas": "Manípulo bloqueado ou oxidado; pressão a cair; mola interna danificada; fugas no corpo da válvula."
      },
      {
        "id": "cat_culturas_arbustivas_3_circuito_hidraulico_e_pressao_sub_4",
        "subpergunta": "O amortecedor de pulsações (acumulador) apresenta a pressão de carga adequada para absorver as pulsações da bomba?",
        "informacaoSub": "O acumulador estabiliza o fluxo. Sem a pressão de ar correta, o ponteiro do manómetro oscila violentamente e as mangueiras vibram, causando desgaste precoce no circuito.",
        "dicaSub": "Com a máquina parada, use um manómetro de pressão de ar na válvula do acumulador. A pressão deve ser cerca de 1/3 da de trabalho.",
        "falhas": "Ponteiro do manómetro instável; mangueiras com vibração excessiva; membrana do amortecedor perfurada; ausência de pressão de ar."
      },
      {
        "id": "cat_culturas_arbustivas_3_circuito_hidraulico_e_pressao_sub_5",
        "subpergunta": "As válvulas de corte das secções (lado esquerdo e direito) funcionam de forma estanque e independente?",
        "informacaoSub": "Em culturas arbustivas, é vital fechar um dos lados para evitar a deriva em bordaduras. O corte deve ser total e imediato, sem afetar a pressão do lado oposto.",
        "dicaSub": "Ligue a pulverização e feche um dos lados no comando. Os bicos desse arco devem interromper a pulverização imediatamente.",
        "falhas": "Válvulas que não garantam a estanquicidade; comandos bloqueados; gotejamento constante num dos lados após o corte."
      }
    ]
  },
  {
    "id": "cat_culturas_arbustivas_4_distribuicao_e_ventilador",
    "tipoEquipamento": "culturas_arbustivas",
    "categoria": "4. Distribuição e Ventilador",
    "perguntaGlobal": "O ventilador trabalha sem vibrações, os bicos são simétricos e o sistema antigota é eficaz?",
    "informacao": "A turbina deve gerar um fluxo de ar estável e equilibrado. Bicos idênticos e um sistema antigota que atue em menos de 5s são cruciais para evitar desperdícios e derivas.",
    "dica": "Ligue a turbina progressivamente e verifique se existe vibração excessiva no chassis. Confirme se os bicos têm a mesma cor e marca.",
    "subperguntas": [
      {
        "id": "cat_culturas_arbustivas_4_distribuicao_e_ventilador_sub_1",
        "subpergunta": "As pás do ventilador estão íntegras e a turbina roda sem vibrações excessivas?",
        "informacaoSub": "Pás danificadas desequilibram a turbina, causando vibrações que provocam desgaste prematuro nos rolamentos. A integridade total é vital para um fluxo de ar simétrico e seguro.",
        "dicaSub": "Rode a turbina à mão (motor desligado) para detetar anomalias estruturais. Ligue a TDF e verifique se o chassis apresenta oscilação ou se há ruídos metálicos.",
        "falhas": "Pás danificadas ou em falta; vibração forte no chassis; folgas no eixo; ruído de rolamentos gastos."
      },
      {
        "id": "cat_culturas_arbustivas_4_distribuicao_e_ventilador_sub_2",
        "subpergunta": "Existe simetria total no número, tipo e orientação dos bicos entre o lado esquerdo e o direito?",
        "informacaoSub": "A aplicação deve ser igual em ambos os lados para um tratamento homogéneo. Diferenças no número ou tipo de bicos causam erros de dose e comprometem a eficácia.",
        "dicaSub": "Conte os bicos de cada lado e confirme se as cores coincidem. Verifique se estão orientados para a massa vegetal de forma idêntica.",
        "falhas": "Número de bicos desigual; modelos diferentes entre lados; bicos fechados apenas num lado; orientação assimétrica."
      },
      {
        "id": "cat_culturas_arbustivas_4_distribuicao_e_ventilador_sub_3",
        "subpergunta": "O sistema antigota interrompe totalmente o fluxo nos bicos em menos de 5 segundos após o corte?",
        "informacaoSub": "O sistema antigota é obrigatório. O corte total em menos de 5s é fundamental para evitar contaminação do solo e desperdício de calda em cabeceiras e manobras.",
        "dicaSub": "Ative o corte em pressão de trabalho. Se gotejar, desmonte o porta-bico e limpe ou substitua a membrana interna.",
        "falhas": "Gotejamento persistente; membranas ressequidas (sem elasticidade) ou com rutura; sujidade na válvula; sistema inexistente."
      },
      {
        "id": "cat_culturas_arbustivas_4_distribuicao_e_ventilador_sub_4",
        "subpergunta": "Existem defletores ou chapas de orientação de ar para evitar a projeção vertical (deriva)?",
        "informacaoSub": "Defletores são essenciais para direcionar o ar apenas para a copa das plantas. Sem eles, parte da calda é projetada para cima, causando desperdício e deriva ambiental.",
        "dicaSub": "Verifique se a turbina tem chapas reguláveis no topo. Devem estar ajustadas para que o ar não ultrapasse a cultura.",
        "falhas": "Falta de defletores; chapas de orientação danificadas ou bloqueadas; fluxo de ar disperso verticalmente."
      },
      {
        "id": "cat_culturas_arbustivas_4_distribuicao_e_ventilador_sub_5",
        "subpergunta": "A grelha de proteção do ventilador está limpa e permite a entrada livre de ar?",
        "informacaoSub": "Folhas ou sujidade na grelha reduzem o caudal de ar, causando uma aplicação irregular. A grelha deve estar desimpedida para garantir a máxima eficiência da turbina.",
        "dicaSub": "Limpe restos de folhas ou ramos acumulados na rede de proteção. Confirme se a rede não está deformada ou obstruída.",
        "falhas": "Grelha obstruída com detritos; malha demasiado fina; redução visível da aspiração de ar."
      }
    ]
  },
  {
    "id": "cat_polvilhador_0_limpeza_geral",
    "tipoEquipamento": "polvilhador",
    "categoria": "0. Limpeza Geral",
    "perguntaGlobal": "O equipamento apresenta uma limpeza rigorosa e o interior do reservatório está totalmente seco?",
    "informacao": "A humidade no reservatório ou tubos provoca a aglomeração do pó, bloqueando o sistema de dosagem. A limpeza evita a contaminação e garante a fluidez do produto.",
    "dica": "Inspecione o fundo do depósito e os tubos. Se lavar a máquina, use ar comprimido para garantir secagem absoluta.",
    "subperguntas": [
      {
        "id": "cat_polvilhador_0_limpeza_geral_sub_1",
        "subpergunta": "O reservatório está isento de resíduos endurecidos ou aglomerados de pó de utilizações anteriores?",
        "informacaoSub": "Restos de pó antigo que absorveram humidade endurecem e podem danificar o agitador mecânico ou obstruir a saída, causando uma aplicação irregular e falhas mecânicas.",
        "dicaSub": "Remova todo o pó residual após cada utilização. Use uma espátula de plástico para verificar se há incrustações no fundo.",
        "falhas": "Pó compactado ou solidificado no fundo; agitador bloqueado; resíduos químicos de cores diferentes (mistura)."
      },
      {
        "id": "cat_polvilhador_0_limpeza_geral_sub_2",
        "subpergunta": "O exterior da máquina está livre de acumulações de pó que possam contaminar o operador?",
        "informacaoSub": "O pó fino deposita-se facilmente no chassis e comandos. A limpeza exterior é vital para a saúde do operador e para evitar a corrosão das partes metálicas.",
        "dicaSub": "Limpe o exterior preferencialmente por aspiração ou pano húmido, evitando a formação de nuvens de pó fitofarmacêutico em suspensão.",
        "falhas": "Camadas espessas de pó no chassis; comandos poeirentos; depósitos de pó nas articulações."
      }
    ]
  },
  {
    "id": "cat_polvilhador_1_transmissao_e_ventilacao",
    "tipoEquipamento": "polvilhador",
    "categoria": "1. Transmissão e Ventilação",
    "perguntaGlobal": "Os componentes de transmissão estão devidamente protegidos e o ventilador opera sem danos ou vibrações?",
    "informacao": "Proteções íntegras no cardan evitam acidentes graves. O ventilador deve estar equilibrado e com todas as pás para evitar vibrações que danifiquem a estrutura.",
    "dica": "Inspecione visualmente as proteções do cardan e das pás. Ligue a máquina e verifique se existem ruídos ou vibrações anormais.",
    "subperguntas": [
      {
        "id": "cat_polvilhador_1_transmissao_e_ventilacao_sub_1",
        "subpergunta": "O cardan e as juntas universais possuem proteções adequadas, fixas e sem danos?",
        "informacaoSub": "O veio de transmissão e as juntas devem estar totalmente cobertos por proteções funcionais para impedir o contacto acidental com o operador.",
        "dicaSub": "Verifique se a proteção não roda com o veio e se os cones de proteção cobrem as juntas nas extremidades.",
        "falhas": "Proteção do cardan danificada; falta de correntes de fixação; juntas universais expostas."
      },
      {
        "id": "cat_polvilhador_1_transmissao_e_ventilacao_sub_2",
        "subpergunta": "As pás do ventilador estão todas presentes, limpas e sem deformações mecânicas?",
        "informacaoSub": "A falta ou deformação de uma única pá causa desequilíbrio dinâmico. Isto gera vibrações que podem levar à rutura da carcaça ou do eixo.",
        "dicaSub": "Com o motor desligado, limpe e conte as pás. Verifique se existem sinais de corrosão profunda ou impactos.",
        "falhas": "Pás em falta ou danificadas; acumulação de pó endurecido; vibração excessiva em funcionamento."
      },
      {
        "id": "cat_polvilhador_1_transmissao_e_ventilacao_sub_3",
        "subpergunta": "Existe uma embraiagem funcional para desligar o ventilador independentemente de outras partes?",
        "informacaoSub": "Se presente, a embraiagem deve permitir parar o fluxo de ar mantendo outros sistemas ativos. É um componente essencial para manobras e segurança.",
        "dicaSub": "Teste o acionamento da alavanca ou comando. O ventilador deve desligar de forma suave e completa.",
        "falhas": "Embraiagem com deslizamento mecânico excessivo; comando bloqueado; impossibilidade de desligar o ventilador."
      },
      {
        "id": "cat_polvilhador_1_transmissao_e_ventilacao_sub_4",
        "subpergunta": "As partes dobráveis ou articuladas possuem sistemas de bloqueio funcionais?",
        "informacaoSub": "Se o polvilhador tiver braços ou partes dobráveis, os bloqueios de segurança devem funcionar sem defeitos para evitar aberturas acidentais.",
        "dicaSub": "Teste manualmente os pinos ou manípulos de bloqueio, garantindo que fixam a peça de forma rígida.",
        "falhas": "Dispositivos de bloqueio danificados; folgas mecânicas; impossibilidade de bloqueio mecânico."
      }
    ]
  },
  {
    "id": "cat_polvilhador_2_deposito_e_agitacao_de_po",
    "tipoEquipamento": "polvilhador",
    "categoria": "2. Depósito e Agitação de Pó",
    "perguntaGlobal": "O reservatório garante estanquidade total e o sistema de agitação assegura a fluidez constante do pó?",
    "informacao": "O depósito deve ser estanque para evitar perdas. A agitação é vital para evitar a compactação do pó; em modelos pneumáticos, a tampa deve ser hermética pois é pressurizada.",
    "dica": "Teste o fecho da tampa e procure fugas de ar ou pó. Verifique se o agitador impede a compactação do produto no fundo.",
    "subperguntas": [
      {
        "id": "cat_polvilhador_2_deposito_e_agitacao_de_po_sub_1",
        "subpergunta": "O sistema de agitação (mecânico ou por fluxo de ar) funciona corretamente sem permitir a acumulação de pó?",
        "informacaoSub": "O agitador deve manter o pó solto. Falhas aqui levam a uma distribuição irregular ou ao bloqueio total da saída por compactação do produto químico.",
        "dicaSub": "Observe o movimento do agitador mecânico ou a turbulência do ar sem usar pó durante a verificação.",
        "falhas": "Agitador bloqueado ou danificado; ausência de fluxo de ar interno; acumulação de pó endurecido."
      },
      {
        "id": "cat_polvilhador_2_deposito_e_agitacao_de_po_sub_2",
        "subpergunta": "A tampa do depósito garante a estanquicidade e possui um sistema que impede a sua abertura acidental?",
        "informacaoSub": "A tampa deve estar bem selada para evitar a dispersão de pó para o ambiente. Nos polvilhadores pneumáticos, qualquer fuga de ar na tampa compromete a pressurização.",
        "dicaSub": "Inspecione visualmente o vedante e o mecanismo de fecho. Use um anemómetro para detetar fugas de ar junto à tampa.",
        "falhas": "Vedante da tampa danificado; fecho instável; fugas de ar detetáveis; pó visível nas bordas externas."
      },
      {
        "id": "cat_polvilhador_2_deposito_e_agitacao_de_po_sub_3",
        "subpergunta": "O bocal de enchimento tem dimensões que permitem a introdução do pó de forma fácil e segura?",
        "informacaoSub": "O diâmetro do bocal deve ser suficiente para evitar derrames durante o abastecimento, minimizando a exposição do operador ao pó fitossanitário.",
        "dicaSub": "Verifique se a abertura permite o uso de acessórios de enchimento sem obstruções ou riscos de queda de pó.",
        "falhas": "Bocal demasiado estreito; deformações que dificultam o enchimento; arestas cortantes no bocal."
      },
      {
        "id": "cat_polvilhador_2_deposito_e_agitacao_de_po_sub_4",
        "subpergunta": "O depósito mantém a pressurização correta sem fugas de ar pelas juntas ou tampa?",
        "informacaoSub": "Nos polvilhadores pneumáticos, o depósito é pressurizado. Qualquer fuga de ar impede a correta extração e transporte do pó para os bicos distribuidores.",
        "dicaSub": "Com a máquina ligada, use um anemómetro ou solução detetora de fugas (água com sabão) junto às juntas para detetar fugas de ar.",
        "falhas": "Perda de pressão audível; junta da tampa ressequida (sem elasticidade); depósito com fissuras de ar."
      }
    ]
  },
  {
    "id": "cat_polvilhador_3_regulacao_e_condutas",
    "tipoEquipamento": "polvilhador",
    "categoria": "3. Regulação e Condutas",
    "perguntaGlobal": "As condutas de fluxo estão isentas de fugas e os sistemas de regulação permitem um controlo preciso, estável e seguro do débito?",
    "informacao": "Não podem existir fugas de ar nas tubagens ou mangueiras. O sistema de regulação deve ser bloqueável, possuir \"posição zero\" e permitir o corte independente de cada lado.",
    "dica": "Com o ventilador ligado, inspecione tatilmente as uniões das tubagens para detetar fugas de ar. Teste se a alavanca de débito se imobiliza de forma segura.",
    "subperguntas": [
      {
        "id": "cat_polvilhador_3_regulacao_e_condutas_sub_1",
        "subpergunta": "As tubagens e mangueiras de extração e distribuição estão isentas de perfurações, fissuras ou fugas de ar nas uniões?",
        "informacaoSub": "Fugas de ar nas condutas reduzem a velocidade de transporte do pó, causando deposição prematura dentro dos tubos e uma distribuição irregular nas saídas.",
        "dicaSub": "Inspecione visualmente toda a extensão dos tubos. Verifique se as abraçadeiras estão apertadas e sem folgas.",
        "falhas": "Perfurações ou ruturas nas mangueiras; tubagens com perda de elasticidade; fugas de ar audíveis; abraçadeiras soltas."
      },
      {
        "id": "cat_polvilhador_3_regulacao_e_condutas_sub_2",
        "subpergunta": "O dispositivo de regulação de débito possui uma \"posição zero\" funcional e é bloqueável na dose pretendida?",
        "informacaoSub": "A \"posição zero\" deve garantir o corte total do pó. O comando tem de ser bloqueável para que a vibração da máquina não altere a dose durante o trabalho.",
        "dicaSub": "Mova o comando para o zero e confirme que a saída de pó para os bicos fecha totalmente. Verifique o aperto do manípulo.",
        "falhas": "Ausência de posição de corte total; alavanca de regulação solta; impossibilidade de fixar a dose."
      },
      {
        "id": "cat_polvilhador_3_regulacao_e_condutas_sub_3",
        "subpergunta": "O sistema permite interromper a distribuição de pó de um dos lados de forma independente?",
        "informacaoSub": "O equipamento deve permitir tratar apenas de um lado. Isto é essencial para evitar a deriva em bordaduras ou no início/fim das linhas de cultura.",
        "dicaSub": "Acione os comandos de corte lateral. Verifique se o fluxo de ar/pó para o lado fechado é interrompido.",
        "falhas": "Comandos de corte bloqueados; impossibilidade de fechar apenas um lado; fugas no sistema de corte."
      },
      {
        "id": "cat_polvilhador_3_regulacao_e_condutas_sub_4",
        "subpergunta": "As marcas da escala de regulação são legíveis e o comando é operável a partir do posto de condução?",
        "informacaoSub": "As marcas da escala de regulação de débito devem ser perfeitamente legíveis. O operador deve conseguir ler a escala e ajustar o débito sem abandonar o trator.  Marcas claras são fundamentais para garantir a dose correta de enxofre.",
        "dicaSub": "Posicione-se no posto de operação e confirme a visibilidade da escala e se alcança o manípulo de regulação.",
        "falhas": "Escala graduada ilegível ou apagada; comando inacessível; falta de indicadores de posição."
      }
    ]
  },
  {
    "id": "cat_polvilhador_4_ventilador",
    "tipoEquipamento": "polvilhador",
    "categoria": "4. Ventilador",
    "perguntaGlobal": "O fluxo de ar apresenta simetria entre os lados e velocidade suficiente para garantir o transporte eficaz do pó?",
    "informacao": "A simetria de ar garante que ambos os lados da cultura recebem a mesma dose. Velocidades de ar adequadas são fundamentais para manter o pó em suspensão até ao alvo.",
    "dica": "Utilize um anemómetro para medir a velocidade à saída de cada bico. Compare a média do lado esquerdo com a do lado direito.",
    "subperguntas": [
      {
        "id": "cat_polvilhador_4_ventilador_sub_1",
        "subpergunta": "A diferença de velocidade média do ar entre o lado esquerdo e o direito é inferior a 15%?",
        "informacaoSub": "Uma assimetria superior a 15% indica desequilíbrio na distribuição. Isto resulta numa aplicação heterogénea, comprometendo a eficácia do tratamento fitossanitário.",
        "dicaSub": "Se houver assimetria, verifique se as condutas internas estão obstruídas ou se os bicos de um dos lados estão deformados.",
        "falhas": "Diferença de fluxo superior a 15%; um lado com ar insuficiente; bicos com débitos opostos."
      },
      {
        "id": "cat_polvilhador_4_ventilador_sub_2",
        "subpergunta": "A velocidade do ar em cada saída é suficiente para evitar a deposição de pó nas condutas?",
        "informacaoSub": "Velocidades de ar baixas não conseguem manter o pó em suspensão. O produto acaba por acumular-se nas curvas das mangueiras, provocando bloqueios e descargas irregulares ou intermitentes de pó.",
        "dicaSub": "Acelere o motor até à rotação de trabalho e verifique se o fluxo de ar é constante e vigoroso em todos os bicos.",
        "falhas": "Velocidade de ar insuficiente; acumulação de pó visível nos tubos; fluxo de ar intermitente."
      },
      {
        "id": "cat_polvilhador_4_ventilador_sub_3",
        "subpergunta": "Os bicos e defletores de ar estão orientados de forma a cobrir uniformemente a zona alvo?",
        "informacaoSub": "A orientação correta maximiza a deposição na folhagem e minimiza a deriva. Bicos desalinhados desperdiçam produto e podem causar contaminação de áreas vizinhas.",
        "dicaSub": "Ajuste os bicos para a altura média da cultura. Garanta que os fluxos de ar se cruzam no centro da massa vegetal.",
        "falhas": "Bicos direcionados em ângulos extremos (verticalidade); defletores soltos; falta de alinhamento entre bicos opostos."
      },
      {
        "id": "cat_polvilhador_4_ventilador_sub_4",
        "subpergunta": "O equipamento possui uma corrente ou dispositivo de descarga à terra funcional para evitar a ignição do pó?",
        "informacaoSub": "O atrito do pó nos tubos gera eletricidade estática. Sem uma descarga à terra (corrente metálica em contacto com o solo), existe risco de ignição por descarga eletrostática.",
        "dicaSub": "Confirme se a corrente metálica está bem fixada ao chassis e se tem comprimento suficiente para manter contacto contínuo com o solo.",
        "falhas": "Ausência de corrente de terra; corrente com oxidação severa ou comprimento insuficiente; falta de continuidade elétrica."
      },
      {
        "id": "cat_polvilhador_4_ventilador_sub_5",
        "subpergunta": "A velocidade de rotação do ventilador é estável e está conforme as especificações?",
        "informacaoSub": "A velocidade não deve diferir mais de ±10% do valor indicado pelo fabricante. Não deve haver fricção entre o ventilador e a carcaça, nem vibrações por desequilíbrio.",
        "dicaSub": "Utilize um tacómetro (opcional) para medir as rotações no eixo. Ouça atentamente se existem ruídos metálicos de atrito.",
        "falhas": "Rotação fora do intervalo; vibração excessiva; ruído de fricção interna; pás desalinhadas."
      }
    ]
  },
  {
    "id": "cat_pistolas_pulverizacao_0_limpeza_geral",
    "tipoEquipamento": "pistolas_pulverizacao",
    "categoria": "0. Limpeza Geral",
    "perguntaGlobal": "O equipamento de pulverização manual apresenta uma limpeza interna e externa rigorosa, isento de resíduos de produtos?",
    "informacao": "A limpeza deve abranger o interior do depósito, o circuito de pressão e todos os componentes externos (mangueiras e pistolas) para evitar riscos de contaminação ao inspetor.",
    "dica": "Lave o depósito e acione a pistola com água limpa para purgar resíduos do circuito e filtros antes da inspeção. A limpeza é o pré-requisito para uma avaliação técnica precisa e segura.",
    "subperguntas": [
      {
        "id": "cat_pistolas_pulverizacao_0_limpeza_geral_sub_1",
        "subpergunta": "O depósito, os filtros e o circuito de mangueiras estão livres de sedimentos ou calda de tratamentos anteriores?",
        "informacaoSub": "Resíduos internos podem obstruir o bico da pistola durante a medição de débito e contaminar o ambiente. A limpeza dos filtros é essencial para o fluxo constante.",
        "dicaSub": "Verifique visualmente o fundo do reservatório e o estado de conservação dos elementos filtrantes.",
        "falhas": "Sedimentos no fundo do depósito; filtros obstruídos; mangueiras com incrustações químicas."
      },
      {
        "id": "cat_pistolas_pulverizacao_0_limpeza_geral_sub_2",
        "subpergunta": "A superfície externa da pistola e das mangueiras está limpa, minimizando o risco de exposição do operador/inspetor?",
        "informacaoSub": "Zonas contaminadas externamente aumentam o risco de exposição dérmica. A limpeza externa é um requisito primário para a segurança na aplicação fitossanitária.",
        "dicaSub": "Limpe cuidadosamente os punhos das pistolas e as áreas de manuseio frequente das tubagens flexíveis.",
        "falhas": "Presença de resíduos de pesticidas nas mangueiras; punhos da pistola contaminados com resíduos químicos."
      },
      {
        "id": "cat_pistolas_pulverizacao_0_limpeza_geral_sub_3",
        "subpergunta": "O interior do reservatório está devidamente lavado e totalmente isento de sedimentos ou resíduos sólidos?",
        "informacaoSub": "Resíduos no fundo do depósito podem obstruir os filtros de linha ou o bico da pistola durante o teste de débito, invalidando a precisão da medição técnica.",
        "dicaSub": "Inspecione visualmente o fundo e os cantos do depósito. Certifique-se de que a água de purga apresenta total limpidez.",
        "falhas": "Presença de areia ou lodo; incrustações de produto químico seco; água de enxaguamento com cor/odor."
      }
    ]
  },
  {
    "id": "cat_pistolas_pulverizacao_1_transmissao_e_seguranca",
    "tipoEquipamento": "pistolas_pulverizacao",
    "categoria": "1. Transmissão e Segurança",
    "perguntaGlobal": "A estrutura de suporte é estável e todos os órgãos de transmissão de potência estão devidamente protegidos?",
    "informacao": "A estrutura deve garantir a estabilidade do depósito e da bomba. Proteções em veios, correias ou correntes são obrigatórias para evitar o contacto acidental do operador.",
    "dica": "Verifique se a bomba está firmemente fixada e se as proteções mecânicas estão fixas e não apresentam ruturas.",
    "subperguntas": [
      {
        "id": "cat_pistolas_pulverizacao_1_transmissao_e_seguranca_sub_1",
        "subpergunta": "As proteções dos órgãos de transmissão (veios de cardan, correias ou correntes) estão presentes, fixas e sem danos?",
        "informacaoSub": "Qualquer peça em movimento deve estar inacessível durante o funcionamento. Proteções danificadas ou inexistentes são consideradas falhas críticas na segurança operacional.",
        "dicaSub": "Inspecione tatilmente a proteção (com a máquina desligada). Esta deve apresentar rigidez estrutural e cobrir totalmente a zona de perigo.",
        "falhas": "Proteção inexistente; perfurações ou fissuras na proteção; correias expostas; falta de anteparos."
      },
      {
        "id": "cat_pistolas_pulverizacao_1_transmissao_e_seguranca_sub_2",
        "subpergunta": "O chassis ou estrutura de suporte apresenta fissuras, corrosão profunda ou deformações que comprometam a estabilidade?",
        "informacaoSub": "Fissuras na estrutura podem levar ao colapso do depósito ou à quebra dos suportes da bomba devido à vibração, causando fugas massivas ou acidentes mecânicos.",
        "dicaSub": "Inspecione visualmente os pontos de soldadura e as zonas de fixação da bomba ao chassis, onde a fadiga do metal é maior.",
        "falhas": "Soldaduras com fissuras; corrosão que perfura o metal; deformação visível do chassis; fixações soltas."
      },
      {
        "id": "cat_pistolas_pulverizacao_1_transmissao_e_seguranca_sub_3",
        "subpergunta": "As mangueiras flexíveis estão protegidas contra o desgaste por atrito e afastadas de arestas cortantes ou fontes de calor?",
        "informacaoSub": "Mangueiras que roçam no chassis ou estão perto do escape (em motobombas) podem romper-se sob pressão. A integridade da mangueira é vital para a segurança do operador.",
        "dicaSub": "Verifique se as mangueiras estão devidamente fixas por abraçadeiras e se não existem sinais de abrasão na malha externa.",
        "falhas": "Mangueira com malha de reforço exposta; dobras permanentes; contacto direto com o motor/escape."
      }
    ]
  },
  {
    "id": "cat_pistolas_pulverizacao_2_deposito_e_filtragem",
    "tipoEquipamento": "pistolas_pulverizacao",
    "categoria": "2. Depósito e Filtragem",
    "perguntaGlobal": "O reservatório garante estanquidade total e o sistema de filtragem assegura a proteção da bomba e a qualidade da pulverização?",
    "informacao": "O depósito não pode apresentar fugas que contaminem o operador ou o solo. A filtragem multi-etapa é essencial para evitar a obstrução dos bicos e danos na bomba.",
    "dica": "Inspecione visualmente o depósito em carga e verifique a presença de todos os filtros (enchimento, linha e pistola).",
    "subperguntas": [
      {
        "id": "cat_pistolas_pulverizacao_2_deposito_e_filtragem_sub_1",
        "subpergunta": "O depósito e as suas ligações estão isentos de fugas, tanto em repouso como à pressão máxima de trabalho?",
        "informacaoSub": "Qualquer gotejamento no reservatório ou nas tubagens de saída compromete a estabilidade da pressão. A estanquidade deve ser mantida mesmo quando o sistema está pressurizado.",
        "dicaSub": "Encha o depósito e coloque o sistema sob pressão com a pistola fechada. Procure por humidade na base e nas juntas.",
        "falhas": "Fissuras no reservatório; fugas nas uniões roscadas; gotejamento persistente; porosidade no material."
      },
      {
        "id": "cat_pistolas_pulverizacao_2_deposito_e_filtragem_sub_2",
        "subpergunta": "A tampa do depósito garant e o filtro de enchimento (crivo) está presente e íntegro?",
        "informacaoSub": "A tampa deve impedir o derrame de calda para o exterior durante o manuseamento. O filtro de enchimento é a primeira barreira contra impurezas que danificam a bomba.",
        "dicaSub": "Confirme a presença do vedante na tampa. Retire o filtro de enchimento e verifique se a malha não tem perfurações.",
        "falhas": "Tampa sem capacidade de aperto / vedação; vedante em falta ou ressequido; filtro de enchimento com rutura ou inexistente."
      },
      {
        "id": "cat_pistolas_pulverizacao_2_deposito_e_filtragem_sub_3",
        "subpergunta": "O sistema possui filtros de aspiração ou de linha com malha adequada e em bom estado de conservação?",
        "informacaoSub": "Os filtros de linha protegem as válvulas da bomba e os bicos. A malha deve estar limpa e ser proporcional ao débito para não causar cavitação ou perda de pressão.",
        "dicaSub": "Desmonte o copo do filtro de linha. A rede deve estar limpa de sedimentos e não deve apresentar sinais de oxidação ou ruturas.",
        "falhas": "Filtro colmatado (obstruído); malha metálica deformada; ausência de elemento filtrante no circuito."
      },
      {
        "id": "cat_pistolas_pulverizacao_2_deposito_e_filtragem_sub_4",
        "subpergunta": "O sistema de agitação garante uma mistura constante e homogénea da calda no interior do depósito?",
        "informacaoSub": "A agitação (geralmente por retorno de calda) evita que o produto se deposite no fundo. Uma má mistura causa doses variáveis, comprometendo a eficácia do tratamento.",
        "dicaSub": "Com a bomba ligada, observe se existe turbulência visível no interior do depósito sem formação de espuma.",
        "falhas": "Agitação inexistente; sedimentação visível no fundo; retorno de calda obstruído ou desligado."
      },
      {
        "id": "cat_pistolas_pulverizacao_2_deposito_e_filtragem_sub_5",
        "subpergunta": "O indicador de nível é perfeitamente visível e legível a partir do posto de trabalho e de enchimento?",
        "informacaoSub": "O operador deve poder controlar a quantidade de calda restante. A escala deve ser clara para evitar erros na preparação da mistura e o esgotamento da bomba.",
        "dicaSub": "Verifique se o tubo de nível ou a escala moldada no depósito estão limpos e se a leitura corresponde à realidade.",
        "falhas": "Escala apagada; tubo de nível opaco ou sujo; ausência de escala graduada; falta de flutuador."
      },
      {
        "id": "cat_pistolas_pulverizacao_2_deposito_e_filtragem_sub_6",
        "subpergunta": "Existe um dispositivo de drenagem que permita o esvaziamento total do depósito de forma segura?",
        "informacaoSub": "O depósito deve ter um ponto de purga no local mais baixo. Isto permite a limpeza total e evita que fiquem resíduos de calda acumulados entre utilizações.",
        "dicaSub": "Identifique a válvula ou tampão de drenagem na base do depósito e confirme se é operável sem ferramentas.",
        "falhas": "Ausência de bujão de drenagem; válvula de purga inacessível; fuga persistente no fecho."
      }
    ]
  },
  {
    "id": "cat_pistolas_pulverizacao_3_circuito_hidraulico_e_pressao",
    "tipoEquipamento": "pistolas_pulverizacao",
    "categoria": "3. Circuito Hidráulico e Pressão",
    "perguntaGlobal": "A bomba e o circuito mantêm-se estanques sob pressão, o manómetro é estável e a regulação permite um controlo preciso e constante?",
    "informacao": "Fugas no circuito causam perda de débito e contaminação. O manómetro deve ser estável e a pressão deve recuperar rapidamente após cada acionamento do gatilho.",
    "dica": "Coloque o sistema à pressão máxima com a pistola fechada para detetar fugas. Verifique se o ponteiro não oscila excessivamente em trabalho.",
    "subperguntas": [
      {
        "id": "cat_pistolas_pulverizacao_3_circuito_hidraulico_e_pressao_sub_1",
        "subpergunta": "A bomba apresenta estanquidade total (sem fugas de calda ou óleo) quando sujeita à pressão máxima de exercício?",
        "informacaoSub": "Fugas nos retentores ou membranas da bomba comprometem a pressão e podem contaminar o solo. A bomba deve ser capaz de atingir a pressão nominal sem perdas.",
        "dicaSub": "Inspecione visualmente o corpo da bomba e a zona do cárter enquanto o sistema está sob carga máxima.",
        "falhas": "Gotejamento de calda; fugas de óleo; perda de pressão súbita; ruídos metálicos anormais."
      },
      {
        "id": "cat_pistolas_pulverizacao_3_circuito_hidraulico_e_pressao_sub_2",
        "subpergunta": "O manómetro é perfeitamente legível, possui escala adequada e o ponteiro permanece estável durante a pulverização?",
        "informacaoSub": "O manómetro deve ter um diâmetro mínimo de 63 mm. A divisão da escala deve ser de 1 bar (para pressões até 20 bar) ou de 2 bar (para pressões superiores a 20 bar). O ponteiro estável indica um bom funcionamento do acumulador.",
        "dicaSub": "Confirme se o diâmetro do manómetro permite a leitura a 1 metro de distância. O ponteiro não deve vibrar.",
        "falhas": "Escala ilegível; vidro com rutura; ponteiro com vibração excessiva; diâmetro inferior a 63 mm; divisão de escala superior ao limite normativo; erro de leitura superior a 10%."
      },
      {
        "id": "cat_pistolas_pulverizacao_3_circuito_hidraulico_e_pressao_sub_3",
        "subpergunta": "As tubagens flexíveis e uniões estão livres de fissuras, estrangulamentos ou sinais de desgaste excessivo?",
        "informacaoSub": "As mangueiras de alta pressão para pistolas sofrem muito desgaste por arrasto. Fissuras ou deformações estruturais na borracha indicam risco iminente de rutura sob pressão.",
        "dicaSub": "Verifique toda a extensão da mangueira, especialmente junto às ligações à bomba e ao punho da pistola.",
        "falhas": "Mangueiras com malha exposta; fugas nas abraçadeiras; dobras permanentes; fissuras na borracha."
      },
      {
        "id": "cat_pistolas_pulverizacao_3_circuito_hidraulico_e_pressao_sub_4",
        "subpergunta": "A pressão de trabalho mantém-se estável e recupera o valor definido imediatamente após a reabertura do gatilho?",
        "informacaoSub": "Ao fechar e abrir a pistola, o sistema deve recuperar a pressão alvo quase instantaneamente. Oscilações lentas indicam problemas na válvula reguladora ou na bomba.",
        "dicaSub": "Acione o gatilho repetidamente e observe o manómetro. A pressão deve recuperar instantaneamente para o valor de trabalho fixado.",
        "falhas": "Queda de pressão lenta; impossibilidade de manter a pressão constante; válvula de regulação bloqueada."
      }
    ]
  },
  {
    "id": "cat_pistolas_pulverizacao_4_pistolas_manuais",
    "tipoEquipamento": "pistolas_pulverizacao",
    "categoria": "4. Pistolas Manuais",
    "perguntaGlobal": "As pistolas de pulverização funcionam de forma rápida e estanque, permitindo o corte total do fluxo e a regulação adequada do jato?",
    "informacao": "O gatilho deve permitir um corte imediato e estanque. O sistema deve garantir a ausência total de gotejamento na posição 'off' e, se existente, a regulação do débito e do ângulo deve ser funcional.",
    "dica": "Sob pressão de trabalho, feche o gatilho e observe o bico durante 5 segundos. Não deve ocorrer gotejamento contínuo.",
    "subperguntas": [
      {
        "id": "cat_pistolas_pulverizacao_4_pistolas_manuais_sub_1",
        "subpergunta": "O gatilho da pistola permite a abertura e o fecho do fluxo de forma rápida, segura e sem esforço excessivo?",
        "informacaoSub": "O mecanismo de acionamento deve ser fluido. Um gatilho encravado ou com elevada resistência mecânica impede o controlo preciso da aplicação e aumenta a fadiga do operador.",
        "dicaSub": "Teste o movimento do gatilho várias vezes. Verifique se existe um fecho de segurança que impeça o acionamento acidental.",
        "falhas": "Gatilho bloqueado; mola de retorno danificada; dificuldade em interromper o fluxo; comando danificado / inoperacional."
      },
      {
        "id": "cat_pistolas_pulverizacao_4_pistolas_manuais_sub_2",
        "subpergunta": "O sistema garante a ausência de gotejamento (estanquidade) no bico da pistola quando o gatilho está na posição \"off\"?",
        "informacaoSub": "Após o fecho, o bico não deve apresentar gotejamento. A perda de calda em posição de repouso é sinal de desgaste nas válvulas internas da pistola e causa contaminação do solo e do operador.",
        "dicaSub": "Se a pistola continuar a pingar após o fecho, verifique o estado do vedante interno ou a presença de impurezas na sede da válvula.",
        "falhas": "Gotejamento persistente após fecho; perda de líquido pelo corpo da pistola; vedantes gastos."
      },
      {
        "id": "cat_pistolas_pulverizacao_4_pistolas_manuais_sub_3",
        "subpergunta": "O sistema de regulação do débito e do ângulo do jato (se presente) funciona de forma precisa e mantém a posição definida?",
        "informacaoSub": "Muitas pistolas permitem ajustar o cone de gotas finas para jato contínuo. Esta regulação deve ser estável para garantir que a dose e o alcance se mantêm constantes.",
        "dicaSub": "Rode o bico regulável durante a pulverização. O padrão de jato deve alterar-se de forma suave e não deve desregular-se com a vibração.",
        "falhas": "Sistema de regulação bloqueado; jato assimétrico ou irregular; alteração espontânea do ângulo do jato."
      },
      {
        "id": "cat_pistolas_pulverizacao_4_pistolas_manuais_sub_4",
        "subpergunta": "O punho e o corpo da pistola estão isentos de fugas de calda que possam contaminar as mãos do operador?",
        "informacaoSub": "Fugas no punho da pistola são falhas críticas de segurança, pois provocam a exposição dérmica direta do operador ao produto fitofarmacêutico durante todo o trabalho.",
        "dicaSub": "Verifique se a união entre a mangueira e a pistola está seca e se não sai líquido pelas juntas do gatilho ou corpo.",
        "falhas": "Fuga de líquido pelo punho; fissuras no corpo da pistola; uniões roscadas a pingar."
      },
      {
        "id": "cat_pistolas_pulverizacao_4_pistolas_manuais_sub_5",
        "subpergunta": "O bico da pistola produz um padrão de pulverização uniforme, simétrico e sem estrias de água?",
        "informacaoSub": "O padrão do jato define a cobertura da cultura. Bicos gastos ou deformados criam zonas de sobredosagem ou falhas, o que resulta num tratamento ineficaz.",
        "dicaSub": "Pulverize contra uma superfície plana. O rasto de humidade deve ser contínuo e sem linhas de água mais densas (estrias).",
        "falhas": "Jato assimétrico; presença de linhas de água grossas; bico com desgaste visível no orifício."
      }
    ]
  },
  {
    "id": "cat_pulverizador_fixo_0_limpeza_geral",
    "tipoEquipamento": "pulverizador_fixo",
    "categoria": "0. Limpeza Geral",
    "perguntaGlobal": "O equipamento e toda a rede de distribuição estão rigorosamente limpos, isentos de resíduos externos e de sedimentos internos?",
    "informacao": "A limpeza é a base da segurança. Resíduos na rede fixa ou nos bicos impedem a correta avaliação da pressão e podem ocultar fugas ou causar obstruções nos ensaios.",
    "dica": "Lave o circuito até que a água apresente total limpidez nos bicos mais distantes da estufa. Limpe bem os manómetros para leitura.",
    "subperguntas": [
      {
        "id": "cat_pulverizador_fixo_0_limpeza_geral_sub_1",
        "subpergunta": "As superfícies externas da unidade de bombagem, dos painéis de comando e das mangueiras estão limpas e livres de depósitos?",
        "informacaoSub": "Em ambientes fechados, resíduos químicos nos comandos aumentam o risco de exposição do operador. A limpeza externa permite manusear as válvulas com segurança.",
        "dicaSub": "Dê especial atenção à limpeza dos manípulos das válvulas de setor e ao mostrador do manómetro de pressão.",
        "falhas": "Comandos contaminados com resíduos; incrustações de produto na bomba; mangueiras sujas; escala do manómetro baça."
      },
      {
        "id": "cat_pulverizador_fixo_0_limpeza_geral_sub_2",
        "subpergunta": "O interior do reservatório e os filtros de linha estão lavados e isentos de sedimentos ou partículas sólidas?",
        "informacaoSub": "Sedimentos no fundo do reservatório podem ser arrastados para a rede de tubagens, obstruindo bicos e alterando as medições de uniformidade do fluxo em toda a estufa.",
        "dicaSub": "Inspecione visualmente o fundo do reservatório. Verifique se as redes dos filtros não retêm resíduos secos.",
        "falhas": "Sedimentos no reservatório; filtros colmatados; presença de areias ou lamas; água de purga turva."
      },
      {
        "id": "cat_pulverizador_fixo_0_limpeza_geral_sub_3",
        "subpergunta": "A rede de tubagens foi devidamente purgada e os bicos estão livres de incrustações ou obstruções visíveis?",
        "informacaoSub": "Devido à grande extensão da rede, o produto pode decantar nas zonas de menor fluxo. A purga garante que o sistema está desobstruído em todos os pontos de saída.",
        "dicaSub": "Acione todos os setores de rega/tratamento. Confirme se o padrão de pulverização é imediato e sem falhas por sujidade.",
        "falhas": "Bicos obstruídos; resíduos de fertilizantes nas saídas; linhas de tubagem com fluxo intermitente."
      }
    ]
  },
  {
    "id": "cat_pulverizador_fixo_1_transmissao_e_seguranca",
    "tipoEquipamento": "pulverizador_fixo",
    "categoria": "1. Transmissão e Segurança",
    "perguntaGlobal": "A unidade de bombagem está devidamente protegida e a estrutura de suporte é estável e segura?",
    "informacao": "Todos os componentes móveis devem estar inacessíveis para evitar acidentes. A estrutura deve suportar as vibrações da bomba sem apresentar fadiga, fissuras ou instabilidade.",
    "dica": "Verifique a fixação dos suportes ao solo ou parede. Confirme se as grelhas de proteção do motor e correias estão firmes.",
    "subperguntas": [
      {
        "id": "cat_pulverizador_fixo_1_transmissao_e_seguranca_sub_1",
        "subpergunta": "As proteções das partes móveis (veios, correias, polias ou ventiladores de arrefecimento) estão presentes e em bom estado?",
        "informacaoSub": "Peças rotativas expostas representam um risco elevado de aprisionamento. As proteções devem cobrir totalmente os pontos de perigo e estar fixas de forma rígida.",
        "dicaSub": "Inspecione as distâncias de segurança; o acesso manual aos órgãos móveis deve estar fisicamente bloqueado sem remover a proteção.",
        "falhas": "Proteção em falta; fissuras no material; fixação instável; grelhas com aberturas excessivas."
      },
      {
        "id": "cat_pulverizador_fixo_1_transmissao_e_seguranca_sub_2",
        "subpergunta": "O chassis ou suporte da unidade de bombagem apresenta fissuras, corrosão profunda ou deformações?",
        "informacaoSub": "A estrutura deve manter-se íntegra para evitar desalinhamentos entre o motor e a bomba, que causam vibrações excessivas e podem levar à rutura total do conjunto.",
        "dicaSub": "Observe os pontos de soldadura e as zonas de contacto entre a bomba e a base. Procure sinais de oxidação severa que evidenciem fadiga do material.",
        "falhas": "Fissuras nas soldaduras; deformação visível do suporte; oxidação que compromete a resistência."
      },
      {
        "id": "cat_pulverizador_fixo_1_transmissao_e_seguranca_sub_3",
        "subpergunta": "Existe um reservatório de água limpa para lavagem de mãos/olhos acessível junto à unidade de bombagem?",
        "informacaoSub": "Este dispositivo é essencial para permitir a descontaminação rápida do operador em caso de contacto acidental com o produto concentrado durante a preparação.",
        "dicaSub": "Verifique se o depósito está abastecido à capacidade máxima com água limpa e se a torneira funciona sem esforço e sem fugas.",
        "falhas": "Ausência de depósito; água suja ou estagnada; torneira danificada ou obstruída."
      },
      {
        "id": "cat_pulverizador_fixo_1_transmissao_e_seguranca_sub_4",
        "subpergunta": "No caso de motores elétricos, as cablagens e caixas de terminais estão devidamente isoladas e protegidas contra a humidade?",
        "informacaoSub": "Dada a elevada humidade nas estufas e o uso de água, o isolamento elétrico é crítico para evitar curtos-circuitos e garantir a proteção contra contactos indiretos.",
        "dicaSub": "Confirme se os cabos não têm o isolamento cortado e se as caixas de derivação estão bem vedadas e sem sinais de água.",
        "falhas": "Cabos com isolamento danificado; caixas elétricas abertas; sinais de sobreaquecimento ou corrosão elétrica."
      },
      {
        "id": "cat_pulverizador_fixo_1_transmissao_e_seguranca_sub_5",
        "subpergunta": "O sistema de propulsão das unidades autónomas (rodas, motor, bateria) está em bom estado e operacional?",
        "informacaoSub": "O sistema de acionamento de unidades móveis autónomas deve estar em boas condições de conservação para garantir o movimento regular e seguro durante a aplicação em áreas fechadas.",
        "dicaSub": "Verifique o estado de carga e integridade das baterias, bem como o desgaste das rodas ou lagartas de tração.",
        "falhas": "Motor de tração com ruídos; baterias com fugas ou oxidação; rodas soltas ou danificadas."
      }
    ]
  },
  {
    "id": "cat_pulverizador_fixo_2_deposito_e_filtragem",
    "tipoEquipamento": "pulverizador_fixo",
    "categoria": "2. Depósito e Filtragem",
    "perguntaGlobal": "O reservatório garante estanquidade total, possui filtragem adequada e assegura a homogeneidade da calda através de uma agitação eficaz?",
    "informacao": "O depósito deve estar isento de fugas e possuir tampa estanque. A agitação mantém o produto misturado e a filtragem protege a rede de distribuição contra obstruções.",
    "dica": "Verifique as juntas da tampa e procure sinais de gotejamento na base. Teste a agitação com o depósito parcialmente cheio.",
    "subperguntas": [
      {
        "id": "cat_pulverizador_fixo_2_deposito_e_filtragem_sub_1",
        "subpergunta": "O reservatório e as respetivas ligações estão isentos de fugas e a tampa garante a estanquicidade?",
        "informacaoSub": "Qualquer fuga de calda representa um desperdício e risco ambiental. A tampa deve impedir salpicos e fechar de forma segura para manter a integridade da mistura.",
        "dicaSub": "Inspecione visualmente as soldaduras ou juntas do reservatório sob carga. Verifique se o vedante da tampa apresenta elasticidade e ausência de fissuras.",
        "falhas": "Fugas nas junções; tampa sem vedante; gotejamento constante; porosidade no material do depósito."
      },
      {
        "id": "cat_pulverizador_fixo_2_deposito_e_filtragem_sub_2",
        "subpergunta": "O sistema de agitação assegura uma mistura contínua e uniforme do produto no interior do depósito?",
        "informacaoSub": "Uma agitação ineficaz leva à decantação do produto, resultando em concentrações variáveis durante a aplicação e possível obstrução da rede de tubagens.",
        "dicaSub": "Ligue a bomba e verifique se existe movimento de circulação visível ou turbulência no fundo do reservatório sem promover a cavitação ou a formação excessiva de espuma.",
        "falhas": "Ausência de fluxo de retorno; sedimentação visível no fundo; sistema de agitação obstruído."
      },
      {
        "id": "cat_pulverizador_fixo_2_deposito_e_filtragem_sub_3",
        "subpergunta": "Os filtros (aspiração e linha) estão presentes, limpos e com a malha em bom estado de conservação?",
        "informacaoSub": "Os filtros protegem a bomba e evitam que partículas cheguem aos bicos na estufa. Devem ser de fácil acesso e ter uma malha adequada ao tipo de bicos instalados.",
        "dicaSub": "Desmonte os copos dos filtros e verifique se a rede não tem perfurações ou deformações. Verifique se existe uma válvula que permita limpar o filtro sem esvaziar o depósito.",
        "falhas": "Filtro de enchimento em falta; rede do filtro de linha com rutura; filtro de aspiração colmatado."
      },
      {
        "id": "cat_pulverizador_fixo_2_deposito_e_filtragem_sub_4",
        "subpergunta": "O indicador de nível de calda é perfeitamente visível e as marcações são legíveis a partir do ponto de enchimento?",
        "informacaoSub": "O operador deve conseguir monitorizar o volume restante para garantir a preparação correta da calda e evitar o funcionamento da bomba em vazio.",
        "dicaSub": "Limpe o exterior do tubo de nível ou da escala graduada. Verifique se a leitura do nível corresponde ao volume real no interior.",
        "falhas": "Escala graduada apagada; tubo de nível opaco ou sujo; impossibilidade de ler o nível de fora."
      },
      {
        "id": "cat_pulverizador_fixo_2_deposito_e_filtragem_sub_5",
        "subpergunta": "O reservatório possui um sistema que permita o esvaziamento total do conteúdo de forma segura?",
        "informacaoSub": "O ponto de drenagem deve permitir retirar toda a calda e águas de lavagem, evitando a acumulação de resíduos químicos no fundo do depósito entre utilizações.",
        "dicaSub": "Localize a válvula de dreno no ponto mais baixo e confirme se o manuseamento é fácil e sem perdas.",
        "falhas": "Ausência de bujão de drenagem; válvula bloqueada; fuga persistente no sistema de fecho."
      },
      {
        "id": "cat_pulverizador_fixo_2_deposito_e_filtragem_sub_6",
        "subpergunta": "É possível limpar os filtros com o depósito cheio sem ocorrer derrame de calda para o exterior?",
        "informacaoSub": "O sistema deve possuir válvulas de isolamento que permitam a manutenção e limpeza dos elementos filtrantes sem a perda do conteúdo do reservatório principal.",
        "dicaSub": "Verifique se as válvulas de corte antes e depois do filtro de linha garantem a estanquicidade.",
        "falhas": "Impossibilidade de isolar o filtro; derrame de líquido durante a abertura do copo do filtro."
      },
      {
        "id": "cat_pulverizador_fixo_2_deposito_e_filtragem_sub_7",
        "subpergunta": "O incorporador de produtos (se existente) funciona corretamente e impede a entrada de objetos com diâmetro superior a 20 mm?",
        "informacaoSub": "O incorporador deve permitir a introdução segura de produtos químicos e possuir uma grelha de proteção para evitar a entrada de contaminantes sólidos de grandes dimensões no reservatório.",
        "dicaSub": "Teste o fluxo de água do incorporador e meça a malha da grelha de proteção.",
        "falhas": "Grelha de proteção inexistente ou com perfurações largas; fugas nas válvulas do incorporador."
      }
    ]
  },
  {
    "id": "cat_pulverizador_fixo_3_circuito_hidraulico_e_pressao",
    "tipoEquipamento": "pulverizador_fixo",
    "categoria": "3. Circuito Hidráulico e Pressão",
    "perguntaGlobal": "A rede hidráulica e a unidade de bombagem garantem estanquidade total sob pressão, com um sistema de controlo e medição preciso e estável?",
    "informacao": "A bomba deve atingir a pressão nominal sem fugas. O manómetro e as válvulas de regulação devem permitir manter um fluxo constante em todos os setores da rede fixa.",
    "dica": "Coloque o sistema à pressão máxima de trabalho e percorra as linhas da estufa para detetar fugas ou vibrações na tubagem.",
    "subperguntas": [
      {
        "id": "cat_pulverizador_fixo_3_circuito_hidraulico_e_pressao_sub_1",
        "subpergunta": "A bomba apresenta estanquidade total e funciona sem vibrações ou ruídos anormais à pressão máxima de exercício?",
        "informacaoSub": "Fugas nos vedantes ou membranas da bomba causam perda de rendimento e contaminação. Ruídos anormais podem indicar cavitação ou desgaste iminente dos componentes.",
        "dicaSub": "Observe o corpo da bomba e as ligações de entrada/saída durante o funcionamento. O fluxo deve ser contínuo e suave.",
        "falhas": "Gotejamento de calda; fugas de óleo; vibração excessiva da unidade; ruídos metálicos anormais."
      },
      {
        "id": "cat_pulverizador_fixo_3_circuito_hidraulico_e_pressao_sub_2",
        "subpergunta": "O manómetro central é perfeitamente legível, possui uma escala adequada e o seu ponteiro mantém-se estável em trabalho?",
        "informacaoSub": "O manómetro deve permitir leituras claras de pequenas variações de pressão. Um ponteiro que vibra impede a regulação precisa e indica falhas no amortecimento do sistema.",
        "dicaSub": "Verifique se o diâmetro do manómetro é suficiente para ser lido à distância de operação e se a escala é adequada.",
        "falhas": "Ponteiro instável; escala com divisões muito largas; vidro opaco ou danificado; erro de leitura > 10%."
      },
      {
        "id": "cat_pulverizador_fixo_3_circuito_hidraulico_e_pressao_sub_3",
        "subpergunta": "As tubagens fixas e as mangueiras flexíveis estão isentas de fugas, fissuras, estrangulamentos ou sinais de desgaste?",
        "informacaoSub": "Dada a extensão da rede em estufas, as uniões são pontos críticos de fuga. As mangueiras flexíveis não devem ter dobras que restrinjam o fluxo para os bicos.",
        "dicaSub": "Inspecione visualmente as abraçadeiras e as junções entre tubos rígidos e flexíveis enquanto o sistema está ligado.",
        "falhas": "Fugas nas uniões da rede; mangueiras apresentam deformações estruturais ou fissura; estrangulamentos na tubagem fixa."
      },
      {
        "id": "cat_pulverizador_fixo_3_circuito_hidraulico_e_pressao_sub_4",
        "subpergunta": "O dispositivo de regulação mantém a pressão constante e reage de forma rápida e estável à abertura ou fecho de setores?",
        "informacaoSub": "Ao desligar um setor da estufa, a pressão nos restantes não deve oscilar significativamente. O sistema deve recuperar o valor definido de forma quase instantânea.",
        "dicaSub": "Simule o corte de uma linha de pulverização e observe se o manómetro central estabiliza rapidamente no valor alvo.",
        "falhas": "Demora na recuperação da pressão; flutuações constantes; válvula de regulação bloqueada."
      },
      {
        "id": "cat_pulverizador_fixo_3_circuito_hidraulico_e_pressao_sub_5",
        "subpergunta": "A queda de pressão entre a unidade de bombagem e os bicos mais distantes da rede é mínima e não compromete a aplicação?",
        "informacaoSub": "Em redes fixas longas, a fricção interna reduz a pressão final. Uma queda excessiva causa subdosagem nos bicos terminais em comparação com os iniciais.",
        "dicaSub": "Se possível, utilize um manómetro portátil para comparar a pressão na saída da bomba com a pressão no último bico da rede.",
        "falhas": "Diferença visível de pulverização entre setores; pressão insuficiente nas extremidades da rede."
      },
      {
        "id": "cat_pulverizador_fixo_3_circuito_hidraulico_e_pressao_sub_6",
        "subpergunta": "As pulsações de pressão no sistema são inferiores a ±10% da pressão de trabalho?",
        "informacaoSub": "Variações bruscas de pressão comprometem a uniformidade da dose. Se existir um amortecedor de pulsações (câmara de ar), a sua membrana deve estar íntegra e com a pressão correta.",
        "dicaSub": "Observe o ponteiro do manómetro; se este oscilar rapidamente, verifique a pressão de ar no acumulador da bomba.",
        "falhas": "Oscilação do ponteiro superior a 10%; presença de líquido na válvula de ar do amortecedor."
      }
    ]
  },
  {
    "id": "cat_pulverizador_fixo_4_sistema_fixo_e_semi_movel",
    "tipoEquipamento": "pulverizador_fixo",
    "categoria": "4. Sistema Fixo e Semi-Móvel",
    "perguntaGlobal": "Os órgãos de distribuição estão fixados de forma estável, asseguram uma aplicação uniforme e o corte de fluxo é estanque em todos os bicos?",
    "informacao": "A estabilidade das linhas de bicos e a uniformidade dos componentes garantem que a dose é aplicada corretamente. O sistema de corte evita o gotejamento após o uso.",
    "dica": "Verifique se as linhas de bicos não oscilam com a pressão. Observe se todos os bicos param de pulverizar em simultâneo ao fechar a válvula.",
    "subperguntas": [
      {
        "id": "cat_pulverizador_fixo_4_sistema_fixo_e_semi_movel_sub_1",
        "subpergunta": "As linhas de bicos e barras de pulverização estão fixadas de forma rígida e mantêm o alinhamento correto durante o trabalho?",
        "informacaoSub": "Linhas soltas ou desalinhadas provocam uma distribuição irregular da calda, resultando em zonas com excesso de produto e outras com cobertura insuficiente.",
        "dicaSub": "Inspecione os suportes e abraçadeiras de fixação da tubagem à estrutura da estufa. Garanta que a distância entre bicos e cultura é constante.",
        "falhas": "Fixações soltas; tubagens fletidas ou deformadas; oscilação excessiva durante a pulverização."
      },
      {
        "id": "cat_pulverizador_fixo_4_sistema_fixo_e_semi_movel_sub_2",
        "subpergunta": "Todos os bicos possuem dispositivos antigota funcionais que interrompem totalmente o fluxo após o corte da pressão?",
        "informacaoSub": "O sistema antigota evita a perda de produto e a contaminação localizada do solo ou das plantas por gotejamento persistente após a paragem do sistema.",
        "dicaSub": "Após desligar a bomba ou o setor, verifique se o gotejamento em cada bico para num intervalo máximo de 5 segundos.",
        "falhas": "Bicos com gotejamento contínuo; válvulas antigota obstruídas ou inexistentes; membranas gastas."
      },
      {
        "id": "cat_pulverizador_fixo_4_sistema_fixo_e_semi_movel_sub_3",
        "subpergunta": "Todos os bicos instalados na mesma linha ou setor são do mesmo tipo, tamanho e material?",
        "informacaoSub": "A mistura de diferentes tipos de bicos causa uma aplicação heterogénea. Todos os bicos num setor devem ter o mesmo débito nominal para garantir a dose.",
        "dicaSub": "Confirme as cores e os códigos gravados nos bicos. Substitua bicos que apresentem padrões de jato diferentes dos restantes.",
        "falhas": "Bicos de modelos diferentes na mesma linha; jatos visivelmente desiguais; bicos deformados."
      },
      {
        "id": "cat_pulverizador_fixo_4_sistema_fixo_e_semi_movel_sub_4",
        "subpergunta": "O padrão de pulverização de cada bico é uniforme, sem estrias de água ou zonas de falha visíveis?",
        "informacaoSub": "Bicos gastos ou danificados produzem jatos assimétricos ou com linhas de água mais densas, o que compromete a eficácia do tratamento e a proteção da cultura.",
        "dicaSub": "Observe o jato contra uma superfície de cor uniforme. Procure por \"riscos\" ou falhas no leque de pulverização de cada unidade.",
        "falhas": "Jato de pulverização deformado; presença de estrias (linhas) de água; bicos obstruídos."
      },
      {
        "id": "cat_pulverizador_fixo_4_sistema_fixo_e_semi_movel_sub_5",
        "subpergunta": "Os bicos estão orientados corretamente para o alvo e protegidos contra danos mecânicos em zonas de passagem?",
        "informacaoSub": "A orientação errada desperdiça produto. Em zonas de circulação de pessoas ou máquinas, os bicos devem estar protegidos para evitar impactos que os desviem.",
        "dicaSub": "Ajuste o ângulo dos bicos para cobrir a área de forma cruzada. Verifique se existem proteções nos bicos expostos.",
        "falhas": "Bicos virados para zonas sem cultura; bicos danificados por impactos; desalinhamento do padrão."
      },
      {
        "id": "cat_pulverizador_fixo_4_sistema_fixo_e_semi_movel_sub_6",
        "subpergunta": "A barra de pulverização está bem alinhada e perfeitamente direita em toda a sua extensão?",
        "informacaoSub": "Uma barra com deformação geométrica faz com que os bicos apliquem o produto fora do sítio certo, causando falhas no tratamento ou excesso de químicos num só local.",
        "dicaSub": "Estique um fio do centro até à ponta da barra para detetar deformações no alinhamento. O desvio na ponta não deve ser maior que 2,5 cm por cada metro.",
        "falhas": "Barra com deformação visível; suportes de fixação empenados; desalinhamento dos bicos."
      },
      {
        "id": "cat_pulverizador_fixo_4_sistema_fixo_e_semi_movel_sub_7",
        "subpergunta": "A velocidade de deslocação dos robôs de pulverização desvia-se menos de ±10% da velocidade programada?",
        "informacaoSub": "Como o débito é calculado em função da velocidade, qualquer variação no movimento do robô altera diretamente a dose aplicada por metro quadrado.",
        "dicaSub": "Cronometre a passagem do robô numa distância marcada e calcule a velocidade real para comparar com o visor.",
        "falhas": "Velocidade instável; erro de avanço superior a 10%."
      }
    ]
  },
  {
    "id": "cat_drones_uas_0_limpeza_geral",
    "tipoEquipamento": "drones_uas",
    "categoria": "0. Limpeza Geral",
    "perguntaGlobal": "O drone e o seu sistema de pulverização estão rigorosamente limpos, sem restos de químicos ou sujidade no corpo e nos sensores?",
    "informacao": "A limpeza evita que resíduos de calda sequem e bloqueiem o sistema. Além disso, sensores sujos (radares e câmaras) podem falhar, causando acidentes graves durante o voo.",
    "dica": "Lave o depósito e o circuito com água limpa após cada uso. Use um pano húmido para limpar o corpo do drone e os sensores.",
    "subperguntas": [
      {
        "id": "cat_drones_uas_0_limpeza_geral_sub_1",
        "subpergunta": "O depósito e os tubos internos foram lavados e estão livres de restos de calda ou sedimentos?",
        "informacaoSub": "Como os drones usam bicos muito pequenos ou discos rotativos, qualquer grão de sujidade interrompe a aplicação. Resíduos secos podem também danificar a pequena bomba.",
        "dicaSub": "Faça circular água limpa pelo sistema até que o líquido pulverizado apresente total limpidez. Verifique se o filtro de linha está limpo.",
        "falhas": "Depósito com manchas coloridas; bicos obstruídos; tubos com resíduos viscosos no interior."
      },
      {
        "id": "cat_drones_uas_0_limpeza_geral_sub_2",
        "subpergunta": "Os sensores de voo (radares, câmaras e sensores de obstáculos) estão perfeitamente limpos e desimpedidos?",
        "informacaoSub": "A capacidade de navegação autónoma depende destes sensores. Poeira ou sujidade criam falsos positivos no radar ou bloqueiam o sistema de desvio de obstáculos.",
        "dicaSub": "Limpe as lentes e radares com um pano de microfibras suave. Nunca use produtos abrasivos que possam riscar os sensores.",
        "falhas": "Lentes com condensação ou exsudação; radares com incrustações de terra; sensores de altura obstruídos."
      },
      {
        "id": "cat_drones_uas_0_limpeza_geral_sub_3",
        "subpergunta": "Os contactos elétricos e o encaixe das baterias estão secos e sem sinais de corrosão química?",
        "informacaoSub": "Os produtos químicos são corrosivos. Se entrarem nos contactos da bateria, podem causar curto-circuitos ou perda de potência em pleno voo, provocando a queda do drone.",
        "dicaSub": "Inspecione os pinos de ligação. Se notar resíduos, use um spray de limpeza de contactos elétricos e um pincel seco e macio.",
        "falhas": "Verdete (corrosão) nos pinos; líquido pegajoso no encaixe da bateria; contactos escurecidos."
      },
      {
        "id": "cat_drones_uas_0_limpeza_geral_sub_4",
        "subpergunta": "As hélices e os braços do drone estão limpos e sem acumulação de detritos ou resíduos de pulverização?",
        "informacaoSub": "Sujidade nas hélices altera o equilíbrio e o peso, forçando mais os motores. Resíduos nos braços podem esconder fissuras ou danos estruturais importantes.",
        "dicaSub": "Limpe as hélices com um pano húmido após o trabalho. Verifique se não há fios ou ervas enrolados nos motores.",
        "falhas": "Hélices contaminadas com resíduos; braços cobertos de pó químico; motores com sujidade visível nas fendas."
      }
    ]
  },
  {
    "id": "cat_drones_uas_1_estrutura_e_seguranca_de_voo",
    "tipoEquipamento": "drones_uas",
    "categoria": "1. Estrutura e Segurança de Voo",
    "perguntaGlobal": "A estrutura do drone está em perfeitas condições e os sistemas de propulsão (motores e hélices) garantem a estabilidade e segurança do voo?",
    "informacao": "Qualquer falha na estrutura ou nos motores pode levar à queda do drone. Hélices danificadas causam vibrações que interferem com a telemetria dos sensores e podem partir-se em pleno voo.",
    "dica": "Inspecione o drone ao nível dos olhos numa superfície plana. Verifique se todos os braços estão alinhados e se não há folgas nos motores.",
    "subperguntas": [
      {
        "id": "cat_drones_uas_1_estrutura_e_seguranca_de_voo_sub_1",
        "subpergunta": "As hélices estão isentas de fissuras, cortes, dobras ou desgaste excessivo nas extremidades?",
        "informacaoSub": "As hélices giram a velocidades altíssimas. Um pequeno entalhe ou corte no bordo de ataque da hélice cria um desequilíbrio dinâmico que força o motor e pode fazer o drone cair subitamente.",
        "dicaSub": "Inspecione tatilmente o bordo de ataque da hélice para detetar microfissuras ou irregularidades. Se encontrar qualquer lasca ou rachadela, substitua a hélice imediatamente.",
        "falhas": "Hélices com desgaste estrutural nas extremidades; fissuras visíveis; hélices com perda de rigidez estrutural ou deformadas."
      },
      {
        "id": "cat_drones_uas_1_estrutura_e_seguranca_de_voo_sub_2",
        "subpergunta": "Os motores rodam de forma suave, sem ruídos metálicos e estão firmemente apertados aos braços?",
        "informacaoSub": "Folgas nos rolamentos dos motores causam vibrações que aquecem os componentes e prejudicam a precisão da pulverização. O motor deve garantir rigidez estrutural, sem apresentar qualquer folga axial ou radial.",
        "dicaSub": "Com o drone desligado, rode os motores à mão. Devem rodar livremente, sem prender nem apresentar ruído de fricção interna ou rolamentos gastos.",
        "falhas": "Motores com folga lateral; parafusos de fixação soltos; ruído de fricção ao rodar à mão."
      },
      {
        "id": "cat_drones_uas_1_estrutura_e_seguranca_de_voo_sub_3",
        "subpergunta": "Os braços e o corpo do drone estão direitos e sem sinais de fadiga ou fendas na fibra de carbono?",
        "informacaoSub": "A estrutura (chassis) deve ser rígida. Braços com deformação geométrica ou com microfissuras estruturais podem ceder com o peso do depósito cheio ou durante manobras de travagem brusca.",
        "dicaSub": "Aplique uma ligeira força nos braços para cima e para baixo. Se detetar crepitações mecânicas ou deflexão excessiva, pode haver uma falha estrutural interna",
        "falhas": "Fissuras na fibra de carbono; braços desalinhados; mecanismos de fecho dos braços com folga."
      },
      {
        "id": "cat_drones_uas_1_estrutura_e_seguranca_de_voo_sub_4",
        "subpergunta": "O sistema de fixação da bateria está operacional e a bateria não apresenta sinais de dilatação térmica?",
        "informacaoSub": "Uma bateria mal fixa pode soltar-se ou mudar o centro de gravidade. Baterias inchadas são um risco de incêndio e podem perder potência de repente em pleno voo.",
        "dicaSub": "Confirme se a bateria aciona o bloqueio mecânico de segurança ao acoplar. Olhe para a bateria de lado para verificar se as faces estão perfeitamente planas.",
        "falhas": "Bateria com dilatação térmica visível; fecho de segurança danificado ou sem tensão; pinos de contacto dobrados."
      },
      {
        "id": "cat_drones_uas_1_estrutura_e_seguranca_de_voo_sub_5",
        "subpergunta": "O trem de pouso (pernas do drone) está estável e sem danos que possam afetar a descolagem ou a aterragem?",
        "informacaoSub": "Componentes danificados ou frágeis podem causar o desequilíbrio estrutural do drone ao aterrar, levando as hélices a colidir com o solo, destruindo os motores e o sistema de pulverização.",
        "dicaSub": "Submeta o trem de pouso a uma carga de compressão estática e verifique a integridade dos suportes. Verifique as pontas de borracha ou plástico.",
        "falhas": "Componentes com reparações provisórias (ex: fita adesiva); estrutura de pouso deformada."
      }
    ]
  },
  {
    "id": "cat_drones_uas_2_deposito_e_sistema_de_pulverizacao",
    "tipoEquipamento": "drones_uas",
    "categoria": "2. Depósito e Sistema de Pulverização",
    "perguntaGlobal": "O depósito e o circuito de pulverização estão estanques, com filtros limpos e garantem uma mistura homogénea da calda?",
    "informacao": "O sistema deve estar livre de fugas para proteger a eletrónica e o ambiente. A filtragem rigorosa e a agitação são vitais para evitar a obstrução dos bicos de precisão.",
    "dica": "Encha o depósito com água e ligue a bomba no solo. Verifique se existem gotas nas uniões e se a água se move dentro do tanque.",
    "subperguntas": [
      {
        "id": "cat_drones_uas_2_deposito_e_sistema_de_pulverizacao_sub_1",
        "subpergunta": "O depósito está firmemente fixado ao corpo do drone e não apresenta qualquer fuga de líquido?",
        "informacaoSub": "Um depósito solto altera o centro de gravidade e pode desequilibrar o voo. Fugas de químicos concentrados podem corroer o chassis ou causar curto-circuitos fatais.",
        "dicaSub": "Verifique os encaixes rápidos ou parafusos de fixação. Se o depósito for removível, confirme se o sistema de retenção o imobiliza totalmente.",
        "falhas": "Gotejamento na base do tanque; fixação deficiente do depósito; fissuras no polímero ou chassis; fecho rápido solto."
      },
      {
        "id": "cat_drones_uas_2_deposito_e_sistema_de_pulverizacao_sub_2",
        "subpergunta": "O sistema de filtragem (no bocal de enchimento e na linha) está completo, limpo e com as malhas em bom estado?",
        "informacaoSub": "Os bicos dos drones são minúsculos. Sem filtros perfeitos, o sistema entope instantaneamente. O filtro de bocal impede a entrada de detritos logo no abastecimento.",
        "dicaSub": "Nunca abasteça o drone sem o filtro de cesto no bocal. Limpe o filtro de linha após cada dia de trabalho.",
        "falhas": "Filtro de bocal em falta; malha do filtro de linha danificada ou obstruída por partículas; filtros colmatados."
      },
      {
        "id": "cat_drones_uas_2_deposito_e_sistema_de_pulverizacao_sub_3",
        "subpergunta": "O indicador de nível (físico ou digital na app) é preciso e permite saber exatamente quanta calda resta?",
        "informacaoSub": "Saber o nível real evita que a bomba trabalhe em seco e aspire ar. O erro entre o volume registado pela aplicação e o que está no depósito deve ser mínimo.",
        "dicaSub": "Compare as marcas da escala física do depósito com a leitura apresentada no comando do drone. Os valores devem coincidir.",
        "falhas": "Escala do depósito apagada; sensor de nível bloqueado; erro de telemetria no comando."
      },
      {
        "id": "cat_drones_uas_2_deposito_e_sistema_de_pulverizacao_sub_4",
        "subpergunta": "O sistema de agitação ou retorno de calda mantém o produto bem misturado no interior do depósito?",
        "informacaoSub": "Os produtos para drones são densos. Se a calda não for agitada, o produto deposita-se no fundo, causando uma aplicação desigual e possíveis obstruções.",
        "dicaSub": "Com a bomba ligada, observe se a água regressa ao depósito com força suficiente para criar movimento.",
        "falhas": "Produto acumulado no fundo; falta de movimento interno da calda; tubos de retorno soltos."
      },
      {
        "id": "cat_drones_uas_2_deposito_e_sistema_de_pulverizacao_sub_5",
        "subpergunta": "As tubagens e mangueiras estão isentas de dobras, bolhas de ar ou sinais de desgaste por vibração?",
        "informacaoSub": "Tubos dobrados ou vincados restringem o fluxo hidráulico e provocam sobrecarga térmica na bomba. Bolhas de ar persistentes indicam entradas falsas de ar que impedem uma pulverização constante.",
        "dicaSub": "Inspecione os tubos nos braços do drone. Garanta que as abraçadeiras estão apertadas e os tubos sem vincos.",
        "falhas": "Tubos vincados; bolhas de ar no circuito; mangueiras a roçar na estrutura; fugas nas uniões."
      }
    ]
  },
  {
    "id": "cat_drones_uas_3_bomba_e_regulacao_de_debito",
    "tipoEquipamento": "drones_uas",
    "categoria": "3. Bomba e Regulação de Débito",
    "perguntaGlobal": "A bomba funciona sem fugas e o sistema eletrónico regula o débito de forma precisa e automática?",
    "informacao": "A bomba deve manter a pressão sem oscilações. O sistema deve ajustar o fluxo de calda automaticamente conforme o drone acelera ou abranda para garantir a dose certa.",
    "dica": "Utilize a aplicação de controlo no solo para fazer um teste de fluxo com água. Verifique se a bomba reage de imediato.",
    "subperguntas": [
      {
        "id": "cat_drones_uas_3_bomba_e_regulacao_de_debito_sub_1",
        "subpergunta": "A bomba de pulverização apresenta estanquidade total e funciona sem ruídos metálicos ou vibrações estranhas?",
        "informacaoSub": "Fugas na bomba podem molhar os componentes elétricos por baixo dela. Ruídos anormais indicam que a bomba apresenta falha iminente ou a presença de detritos no interior.",
        "dicaSub": "Ligue a bomba no modo de purga por 30 segundos. Passe um papel absorvente por baixo para confirmar que não existe qualquer exsudação ou gotejamento.",
        "falhas": "Gotejamento na bomba; vibração que induz oscilação nas tubagens; falha no arranque inicial da bomba elétrica."
      },
      {
        "id": "cat_drones_uas_3_bomba_e_regulacao_de_debito_sub_2",
        "subpergunta": "O medidor de débito (fluxómetro) está limpo e fornece leituras precisas que correspondem ao líquido gasto?",
        "informacaoSub": "O sensor de fluxo transmite ao controlador de voo o volume de líquido debitado. Se estiver sujo ou mal calibrado, o controlador de voo registará uma aplicação incorreta, resultando em sobredosagem ou subdosagem no terreno.",
        "dicaSub": "Após o teste, verifique se a quantidade de água introduzida no depósito coincide com o volume gasto registado pela aplicação.",
        "falhas": "Aviso de \"erro de fluxo\" no comando; leitura de débito instável; sensor com resíduos visíveis."
      },
      {
        "id": "cat_drones_uas_3_bomba_e_regulacao_de_debito_sub_3",
        "subpergunta": "O sistema de regulação altera o fluxo de calda de forma visível quando se altera a velocidade de voo simulada?",
        "informacaoSub": "Se o drone voar mais rápido, a bomba tem de acelerar para manter a dose. Se este ajuste falhar, o drone aplicará menos produto do que o necessário nas zonas rápidas.",
        "dicaSub": "No modo manual, tente variar a velocidade de voo e observe se o jato dos bicos fica mais forte ou mais fraco de imediato.",
        "falhas": "Débito fixo (não muda); resposta lenta do sistema; interrupção anómala do fluxo nos bicos."
      },
      {
        "id": "cat_drones_uas_3_bomba_e_regulacao_de_debito_sub_4",
        "subpergunta": "As ligações elétricas da bomba e dos sensores estão protegidas contra a humidade e sem sinais de corrosão?",
        "informacaoSub": "As fichas elétricas da bomba estão expostas a vibrações e humidade. Contactos sujos ou corroídos podem fazer com que a bomba pare subitamente durante o voo.",
        "dicaSub": "Verifique se as fichas estão bem encaixadas e se as borrachas de proteção (vedantes) não estão cortadas.",
        "falhas": "Fichas soltas; sinais de verdete (corrosão) nos pinos; cabos com isolamento cortado ou gasto."
      },
      {
        "id": "cat_drones_uas_3_bomba_e_regulacao_de_debito_sub_5",
        "subpergunta": "O sistema de purga de ar do circuito funciona corretamente e elimina todas as bolhas antes do voo?",
        "informacaoSub": "A presença de ar no circuito provoca uma pulverização descontínua ou pulsante. O sistema deve ser capaz de expulsar todo o ar rapidamente para a pulverização ser constante.",
        "dicaSub": "Execute o ciclo de purga do ar através da aplicação. Confirme a continuidade do fluxo hidráulico antes da descolagem.",
        "falhas": "Bolhas de ar bloqueadas nos tubos; bicos que demoram a começar; fluxo de calda descontínuo."
      }
    ]
  },
  {
    "id": "cat_drones_uas_4_orgaos_de_distribuicao",
    "tipoEquipamento": "drones_uas",
    "categoria": "4. Órgãos de Distribuição",
    "perguntaGlobal": "Os bicos ou discos rotativos estão em bom estado, são todos idênticos e garantem uma aplicação uniforme sem gotejamento?",
    "informacao": "A qualidade da cobertura depende do estado dos bicos. Como o drone usa pouca água, qualquer bico gasto ou sujo altera a dose e deixa zonas da cultura sem proteção.",
    "dica": "Ligue a pulverização com o drone a baixa altura e observe se o padrão de pulverização de todos os bicos é homogéneo.",
    "subperguntas": [
      {
        "id": "cat_drones_uas_4_orgaos_de_distribuicao_sub_1",
        "subpergunta": "Todos os bicos ou discos instalados no drone são do mesmo modelo, tamanho e marca?",
        "informacaoSub": "Misturar bicos de diferentes tamanhos faz com que um lado do drone aplique mais líquido que o outro, provocando uma distribuição desigual e ineficaz no campo.",
        "dicaSub": "Confirme a cor e os códigos gravados em cada bico. Se usar discos rotativos, verifique se são todos do mesmo tipo.",
        "falhas": "Bicos de cores diferentes; modelos misturados; bicos de materiais distintos (ex: cerâmica e polímero)."
      },
      {
        "id": "cat_drones_uas_4_orgaos_de_distribuicao_sub_2",
        "subpergunta": "Os bicos ou discos estão perfeitamente limpos e o padrão do jato é uniforme e isento de concentrações anómalas (estrias)?",
        "informacaoSub": "Bicos parcialmente obstruídos ou gastos criam jatos assimétricos ou com concentrações anómalas de líquido (estrias), o que resulta numa má cobertura das folhas e desperdício.",
        "dicaSub": "Limpe os bicos apenas com uma escova de cerdas macias ou ar comprimido. Nunca use agulhas ou arames que riscam o bico.",
        "falhas": "Jato deformado; presença de estrias no leque; bico obstruído."
      },
      {
        "id": "cat_drones_uas_4_orgaos_de_distribuicao_sub_3",
        "subpergunta": "O sistema de corte (antigota) funciona em todos os bicos, parando o fluxo de imediato após desligar a bomba?",
        "informacaoSub": "Drones transportam caldas muito fortes. Se o bico pingar ao parar ou ao mudar de linha, pode causar fitotoxicidade localizada na cultura ou contaminar zonas onde o drone descola e aterra.",
        "dicaSub": "Ao desligar a pulverização, a saída de água deve parar no segundo seguinte. Não deve ver gotas a cair durante 5 segundos.",
        "falhas": "Gotejamento persistente; membranas degradadas ou perfuradas; sujidade na válvula; válvulas bloqueadas; sistema inexistente."
      },
      {
        "id": "cat_drones_uas_4_orgaos_de_distribuicao_sub_4",
        "subpergunta": "Nos sistemas com discos rotativos, estes giram de forma suave, à mesma velocidade e sem vibrações?",
        "informacaoSub": "O disco deve girar muito rápido para criar gotas finas. Se um disco estiver mais lento ou vibrar, as gotas serão demasiado grandes e a calda não cobrirá bem a planta.",
        "dicaSub": "Avalie o ruído mecânico dos pequenos motores dos discos durante o teste. O som de rotação deve ser contínuo, agudo e homogéneo em todos os braços do drone.",
        "falhas": "Disco que gira devagar; vibração que induz oscilação do braço do drone; ruído de rolamentos gastos no disco."
      },
      {
        "id": "cat_drones_uas_4_orgaos_de_distribuicao_sub_5",
        "subpergunta": "Os bicos estão orientados corretamente para baixo e protegidos contra impactos durante o transporte?",
        "informacaoSub": "Um bico torto envia a calda para fora da zona de voo do drone. Sendo peças frágeis e expostas, devem estar bem alinhadas e sem danos provocados por pancadas.",
        "dicaSub": "Olhe para o drone de frente e confirme que todos os bicos apontam exatamente para o mesmo ângulo vertical.",
        "falhas": "Bicos visivelmente desalinhados; suportes de bico danificados ou mecanicamente deformados; bicos soltos."
      }
    ]
  },
  {
    "id": "cat_drones_uas_5_controlo_e_navegacao",
    "tipoEquipamento": "drones_uas",
    "categoria": "5. Controlo e Navegação",
    "perguntaGlobal": "O comando, o sistema de posicionamento e as baterias garantem o controlo total, a segurança e a precisão do voo planeado?",
    "informacao": "A segurança do voo e a precisão da dose dependem da ligação entre o comando e o drone. Erros no mapa ou falhas no GPS podem levar a aplicação para fora do local desejado.",
    "dica": "Calibre a bússola e o RTK num local aberto e sem metais. Confirme se o mapa no ecrã corresponde à realidade do terreno.",
    "subperguntas": [
      {
        "id": "cat_drones_uas_5_controlo_e_navegacao_sub_1",
        "subpergunta": "O comando (rádio controlo) está em bom estado, com os manípulos a responderem suavemente e o ecrã perfeitamente legível?",
        "informacaoSub": "O comando é o seu único elo com o drone. Manípulos que prendem ou ecrãs riscados e sujos impedem reações rápidas em caso de emergência ou de obstáculos inesperados.",
        "dicaSub": "Limpe o ecrã e teste os botões de \"Paragem de Emergência\" e \"Regresso a Casa\" (RTH) antes de iniciar cada missão.",
        "falhas": "Manípulos sem retorno à posição neutra; botões danificados; ecrã com manchas ou pouca luminosidade."
      },
      {
        "id": "cat_drones_uas_5_controlo_e_navegacao_sub_2",
        "subpergunta": "O sistema de posicionamento (GPS e Antena RTK) obtém uma ligação estável e precisa antes da descolagem?",
        "informacaoSub": "O RTK permite que o drone saiba onde está com precisão de centímetros. Sem esta precisão, o drone pode falhar as linhas de pulverização ou bater em árvores e postes.",
        "dicaSub": "Verifique na aplicação se o estado do sinal diz \"FIX\". Nunca voe com sinal fraco ou instável perto de obstáculos.",
        "falhas": "Perda constante de sinal; erro de posicionamento no mapa; antena com danos físicos visíveis."
      },
      {
        "id": "cat_drones_uas_5_controlo_e_navegacao_sub_3",
        "subpergunta": "As baterias do drone e do comando têm autonomia suficiente e não apresentam sinais de desgaste ou erros de voltagem?",
        "informacaoSub": "Baterias com elevado nível de degradação (ciclos) podem sofrer quedas de tensão abruptas sob carga máxima. O sistema de energia deve garantir que o drone tem sempre reserva para voltar e aterrar.",
        "dicaSub": "Use a aplicação para verificar o estado de degradação (State of Health - SoH) da bateria. Se houver um aviso de diferença de voltagem entre células, não voe.",
        "falhas": "Bateria com perda anómala de capacidade de carga; aviso de sobreaquecimento; conectores com sinais de queimado."
      },
      {
        "id": "cat_drones_uas_5_controlo_e_navegacao_sub_4",
        "subpergunta": "O planeamento de voo e o mapa estão corretos, com os limites da parcela e os obstáculos (postes/árvores) bem assinalados?",
        "informacaoSub": "Um erro no desenho do mapa pode fazer o drone pulverizar o vizinho ou chocar com um poste. O plano de voo deve garantir a sobreposição correta entre passagens.",
        "dicaSub": "Antes de iniciar a missão automática, confirme se o sistema identificou e integrou os obstáculos demarcados no plano de voo.",
        "falhas": "Mapa desalinhado com o terreno; limites da parcela mal definidos; obstáculos não assinalados."
      },
      {
        "id": "cat_drones_uas_5_controlo_e_navegacao_sub_5",
        "subpergunta": "Os sensores de deteção de obstáculos e o radar de seguimento de terreno estão ativos e a reagir corretamente?",
        "informacaoSub": "O radar mantém o drone à altura certa da cultura. Se falhar, o drone pode elevar-se excessivamente ou colidir com a cultura ou o terreno.",
        "dicaSub": "Faça um voo de teste a baixa velocidade e verifique se o drone sobe e desce acompanhando as variações do terreno.",
        "falhas": "Drone não mantém a altura constante; sensores ignoram obstáculos; avisos de erro no radar."
      }
    ]
  },
  {
    "id": "cat_drones_uas_6_seguranca_complementar",
    "tipoEquipamento": "drones_uas",
    "categoria": "6. Segurança Complementar",
    "perguntaGlobal": "O drone está devidamente identificado, possui avisos luminosos funcionais e o local de operação garante a segurança do operador?",
    "informacao": "A identificação clara e os avisos luminosos são essenciais para a segurança no espaço aéreo. No solo, o operador deve ter meios para se descontaminar em caso de acidente.",
    "dica": "Verifique se as luzes de estado são visíveis mesmo com sol forte. Garanta que a placa de registo está adequadamente fixada.",
    "subperguntas": [
      {
        "id": "cat_drones_uas_6_seguranca_complementar_sub_1",
        "subpergunta": "O drone possui a placa de identificação (registo) de operador e equipamento fixada de forma permanente e legível?",
        "informacaoSub": "Todo o drone de aplicação deve estar identificado. Isto permite a responsabilização em caso de incidente e ajuda na gestão de frotas e manutenções programadas.",
        "dicaSub": "A placa deve ser resistente à corrosão dos químicos e estar num local do chassis que não sofra muito calor.",
        "falhas": "Ausência de número de registo; placa ilegível ou tapada; identificação errada."
      },
      {
        "id": "cat_drones_uas_6_seguranca_complementar_sub_2",
        "subpergunta": "As luzes de estado (LEDs de navegação e aviso) estão funcionais e permitem identificar a orientação do drone à distância?",
        "informacaoSub": "As luzes indicam se o drone está pronto a voar, se tem erros ou se a bateria está fraca. Em voo, ajudam o operador a identificar rapidamente a orientação de voo (heading) do equipamento à distância.",
        "dicaSub": "Ligue o drone e confirme se os LEDs verdes/vermelhos/azuis acendem sem falhas e se as proteções de plástico não estão baças.",
        "falhas": "LEDs inoperacionais; luzes com pouca intensidade; aviso de erro de luzes no comando."
      },
      {
        "id": "cat_drones_uas_6_seguranca_complementar_sub_3",
        "subpergunta": "As grelhas de ventilação e os dissipadores de calor dos motores e da eletrónica estão desimpedidos?",
        "informacaoSub": "O esforço de voar com carga gera muito calor. Se o sistema de arrefecimento estiver tapado com pó ou resíduos, o drone pode desligar-se em pleno voo para evitar sobreaquecimento severo (thermal runaway).",
        "dicaSub": "Use um pincel seco para retirar o pó das aberturas de ar dos braços e do corpo do drone. Nunca tape estas entradas com fitas.",
        "falhas": "Entradas de ar obstruídas; acumulação de resíduos de calda; ventoinhas de arrefecimento bloqueadas."
      },
      {
        "id": "cat_drones_uas_6_seguranca_complementar_sub_4",
        "subpergunta": "Existe um kit de água limpa e lava-olhos disponível junto à estação de carregamento e mistura de calda?",
        "informacaoSub": "Como os drones aplicam produto muito concentrado, qualquer salpico na pele ou olhos é perigoso. A água limpa deve estar imediatamente ao lado do operador.",
        "dicaSub": "Tenha sempre um bidão de pelo menos 15 litros de água limpa e sabão neutro na carrinha ou no reboque de apoio ao drone.",
        "falhas": "Ausência de água limpa na zona de trabalho; sabão ou lava-olhos em falta; água contaminada."
      }
    ]
  }
];

export const PRE_INSPECTION_MOCK_CATEGORIES = PRE_INSPECTION_CATEGORIES;

export function getCategoriesByEquipment(equipmentId: EquipmentTypeId): PreInspectionCategory[] {
  return PRE_INSPECTION_CATEGORIES.filter((cat) => cat.tipoEquipamento === equipmentId);
}
