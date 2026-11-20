// src/components/version/VersionCard.tsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sprout, Server, Sparkles } from 'lucide-react';
import { APP_VERSION_INFO } from '../../config/versionInfo';
import { detectEnvironment, type EnvironmentConfig, type EnvironmentType } from './detectEnvironment';

export { detectEnvironment, type EnvironmentConfig, type EnvironmentType };

export interface VersionCardProps {
  className?: string;
}

export const VersionCard: React.FC<VersionCardProps> = ({ className = '' }) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const env = detectEnvironment();
  const Icon = env.Icon;
  const displayUrl = env.canonicalUrl;
  const changelogItems = APP_VERSION_INFO.changelog.slice(0, 8);

  return (
    <section
      aria-label="Informações de Versão da DATERRA Smart"
      className={`bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-slate-200 text-slate-800 transition-all ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1D734B] flex items-center justify-center font-bold">
            <Sprout className="w-4 h-4 text-[#3CA64C]" aria-hidden="true" />
          </div>
          <span className="text-sm font-black text-[#114037] tracking-tight">{APP_VERSION_INFO.name}</span>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${env.badgeClass}`}>
          <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{env.label}</span>
        </div>
      </div>

      <div className="py-4 space-y-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-black text-[#114037] font-mono-numbers tracking-tight">
            Versão {env.version}
          </span>
          <span className="text-xs font-bold text-slate-500">• {env.statusText}</span>
        </div>

        <p className="text-xs text-slate-500 font-medium">{env.datePrefix} {APP_VERSION_INFO.releaseDate}</p>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pt-1">{env.description}</p>
      </div>

      {changelogItems.length > 0 && (
        <div className="mb-4 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#114037]">
            <Sparkles className="w-3.5 h-3.5 text-[#3CA64C] shrink-0" aria-hidden="true" />
            <span>Novidades desta versão</span>
          </div>
          <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4">
            {changelogItems.map((item, idx) => (
              <li key={idx} className="leading-snug">{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          aria-expanded={showTechnicalDetails}
          aria-controls="version-technical-details"
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-[#114037] hover:bg-slate-50 rounded-xl transition-all touch-target cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3CA64C]"
        >
          <span>{showTechnicalDetails ? 'Ocultar detalhes técnicos' : 'Detalhes técnicos'}</span>
          {showTechnicalDetails ? <ChevronUp className="w-4 h-4 text-slate-500" aria-hidden="true" /> : <ChevronDown className="w-4 h-4 text-slate-500" aria-hidden="true" />}
        </button>

        {showTechnicalDetails && (
          <div id="version-technical-details" className="mt-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5 text-xs text-slate-700 font-medium animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div><span className="font-bold text-slate-500">Ambiente:</span> {env.label}</div>
              <div><span className="font-bold text-slate-500">URL:</span> <code className="text-slate-800 break-all">{displayUrl}</code></div>
              <div><span className="font-bold text-slate-500">Firebase:</span> {env.firebaseEnv}</div>
              <div><span className="font-bold text-slate-500">Commit:</span> <code className="font-mono">{APP_VERSION_INFO.commitHash}</code></div>
              <div><span className="font-bold text-slate-500">Build:</span> <code className="font-mono">{APP_VERSION_INFO.buildNumber}</code></div>
              <div><span className="font-bold text-slate-500">Tag Git:</span> <code className="font-mono">{env.tag}</code></div>
            </div>
            <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-slate-500">
              <Server className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <span>Ambiente seguro verificado. Credenciais e chaves protegidas.</span>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>DATERRA Smart Suite Agrícola</span>
        <span className="font-mono text-slate-500">{displayUrl}</span>
      </footer>
    </section>
  );
};
