import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ArrowRight, FlaskConical, Gauge, Trees } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export const DashboardFavoritesCard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-soft border border-slate-200 flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-daterra-secondary flex items-center justify-center">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-daterra-primary text-base">
              {t('dashboard.favorites.title', 'Ferramentas Favoritas')}
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold block">
              {t('dashboard.favorites.subtitle', 'Acesso Rápido a Módulos Agronómicos')}
            </span>
          </div>
        </div>

        <Link
          to="/ferramentas"
          className="text-xs font-extrabold text-daterra-secondary hover:text-daterra-primary flex items-center gap-1"
        >
          <span>{t('dashboard.favorites.viewAll', 'Ver Todas')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grelha Interna de 4 Ferramentas Favoritas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Ferramenta 1 */}
        <Link
          to="/ferramentas?tool=calc_concentracao"
          className="p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all flex items-center justify-between group touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-daterra-primary block group-hover:text-daterra-secondary leading-snug">
                {t('dashboard.favorites.toolConcentration', 'Mistura de Calda (Concentração)')}
              </span>
              <span className="text-[10px] text-slate-500">
                {t('dashboard.favorites.toolConcentrationTag', 'Pulverização • Planta Jovem & Copa Adulta')}
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-daterra-accent group-hover:translate-x-1 transition-all shrink-0 ml-1" />
        </Link>

        {/* Ferramenta 2 */}
        <Link
          to="/ferramentas?tool=calc_dose"
          className="p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all flex items-center justify-between group touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-daterra-primary block group-hover:text-daterra-secondary leading-snug">
                {t('dashboard.favorites.toolDose', 'Mistura de Calda (Dose)')}
              </span>
              <span className="text-[10px] text-slate-500">
                {t('dashboard.favorites.toolDoseTag', 'Pulverização • Dose do Rótulo por Tanque')}
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-daterra-accent group-hover:translate-x-1 transition-all shrink-0 ml-1" />
        </Link>

        {/* Ferramenta 3 */}
        <Link
          to="/ferramentas?tool=calibracao_bicos"
          className="p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all flex items-center justify-between group touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold shrink-0">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-daterra-primary block group-hover:text-daterra-secondary leading-snug">
                {t('dashboard.favorites.toolCalibration', 'Calibração e Débito de Bicos')}
              </span>
              <span className="text-[10px] text-slate-500">
                {t('dashboard.favorites.toolCalibrationTag', 'Calibração • Norma ISO 16122')}
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-daterra-accent group-hover:translate-x-1 transition-all shrink-0 ml-1" />
        </Link>

        {/* Ferramenta 4 */}
        <Link
          to="/ferramentas?tool=geometria_trv_copa"
          className="p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all flex items-center justify-between group touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold shrink-0">
              <Trees className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-daterra-primary block group-hover:text-daterra-secondary leading-snug">
                {t('dashboard.favorites.toolTrv', 'Volume de Copa TRV (Tree Row Volume)')}
              </span>
              <span className="text-[10px] text-slate-500">
                {t('dashboard.favorites.toolTrvTag', 'Calibração • Dosagem Proporcional')}
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-daterra-accent group-hover:translate-x-1 transition-all shrink-0 ml-1" />
        </Link>
      </div>

      <Link
        to="/ferramentas"
        className="w-full py-3 bg-daterra-primary hover:bg-daterra-primary-hover text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md touch-target"
      >
        <span>{t('dashboard.favorites.viewCatalog', 'Ver Catálogo Completo de Ferramentas')}</span>
      </Link>
    </div>
  );
};
