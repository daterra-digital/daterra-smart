// src/features/settings/equipment/EquipmentEditorMainAccordions.tsx
import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Gauge, Wind, Wrench } from 'lucide-react';
import { THREE_D_EQUIPMENT_TYPES, type EquipmentType } from '../../../schemas/equipment.schema.ts';
import type { ProfileNozzle } from '../../../db/types.ts';
import { SearchableRoundedDropdown } from '../../perfis/components/SearchableRoundedDropdown.tsx';
import { NumericKeypadField } from '../../perfis/components/NumericKeypadField.tsx';
import {
  AIR_CURTAIN_ANGLE_OPTIONS, EQUIPMENT_TYPE_OPTIONS, SPRAYER_BRANDS, SPRAYER_MODELS_BY_BRAND,
  addEquipmentCustomOption, getEquipmentTypeLabel, loadEquipmentCustomOptions
} from './equipmentCatalogData.ts';
import { EquipmentBinaryToggle } from './EquipmentBinaryToggle.tsx';
import { EquipmentUavAerodynamicsFields } from './EquipmentUavAerodynamicsFields.tsx';
import type { EquipmentAccordionId, EquipmentKeypadField, EquipmentV12FormState } from './equipmentFormState.ts';
import { isNozzleOptionSelected, parseNozzleSetOption } from '../nozzles/services/nozzleEquipmentIntegration.ts';

export interface EquipmentEditorMainAccordionsProps {
  userId: string; form: EquipmentV12FormState; nozzles: ProfileNozzle[];
  openState: Record<EquipmentAccordionId, boolean>; fieldErrors: Record<string, string>;
  onToggleAccordion: (id: EquipmentAccordionId) => void; onUpdate: (patch: Partial<EquipmentV12FormState>) => void;
  onToggleNozzle: (desc: string) => void; onOpenKeypad: (field: EquipmentKeypadField) => void;
}

export const EquipmentEditorMainAccordions: React.FC<EquipmentEditorMainAccordionsProps> = ({
  userId, form, nozzles, openState, fieldErrors, onToggleAccordion, onUpdate, onToggleNozzle, onOpenKeypad
}) => {
  const [rev, setRev] = useState(0);
  const is2D = form.type === '2D_HORIZONTAL';
  const isManual = form.type === 'MANUAL_LANCE';
  const isUav = form.type === 'UAV_DRONE';
  const is3D = THREE_D_EQUIPMENT_TYPES.has(form.type);
  const brandOptions = useMemo(() => [...SPRAYER_BRANDS, ...loadEquipmentCustomOptions(userId, 'sprayer_brand')], [userId, rev]);
  const modelOptions = useMemo(() => {
    if (!form.manufacturer.trim()) return [];
    const base = (SPRAYER_MODELS_BY_BRAND[form.manufacturer] || []).map((m) => ({ id: m, label: m }));
    return [...base, ...loadEquipmentCustomOptions(userId, 'sprayer_model', form.manufacturer)];
  }, [userId, form.manufacturer, rev]);

  const handleTypeSelect = (nextType: EquipmentType) => {
    const off = nextType === '2D_HORIZONTAL' || nextType === 'UAV_DRONE' || nextType === 'MANUAL_LANCE';
    onUpdate({ type: nextType, airAssisted: !off, ...(off ? { defaultAirflowM3h: '' } : {}), airCurtainAngle: '' });
  };

  return (
    <div className="space-y-4">
      {/* ACORDEÃO 1: IDENTIFICAÇÃO PRINCIPAL */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <button type="button" onClick={() => onToggleAccordion('ident')}
          className="w-full p-4 bg-slate-100 hover:bg-slate-200/80 transition-colors flex items-center justify-between text-xs font-black text-[#114037] touch-target">
          <span className="flex items-center gap-2"><Wrench className="w-4 h-4 text-[#1D734B]" /><span>1. Identificação Principal</span></span>
          <ChevronDown className={`w-4 h-4 transition-transform ${openState.ident ? 'rotate-180' : ''}`} />
        </button>

        {openState.ident && (
          <div className="p-4 space-y-4 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-[#114037] mb-1.5 whitespace-nowrap">Nome / Referência <span className="text-red-600">*</span></label>
              <input type="text" placeholder="Ex: Atomizador Axial Tomix 1000L" value={form.name} onChange={(e) => onUpdate({ name: e.target.value })}
                className="w-full h-[44px] px-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-[#114037]" />
              {fieldErrors.name && <p role="alert" className="mt-1 text-xs font-semibold text-rose-700">{fieldErrors.name}</p>}
            </div>
            <SearchableRoundedDropdown label="Tipologia do Equipamento" required value={getEquipmentTypeLabel(form.type)}
              selectedId={form.type} options={EQUIPMENT_TYPE_OPTIONS} onSelectOption={(opt) => handleTypeSelect(opt.id as EquipmentType)} />
            <SearchableRoundedDropdown label="Fabricante" placeholder="Selecionar ou adicionar fabricante..." value={form.manufacturer}
              selectedId={form.manufacturer} options={brandOptions} allowCustomAdd customAddHint="Ex: Agromehanika, Corbins..."
              onClear={() => onUpdate({ manufacturer: '', model: '' })}
              onSelectOption={(opt) => onUpdate({ manufacturer: opt.label, model: opt.label === form.manufacturer ? form.model : '' })}
              onCreateCustomOption={async (lbl) => { const c = addEquipmentCustomOption(userId, 'sprayer_brand', lbl); setRev((r) => r + 1); return c; }} />
            <SearchableRoundedDropdown label="Modelo" disabled={!form.manufacturer.trim()} disabledHint="Selecione primeiro o fabricante..."
              placeholder="Selecionar ou adicionar modelo..." emptyCatalogHint="Pode adicionar o modelo da sua máquina."
              value={form.model} selectedId={form.model} options={modelOptions} allowCustomAdd={Boolean(form.manufacturer.trim())}
              customAddHint="Ex: Tornado 1000, Zaturn..." onClear={() => onUpdate({ model: '' })} onSelectOption={(opt) => onUpdate({ model: opt.label })}
              onCreateCustomOption={async (lbl) => { const c = addEquipmentCustomOption(userId, 'sprayer_model', lbl, form.manufacturer); setRev((r) => r + 1); return c; }} />
            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <div className="flex items-center justify-between mb-1.5 min-h-[18px]">
                  <label className="block text-xs font-semibold text-[#114037] whitespace-nowrap truncate">Nº de Série</label>
                </div>
                <input type="text" placeholder="Ex: SN-2024" value={form.serialNumber} onChange={(e) => onUpdate({ serialNumber: e.target.value })}
                  className="w-full h-[44px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-[#114037]" />
              </div>
              <NumericKeypadField label="Ano de Construção" value={form.manufactureYear} unit="Ano" placeholder="Ex: 2024"
                errorMsg={fieldErrors.manufactureYear} onOpenKeypad={() => onOpenKeypad('manufactureYear')} onClear={() => onUpdate({ manufactureYear: '' })} />
            </div>
            <NumericKeypadField label="Capacidade do Depósito Principal (L)" required value={form.tankCapacityL} unit="L" placeholder="Ex: 1000"
              errorMsg={fieldErrors.tankCapacityL} onOpenKeypad={() => onOpenKeypad('tankCapacityL')} />
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-[#114037] block">Depósitos Auxiliares</span>
              <div className="grid grid-cols-2 gap-2.5 items-end">
                <EquipmentBinaryToggle label="Depósito lava-mãos" value={form.handWashTank} onChange={(v) => onUpdate({ handWashTank: v })} />
                <EquipmentBinaryToggle label="Depósito lava-circuitos" value={form.circuitFlushTank} onChange={(v) => onUpdate({ circuitFlushTank: v })} />
                <EquipmentBinaryToggle label="Incorporador produto" value={form.chemicalInductor} onChange={(v) => onUpdate({ chemicalInductor: v })} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACORDEÃO 2: CONJUNTOS DE BICOS ASSOCIADOS */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <button type="button" onClick={() => onToggleAccordion('nozzles')}
          className="w-full p-4 bg-slate-100 hover:bg-slate-200/80 transition-colors flex items-center justify-between text-xs font-black text-[#114037] touch-target">
          <span className="flex items-center gap-2"><Gauge className="w-4 h-4 text-[#1D734B]" /><span>2. Conjuntos de Bicos Associados ({form.associatedNozzleIds.length})</span></span>
          <ChevronDown className={`w-4 h-4 transition-transform ${openState.nozzles ? 'rotate-180' : ''}`} />
        </button>
        {openState.nozzles && (
          <div className="p-4 space-y-3 border-t border-slate-200">
            <p className="text-[11px] text-slate-600">Selecione cumulativamente os conjuntos de bicos instalados nesta máquina.</p>
            {nozzles.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {nozzles.map((nz) => {
                  const opt = parseNozzleSetOption(nz);
                  const active = isNozzleOptionSelected(form.associatedNozzleIds, opt);
                  const linkedElsewhere = Boolean(opt.equipmentId && opt.equipmentId !== form.editingId && opt.equipmentName);
                  return (
                    <button type="button" key={opt.key} onClick={() => onToggleNozzle(opt.key)}
                      className={`w-full min-h-[48px] p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-colors touch-target ${active ? 'border-[#3CA64C] bg-emerald-50/70 text-[#114037]' : 'border-slate-200 bg-slate-50/70 text-slate-900 hover:bg-slate-100'}`}>
                      <div className="min-w-0">
                        <span className="text-xs font-extrabold block break-words">{opt.label}</span>
                        <span className="text-[11px] text-slate-600 font-mono-numbers block mt-0.5">{opt.meta}</span>
                        {linkedElsewhere && <span className="text-[10px] font-bold text-amber-800 block mt-0.5">Associado a: {opt.equipmentName}</span>}
                      </div>
                      {active && <Check className="w-4 h-4 text-[#3CA64C] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">Ainda não existem conjuntos de bicos criados no separador <strong>Bicos</strong>.</p>
            )}
          </div>
        )}
      </div>

      {/* ACORDEÃO 3: DISTRIBUIÇÃO E PARÂMETROS OPERACIONAIS */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <button type="button" onClick={() => onToggleAccordion('distrib')}
          className="w-full p-4 bg-slate-100 hover:bg-slate-200/80 transition-colors flex items-center justify-between text-xs font-black text-[#114037] touch-target">
          <span className="flex items-center gap-2"><Wind className="w-4 h-4 text-[#1D734B]" /><span>3. Distribuição e Parâmetros Operacionais</span></span>
          <ChevronDown className={`w-4 h-4 transition-transform ${openState.distrib ? 'rotate-180' : ''}`} />
        </button>
        {openState.distrib && (
          <div className="p-4 space-y-4 border-t border-slate-200">
            {isManual ? (
              <div className="grid grid-cols-2 gap-3 items-end">
                <NumericKeypadField label="Nº pistolas / lanças" required value={form.lanceCount} unit="un." placeholder="Ex: 2" errorMsg={fieldErrors.lanceCount} onOpenKeypad={() => onOpenKeypad('lanceCount')} />
                <NumericKeypadField label="Mangueira (m)" value={form.hoseLengthM} unit="m" placeholder="Ex: 50" onOpenKeypad={() => onOpenKeypad('hoseLengthM')} onClear={() => onUpdate({ hoseLengthM: '' })} />
                <NumericKeypadField label="Pressão habitual (bar)" required value={form.defaultPressureBar} unit="bar" placeholder="Ex: 15,0" errorMsg={fieldErrors.defaultPressureBar} onOpenKeypad={() => onOpenKeypad('defaultPressureBar')} />
                <EquipmentBinaryToggle label="Enrolador mangueira" value={form.hasHoseReel} onChange={(v) => onUpdate({ hasHoseReel: v })} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 items-end">
                <NumericKeypadField label="Nº Bicos" required value={form.workingWidthM} unit="bicos" placeholder="Ex: 12" errorMsg={fieldErrors.workingWidthM} onOpenKeypad={() => onOpenKeypad('workingWidthM')} />
                <NumericKeypadField label="Espaçamento (cm)" required value={form.nozzleSpacingCm} unit="cm" placeholder="Ex: 35" errorMsg={fieldErrors.nozzleSpacingCm} onOpenKeypad={() => onOpenKeypad('nozzleSpacingCm')} />
                {!isUav && <NumericKeypadField label="Pressão habitual (bar)" required value={form.defaultPressureBar} unit="bar" placeholder="Ex: 8,0" errorMsg={fieldErrors.defaultPressureBar} onOpenKeypad={() => onOpenKeypad('defaultPressureBar')} />}
                <NumericKeypadField label="Velocidade (km/h)" required value={form.defaultSpeedKmh} unit="km/h" placeholder="Ex: 6,0" errorMsg={fieldErrors.defaultSpeedKmh} onOpenKeypad={() => onOpenKeypad('defaultSpeedKmh')} />
              </div>
            )}
            {isUav && <EquipmentUavAerodynamicsFields form={form} fieldErrors={fieldErrors} onUpdate={onUpdate} onOpenKeypad={onOpenKeypad} />}

            {is2D && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <EquipmentBinaryToggle label="Assistido por ar (Manga de ar)" value={Boolean(form.airAssisted)}
                  onChange={(v) => onUpdate({ airAssisted: Boolean(v), ...(v ? {} : { defaultAirflowM3h: '', airCurtainAngle: '' }) })} />
                {form.airAssisted && (
                  <>
                    <NumericKeypadField label="Caudal de ar do ventilador (m³/h)" value={form.defaultAirflowM3h} unit="m³/h" placeholder="Ex: 12000"
                      errorMsg={fieldErrors.defaultAirflowM3h} onOpenKeypad={() => onOpenKeypad('defaultAirflowM3h')} onClear={() => onUpdate({ defaultAirflowM3h: '' })} />
                    <SearchableRoundedDropdown label="Inclinação da cortina de ar (°)" placeholder="Selecionar inclinação da cortina..."
                      value={form.airCurtainAngle} selectedId={form.airCurtainAngle} options={AIR_CURTAIN_ANGLE_OPTIONS}
                      onClear={() => onUpdate({ airCurtainAngle: '' })} onSelectOption={(opt) => onUpdate({ airCurtainAngle: opt.label })} />
                  </>
                )}
              </div>
            )}

            {is3D && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <EquipmentBinaryToggle label="Assistência de ar (Ventilador)" value={form.airAssisted ?? true}
                  onChange={(v) => onUpdate({ airAssisted: v ?? false, ...(v ? {} : { defaultAirflowM3h: '' }) })} />
                {(form.airAssisted ?? true) ? (
                  <NumericKeypadField label="Caudal de ar do ventilador (m³/h)" value={form.defaultAirflowM3h} unit="m³/h" placeholder="Ex: 1200"
                    helperText="Referência ótima: Q_ar,ótimo = 0,10 × TRV × v (m³/h)."
                    errorMsg={fieldErrors.defaultAirflowM3h} onOpenKeypad={() => onOpenKeypad('defaultAirflowM3h')} onClear={() => onUpdate({ defaultAirflowM3h: '' })} />
                ) : form.type === '3D_AXIAL' ? (
                  <p className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-2.5">Modo barras verticais sem ventilação ativo (sem alerta de subventilação).</p>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
