import React from 'react';
import { Delete } from 'lucide-react';

interface KeypadNumberGridProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
}

export const KeypadNumberGrid: React.FC<KeypadNumberGridProps> = ({
  onKeyPress,
  onBackspace
}) => {
  return (
    <div className="p-4 grid grid-cols-4 gap-2 bg-daterra-primary font-mono-numbers">
      {/* Linha 1 */}
      <button type="button" onClick={() => onKeyPress('7')} className="keypad-btn">7</button>
      <button type="button" onClick={() => onKeyPress('8')} className="keypad-btn">8</button>
      <button type="button" onClick={() => onKeyPress('9')} className="keypad-btn">9</button>
      <button type="button" onClick={() => onKeyPress('/')} className="keypad-operator">/</button>

      {/* Linha 2 */}
      <button type="button" onClick={() => onKeyPress('4')} className="keypad-btn">4</button>
      <button type="button" onClick={() => onKeyPress('5')} className="keypad-btn">5</button>
      <button type="button" onClick={() => onKeyPress('6')} className="keypad-btn">6</button>
      <button type="button" onClick={() => onKeyPress('*')} className="keypad-operator">*</button>

      {/* Linha 3 */}
      <button type="button" onClick={() => onKeyPress('1')} className="keypad-btn">1</button>
      <button type="button" onClick={() => onKeyPress('2')} className="keypad-btn">2</button>
      <button type="button" onClick={() => onKeyPress('3')} className="keypad-btn">3</button>
      <button type="button" onClick={() => onKeyPress('-')} className="keypad-operator">-</button>

      {/* Linha 4 */}
      <button type="button" onClick={() => onKeyPress('0')} className="keypad-btn">0</button>
      <button type="button" onClick={() => onKeyPress(',')} className="keypad-btn font-bold">,</button>
      <button
        type="button"
        onClick={onBackspace}
        className="keypad-action bg-amber-600/80 hover:bg-amber-600 flex items-center justify-center cursor-pointer"
        aria-label="Apagar último caráter"
      >
        <Delete className="w-5 h-5 mx-auto" />
      </button>
      <button type="button" onClick={() => onKeyPress('+')} className="keypad-operator">+</button>
    </div>
  );
};
