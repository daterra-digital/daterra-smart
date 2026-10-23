// src/features/weather/hooks/useWeatherLocationSearch.ts
import { useState, useMemo, useRef, useEffect } from 'react';
import {
  getAllMunicipalities,
  getAllFreguesias,
  resolveGeoLocation,
  type PortugalMunicipality,
  type PortugalFreguesiaEntry
} from '../services/geoApiService.ts';
import type { WeatherLocation } from '../weatherService.ts';

export type LocationFilterMode = 'all' | 'municipios' | 'freguesias';

export function useWeatherLocationSearch(
  currentLocation: WeatherLocation,
  onSelectLocation: (loc: WeatherLocation) => void
) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<LocationFilterMode>('all');
  const [selectedMunForFreg, setSelectedMunForFreg] = useState<PortugalMunicipality | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const allMunicipalities = useMemo(() => getAllMunicipalities(), []);
  const allFreguesias = useMemo(() => getAllFreguesias(), []);

  useEffect(() => {
    const found = allMunicipalities.find(
      (m) =>
        m.name.toLowerCase() === currentLocation.name.toLowerCase() ||
        (currentLocation.region && currentLocation.region.toLowerCase().includes(m.name.toLowerCase()))
    );
    if (found) setSelectedMunForFreg(found);
  }, [currentLocation, allMunicipalities]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
      setFilterMode('all');
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Municípios filtrados
  const filteredMunicipalities = useMemo(() => {
    if (!searchQuery.trim()) return allMunicipalities;
    const q = searchQuery.toLowerCase().trim();
    return allMunicipalities.filter(
      (m) => m.name.toLowerCase().includes(q) || (m.distrito && m.distrito.toLowerCase().includes(q))
    );
  }, [allMunicipalities, searchQuery]);

  // Freguesias filtradas (pesquisa global nas 3.259 freguesias quando há query)
  const filteredFreguesias = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      const targetMun = selectedMunForFreg || allMunicipalities[0];
      const fregs = targetMun?.freguesias || [];
      return fregs.map((f) => ({
        name: f,
        municipio: targetMun.name,
        distrito: targetMun.distrito || 'Portugal'
      }));
    }
    // Pesquisa global com limite de 60 resultados para fluidez total
    const matches: PortugalFreguesiaEntry[] = [];
    for (const f of allFreguesias) {
      if (f.name.toLowerCase().includes(q) || f.municipio.toLowerCase().includes(q)) {
        matches.push(f);
        if (matches.length >= 60) break;
      }
    }
    return matches;
  }, [searchQuery, selectedMunForFreg, allMunicipalities, allFreguesias]);

  const toggleFilter = (mode: 'municipios' | 'freguesias') => {
    if (!searchQuery.trim()) {
      setFilterMode(mode);
    } else {
      setFilterMode((prev) => (prev === mode ? 'all' : mode));
    }
  };

  const handleSelectMunicipio = async (mun: PortugalMunicipality) => {
    setIsResolving(true);
    try {
      const loc = await resolveGeoLocation(mun.name);
      onSelectLocation(loc);
      setSelectedMunForFreg(mun);
      setIsOpen(false);
    } finally {
      setIsResolving(false);
    }
  };

  const handleSelectFreguesia = async (fregName: string, munName: string) => {
    setIsResolving(true);
    try {
      const loc = await resolveGeoLocation(munName, fregName);
      onSelectLocation(loc);
      setIsOpen(false);
    } finally {
      setIsResolving(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    searchQuery,
    setSearchQuery,
    filterMode,
    toggleFilter,
    selectedMunForFreg,
    isResolving,
    dropdownRef,
    searchInputRef,
    filteredMunicipalities,
    filteredFreguesias,
    handleSelectMunicipio,
    handleSelectFreguesia
  };
}
