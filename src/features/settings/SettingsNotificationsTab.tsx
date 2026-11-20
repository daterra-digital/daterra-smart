import React, { useState, useEffect, type FormEvent } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { syncNewsletterPreference } from '../../services/newsletter/newsletterSyncService';
import { EquipmentIppAlertsPanel } from './EquipmentIppAlertsPanel';

interface NotificationFeedback {
  type: 'success' | 'warning' | 'error';
  message: string;
}

export const SettingsNotificationsTab: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useLanguage();

  const [masterNotifications, setMasterNotifications] = useState<boolean>(() => {
    return profile?.platform_notifications_enabled ?? true;
  });
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<boolean>(() => {
    return profile?.newsletter_subscribed ?? true;
  });
  const [feedback, setFeedback] = useState<NotificationFeedback | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.newsletter_subscribed !== undefined) {
      setNewsletterSubscribed(profile.newsletter_subscribed);
    }
    if (profile?.platform_notifications_enabled !== undefined) {
      setMasterNotifications(profile.platform_notifications_enabled);
    }
  }, [profile?.newsletter_subscribed, profile?.platform_notifications_enabled]);

  const handleSaveNotifications = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const email = profile?.email || user?.email || '';
    const firstname = profile?.first_name || user?.name || '';
    const lastname = profile?.last_name || '';
    const company = profile?.company_name || user?.farmName || '';
    const uid = user?.id || user?.uid;

    try {
      const syncResult = await syncNewsletterPreference({
        uid,
        email,
        firstname,
        lastname,
        company,
        subscribed: newsletterSubscribed,
        platformNotifications: masterNotifications,
        source: 'settings_notifications'
      });

      if (syncResult.persistedInFirestore) {
        setFeedback({
          type: 'success',
          message: syncResult.syncedWithBff
            ? t('settings.notificationsSaved', 'Preferências de Notificação guardadas com sucesso!')
            : t(
                'settings.notificationsSavedFirestorePending',
                'Preferências guardadas na conta. Sincronização externa de email/newsletter encontra-se pendente.'
              )
        });
      } else if (syncResult.queuedInOutbox) {
        setFeedback({
          type: 'warning',
          message: t('settings.notificationsQueued', 'Preferências guardadas na fila local. Serão sincronizadas assim que a ligação for restabelecida.')
        });
      } else {
        setFeedback({
          type: 'error',
          message: t('settings.notificationsFailed', 'Não foi possível guardar as preferências. Verifique a ligação e tente novamente.')
        });
      }

      if (refreshProfile && syncResult.persistedInFirestore) {
        try {
          await refreshProfile();
        } catch (refreshErr) {
          console.warn('[SettingsNotificationsTab] Aviso ao atualizar perfil:', refreshErr);
        }
      }
    } catch (err) {
      console.warn('[SettingsNotificationsTab] Erro durante sincronização:', err);
      setFeedback({
        type: 'error',
        message: t('settings.notificationsFailed', 'Não foi possível guardar as preferências. Verifique a ligação e tente novamente.')
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-fluid-subtitle font-black text-[#114D37]">
            {t('settings.notificationsTab.title', 'Definições — Preferências de Notificações')}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('settings.notificationsTab.subtitle', 'Gestão de canais de comunicação e subscrição de conteúdos técnicos.')}
          </p>
        </div>
        <span className="self-start sm:self-center px-2.5 py-0.5 bg-amber-100 border border-amber-400 text-amber-950 rounded-full text-xs font-black uppercase tracking-wider shrink-0">
          RC
        </span>
      </div>

      {feedback && (
        <div
          role="status"
          data-testid="notifications-feedback"
          data-feedback-type={feedback.type}
          className={`p-4 text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-3 animate-fade-in ${
            feedback.type === 'success' ? 'bg-[#3CA64C]' : feedback.type === 'warning' ? 'bg-amber-600' : 'bg-red-600'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSaveNotifications} className="space-y-4">
        {/* Notificações da Plataforma */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-50 hover:bg-slate-100/70 transition-colors rounded-2xl border border-slate-200">
          <div className="pr-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">
                {t('settings.notificationsTab.platformAlerts', 'Notificações da Plataforma')}
              </span>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                {t('common.status.inImprovement', 'Em melhoria')}
              </span>
            </div>
            <span className="text-xs text-slate-500 block mt-0.5 leading-relaxed">
              {t('settings.notificationsTab.platformAlertsDesc', 'Receber alertas operacionais no telemóvel e email')}
            </span>
          </div>
          <label className="w-12 h-12 flex items-center justify-center shrink-0 cursor-pointer touch-target rounded-xl hover:bg-slate-200/50 transition-colors">
            <input
              type="checkbox"
              checked={masterNotifications}
              onChange={(e) => setMasterNotifications(e.target.checked)}
              className="w-5 h-5 rounded-md accent-[#114D37] cursor-pointer"
            />
          </label>
        </div>

        {/* Newsletters da DATERRA */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-emerald-50/40 hover:bg-emerald-50/70 transition-colors rounded-2xl border border-emerald-200/80">
          <div className="pr-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#114D37] text-xs sm:text-sm block">
                {t('settings.notificationsTab.newsletters', 'Newsletters da DATERRA')}
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                {t('settings.notificationsTab.newslettersTag', 'Marketing & Atualizações')}
              </span>
            </div>
            <span className="text-xs text-slate-600 block mt-1 leading-relaxed">
              {t('settings.notificationsTab.newslettersDesc', 'Receba comunicações de marketing e atualizações técnicas no seu e-mail')}
            </span>
          </div>
          <label className="w-12 h-12 flex items-center justify-center shrink-0 cursor-pointer touch-target rounded-xl hover:bg-emerald-100/60 transition-colors">
            <input
              type="checkbox"
              checked={newsletterSubscribed}
              onChange={(e) => setNewsletterSubscribed(e.target.checked)}
              className="w-5 h-5 rounded-md accent-[#114D37] cursor-pointer"
            />
          </label>
        </div>

        {/* Alertas de Inspeção Periódica de Pulverizadores (IPP Portugal) */}
        <EquipmentIppAlertsPanel userId={user?.id || user?.uid || ''} />

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full min-h-[48px] bg-[#114D37] hover:bg-[#0d3b2b] disabled:opacity-60 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 touch-target cursor-pointer"
          >
            <span>{isSaving ? t('common.states.saving', 'A guardar...') : t('settings.notificationsTab.save', 'Guardar Definições de Notificações')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
