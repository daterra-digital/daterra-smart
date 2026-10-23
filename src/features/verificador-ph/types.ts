export type ResistanceRisk = 'Baixo' | 'Médio' | 'Alto' | 'Não aplicável';

export interface ActiveSubstance {
  id: string;
  name: string;        // Substância Ativa
  type: string;        // Tipo de Pesticida
  pka: string;         // Constante de dissociação
  idealPh: string;     // pH Ideal
  instruction: string; // Instrução Prática
  risk: ResistanceRisk; // Risco de Resistência
  moa: string;         // Código MoA
  nameEn: string;      // SA em Inglês
}
