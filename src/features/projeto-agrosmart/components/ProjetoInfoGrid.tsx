import React from 'react';
import { Building2, Info } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';

export const ProjetoInfoGrid: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-6">
      <div className="flex items-center gap-3 text-daterra-secondary">
        <Building2 className="w-6 h-6 shrink-0" />
        <h2 className="text-2xl font-extrabold text-daterra-primary">
          {t('projetoAgrosmart.infoTitle', 'Informação do projeto')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('projetoAgrosmart.designationLabel', 'Designação do Projeto')}
          </span>
          <p className="font-semibold text-slate-800">
            {t('projetoAgrosmart.designationValue', 'AgroSmart DATERRA')}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('projetoAgrosmart.numberLabel', 'Número do Projeto')}
          </span>
          <p className="font-semibold text-slate-800">
            {t('projetoAgrosmart.numberValue', 'Projeto n.º 23703')}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('projetoAgrosmart.beneficiaryLabel', 'Beneficiário')}
          </span>
          <p className="font-semibold text-slate-800">
            {t('projetoAgrosmart.beneficiaryValue', 'DATERRA, Lda.')}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('projetoAgrosmart.nipcLabel', 'NIPC')}
          </span>
          <p className="font-semibold text-slate-800">516957260</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('projetoAgrosmart.measureLabel', 'Medida')}
          </span>
          <p className="font-semibold text-slate-800">
            {t('projetoAgrosmart.measureValue', 'Vouchers para Startups — Novos Produtos Digitais e Tecnológicos')}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('projetoAgrosmart.noticeLabel', 'Aviso de Candidatura')}
          </span>
          <p className="font-semibold text-slate-800">Aviso n.º 2025-C16i02-21</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('projetoAgrosmart.periodLabel', 'Período de Execução')}
          </span>
          <p className="font-semibold text-slate-800">
            {t('projetoAgrosmart.periodValue', '1 de agosto de 2025 a 30 de junho de 2026')}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('projetoAgrosmart.statusLabel', 'Estado')}
          </span>
          <p className="font-semibold text-slate-800">
            {t('projetoAgrosmart.statusValue', 'Projeto concluído, em processo de avaliação')}
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-daterra-secondary shrink-0 mt-0.5" />
        <span>
          {t('projetoAgrosmart.fundingNote', 'Apoiado pelo ecossistema de Vouchers para Startups, financiado pelo Plano de Recuperação e Resiliência (PRR) e pelos fundos Europeus NextGenerationEU.')}
        </span>
      </div>
    </section>
  );
};
