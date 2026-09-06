import { FORMULATIONS_BY_ID, FORMULATIONS_CATALOG } from './data';
import type { FormulationItem, SequenceStep, MixingSequenceAnalysis } from './types';

/**
 * Gera a sequência técnica rigorosa de preparação da calda no pulverizador
 * aplicando a regra dos 50% de água inicial + 50% final e o protocolo W.A.L.E.S. / A.P.P.L.E.S.
 */
export function generateMixingSequence(
  selectedIds: string[],
  tankCapacityL: number = 1000
): MixingSequenceAnalysis {
  // Filtrar apenas IDs válidos do catálogo
  const validIds = new Set(selectedIds.filter(id => FORMULATIONS_BY_ID.has(id)));
  
  // Obter objetos de formulações selecionadas (exceto H2O se tiver sido selecionado isolado)
  const selectedFormulations: FormulationItem[] = FORMULATIONS_CATALOG
    .filter(item => validIds.has(item.id) && item.id !== 'H2O')
    .sort((a, b) => a.number - b.number);

  const steps: SequenceStep[] = [];
  let currentStepNumber = 1;

  const waterInitialVol = tankCapacityL > 0 ? Math.round(tankCapacityL * 0.5) : undefined;
  const waterFinalVol = tankCapacityL > 0 ? Math.round(tankCapacityL * 0.5) : undefined;

  // 1. PASSO 1: Água Inicial (~50%) — Sempre obrigatório
  steps.push({
    id: 'step_water_initial',
    stepNumber: currentStepNumber++,
    originalNumber: 1,
    type: 'water_initial',
    title: 'Água Inicial (~50% do Volume Total)',
    subtitle: 'Base da calda e diluição inicial',
    group: 'Água - Bases e Condicionamento',
    groupId: 'agua',
    sigla: 'H2O',
    name: 'Água Limpa (50%)',
    instruction: `Encher o depósito com cerca de 50% do volume total de água limpa (${waterInitialVol ? `${waterInitialVol} L` : '~50%'}). Ligar imediatamente a agitação mecânica ou hidráulica contínua.`,
    information: 'Introduzir primeiro e usar apenas água limpa e filtrada. Manter agitação ativa.',
    faqTopic: 'mistura-agua',
    waterPercent: 50,
    waterVolumeL: waterInitialVol,
    isMandatory: true,
    isWater: true
  });

  // 2. Separar formulações selecionadas por blocos técnicos:
  // - Condicionadores de água: PH (#2), CD (#3)
  // - Sólidos e secos: WSB (#4) a TB (#9)
  // - Líquidos de suspensão e emulsão: DC (#10) a ES (#19)
  // - Soluções e nutrição: SL (#20) a PB (#24)
  // - Adjuvantes finais: MOL (#25) a OLA (#32)

  const conditioners = selectedFormulations.filter(f => f.groupId === 'agua');
  const solids = selectedFormulations.filter(f => f.groupId === 'solidos');
  const liquids = selectedFormulations.filter(f => f.groupId === 'liquidos');
  const solutions = selectedFormulations.filter(f => f.groupId === 'solucoes');
  const adjuvants = selectedFormulations.filter(f => f.groupId === 'adjuvantes');

  // Adicionar Condicionadores de Água (PH / CD)
  for (const item of conditioners) {
    steps.push({
      id: `step_${item.id}`,
      stepNumber: currentStepNumber++,
      originalNumber: item.number,
      type: 'conditioner',
      title: `${item.sigla} — ${item.name}`,
      subtitle: item.group,
      group: item.group,
      groupId: item.groupId,
      sigla: item.sigla,
      name: item.name,
      instruction: `Adicionar ${item.name} (${item.sigla}) à água inicial. Aguardar homogeneização completa antes dos restantes fitofármacos para proteger as substâncias ativas da degradação.`,
      information: item.information,
      faqTopic: item.faqTopic,
      formulationId: item.id
    });
  }

  // Adicionar Sólidos (WSB, SG, WG, WP, SP, TB)
  for (const item of solids) {
    let specificNote = item.information;
    if (item.id === 'WSB') {
      specificNote = 'Adicionar saquetas hidrossolúveis com luvas secas. Aguardar dissolução visual completa da película antes de adicionar outros produtos.';
    } else if (item.id === 'WP' || item.id === 'WG') {
      specificNote = 'Fazer pré-mistura num balde com água limpa (pre-slurry) antes de verter no depósito para evitar grumos e empedramento.';
    }

    steps.push({
      id: `step_${item.id}`,
      stepNumber: currentStepNumber++,
      originalNumber: item.number,
      type: 'solid',
      title: `${item.sigla} — ${item.name}`,
      subtitle: item.group,
      group: item.group,
      groupId: item.groupId,
      sigla: item.sigla,
      name: item.name,
      instruction: specificNote,
      information: item.information,
      faqTopic: item.faqTopic,
      formulationId: item.id
    });
  }

  // Adicionar Líquidos de Suspensão e Emulsão (DC, SC, CS, SE, OD, EW, EO, EC, ME, ES)
  for (const item of liquids) {
    steps.push({
      id: `step_${item.id}`,
      stepNumber: currentStepNumber++,
      originalNumber: item.number,
      type: 'liquid',
      title: `${item.sigla} — ${item.name}`,
      subtitle: item.group,
      group: item.group,
      groupId: item.groupId,
      sigla: item.sigla,
      name: item.name,
      instruction: `Agitar bem a embalagem original antes de abrir. Verter ${item.name} (${item.sigla}) com agitação constante. ${item.information}`,
      information: item.information,
      faqTopic: item.faqTopic,
      formulationId: item.id
    });
  }

  // Adicionar Soluções e Nutrição (SL, AF, MN, BIO, PB)
  for (const item of solutions) {
    steps.push({
      id: `step_${item.id}`,
      stepNumber: currentStepNumber++,
      originalNumber: item.number,
      type: 'solution',
      title: `${item.sigla} — ${item.name}`,
      subtitle: item.group,
      group: item.group,
      groupId: item.groupId,
      sigla: item.sigla,
      name: item.name,
      instruction: `Introduzir ${item.name} (${item.sigla}) após a perfeita dispersão dos produtos anteriores. ${item.information}`,
      information: item.information,
      faqTopic: item.faqTopic,
      formulationId: item.id
    });
  }

  // PASSO Água Final (~50%) — Antes dos adjuvantes finais
  steps.push({
    id: 'step_water_final',
    stepNumber: currentStepNumber++,
    originalNumber: 1,
    type: 'water_final',
    title: 'Água Final (~50% para Completar o Volume)',
    subtitle: 'Ajuste do volume nominal de calda',
    group: 'Água - Bases e Condicionamento',
    groupId: 'agua',
    sigla: 'H2O',
    name: 'Água Limpa (restantes 50%)',
    instruction: `Completar o volume total do depósito com os restantes ~50% de água limpa (${waterFinalVol ? `${waterFinalVol} L` : '~50%'}). Manter agitação contínua para homogeneizar a calda antes dos adjuvantes.`,
    information: 'Completar o volume antes de adicionar espalhantes ou anti-deriva para evitar excesso de espuma.',
    faqTopic: 'mistura-agua',
    waterPercent: 50,
    waterVolumeL: waterFinalVol,
    isMandatory: true,
    isWater: true
  });

  // Adicionar Adjuvantes Finais (MOL, ESP, HUM, ANT, PEN, ADER, AD, OLA)
  for (const item of adjuvants) {
    let adjInstruction = `Adicionar ${item.name} (${item.sigla}) com o depósito quase cheio e agitação moderada. ${item.information}`;
    if (item.id === 'AD') {
      adjInstruction = 'Adicionar o agente anti-deriva no final e com agitação suave. Evitar recirculação violenta prolongada que possa cortar os polímeros.';
    } else if (item.id === 'ANT') {
      adjInstruction = 'Adicionar antiespumante se houver formação excessiva de espuma ou profilacticamente conforme rótulo.';
    }

    steps.push({
      id: `step_${item.id}`,
      stepNumber: currentStepNumber++,
      originalNumber: item.number,
      type: 'adjuvant',
      title: `${item.sigla} — ${item.name}`,
      subtitle: item.group,
      group: item.group,
      groupId: item.groupId,
      sigla: item.sigla,
      name: item.name,
      instruction: adjInstruction,
      information: item.information,
      faqTopic: item.faqTopic,
      formulationId: item.id
    });
  }

  // Alertas técnicos e recomendações baseados na combinação
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const hasSolids = solids.length > 0;
  const hasLiquids = liquids.length > 0;
  const hasConditioners = conditioners.length > 0;
  const hasAntiDrift = selectedFormulations.some(f => f.id === 'AD');
  const hasOil = selectedFormulations.some(f => f.id === 'OLA' || f.id === 'OD');

  if (hasSolids && (hasLiquids || hasOil)) {
    warnings.push('Os produtos sólidos (WSB, SG, WG, WP, SP) devem dispersar-se e hidratar-se completamente na água antes da adição de formulações oleosas (EC, OD, OLA) para evitar o recobrimento oleoso das partículas e a formação de grumos insolúveis.');
  }

  if (hasAntiDrift) {
    recommendations.push('O adjuvante anti-deriva (AD) deve ser adicionado no final com agitação suave. A passagem excessiva por bombas de alta pressão pode degradar os polímeros redutores de deriva.');
  }

  if (selectedFormulations.length >= 4) {
    recommendations.push('Mistura de 4 ou mais produtos: É fortemente recomendado realizar um Teste de Jarra prévio (Jar Test) em recipiente transparente de 1 litro para confirmar a ausência de precipitação e separação de fases.');
  }

  recommendations.push('Usar sempre Equipamento de Proteção Individual (EPI) completo durante a preparação da calda e proceder à tripla lavagem das embalagens vazias vertendo a água no depósito.');

  return {
    steps,
    selectedCount: selectedFormulations.length,
    hasWaterInitial: true,
    hasConditioners,
    hasSolids,
    hasLiquids,
    hasSolutions: solutions.length > 0,
    hasWaterFinal: true,
    hasAdjuvants: adjuvants.length > 0,
    hasAntiDrift,
    hasOil,
    tankCapacityL,
    waterInitialL: waterInitialVol,
    waterFinalL: waterFinalVol,
    warnings,
    recommendations
  };
}
