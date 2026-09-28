/**
 * DATERRA Smart - Mapeamento e Fallback Seguro de Mensagens de Validação
 * Garante que nenhuma chave interna de tradução (ex: calibracaoPulverizador.warnings.xyz)
 * é apresentada ao utilizador final na interface gráfica.
 */

export const FRIENDLY_VALIDATION_FALLBACKS_PT: Record<string, string> = {
  // ---------------------------------------------------------------------------
  // 1. Chaves Canónicas de Calibração Pulverizador (TRV e LWA)
  // ---------------------------------------------------------------------------
  'calibracaoPulverizador.warnings.heightHigh':
    'A altura da vegetação é elevada. Confirme se o valor corresponde à parte da vegetação que pretende tratar.',
  'calibracaoPulverizador.warnings.heightLow':
    'A altura da vegetação é reduzida. Confirme se foi medida toda a vegetação que pretende tratar.',
  'calibracaoPulverizador.warnings.rowSpacingWide':
    'A distância entrelinhas é elevada. Confirme a medição antes de aplicar o resultado no campo.',
  'calibracaoPulverizador.warnings.rowSpacingNarrow':
    'A distância entrelinhas é reduzida. Confirme a medição e certifique-se de que corresponde à distância entre o centro de duas linhas consecutivas.',
  'calibracaoPulverizador.warnings.canopyWidthHigh':
    'A largura média da copa é elevada. Confirme se a medição representa apenas a vegetação que será tratada.',
  'calibracaoPulverizador.warnings.canopyWidthLow':
    'A largura média da copa é reduzida. Confirme se a copa foi medida no ponto mais representativo da parcela.',
  'calibracaoPulverizador.warnings.doseHigh':
    'A dose indicada é elevada. Confirme sempre o rótulo do produto e o limite máximo autorizado por hectare.',
  'calibracaoPulverizador.warnings.doseLow':
    'A dose indicada é reduzida. Confirme se corresponde à dose autorizada para a cultura e o problema a tratar.',
  'calibracaoPulverizador.warnings.tankVolumeHigh':
    'O volume do depósito é elevado. Confirme se corresponde à capacidade útil do depósito do pulverizador.',
  'calibracaoPulverizador.warnings.tankVolumeLow':
    'O volume do depósito é reduzido. Confirme se o valor corresponde à quantidade de calda que pretende preparar.',
  'calibracaoPulverizador.warnings.widthRowSpacingOverlap':
    'A largura média da copa é elevada em relação à entrelinha. Confirme se existe sobreposição de vegetação entre linhas.',
  'calibracaoPulverizador.restingNoFoliageTarget':
    'A vinha encontra-se em repouso vegetativo. Não existe alvo foliar ativo para este cálculo.',
  'calibracaoPulverizador.warnings.restingNoFoliageTarget':
    'A vinha encontra-se em repouso vegetativo. Não existe alvo foliar ativo para este cálculo.',
  'calibracaoPulverizador.lwaAutomaticVolumeUnavailable':
    'O modelo paramétrico automático LWA-V aplica-se especificamente à cultura da Vinha. Para outras culturas em sebe, introduza manualmente o volume de calda adotado.',
  'calibracaoPulverizador.warnings.lwaAutomaticVolumeUnavailable':
    'O modelo paramétrico automático LWA-V aplica-se especificamente à cultura da Vinha. Para outras culturas em sebe, introduza manualmente o volume de calda adotado.',
  'calibracaoPulverizador.warnings.labelPrevalence':
    'Nota: As indicações do rótulo homologado e os limites máximos por hectare da autorização de venda prevalecem sempre sobre o cálculo teórico.',
  'calibracaoPulverizador.warnings.speedLow':
    'A velocidade indicada é baixa. Confirme se consegue manter este ritmo de forma estável durante a aplicação.',
  'calibracaoPulverizador.warnings.speedHigh':
    'A velocidade indicada é elevada. Uma velocidade alta pode reduzir a qualidade da cobertura. Confirme se é adequada ao terreno e ao equipamento.',
  'calibracaoPulverizador.warnings.workingWidthDiffersRowSpacing':
    'A largura de trabalho é diferente da distância entrelinhas indicada. Confirme que este valor corresponde à largura efetivamente tratada em cada passagem.',
  'calibracaoPulverizador.warnings.evenNozzlesRequired':
    'Indique um número par de bicos ativos para criar uma configuração simétrica nos dois lados do pulverizador.',
  'calibracaoPulverizador.warnings.activeNozzleCountHigh':
    'O número de bicos ativos é elevado. Confirme a contagem antes de utilizar o débito requerido por bico.',
  'calibracaoPulverizador.errors.activeNozzleCountInteger':
    'O número de bicos ativos deve ser um número inteiro.',

  // ---------------------------------------------------------------------------
  // 2. Chaves sem namespace (compatibilidade direta)
  // ---------------------------------------------------------------------------
  'heightHigh':
    'A altura da vegetação é elevada. Confirme se o valor corresponde à parte da vegetação que pretende tratar.',
  'heightLow':
    'A altura da vegetação é reduzida. Confirme se foi medida toda a vegetação que pretende tratar.',
  'rowSpacingWide':
    'A distância entrelinhas é elevada. Confirme a medição antes de aplicar o resultado no campo.',
  'rowSpacingNarrow':
    'A distância entrelinhas é reduzida. Confirme a medição e certifique-se de que corresponde à distância entre o centro de duas linhas consecutivas.',
  'canopyWidthHigh':
    'A largura média da copa é elevada. Confirme se a medição representa apenas a vegetação que será tratada.',
  'canopyWidthLow':
    'A largura média da copa é reduzida. Confirme se a copa foi medida no ponto mais representativo da parcela.',
  'doseHigh':
    'A dose indicada é elevada. Confirme sempre o rótulo do produto e o limite máximo autorizado por hectare.',
  'doseLow':
    'A dose indicada é reduzida. Confirme se corresponde à dose autorizada para a cultura e o problema a tratar.',
  'tankVolumeHigh':
    'O volume do depósito é elevado. Confirme se corresponde à capacidade útil do depósito do pulverizador.',
  'tankVolumeLow':
    'O volume do depósito é reduzido. Confirme se o valor corresponde à quantidade de calda que pretende preparar.',
  'widthRowSpacingOverlap':
    'A largura média da copa é elevada em relação à entrelinha. Confirme se existe sobreposição de vegetação entre linhas.',
  'restingNoFoliageTarget':
    'A vinha encontra-se em repouso vegetativo. Não existe alvo foliar ativo para este cálculo.',
  'labelPrevalence':
    'Nota: As indicações do rótulo homologado e os limites máximos por hectare da autorização de venda prevalecem sempre sobre o cálculo teórico.',
  'speedLow':
    'A velocidade indicada é baixa. Confirme se consegue manter este ritmo de forma estável durante a aplicação.',
  'speedHigh':
    'A velocidade indicada é elevada. Uma velocidade alta pode reduzir a qualidade da cobertura. Confirme se é adequada ao terreno e ao equipamento.',
  'workingWidthDiffersRowSpacing':
    'A largura de trabalho é diferente da distância entrelinhas indicada. Confirme que este valor corresponde à largura efetivamente tratada em cada passagem.',
  'activeNozzleCountHigh':
    'O número de bicos ativos é elevado. Confirme a contagem antes de utilizar o débito requerido por bico.',


  // ---------------------------------------------------------------------------
  // 3. Outras calculadoras (assistência agronómica)
  // ---------------------------------------------------------------------------
  'volumeCaldaTrv.assistance.warnings.lowCoefficient':
    'O coeficiente selecionado é reduzido. Confirme a densidade foliar e a cobertura necessária.',
  'volumeCaldaTrv.assistance.warnings.highCoefficient':
    'O coeficiente selecionado é elevado. Confirme a densidade foliar e o risco de escorrimento.'
};

/**
 * Resolve e devolve um texto de aviso amigável, garantindo que nunca é emitida
 * uma chave técnica (como "calibracaoPulverizador.warnings.xxx" ou strings com pontos).
 */
export function resolveFriendlyValidationMessage(
  keyOrMsg: string | undefined | null,
  t?: (key: string, fallback?: string) => string
): string {
  if (!keyOrMsg) return '';

  const raw = String(keyOrMsg).trim();

  // 1. Se existir função de tradução i18n
  if (t && typeof t === 'function') {
    const translated = t(raw);
    if (
      translated &&
      translated !== raw &&
      !translated.includes('calibracaoPulverizador.') &&
      !translated.includes('validation.') &&
      !translated.includes('warnings.')
    ) {
      return translated;
    }

    // Tenta também com prefixo calibracaoPulverizador.warnings.<chave>
    if (!raw.includes('.')) {
      const namespaced = `calibracaoPulverizador.warnings.${raw}`;
      const nsTranslated = t(namespaced);
      if (nsTranslated && nsTranslated !== namespaced && !nsTranslated.includes('.')) {
        return nsTranslated;
      }
    }
  }

  // 2. Procura no dicionário de fallbacks estáticos em português
  if (FRIENDLY_VALIDATION_FALLBACKS_PT[raw]) {
    return FRIENDLY_VALIDATION_FALLBACKS_PT[raw];
  }

  // Procura pela última parte da chave (ex: "heightHigh" de "calibracaoPulverizador.warnings.heightHigh")
  const lastSegment = raw.split('.').pop() || '';
  if (FRIENDLY_VALIDATION_FALLBACKS_PT[lastSegment]) {
    return FRIENDLY_VALIDATION_FALLBACKS_PT[lastSegment];
  }

  // 3. Se a string já for uma frase natural em português (sem notação técnica de chave)
  if (!raw.includes('.') && !raw.includes(':') && raw.length >= 8) {
    return raw;
  }

  // 4. Fallback genérico seguro
  return 'Confirme os valores introduzidos para garantir a máxima precisão da aplicação.';
}
