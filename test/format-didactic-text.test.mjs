/**
 * DATERRA Smart - Testes Unitários do Formatador Universal de Tipografia
 * Validação: Conversão de **texto** em elementos semânticos sem asteriscos literais
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { formatDidacticText } from '../src/utils/formatDidacticText.ts';

describe('Formatador Universal de Tipografia (Microlearning & Guias)', () => {

  test('1. Converte texto simples com negrito sem deixar asteriscos literais', () => {
    const input = 'A velocidade deve ser de **5.4 km/h** para garantir cobertura.';
    const result = formatDidacticText(input);

    assert.ok(Array.isArray(result), 'Deve retornar um array de nós');
    assert.equal(result.length, 3, 'Deve dividir em prefixo, nó strong e sufixo');
    assert.equal(result[0], 'A velocidade deve ser de ');
    
    // Verificar nó React (React.createElement)
    const strongNode = result[1];
    assert.equal(strongNode.type, 'strong', 'Deve criar um nó <strong>');
    assert.equal(strongNode.props.children, '5.4 km/h', 'O conteúdo não pode conter asteriscos');
    assert.ok(strongNode.props.className.includes('font-semibold'), 'Deve aplicar classes tipográficas Tailwind');
    assert.equal(result[2], ' para garantir cobertura.');
  });

  test('2. Converte múltiplos segmentos de negrito num mesmo parágrafo', () => {
    const input = 'Calibrar a **100 metros** durante **60 segundos** com erro de **±5%**.';
    const result = formatDidacticText(input);

    assert.ok(Array.isArray(result));
    const strongs = result.filter(n => n && typeof n === 'object' && n.type === 'strong');
    assert.equal(strongs.length, 3, 'Devem existir 3 elementos <strong>');
    assert.equal(strongs[0].props.children, '100 metros');
    assert.equal(strongs[1].props.children, '60 segundos');
    assert.equal(strongs[2].props.children, '±5%');
  });

  test('3. Devolve o texto inalterado quando não há asteriscos', () => {
    const input = 'Velocidade constante em terreno plano.';
    const result = formatDidacticText(input);
    assert.equal(result, input, 'Deve devolver a string original quando não há marcação');
  });

  test('4. Resiliência a entradas vazias, nulas ou não-string', () => {
    assert.equal(formatDidacticText(''), '');
    assert.equal(formatDidacticText(null), null);
    assert.equal(formatDidacticText(undefined), undefined);
  });
});
