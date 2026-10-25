import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Droplets, Gauge, Activity, Compass, Disc } from 'lucide-react';
import { formatDidacticText } from '../../../../utils/formatDidacticText';

interface TechTerm {
  id: string;
  title: string;
  icon: React.ElementType;
  summary: string;
  whatIs: string;
  whyFails: string;
  tolerance: string;
  badge: string;
}

const TECH_TERMS: TechTerm[] = [
  {
    id: 'retornos',
    title: 'Compensação de Retornos',
    icon: Droplets,
    badge: 'Pressão ≤ 10%',
    summary: 'Estabilidade de pressão ao cortar secções da barra para evitar sobredosagens.',
    whatIs:
      'Em válvulas de retorno compensado, o fecho de um setor desvia para o **depósito** o caudal exato desse troço, mantendo a pressão constante nos bicos restantes.',
    whyFails:
      'Se o retorno estiver desafinado, a pressão sobe ao fechar um setor, forçando os bicos ativos a debitar calda em excesso (**sobredosagem e fitotoxicidade**).',
    tolerance: 'A variação lida no manómetro não pode exceder **±10%** após 10 segundos do corte sucessivo de cada setor.'
  },
  {
    id: 'queda_pressao',
    title: 'Queda de Pressão no Circuito',
    icon: Gauge,
    badge: 'Perda ≤ 10% / 15%',
    summary: 'Perda de carga por atrito entre o comando e o bico do extremo da barra ou arco.',
    whatIs:
      'Mede a dissipação de pressão do fluido nas tubagens desde o manómetro central até à ponta mais distante da barra ou do arco de pulverização.',
    whyFails:
      'Tubagens estreitas ou filtros sujos fazem cair a pressão na ponta, gerando gotas mais grossas e **subdosagem nas extremidades do terreno**.',
    tolerance: 'A quebra de pressão não pode exceder **10%** em barras horizontais ou **15%** em culturas arbustivas/arbóreas.'
  },
  {
    id: 'pulsacoes',
    title: 'Pulsações & Câmara de Ar',
    icon: Activity,
    badge: 'Oscilação ≤ 10%',
    summary: 'Amortecimento hidráulico dos cursos dos êmbolos na bomba de pistão-membrana.',
    whatIs:
      'A câmara de ar pneumática possui uma membrana pressurizada que absorve os picos cíclicos produzidos pela bomba volumétrica.',
    whyFails:
      'Com a câmara despressurizada ou furada, o manómetro oscila violentamente e os bicos debitam aos "solavancos", criando faixas de sobre e subdosagem.',
    tolerance:
      'Pulsações máximas de **10% da pressão de trabalho**. A pressão de ar da câmara deve ser calibrada entre **30% e 70%** da pressão de pulverização.'
  },
  {
    id: 'deformacao_barra',
    title: 'Deformação Geométrica da Barra',
    icon: Compass,
    badge: 'Alinhamento 2,5%',
    summary: 'Aferição da estabilidade mecânica e alinhamento dos eixos vertical e horizontal.',
    whatIs:
      'Garante que os leques dos bicos mantêm a cota de trabalho recomendada e sobreposição uniforme em toda a largura útil.',
    whyFails:
      'Barras desalinhadas ou recurvadas por embate aproximam os bicos do solo num dos lados e afastam-nos no outro, gerando deriva e faixas mortas.',
    tolerance:
      'Vertical: variação de cota dos bicos **≤ ±10 cm** ou **≤ 0,5%** da largura total. Horizontal: desvio máximo da ponta **≤ ±2,5%** da largura útil.'
  },
  {
    id: 'desvio_debito',
    title: 'Desvio de Débito e Desgaste dos Bicos',
    icon: Disc,
    badge: 'Ensaio ±5% a ±15%',
    summary: 'Ensaio volumétrico com proveta graduada durante 60 segundos por bico.',
    whatIs:
      'Verificação individual do caudal debitado por cada bico para detetar erosão, desgaste da pastilha cerâmica/polímero ou entupimentos.',
    whyFails:
      'Bicos gastos debitam calda a mais e com padrão deformado. Bicos danificados alteram a dose por hectare planeada.',
    tolerance:
      'Com débito nominal de catálogo: desvio máx. de **±10%** (caudal ≥ 1,0 L/min) e **±15%** (caudal < 1,0 L/min). Com débito desconhecido: máx. **±5% da média**.'
  }
];

export const InspecaoTechTermsSection: React.FC = () => {
  const [openTermId, setOpenTermId] = useState<string>('retornos');

  return (
    <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 space-y-1">
        <div className="font-bold text-emerald-900 dark:text-emerald-200">
          Descodificador Técnico de Requisitos Críticos
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
          {formatDidacticText(
            'Consulte os conceitos hidráulicos e mecânicos avaliados nos ensaios oficiais da DGAV e ISO 16122, com tolerâncias e impacto agronómico direto.'
          )}
        </p>
      </div>

      <div className="space-y-2">
        {TECH_TERMS.map((term) => {
          const isOpen = openTermId === term.id;
          const Icon = term.icon;
          return (
            <div
              key={term.id}
              className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800/70 transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenTermId(isOpen ? '' : term.id)}
                className="w-full flex items-center justify-between p-3.5 text-left min-h-[48px] hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 text-emerald-800 dark:text-emerald-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                      {term.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {term.summary}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hidden sm:inline-block">
                    {term.badge}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 dark:border-slate-700/60 space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">O que é: </span>
                    <span className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {formatDidacticText(term.whatIs)}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-amber-800 dark:text-amber-300">Impacto Agronómico: </span>
                    <span className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {formatDidacticText(term.whyFails)}
                    </span>
                  </div>
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200/70 dark:border-emerald-800/70">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">Tolerância Oficial: </span>
                    <span className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      {formatDidacticText(term.tolerance)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
