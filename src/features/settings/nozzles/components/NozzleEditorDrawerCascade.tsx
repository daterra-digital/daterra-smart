// src/features/settings/nozzles/components/NozzleEditorDrawerCascade.tsx
import React, { useMemo } from 'react';
import {
  AVAILABLE_BRANDS,
  getGroupedModelsForBrand,
  getVariantsForModel
} from '../../../nozzle-comparison/nozzleComparison.data.ts';
import { sortNozzlesByNominalFlow } from '../../../nozzle-comparison/nozzleComparison.calculations.ts';
import type { Nozzle } from '../../../nozzle-comparison/nozzleComparison.types.ts';
import { SearchableRoundedDropdown } from '../../../perfis/components/SearchableRoundedDropdown.tsx';
import type { CatalogSelectOption } from '../../../perfis/data/cultureCatalogData.ts';
import { NozzleColorIsoDropdown } from './NozzleColorIsoDropdown.tsx';

export interface NozzleEditorDrawerCascadeProps {
  brand: string;
  model: string;
  sprayAngle: number;
  swirlPlate: string;
  disc: string;
  selectedId: string;
  isColorDropdownOpen: boolean;
  selectedNozzleObj?: Nozzle;
  onBrandChange: (b: string) => void;
  onModelChange: (m: string) => void;
  onAngleChange: (a: number) => void;
  onSwirlChange: (s: string) => void;
  onDiscChange: (d: string) => void;
  onSelectId: (id: string) => void;
  onToggleColorDropdown: () => void;
}

export const NozzleEditorDrawerCascade: React.FC<NozzleEditorDrawerCascadeProps> = (props) => {
  const {
    brand, model, sprayAngle, swirlPlate, disc, selectedId, isColorDropdownOpen,
    selectedNozzleObj, onBrandChange, onModelChange, onAngleChange, onSwirlChange,
    onDiscChange, onSelectId, onToggleColorDropdown
  } = props;

  const brandOptions = useMemo<CatalogSelectOption[]>(
    () => AVAILABLE_BRANDS.map((b) => ({ id: b, label: b })),
    []
  );

  const modelOptions = useMemo<CatalogSelectOption[]>(() => {
    if (!brand) return [];
    const groups = getGroupedModelsForBrand(brand);
    return groups.flatMap((g) =>
      g.models.map((m) => ({ id: m.model, label: `${m.model} (${m.nozzleType})`, code: g.group }))
    );
  }, [brand]);

  const allVariants = useMemo(() => (!brand || !model ? [] : getVariantsForModel(brand, model)), [brand, model]);
  const angleOptions = useMemo<CatalogSelectOption[]>(() => {
    const set = new Set<number>();
    allVariants.forEach((v) => { if (v.sprayAngleDeg) set.add(Number(v.sprayAngleDeg)); });
    return Array.from(set).sort((a, b) => b - a).map((a) => ({ id: String(a), label: `${a}°` }));
  }, [allVariants]);

  const variants = useMemo(() => {
    if (!allVariants.length) return [];
    const list = angleOptions.length > 1 && sprayAngle
      ? allVariants.filter((v) => Number(v.sprayAngleDeg) === Number(sprayAngle))
      : allVariants;
    return [...list].sort(sortNozzlesByNominalFlow);
  }, [allVariants, angleOptions.length, sprayAngle]);

  const deduplicatedVariants = useMemo(() => {
    const seen = new Set<string>();
    const res: Nozzle[] = [];
    for (const v of variants) {
      const key = v.color ? v.color.toLowerCase() : v.id;
      if (!seen.has(key)) { seen.add(key); res.push(v); }
    }
    return res;
  }, [variants]);

  const isModular = useMemo(() => variants.some((v) => Boolean(v.disc || v.swirlPlate)), [variants]);
  const swirlOptions = useMemo<CatalogSelectOption[]>(() => {
    if (!isModular) return [];
    const set = new Set<string>();
    variants.forEach((v) => { if (v.swirlPlate) set.add(v.swirlPlate); });
    return Array.from(set).sort().map((s) => ({ id: s, label: s }));
  }, [isModular, variants]);

  const discOptions = useMemo<CatalogSelectOption[]>(() => {
    if (!isModular) return [];
    const set = new Set<string>();
    variants.forEach((v) => { if (v.disc && (!swirlPlate || v.swirlPlate === swirlPlate)) set.add(v.disc); });
    return Array.from(set).sort().map((d) => ({ id: d, label: d }));
  }, [isModular, variants, swirlPlate]);

  const selectedModelLabel = modelOptions.find((o) => o.id === model)?.label ?? model;

  return (
    <div className="space-y-3.5">
      <SearchableRoundedDropdown
        label="Marca"
        required
        value={brand || 'Selecionar marca...'}
        selectedId={brand}
        options={brandOptions}
        onSelectOption={(opt) => onBrandChange(opt.id)}
      />

      <SearchableRoundedDropdown
        label="Modelo"
        required
        value={selectedModelLabel || 'Selecionar modelo...'}
        selectedId={model}
        options={modelOptions}
        disabled={!brand}
        onSelectOption={(opt) => onModelChange(opt.id)}
      />

      {isModular ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <SearchableRoundedDropdown
            label="Difusor"
            value={swirlPlate}
            selectedId={swirlPlate}
            options={swirlOptions}
            onSelectOption={(opt) => onSwirlChange(opt.id)}
          />
          <SearchableRoundedDropdown
            label="Disco / Pastilha"
            value={disc}
            selectedId={disc}
            options={discOptions}
            onSelectOption={(opt) => onDiscChange(opt.id)}
          />
        </div>
      ) : (
        <NozzleColorIsoDropdown
          selectedId={selectedId}
          selectedNozzleObj={selectedNozzleObj}
          variants={deduplicatedVariants}
          disabled={!model}
          isOpen={isColorDropdownOpen}
          onToggle={onToggleColorDropdown}
          onSelectId={onSelectId}
        />
      )}

      {angleOptions.length > 0 && (
        <SearchableRoundedDropdown
          label="Ângulo do Jato"
          value={sprayAngle ? `${sprayAngle}°` : angleOptions[0].label}
          selectedId={String(sprayAngle || angleOptions[0].id)}
          options={angleOptions}
          disabled={angleOptions.length <= 1}
          onSelectOption={(opt) => onAngleChange(Number(opt.id))}
        />
      )}
    </div>
  );
};
