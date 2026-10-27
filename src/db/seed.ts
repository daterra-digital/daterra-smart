// src/db/seed.ts
import type { DaterraDatabase } from './db.ts';
import { INITIAL_ACTIVE_SUBSTANCES } from '../features/verificador-ph/data.ts';

export async function seedMicrolearningIfEmpty(db: DaterraDatabase) {
  const existingCount = await db.microlearning_content.count();
  if (existingCount === 0) {
    await db.microlearning_content.bulkAdd([
      {
        field_key: 'calc_concentracao',
        title: 'Mistura de Calda (Concentração)',
        content: `[FAQ: Qual é a função desta calculadora?]
- Determina a quantidade exata de Produto Fitofarmacêutico a adicionar ao depósito para um determinado volume de calda a preparar.

[FAQ: O que é o modo Planta Jovem?]
- É indicado para fases iniciais da cultura com reduzida área foliar.
- A quantidade de produto no depósito é calculada diretamente a partir da concentração do rótulo e do volume do depósito.

[FAQ: O que é o modo Planta Adulta?]
- É indicado para pomares e vinhas em pleno desenvolvimento da copa vegetal.
- Ajusta a quantidade de produto no depósito considerando a relação entre o volume recomendado no rótulo e o volume real aplicado pelo pulverizador.`,
        formula: `Planta Jovem: Q_p = (C × C_d) / 100\nPlanta Adulta: Q_p = (C_d × C × V_r) / (V_a × 100)`,
        unit_explanation: `Q_p : Quantidade de Produto no Depósito (mL ou g)\nC_d : Volume a Preparar no Depósito (L)\nC : Concentração do Rótulo (mL/hL, g/hL ou %)\nV_r : Volume Recomendado (L/ha)\nV_a : Volume Aplicado (L/ha)`
      },
      {
        field_key: 'calc_dose',
        title: 'Mistura de Calda (Dose)',
        content: `[FAQ: Qual é a função desta calculadora?]
- Converte a dose autorizada no rótulo (L/ha ou kg/ha) na quantidade exata de produto comercial a adicionar por depósito, com base no volume de calda calibrado no equipamento.

[FAQ: Como calcular a área coberta por cada tanque cheio?]
- Divida a capacidade do depósito pelo volume de calda real aplicado por hectare. Exemplo: 1.000 L / 200 L/ha = 5,0 hectares tratados por tanque.`,
        formula: `Q_p = (C_d × D × 1.000) / V_a\nÁrea (ha) = C_d / V_a`,
        unit_explanation: `Q_p : Quantidade de Produto no Depósito (mL ou g)\nC_d : Volume a Preparar (L)\nD : Dose Autorizada (L/ha ou kg/ha)\nV_a : Volume Aplicado (L/ha)`
      },
      {
        field_key: 'perfil_cultura',
        title: 'Perfil da Cultura & Geometria da Copa',
        content: `[FAQ: Qual a utilidade do registo de cultura?]
- O registo da cultura com variedade, estado fenológico e entrelinha permite calcular com precisão a dosagem de calda e ajustar o volume de copa (TRV).

[FAQ: O que é o Índice de Área Foliar (LAI)?]
- É a razão entre a área foliar total e a área de solo ocupada pela copa vegetal.`,
        formula: `TRV (m³/ha) = (10.000 × W × H) / W_w`,
        unit_explanation: `W_w : Entrelinha (m)\nW : Largura da Copa (m)\nH : Altura da Copa (m)`
      },
      {
        field_key: 'perfil_equipamento',
        title: 'Perfil do Equipamento de Pulverização',
        content: `[FAQ: Qual a importância de registar os dados do pulverizador?]
- Permite gerir as caraterísticas da bomba, filtros, comando e depósito para os ensaios de calibração segundo a norma ISO 16122.`,
        formula: `Débito da Bomba ≥ Débito Total Q_t + Agitação (≥5%)`,
        unit_explanation: `Capacidade : Litros (L)\nPressão : Bar (bar)`
      },
      {
        field_key: 'perfil_bicos',
        title: 'Perfil dos Bicos de Pulverização',
        content: `[FAQ: Como funciona a classificação ISO de bicos?]
- A cor do bico define o seu débito nominal a 3 bar de pressão segundo o código ISO 10625.

[FAQ: Qual a importância do tipo de bico?]
- Bicos de injeção de ar reduzem drasticamente a deriva em dias de vento.`,
        formula: `Q_bico (L/min) = (V_a × v × W_w) / (60.000 × N_bicos)`,
        unit_explanation: `Q_bico : Débito do Bico (L/min)\nÂngulo : Ângulo do Jato (60°, 80°, 110°)`
      },
      {
        field_key: 'perfil_calibracao',
        title: 'Perfil de Calibração & Ensaio em Branco',
        content: `[FAQ: O que é o ensaio de calibração?]
- É a medição em campo com água limpa para determinar a velocidade real, débito dos bicos e volume de calda aplicado por hectare.`,
        formula: `V_a (L/ha) = (600 × Q_t) / (v × W_w)`,
        unit_explanation: `v : Velocidade (km/h)\nQ_t : Débito Total (L/min)\nW_w : Largura de Trabalho (m)`
      }
    ]);
  }

  // Seed de ferramentas instaladas
  const installedCount = await db.installed_tools.count();
  if (installedCount === 0) {
    await db.installed_tools.bulkAdd([
      { tool_id: 'calc_concentracao', installed_at: new Date().toISOString() },
      { tool_id: 'calc_dose', installed_at: new Date().toISOString() },
      { tool_id: 'calc_area_parede_foliar', installed_at: new Date().toISOString() }
    ]);
  }

  // Seed inicial de perfis
  const culturesCount = await db.profiles_cultures.count();
  if (culturesCount === 0) {
    await db.profiles_cultures.bulkAdd([
      { name: 'Vinha da Encosta', crop_type: 'Vinha', variety: 'Touriga Nacional', area_ha: 4.5, row_distance_m: 2.2, phenological_stage: 'Floração', location: 'Quinta do Vale' },
      { name: 'Pomar Gala', crop_type: 'Macieira', variety: 'Royal Gala', area_ha: 8.2, row_distance_m: 4.0, phenological_stage: 'Vingamento', location: 'Gouveia' }
    ]);
  }

  const equipCount = await db.profiles_equipment.count();
  if (equipCount === 0) {
    await db.profiles_equipment.bulkAdd([
      { name: 'Atomizador Tomix 1000L', manufacturer: 'Tomix', model: 'Tornado 1000', tank_capacity_l: 1000, clean_water_tank_l: 100, max_pressure_bar: 20, recommended_pressure_bar: 12, nozzle_type: 'Albuz ATR Amarelo' },
      { name: 'Pulverizador Barra Rocha 600L', manufacturer: 'Rocha', model: 'Hydra 600', tank_capacity_l: 600, clean_water_tank_l: 60, max_pressure_bar: 15, recommended_pressure_bar: 3, nozzle_type: 'Lechler IDK Azul' }
    ]);
  }

  const nozzleCount = await db.profiles_nozzles.count();
  if (nozzleCount === 0) {
    await db.profiles_nozzles.bulkAdd([
      { manufacturer: 'Albuz', model: 'ATR 80', color: 'Amarelo', iso_classification: 'ISO 10625', nozzle_type: 'Cone Oco', spray_angle: '80°', working_pressure_bar: 10, nominal_flow_lmin: 1.03 },
      { manufacturer: 'Lechler', model: 'IDK', color: 'Azul', iso_classification: 'ISO 10625', nozzle_type: 'Injeção de Ar', spray_angle: '110°', working_pressure_bar: 3, nominal_flow_lmin: 1.20 }
    ]);
  }

  const calibCount = await db.profiles_calibrations.count();
  if (calibCount === 0) {
    await db.profiles_calibrations.bulkAdd([
      { working_speed_kmh: 6.5, working_pressure_bar: 10, working_width_m: 2.2, active_nozzles_count: 12, total_flow_lmin: 12.36, calculated_spray_volume_lha: 518.88 },
      { working_speed_kmh: 5.0, working_pressure_bar: 3, working_width_m: 12.0, active_nozzles_count: 24, total_flow_lmin: 28.80, calculated_spray_volume_lha: 288.00 }
    ]);
  }

  const activeSubstancesCount = await db.active_substances.count();
  if (activeSubstancesCount < INITIAL_ACTIVE_SUBSTANCES.length) {
    await db.active_substances.clear();
    await db.active_substances.bulkPut(INITIAL_ACTIVE_SUBSTANCES);
  }
}
