// src/features/weather/data/weatherGuideTopics.ts
import type { GuideTopic } from './weatherGuideTypes.ts';

export const GUIDE_TOPICS: GuideTopic[] = [
  {
    id: 'compreender',
    label: 'A. Compreender a Previsão',
    shortLabel: 'Previsão',
    iconName: 'CloudSun',
    description: 'Origem dos dados, resolução, extremos, vento a 10m e regime offline.'
  },
  {
    id: 'ferramenta',
    label: 'B. Utilizar a Ferramenta',
    shortLabel: 'Navegação',
    iconName: 'Compass',
    description: 'Seleção diária, horizontes temporais de 48h e 24h e leitura tabular.'
  },
  {
    id: 'pulverizacao',
    label: 'C. Planear a Pulverização',
    shortLabel: 'Pulverização',
    iconName: 'ShieldCheck',
    description: 'Classificações de janela, horários avaliados, intervalo operacional e campo.'
  },
  {
    id: 'indicadores',
    label: 'D. Indicadores e Contexto',
    shortLabel: 'Indicadores',
    iconName: 'Gauge',
    description: 'Delta T, inversão térmica, período sem chuva, DPV e perfis de máquina.'
  },
  {
    id: 'fontes',
    label: 'E. Fontes e Limitações',
    shortLabel: 'Fontes & Limitações',
    iconName: 'BookOpen',
    description: 'Modelos meteorológicos, rotulagem DGAV/SIFITO e heurísticas operacionais.'
  }
];
