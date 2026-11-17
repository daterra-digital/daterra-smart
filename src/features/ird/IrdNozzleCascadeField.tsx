import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { NozzleSelector } from '../nozzle-comparison/NozzleSelector.tsx';
import { getGroupedModelsForBrand, getVariantsForModel } from '../nozzle-comparison/nozzleComparison.data.ts';
import type { Nozzle } from '../nozzle-comparison/nozzleComparison.types.ts';
import { INITIAL_NOZZLE_CASCADE, type IrdNozzleCascadeState } from './irdOriginTypes.ts';
import { applyNozzleCascadeStep } from './irdContextCopies.ts';

interface IrdNozzleCascadeFieldProps {
  readonly cascade: IrdNozzleCascadeState;
  readonly catalog: readonly Nozzle[];
  readonly onChangeCascade: React.Dispatch<React.SetStateAction<IrdNozzleCascadeState>>;
}

export const IrdNozzleCascadeField: React.FC<IrdNozzleCascadeFieldProps> = ({
  cascade,
  catalog,
  onChangeCascade
}) => {
  const selectedNozzle = useMemo(
    () => (cascade.catalogNozzleId ? catalog.find((n) => n.id === cascade.catalogNozzleId) : undefined),
    [cascade.catalogNozzleId, catalog]
  );

  const brandModelsCount = useMemo(
    () => (cascade.brand ? getGroupedModelsForBrand(cascade.brand).reduce((acc, g) => acc + g.models.length, 0) : 0),
    [cascade.brand]
  );
  const modelVariantsCount = useMemo(
    () => (cascade.brand && cascade.model ? getVariantsForModel(cascade.brand, cascade.model).length : 0),
    [cascade.brand, cascade.model]
  );

  const hasMissingCatalogMatch =
    (Boolean(cascade.brand) && brandModelsCount === 0) ||
    (Boolean(cascade.brand && cascade.model) && modelVariantsCount === 0);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-700">
          Seleção em cascata do catálogo local ({catalog.length} variantes disponíveis)
        </span>
        {(cascade.brand || cascade.catalogNozzleId) && (
          <button
            type="button"
            onClick={() => onChangeCascade(INITIAL_NOZZLE_CASCADE)}
            className="text-xs font-bold text-slate-700 underline cursor-pointer"
          >
            Limpar seleção (fallback conservador)
          </button>
        )}
      </div>

      <NozzleSelector
        side="A"
        title="Catálogo local"
        selectedBrand={cascade.brand}
        selectedModel={cascade.model}
        selectedSprayAngle={cascade.sprayAngle}
        selectedSwirlPlate={cascade.swirlPlate}
        selectedDisc={cascade.disc}
        selectedNozzleId={cascade.catalogNozzleId}
        selectedNozzle={selectedNozzle}
        onBrandChange={(value) => onChangeCascade((prev) => applyNozzleCascadeStep(prev, { type: 'brand', value }))}
        onModelChange={(value) => onChangeCascade((prev) => applyNozzleCascadeStep(prev, { type: 'model', value }))}
        onSprayAngleChange={(value) => onChangeCascade((prev) => applyNozzleCascadeStep(prev, { type: 'angle', value }))}
        onSwirlPlateChange={(value) => onChangeCascade((prev) => applyNozzleCascadeStep(prev, { type: 'swirl', value }))}
        onDiscChange={(value) => onChangeCascade((prev) => applyNozzleCascadeStep(prev, { type: 'disc', value }))}
        onNozzleChange={(value) => {
          const found = value ? catalog.find((n) => n.id === value) : undefined;
          onChangeCascade((prev) => applyNozzleCascadeStep(prev, { type: 'nozzle', value, sprayAngle: found?.sprayAngleDeg }));
        }}
      />

      {hasMissingCatalogMatch && (
        <div role="status" className="rounded-xl bg-amber-50 border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-950 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>Modelo ou variante sem correspondência no catálogo local; não são inventadas equivalências. Pode introduzir o diâmetro de gota abaixo.</span>
        </div>
      )}

      {cascade.brand && cascade.model && !cascade.catalogNozzleId && !hasMissingCatalogMatch && (
        <p className="text-[11px] font-semibold text-amber-900">
          Selecione ângulo, cor, difusor/disco ou referência acima para aplicar o espectro real deste modelo.
        </p>
      )}

      <p className="text-[11px] text-slate-600 leading-relaxed">
        Nota: a cor ISO 10625 identifica o calibre/débito nominal do bico e não equivale a classe certificada de redução de deriva. Os dados do catálogo local são informativos e não constituem certificação oficial.
      </p>
    </div>
  );
};
