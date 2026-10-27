import React, { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Info, 
  Download, Upload, CheckCircle2, 
  AlertTriangle, ShieldAlert,
  Building2, Palette, Image as ImageIcon
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../db/db';
import { firestoreDb } from '../lib/firebaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage, LANGUAGE_OPTIONS, type SupportedLanguage } from '../context/LanguageContext';
import { MicrolearningModal } from '../components/MicrolearningModal';
import { HelpView } from './HelpView';
import { AboutView } from './AboutView';
import { SettingsSubmenuNav, type SettingsSubmenu } from '../features/settings/SettingsSubmenuNav';
import type { Profile } from '../types/profile';
import type { CoBrandingConfig } from '../features/smart-debito/types';
import {
  getStoredCoBrandingConfig,
  saveStoredCoBrandingConfig,
  PRESET_CO_BRANDING_PALETTES
} from '../features/smart-debito/coBrandingStorage';

export const SettingsView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const getSubmenuFromPath = (pathname: string): SettingsSubmenu => {
    if (pathname.includes('/ajuda')) return 'ajuda';
    if (pathname.includes('/sobre')) return 'sobre';
    return 'perfil';
  };

  const [activeSubmenu, setActiveSubmenu] = useState<SettingsSubmenu>(() => 
    getSubmenuFromPath(location.pathname)
  );
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    const matched = getSubmenuFromPath(location.pathname);
    if (location.pathname === '/ajuda' || location.pathname === '/sobre') {
      setActiveSubmenu(matched);
    }
  }, [location.pathname]);

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

  // ---------------------------------------------------------------------------
  // ESTADOS 1.1: CO-BRANDING E PERSONALIZAÇÃO INSTITUCIONAL
  // ---------------------------------------------------------------------------
  const [coBranding, setCoBranding] = useState<CoBrandingConfig>(() => getStoredCoBrandingConfig());
  const [originalCoBranding, setOriginalCoBranding] = useState<CoBrandingConfig>(() => getStoredCoBrandingConfig());
  const [coBrandingFeedback, setCoBrandingFeedback] = useState<string | null>(null);
  const [isSavingCoBranding, setIsSavingCoBranding] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUri = evt.target?.result as string;
      if (dataUri) {
        setCoBranding((prev) => ({ ...prev, logoUrl: dataUri }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApplyPalette = (palette: (typeof PRESET_CO_BRANDING_PALETTES)[0]) => {
    setCoBranding((prev) => ({
      ...prev,
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      textColor: palette.text
    }));
  };

  const handleFillFromProfile = () => {
    const fullPostal = postalCode ? `${postalCode}${city ? ' ' + city : ''}` : '';
    setCoBranding((prev) => ({
      ...prev,
      companyName: company || `${firstName} ${lastName}`.trim() || prev.companyName,
      address: address || prev.address,
      postalCode: fullPostal || prev.postalCode,
      phone: mobile || prev.phone,
      email: email || prev.email
    }));
  };

  const handleSaveCoBranding = async (e: FormEvent) => {
    e.preventDefault();
    setIsSavingCoBranding(true);
    setCoBrandingFeedback(null);
    try {
      // 1. Guardar localmente em localStorage para acesso síncrono do gerador PDF
      saveStoredCoBrandingConfig(coBranding);
      setOriginalCoBranding({ ...coBranding });

      // 2. Sincronizar com o documento users/{userId} no Cloud Firestore
      if (user?.id) {
        const userDocRef = doc(firestoreDb, 'users', user.id);
        await setDoc(
          userDocRef,
          {
            co_branding: coBranding,
            updated_at: new Date().toISOString()
          },
          { merge: true }
        );
      }

      setCoBrandingFeedback(
        t('settings.coBrandingSynced', 'Configuração de Co-Branding guardada e sincronizada com sucesso! Aplicada aos relatórios e ferramentas.')
      );
      setTimeout(() => setCoBrandingFeedback(null), 5000);
    } catch (err) {
      console.error('[SettingsView] Erro ao sincronizar Co-Branding no Firestore:', err);
      setCoBrandingFeedback(t('settings.coBrandingSavedLocal', 'Configuração de Co-Branding guardada localmente.'));
      setTimeout(() => setCoBrandingFeedback(null), 5000);
    } finally {
      setIsSavingCoBranding(false);
    }
  };

  const handleCancelCoBranding = () => {
    setCoBranding({ ...originalCoBranding });
    setCoBrandingFeedback(null);
  };

  // Carregar perfil ao montar ou quando user.id alterar
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!user?.id) {
        setIsLoadingProfile(false);
        return;
      }

      const now = new Date().toISOString();
      const nameParts = (user.name || '').trim().split(/\s+/).filter(Boolean);
      const initialProfileData: Profile = {
        id: user.id,
        first_name: nameParts[0] || null,
        last_name: nameParts.length > 1 ? nameParts.slice(1).join(' ') : null,
        email: user.email || '',
        phone: null,
        company_name: '',
        role: null,
        job_title: null,
        nif: null,
        address: null,
        postal_code: null,
        city: null,
        plan: 'free',
        credits: 5,
        co_branding: getStoredCoBrandingConfig(),
        created_at: now,
        updated_at: now
      };

      try {
        setIsLoadingProfile(true);
        setErrorMessage(null);

        const userDocRef = doc(firestoreDb, 'users', user.id);
        const snap = await getDoc(userDocRef);

        if (!snap.exists()) {
          await setDoc(userDocRef, initialProfileData, { merge: true });
          if (!cancelled) {
            setProfile(initialProfileData);
            setOriginalProfile(initialProfileData);
            setIsLoadingProfile(false);
          }
          return;
        }

        const data = snap.data() as Profile;
        const mergedProfile: Profile = {
          ...initialProfileData,
          ...data,
          id: user.id,
          email: data.email || user.email || ''
        };

        if (data.co_branding) {
          setCoBranding(data.co_branding);
          setOriginalCoBranding(data.co_branding);
          saveStoredCoBrandingConfig(data.co_branding);
        }

        if (!cancelled) {
          setProfile(mergedProfile);
          setOriginalProfile(mergedProfile);
          setIsLoadingProfile(false);
        }
      } catch (err) {
        console.warn('[SettingsView] Aviso ao ler perfil Firestore, a usar perfil base:', err);
        if (!cancelled) {
          setProfile(initialProfileData);
          setOriginalProfile(initialProfileData);
          setIsLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.email, user?.name]);

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
      setErrorMessage(t('common.userNotAuthenticated', 'Utilizador não autenticado.'));
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const payload = {
        id: user.id,
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        email: email.trim() || user.email || '',
        phone: mobile.trim() || null,
        company_name: company.trim() || null,
        role: role.trim() || null,
        job_title: jobTitle.trim() || null,
        nif: nif.trim() || null,
        address: address.trim() || null,
        postal_code: postalCode.trim() || null,
        city: city.trim() || null,
        updated_at: new Date().toISOString()
      };

      const userDocRef = doc(firestoreDb, 'users', user.id);
      await setDoc(userDocRef, payload, { merge: true });

      const updatedProfile: Profile = originalProfile
        ? { ...originalProfile, ...payload }
        : {
            ...payload,
            plan: 'free',
            credits: 5,
            created_at: new Date().toISOString()
          };
      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);

      if (refreshProfile) {
        await refreshProfile();
      }

      setFeedbackMsg(t('settings.profile.success', 'Perfil de Utilizador atualizado com sucesso!'));
      setTimeout(() => setFeedbackMsg(''), 3500);
      setIsSaving(false);

    } catch {
      setErrorMessage(t('settings.profile.connectionError', 'Erro de ligação ao guardar o perfil.'));
      setIsSaving(false);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(t('settings.preferencesSaved', 'Preferências e Unidades Padrão guardadas!'));
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(t('settings.notificationsSaved', 'Preferências de Notificação guardadas com sucesso!'));
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  // ZONA DE PERIGO - Ações Destrutivas
  const handleDeleteCultures = async () => {
    if (window.confirm(t('settings.confirmDeleteCultures', 'Tem a certeza que deseja apagar TODOS os perfis de cultura? Esta ação é irreversível.'))) {
      await db.profiles_cultures.clear();
      setFeedbackMsg(t('settings.culturesDeleted', 'Perfis de cultura eliminados com sucesso.'));
      setTimeout(() => setFeedbackMsg(''), 3500);
    }
  };

  const handleDeleteEquipments = async () => {
    if (window.confirm(t('settings.confirmDeleteEquipments', 'Tem a certeza que deseja apagar TODOS os perfis de equipamento? Esta ação é irreversível.'))) {
      await db.profiles_equipment.clear();
      setFeedbackMsg(t('settings.equipmentsDeleted', 'Perfis de equipamento eliminados com sucesso.'));
      setTimeout(() => setFeedbackMsg(''), 3500);
    }
  };

  const handleDeleteNozzles = async () => {
    if (window.confirm(t('settings.confirmDeleteNozzles', 'Tem a certeza que deseja apagar TODOS os bicos guardados? Esta ação é irreversível.'))) {
      await db.profiles_nozzles.clear();
      setFeedbackMsg(t('settings.nozzlesDeleted', 'Perfis de bicos eliminados com sucesso.'));
      setTimeout(() => setFeedbackMsg(''), 3500);
    }
  };

  const handleDeleteCalibrations = async () => {
    if (window.confirm(t('settings.confirmDeleteCalibrations', 'Tem a certeza que deseja apagar TODAS as fichas de calibração? Esta ação é irreversível.'))) {
      await db.profiles_calibrations.clear();
      setFeedbackMsg(t('settings.calibrationsDeleted', 'Fichas de calibração eliminadas com sucesso.'));
      setTimeout(() => setFeedbackMsg(''), 3500);
    }
  };

  const handleDeleteAllData = async () => {
    if (window.confirm(t('settings.confirmDeleteAllData', 'ATENÇÃO CRÍTICA: Deseja apagar TODOS os dados da exploração do IndexedDB? Esta ação não pode ser desfeita!'))) {
      await db.profiles_cultures.clear();
      await db.profiles_equipment.clear();
      await db.profiles_nozzles.clear();
      await db.profiles_calibrations.clear();
      setFeedbackMsg(t('settings.allDataDeleted', 'Todos os dados da plataforma foram eliminados do IndexedDB local.'));
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
      <SettingsSubmenuNav
        activeSubmenu={activeSubmenu}
        onSelectSubmenu={(sub) => {
          setActiveSubmenu(sub);
          if ((sub === 'ajuda' || sub === 'sobre') && location.pathname !== '/definicoes') {
            navigate('/definicoes');
          }
        }}
        onNavigateExploration={() => navigate('/exploracao')}
      />


      {/* ========================================================================= */}
      {/* SUB-MENU 1: PERFIL DO UTILIZADOR                                        */}
      {/* ========================================================================= */}
      {activeSubmenu === 'perfil' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-8">
            <h2 className="text-fluid-subtitle font-black text-[#114037] border-b border-slate-100 pb-4">
              {t('settings.profileTitle', 'Definições — Perfil do Utilizador')}
            </h2>

            {/* Indicadores de Loading / Erro */}
            {isLoadingProfile && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-800 animate-pulse">
                {t('settings.loadingProfile', 'A carregar perfil…')}
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
                  {t('settings.profile.personalData', 'Dados do Perfil do Utilizador')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('settings.profile.firstName', 'Nome Próprio')}
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoadingProfile || isSaving}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('settings.profile.lastName', 'Apelido')}
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoadingProfile || isSaving}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('settings.profile.email', 'Endereço de E-mail')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      disabled
                      className="w-full min-h-[48px] px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed outline-none"
                    />
                    <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                      {t('settings.profile.emailNote', 'O endereço de email está associado à sua autenticação segura e não pode ser alterado diretamente aqui.')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('settings.profile.mobile', 'Telemóvel')}
                    </label>
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
                  {t('settings.profile.professionalInfo', 'Informação Profissional e Morada')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('settings.profile.company', 'Empresa')}
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      disabled={isLoadingProfile || isSaving}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('settings.profile.role', 'Função')}
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={isLoadingProfile || isSaving}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('settings.profile.jobTitle', 'Cargo')}
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      disabled={isLoadingProfile || isSaving}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('settings.profile.nif', 'NIF')}
                    </label>
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
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('settings.profile.address', 'Morada')}
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={isLoadingProfile || isSaving}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('settings.profile.postalCode', 'Código-Postal')}
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      disabled={isLoadingProfile || isSaving}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('settings.profile.city', 'Localidade')}
                    </label>
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
                  {t('settings.profile.cancel', 'Cancelar')}
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isLoadingProfile}
                  className="w-full sm:w-auto px-8 min-h-[48px] bg-[#3CA64C] hover:bg-[#359445] text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 touch-target"
                >
                  <span>
                    {isSaving
                      ? t('settings.profile.saving', 'A guardar…')
                      : t('settings.profile.save', 'Guardar Alterações do Perfil')}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* ========================================================================= */}
          {/* CARTÃO 2: CO-BRANDING E PERSONALIZAÇÃO INSTITUCIONAL                     */}
          {/* ========================================================================= */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-fluid-subtitle font-black text-[#114037]">
                  Definições — Co-Branding & Personalização Institucional
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Configure o logotipo, paleta de cores e dados da sua organização para emissão de relatórios oficiais (como o Smart Débito ISO 16122).
                </p>
              </div>

              {/* Interruptor Ativar / Desativar Co-Branding */}
              <div className="flex items-center gap-3 shrink-0 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">
                  {coBranding.isEnabled ? 'Co-Branding Ativo' : 'Desativado'}
                </span>
                <button
                  type="button"
                  onClick={() => setCoBranding((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    coBranding.isEnabled ? 'bg-[#3CA64C]' : 'bg-slate-300'
                  }`}
                  aria-label="Ativar ou desativar Co-Branding"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      coBranding.isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Mensagem de Feedback ao Guardar */}
            {coBrandingFeedback && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{coBrandingFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveCoBranding} className="space-y-8">
              {/* SUB-BLOCO 1: Pré-visualização do Banner em Tempo Real */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B]">
                    Pré-visualização do Banner Oficial
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500">
                    Aparência nos Relatórios PDF e na Aplicação
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: coBranding.primaryColor,
                    color: coBranding.textColor,
                    borderColor: coBranding.secondaryColor
                  }}
                  className="w-full rounded-2xl p-4 sm:p-5 border-2 shadow-xs transition-all relative overflow-hidden"
                >
                  {/* Friso decorativo na cor secundária */}
                  <div
                    style={{ backgroundColor: coBranding.secondaryColor }}
                    className="absolute top-0 left-0 right-0 h-1.5"
                  />

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Logotipo em espaço dedicado branco + Dados da Empresa */}
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Espaço dedicado com fundo branco puro para acomodar o logotipo */}
                      <div
                        style={{ borderColor: coBranding.secondaryColor }}
                        className="h-14 w-32 sm:h-16 sm:w-36 bg-white rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-sm border border-slate-200 overflow-hidden"
                      >
                        {coBranding.logoUrl ? (
                          <img
                            src={coBranding.logoUrl}
                            alt={coBranding.companyName}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Building2 className="w-6 h-6 text-slate-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {t('settings.branding.logo', 'Logótipo')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                            {coBranding.companyName || 'Nome da Empresa'}
                          </h4>
                          <span
                            style={{
                              backgroundColor: coBranding.secondaryColor,
                              color: coBranding.textColor
                            }}
                            className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded shadow-xs shrink-0"
                          >
                            {coBranding.isEnabled ? 'Co-Branding Ativo' : 'Desativado'}
                          </span>
                        </div>

                        <p className="text-xs opacity-90 mt-1 truncate">
                          {coBranding.address || 'Morada da Empresa'}{coBranding.postalCode ? ` · ${coBranding.postalCode}` : ''}
                        </p>

                        <p className="text-[11px] opacity-80 mt-0.5 truncate">
                          {coBranding.phone ? `Tel: ${coBranding.phone}` : ''}
                          {coBranding.email ? ` | Email: ${coBranding.email}` : ''}
                          {coBranding.website ? ` | ${coBranding.website}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Tag no topo direito */}
                    <div className="self-end md:self-center shrink-0">
                      <span
                        style={{ backgroundColor: coBranding.secondaryColor, color: '#FFFFFF' }}
                        className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg shadow-xs"
                      >
                        INSPEÇÃO OFICIAL ISO 16122
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SUB-BLOCO 2: Logotipo e Paleta de Cores */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Logotipo da Empresa */}
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B]">
                    Logotipo da Empresa
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Carregue o logotipo da sua organização (PNG, JPG ou SVG). O sistema enquadra-o automaticamente num espaço com fundo branco neutro no banner do PDF e da plataforma, acomodando ficheiros com ou sem fundo.
                  </p>

                  <div className="flex items-center gap-4 pt-1">
                    {/* Miniatura com Fundo Branco */}
                    <div className="h-16 w-32 bg-white rounded-xl border border-slate-300 p-1.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                      {coBranding.logoUrl ? (
                        <img
                          src={coBranding.logoUrl}
                          alt="Logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <ImageIcon className="w-5 h-5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            {t('settings.branding.noLogo', 'Sem Logo')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="min-h-[44px] px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs touch-target">
                        <Upload className="w-4 h-4 text-[#1D734B]" />
                        <span>{t('settings.branding.uploadLogo', 'Carregar Ficheiro de Logotipo')}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml,image/webp"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>

                      {coBranding.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setCoBranding((prev) => ({ ...prev, logoUrl: null }))}
                          className="text-xs text-rose-600 hover:text-rose-800 font-bold text-left hover:underline px-1 cursor-pointer"
                        >
                          Remover Logotipo Atual
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Paleta Dinâmica de 3 Cores */}
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B]">
                      Paleta de 3 Cores
                    </h3>
                    <Palette className="w-4 h-4 text-[#1D734B]" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {t('settings.branding.primaryColor', 'Cor Primária')}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={coBranding.primaryColor}
                          onChange={(e) => setCoBranding((prev) => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5 shrink-0 bg-white"
                        />
                        <input
                          type="text"
                          value={coBranding.primaryColor}
                          onChange={(e) => setCoBranding((prev) => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-full min-h-[40px] px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {t('settings.branding.bannerBackground', 'Fundo do Banner')}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {t('settings.branding.secondaryColor', 'Cor Secundária')}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={coBranding.secondaryColor}
                          onChange={(e) => setCoBranding((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                          className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5 shrink-0 bg-white"
                        />
                        <input
                          type="text"
                          value={coBranding.secondaryColor}
                          onChange={(e) => setCoBranding((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                          className="w-full min-h-[40px] px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {t('settings.branding.trimsAndSeal', 'Frisos e Selo')}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {t('settings.branding.textColor', 'Cor do Texto')}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={coBranding.textColor}
                          onChange={(e) => setCoBranding((prev) => ({ ...prev, textColor: e.target.value }))}
                          className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5 shrink-0 bg-white"
                        />
                        <input
                          type="text"
                          value={coBranding.textColor}
                          onChange={(e) => setCoBranding((prev) => ({ ...prev, textColor: e.target.value }))}
                          className="w-full min-h-[40px] px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {t('settings.branding.bannerText', 'Texto do Banner')}
                      </span>
                    </div>
                  </div>

                  {/* Sugestões Rápidas de Paletas */}
                  <div className="pt-1">
                    <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                      Sugestões Rápidas:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_CO_BRANDING_PALETTES.map((pal) => (
                        <button
                          key={pal.name}
                          type="button"
                          onClick={() => handleApplyPalette(pal)}
                          className="py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 hover:border-[#114037] text-slate-700 flex items-center gap-2 transition-colors shadow-2xs"
                        >
                          <span
                            style={{ backgroundColor: pal.primary }}
                            className="w-3 h-3 rounded-full inline-block border border-slate-300"
                          />
                          <span
                            style={{ backgroundColor: pal.secondary }}
                            className="w-3 h-3 rounded-full inline-block border border-slate-300"
                          />
                          <span>{pal.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SUB-BLOCO 3: Dados Cadastrais da Empresa para o Banner */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B]">
                    Dados da Empresa no Banner e Relatórios
                  </h3>
                  <button
                    type="button"
                    onClick={handleFillFromProfile}
                    className="text-xs font-bold text-[#1D734B] hover:text-[#114037] hover:underline flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <span>{t('settings.branding.fillFromProfile', 'Preencher com dados do Perfil de Utilizador')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('settings.branding.companyName', 'Nome da Empresa')}
                    </label>
                    <input
                      type="text"
                      value={coBranding.companyName}
                      onChange={(e) => setCoBranding((prev) => ({ ...prev, companyName: e.target.value }))}
                      placeholder={t('settings.branding.companyNamePlaceholder', 'Ex: AgroTec Serviços Lda')}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('settings.branding.companyAddress', 'Morada')}
                    </label>
                    <input
                      type="text"
                      value={coBranding.address}
                      onChange={(e) => setCoBranding((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder={t('settings.branding.companyAddressPlaceholder', 'Ex: Zona Industrial Lote 14')}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('settings.branding.postalCodeCity', 'Código-Postal e Localidade')}
                    </label>
                    <input
                      type="text"
                      value={coBranding.postalCode}
                      onChange={(e) => setCoBranding((prev) => ({ ...prev, postalCode: e.target.value }))}
                      placeholder={t('settings.branding.postalCodePlaceholder', 'Ex: 2000-001 Santarém')}
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('settings.branding.contactPhone', 'Telefone de Contacto')}
                    </label>
                    <input
                      type="text"
                      value={coBranding.phone}
                      onChange={(e) => setCoBranding((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Ex: +351 243 000 111"
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold input-mono outline-none focus:border-[#3CA64C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('settings.branding.institutionalEmail', 'E-mail Institucional')}
                    </label>
                    <input
                      type="email"
                      value={coBranding.email}
                      onChange={(e) => setCoBranding((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Ex: servicos@empresa.pt"
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('settings.branding.website', 'Website')}
                    </label>
                    <input
                      type="text"
                      value={coBranding.website}
                      onChange={(e) => setCoBranding((prev) => ({ ...prev, website: e.target.value }))}
                      placeholder="Ex: www.empresa.pt"
                      className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#3CA64C]"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação do Cartão de Co-Branding */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelCoBranding}
                  disabled={isSavingCoBranding}
                  className="w-full sm:w-auto px-6 min-h-[48px] border border-slate-300 rounded-2xl font-bold text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-all touch-target"
                >
                  {t('common.cancel', 'Cancelar')}
                </button>

                <button
                  type="submit"
                  disabled={isSavingCoBranding}
                  className="w-full sm:w-auto px-8 min-h-[48px] bg-[#3CA64C] hover:bg-[#359445] text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 touch-target"
                >
                  <span>{isSavingCoBranding ? t('common.saving', 'A guardar…') : t('settings.branding.saveConfig', 'Guardar Configuração de Co-Branding')}</span>
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
                className="px-3.5 min-h-[44px] bg-[#3CA64C]/10 hover:bg-[#3CA64C]/20 text-[#114037] font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 touch-target cursor-pointer"
                title={t('common.guide', 'Guia')}
              >
                <Info className="w-4 h-4 text-[#3CA64C]" />
                <span>{t('common.help', 'Ajuda')}</span>
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
                      {t('settings.preferencesTab.appIconsTitle', 'Ícones da Aplicação Móvel (PWA & Ecrã de Início)')}
                    </h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      {t('settings.preferencesTab.mobileExclusive', 'Exclusivo Mobile')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {t('settings.preferencesTab.appIconsNote', 'Estes ícones são exclusivos para a aplicação instalada em smartphones e tablets. Nos navegadores web, o ícone de separador é fixo através do favicon oficial DATERRA.')}
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
                        <span className="font-extrabold text-slate-900 text-xs">
                          {t('settings.preferencesTab.monoTheme', 'Monocromático')}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          {t('settings.preferencesTab.defaultBadge', 'Padrão')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        {t('settings.preferencesTab.monoNote', 'Ícone neutro monocromático oficial (Ativo por defeito).')}
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
                      <span className="font-extrabold text-slate-900 text-xs">
                        {t('settings.preferencesTab.lightTheme', 'Modo Claro (Light)')}
                      </span>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        {t('settings.preferencesTab.lightNote', 'Alto contraste diurno para leitura no campo sob sol intenso.')}
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
                      <span className="font-extrabold text-slate-900 text-xs">
                        {t('settings.preferencesTab.darkTheme', 'Modo Escuro (Dark)')}
                      </span>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        {t('settings.preferencesTab.darkNote', 'Otimizado para operações agronómicas noturnas na cabine.')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* OS 4 PERFIS DE UNIDADES PADRÃO (Com Dica de UI de 3-4 unidades em cinzento) */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B]">
                  {t('settings.unitsProfilesTitle', 'Perfis de Unidades de Medida Padrão')}
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
                        <span className="font-extrabold text-slate-900 text-xs">
                          {t('settings.units.si', 'Sistema Métrico Internacional (SI)')}
                        </span>
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
                        <span className="font-extrabold text-slate-900 text-xs">
                          {t('settings.units.us', 'Sistema Imperial / Americano (US)')}
                        </span>
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
                        <span className="font-extrabold text-slate-900 text-xs">
                          {t('settings.units.uk', 'Sistema Misto Anglo-Saxónico (UK / CA / AU)')}
                        </span>
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
                        <span className="font-extrabold text-slate-900 text-xs">
                          {t('settings.units.trad', 'Sistema Regional Tradicional (Ibérico / LatAm)')}
                        </span>
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
                className="w-full min-h-[48px] bg-[#3CA64C] hover:bg-[#3AAA35] text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 touch-target cursor-pointer"
              >
                <span>{t('settings.preferencesTab.save', 'Guardar Preferências e Unidades Padrão')}</span>
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
              {t('settings.dataManagement.title', 'Definições — Gestão de Dados e Cópia de Segurança')}
            </h2>

            {/* Exportar e Importar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B] flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#3CA64C]" />
                  <span>{t('settings.dataManagement.exportTitle', 'Exportar Dados da Exploração')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t('settings.dataManagement.exportDesc', 'Descarregue uma cópia de segurança completa em JSON ou exporte relatórios em CSV.')}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button className="px-4 min-h-[44px] bg-[#114037] hover:bg-[#0d332c] text-white font-bold text-xs rounded-xl transition-all touch-target">
                    {t('settings.dataManagement.exportJson', 'Exportar JSON')}
                  </button>
                  <button className="px-4 min-h-[44px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all touch-target">
                    {t('settings.dataManagement.exportCsv', 'Exportar CSV')}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1D734B] flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#3CA64C]" />
                  <span>{t('settings.dataManagement.importTitle', 'Importar Ficheiro de Perfis')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t('settings.dataManagement.importDesc', 'Restaure os seus perfis de cultura, atomizadores e bicos através de um ficheiro prévio.')}
                </p>
                <button className="px-4 min-h-[44px] bg-[#3CA64C] hover:bg-[#3AAA35] text-white font-bold text-xs rounded-xl transition-all touch-target">
                  {t('settings.dataManagement.selectJson', 'Selecionar Ficheiro JSON')}
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
                    <span>{t('settings.dangerZone.title', 'Zona de Perigo — Ações Destrutivas Irreversíveis')}</span>
                  </h3>
                  <p className="text-xs text-rose-700 font-semibold mt-0.5">
                    {t('settings.dangerZone.subtitle', 'As operações abaixo eliminam dados do armazenamento local IndexedDB sem possibilidade de recuperação.')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={handleDeleteCultures}
                  className="p-4 bg-white border border-rose-200 hover:border-rose-400 rounded-2xl text-left transition-all hover:bg-rose-50/50 touch-target cursor-pointer"
                >
                  <span className="font-extrabold text-rose-900 text-xs block">
                    {t('settings.dangerZone.deleteCultures', 'Apagar Perfis de Cultura')}
                  </span>
                  <span className="text-[11px] text-rose-600 block mt-1 font-medium">
                    {t('settings.dangerZone.deleteCulturesSub', 'Remove todas as parcelas')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteEquipments}
                  className="p-4 bg-white border border-rose-200 hover:border-rose-400 rounded-2xl text-left transition-all hover:bg-rose-50/50 touch-target cursor-pointer"
                >
                  <span className="font-extrabold text-rose-900 text-xs block">
                    {t('settings.dangerZone.deleteEquipments', 'Apagar Equipamentos')}
                  </span>
                  <span className="text-[11px] text-rose-600 block mt-1 font-medium">
                    {t('settings.dangerZone.deleteEquipmentsSub', 'Remove atomizadores ISO')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteNozzles}
                  className="p-4 bg-white border border-rose-200 hover:border-rose-400 rounded-2xl text-left transition-all hover:bg-rose-50/50 touch-target cursor-pointer"
                >
                  <span className="font-extrabold text-rose-900 text-xs block">
                    {t('settings.dangerZone.deleteNozzles', 'Apagar Perfis de Bicos')}
                  </span>
                  <span className="text-[11px] text-rose-600 block mt-1 font-medium">
                    {t('settings.dangerZone.deleteNozzlesSub', 'Remove os bicos de jato')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteCalibrations}
                  className="p-4 bg-white border border-rose-200 hover:border-rose-400 rounded-2xl text-left transition-all hover:bg-rose-50/50 touch-target cursor-pointer"
                >
                  <span className="font-extrabold text-rose-900 text-xs block">
                    {t('settings.dangerZone.deleteCalibrations', 'Apagar Calibrações')}
                  </span>
                  <span className="text-[11px] text-rose-600 block mt-1 font-medium">
                    {t('settings.dangerZone.deleteCalibrationsSub', 'Remove ensaios hidráulicos')}
                  </span>
                </button>
              </div>

              {/* Botão Vermelho Crítico Apagar Tudo */}
              <div className="pt-4 border-t border-rose-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleDeleteAllData}
                  className="w-full sm:w-auto px-6 min-h-[48px] bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 touch-target cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-white" />
                  <span>{t('settings.dangerZone.deleteAll', 'APAGAR TODOS OS DADOS DA EXPLORAÇÃO (RESET TOTAL)')}</span>
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
            {t('settings.notificationsTab.title', 'Definições — Preferências de Notificações')}
          </h2>
          <form onSubmit={handleSaveNotifications} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="font-extrabold text-slate-900 text-xs block">
                  {t('settings.notificationsTab.platformAlerts', 'Notificações da Plataforma')}
                </span>
                <span className="text-xs text-slate-500">
                  {t('settings.notificationsTab.platformAlertsDesc', 'Receber alertas operacionais no telemóvel e email')}
                </span>
              </div>
              <input type="checkbox" checked={masterNotifications} onChange={(e) => setMasterNotifications(e.target.checked)} className="w-5 h-5 accent-[#3CA64C]" />
            </div>
            <button type="submit" className="w-full min-h-[48px] bg-[#3CA64C] text-white font-black text-xs rounded-2xl shadow-md touch-target cursor-pointer">
              {t('settings.notificationsTab.save', 'Guardar Definições de Notificações')}
            </button>
          </form>
        </div>
      )}

      {activeSubmenu === 'ajuda' && (
        <div className="space-y-6 animate-fade-in">
          <HelpView />
        </div>
      )}

      {activeSubmenu === 'sobre' && (
        <div className="space-y-6 animate-fade-in">
          <AboutView />
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
