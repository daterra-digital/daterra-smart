import { IRD_VERSIONS } from './irdConfig.ts';

export type IrdGuideTopicId =
  | 'details'
  | 'overview'
  | 'modes'
  | 'scale'
  | 'partial'
  | 'missing'
  | 'inadequate'
  | 'weather'
  | 'droplet_spectrum'
  | 'air_assist'
  | 'exposure'
  | 'certified'
  | 'history'
  | 'assumptions';

export interface IrdGuideQaItem {
  readonly id: Exclude<IrdGuideTopicId, 'details'>;
  readonly questionPt: string;
  readonly answerPt: string;
  readonly notePt?: string;
}

export const IRD_GUIDE_QA_ITEMS: readonly IrdGuideQaItem[] = [
  {
    id: 'overview',
    questionPt: 'O que significa este índice?',
    answerPt:
      'O Índice de Risco de Deriva (IRD) é um modelo heurístico de apoio à decisão em campo que agrega meteorologia, espectro de gotas, operação e exposição num valor único.',
    notePt: `Referências conceptuais externas: abordagem causal TOPPS-PROWADIS e classes de espectro ISO 25358 / BCPC. Este índice orientador (${IRD_VERSIONS.rulesetVersion} · v${IRD_VERSIONS.formulaVersion}) não substitui ensaio físico segundo a norma ISO 22866 nem certificação oficial. Prevalecem sempre as indicações do rótulo oficial do produto fitofarmacêutico.`
  },
  {
    id: 'modes',
    questionPt: 'Qual é a diferença entre os três modos?',
    answerPt:
      '1. Só Meteorologia avalia exclusivamente vento, rajada, temperatura, humidade relativa e precipitação. 2. Rápida (Manual) permite configurar diretamente parâmetros operacionais com valores mínimos obrigatórios (pressão, velocidade, altura e meteorologia) e campos opcionais em acordeão. 3. Detalhada (Perfis) lê os perfis guardados de cultura, equipamento, bico e calibração.',
    notePt:
      'Os perfis guardados podem não conter todos os campos da operação do dia (como distância a zona sensível ou altura em copa); nesses casos o modo mantém transparência sobre limites atuais sem inventar valores.'
  },
  {
    id: 'scale',
    questionPt: 'O que significa a pontuação e a classificação?',
    answerPt:
      'No IRD completo (modos Rápida e Detalhada), a pontuação varia de 1 a 100 (nunca 0, por política anti-risco-zero) combinando Meteorologia (35%), Espectro (30%), Operação (20%) e Exposição (15%). As faixas são Baixo (1–25), Moderado (26–50), Elevado (51–75) e Crítico (76–100).',
    notePt:
      'No modo Só Meteorologia é apresentada apenas a leitura meteorológica (escala 10–100), sem subíndices operacionais. Risco Baixo significa menor deriva relativa no modelo, nunca garantia absoluta de segurança.'
  },
  {
    id: 'partial',
    questionPt: 'Porque aparece uma avaliação parcial?',
    answerPt:
      'Aparece quando já existem os dados mínimos obrigatórios para calcular (meteorologia válida, pressão, velocidade e altura válida), mas falta informação complementar importante — como seleção de bico no catálogo ou distância confirmada a uma zona sensível.',
    notePt:
      'Em vez de falhar ou assumir cenário otimista, o motor aplica premissas conservadoras (por exemplo, classe de gota F = 78 e exposição base conservadora) e assinala a avaliação como parcial.'
  },
  {
    id: 'missing',
    questionPt: 'Que dados faltam nesta avaliação?',
    answerPt:
      'Os campos em falta variam consoante o modo ativo e são listados na secção contextual "Detalhes desta avaliação" no topo deste Guia Técnico sempre que existem lacunas ou premissas ativas.',
    notePt:
      'Se faltar meteorologia essencial (vento, rajadas, temperatura ou humidade) ou um campo obrigatório do modo escolhido, o índice não calcula pontuação numérica para evitar resultados enganadores.'
  },
  {
    id: 'inadequate',
    questionPt: 'Porque é apresentada uma condição inadequada para pulverizar?',
    answerPt:
      'Quando algum critério crítico do modelo é ultrapassado — precipitação > 0,2 mm/h, rajadas > 25 km/h, vento acima do limite configurado, Delta T > 10,0 °C, sobrepressão > 1,25× do máximo do bico ou distância abaixo da zona tampão do rótulo — a avaliação assinala condições inadequadas e eleva o patamar de risco.',
    notePt:
      'Trata-se de um critério operacional interno do IRD e não de uma proibição legal universal; ainda assim, respeite sempre as restrições legais do rótulo oficial do produto fitofarmacêutico.'
  },
  {
    id: 'weather',
    questionPt: 'Como influenciam o vento, as rajadas e a humidade?',
    answerPt:
      'O vento efetivo pondera vento médio (70%) e rajadas (30%). Temperatura elevada e humidade relativa baixa aumentam o Delta T e aceleram a evaporação das gotas finas em voo; chuva > 0,2 mm/h gera aviso crítico imediato.',
    notePt:
      'Previsões em grelha têm resolução limitada e não substituem anemómetro no terreno. Se os dados locais guardados no dispositivo tiverem mais de 20 minutos ou se houver vento calmo (< 2 km/h) com Delta T > 6 °C (possível inversão térmica), confirme as condições no local.'
  },
  {
    id: 'droplet_spectrum',
    questionPt: 'Como influenciam o bico, a pressão e as gotas?',
    answerPt:
      'Gotas muito finas permanecem mais tempo em suspensão e são mais arrastadas pelo vento. O motor avalia o espectro por prioridade estrita: diâmetro válido introduzido pelo utilizador -> DV10 interpolado do catálogo local -> classe BCPC -> sensibilidade -> fallback conservador (classe F).',
    notePt:
      'Aumentar a pressão tende a reduzir o diâmetro das gotas e a subir o risco no subíndice Espectro. Apenas 11 das 1.666 variantes do catálogo possuem dados numéricos DV10 (< 5 bar); as restantes usam classe ou sensibilidade.'
  },
  {
    id: 'air_assist',
    questionPt: 'Como influenciam a altura, a velocidade e a assistência de ar?',
    answerPt:
      'Maior altura de libertação da calda e maior velocidade de deslocamento aumentam o tempo e a turbulência de arrastamento. Em pulverizadores de barras horizontais, cortina ou manga de ar ativa ("Sim") aplica o fator 0,85 no subíndice Operação e ajusta limiares de vento.',
    notePt:
      '"Desconhecido" nunca equivale a "Não" na rastreabilidade e mantém premissa conservadora. Em atomizadores/copa e lança manual, a assistência de ar fica registada mas o fator 0,85 das barras não é extrapolado.'
  },
  {
    id: 'exposure',
    questionPt: 'Como são tratadas as zonas sensíveis?',
    answerPt:
      'O subíndice Exposição (15%) considera a distância à zona sensível, a zona tampão mínima declarada do rótulo e a existência de alvo sensível a sotavento (cursos de água, culturas vizinhas, habitações ou polinizadores).',
    notePt:
      'Sem distância confirmada aplica pontuação conservadora (75 base, acrescida de 15 com alvo a sotavento). No modo Detalhada (Perfis), a exposição mantém modo conservador fixo por não existirem dados do dia da aplicação nos perfis guardados.'
  },
  {
    id: 'certified',
    questionPt: 'A redução certificada altera o índice nesta versão?',
    answerPt:
      'Não. Os campos de classe ou percentagem de redução de deriva certificada servem exclusivamente para registo e rastreabilidade documental no histórico.',
    notePt:
      'A pontuação e a classificação do IRD nesta versão não são reduzidas com base em declarações de redução certificada.'
  },
  {
    id: 'history',
    questionPt: 'Como funciona o histórico e a utilização offline?',
    answerPt:
      'Quando tem sessão iniciada e uma avaliação calculada nos modos Rápida ou Detalhada, pode guardá-la com o botão "Guardar". Os registos ficam guardados apenas neste dispositivo (até 20 avaliações por utilizador), mesmo sem ligação à internet.',
    notePt:
      'Guardar um registo serve apenas para consulta e arquivo pessoal — não autoriza a aplicação nem dispensa o cumprimento do rótulo. Por privacidade em dispositivos partilhados, os registos locais do IRD são limpos ao terminar sessão.'
  },
  {
    id: 'assumptions',
    questionPt: 'Quais são as limitações do modelo e as saturações?',
    answerPt:
      'Para evitar valores extremos enganadores, o motor aplica patamares físicos mínimos e máximos: velocidade <= 4 km/h mantém patamar base, altura <= 0,5 m (barras) ou 1,0 m (copa/manual) não reduz risco abaixo da referência, e DV10 fora de 40–220 µm satura nos respetivos limites.',
    notePt:
      'Densidade/cobertura de copa e modelos específicos para drones aguardam evolução futura. Em equipamentos arbóreos sem altura calibrada numérica nos perfis, o modelo interrompe a avaliação em vez de assumir 0,5 m por omissão.'
  }
];
