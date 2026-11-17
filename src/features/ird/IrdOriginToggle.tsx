import React from 'react';
import { Link } from 'react-router-dom';
import { Copy, ExternalLink } from 'lucide-react';
import type { IrdBlockOriginMode } from './irdOriginTypes.ts';

interface IrdOriginToggleProps {
  readonly blockId: string;
  readonly mode: IrdBlockOriginMode;
  readonly hasProfiles: boolean;
  readonly isLoggedIn: boolean;
  readonly canCopyToManual: boolean;
  readonly emptyText: string;
  readonly settingsTab: 'cultura' | 'equipamento' | 'bicos' | 'calibracao';
  readonly onChangeMode: (mode: IrdBlockOriginMode) => void;
  readonly onCopyToManual: () => void;
}

export const IrdOriginToggle: React.FC<IrdOriginToggleProps> = ({
  blockId,
  mode,
  hasProfiles,
  isLoggedIn,
  canCopyToManual,
  emptyText,
  settingsTab,
  onChangeMode,
  onCopyToManual
}) => (
  <div className="space-y-2">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div role="radiogroup" aria-label={`Origem de dados para ${blockId}`} className="inline-flex rounded-xl border border-slate-300 bg-slate-100 p-0.5 gap-1">
        {([
          { id: 'profile' as const, label: 'Usar perfil guardado' },
          { id: 'manual' as const, label: 'Introduzir manualmente' }
        ]).map((opt) => {
          const active = mode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChangeMode(opt.id)}
              className={`touch-target px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                active ? 'bg-[#114037] text-white shadow-2xs' : 'text-slate-700 hover:bg-white/80'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {mode === 'profile' && canCopyToManual && (
        <button
          type="button"
          onClick={onCopyToManual}
          className="touch-target px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-[#114037] text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Copiar para introdução manual</span>
        </button>
      )}
    </div>

    {mode === 'profile' && (!isLoggedIn || !hasProfiles) && (
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-700">
          {isLoggedIn ? emptyText : 'Inicie sessão para escolher perfis guardados neste bloco.'}
        </span>
        <Link to={`/definicoes?tab=${settingsTab}`} className="inline-flex items-center gap-1 font-extrabold text-[#114037] underline">
          Gerir em Definições <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    )}
  </div>
);
