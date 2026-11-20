// src/features/perfis/components/CultureGeometryPanel.tsx
// Campos condicionais de geometria 2D (Arvenses/Hortícolas) e complemento 3D (Vinha/Pomar/Olival) (<= 150 LOC).

import React from 'react';
import { Ruler } from 'lucide-react';
import type {
  Culture2DTargetMode,
  Culture3DConductionMode,
  Culture3DGroundCoverMode,
  CultureGeometryMode
} from '../../../db/cultureTypes.ts';
import type { CultureV11FormState } from '../services/cultureFormState.ts';
import type { CultureKeypadField } from '../services/cultureKeypadHelpers.ts';
import {
  CONDUCTION_3D_OPTIONS,
  GEOMETRY_MODE_OPTIONS,
  INTERROW_3D_OPTIONS,
  TARGET_2D_OPTIONS
} from '../data/cultureGeometryOptions.ts';
import { SearchableRoundedDropdown } from './SearchableRoundedDropdown.tsx';
import { NumericKeypadField } from './NumericKeypadField.tsx';

export interface CultureGeometryPanelProps {
  form: CultureV11FormState;
  fieldErrors: Record<string, string>;
  onUpdate: (patch: Partial<CultureV11FormState>) => void;
  onOpenKeypad: (field: CultureKeypadField) => void;
}

export const CultureGeometryPanel: React.FC<CultureGeometryPanelProps> = ({
  form, fieldErrors, onUpdate, onOpenKeypad
}) => {
  const modeOpt = GEOMETRY_MODE_OPTIONS.find((o) => o.id === form.geometryMode);
  const target2dOpt = TARGET_2D_OPTIONS.find((o) => o.id === form.applicationTarget2d);
  const interrowOpt = INTERROW_3D_OPTIONS.find((o) => o.id === form.interrowCover3d);
  const cond3dOpt = CONDUCTION_3D_OPTIONS.find((o) => o.id === form.conductionMode3d);

  const rawHeightCm = Number(form.cropHeight2dCm.trim().replace(',', '.'));
  const hasHeightCm = form.cropHeight2dCm.trim() !== '' && Number.isFinite(rawHeightCm) && rawHeightCm > 0;
  const targetBoomCm = hasHeightCm ? Math.round(rawHeightCm + 50) : null;
  const targetBoomM = targetBoomCm !== null ? (targetBoomCm / 100).toFixed(2).replace('.', ',') : null;

  return (
    <div className="space-y-4">
      <SearchableRoundedDropdown
        label="Modo Geométrico da Cultura"
        required
        value={modeOpt?.label ?? GEOMETRY_MODE_OPTIONS[0].label}
        selectedId={form.geometryMode}
        options={GEOMETRY_MODE_OPTIONS}
        onSelectOption={(opt) => onUpdate({ geometryMode: opt.id as CultureGeometryMode })}
      />

      {form.geometryMode === '2D' ? (
        <div className="space-y-4 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200">
          <NumericKeypadField
            label="Altura média da cultura (cm)"
            value={form.cropHeight2dCm}
            unit="cm"
            placeholder="Ex: 40"
            errorMsg={fieldErrors.cropHeight2dCm}
            onOpenKeypad={() => onOpenKeypad('cropHeight2dCm')}
            onClear={() => onUpdate({ cropHeight2dCm: '' })}
          />
          {targetBoomCm !== null && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-[#114037]">
              <Ruler className="w-4 h-4 text-[#1D734B] shrink-0" />
              <span>
                Altura alvo da barra (H_cultura + 50 cm): <strong className="font-mono-numbers">{targetBoomCm} cm ({targetBoomM} m)</strong>
              </span>
            </div>
          )}
          <NumericKeypadField
            label="Cobertura do solo / IAF (%)"
            value={form.groundCover2dPct}
            unit="%"
            placeholder="0 a 100"
            errorMsg={fieldErrors.groundCover2dPct}
            onOpenKeypad={() => onOpenKeypad('groundCover2dPct')}
            onClear={() => onUpdate({ groundCover2dPct: '' })}
          />
          <SearchableRoundedDropdown
            label="Alvo da aplicação (2D)"
            placeholder="Selecionar alvo..."
            value={target2dOpt?.label ?? ''}
            selectedId={form.applicationTarget2d}
            options={TARGET_2D_OPTIONS}
            onClear={() => onUpdate({ applicationTarget2d: '' })}
            onSelectOption={(opt) => onUpdate({ applicationTarget2d: opt.id as Culture2DTargetMode })}
          />
          <NumericKeypadField
            label="Volume de referência (L/ha)"
            value={form.referenceVolume2dLha}
            unit="L/ha"
            placeholder="Ex: 300"
            errorMsg={fieldErrors.referenceVolume2dLha}
            onOpenKeypad={() => onOpenKeypad('referenceVolume2dLha')}
            onClear={() => onUpdate({ referenceVolume2dLha: '' })}
          />
        </div>
      ) : (
        <div className="space-y-4 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200">
          <SearchableRoundedDropdown
            label="Enrelvamento na entrelinha (3D)"
            placeholder="Selecionar cobertura..."
            value={interrowOpt?.label ?? ''}
            selectedId={form.interrowCover3d}
            options={INTERROW_3D_OPTIONS}
            onClear={() => onUpdate({ interrowCover3d: '' })}
            onSelectOption={(opt) => onUpdate({ interrowCover3d: opt.id as Culture3DGroundCoverMode })}
          />
          <SearchableRoundedDropdown
            label="Sistema de condução geométrica (3D)"
            placeholder="Selecionar condução..."
            value={cond3dOpt?.label ?? ''}
            selectedId={form.conductionMode3d}
            options={CONDUCTION_3D_OPTIONS}
            onClear={() => onUpdate({ conductionMode3d: '' })}
            onSelectOption={(opt) => onUpdate({ conductionMode3d: opt.id as Culture3DConductionMode })}
          />
          <NumericKeypadField
            label="Altura do tronco limpo (m)"
            value={form.cleanTrunkHeightM}
            unit="m"
            placeholder="Ex: 0,8"
            errorMsg={fieldErrors.cleanTrunkHeightM}
            onOpenKeypad={() => onOpenKeypad('cleanTrunkHeightM')}
            onClear={() => onUpdate({ cleanTrunkHeightM: '' })}
          />
        </div>
      )}
    </div>
  );
};
