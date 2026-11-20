// src/features/weather/data/weatherGuideSprayQuestions.ts
import type { GuideQuestion } from './weatherGuideTypes.ts';

export const SPRAY_GUIDE_QUESTIONS: GuideQuestion[] = [
  // --- TEMA C: PLANEAR A PULVERIZAÇÃO ---
  {
    id: 'classificacoes-janela',
    topicId: 'pulverizacao',
    question: 'O que significam Favorável, Atenção, Adiar, Avaliação limitada e Sem dados?',
    directAnswer: 'São classificações automáticas que confrontam os parâmetros da previsão horária com os limiares técnicos configurados na aplicação para a operação de pulverização.',
    daterraFunctioning: 'Como funciona na DATERRA: "Favorável" indica cumprimento integral dos limiares de referência; "Atenção" alerta para parâmetros no limite aceitável; "Adiar" assinala chuva ativa, vento excessivo ou evaporação extrema; "Avaliação limitada" indica viabilidade dependente de heurísticas de equipamento não validadas; "Sem dados" reporta lacunas.',
    technicalGuidance: 'Orientação técnica geral: Estas indicações são estritamente consultivas. A decisão final cabe sempre ao aplicador ou responsável técnico credenciado após avaliação do estado da cultura e da parcela.',
    sourceCitations: ['DGAV — Boas Práticas Fitossanitárias', 'DATERRA Rules Engine']
  },
  {
    id: 'decisao-tratamento',
    topicId: 'pulverizacao',
    question: 'Uma previsão favorável significa que devo obrigatoriamente tratar a cultura?',
    directAnswer: 'Não. A previsão favorável atesta unicamente a viabilidade das condições atmosféricas, e não a oportunidade fitossanitária ou necessidade biológica do tratamento.',
    daterraFunctioning: 'Como funciona na DATERRA: O motor analisa fatores meteorológicos (vento, chuva, temperatura e humidade). Não monitoriza a densidade de pragas nem o ciclo biológico de fungos na sua exploração.',
    technicalGuidance: 'Orientação técnica geral: A intervenção química só deve ocorrer se for ultrapassado o nível económico de ataque (NEA) segundo as regras da Proteção Integrada, com produto autorizado no SIFITO (DGAV).',
    sourceCitations: ['DGAV / SIFITO — Condições de Autorização', 'Decreto-Lei n.º 86/2010 — Proteção Integrada']
  },
  {
    id: 'horarios-vs-duracao',
    topicId: 'pulverizacao',
    question: 'Porque são apresentados horários avaliados discretos e não uma duração contínua garantida?',
    directAnswer: 'Porque a previsão é gerada em pontos horários pontuais (ex.: 08:00, 09:00 e 10:00) e não como garantia de estabilidade minuto a minuto.',
    daterraFunctioning: 'Como funciona na DATERRA: Três avaliações favoráveis consecutivas representam três pontos discretos com parâmetros dentro dos limiares. A aplicação não soma horas fictícias nem garante estabilidade contínua entre leituras.',
    technicalGuidance: 'Orientação técnica geral: A atmosfera é dinâmica; frentes térmicas e turbulências de relevo podem originar rajadas imprevistas entre os momentos previstos pelos modelos globais.',
    sourceCitations: ['DATERRA Temporal Contract Guidelines', 'OMM — Resolução Temporal de Modelos']
  },
  {
    id: 'intervalo-operacional-campo',
    topicId: 'pulverizacao',
    question: 'O que devo confirmar no campo antes da aplicação e o que significa o intervalo 06:00–20:00?',
    directAnswer: 'O aplicador deve medir in situ a velocidade e direção real do vento, temperatura e humidade à altura do alvo, confirmando a inexistência de trabalhadores ou culturas vizinhas sensíveis.',
    daterraFunctioning: 'Como funciona na DATERRA: O intervalo das 06:00 às 20:00 delimita o período diurno configurado para operações no campo; horas fora deste período não qualificam o dia como ótimo.',
    technicalGuidance: 'Orientação técnica geral: Aplicações no crepúsculo ou noite apresentam elevado risco de inversão térmica com arrefecimento radiativo do solo, aumentando a retenção de gotas finas suspensas.',
    sourceCitations: ['DGAV — Código de Conduta na Aplicação (Cap. 5)', 'GRDC — Spray Operations in Field']
  },

  // --- TEMA D: INDICADORES E CONTEXTO ---
  {
    id: 'delta-t-faixas',
    topicId: 'indicadores',
    question: 'O que é o Delta T (ΔT) e como interpretar as faixas configuradas?',
    directAnswer: 'O Delta T é a diferença psicrométrica entre a temperatura de bolbo seco e a de bolbo húmido, constituindo um indicador da taxa de evaporação e sobrevivência das gotas de calda no ar.',
    daterraFunctioning: 'Como funciona na DATERRA: O sistema adota as seguintes faixas de referência operacional: < 2,0 °C (baixo / risco de sobrevivência prolongada e escorrimento em humidade elevada); 2,0 a 8,0 °C (faixa preferencial de referência); 8,0 a 10,0 °C (evaporação rápida); > 10,0 °C (risco crítico de perda de calda por evaporação).',
    technicalGuidance: 'Orientação técnica geral: Estas faixas derivam de orientações agronómicas internacionais (GRDC e Sprayers101) e representam guias empíricos de boas práticas, não correspondendo a limites legais de rotulagem.',
    sourceCitations: ['GRDC — Weather Essentials for Pesticide Application', 'Sprayers101 — Delta T as a Spraying Tool']
  },
  {
    id: 'delta-t-orvalho-vento-calmo',
    topicId: 'indicadores',
    question: 'Delta T baixo comprova orvalho ou escorrimento? E porque vento calmo não garante boas condições?',
    directAnswer: 'Não. Um Delta T baixo traduz reduzida evaporação atmosférica, mas não comprova a presença de orvalho; este depende de a temperatura da folha atingir o ponto de orvalho.',
    daterraFunctioning: 'Como funciona na DATERRA: Quando o vento é inferior a 2 km/h com Delta T elevado, a aplicação rotula "Vento Calmo" em vez de emitir diagnósticos precipitados de inversão térmica.',
    technicalGuidance: 'Orientação técnica geral: A ausência de vento (vento nulo ou calmo) é frequentemente acompanhada por inversões térmicas de superfície, que impedem a dispersão atmosférica e causam deriva imprevisível a longas distâncias.',
    sourceCitations: ['Sprayers101 — Why Low Wind Speed Can Be Hazardous', 'DGAV — Código de Conduta (Cap. 4)']
  },
  {
    id: 'inversao-termica-delta-t',
    topicId: 'indicadores',
    question: 'O que é inversão térmica e porque não pode ser diagnosticada pelo Delta T?',
    directAnswer: 'Inversão térmica é um fenómeno meteorológico em que a temperatura do ar aumenta com a altitude, aprisionando uma camada de ar estável e frio junto à superfície do solo.',
    daterraFunctioning: 'Como funciona na DATERRA: O Delta T mede exclusivamente a capacidade evaporativa local a uma única altitude e não gradientes térmicos verticais. Por essa razão, a aplicação não efetua diagnóstico automático de inversão.',
    technicalGuidance: 'Orientação técnica geral: Suspeite de inversão térmica ao amanhecer ou ao entardecer sob céu limpo e vento calmo, observando a movimentação horizontal de poeiras, fumo ou nevoeiros rasantes.',
    sourceCitations: ['GRDC — Recognizing Temperature Inversions', 'DGAV — Código de Conduta']
  },
  {
    id: 'periodo-sem-chuva',
    topicId: 'indicadores',
    question: 'O que significa "período previsto sem precipitação" e porque não garante secagem biológica?',
    directAnswer: 'Indica o número consecutivo de horas com precipitação prevista inferior ou igual a 0,2 mm nos dados modelados a partir da hora consultada.',
    daterraFunctioning: 'Como funciona na DATERRA: A contagem interrompe-se perante previsão de chuva (> 0,2 mm), lacuna temporal superior a 1 hora ou ausência de dados, reportando o limite do horizonte disponível.',
    technicalGuidance: 'Orientação técnica geral: O tempo de secagem da calda na folha e a resistência à lavagem variam amplamente conforme o tipo de formulação, adjuvantes, cutícula foliar e modo de ação sistémico ou de contacto indicado no rótulo homologado.',
    sourceCitations: ['DATERRA Weather Calculations Engine', 'DGAV / SIFITO — Especificações de Rotulagem']
  },
  {
    id: 'dpv-e-contexto-maquina',
    topicId: 'indicadores',
    question: 'O que é DPV e o que muda ao selecionar cultura, pulverizador, bico e calibração?',
    directAnswer: 'O Défice de Pressão de Vapor (DPV / VPD) mede a capacidade secante do ar ambiente através da temperatura e humidade; não mede a abertura estomática nem a transpiração de uma cultura específica.',
    daterraFunctioning: 'Como funciona na DATERRA: Ao escolher perfis da exploração, o sistema refina os limiares de tolerância ao vento consoante o bico e equipamento. Se a pressão de trabalho for desconhecida, a ferramenta indica contexto incompleto e não assume 3 bar por defeito. "Limpar contexto" restaura o Modo Referência.',
    technicalGuidance: 'Orientação técnica geral: A pressão de trabalho no depósito e bicos altera diretamente o espectro de gotas gerado; trabalhar com pressão fora da especificação do fabricante aumenta a fração de gotas suscetíveis a deriva.',
    sourceCitations: ['ISO 5682 / DGAV — Equipamentos de Aplicação', 'Tetens Formula for Vapor Pressure']
  },

  // --- TEMA E: FONTES E LIMITAÇÕES ---
  {
    id: 'fontes-meteorologicas-criterios',
    topicId: 'fontes',
    question: 'Quais as fontes meteorológicas e os critérios atualmente implementados?',
    directAnswer: 'As previsões provêm da API pública Open-Meteo v1, que agrega modelos numéricos internacionais e regionais com dados meteorológicos em grelha horária.',
    daterraFunctioning: 'Como funciona na DATERRA: Os critérios avaliados no motor englobam velocidade do vento, rajadas máximas, precipitação horária e Delta T durante o período diurno das 06:00 às 20:00.',
    technicalGuidance: 'Orientação técnica geral: Os modelos numéricos fornecem aproximações matemáticas válidas para planeamento tático, mas não substituem a confirmação meteorológica presencial no momento do enchimento do depósito.',
    sourceCitations: ['Open-Meteo API v1 Documentation', 'DATERRA Rules Engine']
  },
  {
    id: 'heuristicas-e-indice-deriva',
    topicId: 'fontes',
    question: 'Que heurísticas permanecem por validar e a ferramenta calcula um índice de deriva validado?',
    directAnswer: 'Atenuações de tolerância ao vento atribuídas a mangas de ar ou bicos de indução funcionam como heurísticas empíricas e não como certificações legais.',
    daterraFunctioning: 'Como funciona na DATERRA: A aplicação não calcula um índice de deriva validado nem certifica conformidade com a norma ISO 22866. Horas viáveis exclusivamente por tolerância de máquina são expressamente assinaladas como "Avaliação limitada".',
    technicalGuidance: 'Orientação técnica geral: A redução real de deriva com assistência de ar ou indução depende de calibração rigorosa, alinhamento dos difusores, velocidade de avanço e densidade da sebe vegetal.',
    sourceCitations: ['DGAV — Guia de Boas Práticas', 'DATERRA Presentation Adapter Architecture']
  },
  {
    id: 'rotulo-sifito-limitacoes-previsao',
    topicId: 'fontes',
    question: 'Onde confirmar as condições autorizadas do produto e quais as limitações temporais da previsão?',
    directAnswer: 'A única fonte legalmente vinculativa sobre doses, intervalos de segurança, distâncias de amortecimento e condições meteorológicas é o rótulo homologado pela DGAV (portal SIFITO).',
    daterraFunctioning: 'Como funciona na DATERRA: A ferramenta apoia o planeamento prévio, mas a incerteza meteorológica cresce substancialmente a partir das 48 a 72 horas. A aplicação não emite garantias de eficácia química.',
    technicalGuidance: 'Orientação técnica geral: Consulte sempre a ficha técnica e autorização de venda atualizada no SIFITO antes de preparar a calda de produtos fitofarmacêuticos.',
    sourceCitations: ['DGAV / SIFITO — Portal de Produtos Fitofarmacêuticos', 'Lei n.º 26/2013 — Uso Sustentável de Produtos Fitofarmacêuticos']
  }
];
