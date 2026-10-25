import React from 'react';
import type { Nozzle, CalculatedNozzleFlow, ComparisonSummaryResult } from '../../../nozzle-comparison/nozzleComparison.types';
import { DaterraKeypadModal } from '../../../../components/DaterraKeypad';
import { NozzleSelectorDrawer } from '../../../nozzle-comparison/NozzleSelectorDrawer';
import { NozzleComparisonMatrixModal } from '../../../nozzle-comparison/NozzleComparisonMatrixModal';
import { NozzleMicrolearningModal } from '../../../nozzle-comparison/NozzleMicrolearningModal';
import { CalculatorHistoryDrawer } from '../../history/CalculatorHistoryDrawer';
import {
  softDeleteCalculationInDb,
  clearCalculatorHistoryInDb,
  updateCalculationMetadataInDb
} from '../../core/historyService';

export interface DebitoModalsContainerProps {
  keypadTarget: 'unitario_p' | 'comp_p' | 'ref_p' | 'target_q' | null;
  onCloseKeypad: () => void;
  onConfirmKeypad: (val: number) => void;
  unitarioPressure: number;
  compPressure: number;
  refPressure?: number;
  targetFlow: number;
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
  drawerSide: 'A' | 'B' | 'REF';
  nozzleIdA: string;
  nozzleIdB: string;
  refNozzleId?: string;
  onSelectNozzle: (id: string) => void;
  isMatrixOpen: boolean;
  onCloseMatrix: () => void;
  nozzleA?: Nozzle;
  nozzleB?: Nozzle;
  flowA?: CalculatedNozzleFlow;
  flowB?: CalculatedNozzleFlow;
  comparison?: ComparisonSummaryResult;
  isGuideOpen: boolean;
  onCloseGuide: () => void;
  isHistoryOpen: boolean;
  onCloseHistory: () => void;
  historyRecords: any[];
}

export const DebitoModalsContainer: React.FC<DebitoModalsContainerProps> = ({
  keypadTarget,
  onCloseKeypad,
  onConfirmKeypad,
  unitarioPressure,
  compPressure,
  refPressure = 8.0,
  targetFlow,
  isDrawerOpen,
  onCloseDrawer,
  drawerSide,
  nozzleIdA,
  nozzleIdB,
  refNozzleId,
  onSelectNozzle,
  isMatrixOpen,
  onCloseMatrix,
  nozzleA,
  nozzleB,
  flowA,
  flowB,
  comparison,
  isGuideOpen,
  onCloseGuide,
  isHistoryOpen,
  onCloseHistory,
  historyRecords
}) => {
  return (
    <>
      {keypadTarget && (
        <DaterraKeypadModal
          isOpen={true}
          onClose={onCloseKeypad}
          label={
            keypadTarget === 'target_q'
              ? 'Débito Alvo Pretendido'
              : (keypadTarget === 'ref_p' ? 'Pressão Habitual (Referência)' : 'Pressão de Trabalho')
          }
          initialValue={String(
            keypadTarget === 'target_q'
              ? targetFlow
              : (keypadTarget === 'unitario_p'
                  ? unitarioPressure
                  : (keypadTarget === 'ref_p' ? refPressure : compPressure))
          )}
          initialUnit={keypadTarget === 'target_q' ? 'L/min' : 'bar'}
          availableUnits={[keypadTarget === 'target_q' ? 'L/min' : 'bar']}
          commonValues={keypadTarget === 'target_q' ? [0.4, 0.6, 0.8, 1.0, 1.2, 1.6] : [2.0, 3.0, 4.0, 5.0, 8.0, 10.0, 15.0]}
          validationRules={{ min: keypadTarget === 'target_q' ? 0.1 : 0.5, max: keypadTarget === 'target_q' ? 10.0 : 30.0, allowDecimal: true, allowNegative: false }}
          onConfirm={onConfirmKeypad}
        />
      )}

      <NozzleSelectorDrawer
        isOpen={isDrawerOpen}
        onClose={onCloseDrawer}
        side={drawerSide}
        currentNozzleId={drawerSide === 'A' ? nozzleIdA : (drawerSide === 'REF' ? (refNozzleId || nozzleIdA) : nozzleIdB)}
        onSelectNozzle={onSelectNozzle}
      />

      <NozzleComparisonMatrixModal
        isOpen={isMatrixOpen}
        onClose={onCloseMatrix}
        nozzleA={nozzleA}
        nozzleB={nozzleB}
        flowA={flowA}
        flowB={flowB}
        comparison={comparison}
        workingPressureBar={compPressure}
      />

      <NozzleMicrolearningModal isOpen={isGuideOpen} onClose={onCloseGuide} />

      <CalculatorHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={onCloseHistory}
        calculatorId="calc_tabelas_debito"
        calculatorTitle="Tabelas de Débito (Comparador)"
        records={historyRecords}
        onDeleteRecord={async (rec) => softDeleteCalculationInDb(rec.id)}
        onClearHistory={async () => { await clearCalculatorHistoryInDb('calc_tabelas_debito', 'local-user'); }}
        onUpdateMetadata={async (id, meta) => updateCalculationMetadataInDb(id, meta)}
      />
    </>
  );
};
