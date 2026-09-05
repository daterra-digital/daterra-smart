/**
 * DATERRA Smart - Módulo Comparador de Bicos de Pulverização
 * Validações Agronómicas e Integridade de Dados
 */

import type { Nozzle } from './nozzleComparison.types';
import { formatPt } from './nozzleComparison.calculations';

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export function validatePressure(pressureBar: number, nozzleA?: Nozzle, nozzleB?: Nozzle): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (isNaN(pressureBar) || pressureBar <= 0) {
    issues.push({
      field: 'pressure',
      message: 'A pressão de trabalho deve ser superior a 0 bar.',
      severity: 'error'
    });
    return issues;
  }

  if (pressureBar > 50) {
    issues.push({
      field: 'pressure',
      message: 'Pressão de trabalho excessivamente elevada (> 50 bar). Verifique a escala manométrica.',
      severity: 'error'
    });
  }

  if (nozzleA) {
    if (pressureBar < nozzleA.pressureMinBar) {
      issues.push({
        field: 'pressureA',
        message: `Bico A: Pressão de ${formatPt(pressureBar)} bar está abaixo do mínimo recomendado (${formatPt(nozzleA.pressureMinBar)} bar).`,
        severity: 'warning'
      });
    } else if (pressureBar > nozzleA.pressureMaxBar) {
      issues.push({
        field: 'pressureA',
        message: `Bico A: Pressão de ${formatPt(pressureBar)} bar excede o limite máximo recomendado (${formatPt(nozzleA.pressureMaxBar)} bar).`,
        severity: 'warning'
      });
    }
  }

  if (nozzleB) {
    if (pressureBar < nozzleB.pressureMinBar) {
      issues.push({
        field: 'pressureB',
        message: `Bico B: Pressão de ${formatPt(pressureBar)} bar está abaixo do mínimo recomendado (${formatPt(nozzleB.pressureMinBar)} bar).`,
        severity: 'warning'
      });
    } else if (pressureBar > nozzleB.pressureMaxBar) {
      issues.push({
        field: 'pressureB',
        message: `Bico B: Pressão de ${formatPt(pressureBar)} bar excede o limite máximo recomendado (${formatPt(nozzleB.pressureMaxBar)} bar).`,
        severity: 'warning'
      });
    }
  }

  return issues;
}

export function parsePortugueseDecimal(val: string | number): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const normalized = String(val).trim().replace(',', '.');
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}
