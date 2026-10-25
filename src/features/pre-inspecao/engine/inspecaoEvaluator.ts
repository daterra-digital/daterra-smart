import type {
  EquipmentTypeId,
  EvaluationStyle,
  InspecaoEvaluationResult,
  ItemStatus,
  PreInspectionCategory
} from '../types/inspecaoTypes';

export function evaluateInspectionMatrix(
  categories: PreInspectionCategory[],
  answers: Record<string, ItemStatus>,
  style: EvaluationStyle = 'iso_16122',
  equipmentId?: EquipmentTypeId
): InspecaoEvaluationResult {
  const allSubIds = categories.flatMap((cat) => cat.subperguntas.map((s) => s.id));
  const totalItems = allSubIds.length || 1;

  let conformeCount = 0;
  let anomaliaCount = 0;
  let pendenteCount = 0;

  for (const id of allSubIds) {
    const ans = answers[id] || 'pendente';
    if (ans === 'conforme') conformeCount++;
    else if (ans === 'anomalia') anomaliaCount++;
    else pendenteCount++;
  }

  const answered = conformeCount + anomaliaCount;
  // Taxa estrita de conformidade face ao total de requisitos ativos do equipamento
  const conformityPct = Math.round((conformeCount / totalItems) * 100);

  if (anomaliaCount > 0) {
    const isDGAV = style === 'dgav_oficial';
    return {
      totalItems,
      conformeCount,
      anomaliaCount,
      pendenteCount,
      conformityPct,
      status: 'reprovado',
      statusLabel: isDGAV ? 'Reprovado • Critérios IPP' : 'Reprovado com Anomalias',
      alertLevel: 'danger',
      recommendation: isDGAV
        ? `Detetada(s) ${anomaliaCount} anomalia(s) grave(s) nos termos do Decreto-Lei n.º 26/2017. O equipamento será chumbado no centro IPP caso as falhas não sejam retificadas.`
        : `Detetada(s) ${anomaliaCount} anomalia(s) crítica(s). Corrija os componentes assinalados antes da submissão à inspeção periódica ISO 16122.`,
      isValid: answered > 0,
      equipmentId,
      evaluationStyle: style
    };
  }

  if (pendenteCount === 0) {
    const isDGAV = style === 'dgav_oficial';
    return {
      totalItems,
      conformeCount,
      anomaliaCount,
      pendenteCount,
      conformityPct: 100,
      status: 'aprovado',
      statusLabel: isDGAV ? 'Conforme • Apto IPP DGAV' : 'Conforme • Aprovado ISO 16122',
      alertLevel: 'success',
      recommendation: isDGAV
        ? 'Pulverizador e depósito em conformidade legal total com o Decreto-Lei n.º 26/2017 e critérios IPP.'
        : 'Pulverizador e depósito em conformidade total com os requisitos técnicos da Norma ISO 16122.',
      isValid: true,
      equipmentId,
      evaluationStyle: style
    };
  }

  return {
    totalItems,
    conformeCount,
    anomaliaCount,
    pendenteCount,
    conformityPct,
    status: 'atencao',
    statusLabel: 'Em Auditoria • Incompleto',
    alertLevel: 'warning',
    recommendation: `Auditoria em curso: ${conformeCount} de ${totalItems} requisitos validados (${conformityPct}% de conformidade global). Conclua a verificação dos restantes itens.`,
    isValid: answered > 0,
    equipmentId,
    evaluationStyle: style
  };
}
