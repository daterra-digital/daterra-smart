import { useNavigate } from 'react-router-dom';
import { UniversalCalculatorTemplate } from '../calculators/core/UniversalCalculatorTemplate';
import { debitoTotalCalculatorConfig } from '../calculators/definitions/debitoTotalCalculatorConfig';

/**
 * Invólucro oficial da Calculadora de Débito Total do Pulverizador.
 * Constitui o único ponto de renderização do UniversalCalculatorTemplate para esta ferramenta.
 * Associado à rota protegida /ferramentas/debito-total.
 */
export function DebitoTotalCalculator() {
  const navigate = useNavigate();

  return (
    <UniversalCalculatorTemplate
      definition={debitoTotalCalculatorConfig}
      onBack={() => navigate('/ferramentas')}
    />
  );
}

export default DebitoTotalCalculator;