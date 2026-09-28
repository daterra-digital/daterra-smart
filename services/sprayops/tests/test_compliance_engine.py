import pytest
from shapely.geometry import Polygon

from app.models.schemas import (
    ComplianceCheckRequest,
    GeoJSONGeometry,
    GeoJSONFeature
)
from app.services.compliance_engine import (
    DroneBufferZoneComplianceEngine,
    DEFAULT_SENSITIVE_WATER
)

@pytest.fixture
def engine():
    return DroneBufferZoneComplianceEngine()

# ------------------------------------------------------------------------------
# 1. Teste do Caminho Verde (Green Path)
# ------------------------------------------------------------------------------
def test_compliance_green_path(engine):
    """
    Parcela isolada, distante de qualquer corpo de água ou zona residencial,
    com vento calmo (< 2 m/s).
    Esperado: Status PERMITTED, 100% de área pulverizável e 0 violações.
    """
    # Coordenadas de uma parcela longe das camadas sensíveis padrão
    isolated_field = GeoJSONGeometry(
        type="Polygon",
        coordinates=[[
            [-8.700, 39.600],
            [-8.690, 39.600],
            [-8.690, 39.590],
            [-8.700, 39.590],
            [-8.700, 39.600]
        ]]
    )

    request = ComplianceCheckRequest(
        field_polygon_geojson=isolated_field,
        apv_number=9999,
        drone_model="DJI Agras T40",
        flight_height_m=2.0,
        drone_speed_ms=3.0,
        nozzle_type="AIR_INDUCTION_LOW_DRIFT",
        wind_speed_ms=1.5, # Vento ideal < 2 m/s
        wind_direction_deg=0.0
    )

    response = engine.evaluate_compliance(request)

    assert response.status == "PERMITTED"
    assert response.status_color == "#10B981"
    assert len(response.violations) == 0
    assert response.metrics.sprayable_area_ha == response.metrics.field_area_ha
    assert response.metrics.excluded_area_ha == 0.0
    assert response.metrics.field_area_ha > 0.0

# ------------------------------------------------------------------------------
# 2. Teste de Proibição Legal por Excesso de Vento (Decreto-Lei n.º 91/2016)
# ------------------------------------------------------------------------------
def test_compliance_wind_prohibition(engine):
    """
    Velocidade do vento a 16 km/h (4.44 m/s), excedendo o limite de 15 km/h.
    Esperado: Status PROHIBITED forçado com indicação explícita da violação do DL 91/2016.
    """
    field = GeoJSONGeometry(
        type="Polygon",
        coordinates=[[
            [-8.700, 39.600],
            [-8.690, 39.600],
            [-8.690, 39.590],
            [-8.700, 39.590],
            [-8.700, 39.600]
        ]]
    )

    request = ComplianceCheckRequest(
        field_polygon_geojson=field,
        apv_number=9999,
        wind_speed_ms=4.44, # 16.0 km/h (> 4.17 m/s)
        flight_height_m=2.0,
        drone_speed_ms=3.0,
        nozzle_type="STANDARD"
    )

    response = engine.evaluate_compliance(request)

    assert response.status == "PROHIBITED"
    assert response.status_color == "#F43F5E"
    assert any("91/2016" in v for v in response.violations)
    assert any("15 km/h" in v or "4.17 m/s" in v for v in response.violations)

# ------------------------------------------------------------------------------
# 3. Teste de Redução de Buffer com Tecnologia de Baixa Deriva (DRT -50%)
# ------------------------------------------------------------------------------
def test_compliance_buffer_reduction_with_drt(engine):
    """
    Comparação entre Bico Standard vs Bico de Indução de Ar (Air Induction).
    Sob as mesmas condições de voo e vento, o bico de indução de ar deve
    reduzir a componente calculada de buffer em exatamente 50%.
    """
    base_buffer = 20.0 # metros
    wind_speed = 3.5   # m/s
    flight_height = 2.5 # m
    drone_speed = 4.0  # m/s

    # 1. Bico Standard
    _, calc_standard, _ = engine.calculate_dynamic_buffer(
        base_buffer_m=base_buffer,
        legal_min_buffer_m=10.0,
        wind_speed_ms=wind_speed,
        flight_height_m=flight_height,
        nozzle_type="STANDARD",
        drone_speed_ms=drone_speed
    )

    # 2. Bico Air Induction (DRT)
    _, calc_drt, _ = engine.calculate_dynamic_buffer(
        base_buffer_m=base_buffer,
        legal_min_buffer_m=10.0,
        wind_speed_ms=wind_speed,
        flight_height_m=flight_height,
        nozzle_type="AIR_INDUCTION_LOW_DRIFT",
        drone_speed_ms=drone_speed
    )

    # O fator de bico DRT é 0.50 vs 1.00 standard
    assert calc_drt == pytest.approx(calc_standard * 0.50, rel=1e-2)
    assert calc_drt < calc_standard

# ------------------------------------------------------------------------------
# 4. Teste de Sobreposição Espacial Parcial (Status RESTRICTED)
# ------------------------------------------------------------------------------
def test_spatial_intersection_partial_overlap(engine):
    """
    Parcela com vértice a confinar com a linha de água sensível padrão.
    Esperado: Status RESTRICTED, área excluída > 0 e área pulverizável < área total.
    """
    # Polígono que intersecta parcialmente a linha de água de teste
    # DEFAULT_SENSITIVE_WATER tem coordenadas em torno de (-8.608..-8.602, 39.542..39.5445)
    overlapping_field = GeoJSONGeometry(
        type="Polygon",
        coordinates=[[
            [-8.606, 39.543], # Dentro/junto da linha de água
            [-8.598, 39.543],
            [-8.598, 39.540],
            [-8.606, 39.540],
            [-8.606, 39.543]
        ]]
    )

    request = ComplianceCheckRequest(
        field_polygon_geojson=overlapping_field,
        apv_number=9999,
        wind_speed_ms=2.5,
        flight_height_m=2.5,
        drone_speed_ms=4.0,
        nozzle_type="STANDARD"
    )

    response = engine.evaluate_compliance(request)

    assert response.status == "RESTRICTED"
    assert response.status_color == "#FFC107"
    assert response.metrics.excluded_area_ha > 0.0
    assert response.metrics.sprayable_area_ha < response.metrics.field_area_ha
    assert response.metrics.sprayable_area_ha > 0.0
    assert len(response.mitigation_actions) > 0
    assert response.academy_moodle_sso_recommendation is not None
