-- ==============================================================================
-- DATERRA Smart 2.0 - AI Chatbot & Modular Commercial Skills Engine
-- Migration: 20260928_agri_chat_skills.sql
-- Description: Tabelas de catálogo de skills oficiais, versões, direitos
--              de utilizador (SaaS), conversas e mensagens com RLS.
-- ==============================================================================

-- 1. Catálogo de Skills Agronómicas Oficiais
CREATE TABLE IF NOT EXISTS skills_catalog (
    id VARCHAR(50) PRIMARY KEY, -- 'geral', 'fitofarmacos', 'rega', 'fertilizacao', etc.
    name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL DEFAULT '1.0',
    slug VARCHAR(100) UNIQUE NOT NULL,
    short_description VARCHAR(255) NOT NULL,
    full_description TEXT,
    icon_name VARCHAR(50) NOT NULL DEFAULT 'Bot',
    badge_label VARCHAR(50) DEFAULT 'PRO',
    is_premium BOOLEAN NOT NULL DEFAULT TRUE,
    monthly_price_eur NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    system_prompt_domain VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Direitos de Acesso e Subscrições de Skills por Utilizador
CREATE TABLE IF NOT EXISTS user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id VARCHAR(50) NOT NULL REFERENCES skills_catalog(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'active', -- 'active', 'trial', 'expired', 'suspended'
    monthly_quota INT NOT NULL DEFAULT 300,
    queries_used INT NOT NULL DEFAULT 0,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_status ON user_skills(user_id, skill_id, status);

-- 3. Conversas de Chat (Sessões)
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id VARCHAR(50) NOT NULL REFERENCES skills_catalog(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL DEFAULT 'Nova Consulta Agronómica',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_skill ON chat_conversations(user_id, skill_id);

-- 4. Mensagens do Chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id VARCHAR(50) NOT NULL REFERENCES skills_catalog(id),
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    sources_json JSONB DEFAULT '[]'::jsonb,
    exploration_context_json JSONB DEFAULT '{}'::jsonb,
    tokens_used INT DEFAULT 0,
    is_guardrail_triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id, created_at ASC);

-- ==============================================================================
-- SEGURANÇA: ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE skills_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem visualizar skills ativas"
    ON skills_catalog FOR SELECT
    TO authenticated
    USING (is_active = TRUE);

CREATE POLICY "Utilizadores visualizam os seus próprios direitos de skills"
    ON user_skills FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Utilizadores acedem às suas conversas"
    ON chat_conversations FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilizadores acedem às suas mensagens"
    ON chat_messages FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- SEED DATA: Catálogo das 10 Skills Oficiais DATERRA Smart
-- ==============================================================================

INSERT INTO skills_catalog (id, name, version, slug, short_description, full_description, icon_name, badge_label, is_premium, monthly_price_eur, system_prompt_domain, display_order)
VALUES 
    ('geral', 'Geral', '1.0', 'geral', 'Apoio agronómico transversal, calibração base e boas práticas.', 'Consultoria geral para o dia-a-dia da exploração agrícola.', 'Sprout', 'INCLUÍDO', FALSE, 0.00, 'agronomy_general', 1),
    ('fitofarmacos', 'Fitofármacos', '2026.1 - DGAV', 'fitofarmacos', 'Base DGAV de substâncias ativas, APVs, intervalos de segurança e ZNT.', 'Proteção fitossanitária com base na regulamentação oficial portuguesa.', 'ShieldAlert', 'PRO', TRUE, 9.90, 'plant_protection_dgav', 2),
    ('rega', 'Rega', '1.0 - DGADR/FAO56', 'rega', 'Balanço hídrico, evapotranspiração, coeficientes Kc e tempos de rega.', 'Engenharia e gestão da água de rega suportada em dados de solo.', 'Droplets', 'PRO', TRUE, 9.90, 'irrigation_water_balance', 3),
    ('fertilizacao', 'Fertilização', '1.0 - DRAP/INIAV', 'fertilizacao', 'Planos de adubação, extração de nutrientes NPK e fertirrigação.', 'Cálculo de equilíbrios de nutrientes N-P-K-Mg-Ca e curvas de absorção.', 'Layers', 'PRO', TRUE, 9.90, 'plant_nutrition_fertilization', 4),
    ('solos', 'Solos', '1.0 - Textura & Fertilidade', 'solos', 'Física e química do solo, pH, matéria orgânica e condutividade.', 'Interpretação detalhada de análises laboratoriais de solos e textura.', 'Mountain', 'PRO', TRUE, 9.90, 'soil_science_fertility', 5),
    ('legislacao', 'Legislação', '2026.2 - Regulamentos UE/PT', 'legislacao', 'Diretiva Uso Sustentável, condicionalidade PEPAC e DL 91/2016.', 'Conformidade legal agrícola, zonas vulneráveis e cadernos de campo.', 'Scale', 'PRO', TRUE, 12.90, 'agricultural_legal_compliance', 6),
    ('globalgap', 'GlobalGAP', 'IFA v6', 'globalgap', 'Auditoria e conformidade segundo o referencial GlobalGAP IFA v6.', 'Pontos de Controlo e Critérios de Conformidade (PCCC) para Frutas e Legumes.', 'FileCheck2', 'PRO', TRUE, 14.90, 'globalgap_compliance_ifa_v6', 7),
    ('haccp', 'HACCP', 'Codex Alimentarius 2023', 'haccp', 'Segurança alimentar na produção primária, PCCs e higienização.', 'Análise de Perigos e Controlo de Pontos Críticos na pós-colheita.', 'CheckSquare', 'PRO', TRUE, 14.90, 'haccp_food_safety', 8),
    ('fisiologia', 'Fisiologia', '1.0 - BBCH & Morfologia', 'fisiologia', 'Escalas fenológicas BBCH, fotossíntese, gomo floral e maturação.', 'Fisiologia vegetal aplicada ao campo e respostas a stresse.', 'Activity', 'PRO', TRUE, 9.90, 'plant_physiology_phenology', 9),
    ('calibracao-equipamentos', 'Calibração de Equipamentos', 'ISO 16122 / EPPO', 'calibracao-equipamentos', 'Normas EPPO, ISO 16122, cruzamento com bicos, pulverizador e cultura.', 'Especialista em regulação de máquinas cruzando bicos, pulverizador e parcelas reais.', 'Gauge', 'PRO', TRUE, 9.90, 'equipment_calibration_eppo', 10)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    version = EXCLUDED.version,
    short_description = EXCLUDED.short_description,
    full_description = EXCLUDED.full_description,
    is_premium = EXCLUDED.is_premium,
    monthly_price_eur = EXCLUDED.monthly_price_eur,
    system_prompt_domain = EXCLUDED.system_prompt_domain;
