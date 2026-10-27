import fs from 'node:fs';

const ptAgrosmart = {
  badge: "Projeto n.º 23703",
  title: "Projeto AgroSmart DATERRA",
  subtitle: "Digitalização do apoio técnico às operações de proteção das culturas.",
  bannerAlt: "Entidades financiadoras do Projeto AgroSmart DATERRA: Recuperar Portugal, PRR, República Portuguesa e União Europeia NextGenerationEU.",
  objectiveTitle: "O objetivo do projeto",
  objectiveP1: "O Projeto AgroSmart DATERRA foi desenvolvido para aproximar o conhecimento técnico das necessidades práticas de agricultores, técnicos agrícolas, consultores e empresas do setor.",
  objectiveP2: "Através de ferramentas digitais orientadas para o terreno, o projeto procurou apoiar a preparação de operações, os cálculos técnicos, a calibração de equipamentos e a consulta de informação útil para as operações de proteção das culturas.",
  firstVersionTitle: "Primeira versão operacional da DATERRA Smart",
  firstVersionP1: "No âmbito do Projeto AgroSmart DATERRA foi desenvolvida a primeira versão operacional da aplicação móvel DATERRA Smart, disponibilizada para dispositivos Android e iOS.",
  firstVersionP2: "A aplicação disponibiliza ferramentas de apoio a cálculos técnicos, preparação de caldas, calibração de equipamentos e consulta de informação técnica em contexto de campo.",
  evolutionTitle: "DATERRA Smart em evolução",
  evolutionP1: "A DATERRA Smart continua a evoluir como plataforma digital da DATERRA, reforçando progressivamente o apoio aos profissionais agrícolas com ferramentas práticas, informação técnica e funcionalidades orientadas para o trabalho no campo.",
  evolutionP2: "A evolução contínua da plataforma procura responder às necessidades de agricultores, técnicos, consultores e empresas agrícolas, mantendo o foco na utilidade, clareza e rigor técnico.",
  infoTitle: "Informação do projeto",
  designationLabel: "Designação do Projeto",
  designationValue: "AgroSmart DATERRA",
  numberLabel: "Número do Projeto",
  numberValue: "Projeto n.º 23703",
  beneficiaryLabel: "Beneficiário",
  beneficiaryValue: "DATERRA, Lda.",
  nipcLabel: "NIPC",
  measureLabel: "Medida",
  measureValue: "Vouchers para Startups — Novos Produtos Digitais e Tecnológicos",
  noticeLabel: "Aviso de Candidatura",
  periodLabel: "Período de Execução",
  periodValue: "1 de agosto de 2025 a 30 de junho de 2026",
  statusLabel: "Estado",
  statusValue: "Projeto concluído, em processo de avaliação",
  fundingNote: "Apoiado pelo ecossistema de Vouchers para Startups, financiado pelo Plano de Recuperação e Resiliência (PRR) e pelos fundos Europeus NextGenerationEU.",
  downloadTitle: "Descarregar a aplicação DATERRA Smart",
  downloadDesc: "A primeira versão operacional da DATERRA Smart está disponível para dispositivos Android e iOS.",
  googlePlay: "Disponível no Google Play",
  appStore: "Disponível na App Store",
  disclaimer: "As ferramentas digitais disponibilizadas destinam-se a apoiar a preparação e a decisão técnica. Devem ser utilizadas em articulação com o rótulo dos produtos, a legislação aplicável, as recomendações dos fabricantes e, quando necessário, a orientação de técnicos habilitados."
};

const enAgrosmart = {
  badge: "Project No. 23703",
  title: "AgroSmart DATERRA Project",
  subtitle: "Digitisation of technical support for crop protection operations.",
  bannerAlt: "Funding bodies for the AgroSmart DATERRA Project: Recuperar Portugal, PRR, Portuguese Republic and European Union NextGenerationEU.",
  objectiveTitle: "Project Objective",
  objectiveP1: "The AgroSmart DATERRA Project was developed to bridge technical knowledge with the practical needs of farmers, agricultural technicians, advisors and sector enterprises.",
  objectiveP2: "Through field-oriented digital tools, the project aimed to support operational planning, technical calculations, equipment calibration and reference information retrieval for crop protection tasks.",
  firstVersionTitle: "First Operational Version of DATERRA Smart",
  firstVersionP1: "Under the AgroSmart DATERRA Project, the first operational version of the DATERRA Smart mobile application was engineered and released for Android and iOS devices.",
  firstVersionP2: "The application provides decision-support tools for technical calculations, spray mixture preparation, equipment calibration and in-field technical reference.",
  evolutionTitle: "DATERRA Smart Evolution",
  evolutionP1: "DATERRA Smart continues to evolve as DATERRA's digital platform, steadily reinforcing practical support for farming professionals with field-focused tools, technical data and workflows.",
  evolutionP2: "Continuous platform enhancements aim to serve farmers, agronomists, advisors and agricultural enterprises while preserving utility, clarity and technical precision.",
  infoTitle: "Project Information",
  designationLabel: "Project Designation",
  designationValue: "AgroSmart DATERRA",
  numberLabel: "Project Number",
  numberValue: "Project No. 23703",
  beneficiaryLabel: "Beneficiary",
  beneficiaryValue: "DATERRA, Lda.",
  nipcLabel: "Tax ID (NIPC)",
  measureLabel: "Measure",
  measureValue: "Vouchers for Startups — New Digital and Technological Products",
  noticeLabel: "Call Notice",
  periodLabel: "Execution Period",
  periodValue: "1 August 2025 to 30 June 2026",
  statusLabel: "Status",
  statusValue: "Project completed, currently under evaluation",
  fundingNote: "Supported by the Startups Voucher ecosystem, funded by the Recovery and Resilience Plan (PRR) and European NextGenerationEU funds.",
  downloadTitle: "Download DATERRA Smart App",
  downloadDesc: "The first operational release of DATERRA Smart is available for Android and iOS mobile devices.",
  googlePlay: "Available on Google Play",
  appStore: "Available on App Store",
  disclaimer: "The digital tools provided are intended to assist in technical planning and decision-making. They must be used in conjunction with product labels, applicable legislation, manufacturer guidelines and, where required, certified agronomic advice."
};

const ptFiles = ['src/i18n/locales/pt-PT.json', 'src/i18n/locales/pt.json'];
const enFiles = ['src/i18n/locales/en-GB.json', 'src/i18n/locales/en.json'];

for (const f of ptFiles) {
  const json = JSON.parse(fs.readFileSync(f, 'utf8'));
  json.projetoAgrosmart = ptAgrosmart;
  fs.writeFileSync(f, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`Updated ${f}`);
}

for (const f of enFiles) {
  const json = JSON.parse(fs.readFileSync(f, 'utf8'));
  json.projetoAgrosmart = enAgrosmart;
  fs.writeFileSync(f, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`Updated ${f}`);
}
