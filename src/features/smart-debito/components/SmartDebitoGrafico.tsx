/**
 * DATERRA Smart - Gráfico SVG Nativo (Perfil de Distribuição de Débitos)
 * Ficheiro: src/features/smart-debito/components/SmartDebitoGrafico.tsx
 *
 * Gráfico vetorial de alta precisão em SVG puro (zero bibliotecas externas).
 * Suporta duas normas ISO 16122:
 * 1. ISO 16122-3 (Culturas 3D / Arbóreas / Vinha):
 *    - Gráfico Bilateral ("Borboleta") com eixo central de níveis verticais (N1 Topo até Nn Base).
 *    - Círculo central bicolor dividido a meio com as cores dos bicos de cada lado.
 *    - Barras crescem do centro para as extremidades (Esquerda para a esquerda, Direita para a direita).
 * 2. ISO 16122-2 (Culturas Baixas / Barras Horizontais):
 *    - Gráfico sequencial ao longo da barra horizontal física de pulverização.
 *    - Começa no bico N1 à esquerda e segue de forma horizontal até ao último bico (N2x).
 *    - Cada bico tem o seu círculo ilustrando a respetiva cor de catálogo.
 *    - Barras verticais para débito medido, marca de débito teórico Q2 e faixa de tolerância (±10%).
 *
 * REGRAS ESTRITAS: Termos interditos excluídos. Na UI utiliza exclusivamente "débito" e "Perfil de Distribuição de Débitos".
 */

import React, { useMemo } from 'react';
import type { NozzleSlot, NozzleSlotEvaluation, SmartDebitoStandard } from '../types';
import { getSlotColorInfo } from '../smartDebitoCalculations';

export interface SmartDebitoGraficoProps {
  standard?: SmartDebitoStandard;
  numLevels: number;
  slots: Record<string, NozzleSlot>;
  evaluations: Record<string, NozzleSlotEvaluation>;
  testPressureBar: number | null;
}

export const SmartDebitoGrafico: React.FC<SmartDebitoGraficoProps> = ({
  standard = 'ISO_16122_3',
  numLevels,
  slots,
  evaluations,
  testPressureBar
}) => {
  const isBoomMode = standard === 'ISO_16122_2';

  // 1. Calcula o Débito Máximo e Estruturas de Dados para as duas normas
  const { maxFlow, rows, boomNozzles } = useMemo(() => {
    let max = 0.5; // Mínimo base para evitar divisão por zero

    // Dados para ISO 16122-3 (Níveis Bilaterais)
    const rowList: Array<{
      level: number;
      leftSlot: NozzleSlot | undefined;
      rightSlot: NozzleSlot | undefined;
      leftEval: NozzleSlotEvaluation | undefined;
      rightEval: NozzleSlotEvaluation | undefined;
    }> = [];

    for (let lvl = 1; lvl <= numLevels; lvl++) {
      const leftSlot = slots[`${lvl}-left`];
      const rightSlot = slots[`${lvl}-right`];
      const leftEval = evaluations[`${lvl}-left`];
      const rightEval = evaluations[`${lvl}-right`];

      if (leftSlot?.measuredFlowRate) max = Math.max(max, leftSlot.measuredFlowRate);
      if (rightSlot?.measuredFlowRate) max = Math.max(max, rightSlot.measuredFlowRate);
      if (leftEval?.targetFlowRate) max = Math.max(max, leftEval.targetFlowRate);
      if (rightEval?.targetFlowRate) max = Math.max(max, rightEval.targetFlowRate);

      rowList.push({
        level: lvl,
        leftSlot,
        rightSlot,
        leftEval,
        rightEval
      });
    }

    // Dados para ISO 16122-2 (Sequência Horizontal na Barra: N1..Nx na esquerda, Nx+1..N2x na direita)
    const boomList: Array<{
      index: number;
      displayLabel: string;
      slotKey: string;
      slot: NozzleSlot | undefined;
      evaluation: NozzleSlotEvaluation | undefined;
      side: 'left' | 'right';
      level: number;
    }> = [];

    // Metade Esquerda da Barra (N1 até Nx)
    for (let lvl = 1; lvl <= numLevels; lvl++) {
      const slotKey = `${lvl}-left`;
      boomList.push({
        index: lvl,
        displayLabel: `N${lvl}`,
        slotKey,
        slot: slots[slotKey],
        evaluation: evaluations[slotKey],
        side: 'left',
        level: lvl
      });
    }

    // Metade Direita da Barra (Nx+1 até N2x)
    for (let lvl = 1; lvl <= numLevels; lvl++) {
      const slotKey = `${lvl}-right`;
      const nozzleNum = numLevels + lvl;
      boomList.push({
        index: nozzleNum,
        displayLabel: `N${nozzleNum}`,
        slotKey,
        slot: slots[slotKey],
        evaluation: evaluations[slotKey],
        side: 'right',
        level: lvl
      });
    }

    return {
      maxFlow: Number((max * 1.2).toFixed(2)),
      rows: rowList,
      boomNozzles: boomList
    };
  }, [numLevels, slots, evaluations]);

  // =========================================================================
  // PARÂMETROS GRÁFICOS PARA ISO 16122-3 (BORBOLETA / CULTURAS 3D)
  // =========================================================================
  const bilateralWidth = 840;
  const bilateralRowHeight = 32;
  const bilateralHeaderHeight = 38;
  const bilateralFooterHeight = 28;
  const bilateralHeight = bilateralHeaderHeight + numLevels * bilateralRowHeight + bilateralFooterHeight;

  const centerX = bilateralWidth / 2;
  const centerGap = 36;
  const sideWidth = centerX - centerGap - 30;

  const flowToPixelsBilateral = (flow: number) => {
    if (maxFlow <= 0 || flow <= 0) return 0;
    return Math.min(sideWidth, (flow / maxFlow) * sideWidth);
  };

  // =========================================================================
  // PARÂMETROS GRÁFICOS PARA ISO 16122-2 (BARRA HORIZONTAL / CULTURAS BAIXAS)
  // =========================================================================
  const boomWidth = 880;
  const boomHeight = 350;
  const boomMarginLeft = 55;
  const boomMarginRight = 25;
  const boomMarginTop = 44;
  const boomMarginBottom = 54;
  const boomPlotWidth = boomWidth - boomMarginLeft - boomMarginRight;
  const boomPlotHeight = boomHeight - boomMarginTop - boomMarginBottom;
  const boomBaselineY = boomMarginTop + boomPlotHeight;

  const totalBoomNozzles = boomNozzles.length;
  const colWidth = totalBoomNozzles > 0 ? boomPlotWidth / totalBoomNozzles : boomPlotWidth;
  const barWidth = Math.min(22, Math.max(10, colWidth - 8));
  const dividerX = boomMarginLeft + numLevels * colWidth;

  const boomFlowToY = (flow: number) => {
    if (maxFlow <= 0 || flow <= 0) return boomBaselineY;
    const h = Math.min(boomPlotHeight, (flow / maxFlow) * boomPlotHeight);
    return boomBaselineY - h;
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xs overflow-hidden">
      {/* Cabeçalho do Cartão */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 mb-2 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
            Perfil de Distribuição de Débitos
          </h3>
          <p className="text-[10px] text-slate-400">
            {isBoomMode
              ? `Barra Horizontal (ISO 16122-2: Culturas Baixas) · Sequência de bicos N1 a N${totalBoomNozzles} com tolerância legal (±10%)`
              : 'Distribuição Bilateral (ISO 16122-3: Culturas 3D) · Comparação vetorial: Débito Teórico vs Medido com tolerância legal (±10%)'}
          </p>
        </div>

        {/* Legenda do Gráfico */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold">
          {isBoomMode ? (
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-blue-600 inline-block shrink-0 shadow-2xs" />
              <span className="text-slate-700 font-bold">Cor do Bico</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full overflow-hidden flex border border-slate-300 shadow-2xs shrink-0">
                <span className="w-1/2 h-full bg-blue-600 inline-block" />
                <span className="w-1/2 h-full bg-orange-500 inline-block" />
              </div>
              <span className="text-slate-700 font-bold">Bicos (Esq | Dir)</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span className="text-slate-600">Teórico Q2</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
            <span className="text-slate-600">Medido (Conforme ≤ ±10%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
            <span className="text-slate-600">Medido (Não Conforme &gt; 10%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300 inline-block" />
            <span className="text-slate-600">Faixa ±10%</span>
          </div>
        </div>
      </div>

      {/* SVG Nativo Puro */}
      <div className="w-full flex items-center justify-center">
        {isBoomMode ? (
          /* ================================================================ */
          /* MODO ISO 16122-2: BARRA HORIZONTAL SEQUENCIAL (N1 À ESQUERDA)   */
          /* ================================================================ */
          <svg
            viewBox={`0 0 ${boomWidth} ${boomHeight}`}
            className="w-full h-auto max-h-[calc(100vh-320px)]"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Fundo do Gráfico */}
            <rect width={boomWidth} height={boomHeight} fill="#FAFAFA" rx="12" />

            {/* Cabeçalho Superior da Barra */}
            <g transform="translate(0, 24)">
              {/* Secção Esquerda */}
              <text
                x={boomMarginLeft + (numLevels * colWidth) / 2}
                y="0"
                textAnchor="middle"
                className="text-[11px] font-bold fill-slate-700 uppercase"
              >
                ← Secção Esquerda (Bicos N1 a N{numLevels})
              </text>

              {/* Centro da Máquina */}
              <text
                x={dividerX}
                y="0"
                textAnchor="middle"
                className="text-[9.5px] font-extrabold fill-slate-400 uppercase tracking-wider"
              >
                Eixo Central
              </text>

              {/* Secção Direita */}
              <text
                x={dividerX + (numLevels * colWidth) / 2}
                y="0"
                textAnchor="middle"
                className="text-[11px] font-bold fill-slate-700 uppercase"
              >
                Secção Direita (Bicos N{numLevels + 1} a N{totalBoomNozzles}) →
              </text>
            </g>

            {/* Linha Divisória Central (Chassis / Pulverizador) */}
            <line
              x1={dividerX}
              y1={boomMarginTop - 12}
              x2={dividerX}
              y2={boomBaselineY + 12}
              stroke="#CBD5E1"
              strokeWidth="2"
              strokeDasharray="4 2"
            />

            {/* Linhas de Grelha Horizontais do Eixo Y (Débito em l/min) */}
            {[0.25, 0.5, 0.75, 1.0].map((frac) => {
              const flowVal = Number((maxFlow * frac).toFixed(2));
              const yPos = boomFlowToY(flowVal);

              return (
                <g key={frac}>
                  <line
                    x1={boomMarginLeft}
                    y1={yPos}
                    x2={boomMarginLeft + boomPlotWidth}
                    y2={yPos}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={boomMarginLeft - 8}
                    y={yPos + 3}
                    textAnchor="end"
                    className="text-[8px] font-mono fill-slate-400"
                  >
                    {flowVal}
                  </text>
                </g>
              );
            })}

            {/* Rótulo da Unidade do Eixo Y */}
            <text
              x={boomMarginLeft - 8}
              y={boomMarginTop - 4}
              textAnchor="end"
              className="text-[8px] font-bold fill-slate-500 uppercase"
            >
              l/min
            </text>

            {/* Linha de Base (Chão da Barra) */}
            <line
              x1={boomMarginLeft}
              y1={boomBaselineY}
              x2={boomMarginLeft + boomPlotWidth}
              y2={boomBaselineY}
              stroke="#94A3B8"
              strokeWidth="1.5"
            />

            {/* Renderização de Cada Bico ao Longo da Barra Horizontal */}
            {boomNozzles.map((item, idx) => {
              const colCenterX = boomMarginLeft + (idx + 0.5) * colWidth;
              const target = item.evaluation?.targetFlowRate ?? 0;
              const measured = item.slot?.measuredFlowRate ?? 0;
              const isActive = item.slot?.isActive ?? true;
              const isConforming = item.evaluation?.isConforming ?? false;
              const colorInfo = getSlotColorInfo(item.slot);

              // Faixa de tolerância ISO 16122 (+/- 10%)
              const tolMinY = boomFlowToY(target * 0.9);
              const tolMaxY = boomFlowToY(target * 1.1);
              const tolHeight = Math.max(2, tolMinY - tolMaxY);

              // Barra de Débito Medido
              const measuredY = boomFlowToY(measured);
              const measuredBarH = Math.max(0, boomBaselineY - measuredY);

              // Posição Y da marca teórica Q2
              const targetY = boomFlowToY(target);

              // Coordenadas do Círculo com a Cor do Bico (embaixo da barra)
              const badgeCy = boomBaselineY + 22;
              const badgeR = 11;
              const innerR = 7;

              return (
                <g key={item.slotKey}>
                  {/* Linha vertical divisória subtil entre bicos */}
                  {idx > 0 && idx !== numLevels && (
                    <line
                      x1={boomMarginLeft + idx * colWidth}
                      y1={boomMarginTop}
                      x2={boomMarginLeft + idx * colWidth}
                      y2={boomBaselineY}
                      stroke="#F1F5F9"
                      strokeWidth="0.8"
                    />
                  )}

                  {/* Faixa Sombreada de Tolerância Legal (+/- 10%) */}
                  {target > 0 && isActive && (
                    <rect
                      x={colCenterX - colWidth / 2 + 1}
                      y={tolMaxY}
                      width={Math.max(2, colWidth - 2)}
                      height={tolHeight}
                      fill="#ECFDF5"
                      stroke="#A7F3D0"
                      strokeWidth="0.8"
                      rx="2"
                      opacity="0.85"
                    >
                      <title>
                        {`${item.displayLabel} - Faixa de tolerância ISO 16122: [${(
                          target * 0.9
                        ).toFixed(2)} - ${(target * 1.1).toFixed(2)}] l/min`}
                      </title>
                    </rect>
                  )}

                  {/* Marca de Débito Teórico Q2 (Traço Verde Horizontal) */}
                  {target > 0 && isActive && (
                    <line
                      x1={colCenterX - barWidth / 2 - 2}
                      y1={targetY}
                      x2={colCenterX + barWidth / 2 + 2}
                      y2={targetY}
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <title>{`Teórico Q2: ${target} l/min`}</title>
                    </line>
                  )}

                  {/* Barra Vertical de Débito Medido */}
                  {isActive ? (
                    measured > 0 ? (
                      <g>
                        <rect
                          x={colCenterX - barWidth / 2}
                          y={measuredY}
                          width={barWidth}
                          height={measuredBarH}
                          fill={isConforming ? '#2563EB' : '#EF4444'}
                          rx="3"
                        >
                          <title>
                            {`${item.displayLabel} (${
                              item.side === 'left' ? 'Secção Esquerda' : 'Secção Direita'
                            }) • Medido: ${measured} l/min (${
                              item.evaluation?.deviationPercent !== null
                                ? `${item.evaluation?.deviationPercent}%`
                                : ''
                            })`}
                          </title>
                        </rect>

                        {/* Valor Numérico do Débito Acima da Barra */}
                        <text
                          x={colCenterX}
                          y={measuredY - 5}
                          textAnchor="middle"
                          className="text-[7.5px] font-mono font-bold fill-slate-700"
                        >
                          {measured}
                        </text>
                      </g>
                    ) : (
                      <text
                        x={colCenterX}
                        y={boomBaselineY - 6}
                        textAnchor="middle"
                        className="text-[7.5px] font-mono fill-slate-300 font-bold"
                      >
                        --
                      </text>
                    )
                  ) : (
                    <text
                      x={colCenterX}
                      y={boomBaselineY - 8}
                      textAnchor="middle"
                      className="text-[7px] italic fill-slate-300 font-semibold"
                    >
                      Off
                    </text>
                  )}

                  {/* Círculo do Bico com a Cor de Catálogo e Rótulo (N1, N2, ..., N2x) */}
                  <g className="cursor-pointer">
                    <title>
                      {`${item.displayLabel} (${
                        item.side === 'left' ? 'Secção Esquerda' : 'Secção Direita'
                      })\nBico: ${colorInfo.name}\nMedido: ${
                        measured > 0 ? `${measured} l/min` : 'Não medido'
                      }\nTeórico Q2: ${target > 0 ? `${target} l/min` : '--'}${
                        item.evaluation?.deviationPercent !== null
                          ? `\nDesvio: ${item.evaluation?.deviationPercent}%`
                          : ''
                      }`}
                    </title>

                    {/* Círculo Externo com a Cor do Bico */}
                    <circle
                      cx={colCenterX}
                      cy={badgeCy}
                      r={badgeR}
                      fill={colorInfo.hex}
                      stroke="#CBD5E1"
                      strokeWidth="1"
                    />

                    {/* Núcleo Central Branco de Alto Contraste */}
                    <circle
                      cx={colCenterX}
                      cy={badgeCy}
                      r={innerR}
                      fill="#FFFFFF"
                      stroke="#E2E8F0"
                      strokeWidth="0.8"
                    />

                    {/* Rótulo do Bico (N1, N2, ..., N20) */}
                    <text
                      x={colCenterX}
                      y={badgeCy + (item.index >= 10 ? 2.5 : 3)}
                      textAnchor="middle"
                      className={`${
                        item.index >= 10 ? 'text-[7px]' : 'text-[8px]'
                      } font-black fill-slate-800 tracking-tight pointer-events-none select-none`}
                    >
                      {item.displayLabel}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        ) : (
          /* ================================================================ */
          /* MODO ISO 16122-3: BORBOLETA BILATERAL (CULTURAS 3D / ARBÓREAS)   */
          /* ================================================================ */
          <svg
            viewBox={`0 0 ${bilateralWidth} ${bilateralHeight}`}
            className="w-full h-auto max-h-[calc(100vh-320px)]"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Fundo do Gráfico */}
            <rect width={bilateralWidth} height={bilateralHeight} fill="#FAFAFA" rx="12" />

            {/* Cabeçalho do Eixo X */}
            <g transform="translate(0, 22)">
              {/* Lado Esquerdo */}
              <text
                x={centerX - centerGap - 10}
                y="0"
                textAnchor="end"
                className="text-[11px] font-bold fill-slate-700 uppercase"
              >
                ← Lado Esquerdo ({maxFlow} l/min máx)
              </text>

              {/* Centro */}
              <text
                x={centerX}
                y="0"
                textAnchor="middle"
                className="text-[10px] font-extrabold fill-slate-400 uppercase tracking-widest"
              >
                NÍVEL
              </text>

              {/* Lado Direito */}
              <text
                x={centerX + centerGap + 10}
                y="0"
                textAnchor="start"
                className="text-[11px] font-bold fill-slate-700 uppercase"
              >
                Lado Direito ({maxFlow} l/min máx) →
              </text>
            </g>

            {/* Linha Central Vertical do Pulverizador */}
            <line
              x1={centerX}
              y1={bilateralHeaderHeight - 8}
              x2={centerX}
              y2={bilateralHeight - bilateralFooterHeight + 8}
              stroke="#CBD5E1"
              strokeWidth="2"
              strokeDasharray="4 2"
            />

            {/* Linhas de Grelha de Fundo do Eixo X */}
            {[0.25, 0.5, 0.75, 1.0].map((frac) => {
              const flowVal = Number((maxFlow * frac).toFixed(2));
              const pxOffset = sideWidth * frac;

              return (
                <g key={frac}>
                  {/* Linha e Rótulo Esquerdo */}
                  <line
                    x1={centerX - centerGap - pxOffset}
                    y1={bilateralHeaderHeight}
                    x2={centerX - centerGap - pxOffset}
                    y2={bilateralHeight - bilateralFooterHeight}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  <text
                    x={centerX - centerGap - pxOffset}
                    y={bilateralHeight - bilateralFooterHeight + 16}
                    textAnchor="middle"
                    className="text-[8px] font-mono fill-slate-400"
                  >
                    {flowVal}
                  </text>

                  {/* Linha e Rótulo Direito */}
                  <line
                    x1={centerX + centerGap + pxOffset}
                    y1={bilateralHeaderHeight}
                    x2={centerX + centerGap + pxOffset}
                    y2={bilateralHeight - bilateralFooterHeight}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  <text
                    x={centerX + centerGap + pxOffset}
                    y={bilateralHeight - bilateralFooterHeight + 16}
                    textAnchor="middle"
                    className="text-[8px] font-mono fill-slate-400"
                  >
                    {flowVal}
                  </text>
                </g>
              );
            })}

            {/* Linhas de Cada Nível */}
            {rows.map((row, idx) => {
              const y = bilateralHeaderHeight + idx * bilateralRowHeight;
              const barThickness = 8;
              const barGap = 2;

              // Dados Lado Esquerdo
              const leftTarget = row.leftEval?.targetFlowRate ?? 0;
              const leftMeasured = row.leftSlot?.measuredFlowRate ?? 0;
              const leftIsActive = row.leftSlot?.isActive ?? true;
              const leftTargetPx = flowToPixelsBilateral(leftTarget);
              const leftMeasuredPx = flowToPixelsBilateral(leftMeasured);
              const leftIsConforming = row.leftEval?.isConforming ?? false;

              // Dados Lado Direito
              const rightTarget = row.rightEval?.targetFlowRate ?? 0;
              const rightMeasured = row.rightSlot?.measuredFlowRate ?? 0;
              const rightIsActive = row.rightSlot?.isActive ?? true;
              const rightTargetPx = flowToPixelsBilateral(rightTarget);
              const rightMeasuredPx = flowToPixelsBilateral(rightMeasured);
              const rightIsConforming = row.rightEval?.isConforming ?? false;

              // Zona de Tolerância Legal (+/- 10%)
              const leftTolMinPx = flowToPixelsBilateral(leftTarget * 0.9);
              const leftTolMaxPx = flowToPixelsBilateral(leftTarget * 1.1);
              const rightTolMinPx = flowToPixelsBilateral(rightTarget * 0.9);
              const rightTolMaxPx = flowToPixelsBilateral(rightTarget * 1.1);

              // Cores dos Bicos dos Lados Esquerdo e Direito para o Rótulo Central
              const leftColor = getSlotColorInfo(row.leftSlot);
              const rightColor = getSlotColorInfo(row.rightSlot);
              const cy = bilateralRowHeight / 2;
              const circleRadius = 12.5;
              const innerRadius = 7.5;

              return (
                <g key={row.level} transform={`translate(0, ${y})`}>
                  {/* Linha Divisória de Fundo */}
                  <line
                    x1="16"
                    y1={bilateralRowHeight - 1}
                    x2={bilateralWidth - 16}
                    y2={bilateralRowHeight - 1}
                    stroke="#F1F5F9"
                    strokeWidth="1"
                  />

                  {/* Rótulo Central do Nível com Círculo Bicolor Dividido a Meio (Esq | Dir) */}
                  <g className="cursor-pointer">
                    <title>
                      {`Nível ${row.level} • Bico Esq: ${leftColor.name} | Bico Dir: ${rightColor.name}`}
                    </title>
                    {/* Semicírculo Esquerdo (Cor do Bico do Lado Esquerdo) */}
                    <path
                      d={`M ${centerX} ${cy - circleRadius} A ${circleRadius} ${circleRadius} 0 0 0 ${centerX} ${cy + circleRadius} Z`}
                      fill={leftColor.hex}
                    />
                    {/* Semicírculo Direito (Cor do Bico do Lado Direito) */}
                    <path
                      d={`M ${centerX} ${cy - circleRadius} A ${circleRadius} ${circleRadius} 0 0 1 ${centerX} ${cy + circleRadius} Z`}
                      fill={rightColor.hex}
                    />
                    {/* Linha Divisória Vertical Branca */}
                    <line
                      x1={centerX}
                      y1={cy - circleRadius}
                      x2={centerX}
                      y2={cy + circleRadius}
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                    />
                    {/* Contorno Exterior de Acabamento */}
                    <circle
                      cx={centerX}
                      cy={cy}
                      r={circleRadius}
                      fill="none"
                      stroke="#CBD5E1"
                      strokeWidth="1"
                    />
                    {/* Núcleo Central Branco de Alto Contraste para o Rótulo N1..Nn */}
                    <circle
                      cx={centerX}
                      cy={cy}
                      r={innerRadius}
                      fill="#FFFFFF"
                      stroke="#E2E8F0"
                      strokeWidth="0.8"
                    />
                    {/* Rótulo do Nível */}
                    <text
                      x={centerX}
                      y={cy + (row.level >= 10 ? 2.5 : 3)}
                      textAnchor="middle"
                      className={`${
                        row.level >= 10 ? 'text-[7.5px]' : 'text-[8.5px]'
                      } font-black fill-slate-800 tracking-tight pointer-events-none select-none`}
                    >
                      N{row.level}
                    </text>
                  </g>

                  {/* ======================================================== */}
                  {/* LADO ESQUERDO (Desenha do Centro para a Esquerda)       */}
                  {/* ======================================================== */}
                  {leftIsActive ? (
                    <g>
                      {/* Zona Sombreada de Tolerância Legal +/- 10% */}
                      {leftTarget > 0 && (
                        <rect
                          x={centerX - centerGap - leftTolMaxPx}
                          y="4"
                          width={Math.max(2, leftTolMaxPx - leftTolMinPx)}
                          height={bilateralRowHeight - 8}
                          fill="#ECFDF5"
                          stroke="#A7F3D0"
                          strokeWidth="1"
                          rx="2"
                          opacity="0.8"
                        >
                          <title>
                            Nível {row.level} Esq - Faixa de tolerância ISO 16122: [
                            {(leftTarget * 0.9).toFixed(2)} - {(leftTarget * 1.1).toFixed(2)}] l/min
                          </title>
                        </rect>
                      )}

                      {/* Barra Superior: Débito Teórico Q2 (Verde) */}
                      {leftTargetPx > 0 && (
                        <rect
                          x={centerX - centerGap - leftTargetPx}
                          y="7"
                          width={leftTargetPx}
                          height={barThickness}
                          fill="#10B981"
                          rx="3"
                        >
                          <title>Teórico Q2: {leftTarget} l/min</title>
                        </rect>
                      )}

                      {/* Barra Inferior: Débito Medido Real */}
                      {leftMeasuredPx > 0 && (
                        <rect
                          x={centerX - centerGap - leftMeasuredPx}
                          y={7 + barThickness + barGap}
                          width={leftMeasuredPx}
                          height={barThickness}
                          fill={leftIsConforming ? '#2563EB' : '#EF4444'}
                          rx="3"
                        >
                          <title>
                            Medido: {leftMeasured} l/min (
                            {row.leftEval?.deviationPercent !== null
                              ? `${row.leftEval?.deviationPercent}%`
                              : ''}
                            )
                          </title>
                        </rect>
                      )}

                      {/* Valor Numérico ao lado da barra */}
                      {leftMeasured > 0 && (
                        <text
                          x={centerX - centerGap - leftMeasuredPx - 5}
                          y={7 + barThickness + barGap + 7}
                          textAnchor="end"
                          className="text-[8px] font-mono font-bold fill-slate-700"
                        >
                          {leftMeasured}
                        </text>
                      )}
                    </g>
                  ) : (
                    <text
                      x={centerX - centerGap - 10}
                      y={bilateralRowHeight / 2 + 3}
                      textAnchor="end"
                      className="text-[9px] italic fill-slate-300 font-semibold"
                    >
                      Bico Fechado / Inativo
                    </text>
                  )}

                  {/* ======================================================== */}
                  {/* LADO DIREITO (Desenha do Centro para a Direita)         */}
                  {/* ======================================================== */}
                  {rightIsActive ? (
                    <g>
                      {/* Zona Sombreada de Tolerância Legal +/- 10% */}
                      {rightTarget > 0 && (
                        <rect
                          x={centerX + centerGap + rightTolMinPx}
                          y="4"
                          width={Math.max(2, rightTolMaxPx - rightTolMinPx)}
                          height={bilateralRowHeight - 8}
                          fill="#ECFDF5"
                          stroke="#A7F3D0"
                          strokeWidth="1"
                          rx="2"
                          opacity="0.8"
                        >
                          <title>
                            Nível {row.level} Dir - Faixa de tolerância ISO 16122: [
                            {(rightTarget * 0.9).toFixed(2)} - {(rightTarget * 1.1).toFixed(2)}] l/min
                          </title>
                        </rect>
                      )}

                      {/* Barra Superior: Débito Teórico Q2 (Verde) */}
                      {rightTargetPx > 0 && (
                        <rect
                          x={centerX + centerGap}
                          y="7"
                          width={rightTargetPx}
                          height={barThickness}
                          fill="#10B981"
                          rx="3"
                        >
                          <title>Teórico Q2: {rightTarget} l/min</title>
                        </rect>
                      )}

                      {/* Barra Inferior: Débito Medido Real */}
                      {rightMeasuredPx > 0 && (
                        <rect
                          x={centerX + centerGap}
                          y={7 + barThickness + barGap}
                          width={rightMeasuredPx}
                          height={barThickness}
                          fill={rightIsConforming ? '#2563EB' : '#EF4444'}
                          rx="3"
                        >
                          <title>
                            Medido: {rightMeasured} l/min (
                            {row.rightEval?.deviationPercent !== null
                              ? `${row.rightEval?.deviationPercent}%`
                              : ''}
                            )
                          </title>
                        </rect>
                      )}

                      {/* Valor Numérico ao lado da barra */}
                      {rightMeasured > 0 && (
                        <text
                          x={centerX + centerGap + rightMeasuredPx + 5}
                          y={7 + barThickness + barGap + 7}
                          textAnchor="start"
                          className="text-[8px] font-mono font-bold fill-slate-700"
                        >
                          {rightMeasured}
                        </text>
                      )}
                    </g>
                  ) : (
                    <text
                      x={centerX + centerGap + 10}
                      y={bilateralRowHeight / 2 + 3}
                      textAnchor="start"
                      className="text-[9px] italic fill-slate-300 font-semibold"
                    >
                      Bico Fechado / Inativo
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {testPressureBar === null && (
        <div className="mt-2 text-center text-xs text-amber-600 font-semibold bg-amber-50 p-1.5 rounded-lg border border-amber-200">
          Insira a Pressão de Ensaio (P2) para visualizar as barras de débito teórico e a faixa de tolerância legal.
        </div>
      )}
    </div>
  );
};

export default SmartDebitoGrafico;
