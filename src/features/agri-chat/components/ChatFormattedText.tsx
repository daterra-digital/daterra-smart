// src/features/agri-chat/components/ChatFormattedText.tsx
import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ChatFormattedTextProps {
  content: string;
}

export const ChatFormattedText: React.FC<ChatFormattedTextProps> = ({ content }) => {
  // Função para processar tokens inline: **bold**, *italic*, `code`
  const renderInlineTokens = (text: string) => {
    // Expressão regular para capturar **bold**, *italic* e `code`
    const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);
        return (
          <strong key={idx} className="font-black text-slate-900">
            {inner}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        const inner = part.slice(1, -1);
        return (
          <em key={idx} className="font-bold text-daterra-secondary not-italic">
            {inner}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        const inner = part.slice(1, -1);
        return (
          <span
            key={idx}
            className="font-mono font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs border border-slate-200"
          >
            {inner}
          </span>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-slate-700 leading-relaxed text-sm sm:text-base font-normal">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // 1. Linhas de Alerta (começam com ⚠️ ou 'Alerta:')
        if (trimmed.startsWith('⚠️')) {
          const alertContent = trimmed.replace(/^⚠️\s*/, '');
          return (
            <div
              key={lineIdx}
              className="my-2.5 p-3 sm:p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm text-amber-900 shadow-2xs"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="font-semibold">{renderInlineTokens(alertContent)}</div>
            </div>
          );
        }

        // 2. Linhas de Lista / Bullets (começam com •, -, ou *)
        if (/^[•\-*]\s+/.test(trimmed)) {
          const bulletContent = trimmed.replace(/^[•\-*]\s+/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-2.5 pl-1 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-daterra-accent shrink-0 mt-2.5" />
              <span className="flex-1">{renderInlineTokens(bulletContent)}</span>
            </div>
          );
        }

        // 3. Linhas com marca de verificação ✓
        if (trimmed.startsWith('✓')) {
          const checkContent = trimmed.replace(/^✓\s*/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-2.5 pl-1 my-1">
              <CheckCircle2 className="w-4 h-4 text-daterra-accent shrink-0 mt-0.5" />
              <span className="flex-1 text-slate-800">{renderInlineTokens(checkContent)}</span>
            </div>
          );
        }

        // 4. Parágrafo comum formatado
        return (
          <p key={lineIdx} className="m-0">
            {renderInlineTokens(line)}
          </p>
        );
      })}
    </div>
  );
};
