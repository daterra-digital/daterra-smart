import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UniversalCalculatorTemplate } from '../calculators/core/UniversalCalculatorTemplate.tsx';
import { calibracaoPulverizadorConfig } from './calibracaoPulverizadorConfig.ts';

/**
 * Invólucro oficial da nova ferramenta Calibração Pulverizador.
 * Fase A: Planeamento de volume de calda e produto por LWA/TRV — EPPO.
 * 
 * Constitui o ponto de entrada da rota /ferramentas/calibracao-pulverizador.
 */
export const CalibracaoPulverizador: React.FC = () => {
  const navigate = useNavigate();

  return (
    <UniversalCalculatorTemplate
      definition={calibracaoPulverizadorConfig}
      onBack={() => navigate('/ferramentas')}
    />
  );
};

export default CalibracaoPulverizador;
