import React from 'react';
import { FileText, Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const EppoGuideLabelExpressions: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      {/* 1. As 4 Formas de Expressão no Rótulo */}
      <section className="space-y-3">
        <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#3CA64C]" />
          <span>{t('ajusteDose.guide.labelExpressionsTitle', '1. As 4 Formas de Expressão no Rótulo')}</span>
        </h3>
        <p className="text-xs text-slate-600 font-medium">
          {t('ajusteDose.guide.labelExpressionsSubtitle', 'Ao ler a literatura do fabricante, a dose recomendada pode vir expressa de 4 formas distintas:')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <strong className="text-[#114037] font-black block mb-1">
              {t('ajusteDose.guide.dgaTitle', 'Área de Superfície (D_GA):')}
            </strong>
            <span className="text-slate-600">
              {t('ajusteDose.guide.dgaDesc', 'A dose clássica em L/ha ou kg/ha. Pressupõe um pomar ou vinha num estado de desenvolvimento "padrão". Precisa de ser ajustada à sua copa real.')}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <strong className="text-[#114037] font-black block mb-1">
              {t('ajusteDose.guide.dlwaTitle', 'Parede Foliar (D_LWA):')}
            </strong>
            <span className="text-slate-600">
              {t('ajusteDose.guide.dlwaDesc', 'Dose expressa para tratar 10.000 m² de parede foliar.')}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <strong className="text-[#114037] font-black block mb-1">
              {t('ajusteDose.guide.dtrvTitle', 'Volume de Copa (D_TRV):')}
            </strong>
            <span className="text-slate-600">
              {t('ajusteDose.guide.dtrvDesc', 'Dose expressa para tratar 10.000 m³ de volume de copa.')}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <strong className="text-[#114037] font-black block mb-1">
              {t('ajusteDose.guide.dhlTitle', 'Concentração (D_hL ou %):')}
            </strong>
            <span className="text-slate-600">
              {t('ajusteDose.guide.dhlDesc', 'Quantidade de produto a diluir em 100 Litros de água. Sozinha não dita a dose por hectare; depende sempre do volume de calda que a máquina vai aplicar.')}
            </span>
          </div>
        </div>
      </section>

      {/* 2. As Variáveis de Campo */}
      <section className="space-y-3">
        <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#3CA64C]" />
          <span>{t('ajusteDose.guide.fieldVariablesTitle', '2. As Variáveis de Campo (O que medir no terreno?)')}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <strong className="text-[#114037] font-mono font-black block mb-1">
              {t('ajusteDose.guide.varHTitle', 'h (Altura Tratada):')}
            </strong>
            <span className="text-slate-600">
              {t('ajusteDose.guide.varHDesc', 'A altura da faixa vertical que vai efetivamente pulverizar (ex: apenas a zona dos cachos). Não é a altura total da planta!')}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <strong className="text-[#114037] font-mono font-black block mb-1">
              {t('ajusteDose.guide.varWTitle', 'w (Largura da Copa):')}
            </strong>
            <span className="text-slate-600">
              {t('ajusteDose.guide.varWDesc', 'A espessura da copa, medida a meio da altura tratada (uma vez que a largura varia com a altura).')}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <strong className="text-[#114037] font-mono font-black block mb-1">
              {t('ajusteDose.guide.varRTitle', 'r (Entrelinha):')}
            </strong>
            <span className="text-slate-600">
              {t('ajusteDose.guide.varRDesc', 'A distância entre o centro de uma linha e o centro da linha seguinte. Regra para linhas duplas: Meça desde o centro de um grupo de linhas até ao centro do grupo seguinte.')}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <strong className="text-[#114037] font-mono font-black block mb-1">
              {t('ajusteDose.guide.varSfTitle', 'SF (Fator de Forma):')}
            </strong>
            <span className="text-slate-600">
              {t('ajusteDose.guide.varSfDesc', 'Fator de ajuste de volume para árvores que não são um bloco retangular (ex: copas globulares arredondadas).')}
            </span>
          </div>
        </div>
      </section>
    </>
  );
};
