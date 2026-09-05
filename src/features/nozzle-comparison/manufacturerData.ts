import type { ManufacturerInfo } from './nozzleComparison.types';

/**
 * Base de Dados Oficial de Metadados Comerciais de Fabricantes de Bicos
 * Fonte: fabricantes_bicos_pulverizacao_nichos.csv
 */
export const MANUFACTURERS_DATABASE: Record<string, ManufacturerInfo> = {
  'Albuz': {
    brand: 'Albuz',
    country: 'França',
    businessGroup: 'Solcera / CoorsTek',
    niche: 'Alta precisão em cerâmica de alumina',
    website: 'https://www.albuz-spray.com',
    technicalCatalog: 'Catálogo Oficial Albuz',
    productLines: 'ATR, ATI, CVI, ADI, APE, AVI, TVI, OCI, Disc & Core',
    declaredTechnology: 'Cerâmica rosa de alumina de extrema dureza e resistência ao desgaste',
    availableSources: 'Catálogo Geral Albuz / Certificação DGAV / JKI',
    verificationDate: '2026-09-02',
    sourceStatus: 'Fonte técnica verificada'
  },
  'ASJ': {
    brand: 'ASJ',
    country: 'Itália',
    businessGroup: 'Arag / Nordson Corporation',
    niche: 'Bicos cerâmicos e polímeros de alta precisão',
    website: 'https://www.asj.it',
    technicalCatalog: 'ASJ Nozzle Chart',
    productLines: 'HCA, CFA, SF, OC, TFA, WRC, Disc & Core, HP15',
    declaredTechnology: 'Bicos em cerâmica e poliacetal (POM) para atomizadores e barras de culturas baixas',
    availableSources: 'Catálogo Técnico ASJ Spray-Jet / Grupo Arag',
    verificationDate: '2026-09-02',
    sourceStatus: 'Fonte técnica verificada'
  },
  'TeeJet': {
    brand: 'TeeJet',
    country: 'EUA',
    businessGroup: 'Spraying Systems Co.',
    niche: 'Líder global absoluto em agricultura de precisão e bicos industriais',
    website: 'https://www.teejet.com',
    technicalCatalog: 'TeeJet Agricultural Spray Products Catalog 51A',
    productLines: 'XR, AIXR, TT, TTI, Turbo TeeJet, AIC, ConeJet, TXR, TurboDrop',
    declaredTechnology: 'Tecnologias patenteadas de indução de ar e câmaras duplas de redução de deriva',
    availableSources: 'Catálogo de Aplicação Agrícola TeeJet',
    verificationDate: '2026-09-02',
    sourceStatus: 'Fonte técnica verificada'
  },
  'Lechler': {
    brand: 'Lechler',
    country: 'Alemanha',
    businessGroup: 'Lechler GmbH',
    niche: 'Tecnologia de pulverização agrícola e industrial premium (líder em bicos de indução de ar)',
    website: 'https://www.lechler.com',
    technicalCatalog: 'Lechler Agrar-Düsen Katalog',
    productLines: 'IDK, IDKN, ID3, IDKT, LU, ST, TR, ITR, IS, AD',
    declaredTechnology: 'Design de câmara de injeção de ar integrada com gotas resistentes à deriva (JKI 90%)',
    availableSources: 'Catálogo Agrícola Lechler GmbH',
    verificationDate: '2026-09-02',
    sourceStatus: 'Fonte técnica verificada'
  },
  'Hardi': {
    brand: 'Hardi',
    country: 'Dinamarca',
    businessGroup: 'Exel Industries',
    niche: 'Sistemas integrados de pulverização e bicos dedicados a equipamentos Hardi',
    website: 'https://www.hardi-international.com',
    technicalCatalog: 'Hardi Nozzle Guide',
    productLines: 'ISO Flat Fan, Injet, Minidrift, Quinquint, 1553 Foam, Duo',
    declaredTechnology: 'Sistemas de encaixe rápido ISO e SNAP-FIT com controlo calibrado de vazão',
    availableSources: 'Guia de Bicos Hardi International',
    verificationDate: '2026-09-02',
    sourceStatus: 'Fonte técnica verificada'
  },
  'Pentair Hypro': {
    brand: 'Pentair Hypro',
    country: 'EUA / Reino Unido',
    businessGroup: 'Pentair plc',
    niche: 'Bicos de indução de ar e bombagem integrada de fluidos',
    website: 'https://www.pentair.com',
    technicalCatalog: 'Hypro Spray Products Catalog',
    productLines: 'Guardian, GuardianAIR, Ultra Lo-Drift, Hi-Flow, 3D, VP',
    declaredTechnology: 'Geometria inclinada de jato (3D Nozzle) e tecnologia Air-Inclusion para penetração otimizada',
    availableSources: 'Catálogo Técnico Hypro / Pentair',
    verificationDate: '2026-09-02',
    sourceStatus: 'Fonte técnica verificada'
  },
  'Nozal': {
    brand: 'Nozal',
    country: 'França',
    businessGroup: 'Exel Industries',
    niche: 'Bicos para grandes culturas e distribuição controlada na Europa',
    website: 'https://www.nozal.fr',
    technicalCatalog: 'Guide des Buses Nozal',
    productLines: 'AFX, ARX, ADX, R5X, KVS, KWIX',
    declaredTechnology: 'Bicos anti-deriva de leque plano com tampas kwix integradas',
    availableSources: 'Catálogo Geral Nozal France',
    verificationDate: '2026-09-02',
    sourceStatus: 'Fonte técnica verificada'
  },
  'Braglia': {
    brand: 'Braglia',
    country: 'Itália',
    businessGroup: 'Braglia S.r.l.',
    niche: 'Componentes e bicos para atomizadores e culturas arbóreas (vinhas e pomares)',
    website: 'https://www.braglia.it',
    technicalCatalog: 'Catalogo Generale Braglia Componenti',
    productLines: 'Pastilhas de cerâmica, Difusores espiralados, Porta-bicos duplos, M28',
    declaredTechnology: 'Componentes em latão e cerâmica de alta pressão para tratamentos em pomares e vinhas',
    availableSources: 'Catálogo Técnico Braglia S.r.l.',
    verificationDate: '2026-09-02',
    sourceStatus: 'Fonte técnica verificada'
  },
  'Billericay': {
    brand: 'Billericay (BFS)',
    country: 'Reino Unido',
    businessGroup: 'Billericay Farm Services Ltd',
    niche: 'Bicos de indução de ar (Air Bubble Jet) para redução de deriva',
    website: 'Não disponível',
    technicalCatalog: 'BFS Air Bubble Jet Technical Guide',
    productLines: 'Air Bubble Jet, Auto-Drift',
    declaredTechnology: 'Bicos com bolhas de ar encapsuladas para aplicação precisa',
    availableSources: 'Publicações BFS',
    verificationDate: '2026-09-02',
    sourceStatus: 'Dados de catálogo'
  },
  'Delavan': {
    brand: 'Delavan',
    country: 'EUA / Reino Unido',
    businessGroup: 'Delavan Spray Technologies (RTX)',
    niche: 'Aplicações industriais e bicos de alta pressão',
    website: 'Não disponível',
    technicalCatalog: 'Delavan Industrial & Agricultural Nozzles',
    productLines: 'ColorBrite, ProTec, Raindrop',
    declaredTechnology: 'Bicos Raindrop para eliminação de gotas finas',
    availableSources: 'Catálogo Delavan',
    verificationDate: '2026-09-02',
    sourceStatus: 'Dados de catálogo'
  },
  'Wilger': {
    brand: 'Wilger',
    country: 'Canadá',
    businessGroup: 'Wilger Industries Ltd',
    niche: 'Sistemas ComboJet de tampa/bico integrado e controlo de deriva por PWM',
    website: 'Não disponível',
    technicalCatalog: 'Wilger ComboJet Tip Selection Guide',
    productLines: 'ComboJet ER, SR, MR, DR, UR',
    declaredTechnology: 'Bicos com ponta e tampa integradas otimizados para modulação por largura de pulso (PWM)',
    availableSources: 'Guia Técnico Wilger',
    verificationDate: '2026-09-02',
    sourceStatus: 'Dados de catálogo'
  },
  'Magnojet': {
    brand: 'Magnojet',
    country: 'Brasil',
    businessGroup: 'Magnojet (Independente)',
    niche: 'Líder na América Latina, bicos cerâmicos robustos para grandes extensões de soja e milho',
    website: 'Não disponível',
    technicalCatalog: 'Catálogo de Pontas Magnojet',
    productLines: 'MGA, ST-IA, BD, CV-IA',
    declaredTechnology: 'Cerâmica com teor 99% de alumina para longa durabilidade sob suspensões concentradas',
    availableSources: 'Catálogo Magnojet',
    verificationDate: '2026-09-02',
    sourceStatus: 'Dados de catálogo'
  },
  'Greenleaf Technologies': {
    brand: 'Greenleaf Technologies',
    country: 'EUA',
    businessGroup: 'Greenleaf Technologies',
    niche: 'Especialista em bicos TurboDrop para máxima redução de deriva',
    website: 'Não disponível',
    technicalCatalog: 'TurboDrop Selection Chart',
    productLines: 'TurboDrop, AirMix, DualFan',
    declaredTechnology: 'Injetor Venturi patenteado acoplado a bico de distribuição para redução de deriva até 90%',
    availableSources: 'Publicações Greenleaf',
    verificationDate: '2026-09-02',
    sourceStatus: 'Dados de catálogo'
  }
};

/**
 * Procura os metadados comerciais do fabricante pelo nome da marca.
 */
export function getManufacturerInfo(brandName?: string): ManufacturerInfo | undefined {
  if (!brandName) return undefined;
  
  const brandTrimmed = brandName.trim();
  if (MANUFACTURERS_DATABASE[brandTrimmed]) {
    return MANUFACTURERS_DATABASE[brandTrimmed];
  }

  // Tentar casamento por substring (ex: "Hypro" -> "Pentair Hypro", "Arag" -> "ASJ")
  const brandLower = brandTrimmed.toLowerCase();
  for (const [key, val] of Object.entries(MANUFACTURERS_DATABASE)) {
    if (key.toLowerCase().includes(brandLower) || brandLower.includes(key.toLowerCase())) {
      return val;
    }
  }

  return {
    brand: brandTrimmed,
    country: 'Não disponível',
    businessGroup: 'Não disponível',
    niche: 'Informação comercial do fabricante não catalogada',
    website: 'Não disponível',
    technicalCatalog: 'Não disponível',
    productLines: 'Não disponível',
    declaredTechnology: 'Não disponível',
    availableSources: 'Não disponível',
    verificationDate: '2026-09-02',
    sourceStatus: 'Não disponível'
  };
}
