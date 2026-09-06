import { useNavigate } from 'react-router-dom';
import { UniversalCalculatorTemplate } from '../calculators/core/UniversalCalculatorTemplate';
import { eppoCalculatorConfig } from '../calculators/definitions/eppoCalculatorConfig';

/**
 * Componente Invólucro da Calculadora Agrupada EPPO (LWA + TRV).
 * Permite calcular a área de parede foliar (LWA), volume de copa (TRV),
 * volume de calda recomendado e quantidade de produto fitossanitário por depósito e hectare.
 */
export function EppoCalculator() {
  const navigate = useNavigate();

  return (
    <UniversalCalculatorTemplate
      definition={eppoCalculatorConfig}
      onBack={() => navigate('/ferramentas')}
      onExecuteTransfer={(targetToolId) => navigate(`/ferramentas/${targetToolId.replace('calc_', '').replace('_', '-')}`)}
    />
  );
}

export default EppoCalculator;
