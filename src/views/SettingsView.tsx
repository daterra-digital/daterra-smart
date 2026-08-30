import React, { useState, useEffect, type FormEvent } from 'react';
import { 
  User, Bell, Database, HelpCircle, Info, 
  Download, Upload, CheckCircle2, 
  AlertTriangle, Globe, ShieldAlert
} from 'lucide-react';
import { db } from '../db/db';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage, LANGUAGE_OPTIONS, type SupportedLanguage } from '../context/LanguageContext';
import { MicrolearningModal } from '../components/MicrolearningModal';
import type { Profile } from '../types/profile';

type SettingsSubmenu = 'perfil' | 'preferencias' | 'notificacoes' | 'gestao_dados' | 'ajuda' | 'sobre';

export const SettingsView: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [activeSubmenu, setActiveSubmenu] = useState<SettingsSubmenu>('perfil');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Microlearning Modal State
  const [microModalOpen, setMicroModalOpen] = useState(false);
  const [activeMicroKey, setActiveMicroKey] = useState('');

  const openMicro = (key: string) => {
    setActiveMicroKey(key);
    setMicroModalOpen(true);
  };

  // ---------------------------------------------------------------------------
  // ESTADOS 1: PERFIL DO UTILIZADOR (SUPABASE public.profiles)
  // ---------------------------------------------------------------------------
  // Estado para o perfil carregado da BD
  const [profile, setProfile] = useState<Profile | null>(null);

  // Estado para o snapshot original (usado no Cancelar)
  const [originalProfile, setOriginalProfile] = useState<Profile | null>(null);

  // Estados de UI
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados locais dos campos do formulário
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [nif, setNif] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');

  // Carregar perfil ao montar ou quando user.id alterar
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!user?.id) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        setIsLoadingProfile(true);
        setErrorMessage(null);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          if (!cancelled) {
            setErrorMessage('Não foi possível carregar o perfil. Tente novamente.');
            setIsLoadingProfile(false);
          }
          return;
        }

        if (!data) {
          if (!cancelled) {
            setErrorMessage('Perfil não encontrado. Contacte o suporte.');
            setIsLoadingProfile(false);
          }
          return;
        }

        if (!cancelled) {
          setProfile(data);
          setOriginalProfile(data);
          setIsLoadingProfile(false);
        }
      } catch {
        if (!cancelled) {
          setErrorMessage('Erro de ligação ao carregar o perfil.');
          setIsLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Sincronizar estados locais quando o perfil carregar
  useEffect(() => {
    if (!profile) return;

    setFirstName(profile.first_name ?? '');
    setLastName(profile.last_name ?? '');
    setEmail(profile.email ?? '');
    setMobile(profile.phone ?? '');
    setCompany(profile.company_name ?? '');
    setRole(profile.role ?? '');
    setJobTitle(profile.job_title ?? '');
    setNif(profile.nif ?? '');
    setAddress(profile.address ?? '');
    setPostalCode(profile.postal_code ?? '');
    setCity(profile.city ?? '');
  }, [profile]);

  // ---------------------------------------------------------------------------
  // ESTADOS 2: PREFERÊNCIAS & UNIDADES PADRÃO
  // ---------------------------------------------------------------------------
  const [selectedUnitsProfile, setSelectedUnitsProfile] = useState<string>('si');
  const [appTheme, setAppTheme] = useState<'mono' | 'light' | 'dark'>(() => {
    return (localStorage.getItem('daterra_theme') as 'mono' | 'light' | 'dark') || 'mono';
  });

  const handleThemeChange = (newTheme: 'mono' | 'light' | 'dark') => {
    setAppTheme(newTheme);
    localStorage.setItem('daterra_theme', newTheme);
    const favicon = document.getElementById('app-favicon') as HTMLLinkElement | null;
    if (favicon) {
      if (newTheme === 'light') favicon.href = './icon-daterra-light.png';
      else if (newTheme === 'dark') favicon.href = './icon-daterra-dark.png';
      else favicon.href = './icon-daterra-mono.png';
    }
  };

  // ---------------------------------------------------------------------------
  // ESTADOS 3: NOTIFICAÇÕES
  // ---------------------------------------------------------------------------
  const [masterNotifications, setMasterNotifications] = useState(true);

  // ---------------------------------------------------------------------------
  // HANDLERS DE AÇÕES
  // ---------------------------------------------------------------------------
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setErrorMessage('Utilizador não autenticado.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const payload = {
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        phone: mobile.trim() || null,
        company_name: company.trim() || null,
        role: role.trim() || null,
        job_title: jobTitle.trim() || null,
        nif: nif.trim() || null,
        address: address.trim() || null,
        postal_code: postalCode.trim() || null,
        city: city.trim() || null,
      };

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id);

      if (error) {
        setErrorMessage('Não foi possível guardar o perfil. Tente novamente.');
        setIsSaving(false);
        return;
      }

      const updatedProfile = originalProfile
        ? { ...originalProfile, ...payload }
        : null;
      setOriginalProfile(updatedProfile);

      if (refreshProfile) {
        await refreshProfile();
      }

      setFeedbackMsg('Perfil de Utilizador atualizado com sucesso!');
      setTimeout(() => setFeedbackMsg(''), 3500);
      setIsSaving(false);

    } catch {
      setErrorMessage('Erro de ligação ao guardar o perfil.');
      setIsSaving(false);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg('Preferências e Unidades Padrão guardadas!');
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg('Preferências de Notificação guardadas com sucesso!');
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  // ZONA DE PERIGO - Ações Destrutivas
  const handleDeleteCultures = async () => {
    if (window.confirm('Tem a certeza que deseja apagar TODOS os perfis de cultura? Esta ação é irreversível.')) {
      await db.profiles_cultures.clear();
      setFeedbackMsg('Perfis de cultura eliminados com sucesso.');
      setTimeout(() => setFeedbackMsg(''), 3500);
    }
  };

  const handleDeleteEquipments = async () => {
    if (window.confirm('Tem a certeza que deseja apagar TODOS os perfis de equipamento? Esta ação é irreversível.')) {
      await db.profiles_equipment.clear();
      setFeedbackMsg('Perfis de equipamento eliminados com sucesso.');
      setTimeout(() => setFeedbackMsg(''), 3500);
    }
  };

  const handleDeleteNozzles = async () => {
    if (window.confirm('Tem a certeza que deseja apagar TODOS os bicos guardados? Esta ação é irreversível.')) {
      await db.profiles_nozzles.clear();
      setFeedbackMsg('Perfis de bicos eliminados com sucesso.');
      setTimeout(() => setFeedbackMsg(''), 3500);
    }
  };

  const handleDeleteCalibrations = async () => {
    if (window.confirm('Tem a certeza que deseja apagar TODAS as fichas de calibração? Esta ação é irreversível.')) {
      await db.profiles_calibrations.clear();
      setFeedbackMsg('Fichas de calibração eliminadas com sucesso.');
      setTimeout(() => setFeedbackMsg(''), 3500);
    }
  };

  const handleDeleteAllData = async () => {
    if (window.confirm('ATENÇÃO CRÍTICA: Deseja apagar TODOS os dados da exploração do IndexedDB? Esta ação não pode ser desfeita!')) {
      await db.profiles_cultures.clear();
      await db.profiles_equipment.clear();
      await db.profiles_nozzles.clear();
      await db.profiles_calibrations.clear();
      setFeedbackMsg('Todos os dados da plataforma foram eliminados do IndexedDB local.');
      setTimeout(() => setFeedbackMsg(''), 3500);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* CABEÇALHO PRINCIPAL DAS DEFINIÇÕES (Verde Principal #114037) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#1D734B] block mb-1">
            {t('nav.settings')}
          </span>
          <h1 className="text-fluid-title font-black text-[#114037]">
            {t('settings.title')}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('settings.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-100 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-xs font-extrabold font-mono-numbers">
          <User className="w-4 h-4 text-[#1D734B]" />
          <span>ID: {user?.id || 'A carregar...'}</span>
        </div>
      </div>

      {/* Alerta de Feedback de Sucesso */}
      {feedbackMsg && (
        <div className="p-4 bg-[#3CA64C] text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* NAVEGAÇÃO REVELAÇÃO PROGRESSIVA: SUB-MENUS (Mobile-First 48px Touch Targets) */}
      <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubmenu('perfil')}
          className={`px-4 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 touch-target ${
            activeSubmenu === 'perfil'
              ? 'bg-[#114037] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4 text-[#3CA64C]" />
          <span>{t('settings.tabs.profile')}</span>
        </button>

        <button
          onClick={() => setActiveSubmenu('preferencias')}
          className={`px-4 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 touch-target ${
            activeSubmenu === 'preferencias'
              ? 'bg-[#114037] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Globe className="w-4 h-4 text-[#3CA64C]" />
          <span>{t('settings.tabs.preferences')}</span>
        </button>

        <button
          onClick={() => setActiveSubmenu('notificacoes')}
          className={`px-4 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 touch-target ${
            activeSubmenu === 'notificacoes'
              ? 'bg-[#114037] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bell className="w-4 h-4 text-[#3CA64C]" />
          <span>{t('settings.tabs.notifications')}</span>
        </button>

        <button
          onClick={() => setActiveSubmenu('gestao_dados')}
          className={`px-4 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 touch-target ${
            activeSubmenu === 'gestao_dados'
              ? 'bg-[#114037] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4 text-[#3CA64C]" />
          <span>{t('settings.tabs.dataManagement')}</span>
        </button>

        <button
          onClick={() => setActiveSubmenu('ajuda')}
          className={`px-4 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 touch-target ${
            activeSubmenu === 'ajuda'
              ? 'bg-[#114037] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-[#3CA64C]" />
          <span>{t('settings.tabs.help')}</span>
        </button>

        <button
          onClick={() => setActiveSubmenu('sobre')}
          className={`px-4 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 touch-target ${
            activeSubmenu === 'sobre'
              ? 'bg-[#114037] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Info className="w-4 h-4 text-[#3CA64C]" />
          <span>{t('settings.tabs.about')}</span>
        </button>
      </div>


      {/* ========================================================================= */}
      {/* SUB-MENU 1: PERFIL DO UTILIZADOR                                        */}
      {/* ========================================================================= */}
      {activeSubmenu === 'perfil' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-8">
            <h2 className="text-fluid-subtitle font-black text-[#114037] border-b border-slate-100 pb-4">
              Definições — Perfil do Utilizador
            </h2>

            {/* Indicadores de Loading / Erro */}
            {isLoadingProfile && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-800 animate-pulse">
                A carregar perfil…
              </div>
            )}

            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-800 animate-fade-in">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-8">
              {/* CARTÃO 1: Dados Pessoais */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B]">
                  Dados do Perfil do Utilizador
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nome Próprio</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoadingProfile || isSaving}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Apelido</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoadingProfile || isSaving}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Endereço de E-mail</label>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      disabled
                      className="w-full min-h-[48px] px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed outline-none"
                    />
                    <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                      O endereço de email está associado à sua autenticação segura e não pode ser alterado diretamente aqui.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Telemóvel</label>
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      disabled={isLoadingProfile || isSaving}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C] disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* CARTÃO 2: Informação Profissional e Morada */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B]">
                  Informação Profissional e Morada
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Empresa</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      disabled={isLoadingProfile || isSaving}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Função</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={isLoadingProfile || isSaving}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Cargo</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      disabled={isLoadingProfile || isSaving}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">NIF</label>
                    <input
                      type="text"
                      value={nif}
                      onChange={(e) => setNif(e.target.value)}
                      disabled={isLoadingProfile || isSaving}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Morada</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={isLoadingProfile || isSaving}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Código-Postal</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      disabled={isLoadingProfile || isSaving}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Localidade</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={isLoadingProfile || isSaving}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C] disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação: Cancelar e Guardar */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!originalProfile) return;
                    setFirstName(originalProfile.first_name ?? '');
                    setLastName(originalProfile.last_name ?? '');
                    setMobile(originalProfile.phone ?? '');
                    setCompany(originalProfile.company_name ?? '');
                    setRole(originalProfile.role ?? '');
                    setJobTitle(originalProfile.job_title ?? '');
                    setNif(originalProfile.nif ?? '');
                    setAddress(originalProfile.address ?? '');
                    setPostalCode(originalProfile.postal_code ?? '');
                    setCity(originalProfile.city ?? '');
                    setErrorMessage(null);
                  }}
                  disabled={isSaving || isLoadingProfile}
                  className="w-full sm:w-auto px-6 min-h-[48px] border border-slate-300 rounded-2xl font-bold text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-all touch-target"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isLoadingProfile}
                  className="w-full sm:w-auto px-8 min-h-[48px] bg-[#3CA64C] hover:bg-[#359445] text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 touch-target"
                >
                  <span>{isSaving ? 'A guardar…' : 'Guardar Alterações do Perfil'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MENU 2: PREFERÊNCIAS (Unidades Padrão com Dica UI de Unidades)         */}
      {/* ========================================================================= */}
      {activeSubmenu === 'preferencias' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-fluid-subtitle font-black text-[#114037]">
                Definições — Preferências & Unidades Padrão
              </h2>
              
              {/* Botão de Microlearning 'i' Ajuda */}
              <button
                type="button"
                onClick={() => openMicro('preferencias_unidades')}
                className="px-3.5 min-h-[44px] bg-[#3CA64C]/10 hover:bg-[#3CA64C]/20 text-[#114037] font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 touch-target"
                title="Microlearning: Unidades Padrão"
              >
                <Info className="w-4 h-4 text-[#3CA64C]" />
                <span>Ajuda</span>
              </button>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-8">
              {/* Idioma e Região */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B]">
                  {t('settings.languageAndRegion')}
                </h3>
                <div className="w-full sm:w-1/2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('settings.interfaceLanguage')}</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                    className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                  >
                    {LANGUAGE_OPTIONS.map(opt => (
                      <option key={opt.code} value={opt.code}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ícones da Aplicação Móvel & PWA */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B]">
                      Ícones da Aplicação Móvel (PWA & Ecrã de Início)
                    </h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Exclusivo Mobile
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Estes ícones são exclusivos para a aplicação instalada em smartphones e tablets. Nos navegadores web, o ícone de separador é fixo através do favicon oficial DATERRA.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Opção 1: Monocromático (Padrão) */}
                  <div
                    onClick={() => handleThemeChange('mono')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-3 touch-target ${
                      appTheme === 'mono'
                        ? 'bg-emerald-50/70 border-[#3CA64C] shadow-soft'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src="./icon-daterra-mono.png" alt="Ícone Monocromático" className="w-12 h-12 rounded-xl shadow-sm object-contain" />
                    <div>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-extrabold text-slate-900 text-xs">Monocromático</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Padrão</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        Ícone neutro monocromático oficial (Ativo por defeito).
                      </p>
                    </div>
                  </div>

                  {/* Opção 2: Light Mode */}
                  <div
                    onClick={() => handleThemeChange('light')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-3 touch-target ${
                      appTheme === 'light'
                        ? 'bg-emerald-50/70 border-[#3CA64C] shadow-soft'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src="./icon-daterra-light.png" alt="Ícone Modo Claro" className="w-12 h-12 rounded-xl shadow-sm object-contain" />
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs">Modo Claro (Light)</span>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        Alto contraste diurno para leitura no campo sob sol intenso.
                      </p>
                    </div>
                  </div>

                  {/* Opção 3: Dark Mode */}
                  <div
                    onClick={() => handleThemeChange('dark')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-3 touch-target ${
                      appTheme === 'dark'
                        ? 'bg-emerald-50/70 border-[#3CA64C] shadow-soft'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src="./icon-daterra-dark.png" alt="Ícone Modo Escuro" className="w-12 h-12 rounded-xl shadow-sm object-contain" />
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs">Modo Escuro (Dark)</span>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        Otimizado para operações agronómicas noturnas na cabine.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* OS 4 PERFIS DE UNIDADES PADRÃO (Com Dica de UI de 3-4 unidades em cinzento) */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B]">
                  Perfis de Unidades de Medida Padrão
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Perfil 1: Sistema Métrico Internacional */}
                  <label
                    onClick={() => setSelectedUnitsProfile('si')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 touch-target ${
                      selectedUnitsProfile === 'si'
                        ? 'bg-emerald-50/70 border-[#3CA64C] shadow-soft'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs">Sistema Métrico Internacional (SI)</span>
                        <span className="text-xs text-slate-600 font-mono-numbers">(ha, kg, L, bar)</span>
                      </div>
                      <input
                        type="radio"
                        name="units"
                        checked={selectedUnitsProfile === 'si'}
                        onChange={() => setSelectedUnitsProfile('si')}
                        className="w-4 h-4 text-[#3CA64C] accent-[#3CA64C]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Padrão oficial utilizado na Europa, Brasil e na maior parte do mundo. Aplica hectares para área, quilogramas/litros para massa e volume, e bar para pressão.
                    </p>
                  </label>

                  {/* Perfil 2: Sistema Imperial / Americano */}
                  <label
                    onClick={() => setSelectedUnitsProfile('us')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 touch-target ${
                      selectedUnitsProfile === 'us'
                        ? 'bg-emerald-50/70 border-[#3CA64C] shadow-soft'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs">Sistema Imperial / Americano (US)</span>
                        <span className="text-xs text-slate-600 font-mono-numbers">(ac, bu, gal, psi)</span>
                      </div>
                      <input
                        type="radio"
                        name="units"
                        checked={selectedUnitsProfile === 'us'}
                        onChange={() => setSelectedUnitsProfile('us')}
                        className="w-4 h-4 text-[#3CA64C] accent-[#3CA64C]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Ideal para utilizadores nos EUA ou para quem opera maquinaria agrícola americana. Converte dados para acres, bushels, galões e libras por polegada quadrada (PSI).
                    </p>
                  </label>

                  {/* Perfil 3: Sistema Misto Anglo-Saxónico */}
                  <label
                    onClick={() => setSelectedUnitsProfile('uk')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 touch-target ${
                      selectedUnitsProfile === 'uk'
                        ? 'bg-emerald-50/70 border-[#3CA64C] shadow-soft'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs">Sistema Misto Anglo-Saxónico (UK / CA / AU)</span>
                        <span className="text-xs text-slate-600 font-mono-numbers">(ha, L, bu, lb)</span>
                      </div>
                      <input
                        type="radio"
                        name="units"
                        checked={selectedUnitsProfile === 'uk'}
                        onChange={() => setSelectedUnitsProfile('uk')}
                        className="w-4 h-4 text-[#3CA64C] accent-[#3CA64C]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Configuração comum no Reino Unido, Canadá e Austrália. Combina hectares e litros com unidades imperiais como bushels e libras.
                    </p>
                  </label>

                  {/* Perfil 4: Sistema Regional Tradicional */}
                  <label
                    onClick={() => setSelectedUnitsProfile('trad')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 touch-target ${
                      selectedUnitsProfile === 'trad'
                        ? 'bg-emerald-50/70 border-[#3CA64C] shadow-soft'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs">Sistema Regional Tradicional (Ibérico / LatAm)</span>
                        <span className="text-xs text-slate-600 font-mono-numbers">(alq, @, qtl)</span>
                      </div>
                      <input
                        type="radio"
                        name="units"
                        checked={selectedUnitsProfile === 'trad'}
                        onChange={() => setSelectedUnitsProfile('trad')}
                        className="w-4 h-4 text-[#3CA64C] accent-[#3CA64C]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Indicado para pequenas e médias explorações focadas no comércio local tradicional. Inclui suporte a alqueire, arroba e quintal.
                    </p>
                  </label>
                </div>
              </div>

              {/* Botão de Ação Principal (Verde Destaque #3CA64C) */}
              <button
                type="submit"
                className="w-full min-h-[48px] bg-[#3CA64C] hover:bg-[#3AAA35] text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 touch-target"
              >
                <span>Guardar Preferências e Unidades Padrão</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MENU 4: GESTÃO DE DADOS & ZONA DE PERIGO (ALERTA VERMELHO DESTACADO)   */}
      {/* ========================================================================= */}
      {activeSubmenu === 'gestao_dados' && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-8">
            <h2 className="text-fluid-subtitle font-black text-[#114037] border-b border-slate-100 pb-4">
              Definições — Gestão de Dados e Cópia de Segurança
            </h2>

            {/* Exportar e Importar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B] flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#3CA64C]" />
                  <span>Exportar Dados da Exploração</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Descarregue uma cópia de segurança completa em JSON ou exporte relatórios em CSV.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button className="px-4 min-h-[44px] bg-[#114037] hover:bg-[#0d332c] text-white font-bold text-xs rounded-xl transition-all touch-target">
                    Exportar JSON
                  </button>
                  <button className="px-4 min-h-[44px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all touch-target">
                    Exportar CSV
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B] flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#3CA64C]" />
                  <span>Importar Ficheiro de Perfis</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Restaure os seus perfis de cultura, atomizadores e bicos através de um ficheiro prévio.
                </p>
                <button className="px-4 min-h-[44px] bg-[#3CA64C] hover:bg-[#3AAA35] text-white font-bold text-xs rounded-xl transition-all touch-target">
                  Selecionar Ficheiro JSON
                </button>
              </div>
            </div>

            {/* ZONA DE PERIGO COM CONTRASTE ALTÍSSIMO DE ALERTA VERMELHO */}
            <div className="bg-rose-50 border-2 border-rose-300 p-6 sm:p-8 rounded-3xl space-y-6 shadow-soft">
              <div className="flex items-center gap-3 border-b border-rose-200 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-black text-rose-900 flex items-center gap-2">
                    <span>Zona de Perigo — Ações Destrutivas Irreversíveis</span>
                  </h3>
                  <p className="text-xs text-rose-700 font-semibold mt-0.5">
                    As operações abaixo eliminam dados do armazenamento local IndexedDB sem possibilidade de recuperação.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={handleDeleteCultures}
                  className="p-4 bg-white border border-rose-200 hover:border-rose-400 rounded-2xl text-left transition-all hover:bg-rose-50/50 touch-target"
                >
                  <span className="font-extrabold text-rose-900 text-xs block">Apagar Perfis de Cultura</span>
                  <span className="text-[11px] text-rose-600 block mt-1 font-medium">Remove todas as parcelas</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteEquipments}
                  className="p-4 bg-white border border-rose-200 hover:border-rose-400 rounded-2xl text-left transition-all hover:bg-rose-50/50 touch-target"
                >
                  <span className="font-extrabold text-rose-900 text-xs block">Apagar Equipamentos</span>
                  <span className="text-[11px] text-rose-600 block mt-1 font-medium">Remove atomizadores ISO</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteNozzles}
                  className="p-4 bg-white border border-rose-200 hover:border-rose-400 rounded-2xl text-left transition-all hover:bg-rose-50/50 touch-target"
                >
                  <span className="font-extrabold text-rose-900 text-xs block">Apagar Perfis de Bicos</span>
                  <span className="text-[11px] text-rose-600 block mt-1 font-medium">Remove os bicos de jato</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteCalibrations}
                  className="p-4 bg-white border border-rose-200 hover:border-rose-400 rounded-2xl text-left transition-all hover:bg-rose-50/50 touch-target"
                >
                  <span className="font-extrabold text-rose-900 text-xs block">Apagar Calibrações</span>
                  <span className="text-[11px] text-rose-600 block mt-1 font-medium">Remove ensaios hidráulicos</span>
                </button>
              </div>

              {/* Botão Vermelho Crítico Apagar Tudo */}
              <div className="pt-4 border-t border-rose-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleDeleteAllData}
                  className="w-full sm:w-auto px-6 min-h-[48px] bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 touch-target"
                >
                  <AlertTriangle className="w-4 h-4 text-white" />
                  <span>APAGAR TODOS OS DADOS DA EXPLORAÇÃO (RESET TOTAL)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MENUS 3, 5, 6: NOTIFICAÇÕES, AJUDA E SOBRE */}
      {activeSubmenu === 'notificacoes' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-6 animate-fade-in">
          <h2 className="text-fluid-subtitle font-black text-[#114037] border-b border-slate-100 pb-4">
            Definições — Preferências de Notificações
          </h2>
          <form onSubmit={handleSaveNotifications} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="font-extrabold text-slate-900 text-xs block">Notificações da Plataforma</span>
                <span className="text-xs text-slate-500">Receber alertas operacionais no telemóvel e email</span>
              </div>
              <input type="checkbox" checked={masterNotifications} onChange={(e) => setMasterNotifications(e.target.checked)} className="w-5 h-5 accent-[#3CA64C]" />
            </div>
            <button type="submit" className="w-full min-h-[48px] bg-[#3CA64C] text-white font-black text-xs rounded-2xl shadow-md touch-target">
              Guardar Definições de Notificações
            </button>
          </form>
        </div>
      )}

      {activeSubmenu === 'ajuda' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-6 animate-fade-in">
          <h2 className="text-fluid-subtitle font-black text-[#114037] border-b border-slate-100 pb-4">
            Ajuda & Suporte Técnico DATERRA Smart
          </h2>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-medium">
            Aceda aos tutoriais completos, documentação oficial EPPO/DGAV e cursos de capacitação na Academia DATERRA.
          </div>
        </div>
      )}

      {activeSubmenu === 'sobre' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-6 animate-fade-in">
          <h2 className="text-fluid-subtitle font-black text-[#114037] border-b border-slate-100 pb-4">
            Sobre a DATERRA Smart
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Plataforma SaaS agrícola desenvolvida para o cálculo de precisão de caldas fitossanitárias, calibração de atomizadores segundo as normas ISO 16122 e apoio à decisão na gestão de explorações.
          </p>
          <div className="text-xs text-slate-500 font-mono-numbers pt-4 border-t border-slate-100">
            DATERRA Smart v1.3.0 (Build 2026.08) • Normas ISO 16122 / EPPO / DGAV
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
