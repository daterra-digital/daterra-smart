import React, { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Download, Upload, CheckCircle2, 
  AlertTriangle, ShieldAlert
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../db/db';
import { firestoreDb } from '../lib/firebaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage, type SupportedLanguage } from '../context/LanguageContext';
import { MicrolearningModal } from '../components/MicrolearningModal';
import { HelpView } from './HelpView';
import { AboutView } from './AboutView';
import { ExplorationView, type ProfileTab as ExplorationTab } from './ExplorationView';
import { SettingsSubmenuNav, type SettingsSubmenu } from '../features/settings/SettingsSubmenuNav';
import { SettingsNotificationsTab } from '../features/settings/SettingsNotificationsTab';
import { UserProfileSummaryCard } from '../features/settings/profile/UserProfileSummaryCard';
import { UserProfileFocusedEditor } from '../features/settings/profile/UserProfileFocusedEditor';
import { CoBrandingSummaryCard } from '../features/settings/branding/CoBrandingSummaryCard';
import { CoBrandingFocusedEditor } from '../features/settings/branding/CoBrandingFocusedEditor';
import { PreferencesSummaryCard } from '../features/settings/preferences/PreferencesSummaryCard';
import { PreferencesFocusedEditor } from '../features/settings/preferences/PreferencesFocusedEditor';
import type { AppThemeId } from '../features/settings/preferences/preferencesCatalog';
import { RgpdDeleteAccountButton } from '../features/settings/RgpdDeleteAccountButton';
import { deleteAllUserCulturesSafely } from '../features/perfis/services/cultureDeletionService';
import type { Profile } from '../types/profile';
import type { CoBrandingConfig } from '../features/smart-debito/types';
import {
  getStoredCoBrandingConfig,
  saveStoredCoBrandingConfig
} from '../features/smart-debito/coBrandingStorage';

export const SettingsView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const getSubmenuFromLocation = (pathname: string, search: string): SettingsSubmenu => {
    const params = new URLSearchParams(search);
    const tabParam = params.get('tab');
    if (tabParam === 'exploracao' || tabParam === 'cultura' || tabParam === 'equipamento' || tabParam === 'bicos' || tabParam === 'calibracao') {
      return 'exploracao';
    }
    if (pathname.includes('/ajuda') || tabParam === 'ajuda') return 'ajuda';
    if (pathname.includes('/sobre') || tabParam === 'sobre') return 'sobre';
    if (tabParam === 'preferencias') return 'preferencias';
    if (tabParam === 'notificacoes') return 'notificacoes';
    if (tabParam === 'gestao_dados') return 'gestao_dados';
    return 'perfil';
  };

  const getExplorationTabFromLocation = (search: string): ExplorationTab => {
    const params = new URLSearchParams(search);
    const tabParam = params.get('tab');
    if (tabParam === 'equipamento' || tabParam === 'bicos' || tabParam === 'calibracao') {
      return tabParam;
    }
    return 'cultura';
  };

  const [activeSubmenu, setActiveSubmenu] = useState<SettingsSubmenu>(() => 
    getSubmenuFromLocation(location.pathname, location.search)
  );
  const [explorationTab, setExplorationTab] = useState<ExplorationTab>(() =>
    getExplorationTabFromLocation(location.search)
  );
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    const matched = getSubmenuFromLocation(location.pathname, location.search);
    if (location.pathname === '/ajuda' || location.pathname === '/sobre' || location.search.includes('tab=')) {
      setActiveSubmenu(matched);
      const matchedExplorationTab = getExplorationTabFromLocation(location.search);
      setExplorationTab(matchedExplorationTab);
    }
  }, [location.pathname, location.search]);

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
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dangerErrorMsg, setDangerErrorMsg] = useState('');

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
  const [isBrandingEditorOpen, setIsBrandingEditorOpen] = useState(false);

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

  const persistCoBranding = async (configToSave: CoBrandingConfig): Promise<boolean> => {
    setIsSavingCoBranding(true);
    setCoBrandingFeedback(null);
    try {
      saveStoredCoBrandingConfig(configToSave);
      setOriginalCoBranding({ ...configToSave });

      if (user?.id) {
        const userDocRef = doc(firestoreDb, 'users', user.id);
        await setDoc(
          userDocRef,
          {
            co_branding: configToSave,
            updated_at: new Date().toISOString()
          },
          { merge: true }
        );
      }

      setCoBrandingFeedback(
        t('settings.coBrandingSynced', 'Configuração de Co-Branding guardada e sincronizada com sucesso! Aplicada aos relatórios e ferramentas.')
      );
      setTimeout(() => setCoBrandingFeedback(null), 5000);
      return true;
    } catch (err) {
      console.error('[SettingsView] Erro ao sincronizar Co-Branding no Firestore:', err);
      setCoBrandingFeedback(t('settings.coBrandingSavedLocal', 'Configuração de Co-Branding guardada localmente.'));
      setTimeout(() => setCoBrandingFeedback(null), 5000);
      return true;
    } finally {
      setIsSavingCoBranding(false);
    }
  };

  const handleToggleCoBrandingEnabled = () => {
    const nextConfig: CoBrandingConfig = { ...coBranding, isEnabled: !coBranding.isEnabled };
    setCoBranding(nextConfig);
    void persistCoBranding(nextConfig);
  };

  const handleSaveCoBranding = async (e?: FormEvent): Promise<boolean> => {
    e?.preventDefault();
    return persistCoBranding(coBranding);
  };

  const handleCancelCoBranding = () => {
    setCoBranding({ ...originalCoBranding });
    setCoBrandingFeedback(null);
    setIsBrandingEditorOpen(false);
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
  const [appTheme, setAppTheme] = useState<AppThemeId>(() => {
    return (localStorage.getItem('daterra_theme') as AppThemeId) || 'mono';
  });
  const [isPreferencesEditorOpen, setIsPreferencesEditorOpen] = useState(false);
  const [draftLanguage, setDraftLanguage] = useState<SupportedLanguage>(language);
  const [draftAppTheme, setDraftAppTheme] = useState<AppThemeId>(appTheme);
  const [draftUnitsProfile, setDraftUnitsProfile] = useState<string>(selectedUnitsProfile);

  const handleThemeChange = (newTheme: AppThemeId) => {
    setAppTheme(newTheme);
    localStorage.setItem('daterra_theme', newTheme);
    const favicon = document.getElementById('app-favicon') as HTMLLinkElement | null;
    if (favicon) {
      if (newTheme === 'light') favicon.href = './icon-daterra-light.png';
      else if (newTheme === 'dark') favicon.href = './icon-daterra-dark.png';
      else favicon.href = './icon-daterra-mono.png';
    }
  };

  const openPreferencesEditor = () => {
    setDraftLanguage(language);
    setDraftAppTheme(appTheme);
    setDraftUnitsProfile(selectedUnitsProfile);
    setIsPreferencesEditorOpen(true);
  };

  const handleCancelPreferences = () => {
    setDraftLanguage(language);
    setDraftAppTheme(appTheme);
    setDraftUnitsProfile(selectedUnitsProfile);
    setIsPreferencesEditorOpen(false);
  };

  // ---------------------------------------------------------------------------
  // HANDLERS DE AÇÕES
  // ---------------------------------------------------------------------------
  const handleSaveProfile = async (e?: FormEvent): Promise<boolean> => {
    e?.preventDefault();

    if (!user?.id) {
      setErrorMessage(t('common.userNotAuthenticated', 'Utilizador não autenticado.'));
      return false;
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
      return true;
    } catch {
      setErrorMessage(t('settings.profile.connectionError', 'Erro de ligação ao guardar o perfil.'));
      setIsSaving(false);
      return false;
    }
  };

  const handleCancelProfileEdit = () => {
    if (originalProfile) {
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
    }
    setErrorMessage(null);
    setIsProfileEditorOpen(false);
  };

  const handleSavePreferences = (e?: React.FormEvent) => {
    e?.preventDefault();
    setLanguage(draftLanguage);
    handleThemeChange(draftAppTheme);
    setSelectedUnitsProfile(draftUnitsProfile);
    setIsPreferencesEditorOpen(false);
    setFeedbackMsg(t('settings.preferencesSaved', 'Preferências e Unidades Padrão guardadas!'));
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const effectiveUserId = user?.id || user?.uid || '';

  // ZONA DE PERIGO - Ações Destrutivas Scoped (SEC-REM-01)
  const handleDeleteCultures = async () => {
    if (!effectiveUserId) return;
    setDangerErrorMsg('');
    if (window.confirm(t('settings.confirmDeleteCultures', 'Tem a certeza que deseja apagar os seus perfis de cultura? Esta ação é irreversível.'))) {
      try {
        await deleteAllUserCulturesSafely(db, effectiveUserId);
        setFeedbackMsg(t('settings.culturesDeleted', 'Perfis de cultura eliminados com sucesso.'));
        setTimeout(() => setFeedbackMsg(''), 3500);
      } catch (err) {
        setDangerErrorMsg(
          err instanceof Error
            ? t('settings.deleteCulturesBlocked', err.message)
            : t('settings.deleteCulturesBlocked', 'Não foi possível apagar os perfis de cultura devido a dependências ativas.')
        );
      }
    }
  };

  const handleDeleteEquipments = async () => {
    if (!effectiveUserId) return;
    if (window.confirm(t('settings.confirmDeleteEquipments', 'Tem a certeza que deseja apagar os seus perfis de equipamento? Esta ação é irreversível.'))) {
      await db.profiles_equipment.where('userId').equals(effectiveUserId).delete();
      setFeedbackMsg(t('settings.equipmentsDeleted', 'Perfis de equipamento eliminados com sucesso.'));
      setTimeout(() => setFeedbackMsg(''), 3500);
    }
  };

  const handleDeleteNozzles = async () => {
    if (!effectiveUserId) return;
    if (window.confirm(t('settings.confirmDeleteNozzles', 'Tem a certeza que deseja apagar os seus bicos guardados? Esta ação é irreversível.'))) {
      await db.profiles_nozzles.where('userId').equals(effectiveUserId).delete();
      setFeedbackMsg(t('settings.nozzlesDeleted', 'Perfis de bicos eliminados com sucesso.'));
      setTimeout(() => setFeedbackMsg(''), 3500);
    }
  };

  const handleDeleteCalibrations = async () => {
    if (!effectiveUserId) return;
    if (window.confirm(t('settings.confirmDeleteCalibrations', 'Tem a certeza que deseja apagar as suas fichas de calibração? Esta ação é irreversível.'))) {
      await db.profiles_calibrations.where('userId').equals(effectiveUserId).delete();
      setFeedbackMsg(t('settings.calibrationsDeleted', 'Fichas de calibração eliminadas com sucesso.'));
      setTimeout(() => setFeedbackMsg(''), 3500);
    }
  };

  const handleDeleteAllData = async () => {
    if (!effectiveUserId) return;
    setDangerErrorMsg('');
    if (window.confirm(t('settings.confirmDeleteAllData', 'ATENÇÃO CRÍTICA: Deseja apagar TODOS os seus dados de exploração? Esta ação não pode ser desfeita!'))) {
      await db.transaction(
        'rw',
        [
          db.profiles_cultures,
          db.profile_crop_moments,
          db.profile_moment_revisions,
          db.profile_custom_options,
          db.profiles_equipment,
          db.profiles_nozzles,
          db.profiles_calibrations
        ],
        async () => {
          await db.profile_moment_revisions.where('userId').equals(effectiveUserId).delete();
          await db.profile_crop_moments.where('userId').equals(effectiveUserId).delete();
          await db.profile_custom_options.where('userId').equals(effectiveUserId).delete();
          await db.profiles_cultures.where('userId').equals(effectiveUserId).delete();
          await db.profiles_equipment.where('userId').equals(effectiveUserId).delete();
          await db.profiles_nozzles.where('userId').equals(effectiveUserId).delete();
          await db.profiles_calibrations.where('userId').equals(effectiveUserId).delete();
        }
      );
      setFeedbackMsg(t('settings.allDataDeleted', 'Todos os dados da plataforma foram eliminados do IndexedDB local.'));
      setTimeout(() => setFeedbackMsg(''), 3500);
    }
  };

  return (
    <div className="space-y-3 animate-fade-in pb-8">
      
      {/* CABEÇALHO PRINCIPAL DAS DEFINIÇÕES (Verde Principal #114037) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white p-4 rounded-2xl shadow-soft border border-slate-200">
        <div className="min-w-0">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1D734B] block">
            {t('nav.settings')}
          </span>
          <h1 className="text-lg sm:text-xl font-black text-[#114037] leading-tight">
            {t('settings.title')}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {t('settings.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-100 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-xs font-extrabold font-mono-numbers shrink-0">
          <User className="w-4 h-4 text-[#1D734B] shrink-0" />
          <span>ID: {user?.id || t('common.states.loading', 'A carregar...')}</span>
        </div>
      </div>

      {/* Alerta de Feedback de Sucesso */}
      {feedbackMsg && (
        <div className="p-4 bg-[#3CA64C] text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}
      {dangerErrorMsg && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 font-bold text-xs rounded-2xl shadow-sm flex items-center gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{dangerErrorMsg}</span>
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
        activeExplorationTab={explorationTab}
        onSelectExplorationTab={setExplorationTab}
      />


      {/* ========================================================================= */}
      {/* SUB-MENU 1: PERFIL DO UTILIZADOR                                        */}
      {/* ========================================================================= */}
      {activeSubmenu === 'perfil' && (
        <>
          <div className="flex flex-col gap-4 animate-fade-in">
            <UserProfileSummaryCard
              firstName={firstName}
              lastName={lastName}
              email={email}
              mobile={mobile}
              company={company}
              role={role}
              jobTitle={jobTitle}
              nif={nif}
              address={address}
              postalCode={postalCode}
              city={city}
              isLoadingProfile={isLoadingProfile}
              errorMessage={errorMessage}
              onEdit={() => {
                setErrorMessage(null);
                setIsProfileEditorOpen(true);
              }}
            />

            <CoBrandingSummaryCard
              coBranding={coBranding}
              feedbackMessage={coBrandingFeedback}
              isSaving={isSavingCoBranding}
              onToggleEnabled={handleToggleCoBrandingEnabled}
              onConfigure={() => {
                setCoBrandingFeedback(null);
                setIsBrandingEditorOpen(true);
              }}
            />
          </div>

            <UserProfileFocusedEditor
            isOpen={isProfileEditorOpen}
            isLoadingProfile={isLoadingProfile}
            isSaving={isSaving}
            errorMessage={errorMessage}
            firstName={firstName}
            lastName={lastName}
            email={email}
            mobile={mobile}
            company={company}
            role={role}
            jobTitle={jobTitle}
            nif={nif}
            address={address}
            postalCode={postalCode}
            city={city}
            onChangeFirstName={setFirstName}
            onChangeLastName={setLastName}
            onChangeMobile={setMobile}
            onChangeCompany={setCompany}
            onChangeRole={setRole}
            onChangeJobTitle={setJobTitle}
            onChangeNif={setNif}
            onChangeAddress={setAddress}
            onChangePostalCode={setPostalCode}
            onChangeCity={setCity}
            onClose={handleCancelProfileEdit}
            onSave={async () => {
              const saved = await handleSaveProfile();
              if (saved) setIsProfileEditorOpen(false);
            }}
          />

          <CoBrandingFocusedEditor
            isOpen={isBrandingEditorOpen}
            isSaving={isSavingCoBranding}
            coBranding={coBranding}
            onChangeCoBranding={setCoBranding}
            onLogoUpload={handleLogoUpload}
            onFillFromProfile={handleFillFromProfile}
            onClose={handleCancelCoBranding}
            onSave={async () => {
              const saved = await handleSaveCoBranding();
              if (saved) setIsBrandingEditorOpen(false);
            }}
          />
        </>
      )}

      {/* ========================================================================= */}
      {/* SUB-MENU 2: EXPLORAÇÃO AGRÍCOLA (Cultura, Equipamentos, Bicos, Calibração) */}
      {/* ========================================================================= */}
      {activeSubmenu === 'exploracao' && (
        <div className="space-y-3 animate-fade-in">
          <ExplorationView
            embedded={true}
            hideHeader={true}
            hideTabs={true}
            activeTab={explorationTab}
            onTabChange={setExplorationTab}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MENU 3: PREFERÊNCIAS (Unidades Padrão com Dica UI de Unidades)         */}
      {/* ========================================================================= */}
      {activeSubmenu === 'preferencias' && (
        <>
          <div className="flex flex-col gap-4 animate-fade-in">
            <PreferencesSummaryCard
              language={language}
              appTheme={appTheme}
              selectedUnitsProfile={selectedUnitsProfile}
              onOpenHelp={() => openMicro('preferencias_unidades')}
              onConfigure={openPreferencesEditor}
            />
          </div>

          <PreferencesFocusedEditor
            isOpen={isPreferencesEditorOpen}
            language={draftLanguage}
            appTheme={draftAppTheme}
            selectedUnitsProfile={draftUnitsProfile}
            onChangeLanguage={setDraftLanguage}
            onChangeTheme={setDraftAppTheme}
            onChangeUnitsProfile={setDraftUnitsProfile}
            onClose={handleCancelPreferences}
            onSave={() => handleSavePreferences()}
          />
        </>
      )}

      {/* ========================================================================= */}
      {/* SUB-MENU 4: GESTÃO DE DADOS & ZONA DE PERIGO (ALERTA VERMELHO DESTACADO)   */}
      {/* ========================================================================= */}
      {activeSubmenu === 'gestao_dados' && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <h2 className="text-fluid-subtitle font-black text-[#114037]">
                {t('settings.dataManagement.title', 'Definições — Gestão de Dados e Cópia de Segurança')}
              </h2>
              <span className="self-start sm:self-center px-3 py-1 bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-xs font-extrabold uppercase tracking-wide shrink-0">
                {t('common.status.inImprovement', 'Em melhoria')}
              </span>
            </div>

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
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    disabled
                    className="px-4 min-h-[44px] bg-slate-200 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed touch-target"
                    title={t('settings.dataManagement.inImprovementNotice', 'Protótipo em melhoria — Funcionalidade de cópia de segurança e exportação em desenvolvimento.')}
                  >
                    {t('settings.dataManagement.exportJson', 'Exportar JSON')}
                  </button>
                  <button
                    disabled
                    className="px-4 min-h-[44px] bg-slate-200 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed touch-target"
                    title={t('settings.dataManagement.inImprovementNotice', 'Protótipo em melhoria — Funcionalidade de cópia de segurança e exportação em desenvolvimento.')}
                  >
                    {t('settings.dataManagement.exportCsv', 'Exportar CSV')}
                  </button>
                  <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    {t('common.status.inImprovement', 'Em melhoria')}
                  </span>
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
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    disabled
                    className="px-4 min-h-[44px] bg-slate-200 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed touch-target"
                    title={t('settings.dataManagement.inImprovementNotice', 'Protótipo em melhoria — Funcionalidade de importação e restauro em desenvolvimento.')}
                  >
                    {t('settings.dataManagement.selectJson', 'Selecionar Ficheiro JSON')}
                  </button>
                  <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    {t('common.status.inImprovement', 'Em melhoria')}
                  </span>
                </div>
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

                {/* Opção RGPD: Direito ao Apagamento (SEC-17) */}
                <RgpdDeleteAccountButton
                  onFeedback={(msg) => setFeedbackMsg(msg)}
                  onError={(err) => setErrorMessage(err)}
                />
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
      {/* SUB-MENU 4: NOTIFICAÇÕES (Newsletters & Alertas Operacionais) */}
      {activeSubmenu === 'notificacoes' && (
        <SettingsNotificationsTab />
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
