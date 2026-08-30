import { useNavigate } from 'react-router-dom';
import { UniversalCalculatorTemplate } from '../calculators/core/UniversalCalculatorTemplate';
import { volumeCaldaTrvCalculatorConfig } from '../calculators/definitions/volumeCaldaTrvCalculatorConfig';

/**
 * Invólucro oficial da Calculadora de Volume de Calda Adequado por TRV.
 * Constitui o único ponto de renderização do UniversalCalculatorTemplate para esta ferramenta.
 * Associado à rota protegida /ferramentas/volume-calda-trv.
 */
export function VolumeCaldaTrvCalculator() {
  const navigate = useNavigate();

  return (
    <UniversalCalculatorTemplate
      definition={volumeCaldaTrvCalculatorConfig}
      onBack={() => navigate('/ferramentas')}
    />
  );
}

export default VolumeCaldaTrvCalculator;