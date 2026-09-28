from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

# ==============================================================================
# GeoJSON Schemas
# ==============================================================================

class GeoJSONGeometry(BaseModel):
    type: Literal["Polygon", "MultiPolygon", "GeometryCollection"]
    coordinates: Any

class GeoJSONFeature(BaseModel):
    type: Literal["Feature"] = "Feature"
    geometry: Optional[GeoJSONGeometry] = None
    properties: Dict[str, Any] = Field(default_factory=dict)

class GeoJSONLayers(BaseModel):
    exclusion_zone: Optional[GeoJSONFeature] = None
    sprayable_zone: Optional[GeoJSONFeature] = None
    sensitive_layers: Optional[List[GeoJSONFeature]] = None

# ==============================================================================
# API Request & Response Schemas
# ==============================================================================

class ComplianceCheckRequest(BaseModel):
    field_polygon_geojson: GeoJSONGeometry
    apv_number: int = Field(..., description="Número oficial de APV DGAV")
    drone_model: str = Field(default="DJI Agras T40", description="Modelo do Drone agrícola")
    flight_height_m: float = Field(default=2.5, ge=0.5, le=10.0, description="Altura de voo sobre a cultura em metros")
    drone_speed_ms: float = Field(default=4.0, ge=0.5, le=15.0, description="Velocidade de voo do drone em m/s")
    nozzle_type: str = Field(default="AIR_INDUCTION_LOW_DRIFT", description="STANDARD ou AIR_INDUCTION_LOW_DRIFT")
    wind_speed_ms: float = Field(..., ge=0.0, le=25.0, description="Velocidade do vento à cota de voo em m/s")
    wind_direction_deg: Optional[float] = Field(default=0.0, ge=0.0, le=360.0, description="Direção do vento em graus (0-360)")
    temperature_c: Optional[float] = Field(default=20.0, description="Temperatura ambiente em °C")
    humidity_rh: Optional[float] = Field(default=60.0, description="Humidade relativa do ar em %")
    custom_sensitive_features: Optional[List[GeoJSONFeature]] = Field(
        default=None, 
        description="Camadas sensíveis opcionais enviadas diretamente pelo cliente (ex: corpos de água locais)"
    )

class ComplianceMetrics(BaseModel):
    field_area_ha: float
    sprayable_area_ha: float
    excluded_area_ha: float
    buffer_applied_meters: float
    legal_min_buffer_meters: float
    drift_safety_margin_meters: float

class AcademyRecommendation(BaseModel):
    course_title: str
    url: str

class ComplianceCheckResponse(BaseModel):
    status: Literal["PERMITTED", "RESTRICTED", "PROHIBITED"]
    status_color: str
    status_message: str
    metrics: ComplianceMetrics
    violations: List[str]
    mitigation_actions: List[str]
    geojson_layers: GeoJSONLayers
    academy_moodle_sso_recommendation: Optional[AcademyRecommendation] = None

class ProductRestriction(BaseModel):
    apv_number: int
    product_name: str
    aerial_application_allowed: bool
    min_water_buffer_m: float
    min_residential_buffer_m: float
    max_wind_speed_ms: float
    required_nozzle_drt_class: str

class AuditDossierRequest(ComplianceCheckRequest):
    operator_name: str = Field(default="Operador Técnico Certificado")
    operator_license_number: str = Field(default="DGAV-UAV-2026-0042")
    organization_name: str = Field(default="Exploração Agrícola DATERRA")
    parcel_name: str = Field(default="Parcela Principal - Vinha / Pomar")
