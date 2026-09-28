-- ==============================================================================
-- DATERRA Smart 2.0 - SprayOps Module
-- Migration: Drone Buffer Zone & Legal Compliance Engine (PostGIS)
-- Reference: Decreto-Lei n.º 91/2016, Diretivas DGAV, Diretiva Uso Sustentável UE
-- ==============================================================================

-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. GIS Sensitive Layers Table
CREATE TABLE IF NOT EXISTS legal_gis_layers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    layer_name VARCHAR(100) NOT NULL, -- 'WATER_BODIES', 'RESIDENTIAL', 'SCHOOLS', 'NATURA_2000'
    country_code VARCHAR(3) DEFAULT 'PRT',
    default_buffer_meters FLOAT NOT NULL DEFAULT 10.0,
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_legal_gis_geom ON legal_gis_layers USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_legal_gis_layer_name ON legal_gis_layers (layer_name);

-- 2. Product Legal Restrictions Table (DGAV SIFITO)
CREATE TABLE IF NOT EXISTS product_legal_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apv_number INT UNIQUE NOT NULL, -- Número de APV DGAV
    product_name VARCHAR(150) NOT NULL,
    aerial_application_allowed BOOLEAN DEFAULT TRUE,
    min_water_buffer_m FLOAT DEFAULT 10.0,
    min_residential_buffer_m FLOAT DEFAULT 50.0,
    max_wind_speed_ms FLOAT DEFAULT 4.17, -- 15 km/h limit DL 91/2016
    required_nozzle_drt_class VARCHAR(50) DEFAULT 'STANDARD' -- 'STANDARD', 'LOW_DRIFT_50', 'LOW_DRIFT_75'
);

CREATE INDEX IF NOT EXISTS idx_product_apv ON product_legal_restrictions(apv_number);

-- 3. Drone Operations Audit Table (Fiscalização DGAV & GlobalGAP)
CREATE TABLE IF NOT EXISTS drone_compliance_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    field_id UUID NOT NULL,
    operator_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'PERMITTED', 'RESTRICTED', 'PROHIBITED'
    field_total_area_ha FLOAT NOT NULL,
    sprayable_area_ha FLOAT NOT NULL,
    buffer_distance_applied_m FLOAT NOT NULL,
    wind_speed_ms FLOAT NOT NULL,
    wind_direction_deg FLOAT,
    flight_height_m FLOAT NOT NULL,
    drone_speed_ms FLOAT NOT NULL,
    nozzle_type VARCHAR(50) NOT NULL,
    violations_json JSONB DEFAULT '[]'::jsonb,
    mitigations_applied_json JSONB DEFAULT '[]'::jsonb,
    audit_pdf_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_drone_audits_org ON drone_compliance_audits(organization_id);
CREATE INDEX IF NOT EXISTS idx_drone_audits_field ON drone_compliance_audits(field_id);
CREATE INDEX IF NOT EXISTS idx_drone_audits_status ON drone_compliance_audits(status);

-- ==============================================================================
-- SEED DATA (Amostras de Referência para Validação e Testes)
-- ==============================================================================

-- Produtos Homologados DGAV
INSERT INTO product_legal_restrictions (apv_number, product_name, aerial_application_allowed, min_water_buffer_m, min_residential_buffer_m, max_wind_speed_ms, required_nozzle_drt_class)
VALUES 
    (9999, 'BioDefense DronePro X (Fungicida Biológico)', TRUE, 10.0, 50.0, 4.17, 'LOW_DRIFT_50'),
    (8888, 'AgroCure Cuprico Flow (Cobre Homologado)', TRUE, 15.0, 50.0, 4.17, 'STANDARD'),
    (1111, 'HerbTotal Max (Herbicida Não Homologado para Voo)', FALSE, 20.0, 100.0, 3.00, 'STANDARD')
ON CONFLICT (apv_number) DO UPDATE 
SET product_name = EXCLUDED.product_name,
    aerial_application_allowed = EXCLUDED.aerial_application_allowed,
    min_water_buffer_m = EXCLUDED.min_water_buffer_m,
    min_residential_buffer_m = EXCLUDED.min_residential_buffer_m;

-- Camadas GIS Sensíveis (Santarém / Bacia do Tejo - Polígonos de Teste)
-- Linha de água simulada próxima da latitude 39.545, longitude -8.605
INSERT INTO legal_gis_layers (layer_name, country_code, default_buffer_meters, geom)
VALUES 
    ('WATER_BODIES', 'PRT', 10.0, ST_Multi(ST_GeomFromText('POLYGON((-8.608 39.542, -8.602 39.542, -8.602 39.544, -8.608 39.544, -8.608 39.542))', 4326))),
    ('RESIDENTIAL', 'PRT', 50.0, ST_Multi(ST_GeomFromText('POLYGON((-8.618 39.552, -8.614 39.552, -8.614 39.555, -8.618 39.555, -8.618 39.552))', 4326)))
ON CONFLICT DO NOTHING;
