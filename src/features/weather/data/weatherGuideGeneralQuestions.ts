// src/features/weather/data/weatherGuideGeneralQuestions.ts
import type { GuideQuestion } from './weatherGuideTypes.ts';

export const GENERAL_GUIDE_QUESTIONS: GuideQuestion[] = [
  // --- TEMA A: COMPREENDER A PREVISÃO ---
  {
    id: 'prev-vs-medicao',
    topicId: 'compreender',
    question: 'A previsão é uma medição direta na minha exploração?',
    directAnswer: 'Não. É uma previsão numérica gerada por modelos computacionais a partir das coordenadas geográficas da localidade selecionada, e não uma estação meteorológica física instalada na sua parcela.',
    daterraFunctioning: 'Como funciona na DATERRA: A aplicação consulta a API Open-Meteo com as coordenadas da freguesia ou concelho definido. Os valores refletem a malha do modelo numérico regional para essas coordenadas.',
    technicalGuidance: 'Orientação técnica geral: A orografia da quinta, linhas de água, encostas e sebes criam microclimas próprios. Antes de qualquer intervenção, meça o vento e a temperatura no local exato do tratamento com instrumentos portáteis.',
    sourceCitations: ['Open-Meteo Documentation (Model Architecture)', 'DGAV — Código de Conduta na Aplicação de Produtos Fitofarmacêuticos (Cap. 4)']
  },
  {
    id: 'icones-e-extremos',
    topicId: 'compreender',
    question: 'O que representam os ícones, temperaturas e valores de precipitação diários?',
    directAnswer: 'Os cartões sintetizam o estado meteorológico dominante, os valores extremos de temperatura (mínima e máxima previstas), o volume total de chuva esperado (mm) e a respetiva probabilidade (%).',
    daterraFunctioning: 'Como funciona na DATERRA: A temperatura atual exibe o valor horário modelado. A quantidade de precipitação indica o acumulado previsto no dia civil, enquanto a percentagem exibe a probabilidade de ocorrer pelo menos 0,1 mm.',
    technicalGuidance: 'Orientação técnica geral: Uma probabilidade de 60% com 0,2 mm representa aguaceiros pontuais fracos, ao passo que 90% com 15 mm indica evento generalizado contínuo. A sensação térmica combina o efeito de arrefecimento do vento e da humidade sobre a pele.',
    sourceCitations: ['Open-Meteo API v1 — Weather Variable Definitions']
  },
  {
    id: 'vento-rajadas-direcao',
    topicId: 'compreender',
    question: 'Como interpretar a velocidade do vento, rajadas e o sentido da seta?',
    directAnswer: 'Os valores expressam a velocidade média e as rajadas máximas previstas a 10 metros de altura em terreno aberto. A seta aponta na direção exata para onde o vento se desloca.',
    daterraFunctioning: 'Como funciona na DATERRA: Se o vento indicado for "De sul", a seta aponta para o topo do ecrã (Norte), indicando o percurso das massas de ar e a potencial trajetória de deriva de calda.',
    technicalGuidance: 'Orientação técnica geral: A velocidade do vento junto à vegetação (1 a 3 metros de altura) é tipicamente menor do que a 10 metros devido ao atrito do solo e das culturas, mas é mais turbulenta e instável.',
    sourceCitations: ['OMM / WMO-No. 8 — Guide to Meteorological Instruments', 'DGAV — Código de Conduta (Proteção contra Deriva)']
  },
  {
    id: 'dados-horarios-cache',
    topicId: 'compreender',
    question: 'A que período correspondem os dados horários e o que significam cache e offline?',
    directAnswer: 'Os dados horários refletem a evolução hora a hora em fuso horário local. A cache armazena a última consulta no dispositivo para consulta imediata mesmo em zonas sem cobertura de rede móvel.',
    daterraFunctioning: 'Como funciona na DATERRA: A arquitetura First-Offline guarda as previsões no IndexedDB/localStorage. O indicador de estado informa se os dados são em tempo real ou provenientes de consulta anterior.',
    technicalGuidance: 'Orientação técnica geral: Ao trabalhar em zonas sem rede, confirme sempre a hora da última sincronização para assegurar que a previsão não está desatualizada face a frentes de instabilidade recentes.',
    sourceCitations: ['DATERRA Architecture Guidelines — First-Offline Strategy']
  },

  // --- TEMA B: UTILIZAR A FERRAMENTA ---
  {
    id: 'selecao-dia-horizontes',
    topicId: 'ferramenta',
    question: 'Como selecionar um dia e porque o horizonte difere entre o cartão horário (48h) e os gráficos (24h)?',
    directAnswer: 'Toque em qualquer cartão da faixa semanal para carregar esse dia; para regressar ao dia atual, selecione "Hoje". O cartão horário de Hoje abrange 48 horas enquanto os gráficos detalham as próximas 24 horas.',
    daterraFunctioning: 'Como funciona na DATERRA: Para "Hoje", o cartão de previsão horária disponibiliza 48 horas para planeamento imediato de turnos, enquanto os gráficos focam 24 horas para manter leitura clara dos eixos. Nos restantes dias, ambos exibem o dia civil completo (00:00 às 23:00).',
    technicalGuidance: 'Orientação técnica geral: As decisões operacionais a curto prazo exigem antecipação das condições nas primeiras horas da manhã seguinte, razão pela qual o carrossel horário avança até ao dia posterior.',
    sourceCitations: ['DATERRA Master Blueprint — Modular Weather Views']
  },
  {
    id: 'consulta-tabela-pontos',
    topicId: 'ferramenta',
    question: 'Como consultar os valores numéricos exatos nos gráficos e aceder à tabela?',
    directAnswer: 'Pode interagir diretamente com os pontos do gráfico através de cursor ou toque, ou acionar o botão "Ver Tabela" para uma listagem completa e acessível.',
    daterraFunctioning: 'Como funciona na DATERRA: O botão "Ver Tabela" converte a curva gráfica numa grelha tabular com navegação por teclado e leitor de ecrã, detalhando valores de temperatura, precipitação, vento, rajadas, humidade e Delta T.',
    technicalGuidance: 'Orientação técnica geral: A representação tabular é a mais rigorosa para verificar limiares críticos pontuais sem interferência da escala visual contínua.',
    sourceCitations: ['W3C WAI-ARIA Authoring Practices — Accessible SVG Charts']
  }
];
