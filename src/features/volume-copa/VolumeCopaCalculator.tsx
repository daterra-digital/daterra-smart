import { useNavigate } from 'react-router-dom';
import { UniversalCalculatorTemplate } from '../calculators/core/UniversalCalculatorTemplate';
import { volumeCopaCalculatorConfig } from '../calculators/definitions/volumeCopaCalculatorConfig';

/**
 * Invólucro oficial da Calculadora de Volume de Copa (TRV).
 * Constitui o único ponto de renderização do UniversalCalculatorTemplate para esta ferramenta.
 * Associado à rota protegida /ferramentas/volume-copa.
 */
export function VolumeCopaCalculator() {
  const navigate = useNavigate();

  return (
    <UniversalCalculatorTemplate
      definition={volumeCopaCalculatorConfig}
      onBack={() => navigate('/ferramentas')}
    />
  );
}

export default VolumeCopaCalculator;