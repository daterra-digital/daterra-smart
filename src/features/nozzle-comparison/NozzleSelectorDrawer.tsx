import React from 'react';
import { X, Check, ChevronDown } from 'lucide-react';
import { AVAILABLE_BRANDS, getGroupedModelsForBrand, getVariantsForModel, NOZZLES_BY_ID } from './nozzleComparison.data';
import { sortNozzlesByNominalFlow, getNozzleColorPresentation, formatPt } from './nozzleComparison.calculations';
import type { Nozzle } from './nozzleComparison.types';

export interface NozzleSelectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  side: 'A' | 'B';
  currentNozzleId: string;
  onSelectNozzle: (nozzleId: string) => void;
}

export const NozzleSelectorDrawer: React.FC<NozzleSelectorDrawerProps> = ({
  isOpen,
  onClose,
  side,
  currentNozzleId,
  onSelectNozzle
}) => {
  const currentNozzle = React.useMemo(() => NOZZLES_BY_ID.get(currentNozzleId), [currentNozzleId]);

  const [brand, setBrand] = React.useState<string>(currentNozzle?.brand || 'Albuz');
  const [model, setModel] = React.useState<string>(currentNozzle?.model || 'ATR');
  const [sprayAngle, setSprayAngle] = React.useState<number>(currentNozzle?.sprayAngleDeg ? Number(currentNozzle.sprayAngleDeg) : 80);
  const [swirlPlate, setSwirlPlate] = React.useState<string>(currentNozzle?.swirlPlate || '');
  const [disc, setDisc] = React.useState<string>(currentNozzle?.disc || '');
  const [selectedId, setSelectedId] = React.useState<string>(currentNozzleId);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = React.useState<boolean>(false);

  // Sincronizar com o bico atual sempre que o modal abre
  React.useEffect(() => {
    if (isOpen && currentNozzle) {
      setBrand(currentNozzle.brand);
      setModel(currentNozzle.model);
      setSprayAngle(currentNozzle.sprayAngleDeg ? Number(currentNozzle.sprayAngleDeg) : 80);
      setSwirlPlate(currentNozzle.swirlPlate || '');
      setDisc(currentNozzle.disc || '');
      setSelectedId(currentNozzle.id);
      setIsColorDropdownOpen(false);
    }
  }, [isOpen, currentNozzle]);

  // Modelos agrupados por categoria técnica para a marca selecionada
  const groupedModels = React.useMemo(() => {
    return getGroupedModelsForBrand(brand);
  }, [brand]);

  // Variantes brutas do modelo
  const allModelVariants = React.useMemo(() => {
    if (!brand || !model) return [];
    return getVariantsForModel(brand, model);
  }, [brand, model]);

  // Ângulos disponíveis para o modelo
  const availableSprayAngles = React.useMemo(() => {
    const set = new Set<number>();
    allModelVariants.forEach(v => {
      if (v.sprayAngleDeg) set.add(Number(v.sprayAngleDeg));
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [allModelVariants]);

  // Sincronizar ângulo se não for válido
  React.useEffect(() => {
    if (availableSprayAngles.length > 0 && !availableSprayAngles.includes(sprayAngle)) {
      setSprayAngle(availableSprayAngles[0]);
    }
  }, [availableSprayAngles, sprayAngle]);

  // Variantes filtradas por ângulo (evita repetição de cores entre 80° e 60°)
  const variants = React.useMemo(() => {
    if (!allModelVariants || allModelVariants.length === 0) return [];
    let list = allModelVariants;
    if (availableSprayAngles.length > 1 && sprayAngle) {
      list = list.filter(v => Number(v.sprayAngleDeg) === Number(sprayAngle));
    }
    return list.sort(sortNozzlesByNominalFlow);
  }, [allModelVariants, availableSprayAngles, sprayAngle]);

  // Desduplicação estrita de cores para garantir que nenhuma cor se repete
  const deduplicatedVariants = React.useMemo(() => {
    const seen = new Set<string>();
    const res: Nozzle[] = [];
    for (const v of variants) {
      const key = v.color ? v.color.toLowerCase() : v.id;
      if (!seen.has(key)) {
        seen.add(key);
        res.push(v);
      }
    }
    return res;
  }, [variants]);

  // Verificar se o modelo é modular (difusor + disco)
  const isModular = React.useMemo(() => {
    return variants.some(v => Boolean(v.disc || v.swirlPlate));
  }, [variants]);

  const availableSwirls = React.useMemo(() => {
    if (!isModular) return [];
    const set = new Set<string>();
    variants.forEach(v => {
      if (v.swirlPlate) set.add(v.swirlPlate);
    });
    return Array.from(set).sort();
  }, [isModular, variants]);

  const availableDiscs = React.useMemo(() => {
    if (!isModular) return [];
    const set = new Set<string>();
    variants.forEach(v => {
      if (v.disc && (!swirlPlate || v.swirlPlate === swirlPlate)) {
        set.add(v.disc);
      }
    });
    return Array.from(set).sort();
  }, [isModular, variants, swirlPlate]);

  // Atualização em cascata suave
  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    const groups = getGroupedModelsForBrand(newBrand);
    const firstModel = groups[0]?.models[0]?.model || '';
    setModel(firstModel);
    const modelVars = getVariantsForModel(newBrand, firstModel).sort(sortNozzlesByNominalFlow);
    if (modelVars.length > 0) {
      setSelectedId(modelVars[0].id);
      setSwirlPlate(modelVars[0].swirlPlate || '');
      setDisc(modelVars[0].disc || '');
      if (modelVars[0].sprayAngleDeg) setSprayAngle(Number(modelVars[0].sprayAngleDeg));
    } else {
      setSelectedId('');
    }
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    const modelVars = getVariantsForModel(brand, newModel).sort(sortNozzlesByNominalFlow);
    if (modelVars.length > 0) {
      setSelectedId(modelVars[0].id);
      setSwirlPlate(modelVars[0].swirlPlate || '');
      setDisc(modelVars[0].disc || '');
      if (modelVars[0].sprayAngleDeg) setSprayAngle(Number(modelVars[0].sprayAngleDeg));
    } else {
      setSelectedId('');
    }
  };

  const handleAngleChange = (angle: number) => {
    setSprayAngle(angle);
    const match = allModelVariants.find(v => Number(v.sprayAngleDeg) === angle && v.color === currentNozzle?.color) ||
      allModelVariants.find(v => Number(v.sprayAngleDeg) === angle);
    if (match) setSelectedId(match.id);
  };

  const handleSwirlChange = (newSwirl: string) => {
    setSwirlPlate(newSwirl);
    const match = variants.find(v => v.swirlPlate === newSwirl && (!disc || v.disc === disc)) || variants.find(v => v.swirlPlate === newSwirl);
    if (match) {
      setSelectedId(match.id);
      if (match.disc) setDisc(match.disc);
    }
  };

  const handleDiscChange = (newDisc: string) => {
    setDisc(newDisc);
    const match = variants.find(v => v.disc === newDisc && (!swirlPlate || v.swirlPlate === swirlPlate)) || variants.find(v => v.disc === newDisc);
    if (match) {
      setSelectedId(match.id);
      if (match.swirlPlate) setSwirlPlate(match.swirlPlate);
    }
  };

  const handleConfirm = () => {
    if (selectedId) {
      onSelectNozzle(selectedId);
    }
    onClose();
  };

  const selectedNozzleObj = NOZZLES_BY_ID.get(selectedId);
  const selectedPres = getNozzleColorPresentation(selectedNozzleObj);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in font-sans">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-daterra-accent">
              Catálogo de Bicos
            </span>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              {side === 'A' ? 'Selecionar Bico A' : 'Selecionar Bico B'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dropdowns em Cascata */}
        <div className="p-4 space-y-3.5 overflow-y-auto">
          {/* 1. Marca */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Marca</label>
            <div className="relative">
              <select
                value={brand}
                onChange={e => handleBrandChange(e.target.value)}
                className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 appearance-none focus:ring-2 focus:ring-daterra-accent/40 focus:border-daterra-accent outline-hidden"
              >
                {AVAILABLE_BRANDS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 2. Modelo Agrupado com separadores de família */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Modelo</label>
            <div className="relative">
              <select
                value={model}
                onChange={e => handleModelChange(e.target.value)}
                className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 appearance-none focus:ring-2 focus:ring-daterra-accent/40 focus:border-daterra-accent outline-hidden"
              >
                <option value="" disabled>-- Modelo --</option>
                {groupedModels.map(g => (
                  <optgroup key={g.group} label={`—— ${g.group} ——`}>
                    {g.models.map(m => (
                      <option key={m.model} value={m.model}>
                        {m.model} ({m.nozzleType})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3. Ângulos de Jato (quando aplicável) */}
          {availableSprayAngles.length > 1 && (
            <div className="animate-fade-in">
              <label className="block text-xs font-bold text-slate-700 mb-1">Ângulo do Jato</label>
              <div className="flex gap-2">
                {availableSprayAngles.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => handleAngleChange(a)}
                    className={`flex-1 h-10 rounded-xl text-xs font-bold transition-all border ${
                      sprayAngle === a
                        ? 'bg-[#114037] text-white border-[#114037] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {a}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Modular (Difusor + Disco) OU Cores com design idêntico à imagem */}
          {isModular ? (
            <div className="grid grid-cols-2 gap-2 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Difusor</label>
                <div className="relative">
                  <select
                    value={swirlPlate}
                    onChange={e => handleSwirlChange(e.target.value)}
                    className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 appearance-none focus:ring-2 focus:ring-daterra-accent/40 outline-hidden"
                  >
                    {availableSwirls.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Disco / Pastilha</label>
                <div className="relative">
                  <select
                    value={disc}
                    onChange={e => handleDiscChange(e.target.value)}
                    className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 appearance-none focus:ring-2 focus:ring-daterra-accent/40 outline-hidden"
                  >
                    {availableDiscs.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative animate-fade-in">
              <label className="block text-xs font-bold text-slate-700 mb-1">Cor do Bico</label>
              
              {/* Gatilho da Dropdown com Cantos Arredondados */}
              <button
                type="button"
                onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                className="w-full h-12 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-daterra-accent/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white shadow-xs shrink-0"
                    style={{ backgroundColor: selectedPres.hex }}
                  />
                  <span className="truncate">{selectedPres.colorName || selectedNozzleObj?.color || 'Selecionar cor'}</span>
                  {selectedNozzleObj && (
                    <span className="text-slate-400 font-normal">•</span>
                  )}
                  {selectedNozzleObj && (
                    <span className="font-mono text-xs font-bold text-[#114037]">
                      {formatPt(selectedNozzleObj.nominalFlowLMin)} L/min
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isColorDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Painel Deslizante de Cores com Cantos Arredondados */}
              {isColorDropdownOpen && (
                <div className="mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-1.5 space-y-1 max-h-56 overflow-y-auto z-20 animate-fade-in">
                  {deduplicatedVariants.map(v => {
                    const vPres = getNozzleColorPresentation(v);
                    const isSelected = v.id === selectedId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedId(v.id);
                          setIsColorDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#114037] text-white font-bold shadow-xs'
                            : 'hover:bg-slate-100 text-slate-800 font-semibold'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border shrink-0 ${
                              vPres.isDark ? 'border-white/60' : 'border-slate-300'
                            }`}
                            style={{ backgroundColor: vPres.hex }}
                          />
                          <span>{vPres.colorName || v.color}</span>
                        </div>
                        <span className={`font-mono text-xs ${isSelected ? 'text-[#8ffa94] font-bold' : 'text-slate-600 font-semibold'}`}>
                          {formatPt(v.nominalFlowLMin)} L/min
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé da Gaveta */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 h-12 rounded-xl bg-daterra-accent text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar Bico</span>
          </button>
        </div>
      </div>
    </div>
  );
};
