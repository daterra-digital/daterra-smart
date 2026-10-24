import React from 'react';

/**
 * Universal Bold & Microlearning Text Formatter
 * Converts **text** into semantically styled <strong> tags without external libraries.
 */
export function formatDidacticText(text: string): React.ReactNode {
  if (!text || typeof text !== 'string') return text;
  if (!text.includes('**')) return text;

  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return React.createElement(
        'strong',
        {
          key: index,
          className: 'font-semibold text-emerald-950 dark:text-emerald-100',
        },
        part.slice(2, -2)
      );
    }
    return part;
  });
}
