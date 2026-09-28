import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Float, Boolean, DateTime, Integer, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class LegalGisLayer(Base):
    __tablename__ = "legal_gis_layers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    layer_name = Column(String(100), nullable=False) # 'WATER_BODIES', 'RESIDENTIAL', 'SCHOOLS', 'NATURA_2000'
    country_code = Column(String(3), default="PRT")
    default_buffer_meters = Column(Float, nullable=False, default=10.0)
    # GeoJSON ou WKT fallback para compatibilidade quando sem PostGIS nativo na máquina local
    geom_geojson = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class ProductLegalRestriction(Base):
    __tablename__ = "product_legal_restrictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    apv_number = Column(Integer, unique=True, nullable=False, index=True)
    product_name = Column(String(150), nullable=False)
    aerial_application_allowed = Column(Boolean, default=True)
    min_water_buffer_m = Column(Float, default=10.0)
    min_residential_buffer_m = Column(Float, default=50.0)
    max_wind_speed_ms = Column(Float, default=4.17) # 15 km/h legal limit DL 91/2016
    required_nozzle_drt_class = Column(String(50), default="STANDARD")

class DroneComplianceAudit(Base):
    __tablename__ = "drone_compliance_audits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    field_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    operator_id = Column(UUID(as_uuid=True), nullable=False)
    status = Column(String(20), nullable=False) # 'PERMITTED', 'RESTRICTED', 'PROHIBITED'
    field_total_area_ha = Column(Float, nullable=False)
    sprayable_area_ha = Column(Float, nullable=False)
    buffer_distance_applied_m = Column(Float, nullable=False)
    wind_speed_ms = Column(Float, nullable=False)
    wind_direction_deg = Column(Float, nullable=True)
    flight_height_m = Column(Float, nullable=False)
    drone_speed_ms = Column(Float, nullable=False)
    nozzle_type = Column(String(50), nullable=False)
    violations_json = Column(JSON, default=list)
    mitigations_applied_json = Column(JSON, default=list)
    audit_pdf_url = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
