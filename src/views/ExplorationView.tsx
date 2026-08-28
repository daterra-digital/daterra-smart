import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Sprout, Wrench, Gauge, ShieldCheck, Plus, Trash2, 
  Info, CheckCircle2, Layers, Sliders, ChevronDown, Check
} from 'lucide-react';
import { db } from '../db/db';
import { MicrolearningModal } from '../components/MicrolearningModal';
import { useLanguage } from '../context/LanguageContext';

type ProfileTab = 'cultura' | 'equipamento' | 'bicos' | 'calibracao';

// Opções reativas para Bicos (Modelo por Fabricante)
const NOZZLE_MODELS_BY_MANUFACTURER: Record<string, string[]> = {
  Albuz: ['ATR 80', 'TV I', 'AVI', 'CVI', 'ME3'],
  Lechler: ['IDK', 'IDKT', 'TR', 'LU', 'ST', 'FT'],
  Hardi: ['ISO F-110', 'INJET', 'MINIDRIFT', 'DUO'],
  ASJ: ['CVI', 'WR', 'HCA', 'Tee-Cone'],
  Teejet: ['XR TeeJet', 'AIXR', 'TX ConeJet', 'DG TeeJet', 'Turbo TeeJet']
};

const NOZZLE_COLORS = [
  { name: 'Amarelo (02)', code: '#EAB308' },
  { name: 'Lilás (025)', code: '#C084FC' },
  { name: 'Azul (03)', code: '#3B82F6' },
  { name: 'Vermelho (04)', code: '#EF4444' },
  { name: 'Castanho (05)', code: '#854D0E' },
  { name: 'Cinzento (06)', code: '#6B7280' },
  { name: 'Verde (08)', code: '#22C55E' },
  { name: 'Laranja (01)', code: '#F97316' }
];

export const ExplorationView: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ProfileTab>('cultura');
  const [feedbackMsg, setFeedbackMsg] = useState('');


  // Microlearning Modal State
  const [microModalOpen, setMicroModalOpen] = useState(false);
  const [activeMicroKey, setActiveMicroKey] = useState('perfil_cultura');

  const openMicro = (key: string) => {
    setActiveMicroKey(key);
    setMicroModalOpen(true);
  };

  // Carregar dados IndexedDB via Dexie
  const cultures = useLiveQuery(() => db.profiles_cultures.toArray(), []);
  const equipments = useLiveQuery(() => db.profiles_equipment.toArray(), []);
  const nozzles = useLiveQuery(() => db.profiles_nozzles.toArray(), []);
  const calibrations = useLiveQuery(() => db.profiles_calibrations.toArray(), []);

  // ---------------------------------------------------------------------------
  // ESTADOS FORMULÁRIO 1: CULTURA
  // ---------------------------------------------------------------------------
  const [cultName, setCultName] = useState('');
  const [cultType, setCultType] = useState('Vinha');
  const [cultVariety, setCultVariety] = useState('');
  const [cultArea, setCultArea] = useState('');
  const [cultSystem, setCultSystem] = useState('Bordadura / Cordão');
  const [cultSpacing, setCultSpacing] = useState('2,2 x 1,0');
  const [cultRowDistance, setCultRowDistance] = useState('2,2');
  const [cultPhenological, setCultPhenological] = useState('Floração');
  const [cultCanopyWidth, setCultCanopyWidth] = useState('0,8');
  const [cultCanopyHeight, setCultCanopyHeight] = useState('1,4');
  const [cultLai, setCultLai] = useState('1,8');

  // ---------------------------------------------------------------------------
  // ESTADOS FORMULÁRIO 2: EQUIPAMENTOS (ESTRUTURA DE ACORDEÕES)
  // ---------------------------------------------------------------------------
  // Acordeões Toggle States
  const [accIdent, setAccIdent] = useState(true);
  const [accBomba, setAccBomba] = useState(false);
  const [accComandos, setAccComandos] = useState(false);
  const [accManometro, setAccManometro] = useState(false);
  const [accDistrib, setAccDistrib] = useState(false);
  const [accOutros, setAccOutros] = useState(false);

  // 1. Identificação Principal
  const [eqName, setEqName] = useState('');
  const [eqManufacturer, setEqManufacturer] = useState('Tomix');
  const [eqModelSelect, setEqModelSelect] = useState('Tornado 1000');
  const [eqModelCustom, setEqModelCustom] = useState('');
  const [eqSerial, setEqSerial] = useState('');
  const [eqYear, setEqYear] = useState('2024');
  const [eqTankCapacity, setEqTankCapacity] = useState('1000');
  const [eqHandWashingTank, setEqHandWashingTank] = useState(true);
  const [eqCircuitRinse, setEqCircuitRinse] = useState(true);
  const [eqProductIncorporator, setEqProductIncorporator] = useState(true);
  const [eqSelectedNozzles, setEqSelectedNozzles] = useState<string[]>([]);

  // 2. Bomba e Filtros
  const [eqPumpManufacturer, setEqPumpManufacturer] = useState('Comet');
  const [eqPumpModelSelect, setEqPumpModelSelect] = useState('APS 121');
  const [eqPumpModelCustom, setEqPumpModelCustom] = useState('');
  const [eqPumpType, setEqPumpType] = useState('Membrana');
  const [eqFillingSieve, setEqFillingSieve] = useState(true);
  const [eqSuctionFilter, setEqSuctionFilter] = useState(true);
  const [eqPressureFilter, setEqPressureFilter] = useState(true);
  const [eqLineFilters, setEqLineFilters] = useState(true);

  // 3. Comandos e Regulação
  const [eqCommandManufacturer, setEqCommandManufacturer] = useState('Arag');
  const [eqCommandModelSelect, setEqCommandModelSelect] = useState('Bravo 180');
  const [eqCommandModelCustom, setEqCommandModelCustom] = useState('');
  const [eqIsManual, setEqIsManual] = useState(false);
  const [eqIsElectric, setEqIsElectric] = useState(true);
  const [eqIsIsobus, setEqIsIsobus] = useState(false);
  const [eqIsAutomatic, setEqIsAutomatic] = useState(true);
  const [eqHasComputer, setEqHasComputer] = useState(true);
  const [eqSectionsCount, setEqSectionsCount] = useState('4');

  // 4. Manómetro
  const [eqManometerDiameter, setEqManometerDiameter] = useState('63');
  const [eqManometerDivisions, setEqManometerDivisions] = useState('0,2');
  const [eqManometerMaxValue, setEqManometerMaxValue] = useState('25');
  const [eqManometerErrorClass, setEqManometerErrorClass] = useState('1,6');
  const [eqMaxPressure, setEqMaxPressure] = useState('20');

  // 5. Equipamento de Distribuição (Com Condicionais)
  const [eqDistributionType, setEqDistributionType] = useState('Ventilador');
  // Se Barra Horizontal
  const [eqBoomWidth, setEqBoomWidth] = useState('12,0');
  const [eqAirSleeve, setEqAirSleeve] = useState(false);
  // Se Barra Vertical
  const [eqBoomHeight, setEqBoomHeight] = useState('2,5');
  // Se Ventilador
  const [eqFanTransmission, setEqFanTransmission] = useState('Cardan');
  const [eqFanDiameter, setEqFanDiameter] = useState('800');
  const [eqFanType, setEqFanType] = useState('Axial');
  const [eqSuctionAirDeflector, setEqSuctionAirDeflector] = useState(true);
  const [eqCompressionAirDeflector, setEqCompressionAirDeflector] = useState(true);
  const [eqHeightCompressionAirDeflector, setEqHeightCompressionAirDeflector] = useState(false);
  // Se Pistola/Lança
  const [eqLancesCount, setEqLancesCount] = useState('2');
  const [eqHoseReels, setEqHoseReels] = useState(true);
  const [eqHoseLength, setEqHoseLength] = useState('50');
  // Se Pneumático
  const [eqPneumaticNozzlesCount, setEqPneumaticNozzlesCount] = useState('8');
  const [eqNozzlesPerPneumaticHead, setEqNozzlesPerPneumaticHead] = useState('2');
  // Se Canhão
  const [eqCannonNozzleGroupsCount, setEqCannonNozzleGroupsCount] = useState('4');
  // Se Painéis
  const [eqPanelsCount, setEqPanelsCount] = useState('4');
  const [eqSimultaneousRowsCount, setEqSimultaneousRowsCount] = useState('2');

  // 6. Outros e Observações
  const [eqNotes, setEqNotes] = useState('');
  const [eqInspectionDate, setEqInspectionDate] = useState('2024-05-15');
  const [eqCalibrationDate, setEqCalibrationDate] = useState('2025-03-10');

  // Toggle seleção de bicos no dropdown cumulativo
  const toggleNozzleSelection = (nozzleDesc: string) => {
    if (eqSelectedNozzles.includes(nozzleDesc)) {
      setEqSelectedNozzles(eqSelectedNozzles.filter(n => n !== nozzleDesc));
    } else {
      setEqSelectedNozzles([...eqSelectedNozzles, nozzleDesc]);
    }
  };

  // ---------------------------------------------------------------------------
  // ESTADOS FORMULÁRIO 3: BICOS
  // ---------------------------------------------------------------------------
  const [nozzleEqId, setNozzleEqId] = useState<string>('');
  const [nozzleManufacturer, setNozzleManufacturer] = useState('Albuz');
  const [nozzleModel, setNozzleModel] = useState('ATR 80');
  const [nozzleColor, setNozzleColor] = useState('Amarelo (02)');
  const [nozzleIsoClass] = useState('ISO 10625');
  const [nozzleType, setNozzleType] = useState('Cone Oco');
  const [nozzleSprayAngle] = useState('80°');
  const [nozzleWorkingPressure, setNozzleWorkingPressure] = useState('10,0');
  const [nozzleNominalFlow, setNozzleNominalFlow] = useState('1,03');

  const handleManufacturerChange = (mfg: string) => {
    setNozzleManufacturer(mfg);
    const availableModels = NOZZLE_MODELS_BY_MANUFACTURER[mfg] || ['Standard'];
    setNozzleModel(availableModels[0]);
  };

  // ---------------------------------------------------------------------------
  // ESTADOS FORMULÁRIO 4: CALIBRAÇÃO
  // ---------------------------------------------------------------------------
  const [calibEqId, setCalibEqId] = useState<string>('');
  const [calibNozzleId, setCalibNozzleId] = useState<string>('');
  const [calibSpeed, setCalibSpeed] = useState('6,5');
  const [calibPressure, setCalibPressure] = useState('10,0');
  const [calibWidth, setCalibWidth] = useState('2,2');
  const [calibNozzlesCount] = useState('12');
  const [calibDropletSize] = useState('180');
  const [calibTotalFlow, setCalibTotalFlow] = useState('12,36');

  // Gravar no IndexedDB
  const handleSaveCulture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cultName) return;
    const parseNum = (val: string) => parseFloat(val.replace(',', '.')) || 0;

    await db.profiles_cultures.add({
      name: cultName,
      crop_type: cultType,
      variety: cultVariety,
      area_ha: parseNum(cultArea) || 1.0,
      training_system: cultSystem,
      spacing: cultSpacing,
      row_distance_m: parseNum(cultRowDistance),
      phenological_stage: cultPhenological,
      canopy_width_m: parseNum(cultCanopyWidth),
      canopy_height_m: parseNum(cultCanopyHeight),
      lai: parseNum(cultLai),
      location: 'Exploração DATERRA'
    });

    setCultName('');
    setCultVariety('');
    setFeedbackMsg('Perfil de Cultura guardado com sucesso no IndexedDB!');
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqName) return;
    const parseNum = (val: string) => parseFloat(val.replace(',', '.')) || 0;

    const finalModel = eqModelSelect === 'outro' ? eqModelCustom : eqModelSelect;
    const finalPumpModel = eqPumpModelSelect === 'outro' ? eqPumpModelCustom : eqPumpModelSelect;
    const finalCommandModel = eqCommandModelSelect === 'outro' ? eqCommandModelCustom : eqCommandModelSelect;

    await db.profiles_equipment.add({
      name: eqName,
      manufacturer: eqManufacturer,
      model: finalModel,
      serial_number: eqSerial,
      construction_year: eqYear,
      tank_capacity_l: parseNum(eqTankCapacity) || 1000,
      has_hand_washing_tank: eqHandWashingTank,
      has_circuit_rinse: eqCircuitRinse,
      has_product_incorporator: eqProductIncorporator,
      selected_nozzles: eqSelectedNozzles,

      // Bomba e Filtros
      pump_manufacturer: eqPumpManufacturer,
      pump_model: finalPumpModel,
      pump_type: eqPumpType,
      has_filling_sieve: eqFillingSieve,
      has_suction_filter: eqSuctionFilter,
      has_pressure_filter: eqPressureFilter,
      has_line_filters: eqLineFilters,

      // Comandos e Regulação
      command_manufacturer: eqCommandManufacturer,
      command_model: finalCommandModel,
      is_manual: eqIsManual,
      is_electric: eqIsElectric,
      is_isobus: eqIsIsobus,
      is_automatic: eqIsAutomatic,
      has_computer: eqHasComputer,
      sections_count: parseInt(eqSectionsCount) || 4,

      // Manómetro
      manometer_diameter_mm: parseNum(eqManometerDiameter),
      manometer_scale_divisions: parseNum(eqManometerDivisions),
      manometer_max_value: parseNum(eqManometerMaxValue),
      manometer_error_class: parseNum(eqManometerErrorClass),
      max_pressure_bar: parseNum(eqMaxPressure),

      // Equipamento de Distribuição (Condicional)
      distribution_type: eqDistributionType,
      boom_width_m: parseNum(eqBoomWidth),
      has_air_sleeve: eqAirSleeve,
      boom_height_m: parseNum(eqBoomHeight),
      fan_transmission: eqFanTransmission,
      fan_diameter_mm: parseNum(eqFanDiameter),
      fan_type: eqFanType,
      has_suction_air_deflector: eqSuctionAirDeflector,
      has_compression_air_deflector: eqCompressionAirDeflector,
      has_height_compression_air_deflector: eqHeightCompressionAirDeflector,
      lances_count: parseInt(eqLancesCount) || 2,
      has_hose_reels: eqHoseReels,
      hose_length_m: parseNum(eqHoseLength),
      pneumatic_nozzles_count: parseInt(eqPneumaticNozzlesCount) || 8,
      nozzles_per_pneumatic_head: parseInt(eqNozzlesPerPneumaticHead) || 2,
      cannon_nozzle_groups_count: parseInt(eqCannonNozzleGroupsCount) || 4,
      panels_count: parseInt(eqPanelsCount) || 4,
      simultaneous_rows_count: parseInt(eqSimultaneousRowsCount) || 2,

      // Outros e Observações
      notes: eqNotes,
      inspection_date: eqInspectionDate,
      calibration_date: eqCalibrationDate,
      is_approved: true
    });

    setEqName('');
    setFeedbackMsg('Perfil de Equipamento guardado com sucesso no IndexedDB!');
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleSaveNozzle = async (e: React.FormEvent) => {
    e.preventDefault();
    const parseNum = (val: string) => parseFloat(val.replace(',', '.')) || 0;
    const selectedEq = equipments?.find(eq => eq.id === parseInt(nozzleEqId));

    await db.profiles_nozzles.add({
      equipment_id: selectedEq?.id,
      equipment_name: selectedEq?.name || 'Geral',
      manufacturer: nozzleManufacturer,
      model: nozzleModel,
      color: nozzleColor,
      iso_classification: nozzleIsoClass,
      nozzle_type: nozzleType,
      spray_angle: nozzleSprayAngle,
      working_pressure_bar: parseNum(nozzleWorkingPressure),
      nominal_flow_lmin: parseNum(nozzleNominalFlow) || 1.2
    });

    setFeedbackMsg('Perfil de Bicos guardado com sucesso no IndexedDB!');
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleSaveCalibration = async (e: React.FormEvent) => {
    e.preventDefault();
    const parseNum = (val: string) => parseFloat(val.replace(',', '.')) || 0;
    const v = parseNum(calibSpeed) || 6.5;
    const w = parseNum(calibWidth) || 2.2;
    const qt = parseNum(calibTotalFlow) || 12.36;

    const calculatedVolume = (v > 0 && w > 0) ? (600 * qt) / (v * w) : 0;

    const selectedEq = equipments?.find(eq => eq.id === parseInt(calibEqId));
    const selectedNz = nozzles?.find(nz => nz.id === parseInt(calibNozzleId));

    await db.profiles_calibrations.add({
      equipment_id: selectedEq?.id,
      equipment_name: selectedEq?.name || 'Atomizador Principal',
      nozzle_id: selectedNz?.id,
      nozzle_name: selectedNz ? `${selectedNz.manufacturer} ${selectedNz.model}` : 'Bicos Padrão',
      working_speed_kmh: v,
      working_pressure_bar: parseNum(calibPressure),
      working_width_m: w,
      active_nozzles_count: parseInt(calibNozzlesCount) || 12,
      droplet_size_um: parseNum(calibDropletSize),
      total_flow_lmin: qt,
      calculated_spray_volume_lha: Number(calculatedVolume.toFixed(2)),
      air_velocity_ms: 28,
      air_volume_m3h: 35000
    });

    setFeedbackMsg('Perfil de Calibração guardado com sucesso no IndexedDB!');
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* CABEÇALHO DO ECRÃ DE EXPLORAÇÃO (Verde Principal #114037) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#1D734B] block mb-1">
            {t('nav.exploration')}
          </span>
          <h1 className="text-fluid-title font-black text-[#114037]">
            {t('exploration.title')}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('exploration.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-extrabold font-mono-numbers">
          <Layers className="w-4 h-4 text-[#3CA64C]" />
          <span>{t('exploration.normativeTag')}</span>
        </div>
      </div>

      {/* Alerta de Feedback de Operação */}
      {feedbackMsg && (
        <div className="p-4 bg-[#3CA64C] text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* REVELAÇÃO PROGRESSIVA: TABS DE PERFIS (Mobile-First 48px) */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('cultura')}
          className={`px-5 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2.5 shrink-0 touch-target ${
            activeTab === 'cultura'
              ? 'bg-[#114037] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sprout className="w-4.5 h-4.5 text-[#3CA64C]" />
          <span>{t('exploration.tabs.culture')}</span>
        </button>

        <button
          onClick={() => setActiveTab('equipamento')}
          className={`px-5 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2.5 shrink-0 touch-target ${
            activeTab === 'equipamento'
              ? 'bg-[#114037] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wrench className="w-4.5 h-4.5 text-[#3CA64C]" />
          <span>{t('exploration.tabs.equipment')}</span>
        </button>

        <button
          onClick={() => setActiveTab('bicos')}
          className={`px-5 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2.5 shrink-0 touch-target ${
            activeTab === 'bicos'
              ? 'bg-[#114037] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Gauge className="w-4.5 h-4.5 text-[#3CA64C]" />
          <span>{t('exploration.tabs.nozzles')}</span>
        </button>

        <button
          onClick={() => setActiveTab('calibracao')}
          className={`px-5 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2.5 shrink-0 touch-target ${
            activeTab === 'calibracao'
              ? 'bg-[#114037] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4.5 h-4.5 text-[#3CA64C]" />
          <span>{t('exploration.tabs.calibration')}</span>
        </button>
      </div>

      {/* Dica Permanente de Formatação Decimal com Vírgula */}
      <div className="bg-amber-50/90 border border-amber-200/90 p-4 rounded-2xl flex items-center gap-3 text-xs text-amber-900 font-semibold shadow-xs">
        <Info className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          {t('exploration.formattingNote')}
        </span>
      </div>

      {/* ========================================================================= */}
      {/* SEPARADOR 1: PERFIL - CULTURA                                            */}
      {/* ========================================================================= */}
      {activeTab === 'cultura' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#1D734B] flex items-center justify-center font-bold">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-fluid-subtitle font-black text-[#114037]">Perfil — Cultura (Cartão Cultura)</h2>
                  <span className="text-xs text-slate-500 font-semibold block">Mapeamento da Parcela, Dados Técnicos e Geometria TRV</span>
                </div>
              </div>

              {/* Botão de Microlearning 'i' Ajuda */}
              <button
                type="button"
                onClick={() => openMicro('perfil_cultura')}
                className="px-3.5 min-h-[44px] bg-[#3CA64C]/10 hover:bg-[#3CA64C]/20 text-[#114037] font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 touch-target"
                title="Microlearning: Diretrizes de Cultura"
              >
                <Info className="w-4 h-4 text-[#3CA64C]" />
                <span>Ajuda</span>
              </button>
            </div>

            <form onSubmit={handleSaveCulture} className="space-y-8">
              {/* CARTÃO INTERNO 1: Identificação e Área */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B]">
                  1. Identificação e Área
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Cultura</label>
                    <select
                      value={cultType}
                      onChange={(e) => setCultType(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    >
                      <option value="Macieira">{t('exploration.options.crops.apple')}</option>
                      <option value="Pereira">{t('exploration.options.crops.pear')}</option>
                      <option value="Vinha">{t('exploration.options.crops.vineyard')}</option>
                      <option value="Olival">{t('exploration.options.crops.olive')}</option>
                      <option value="Citrinos">{t('exploration.options.crops.citrus')}</option>
                      <option value="Outra">{t('exploration.options.crops.other')}</option>
                    </select>

                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nome da Parcela</label>
                    <input
                      type="text"
                      placeholder="ex: Parcela da Encosta"
                      value={cultName}
                      onChange={(e) => setCultName(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Variedade</label>
                    <input
                      type="text"
                      placeholder="ex: Touriga Nacional / Gala"
                      value={cultVariety}
                      onChange={(e) => setCultVariety(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Área (ha)</label>
                    <input
                      type="text"
                      placeholder="ex: 4,5"
                      value={cultArea}
                      onChange={(e) => setCultArea(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                  </div>
                </div>
              </div>

              {/* CARTÃO INTERNO 2: Dados Técnicos */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B]">
                  2. Dados Técnicos da Cultura
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Sistema de Condução</label>
                    <input
                      type="text"
                      placeholder="ex: Cordão Monolateral"
                      value={cultSystem}
                      onChange={(e) => setCultSystem(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Compasso</label>
                    <input
                      type="text"
                      placeholder="ex: 2,2 x 1,0 m"
                      value={cultSpacing}
                      onChange={(e) => setCultSpacing(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Distância Entrelinha (m)</label>
                    <input
                      type="text"
                      placeholder="ex: 2,2"
                      value={cultRowDistance}
                      onChange={(e) => setCultRowDistance(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Estado Fenológico</label>
                    <select
                      value={cultPhenological}
                      onChange={(e) => setCultPhenological(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    >
                      <option value="Repouso vegetativo">Repouso vegetativo</option>
                      <option value="Abrolhamento">Abrolhamento</option>
                      <option value="Floração">Floração</option>
                      <option value="Vingamento">Vingamento</option>
                      <option value="Pinta / Maturação">Pinta / Maturação</option>
                      <option value="Pós-colheita">Pós-colheita</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CARTÃO INTERNO 3: Geometria da Copa */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B]">
                  3. Geometria da Copa (TRV)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Largura da copa (m)</label>
                    <input
                      type="text"
                      placeholder="ex: 0,8"
                      value={cultCanopyWidth}
                      onChange={(e) => setCultCanopyWidth(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Altura da copa (m)</label>
                    <input
                      type="text"
                      placeholder="ex: 1,4"
                      value={cultCanopyHeight}
                      onChange={(e) => setCultCanopyHeight(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">LAI (Índice Área Foliar)</label>
                    <input
                      type="text"
                      placeholder="ex: 1,8"
                      value={cultLai}
                      onChange={(e) => setCultLai(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                  </div>
                </div>
              </div>

              {/* Botão de Ação Principal (Verde Destaque #3CA64C) */}
              <button
                type="submit"
                className="w-full min-h-[48px] bg-[#3CA64C] hover:bg-[#3AAA35] text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 touch-target"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Guardar Perfil de Cultura no IndexedDB</span>
              </button>
            </form>

            {/* Listagem de Culturas Gravadas */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">Perfis de Cultura Registados</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cultures?.map(c => (
                  <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">{c.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono-numbers block mt-0.5">
                        {c.crop_type} ({c.variety || 'Standard'}) • {c.area_ha} ha • {c.phenological_stage}
                      </span>
                    </div>
                    <button
                      onClick={() => c.id && db.profiles_cultures.delete(c.id)}
                      className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                      title="Eliminar cultura"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEPARADOR 2: PERFIL - EQUIPAMENTOS (ESTRUTURA DE ACORDEÕES ESPECÍFICA)    */}
      {/* ========================================================================= */}
      {activeTab === 'equipamento' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-fluid-subtitle font-black text-[#114037]">Perfil — Equipamentos (ISO 16122)</h2>
                  <span className="text-xs text-slate-500 font-semibold block">Configuração por Acordeões Específicos da Exploração</span>
                </div>
              </div>

              {/* Botão de Microlearning 'i' Ajuda */}
              <button
                type="button"
                onClick={() => openMicro('perfil_equipamento')}
                className="px-3.5 min-h-[44px] bg-[#3CA64C]/10 hover:bg-[#3CA64C]/20 text-[#114037] font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 touch-target"
                title="Microlearning: Diretrizes de Equipamento"
              >
                <Info className="w-4 h-4 text-[#3CA64C]" />
                <span>Ajuda</span>
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="space-y-6">

              {/* ------------------------------------------------------------------- */}
              {/* ACORDEÃO 1: Identificação Principal                                 */}
              {/* ------------------------------------------------------------------- */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setAccIdent(!accIdent)}
                  className="w-full p-4 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-between text-xs font-black text-[#114037] touch-target"
                >
                  <span className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#1D734B]" />
                    <span>Identificação Principal</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${accIdent ? 'rotate-180' : ''}`} />
                </button>

                {accIdent && (
                  <div className="p-5 bg-white space-y-4 animate-fade-in border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Nome (Referência)</label>
                        <input
                          type="text"
                          placeholder="ex: Atomizador Tomix 1000L"
                          value={eqName}
                          onChange={(e) => setEqName(e.target.value)}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Fabricante</label>
                        <select
                          value={eqManufacturer}
                          onChange={(e) => setEqManufacturer(e.target.value)}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        >
                          <option value="Tomix">Tomix</option>
                          <option value="Rocha">Rocha</option>
                          <option value="Jacto">Jacto</option>
                          <option value="Hardi">Hardi</option>
                          <option value="Berthoud">Berthoud</option>
                          <option value="Caffini">Caffini</option>
                          <option value="Kuhn">Kuhn</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Modelo (Dropdown com registo)</label>
                        <select
                          value={eqModelSelect}
                          onChange={(e) => setEqModelSelect(e.target.value)}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        >
                          <option value="Tornado 1000">Tornado 1000</option>
                          <option value="Tornado 2000">Tornado 2000</option>
                          <option value="Hydra 600">Hydra 600</option>
                          <option value="Commander 3000">Commander 3000</option>
                          <option value="outro">+ Adicionar Novo Modelo...</option>
                        </select>
                        {eqModelSelect === 'outro' && (
                          <input
                            type="text"
                            placeholder="Escreva o novo modelo..."
                            value={eqModelCustom}
                            onChange={(e) => setEqModelCustom(e.target.value)}
                            className="w-full mt-2 min-h-[48px] px-4 py-2.5 bg-emerald-50 border border-[#3CA64C] rounded-xl text-xs font-semibold outline-none"
                          />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Nº Série</label>
                        <input
                          type="text"
                          placeholder="ex: SN-2024-991"
                          value={eqSerial}
                          onChange={(e) => setEqSerial(e.target.value)}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Ano Construção (Ano YYYY)</label>
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="ex: 2024"
                          value={eqYear}
                          onChange={(e) => setEqYear(e.target.value)}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Capacidade depósito (L)</label>
                        <input
                          type="text"
                          placeholder="ex: 1000"
                          value={eqTankCapacity}
                          onChange={(e) => setEqTankCapacity(e.target.value)}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                        />
                      </div>
                    </div>

                    {/* Checkboxes de Depósito */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={eqHandWashingTank} onChange={(e) => setEqHandWashingTank(e.target.checked)} className="w-4 h-4 rounded accent-[#3CA64C]" />
                        <span>Depósito lava-mãos</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={eqCircuitRinse} onChange={(e) => setEqCircuitRinse(e.target.checked)} className="w-4 h-4 rounded accent-[#3CA64C]" />
                        <span>Depósito lava-circuitos</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={eqProductIncorporator} onChange={(e) => setEqProductIncorporator(e.target.checked)} className="w-4 h-4 rounded accent-[#3CA64C]" />
                        <span>Depósito incorporador de produto</span>
                      </label>
                    </div>

                    {/* Bicos: Dropdown cumulativa de lista de bicos do perfil Bicos */}
                    <div className="pt-3 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Bicos Associados (Seleção cumulativa do perfil Bicos)
                      </label>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                        {nozzles && nozzles.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {nozzles.map(nz => {
                              const nzDesc = `${nz.manufacturer} ${nz.model} (${nz.color})`;
                              const isSelected = eqSelectedNozzles.includes(nzDesc);
                              return (
                                <button
                                  type="button"
                                  key={nz.id}
                                  onClick={() => toggleNozzleSelection(nzDesc)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 touch-target ${
                                    isSelected
                                      ? 'bg-[#114037] text-white shadow-xs'
                                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3.5 h-3.5 text-[#3CA64C]" />}
                                  <span>{nzDesc}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic block">
                            Nenhum bico configurado ainda. Adicione bicos no separador "Bicos".
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------------- */}
              {/* ACORDEÃO 2: Bomba e Filtros                                         */}
              {/* ------------------------------------------------------------------- */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setAccBomba(!accBomba)}
                  className="w-full p-4 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-between text-xs font-black text-[#114037] touch-target"
                >
                  <span className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-[#1D734B]" />
                    <span>Bomba e Filtros</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${accBomba ? 'rotate-180' : ''}`} />
                </button>

                {accBomba && (
                  <div className="p-5 bg-white space-y-4 animate-fade-in border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Fabricante Bomba</label>
                        <select
                          value={eqPumpManufacturer}
                          onChange={(e) => setEqPumpManufacturer(e.target.value)}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        >
                          <option value="Comet">Comet</option>
                          <option value="Annovi Reverberi">Annovi Reverberi</option>
                          <option value="Imovilli">Imovilli</option>
                          <option value="Udor">Udor</option>
                          <option value="Bertolini">Bertolini</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Modelo Bomba (Dropdown com registo)</label>
                        <select
                          value={eqPumpModelSelect}
                          onChange={(e) => setEqPumpModelSelect(e.target.value)}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        >
                          <option value="APS 121">APS 121</option>
                          <option value="AR 1064">AR 1064</option>
                          <option value="Kappa 75">Kappa 75</option>
                          <option value="outro">+ Adicionar Novo Modelo...</option>
                        </select>
                        {eqPumpModelSelect === 'outro' && (
                          <input
                            type="text"
                            placeholder="Escreva o novo modelo de bomba..."
                            value={eqPumpModelCustom}
                            onChange={(e) => setEqPumpModelCustom(e.target.value)}
                            className="w-full mt-2 min-h-[48px] px-4 py-2.5 bg-emerald-50 border border-[#3CA64C] rounded-xl text-xs font-semibold outline-none"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipo Bomba</label>
                        <select
                          value={eqPumpType}
                          onChange={(e) => setEqPumpType(e.target.value)}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        >
                          <option value="Membrana">Membrana</option>
                          <option value="Pistão">Pistão</option>
                          <option value="Centrífuga">Centrífuga</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={eqFillingSieve} onChange={(e) => setEqFillingSieve(e.target.checked)} className="w-4 h-4 rounded accent-[#3CA64C]" />
                        <span>Crivo enchimento</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={eqSuctionFilter} onChange={(e) => setEqSuctionFilter(e.target.checked)} className="w-4 h-4 rounded accent-[#3CA64C]" />
                        <span>Filtro aspiração</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={eqPressureFilter} onChange={(e) => setEqPressureFilter(e.target.checked)} className="w-4 h-4 rounded accent-[#3CA64C]" />
                        <span>Filtro pressão</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={eqLineFilters} onChange={(e) => setEqLineFilters(e.target.checked)} className="w-4 h-4 rounded accent-[#3CA64C]" />
                        <span>Filtros de linha</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------------- */}
              {/* ACORDEÃO 3: Comandos e Regulação                                    */}
              {/* ------------------------------------------------------------------- */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setAccComandos(!accComandos)}
                  className="w-full p-4 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-between text-xs font-black text-[#114037] touch-target"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#1D734B]" />
                    <span>Comandos e Regulação</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${accComandos ? 'rotate-180' : ''}`} />
                </button>

                {accComandos && (
                  <div className="p-5 bg-white space-y-4 animate-fade-in border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Fabricante comando</label>
                        <select
                          value={eqCommandManufacturer}
                          onChange={(e) => setEqCommandManufacturer(e.target.value)}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        >
                          <option value="Arag">Arag</option>
                          <option value="Teejet">Teejet</option>
                          <option value="Geoline">Geoline</option>
                          <option value="Braglia">Braglia</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Modelo comando (Dropdown com registo)</label>
                        <select
                          value={eqCommandModelSelect}
                          onChange={(e) => setEqCommandModelSelect(e.target.value)}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        >
                          <option value="Bravo 180">Bravo 180</option>
                          <option value="Bravo 400S">Bravo 400S</option>
                          <option value="Matrix 430">Matrix 430</option>
                          <option value="outro">+ Adicionar Novo Modelo...</option>
                        </select>
                        {eqCommandModelSelect === 'outro' && (
                          <input
                            type="text"
                            placeholder="Escreva o novo modelo de comando..."
                            value={eqCommandModelCustom}
                            onChange={(e) => setEqCommandModelCustom(e.target.value)}
                            className="w-full mt-2 min-h-[48px] px-4 py-2.5 bg-emerald-50 border border-[#3CA64C] rounded-xl text-xs font-semibold outline-none"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Nº de Secções</label>
                        <input
                          type="text"
                          placeholder="ex: 4"
                          value={eqSectionsCount}
                          onChange={(e) => setEqSectionsCount(e.target.value)}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={eqIsManual} onChange={(e) => setEqIsManual(e.target.checked)} className="w-4 h-4 rounded accent-[#3CA64C]" />
                        <span>Manual</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={eqIsElectric} onChange={(e) => setEqIsElectric(e.target.checked)} className="w-4 h-4 rounded accent-[#3CA64C]" />
                        <span>Elétrico</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={eqIsIsobus} onChange={(e) => setEqIsIsobus(e.target.checked)} className="w-4 h-4 rounded accent-[#3CA64C]" />
                        <span>ISOBUS</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={eqIsAutomatic} onChange={(e) => setEqIsAutomatic(e.target.checked)} className="w-4 h-4 rounded accent-[#3CA64C]" />
                        <span>Automático</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={eqHasComputer} onChange={(e) => setEqHasComputer(e.target.checked)} className="w-4 h-4 rounded accent-[#3CA64C]" />
                        <span>Computador</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------------- */}
              {/* ACORDEÃO 4: Manómetro                                               */}
              {/* ------------------------------------------------------------------- */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setAccManometro(!accManometro)}
                  className="w-full p-4 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-between text-xs font-black text-[#114037] touch-target"
                >
                  <span className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-[#1D734B]" />
                    <span>Manómetro</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${accManometro ? 'rotate-180' : ''}`} />
                </button>

                {accManometro && (
                  <div className="p-5 bg-white space-y-4 animate-fade-in border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Diâmetro manómetro (mm)</label>
                        <input type="text" placeholder="ex: 63" value={eqManometerDiameter} onChange={(e) => setEqManometerDiameter(e.target.value)} className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Divisões escala (bar)</label>
                        <input type="text" placeholder="ex: 0,2" value={eqManometerDivisions} onChange={(e) => setEqManometerDivisions(e.target.value)} className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Valor máximo escala (bar)</label>
                        <input type="text" placeholder="ex: 25" value={eqManometerMaxValue} onChange={(e) => setEqManometerMaxValue(e.target.value)} className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Classe de erro (%)</label>
                        <input type="text" placeholder="ex: 1,6" value={eqManometerErrorClass} onChange={(e) => setEqManometerErrorClass(e.target.value)} className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Pressão máxima (bar)</label>
                        <input type="text" placeholder="ex: 20" value={eqMaxPressure} onChange={(e) => setEqMaxPressure(e.target.value)} className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------------- */}
              {/* ACORDEÃO 5: Equipamento de Distribuição (CAMPOS CONDICIONAIS EXATOS)  */}
              {/* ------------------------------------------------------------------- */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setAccDistrib(!accDistrib)}
                  className="w-full p-4 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-between text-xs font-black text-[#114037] touch-target"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#1D734B]" />
                    <span>Equipamento de Distribuição (Condicional)</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${accDistrib ? 'rotate-180' : ''}`} />
                </button>

                {accDistrib && (
                  <div className="p-5 bg-white space-y-5 animate-fade-in border-t border-slate-200">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1D734B] mb-1.5">
                        Tipo de equipamento de distribuição
                      </label>
                      <select
                        value={eqDistributionType}
                        onChange={(e) => setEqDistributionType(e.target.value)}
                        className="w-full sm:w-1/2 min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-[#3CA64C]"
                      >
                        <option value="Barra horizontal">Barra horizontal</option>
                        <option value="Barra vertical">Barra vertical</option>
                        <option value="Ventilador">Ventilador</option>
                        <option value="Pistola/Lança">Pistola/Lança</option>
                        <option value="Pneumático">Pneumático</option>
                        <option value="Canhão">Canhão</option>
                        <option value="Painéis">Painéis</option>
                      </select>
                    </div>

                    {/* SE BARRA HORIZONTAL */}
                    {eqDistributionType === 'Barra horizontal' && (
                      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-4 animate-fade-in">
                        <span className="text-xs font-black text-[#114037] block">Campos: Barra Horizontal</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Largura barra (m)</label>
                            <input type="text" placeholder="ex: 12,0" value={eqBoomWidth} onChange={(e) => setEqBoomWidth(e.target.value)} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                          </div>
                          <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                              <input type="checkbox" checked={eqAirSleeve} onChange={(e) => setEqAirSleeve(e.target.checked)} className="w-4 h-4 rounded accent-[#3CA64C]" />
                              <span>Manga de ar</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SE BARRA VERTICAL */}
                    {eqDistributionType === 'Barra vertical' && (
                      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-4 animate-fade-in">
                        <span className="text-xs font-black text-[#114037] block">Campos: Barra Vertical</span>
                        <div className="w-full sm:w-1/2">
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Altura da barra (m)</label>
                          <input type="text" placeholder="ex: 2,5" value={eqBoomHeight} onChange={(e) => setEqBoomHeight(e.target.value)} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                        </div>
                      </div>
                    )}

                    {/* SE VENTILADOR */}
                    {eqDistributionType === 'Ventilador' && (
                      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-4 animate-fade-in">
                        <span className="text-xs font-black text-[#114037] block">Campos: Ventilador</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Transmissão ventilador</label>
                            <select value={eqFanTransmission} onChange={(e) => setEqFanTransmission(e.target.value)} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold">
                              <option value="Correia">correia</option>
                              <option value="Cardan">cardan</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Diâmetro ventilador (mm)</label>
                            <input type="text" placeholder="ex: 800" value={eqFanDiameter} onChange={(e) => setEqFanDiameter(e.target.value)} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipo ventilador</label>
                            <select value={eqFanType} onChange={(e) => setEqFanType(e.target.value)} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold">
                              <option value="Axial">axial</option>
                              <option value="Radial">radial</option>
                              <option value="Fluxo Cruzado">fluxo cruzado</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input type="checkbox" checked={eqSuctionAirDeflector} onChange={(e) => setEqSuctionAirDeflector(e.target.checked)} className="w-4 h-4 rounded accent-[#3CA64C]" />
                            <span>Defletor de ar de aspiração</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input type="checkbox" checked={eqCompressionAirDeflector} onChange={(e) => setEqCompressionAirDeflector(e.target.checked)} className="w-4 h-4 rounded accent-[#3CA64C]" />
                            <span>Defletor de ar de compressão</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input type="checkbox" checked={eqHeightCompressionAirDeflector} onChange={(e) => setEqHeightCompressionAirDeflector(e.target.checked)} className="w-4 h-4 rounded accent-[#3CA64C]" />
                            <span>Defletor de ar de compressão em altura</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* SE PISTOLA / LANÇA */}
                    {eqDistributionType === 'Pistola/Lança' && (
                      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-4 animate-fade-in">
                        <span className="text-xs font-black text-[#114037] block">Campos: Pistola / Lança</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Número de pistolas/lanças</label>
                            <input type="text" placeholder="ex: 2" value={eqLancesCount} onChange={(e) => setEqLancesCount(e.target.value)} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Comprimento de mangueira (m)</label>
                            <input type="text" placeholder="ex: 50" value={eqHoseLength} onChange={(e) => setEqHoseLength(e.target.value)} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                          </div>
                          <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                              <input type="checkbox" checked={eqHoseReels} onChange={(e) => setEqHoseReels(e.target.checked)} className="w-4 h-4 rounded accent-[#3CA64C]" />
                              <span>Enroladores</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SE PNEUMÁTICO */}
                    {eqDistributionType === 'Pneumático' && (
                      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-4 animate-fade-in">
                        <span className="text-xs font-black text-[#114037] block">Campos: Pneumático</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Número de bocais pneumáticos</label>
                            <input type="text" placeholder="ex: 8" value={eqPneumaticNozzlesCount} onChange={(e) => setEqPneumaticNozzlesCount(e.target.value)} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Número de bicos por bocal pneumático</label>
                            <input type="text" placeholder="ex: 2" value={eqNozzlesPerPneumaticHead} onChange={(e) => setEqNozzlesPerPneumaticHead(e.target.value)} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SE CANHÃO */}
                    {eqDistributionType === 'Canhão' && (
                      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-4 animate-fade-in">
                        <span className="text-xs font-black text-[#114037] block">Campos: Canhão</span>
                        <div className="w-full sm:w-1/2">
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Número de agrupamento de bicos</label>
                          <input type="text" placeholder="ex: 4" value={eqCannonNozzleGroupsCount} onChange={(e) => setEqCannonNozzleGroupsCount(e.target.value)} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                        </div>
                      </div>
                    )}

                    {/* SE PAINÉIS */}
                    {eqDistributionType === 'Painéis' && (
                      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-4 animate-fade-in">
                        <span className="text-xs font-black text-[#114037] block">Campos: Painéis</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Número de painéis</label>
                            <input type="text" placeholder="ex: 4" value={eqPanelsCount} onChange={(e) => setEqPanelsCount(e.target.value)} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Número de linhas tratadas simultaneamente</label>
                            <input type="text" placeholder="ex: 2" value={eqSimultaneousRowsCount} onChange={(e) => setEqSimultaneousRowsCount(e.target.value)} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------------- */}
              {/* ACORDEÃO 6: Outros e Observações                                     */}
              {/* ------------------------------------------------------------------- */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setAccOutros(!accOutros)}
                  className="w-full p-4 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-between text-xs font-black text-[#114037] touch-target"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#1D734B]" />
                    <span>Outros e Observações</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${accOutros ? 'rotate-180' : ''}`} />
                </button>

                {accOutros && (
                  <div className="p-5 bg-white space-y-4 animate-fade-in border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Data da Inspeção (Notificações)</label>
                        <input
                          type="date"
                          value={eqInspectionDate}
                          onChange={(e) => setEqInspectionDate(e.target.value)}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Data da Calibração (Notificações)</label>
                        <input
                          type="date"
                          value={eqCalibrationDate}
                          onChange={(e) => setEqCalibrationDate(e.target.value)}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Notas / Observações</label>
                      <textarea
                        rows={3}
                        placeholder="Observações técnicas sobre manutenção ou inspeção..."
                        value={eqNotes}
                        onChange={(e) => setEqNotes(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-[#3CA64C]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Botão de Ação Principal (Verde Destaque #3CA64C) */}
              <button
                type="submit"
                className="w-full min-h-[48px] bg-[#3CA64C] hover:bg-[#3AAA35] text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 touch-target"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Guardar Perfil de Equipamento no IndexedDB</span>
              </button>
            </form>

            {/* Listagem de Equipamentos Gravados */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">Equipamentos Registados</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {equipments?.map(eq => (
                  <div key={eq.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">{eq.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono-numbers block mt-0.5">
                        {eq.manufacturer} {eq.model} • Depósito: {eq.tank_capacity_l} L • Distribuição: {eq.distribution_type || 'Ventilador'}
                      </span>
                      {eq.inspection_date && (
                        <span className="text-[10px] text-[#1D734B] font-mono-numbers block mt-1">
                          Inspeção: {eq.inspection_date} • Calibração: {eq.calibration_date || 'N/A'}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => eq.id && db.profiles_equipment.delete(eq.id)}
                      className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                      title="Eliminar equipamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEPARADOR 3: PERFIL - BICOS (Dropdowns Reativos)                         */}
      {/* ========================================================================= */}
      {activeTab === 'bicos' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Gauge className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-fluid-subtitle font-black text-[#114037]">Perfil — Bicos de Pulverização (ISO 10625)</h2>
                  <span className="text-xs text-slate-500 font-semibold block">Seleção de Fabricante, Modelo Reativo, Cor ISO e Débito Nominal</span>
                </div>
              </div>

              {/* Botão de Microlearning 'i' Ajuda */}
              <button
                type="button"
                onClick={() => openMicro('perfil_bicos')}
                className="px-3.5 min-h-[44px] bg-[#3CA64C]/10 hover:bg-[#3CA64C]/20 text-[#114037] font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 touch-target"
                title="Microlearning: Diretrizes de Bicos"
              >
                <Info className="w-4 h-4 text-[#3CA64C]" />
                <span>Ajuda</span>
              </button>
            </div>

            <form onSubmit={handleSaveNozzle} className="space-y-8">
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B]">
                  Especificações do Bico
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Equipamento Associado</label>
                    <select
                      value={nozzleEqId}
                      onChange={(e) => setNozzleEqId(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    >
                      <option value="">Selecione um equipamento...</option>
                      {equipments?.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.name} ({eq.tank_capacity_l} L)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Fabricante do Bico</label>
                    <select
                      value={nozzleManufacturer}
                      onChange={(e) => handleManufacturerChange(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    >
                      <option value="Albuz">Albuz</option>
                      <option value="Lechler">Lechler</option>
                      <option value="Hardi">Hardi</option>
                      <option value="ASJ">ASJ</option>
                      <option value="Teejet">Teejet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Modelo (Reativo ao Fabricante: {nozzleManufacturer})
                    </label>
                    <select
                      value={nozzleModel}
                      onChange={(e) => setNozzleModel(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    >
                      {(NOZZLE_MODELS_BY_MANUFACTURER[nozzleManufacturer] || []).map(mod => (
                        <option key={mod} value={mod}>{mod}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Cor (Código ISO 10625)</label>
                    <select
                      value={nozzleColor}
                      onChange={(e) => setNozzleColor(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    >
                      {NOZZLE_COLORS.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipo de Bico</label>
                    <select
                      value={nozzleType}
                      onChange={(e) => setNozzleType(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    >
                      <option value="Cone Oco">Cone Oco</option>
                      <option value="Cone Cheio">Cone Cheio</option>
                      <option value="Injeção de Ar">Injeção de Ar (Anti-deriva)</option>
                      <option value="Leque Standard">Leque Standard</option>
                      <option value="Defletor">Defletor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Pressão de Trabalho (bar)</label>
                    <input
                      type="text"
                      placeholder="ex: 10,0"
                      value={nozzleWorkingPressure}
                      onChange={(e) => setNozzleWorkingPressure(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Débito Nominal (L/min)</label>
                    <input
                      type="text"
                      placeholder="ex: 1,03"
                      value={nozzleNominalFlow}
                      onChange={(e) => setNozzleNominalFlow(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                  </div>
                </div>
              </div>

              {/* Botão de Ação Principal (Verde Destaque #3CA64C) */}
              <button
                type="submit"
                className="w-full min-h-[48px] bg-[#3CA64C] hover:bg-[#3AAA35] text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 touch-target"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Adicionar Bico ao IndexedDB</span>
              </button>
            </form>

            {/* Listagem de Bicos Gravados */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">Bicos Registados</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {nozzles?.map(nz => (
                  <div key={nz.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">
                        {nz.manufacturer} {nz.model} ({nz.color})
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono-numbers block mt-0.5">
                        {nz.nozzle_type} • {nz.spray_angle} • {String(nz.working_pressure_bar).replace('.', ',')} bar • {String(nz.nominal_flow_lmin).replace('.', ',')} L/min
                      </span>
                    </div>
                    <button
                      onClick={() => nz.id && db.profiles_nozzles.delete(nz.id)}
                      className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                      title="Eliminar bico"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEPARADOR 4: PERFIL - CALIBRAÇÃO (Cálculo Automático)                    */}
      {/* ========================================================================= */}
      {activeTab === 'calibracao' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-fluid-subtitle font-black text-[#114037]">Perfil — Calibração & Ensaio em Branco</h2>
                  <span className="text-xs text-slate-500 font-semibold block">Medição de Débito e Cálculo do Volume de Calda (L/ha)</span>
                </div>
              </div>

              {/* Botão de Microlearning 'i' Ajuda */}
              <button
                type="button"
                onClick={() => openMicro('perfil_calibracao')}
                className="px-3.5 min-h-[44px] bg-[#3CA64C]/10 hover:bg-[#3CA64C]/20 text-[#114037] font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 touch-target"
                title="Microlearning: Diretrizes de Calibração"
              >
                <Info className="w-4 h-4 text-[#3CA64C]" />
                <span>Ajuda</span>
              </button>
            </div>

            <form onSubmit={handleSaveCalibration} className="space-y-8">
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B]">
                  Parâmetros do Ensaio
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Equipamento Associado</label>
                    <select
                      value={calibEqId}
                      onChange={(e) => setCalibEqId(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    >
                      <option value="">Selecione um equipamento...</option>
                      {equipments?.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.name} ({eq.tank_capacity_l} L)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Bico Associado</label>
                    <select
                      value={calibNozzleId}
                      onChange={(e) => setCalibNozzleId(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    >
                      <option value="">Selecione um bico...</option>
                      {nozzles?.map(nz => (
                        <option key={nz.id} value={nz.id}>{nz.manufacturer} {nz.model} ({nz.color})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Velocidade (km/h)</label>
                    <input
                      type="text"
                      placeholder="ex: 6,5"
                      value={calibSpeed}
                      onChange={(e) => setCalibSpeed(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Pressão (bar)</label>
                    <input
                      type="text"
                      placeholder="ex: 10,0"
                      value={calibPressure}
                      onChange={(e) => setCalibPressure(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Largura Trabalho (m)</label>
                    <input
                      type="text"
                      placeholder="ex: 2,2"
                      value={calibWidth}
                      onChange={(e) => setCalibWidth(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Débito Total (L/min)</label>
                    <input
                      type="text"
                      placeholder="ex: 12,36"
                      value={calibTotalFlow}
                      onChange={(e) => setCalibTotalFlow(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                  </div>
                </div>
              </div>

              {/* Caixa de Resultados Calculados (JetBrains Mono para os números) */}
              <div className="p-5 bg-[#eef8f0] border border-[#3CA64C]/30 rounded-2xl space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">Resultados Calculados do Volume de Calda</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[11px] text-[#1D734B] font-bold block">Volume de Calda Calculado:</span>
                    <span className="text-2xl font-black text-[#114037] font-mono-numbers">
                      {((600 * (parseFloat(calibTotalFlow.replace(',', '.')) || 12.36)) / ((parseFloat(calibSpeed.replace(',', '.')) || 6.5) * (parseFloat(calibWidth.replace(',', '.')) || 2.2))).toFixed(2).replace('.', ',')} L/ha
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#1D734B] font-bold block">Velocidade Fluxo de Ar:</span>
                    <span className="text-base font-bold text-[#114037] font-mono-numbers">28 m/s</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#1D734B] font-bold block">Volume Fluxo de Ar:</span>
                    <span className="text-base font-bold text-[#114037] font-mono-numbers">35.000 m³/h</span>
                  </div>
                </div>
              </div>

              {/* Botão de Ação Principal (Verde Destaque #3CA64C) */}
              <button
                type="submit"
                className="w-full min-h-[48px] bg-[#3CA64C] hover:bg-[#3AAA35] text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 touch-target"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Gravar Ficha de Calibração no IndexedDB</span>
              </button>
            </form>

            {/* Listagem de Calibrações Gravadas */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">Fichas de Calibração Registadas</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {calibrations?.map(cl => (
                  <div key={cl.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">
                        Volume Calibrado: {String(cl.calculated_spray_volume_lha).replace('.', ',')} L/ha
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono-numbers block mt-0.5">
                        Velocidade: {String(cl.working_speed_kmh).replace('.', ',')} km/h • Pressão: {String(cl.working_pressure_bar).replace('.', ',')} bar • Débito: {String(cl.total_flow_lmin).replace('.', ',')} L/min
                      </span>
                    </div>
                    <button
                      onClick={() => cl.id && db.profiles_calibrations.delete(cl.id)}
                      className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                      title="Eliminar calibração"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Microlearning 'i' Ajuda */}
      <MicrolearningModal
        isOpen={microModalOpen}
        onClose={() => setMicroModalOpen(false)}
        fieldKey={activeMicroKey}
      />
    </div>
  );
};
