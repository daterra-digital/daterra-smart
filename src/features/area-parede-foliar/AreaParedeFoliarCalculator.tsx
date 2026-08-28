import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Leaf, Calculator, RotateCcw, 
  Save, CheckCircle2, AlertCircle, ExternalLink 
} from 'lucide-react';
import { DaterraKeypad } from '../../components/DaterraKeypad';
import { DidacticHelp } from '../concentracao/DidacticHelp';
import { useTranslation } from '../../context/LanguageContext';
import { db } from '../../db/db';

export function AreaParedeFoliarCalculator() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [alturaCopa, setAlturaCopa] = useState('');
  const [larguraEntrelinha, setLarguraEntrelinha] = useState('');
  const [resultado, setResultado] = useState<number | null>(null);
  const [gravadoSucesso, setGravadoSucesso] = useState(false);
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  function calcular() {
    setErroMsg(null);
    const h = parseFloat(alturaCopa.replace(',', '.'));
    const r = parseFloat(larguraEntrelinha.replace(',', '.'));

    // Validações
    if (isNaN(h) || isNaN(r) || !alturaCopa || !larguraEntrelinha) {
      const msg = t('calc.area_parede_foliar.erro.valores_obrigatorios');
      setErroMsg(msg);
      alert(msg);
      return;
    }

    if (r <= 0) {
      const msg = t('calc.area_parede_foliar.erro.entrelinha_invalida');
      setErroMsg(msg);
      alert(msg);
      return;
    }

    if (h < 0.5 || h > 6.0) {
      const msg = t('calc.area_parede_foliar.erro.altura_fora_range');
      setErroMsg(msg);
      alert(msg);
      return;
    }

    if (r < 1.5 || r > 10.0) {
      const msg = t('calc.area_parede_foliar.erro.entrelinha_fora_range');
      setErroMsg(msg);
      alert(msg);
      return;
    }

    // Cálculo da Área de Parede Foliar (Leaf Wall Area)
    // LWA = (h × 2 × 10.000) / r
    const lwa = (h * 2 * 10000) / r;
    setResultado(Math.round(lwa));
  }

  function limpar() {
    setAlturaCopa('');
    setLarguraEntrelinha('');
    setResultado(null);
    setErroMsg(null);
    setGravadoSucesso(false);
  }

  async function gravarHistorico() {
    if (!resultado) return;

    try {
      const h = parseFloat(alturaCopa.replace(',', '.'));
      const r = parseFloat(larguraEntrelinha.replace(',', '.'));

      await db.calculation_history.add({
        date: new Date().toISOString(),
        calculator_type: 'area_parede_foliar' as any,
        inputs: {
          alturaCopa: h,
          larguraEntrelinha: r
        },
        result: {
          quantidade_pf: resultado,
          unit_pf: 'm² LWA/ha',
          lwa_m2_ha: resultado
        },
        notes: `LWA = (${h}m × 2 × 10.000) / ${r}m = ${resultado.toLocaleString('pt-PT')} m² LWA/ha`
      });

      setGravadoSucesso(true);
      setTimeout(() => setGravadoSucesso(false), 3500);
    } catch (err) {
      console.error('Erro ao gravar histórico no IndexedDB:', err);
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Barra de Navegação Superior / Voltar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/ferramentas')}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all flex items-center gap-1.5 text-xs font-bold touch-target"
          >
            <ChevronLeft className="w-4 h-4 text-[#114037]" />
            <span>Voltar às Ferramentas</span>
          </button>
          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#114037] text-[#3AAA35] flex items-center justify-center shrink-0 shadow-sm">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3CA64C]">
                Calibração & Geometria Vegetativa
              </span>
              <h1 className="text-base sm:text-lg font-black text-[#114037] leading-tight">
                {t('calc.area_parede_foliar.titulo')}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DidacticHelp faqFile="AreaParedeFoliarFAQ.md" buttonLabel="Manual & FAQ" />
        </div>
      </div>

      {/* Notificação Toast de Gravação */}
      {gravadoSucesso && (
        <div className="fixed top-20 right-4 z-50 bg-[#114037] text-white px-5 py-3.5 rounded-2xl shadow-xl border border-[#3CA64C]/40 font-extrabold text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#3AAA35] shrink-0" />
          <span>Cálculo de Área de Parede Foliar guardado no histórico local com sucesso!</span>
        </div>
      )}

      {/* Cartão Principal da Calculadora */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-[#114037]">
              {t('calc.area_parede_foliar.titulo')}
            </h2>
            <span className="px-3 py-1 bg-emerald-50 text-[#1D734B] border border-emerald-200 text-xs font-bold rounded-full">
              Norma EPPO PP 1/239
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            {t('calc.area_parede_foliar.descricao')}
          </p>
        </div>

        {/* Mensagem de Erro de Validação Inline se existir */}
        {erroMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{erroMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campo: Altura da Copa (h) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>{t('calc.area_parede_foliar.altura_copa.label')}</span>
                <span className="text-slate-400 font-mono text-[11px]">(h)</span>
              </label>
              <DidacticHelp topic="area-parede-foliar-altura" buttonLabel="Ajuda" />
            </div>

            <DaterraKeypad
              value={alturaCopa}
              onChange={setAlturaCopa}
              placeholder="Ex: 2.5"
              unit="m"
              presets={[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5]}
            />
            <p className="text-[11px] text-slate-500 italic">
              {t('calc.area_parede_foliar.altura_copa.help')} (0.5m a 6.0m)
            </p>
          </div>

          {/* Campo: Distância Entrelinha (r) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>{t('calc.area_parede_foliar.entrelinha.label')}</span>
                <span className="text-slate-400 font-mono text-[11px]">(r)</span>
              </label>
              <DidacticHelp topic="area-parede-foliar-entrelinha" buttonLabel="Ajuda" />
            </div>

            <DaterraKeypad
              value={larguraEntrelinha}
              onChange={setLarguraEntrelinha}
              placeholder="Ex: 3.0"
              unit="m"
              presets={[2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 6.0]}
            />
            <p className="text-[11px] text-slate-500 italic">
              {t('calc.area_parede_foliar.entrelinha.help')} (1.5m a 10.0m)
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={calcular}
            className="flex-1 sm:flex-none px-8 py-3.5 bg-[#3CA64C] hover:bg-[#3AAA35] text-white font-extrabold text-sm rounded-2xl transition-all shadow-md active:scale-95 touch-target flex items-center justify-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            <span>{t('calc.area_parede_foliar.botao.calcular')}</span>
          </button>

          <button
            type="button"
            onClick={limpar}
            className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-all active:scale-95 touch-target flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('calc.area_parede_foliar.botao.limpar')}</span>
          </button>
        </div>

        {/* Resultado do Cálculo */}
        {resultado !== null && (
          <div className="bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-6 sm:p-7 rounded-3xl border-2 border-[#3CA64C]/30 shadow-md animate-fade-in mt-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#1D734B]">
                {t('calc.area_parede_foliar.resultado.titulo')}
              </span>
              <span className="px-3 py-1 bg-[#114037] text-white rounded-full text-xs font-bold">
                LWA (Leaf Wall Area)
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-3xl sm:text-5xl font-mono font-black text-[#114037] tracking-tight">
                {resultado.toLocaleString('pt-PT')} <span className="text-xl sm:text-2xl font-sans font-bold text-[#3CA64C]">m² LWA/ha</span>
              </p>
              <p className="text-xs text-slate-600 font-medium pt-1">
                {t('calc.area_parede_foliar.resultado.descricao')} • Equivalente a{' '}
                <strong className="text-slate-800 font-mono">{(resultado / 1000000).toFixed(4)} km² LWA/ha</strong>
              </p>
            </div>

            <div className="p-3.5 bg-white/80 rounded-2xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed font-mono-numbers">
              <strong>Fórmula aplicada:</strong> LWA = ({alturaCopa}m × 2 faces × 10.000 m²/ha) / {larguraEntrelinha}m = {resultado.toLocaleString('pt-PT')} m²/ha
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={gravarHistorico}
                className="px-5 py-2.5 bg-[#114037] hover:bg-[#1D734B] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 active:scale-95 touch-target"
              >
                <Save className="w-4 h-4 text-[#3AAA35]" />
                <span>{t('calc.area_parede_foliar.botao.gravar')}</span>
              </button>

              <a
                href="https://academia.daterra.com.pt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#1D734B] hover:text-[#114037] flex items-center gap-1.5 hover:underline"
              >
                <span>Aprender calibração LWA na Academia DATERRA</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
