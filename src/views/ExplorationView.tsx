import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Sprout, Wrench, Gauge, ShieldCheck, Plus, Trash2, 
  Info, CheckCircle2, Layers, Sliders, ChevronDown, Check
} from 'lucide-react';
import { db } from '../db/db';
import type { ProfileCulture, ProfileEquipment, ProfileNozzle, ProfileCalibration } from '../db/types';
import { MicrolearningModal } from '../components/MicrolearningModal';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { saveScopedCulture, saveScopedEquipment, saveScopedNozzle, saveScopedCalibration, deleteScopedProfile } from '../features/perfis/services/profileStorageService';
import { CultureSection } from '../features/perfis/components/CultureSection';
import {
  buildCalibrationPayload,
  buildEquipmentPayload,
  buildNozzlePayload,
  computeSprayVolumeLha,
  INITIAL_CALIBRATION_FORM,
  INITIAL_EQUIPMENT_FORM,
  INITIAL_NOZZLE_FORM,
  parsePositiveFloat
} from '../features/perfis/services/explorationFormHelpers';

export type ProfileTab = 'cultura' | 'equipamento' | 'bicos' | 'calibracao';

export interface ExplorationViewProps {
  embedded?: boolean;
  activeTab?: ProfileTab;
  onTabChange?: (tab: ProfileTab) => void;
  hideHeader?: boolean;
  hideTabs?: boolean;
}

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

export const ExplorationView: React.FC<ExplorationViewProps> = ({
  embedded = false,
  activeTab: controlledActiveTab,
  onTabChange,
  hideHeader = false,
  hideTabs = false
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const effectiveUserId = user?.id || user?.uid || '';
  const [internalActiveTab, setInternalActiveTab] = useState<ProfileTab>('cultura');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formErrorMsg, setFormErrorMsg] = useState('');

  const setActiveTab = (tab: ProfileTab) => {
    setFormErrors({});
    setFormErrorMsg('');
    if (onTabChange) onTabChange(tab);
    setInternalActiveTab(tab);
  };

  // Microlearning Modal State
  const [microModalOpen, setMicroModalOpen] = useState(false);
  const [activeMicroKey, setActiveMicroKey] = useState('perfil_cultura');

  const openMicro = (key: string) => {
    setActiveMicroKey(key);
    setMicroModalOpen(true);
  };

  // Carregar apenas dados autorizados do utilizador em sessão (SEC-REM-01)
  const cultures = useLiveQuery<ProfileCulture[]>(
    () => (effectiveUserId ? db.profiles_cultures.where('userId').equals(effectiveUserId).toArray() : []),
    [effectiveUserId]
  ) || [];
  const equipments = useLiveQuery<ProfileEquipment[]>(
    () => (effectiveUserId ? db.profiles_equipment.where('userId').equals(effectiveUserId).toArray() : []),
    [effectiveUserId]
  ) || [];
  const nozzles = useLiveQuery<ProfileNozzle[]>(
    () => (effectiveUserId ? db.profiles_nozzles.where('userId').equals(effectiveUserId).toArray() : []),
    [effectiveUserId]
  ) || [];
  const calibrations = useLiveQuery<ProfileCalibration[]>(
    () => (effectiveUserId ? db.profiles_calibrations.where('userId').equals(effectiveUserId).toArray() : []),
    [effectiveUserId]
  ) || [];

  const [accIdent, setAccIdent] = useState(true);
  const [accBomba, setAccBomba] = useState(false);
  const [accComandos, setAccComandos] = useState(false);
  const [accManometro, setAccManometro] = useState(false);
  const [accDistrib, setAccDistrib] = useState(false);
  const [accOutros, setAccOutros] = useState(false);
  const [eqForm, setEqForm] = useState(INITIAL_EQUIPMENT_FORM);
  const [nozzleForm, setNozzleForm] = useState(INITIAL_NOZZLE_FORM);
  const [calibForm, setCalibForm] = useState(INITIAL_CALIBRATION_FORM);

  const renderFieldError = (key: string) =>
    formErrors[key] ? (
      <p role="alert" className="mt-1 text-xs font-semibold text-rose-700">{formErrors[key]}</p>
    ) : null;

  const renderTriState = (label: string, value: boolean | undefined, onChange: (val: boolean | undefined) => void) => (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>
      <select
        aria-label={label}
        value={value === undefined ? '' : value ? 'true' : 'false'}
        onChange={(e) => onChange(e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
        className="w-full min-h-[48px] px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
      >
        <option value="">{t('exploration.options.unspecified', 'Não indicado')}</option>
        <option value="true">{t('common.yes', 'Sim')}</option>
        <option value="false">{t('common.no', 'Não')}</option>
      </select>
    </div>
  );

  const toggleNozzleSelection = (nozzleDesc: string) => {
    setEqForm((prev) => ({
      ...prev,
      selectedNozzles: prev.selectedNozzles.includes(nozzleDesc)
        ? prev.selectedNozzles.filter((n) => n !== nozzleDesc)
        : [...prev.selectedNozzles, nozzleDesc]
    }));
  };

  const handleManufacturerChange = (mfg: string) => {
    setNozzleForm((prev) => ({ ...prev, manufacturer: mfg, model: '' }));
  };

  const notifySaved = (msg: string) => {
    setFormErrors({});
    setFormErrorMsg('');
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const failValidation = (errors: Record<string, string>, fallbackMsg: string) => {
    setFormErrors(errors);
    setFormErrorMsg(fallbackMsg);
  };

  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveUserId) return failValidation({}, t('exploration.errors.sessionRequired', 'Inicie sessão para guardar perfis.'));
    const result = buildEquipmentPayload(eqForm);
    if (!result.data) {
      return failValidation(result.errors, t('exploration.errors.fixEquipmentFields', 'Corrija os campos assinalados antes de guardar o equipamento.'));
    }
    try {
      await saveScopedEquipment(effectiveUserId, result.data);
      setEqForm(INITIAL_EQUIPMENT_FORM);
      notifySaved(t('exploration.feedback.equipmentSaved', 'Perfil de Equipamento guardado com sucesso no IndexedDB!'));
    } catch (err) {
      failValidation({}, err instanceof Error ? err.message : t('exploration.errors.saveFailed', 'Erro ao guardar perfil.'));
    }
  };

  const handleSaveNozzle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveUserId) return failValidation({}, t('exploration.errors.sessionRequired', 'Inicie sessão para guardar perfis.'));
    const selectedEq = equipments?.find((eq) => eq.id === parseInt(nozzleForm.equipmentId, 10));
    const result = buildNozzlePayload(nozzleForm, selectedEq);
    if (!result.data) {
      return failValidation(result.errors, t('exploration.errors.fixNozzleFields', 'Corrija os campos assinalados antes de guardar o bico.'));
    }
    try {
      await saveScopedNozzle(effectiveUserId, result.data);
      setNozzleForm(INITIAL_NOZZLE_FORM);
      notifySaved(t('exploration.feedback.nozzlesSaved', 'Perfil de Bicos guardado com sucesso no IndexedDB!'));
    } catch (err) {
      failValidation({}, err instanceof Error ? err.message : t('exploration.errors.saveFailed', 'Erro ao guardar perfil.'));
    }
  };

  const handleSaveCalibration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveUserId) return failValidation({}, t('exploration.errors.sessionRequired', 'Inicie sessão para guardar perfis.'));
    const selectedEq = equipments?.find((eq) => eq.id === parseInt(calibForm.equipmentId, 10));
    const selectedNz = nozzles?.find((nz) => nz.id === parseInt(calibForm.nozzleId, 10));
    const result = buildCalibrationPayload(calibForm, selectedEq, selectedNz);
    if (!result.data) {
      return failValidation(result.errors, t('exploration.errors.fixCalibrationFields', 'Corrija os campos assinalados antes de guardar a calibração.'));
    }
    try {
      await saveScopedCalibration(effectiveUserId, result.data);
      setCalibForm(INITIAL_CALIBRATION_FORM);
      notifySaved(t('exploration.feedback.calibrationSaved', 'Perfil de Calibração guardado com sucesso no IndexedDB!'));
    } catch (err) {
      failValidation({}, err instanceof Error ? err.message : t('exploration.errors.saveFailed', 'Erro ao guardar perfil.'));
    }
  };

  return (
    <div className={embedded ? "space-y-6 animate-fade-in" : "space-y-8 animate-fade-in pb-12"}>
      
      {/* CABEÇALHO DO ECRÃ DE EXPLORAÇÃO (Ocultado quando embutido em Definições) */}
      {!hideHeader && (
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

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-0.5 bg-amber-100 border border-amber-400 text-amber-950 rounded-full text-xs font-black uppercase tracking-wider">
              RC
            </span>
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-extrabold font-mono-numbers">
              <Layers className="w-4 h-4 text-[#3CA64C]" />
              <span>{t('exploration.normativeTag')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de Feedback e Erros de Validação */}
      {feedbackMsg && (
        <div className="p-4 bg-[#3CA64C] text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}
      {formErrorMsg && (
        <div role="alert" className="p-4 bg-rose-50 border border-rose-300 text-rose-900 font-bold text-xs rounded-2xl shadow-xs flex items-center gap-3 animate-fade-in">
          <Info className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{formErrorMsg}</span>
        </div>
      )}

      {/* REVELAÇÃO PROGRESSIVA: TABS DE PERFIS (Ocultado quando controlado externamente por Definições) */}
      {!hideTabs && (
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
      )}

      {/* Dica Permanente de Formatação Decimal com Vírgula (outros separadores) */}
      {activeTab !== 'cultura' && (
        <div className="bg-amber-50/90 border border-amber-200/90 p-4 rounded-2xl flex items-center gap-3 text-xs text-amber-900 font-semibold shadow-xs">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            {t('exploration.formattingNote')}
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEPARADOR 1: PERFIL - CULTURA (V11 MODULAR)                              */}
      {/* ========================================================================= */}
      {activeTab === 'cultura' && (
        <CultureSection
          userId={effectiveUserId}
          cultures={cultures}
          notifySaved={notifySaved}
          failValidation={failValidation}
          saveLegacyFallback={saveScopedCulture}
          onDeleteCulture={(id) => deleteScopedProfile(effectiveUserId, 'cultures', id)}
        />
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
                  <h2 className="text-fluid-subtitle font-black text-[#114037]">{t('exploration.equipment.title', 'Perfil — Equipamentos (ISO 16122)')}</h2>
                  <span className="text-xs text-slate-500 font-semibold block">{t('exploration.equipmentSectionsTitle', 'Configuração por Acordeões Específicos da Exploração')}</span>
                </div>
              </div>

              {/* Botão de Microlearning 'i' Ajuda */}
              <button
                type="button"
                onClick={() => openMicro('perfil_equipamento')}
                className="px-3.5 min-h-[44px] bg-[#3CA64C]/10 hover:bg-[#3CA64C]/20 text-[#114037] font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 touch-target"
                title={t('exploration.guideEquipment', 'Guia: Diretrizes de Equipamento')}
              >
                <Info className="w-4 h-4 text-[#3CA64C]" />
                <span>{t('common.help', 'Ajuda')}</span>
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
                    <span>{t('exploration.mainIdentification', 'Identificação Principal')}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${accIdent ? 'rotate-180' : ''}`} />
                </button>

                {accIdent && (
                  <div className="p-5 bg-white space-y-4 animate-fade-in border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.nameRef', 'Nome (Referência)')}</label>
                        <input
                          type="text"
                          placeholder="ex: Atomizador Tomix 1000L"
                          value={eqForm.name}
                          onChange={(e) => setEqForm((p) => ({ ...p, name: e.target.value }))}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        />
                        {renderFieldError('name')}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.equipment.manufacturer', 'Fabricante')}</label>
                        <select
                          value={eqForm.manufacturer}
                          onChange={(e) => setEqForm((p) => ({ ...p, manufacturer: e.target.value }))}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        >
                          <option value="">{t('exploration.options.unspecified', 'Não indicado')}</option>
                          <option value="Tomix">Tomix</option>
                          <option value="Rocha">Rocha</option>
                          <option value="Jacto">Jacto</option>
                          <option value="Hardi">Hardi</option>
                          <option value="Berthoud">Berthoud</option>
                          <option value="Caffini">Caffini</option>
                          <option value="Kuhn">Kuhn</option>
                          <option value="Outro">{t('exploration.options.crops.other', 'Outro')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.equipment.modelDropdown', 'Modelo (Dropdown com registo)')}</label>
                        <select
                          value={eqForm.modelSelect}
                          onChange={(e) => setEqForm((p) => ({ ...p, modelSelect: e.target.value }))}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        >
                          <option value="">{t('exploration.options.unspecified', 'Não indicado')}</option>
                          <option value="Tornado 1000">Tornado 1000</option>
                          <option value="Tornado 2000">Tornado 2000</option>
                          <option value="Hydra 600">Hydra 600</option>
                          <option value="Commander 3000">Commander 3000</option>
                          <option value="outro">+ {t('exploration.equipment.addNewModel', 'Adicionar Novo Modelo...')}</option>
                        </select>
                        {eqForm.modelSelect === 'outro' && (
                          <input
                            type="text"
                            placeholder={t('exploration.equipment.writeNewModel', 'Escreva o novo modelo...')}
                            value={eqForm.modelCustom}
                            onChange={(e) => setEqForm((p) => ({ ...p, modelCustom: e.target.value }))}
                            className="w-full mt-2 min-h-[48px] px-4 py-2.5 bg-emerald-50 border border-[#3CA64C] rounded-xl text-xs font-semibold outline-none"
                          />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.serialNumber', 'Nº Série')}</label>
                        <input
                          type="text"
                          placeholder="ex: SN-2024-991"
                          value={eqForm.serialNumber}
                          onChange={(e) => setEqForm((p) => ({ ...p, serialNumber: e.target.value }))}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.buildYear', 'Ano Construção (Ano YYYY)')}</label>
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="ex: 2024"
                          value={eqForm.constructionYear}
                          onChange={(e) => setEqForm((p) => ({ ...p, constructionYear: e.target.value }))}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.tankCapacityL', 'Capacidade depósito (L)')}</label>
                        <input
                          type="text"
                          placeholder="ex: 1000"
                          value={eqForm.tankCapacity}
                          onChange={(e) => setEqForm((p) => ({ ...p, tankCapacity: e.target.value }))}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                        />
                        {renderFieldError('tankCapacity')}
                      </div>
                    </div>

                    {/* Seletores Tri-Estado de Depósito (Desconhecido ≠ Não) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {renderTriState(t('exploration.handWashTank', 'Depósito lava-mãos'), eqForm.hasHandWashingTank, (v) => setEqForm((p) => ({ ...p, hasHandWashingTank: v })))}
                      {renderTriState(t('exploration.circuitRinseTank', 'Depósito lava-circuitos'), eqForm.hasCircuitRinse, (v) => setEqForm((p) => ({ ...p, hasCircuitRinse: v })))}
                      {renderTriState(t('exploration.chemicalInductionTank', 'Depósito incorporador de produto'), eqForm.hasProductIncorporator, (v) => setEqForm((p) => ({ ...p, hasProductIncorporator: v })))}
                    </div>

                    {/* Bicos: Dropdown cumulativa de lista de bicos do perfil Bicos */}
                    <div className="pt-3 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {t('exploration.equipment.associatedNozzles', 'Bicos Associados (Seleção cumulativa do perfil Bicos)')}
                      </label>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                        {nozzles && nozzles.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {nozzles.map(nz => {
                              const nzDesc = `${nz.manufacturer} ${nz.model} (${nz.color})`;
                              const isSelected = eqForm.selectedNozzles.includes(nzDesc);
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
                            {t('exploration.equipment.noNozzlesConfigured', 'Nenhum bico configurado ainda. Adicione bicos no separador "Bicos".')}
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
                    <span>{t('exploration.equipment.pumpAndFilters', 'Bomba e Filtros')}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${accBomba ? 'rotate-180' : ''}`} />
                </button>

                {accBomba && (
                  <div className="p-5 bg-white space-y-4 animate-fade-in border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.equipment.pumpManufacturer', 'Fabricante Bomba')}</label>
                        <select
                          value={eqForm.pumpManufacturer}
                          onChange={(e) => setEqForm((p) => ({ ...p, pumpManufacturer: e.target.value }))}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        >
                          <option value="">{t('exploration.options.unspecified', 'Não indicado')}</option>
                          <option value="Comet">Comet</option>
                          <option value="Annovi Reverberi">Annovi Reverberi</option>
                          <option value="Imovilli">Imovilli</option>
                          <option value="Udor">Udor</option>
                          <option value="Bertolini">Bertolini</option>
                          <option value="Outro">{t('exploration.options.crops.other', 'Outro')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.equipment.pumpModelDropdown', 'Modelo Bomba (Dropdown com registo)')}</label>
                        <select
                          value={eqForm.pumpModelSelect}
                          onChange={(e) => setEqForm((p) => ({ ...p, pumpModelSelect: e.target.value }))}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        >
                          <option value="">{t('exploration.options.unspecified', 'Não indicado')}</option>
                          <option value="APS 121">APS 121</option>
                          <option value="AR 1064">AR 1064</option>
                          <option value="Kappa 75">Kappa 75</option>
                          <option value="outro">+ {t('exploration.equipment.addNewPumpModel', 'Adicionar Novo Modelo...')}</option>
                        </select>
                        {eqForm.pumpModelSelect === 'outro' && (
                          <input
                            type="text"
                            placeholder={t('exploration.equipment.writeNewPumpModel', 'Escreva o novo modelo de bomba...')}
                            value={eqForm.pumpModelCustom}
                            onChange={(e) => setEqForm((p) => ({ ...p, pumpModelCustom: e.target.value }))}
                            className="w-full mt-2 min-h-[48px] px-4 py-2.5 bg-emerald-50 border border-[#3CA64C] rounded-xl text-xs font-semibold outline-none"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.equipment.pumpType', 'Tipo Bomba')}</label>
                        <select
                          value={eqForm.pumpType}
                          onChange={(e) => setEqForm((p) => ({ ...p, pumpType: e.target.value }))}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        >
                          <option value="">{t('exploration.options.unspecified', 'Não indicado')}</option>
                          <option value="Membrana">{t('exploration.pumpTypes.membrane', 'Membrana')}</option>
                          <option value="Pistão">{t('exploration.pumpTypes.piston', 'Pistão')}</option>
                          <option value="Centrífuga">{t('exploration.pumpTypes.centrifugal', 'Centrífuga')}</option>
                          <option value="Outro">{t('exploration.options.crops.other', 'Outro')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                      {renderTriState(t('exploration.equipment.fillingSieve', 'Crivo enchimento'), eqForm.hasFillingSieve, (v) => setEqForm((p) => ({ ...p, hasFillingSieve: v })))}
                      {renderTriState(t('exploration.suctionFilter', 'Filtro aspiração'), eqForm.hasSuctionFilter, (v) => setEqForm((p) => ({ ...p, hasSuctionFilter: v })))}
                      {renderTriState(t('exploration.pressureFilter', 'Filtro pressão'), eqForm.hasPressureFilter, (v) => setEqForm((p) => ({ ...p, hasPressureFilter: v })))}
                      {renderTriState(t('exploration.equipment.lineFilters', 'Filtros de linha'), eqForm.hasLineFilters, (v) => setEqForm((p) => ({ ...p, hasLineFilters: v })))}
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
                    <span>{t('exploration.controlsRegulation', 'Comandos e Regulação')}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${accComandos ? 'rotate-180' : ''}`} />
                </button>

                {accComandos && (
                  <div className="p-5 bg-white space-y-4 animate-fade-in border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.equipment.commandManufacturer', 'Fabricante comando')}</label>
                        <select
                          value={eqForm.commandManufacturer}
                          onChange={(e) => setEqForm((p) => ({ ...p, commandManufacturer: e.target.value }))}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        >
                          <option value="">{t('exploration.options.unspecified', 'Não indicado')}</option>
                          <option value="Arag">Arag</option>
                          <option value="Teejet">Teejet</option>
                          <option value="Geoline">Geoline</option>
                          <option value="Braglia">Braglia</option>
                          <option value="Outro">{t('exploration.options.crops.other', 'Outro')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.equipment.commandModelDropdown', 'Modelo comando (Dropdown com registo)')}</label>
                        <select
                          value={eqForm.commandModelSelect}
                          onChange={(e) => setEqForm((p) => ({ ...p, commandModelSelect: e.target.value }))}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                        >
                          <option value="">{t('exploration.options.unspecified', 'Não indicado')}</option>
                          <option value="Bravo 180">Bravo 180</option>
                          <option value="Bravo 400S">Bravo 400S</option>
                          <option value="Matrix 430">Matrix 430</option>
                          <option value="outro">+ {t('exploration.equipment.addNewCommandModel', 'Adicionar Novo Modelo...')}</option>
                        </select>
                        {eqForm.commandModelSelect === 'outro' && (
                          <input
                            type="text"
                            placeholder={t('exploration.equipment.writeNewCommandModel', 'Escreva o novo modelo de comando...')}
                            value={eqForm.commandModelCustom}
                            onChange={(e) => setEqForm((p) => ({ ...p, commandModelCustom: e.target.value }))}
                            className="w-full mt-2 min-h-[48px] px-4 py-2.5 bg-emerald-50 border border-[#3CA64C] rounded-xl text-xs font-semibold outline-none"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.boomSectionsCount', 'Nº de Secções')}</label>
                        <input
                          type="text"
                          placeholder="ex: 4"
                          value={eqForm.sectionsCount}
                          onChange={(e) => setEqForm((p) => ({ ...p, sectionsCount: e.target.value }))}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                        />
                        {renderFieldError('sectionsCount')}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                      {renderTriState(t('exploration.regTypes.manual', 'Manual'), eqForm.isManual, (v) => setEqForm((p) => ({ ...p, isManual: v })))}
                      {renderTriState(t('exploration.regTypes.electric', 'Elétrico'), eqForm.isElectric, (v) => setEqForm((p) => ({ ...p, isElectric: v })))}
                      {renderTriState(t('exploration.regTypes.isobus', 'ISOBUS'), eqForm.isIsobus, (v) => setEqForm((p) => ({ ...p, isIsobus: v })))}
                      {renderTriState(t('exploration.regTypes.automatic', 'Automático'), eqForm.isAutomatic, (v) => setEqForm((p) => ({ ...p, isAutomatic: v })))}
                      {renderTriState(t('exploration.regTypes.computer', 'Computador'), eqForm.hasComputer, (v) => setEqForm((p) => ({ ...p, hasComputer: v })))}
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
                    <span>{t('exploration.manometer', 'Manómetro')}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${accManometro ? 'rotate-180' : ''}`} />
                </button>

                {accManometro && (
                  <div className="p-5 bg-white space-y-4 animate-fade-in border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.manometerDiameter', 'Diâmetro manómetro (mm)')}</label>
                        <input type="text" placeholder="ex: 63" value={eqForm.manometerDiameter} onChange={(e) => setEqForm((p) => ({ ...p, manometerDiameter: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                        {renderFieldError('manometerDiameter')}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.scaleDivisions', 'Divisões escala (bar)')}</label>
                        <input type="text" placeholder="ex: 0,2" value={eqForm.manometerDivisions} onChange={(e) => setEqForm((p) => ({ ...p, manometerDivisions: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                        {renderFieldError('manometerDivisions')}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.maxScaleValue', 'Valor máximo escala (bar)')}</label>
                        <input type="text" placeholder="ex: 25" value={eqForm.manometerMaxValue} onChange={(e) => setEqForm((p) => ({ ...p, manometerMaxValue: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                        {renderFieldError('manometerMaxValue')}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.equipment.manometerErrorClass', 'Classe de erro (%)')}</label>
                        <input type="text" placeholder="ex: 1,6" value={eqForm.manometerErrorClass} onChange={(e) => setEqForm((p) => ({ ...p, manometerErrorClass: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                        {renderFieldError('manometerErrorClass')}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.maxPressure', 'Pressão máxima (bar)')}</label>
                        <input type="text" placeholder="ex: 20" value={eqForm.maxPressure} onChange={(e) => setEqForm((p) => ({ ...p, maxPressure: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                        {renderFieldError('maxPressure')}
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
                    <span>{t('exploration.distributionEquipment', 'Equipamento de Distribuição (Condicional)')}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${accDistrib ? 'rotate-180' : ''}`} />
                </button>

                {accDistrib && (
                  <div className="p-5 bg-white space-y-5 animate-fade-in border-t border-slate-200">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1D734B] mb-1.5">
                        {t('exploration.equipment.distributionType', 'Tipo de equipamento de distribuição')}
                      </label>
                      <select
                        value={eqForm.distributionType}
                        onChange={(e) => setEqForm((p) => ({ ...p, distributionType: e.target.value }))}
                        className="w-full sm:w-1/2 min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-[#3CA64C]"
                      >
                        <option value="">{t('exploration.options.unspecified', 'Não indicado')}</option>
                        <option value="Barra horizontal">{t('exploration.distTypes.horizontalBoom', 'Barra horizontal')}</option>
                        <option value="Barra vertical">{t('exploration.distTypes.verticalBoom', 'Barra vertical')}</option>
                        <option value="Ventilador">{t('exploration.distTypes.fan', 'Ventilador')}</option>
                        <option value="Pistola/Lança">{t('exploration.distTypes.lance', 'Pistola/Lança')}</option>
                        <option value="Pneumático">{t('exploration.distTypes.pneumatic', 'Pneumático')}</option>
                        <option value="Canhão">{t('exploration.distTypes.cannon', 'Canhão')}</option>
                        <option value="Painéis">{t('exploration.distTypes.panels', 'Painéis')}</option>
                      </select>
                    </div>

                    {/* SE BARRA HORIZONTAL */}
                    {eqForm.distributionType === 'Barra horizontal' && (
                      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-4 animate-fade-in">
                        <span className="text-xs font-black text-[#114037] block">{t('exploration.equipment.horizontalBoomFields', 'Campos: Barra Horizontal')}</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.equipment.boomWidthM', 'Largura barra (m)')}</label>
                            <input type="text" placeholder="ex: 12,0" value={eqForm.boomWidth} onChange={(e) => setEqForm((p) => ({ ...p, boomWidth: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                            {renderFieldError('boomWidth')}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.equipment.boomHeightM', 'Altura da barra (m)')}</label>
                            <input type="text" placeholder="ex: 0,5" value={eqForm.boomHeight} onChange={(e) => setEqForm((p) => ({ ...p, boomHeight: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                            {renderFieldError('boomHeight')}
                          </div>
                          <div>
                            {renderTriState(t('exploration.equipment.airSleeve', 'Manga de ar'), eqForm.hasAirSleeve, (v) => setEqForm((p) => ({ ...p, hasAirSleeve: v })))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SE BARRA VERTICAL */}
                    {eqForm.distributionType === 'Barra vertical' && (
                      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-4 animate-fade-in">
                        <span className="text-xs font-black text-[#114037] block">{t('exploration.equipment.verticalBoomFields', 'Campos: Barra Vertical')}</span>
                        <div className="w-full sm:w-1/2">
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.equipment.boomHeightM', 'Altura da barra (m)')}</label>
                          <input type="text" placeholder="ex: 2,5" value={eqForm.boomHeight} onChange={(e) => setEqForm((p) => ({ ...p, boomHeight: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                          {renderFieldError('boomHeight')}
                        </div>
                      </div>
                    )}

                    {/* SE VENTILADOR */}
                    {eqForm.distributionType === 'Ventilador' && (
                      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-4 animate-fade-in">
                        <span className="text-xs font-black text-[#114037] block">{t('exploration.equipment.fanFields', 'Campos: Ventilador')}</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.fanTransmission', 'Transmissão ventilador')}</label>
                            <select value={eqForm.fanTransmission} onChange={(e) => setEqForm((p) => ({ ...p, fanTransmission: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold">
                              <option value="">{t('exploration.options.unspecified', 'Não indicado')}</option>
                              <option value="Correia">{t('exploration.equipment.fanBelt', 'correia')}</option>
                              <option value="Cardan">{t('exploration.equipment.fanPto', 'cardan')}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.fanDiameter', 'Diâmetro ventilador (mm)')}</label>
                            <input type="text" placeholder="ex: 800" value={eqForm.fanDiameter} onChange={(e) => setEqForm((p) => ({ ...p, fanDiameter: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                            {renderFieldError('fanDiameter')}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.equipment.fanType', 'Tipo ventilador')}</label>
                            <select value={eqForm.fanType} onChange={(e) => setEqForm((p) => ({ ...p, fanType: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold">
                              <option value="">{t('exploration.options.unspecified', 'Não indicado')}</option>
                              <option value="Axial">{t('exploration.equipment.axialFan', 'axial')}</option>
                              <option value="Radial">{t('exploration.equipment.radialFan', 'radial')}</option>
                              <option value="Fluxo Cruzado">{t('exploration.equipment.crossFlowFan', 'fluxo cruzado')}</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          {renderTriState(t('exploration.intakeAirDeflector', 'Defletor de ar de aspiração'), eqForm.hasSuctionAirDeflector, (v) => setEqForm((p) => ({ ...p, hasSuctionAirDeflector: v })))}
                          {renderTriState(t('exploration.compressionAirDeflector', 'Defletor de ar de compressão'), eqForm.hasCompressionAirDeflector, (v) => setEqForm((p) => ({ ...p, hasCompressionAirDeflector: v })))}
                          {renderTriState(t('exploration.heightAirDeflector', 'Defletor de ar de compressão em altura'), eqForm.hasHeightCompressionAirDeflector, (v) => setEqForm((p) => ({ ...p, hasHeightCompressionAirDeflector: v })))}
                        </div>
                      </div>
                    )}

                    {/* SE PISTOLA / LANÇA */}
                    {eqForm.distributionType === 'Pistola/Lança' && (
                      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-4 animate-fade-in">
                        <span className="text-xs font-black text-[#114037] block">{t('exploration.lanceFields', 'Campos: Pistola / Lança')}</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.lanceCount', 'Número de pistolas/lanças')}</label>
                            <input type="text" placeholder="ex: 2" value={eqForm.lancesCount} onChange={(e) => setEqForm((p) => ({ ...p, lancesCount: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                            {renderFieldError('lancesCount')}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.equipment.hoseLengthM', 'Comprimento de mangueira (m)')}</label>
                            <input type="text" placeholder="ex: 50" value={eqForm.hoseLength} onChange={(e) => setEqForm((p) => ({ ...p, hoseLength: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                            {renderFieldError('hoseLength')}
                          </div>
                          <div>
                            {renderTriState(t('exploration.equipment.hoseReels', 'Enroladores'), eqForm.hasHoseReels, (v) => setEqForm((p) => ({ ...p, hasHoseReels: v })))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SE PNEUMÁTICO */}
                    {eqForm.distributionType === 'Pneumático' && (
                      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-4 animate-fade-in">
                        <span className="text-xs font-black text-[#114037] block">{t('exploration.pneumaticFields', 'Campos: Pneumático')}</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.pneumaticNozzlesCount', 'Número de bocais pneumáticos')}</label>
                            <input type="text" placeholder="ex: 8" value={eqForm.pneumaticNozzlesCount} onChange={(e) => setEqForm((p) => ({ ...p, pneumaticNozzlesCount: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                            {renderFieldError('pneumaticNozzlesCount')}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.nozzlesPerPneumaticOutlet', 'Número de bicos por bocal pneumático')}</label>
                            <input type="text" placeholder="ex: 2" value={eqForm.nozzlesPerPneumaticHead} onChange={(e) => setEqForm((p) => ({ ...p, nozzlesPerPneumaticHead: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                            {renderFieldError('nozzlesPerPneumaticHead')}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SE CANHÃO */}
                    {eqForm.distributionType === 'Canhão' && (
                      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-4 animate-fade-in">
                        <span className="text-xs font-black text-[#114037] block">{t('exploration.cannonFields', 'Campos: Canhão')}</span>
                        <div className="w-full sm:w-1/2">
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.nozzleClustersCount', 'Número de agrupamento de bicos')}</label>
                          <input type="text" placeholder="ex: 4" value={eqForm.cannonNozzleGroupsCount} onChange={(e) => setEqForm((p) => ({ ...p, cannonNozzleGroupsCount: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                          {renderFieldError('cannonNozzleGroupsCount')}
                        </div>
                      </div>
                    )}

                    {/* SE PAINÉIS */}
                    {eqForm.distributionType === 'Painéis' && (
                      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-4 animate-fade-in">
                        <span className="text-xs font-black text-[#114037] block">{t('exploration.panelsFields', 'Campos: Painéis')}</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.panelsCount', 'Número de painéis')}</label>
                            <input type="text" placeholder="ex: 4" value={eqForm.panelsCount} onChange={(e) => setEqForm((p) => ({ ...p, panelsCount: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                            {renderFieldError('panelsCount')}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.treatedRowsCount', 'Número de linhas tratadas simultaneamente')}</label>
                            <input type="text" placeholder="ex: 2" value={eqForm.simultaneousRowsCount} onChange={(e) => setEqForm((p) => ({ ...p, simultaneousRowsCount: e.target.value }))} className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono" />
                            {renderFieldError('simultaneousRowsCount')}
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
                    <span>{t('exploration.otherObservations', 'Outros e Observações')}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${accOutros ? 'rotate-180' : ''}`} />
                </button>

                {accOutros && (
                  <div className="p-5 bg-white space-y-4 animate-fade-in border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.inspectionDate', 'Data da Inspeção (Notificações)')}</label>
                        <input
                          type="date"
                          value={eqForm.inspectionDate}
                          onChange={(e) => setEqForm((p) => ({ ...p, inspectionDate: e.target.value }))}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.calibrationDate', 'Data da Calibração (Notificações)')}</label>
                        <input
                          type="date"
                          value={eqForm.calibrationDate}
                          onChange={(e) => setEqForm((p) => ({ ...p, calibrationDate: e.target.value }))}
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.notesObservations', 'Notas / Observações')}</label>
                      <textarea
                        rows={3}
                        placeholder={t('exploration.notesPlaceholder', 'Observações técnicas sobre manutenção ou inspeção...')}
                        value={eqForm.notes}
                        onChange={(e) => setEqForm((p) => ({ ...p, notes: e.target.value }))}
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
                <span>{t('exploration.equipment.saveEquipmentIndexedDb', 'Guardar Perfil de Equipamento no IndexedDB')}</span>
              </button>
            </form>

            {/* Listagem de Equipamentos Gravados */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">{t('exploration.equipment.registeredEquipment', 'Equipamentos Registados')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {equipments?.map(eq => {
                  const brandModel = [eq.manufacturer, eq.model].filter(Boolean).join(' ');
                  return (
                    <div key={eq.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block">{eq.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono-numbers block mt-0.5">
                          {brandModel ? `${brandModel} • ` : ''}{t('exploration.equipment.tankLabel', 'Depósito:')} {eq.tank_capacity_l} L{eq.distribution_type ? ` • ${t('exploration.equipment.distributionLabel', 'Distribuição:')} ${eq.distribution_type}` : ''}
                        </span>
                        {(eq.inspection_date || eq.calibration_date) && (
                          <span className="text-[10px] text-[#1D734B] font-mono-numbers block mt-1">
                            {[
                              eq.inspection_date ? `${t('exploration.equipment.inspectionLabel', 'Inspeção:')} ${eq.inspection_date}` : null,
                              eq.calibration_date ? `${t('exploration.equipment.calibrationLabel', 'Calibração:')} ${eq.calibration_date}` : null
                            ].filter(Boolean).join(' • ')}
                          </span>
                        )}
                        {eq.efficiency_correction_factor !== undefined && (
                          <span className="text-[10px] text-emerald-800 font-mono-numbers block mt-1 font-bold">
                            {t('exploration.equipment.technologyEfficiency', 'Eficácia da Tecnologia:')} {eq.efficiency_correction_factor} ({Math.round(eq.efficiency_correction_factor * 100)}%)
                          </span>
                        )}
                      </div>
                    <button
                      onClick={() => eq.id && effectiveUserId && deleteScopedProfile(effectiveUserId, 'equipment', eq.id)}
                      className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                      title={t('exploration.equipment.deleteEquipment', 'Eliminar equipamento')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  );
                })}
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
                  <h2 className="text-fluid-subtitle font-black text-[#114037]">{t('exploration.nozzlesCardTitle', 'Perfil — Bicos de Pulverização (ISO 10625)')}</h2>
                  <span className="text-xs text-slate-500 font-semibold block">{t('exploration.nozzlesCardSubtitle', 'Seleção de Fabricante, Modelo Reativo, Cor ISO e Débito Nominal')}</span>
                </div>
              </div>

              {/* Botão de Microlearning 'i' Ajuda */}
              <button
                type="button"
                onClick={() => openMicro('perfil_bicos')}
                className="px-3.5 min-h-[44px] bg-[#3CA64C]/10 hover:bg-[#3CA64C]/20 text-[#114037] font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 touch-target"
                title={t('exploration.guideNozzles', 'Guia: Diretrizes de Bicos')}
              >
                <Info className="w-4 h-4 text-[#3CA64C]" />
                <span>{t('common.help', 'Ajuda')}</span>
              </button>
            </div>

            <form onSubmit={handleSaveNozzle} className="space-y-8">
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B]">
                  {t('exploration.nozzles.specsTitle', 'Especificações do Bico')}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.nozzles.associatedEquipment', 'Equipamento Associado')}</label>
                    <select
                      value={nozzleForm.equipmentId}
                      onChange={(e) => setNozzleForm((p) => ({ ...p, equipmentId: e.target.value }))}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    >
                      <option value="">{t('exploration.nozzles.selectEquipmentPlaceholder', 'Selecione um equipamento...')}</option>
                      {equipments?.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.name} ({eq.tank_capacity_l} L)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.nozzles.manufacturer', 'Fabricante do Bico')}</label>
                    <select
                      value={nozzleForm.manufacturer}
                      onChange={(e) => handleManufacturerChange(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    >
                      <option value="">{t('exploration.nozzles.selectManufacturerPlaceholder', 'Selecione o fabricante...')}</option>
                      <option value="Albuz">Albuz</option>
                      <option value="Lechler">Lechler</option>
                      <option value="Hardi">Hardi</option>
                      <option value="ASJ">ASJ</option>
                      <option value="Teejet">Teejet</option>
                    </select>
                    {renderFieldError('manufacturer')}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('exploration.nozzles.modelLabel', 'Modelo (Reativo ao Fabricante)')}
                    </label>
                    <select
                      value={nozzleForm.model}
                      onChange={(e) => setNozzleForm((p) => ({ ...p, model: e.target.value }))}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    >
                      <option value="">{t('exploration.nozzles.selectModelPlaceholder', 'Selecione o modelo...')}</option>
                      {(NOZZLE_MODELS_BY_MANUFACTURER[nozzleForm.manufacturer] || []).map(mod => (
                        <option key={mod} value={mod}>{mod}</option>
                      ))}
                    </select>
                    {renderFieldError('model')}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.isoColorCode', 'Cor (Código ISO 10625)')}</label>
                    <select
                      value={nozzleForm.color}
                      onChange={(e) => setNozzleForm((p) => ({ ...p, color: e.target.value }))}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    >
                      <option value="">{t('exploration.nozzles.selectColorPlaceholder', 'Selecione a cor...')}</option>
                      {NOZZLE_COLORS.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    {renderFieldError('color')}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.nozzles.typeLabel', 'Tipo de Bico')}</label>
                    <select
                      value={nozzleForm.nozzleType}
                      onChange={(e) => setNozzleForm((p) => ({ ...p, nozzleType: e.target.value }))}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    >
                      <option value="">{t('exploration.nozzles.selectTypePlaceholder', 'Selecione o tipo...')}</option>
                      <option value="Cone Oco">{t('exploration.nozzles.types.hollowCone', 'Cone Oco')}</option>
                      <option value="Cone Cheio">{t('exploration.nozzles.types.fullCone', 'Cone Cheio')}</option>
                      <option value="Injeção de Ar">{t('exploration.nozzles.types.airInjection', 'Injeção de Ar (Anti-deriva)')}</option>
                      <option value="Leque Standard">{t('exploration.nozzles.types.standardFlatFan', 'Leque Standard')}</option>
                      <option value="Defletor">{t('exploration.nozzles.types.deflector', 'Defletor')}</option>
                    </select>
                    {renderFieldError('nozzleType')}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.nozzles.declaredClassLabel', 'Classificação declarada (opcional)')}</label>
                    <input
                      type="text"
                      placeholder={t('exploration.nozzles.isoOptionalPlaceholder', 'Opcional (sem certificação automática)')}
                      value={nozzleForm.isoClassification}
                      onChange={(e) => setNozzleForm((p) => ({ ...p, isoClassification: e.target.value }))}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {nozzleForm.nozzleType !== 'Defletor' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.nozzles.sprayAngleLabel', 'Ângulo do jato (opcional)')}</label>
                      <input
                        type="text"
                        list="daterra-spray-angle-presets"
                        placeholder={t('exploration.nozzles.sprayAnglePlaceholder', 'ex: 80° (opcional)')}
                        value={nozzleForm.sprayAngle}
                        onChange={(e) => setNozzleForm((p) => ({ ...p, sprayAngle: e.target.value }))}
                        className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                      />
                      <datalist id="daterra-spray-angle-presets">
                        <option value="40°" /><option value="60°" /><option value="65°" /><option value="80°" /><option value="90°" /><option value="95°" /><option value="110°" /><option value="120°" />
                      </datalist>
                      {renderFieldError('sprayAngle')}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.workingPressureBar', 'Pressão de Trabalho (bar)')}</label>
                    <input
                      type="text"
                      placeholder="ex: 10,0"
                      value={nozzleForm.workingPressureBar}
                      onChange={(e) => setNozzleForm((p) => ({ ...p, workingPressureBar: e.target.value }))}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                    {renderFieldError('workingPressureBar')}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.nominalFlowRate', 'Débito Nominal (L/min)')}</label>
                    <input
                      type="text"
                      placeholder="ex: 1,03"
                      value={nozzleForm.nominalFlowLmin}
                      onChange={(e) => setNozzleForm((p) => ({ ...p, nominalFlowLmin: e.target.value }))}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                    {renderFieldError('nominalFlowLmin')}
                  </div>
                </div>
              </div>

              {/* Botão de Ação Principal (Verde Destaque #3CA64C) */}
              <button
                type="submit"
                className="w-full min-h-[48px] bg-[#3CA64C] hover:bg-[#3AAA35] text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 touch-target"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>{t('exploration.nozzles.addNozzleIndexedDb', 'Adicionar Bico ao IndexedDB')}</span>
              </button>
            </form>

            {/* Listagem de Bicos Gravados */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">{t('exploration.nozzles.registeredNozzles', 'Bicos Registados')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {nozzles?.map(nz => (
                  <div key={nz.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">
                        {nz.manufacturer} {nz.model} ({nz.color})
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono-numbers block mt-0.5">
                        {nz.nozzle_type}{nz.spray_angle ? ` • ${nz.spray_angle}` : ''}{nz.iso_classification ? ` • ${nz.iso_classification}` : ''} • {String(nz.working_pressure_bar).replace('.', ',')} bar • {String(nz.nominal_flow_lmin).replace('.', ',')} L/min
                      </span>
                    </div>
                    <button
                      onClick={() => nz.id && effectiveUserId && deleteScopedProfile(effectiveUserId, 'nozzles', nz.id)}
                      className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                      title={t('exploration.nozzles.deleteNozzle', 'Eliminar bico')}
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
                  <h2 className="text-fluid-subtitle font-black text-[#114037]">{t('exploration.calibrationCardTitle', 'Perfil — Calibração & Ensaio em Branco')}</h2>
                  <span className="text-xs text-slate-500 font-semibold block">{t('exploration.calibrationCardSubtitle', 'Medição de Débito e Cálculo do Volume de Calda (L/ha)')}</span>
                </div>
              </div>

              {/* Botão de Microlearning 'i' Ajuda */}
              <button
                type="button"
                onClick={() => openMicro('perfil_calibracao')}
                className="px-3.5 min-h-[44px] bg-[#3CA64C]/10 hover:bg-[#3CA64C]/20 text-[#114037] font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 touch-target"
                title={t('exploration.guideCalibration', 'Guia: Diretrizes de Calibração')}
              >
                <Info className="w-4 h-4 text-[#3CA64C]" />
                <span>{t('common.help', 'Ajuda')}</span>
              </button>
            </div>

            <form onSubmit={handleSaveCalibration} className="space-y-8">
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B]">
                  {t('exploration.calibration.testParams', 'Parâmetros do Ensaio')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.calibration.associatedEquipment', 'Equipamento Associado')}</label>
                    <select
                      value={calibForm.equipmentId}
                      onChange={(e) => setCalibForm((p) => ({ ...p, equipmentId: e.target.value, nozzleId: '' }))}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    >
                      <option value="">{t('exploration.calibration.selectEquipmentPlaceholder', 'Selecione um equipamento...')}</option>
                      {equipments?.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.name} ({eq.tank_capacity_l} L)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.calibration.associatedNozzle', 'Bico Associado')}</label>
                    <select
                      value={calibForm.nozzleId}
                      onChange={(e) => setCalibForm((p) => ({ ...p, nozzleId: e.target.value }))}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    >
                      <option value="">{t('exploration.calibration.selectNozzlePlaceholder', 'Selecione um bico...')}</option>
                      {nozzles
                        ?.filter((nz) => !calibForm.equipmentId || !nz.equipment_id || String(nz.equipment_id) === calibForm.equipmentId)
                        .map(nz => (
                          <option key={nz.id} value={nz.id}>{nz.manufacturer} {nz.model} ({nz.color})</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.calibration.speedKmh', 'Velocidade (km/h)')}</label>
                    <input
                      type="text"
                      placeholder="ex: 6,5"
                      value={calibForm.workingSpeedKmh}
                      onChange={(e) => setCalibForm((p) => ({ ...p, workingSpeedKmh: e.target.value }))}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                    {renderFieldError('workingSpeedKmh')}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.pressureBar', 'Pressão (bar)')}</label>
                    <input
                      type="text"
                      placeholder="ex: 10,0"
                      value={calibForm.workingPressureBar}
                      onChange={(e) => setCalibForm((p) => ({ ...p, workingPressureBar: e.target.value }))}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                    {renderFieldError('workingPressureBar')}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.calibration.workingWidthM', 'Largura Trabalho (m)')}</label>
                    <input
                      type="text"
                      placeholder="ex: 2,2"
                      value={calibForm.workingWidthM}
                      onChange={(e) => setCalibForm((p) => ({ ...p, workingWidthM: e.target.value }))}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                    {renderFieldError('workingWidthM')}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.totalFlowRate', 'Débito Total (L/min)')}</label>
                    <input
                      type="text"
                      placeholder="ex: 12,36"
                      value={calibForm.totalFlowLmin}
                      onChange={(e) => setCalibForm((p) => ({ ...p, totalFlowLmin: e.target.value }))}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                    {renderFieldError('totalFlowLmin')}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.calibration.activeNozzlesOptional', 'Nº Bicos Ativos (opcional)')}</label>
                    <input
                      type="text"
                      placeholder="ex: 12"
                      value={calibForm.activeNozzlesCount}
                      onChange={(e) => setCalibForm((p) => ({ ...p, activeNozzlesCount: e.target.value }))}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                    {renderFieldError('activeNozzlesCount')}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.calibration.dropletSizeOptional', 'Tamanho Gota (µm, opcional)')}</label>
                    <input
                      type="text"
                      placeholder="ex: 180"
                      value={calibForm.dropletSizeUm}
                      onChange={(e) => setCalibForm((p) => ({ ...p, dropletSizeUm: e.target.value }))}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                    {renderFieldError('dropletSizeUm')}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.calibration.airVelocityOptional', 'Velocidade Ar (m/s, opcional)')}</label>
                    <input
                      type="text"
                      placeholder="ex: 28"
                      value={calibForm.airVelocityMs}
                      onChange={(e) => setCalibForm((p) => ({ ...p, airVelocityMs: e.target.value }))}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                    {renderFieldError('airVelocityMs')}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exploration.calibration.airVolumeOptional', 'Volume Ar (m³/h, opcional)')}</label>
                    <input
                      type="text"
                      placeholder="ex: 35000"
                      value={calibForm.airVolumeM3h}
                      onChange={(e) => setCalibForm((p) => ({ ...p, airVolumeM3h: e.target.value }))}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                    {renderFieldError('airVolumeM3h')}
                  </div>
                </div>
              </div>

              {/* Caixa de Resultados Calculados (JetBrains Mono para os números, sem defaults fictícios) */}
              <div className="p-5 bg-[#eef8f0] border border-[#3CA64C]/30 rounded-2xl space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">{t('exploration.calibration.calculatedResultsTitle', 'Resultados Calculados do Volume de Calda')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[11px] text-[#1D734B] font-bold block">{t('exploration.calibration.calculatedVolumeLabel', 'Volume de Calda Calculado:')}</span>
                    <span className="text-2xl font-black text-[#114037] font-mono-numbers">
                      {(() => {
                        const vol = computeSprayVolumeLha(calibForm.workingSpeedKmh, calibForm.workingWidthM, calibForm.totalFlowLmin);
                        return vol !== null ? `${vol.toFixed(2).replace('.', ',')} L/ha` : '—';
                      })()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#1D734B] font-bold block">{t('exploration.calibration.airSpeedLabel', 'Velocidade Fluxo de Ar:')}</span>
                    <span className="text-base font-bold text-[#114037] font-mono-numbers">
                      {parsePositiveFloat(calibForm.airVelocityMs) !== null
                        ? `${calibForm.airVelocityMs.trim()} m/s`
                        : t('exploration.options.unspecified', 'Não indicado')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#1D734B] font-bold block">{t('exploration.calibration.airVolumeLabel', 'Volume Fluxo de Ar:')}</span>
                    <span className="text-base font-bold text-[#114037] font-mono-numbers">
                      {parsePositiveFloat(calibForm.airVolumeM3h) !== null
                        ? `${calibForm.airVolumeM3h.trim()} m³/h`
                        : t('exploration.options.unspecified', 'Não indicado')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão de Ação Principal (Verde Destaque #3CA64C) */}
              <button
                type="submit"
                className="w-full min-h-[48px] bg-[#3CA64C] hover:bg-[#3AAA35] text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 touch-target"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>{t('exploration.saveCalibrationIndexedDb', 'Gravar Ficha de Calibração no IndexedDB')}</span>
              </button>
            </form>

            {/* Listagem de Calibrações Gravadas */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">{t('exploration.registeredCalibrations', 'Fichas de Calibração Registadas')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {calibrations?.map(cl => (
                  <div key={cl.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">
                        {t('exploration.calibration.calibratedVolume', 'Volume Calibrado:')} {String(cl.calculated_spray_volume_lha).replace('.', ',')} L/ha
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono-numbers block mt-0.5">
                        {t('exploration.calibration.speed', 'Velocidade:')} {String(cl.working_speed_kmh).replace('.', ',')} km/h • {t('exploration.calibration.pressure', 'Pressão:')} {String(cl.working_pressure_bar).replace('.', ',')} bar • {t('exploration.calibration.flow', 'Débito:')} {String(cl.total_flow_lmin).replace('.', ',')} L/min{cl.active_nozzles_count !== undefined ? ` • ${cl.active_nozzles_count} ${t('exploration.calibration.nozzlesSuffix', 'bicos')}` : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => cl.id && effectiveUserId && deleteScopedProfile(effectiveUserId, 'calibrations', cl.id)}
                      className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                      title={t('exploration.deleteCalibration', 'Eliminar calibração')}
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
