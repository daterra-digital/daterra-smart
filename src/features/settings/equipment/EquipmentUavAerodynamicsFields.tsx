// src/features/settings/equipment/EquipmentUavAerodynamicsFields.tsx
import React from 'react';
import { AlertTriangle, Compass } from 'lucide-react';
import type { UavAtomizationSystem, UavNozzlePlacement, UavWeightClass } from '../../../schemas/equipmentUav.schema.ts';
import { SearchableRoundedDropdown } from '../../perfis/components/SearchableRoundedDropdown.tsx';
import { NumericKeypadField } from '../../perfis/components/NumericKeypadField.tsx';
import { EquipmentBinaryToggle } from './EquipmentBinaryToggle.tsx';
import type { EquipmentKeypadField, EquipmentV12FormState } from './equipmentFormState.ts';
import {
  UAV_ATOMIZATION_OPTIONS,
  UAV_PLACEMENT_OPTIONS,
  UAV_ROTOR_OPTIONS,
  UAV_WEIGHT_CLASS_OPTIONS
} from './equipmentUavHelpers.ts';

export interface EquipmentUavAerodynamicsFieldsProps {
  form: EquipmentV12FormState;
  fieldErrors: Record<string, string>;
  onUpdate: (patch: Partial<EquipmentV12FormState>) => void;
  onOpenKeypad: (field: EquipmentKeypadField) => void;
}

const parseNum = (raw: string) => {
  const n = Number(raw.trim().replace(',', '.'));
  return raw.trim() && Number.isFinite(n) ? n : null;
};

export const EquipmentUavAerodynamicsFields: React.FC<EquipmentUavAerodynamicsFieldsProps> = ({
  form, fieldErrors, onUpdate, onOpenKeypad
}) => {
  const flightH = parseNum(form.uavFlightHeightM);
  const cdaRpm = parseNum(form.uavCdaDiscRpm);
  const isHighFlight = flightH !== null && flightH > 3.0;
  const isHighRpm = form.uavAtomizationSystem === 'CENTRIFUGAL_CDA' && cdaRpm !== null && cdaRpm > 12000;
  const isWingtip = form.uavNozzlePlacement === 'WINGTIP';

  const wOpt = UAV_WEIGHT_CLASS_OPTIONS.find((o) => o.id === form.uavWeightClass);
  const rOpt = UAV_ROTOR_OPTIONS.find((o) => o.id === form.uavRotorCount);
  const aOpt = UAV_ATOMIZATION_OPTIONS.find((o) => o.id === form.uavAtomizationSystem);
  const pOpt = UAV_PLACEMENT_OPTIONS.find((o) => o.id === form.uavNozzlePlacement);

  return (
    <div className="space-y-4 pt-3 border-t border-slate-100">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#114037]">
        <Compass className="w-4 h-4 text-[#1D734B]" />
        <span>Aerodinâmica e Atomização UAV / Drone</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
        <NumericKeypadField
          label="Altura de voo acima da copa (m)"
          value={form.uavFlightHeightM}
          unit="m"
          placeholder="Ex: 2,0"
          helperText="Janela ideal: 1,5–2,5 m."
          errorMsg={fieldErrors.uavFlightHeightM}
          onOpenKeypad={() => onOpenKeypad('uavFlightHeightM')}
        />
        <NumericKeypadField
          label="Largura efetiva / Swath (m)"
          value={form.uavSwathWidthM}
          unit="m"
          placeholder="Ex: 5,0"
          errorMsg={fieldErrors.uavSwathWidthM}
          onOpenKeypad={() => onOpenKeypad('uavSwathWidthM')}
          onClear={() => onUpdate({ uavSwathWidthM: '' })}
        />
      </div>

      {isHighFlight && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2 text-[11px] font-semibold text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>Altura de voo &gt; 3,0 m aumenta significativamente a exposição ao vento lateral e perda de downwash (janela recomendada: 1,5–2,5 m).</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
        <SearchableRoundedDropdown
          label="Classe de capacidade / peso"
          value={wOpt?.label ?? UAV_WEIGHT_CLASS_OPTIONS[1].label}
          selectedId={form.uavWeightClass}
          options={UAV_WEIGHT_CLASS_OPTIONS}
          onSelectOption={(opt) => onUpdate({ uavWeightClass: opt.id as UavWeightClass })}
        />
        <SearchableRoundedDropdown
          label="Número de rotores"
          value={rOpt?.label ?? UAV_ROTOR_OPTIONS[0].label}
          selectedId={form.uavRotorCount}
          options={UAV_ROTOR_OPTIONS}
          onSelectOption={(opt) => onUpdate({ uavRotorCount: opt.id })}
        />
      </div>

      <EquipmentBinaryToggle
        label="Radar altimétrico / Seguimento de terreno (Terrain Following)"
        value={form.uavTerrainRadar}
        onChange={(v) => onUpdate({ uavTerrainRadar: Boolean(v) })}
      />

      <SearchableRoundedDropdown
        label="Sistema de atomização"
        value={aOpt?.label ?? UAV_ATOMIZATION_OPTIONS[0].label}
        selectedId={form.uavAtomizationSystem}
        options={UAV_ATOMIZATION_OPTIONS}
        onSelectOption={(opt) => onUpdate({ uavAtomizationSystem: opt.id as UavAtomizationSystem })}
      />

      {form.uavAtomizationSystem === 'CENTRIFUGAL_CDA' ? (
        <NumericKeypadField
          label="Rotação dos Discos CDA (RPM)"
          value={form.uavCdaDiscRpm}
          unit="RPM"
          placeholder="Ex: 10000"
          helperText="Acima de 12.000 RPM produz gotas < 100 µm."
          errorMsg={fieldErrors.uavCdaDiscRpm}
          onOpenKeypad={() => onOpenKeypad('uavCdaDiscRpm')}
          onClear={() => onUpdate({ uavCdaDiscRpm: '' })}
        />
      ) : (
        <NumericKeypadField
          label="Pressão de Trabalho Hidráulica (bar)"
          required
          value={form.defaultPressureBar}
          unit="bar"
          placeholder="Ex: 3,0"
          errorMsg={fieldErrors.defaultPressureBar}
          onOpenKeypad={() => onOpenKeypad('defaultPressureBar')}
        />
      )}

      {isHighRpm && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-[11px] font-semibold text-rose-900">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>Rotação &gt; 12.000 RPM gera espetro muito fino (&lt; 100 µm) com elevado risco de deriva atmosférica e evaporação.</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 items-end">
        <NumericKeypadField
          label="Dv0,5 (µm)"
          value={form.uavDropletDv50Um}
          unit="µm"
          placeholder="Ex: 250"
          onOpenKeypad={() => onOpenKeypad('uavDropletDv50Um')}
          onClear={() => onUpdate({ uavDropletDv50Um: '' })}
        />
        <NumericKeypadField
          label="Dv0,1 (µm)"
          value={form.uavDropletDv10Um}
          unit="µm"
          placeholder="Ex: 120"
          onOpenKeypad={() => onOpenKeypad('uavDropletDv10Um')}
          onClear={() => onUpdate({ uavDropletDv10Um: '' })}
        />
      </div>

      <SearchableRoundedDropdown
        label="Posicionamento dos bicos"
        value={pOpt?.label ?? UAV_PLACEMENT_OPTIONS[0].label}
        selectedId={form.uavNozzlePlacement}
        options={UAV_PLACEMENT_OPTIONS}
        onSelectOption={(opt) => onUpdate({ uavNozzlePlacement: opt.id as UavNozzlePlacement })}
      />

      {isWingtip && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2 text-[11px] font-semibold text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>Bicos em extremidades exteriores (Wingtip) ficam sujeitos a vórtices ascendentes de ponta de hélice, elevando a deriva lateral.</span>
        </div>
      )}
    </div>
  );
};
