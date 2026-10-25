import React from 'react';

export interface AlternativasBrandFilterProps {
  brands: string[];
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
}

export const AlternativasBrandFilter: React.FC<AlternativasBrandFilterProps> = ({
  brands,
  selectedBrand,
  onSelectBrand
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 justify-start w-full px-1">
      {brands.map((b) => (
        <button
          key={b}
          type="button"
          onClick={() => onSelectBrand(b)}
          className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedBrand === b
              ? 'bg-[#114037] text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          {b}
        </button>
      ))}
    </div>
  );
};
