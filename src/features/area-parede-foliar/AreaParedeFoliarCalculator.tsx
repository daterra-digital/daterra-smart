import { useNavigate } from 'react-router-dom';
import { UniversalCalculatorTemplate } from '../calculators/core/UniversalCalculatorTemplate';
import { areaParedeFoliarCalculatorConfig } from '../calculators/definitions/areaParedeFoliarCalculatorConfig';

/**
 * Invólucro compatível da Calculadora de Área de Parede Foliar (LWA).
 * Preserva a rota dedicada /ferramentas/area-parede-foliar e a integração no catálogo de ferramentas,
 * renderizando integralmente o UniversalCalculatorTemplate oficial com persistência em calculation_history_v2.
 */
export function AreaParedeFoliarCalculator() {
  const navigate = useNavigate();

  return (
    <UniversalCalculatorTemplate
      definition={areaParedeFoliarCalculatorConfig}
      onBack={() => navigate('/ferramentas')}
    />
  );
}
