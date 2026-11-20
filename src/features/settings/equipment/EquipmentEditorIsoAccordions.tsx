// src/features/settings/equipment/EquipmentEditorIsoAccordions.tsx
import React, { useMemo, useState } from 'react';
import { ChevronDown, Gauge, ShieldCheck, Sliders } from 'lucide-react';
import { DateDdMmYyyyPicker } from '../../perfis/components/DateDdMmYyyyPicker.tsx';
import { NumericKeypadField } from '../../perfis/components/NumericKeypadField.tsx';
import { SearchableRoundedDropdown } from '../../perfis/components/SearchableRoundedDropdown.tsx';
import {
  COMMAND_BRANDS, COMMAND_MODELS_BY_BRAND, PUMP_BRANDS, PUMP_MODELS_BY_BRAND,
  PUMP_TYPE_OPTIONS, addEquipmentCustomOption, loadEquipmentCustomOptions
} from './equipmentCatalogData.ts';
import { EquipmentBinaryToggle } from './EquipmentBinaryToggle.tsx';
import type { EquipmentAccordionId, EquipmentKeypadField, EquipmentV12FormState } from './equipmentFormState.ts';

export interface EquipmentEditorIsoAccordionsProps {
  userId: string;
  form: EquipmentV12FormState;
  openState: Record<EquipmentAccordionId, boolean>;
  fieldErrors: Record<string, string>;
  onToggleAccordion: (id: EquipmentAccordionId) => void;
  onUpdate: (patch: Partial<EquipmentV12FormState>) => void;
  onOpenKeypad: (field: EquipmentKeypadField) => void;
  onDateValidityChange: (valid: boolean) => void;
}

export const EquipmentEditorIsoAccordions: React.FC<EquipmentEditorIsoAccordionsProps> = ({
  userId, form, openState, fieldErrors, onToggleAccordion, onUpdate, onOpenKeypad, onDateValidityChange
}) => {
  const [rev, setRev] = useState(0);
  const pumpBrands = useMemo(() => [...PUMP_BRANDS, ...loadEquipmentCustomOptions(userId, 'pump_brand')], [userId, rev]);
  const pumpModels = useMemo(() => {
    if (!form.pumpManufacturer.trim()) return [];
    const base = (PUMP_MODELS_BY_BRAND[form.pumpManufacturer] || []).map((m) => ({ id: m, label: m }));
    return [...base, ...loadEquipmentCustomOptions(userId, 'pump_model', form.pumpManufacturer)];
  }, [userId, form.pumpManufacturer, rev]);
  const pumpTypes = useMemo(() => [...PUMP_TYPE_OPTIONS, ...loadEquipmentCustomOptions(userId, 'pump_type')], [userId, rev]);
  const cmdBrands = useMemo(() => [...COMMAND_BRANDS, ...loadEquipmentCustomOptions(userId, 'command_brand')], [userId, rev]);
  const cmdModels = useMemo(() => {
    if (!form.commandManufacturer.trim()) return [];
    const base = (COMMAND_MODELS_BY_BRAND[form.commandManufacturer] || []).map((m) => ({ id: m, label: m }));
    return [...base, ...loadEquipmentCustomOptions(userId, 'command_model', form.commandManufacturer)];
  }, [userId, form.commandManufacturer, rev]);

  return (
    <div className="space-y-4">
      {/* ACORDEÃO 4: BOMBA E FILTROS */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <button type="button" onClick={() => onToggleAccordion('bomba')}
          className="w-full p-4 bg-slate-100 hover:bg-slate-200/80 transition-colors flex items-center justify-between text-xs font-black text-[#114037] touch-target">
          <span className="flex items-center gap-2"><Gauge className="w-4 h-4 text-[#1D734B]" /><span>4. Bomba e Filtros</span></span>
          <ChevronDown className={`w-4 h-4 transition-transform ${openState.bomba ? 'rotate-180' : ''}`} />
        </button>
        {openState.bomba && (
          <div className="p-4 space-y-4 border-t border-slate-200">
            <SearchableRoundedDropdown label="Fabricante Bomba" placeholder="Selecionar fabricante da bomba..." value={form.pumpManufacturer}
              selectedId={form.pumpManufacturer} options={pumpBrands} allowCustomAdd onClear={() => onUpdate({ pumpManufacturer: '', pumpModel: '' })}
              onSelectOption={(opt) => onUpdate({ pumpManufacturer: opt.label, pumpModel: opt.label === form.pumpManufacturer ? form.pumpModel : '' })}
              onCreateCustomOption={async (lbl) => { const c = addEquipmentCustomOption(userId, 'pump_brand', lbl); setRev((r) => r + 1); return c; }} />
            <SearchableRoundedDropdown label="Modelo Bomba" disabled={!form.pumpManufacturer.trim()} disabledHint="Selecione primeiro o fabricante..."
              placeholder="Selecionar modelo da bomba..." value={form.pumpModel} selectedId={form.pumpModel} options={pumpModels}
              allowCustomAdd={Boolean(form.pumpManufacturer.trim())} onClear={() => onUpdate({ pumpModel: '' })} onSelectOption={(opt) => onUpdate({ pumpModel: opt.label })}
              onCreateCustomOption={async (lbl) => { const c = addEquipmentCustomOption(userId, 'pump_model', lbl, form.pumpManufacturer); setRev((r) => r + 1); return c; }} />
            <SearchableRoundedDropdown label="Tipo de Bomba" placeholder="Selecionar tipo de bomba..." value={form.pumpType} selectedId={form.pumpType}
              options={pumpTypes} allowCustomAdd onClear={() => onUpdate({ pumpType: '' })} onSelectOption={(opt) => onUpdate({ pumpType: opt.label })}
              onCreateCustomOption={async (lbl) => { const c = addEquipmentCustomOption(userId, 'pump_type', lbl); setRev((r) => r + 1); return c; }} />
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-[#114037] block">Filtros</span>
              <div className="grid grid-cols-2 gap-2.5 items-end">
                <EquipmentBinaryToggle label="Crivo de enchimento" value={form.hasFillingSieve} onChange={(v) => onUpdate({ hasFillingSieve: v })} />
                <EquipmentBinaryToggle label="Filtro de aspiração" value={form.hasSuctionFilter} onChange={(v) => onUpdate({ hasSuctionFilter: v })} />
                <EquipmentBinaryToggle label="Filtro de pressão" value={form.hasPressureFilter} onChange={(v) => onUpdate({ hasPressureFilter: v })} />
                <EquipmentBinaryToggle label="Filtros de linha" value={form.hasLineFilters} onChange={(v) => onUpdate({ hasLineFilters: v })} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACORDEÃO 5: COMANDOS E REGULAÇÃO */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <button type="button" onClick={() => onToggleAccordion('comandos')}
          className="w-full p-4 bg-slate-100 hover:bg-slate-200/80 transition-colors flex items-center justify-between text-xs font-black text-[#114037] touch-target">
          <span className="flex items-center gap-2"><Sliders className="w-4 h-4 text-[#1D734B]" /><span>5. Comandos e Regulação</span></span>
          <ChevronDown className={`w-4 h-4 transition-transform ${openState.comandos ? 'rotate-180' : ''}`} />
        </button>
        {openState.comandos && (
          <div className="p-4 space-y-4 border-t border-slate-200">
            <SearchableRoundedDropdown label="Fabricante Comando" placeholder="Selecionar fabricante do comando..." value={form.commandManufacturer}
              selectedId={form.commandManufacturer} options={cmdBrands} allowCustomAdd onClear={() => onUpdate({ commandManufacturer: '', commandModel: '' })}
              onSelectOption={(opt) => onUpdate({ commandManufacturer: opt.label, commandModel: opt.label === form.commandManufacturer ? form.commandModel : '' })}
              onCreateCustomOption={async (lbl) => { const c = addEquipmentCustomOption(userId, 'command_brand', lbl); setRev((r) => r + 1); return c; }} />
            <SearchableRoundedDropdown label="Modelo Comando" disabled={!form.commandManufacturer.trim()} disabledHint="Selecione primeiro o fabricante..."
              placeholder="Selecionar modelo do comando..." value={form.commandModel} selectedId={form.commandModel} options={cmdModels}
              allowCustomAdd={Boolean(form.commandManufacturer.trim())} onClear={() => onUpdate({ commandModel: '' })} onSelectOption={(opt) => onUpdate({ commandModel: opt.label })}
              onCreateCustomOption={async (lbl) => { const c = addEquipmentCustomOption(userId, 'command_model', lbl, form.commandManufacturer); setRev((r) => r + 1); return c; }} />
            <NumericKeypadField label="Nº de Secções" value={form.sectionsCount} placeholder="Ex: 4"
              onOpenKeypad={() => onOpenKeypad('sectionsCount')} onClear={() => onUpdate({ sectionsCount: '' })} />
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-[#114037] block">Modo de Regulação</span>
              <div className="grid grid-cols-2 gap-2.5 items-end">
                <EquipmentBinaryToggle label="Manual" value={form.isManual} onChange={(v) => onUpdate({ isManual: v })} />
                <EquipmentBinaryToggle label="Elétrico" value={form.isElectric} onChange={(v) => onUpdate({ isElectric: v })} />
                <EquipmentBinaryToggle label="ISOBUS" value={form.isIsobus} onChange={(v) => onUpdate({ isIsobus: v })} />
                <EquipmentBinaryToggle label="Automático (DPAE)" value={form.isAutomatic} onChange={(v) => onUpdate({ isAutomatic: v })} />
                <EquipmentBinaryToggle label="Computador de bordo" value={form.hasComputer} onChange={(v) => onUpdate({ hasComputer: v })} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACORDEÃO 6: MANÓMETRO */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <button type="button" onClick={() => onToggleAccordion('manometro')}
          className="w-full p-4 bg-slate-100 hover:bg-slate-200/80 transition-colors flex items-center justify-between text-xs font-black text-[#114037] touch-target">
          <span className="flex items-center gap-2"><Gauge className="w-4 h-4 text-[#1D734B]" /><span>6. Manómetro</span></span>
          <ChevronDown className={`w-4 h-4 transition-transform ${openState.manometro ? 'rotate-180' : ''}`} />
        </button>
        {openState.manometro && (
          <div className="p-4 space-y-4 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-[#114037] mb-1.5">Tipo de Manómetro</label>
              <div className="grid grid-cols-2 gap-2 items-end">
                {(['ANALOG', 'DIGITAL'] as const).map((tp) => {
                  const active = form.manometerType === tp;
                  return (
                    <button key={tp} type="button" aria-pressed={active} onClick={() => onUpdate({ manometerType: tp })}
                      className={`h-[44px] px-3 rounded-xl text-xs font-extrabold transition-colors touch-target ${
                        active ? 'bg-[#114037] text-white shadow-2xs' : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}>
                      {tp === 'ANALOG' ? 'Analógico' : 'Digital'}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              {form.manometerType !== 'DIGITAL' && (
                <NumericKeypadField label="Diâmetro (mm)" value={form.manometerDiameterMm} unit="mm" placeholder="Ex: 63"
                  onOpenKeypad={() => onOpenKeypad('manometerDiameterMm')} onClear={() => onUpdate({ manometerDiameterMm: '' })} />
              )}
              <NumericKeypadField label="Classe de erro (%)" value={form.manometerErrorClassPct} unit="%" placeholder="Ex: 1,6"
                onOpenKeypad={() => onOpenKeypad('manometerErrorClassPct')} onClear={() => onUpdate({ manometerErrorClassPct: '' })} />
              <NumericKeypadField label="Divisões escala (bar)" value={form.manometerDivisionsBar} unit="bar" placeholder="Ex: 0,2"
                onOpenKeypad={() => onOpenKeypad('manometerDivisionsBar')} onClear={() => onUpdate({ manometerDivisionsBar: '' })} />
              <NumericKeypadField label="Máx. escala (bar)" value={form.manometerMaxScaleBar} unit="bar" placeholder="Ex: 25"
                onOpenKeypad={() => onOpenKeypad('manometerMaxScaleBar')} onClear={() => onUpdate({ manometerMaxScaleBar: '' })} />
              <NumericKeypadField label="Pressão máxima (bar)" value={form.manometerMaxPressureBar} unit="bar" placeholder="Ex: 20"
                onOpenKeypad={() => onOpenKeypad('manometerMaxPressureBar')} onClear={() => onUpdate({ manometerMaxPressureBar: '' })} />
            </div>
          </div>
        )}
      </div>

      {/* ACORDEÃO 7: INSPEÇÃO DE PULVERIZADORES */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <button type="button" onClick={() => onToggleAccordion('inspecao')}
          className="w-full p-4 bg-slate-100 hover:bg-slate-200/80 transition-colors flex items-center justify-between text-xs font-black text-[#114037] touch-target">
          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#1D734B]" /><span>7. Inspeção de Pulverizadores</span></span>
          <ChevronDown className={`w-4 h-4 transition-transform ${openState.inspecao ? 'rotate-180' : ''}`} />
        </button>
        {openState.inspecao && (
          <div className="p-4 space-y-3 border-t border-slate-200">
            {[
              { key: 'pressureGaugeOk', label: 'Manómetro validado e legível', checked: form.pressureGaugeOk },
              { key: 'antiDripValveOk', label: 'Válvula antigota estanque (paragem <= 5 s)', checked: form.antiDripValveOk },
              { key: 'nozzleWearWithin10Pct', label: 'Desgaste de bicos dentro da tolerância (<= 10%)', checked: form.nozzleWearWithin10Pct },
              ...(form.type === 'MANUAL_LANCE'
                ? [{ key: 'hoseAndTriggerOk', label: 'Mangueiras sem fissuras/fugas e gatilho estanque', checked: form.hoseAndTriggerOk }]
                : [])
            ].map((chk) => (
              <label key={chk.key} className="min-h-[44px] flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs font-bold text-slate-900">
                <input type="checkbox" checked={chk.checked} onChange={(e) => onUpdate({ [chk.key]: e.target.checked })} className="w-4 h-4 accent-[#114037] rounded" />
                <span>{chk.label}</span>
              </label>
            ))}
            <DateDdMmYyyyPicker label="Data última inspeção IPP / aquisição" isoValue={form.lastInspectionDate}
              onChangeIso={(iso) => onUpdate({ lastInspectionDate: iso })} onValidityChange={onDateValidityChange} />
            <p className="text-[11px] text-slate-500">
              Em Portugal (DL 86/2010 · DL 78/2020): validade de <strong>{form.type === 'MANUAL_LANCE' ? '5 anos (pistolas / lanças manuais)' : '3 anos'}</strong> a contar da última inspeção ou data de aquisição.
            </p>
            {fieldErrors.lastInspectionDate && <p role="alert" className="text-xs font-semibold text-rose-700">{fieldErrors.lastInspectionDate}</p>}
            <div>
              <label className="block text-xs font-semibold text-[#114037] mb-1.5">Notas e Observações Técnicas</label>
              <textarea rows={2} value={form.notes} onChange={(e) => onUpdate({ notes: e.target.value })}
                placeholder="Observações sobre manutenção, filtros ou inspeção periódica..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 outline-none focus:border-[#114037]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
