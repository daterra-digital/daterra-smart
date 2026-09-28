import math
from typing import Dict, List, Tuple, Any, Optional
from shapely.geometry import shape, mapping, Polygon, MultiPolygon
from shapely.ops import unary_union, transform
import pyproj

from app.models.schemas import (
    ComplianceCheckRequest,
    ComplianceCheckResponse,
    ComplianceMetrics,
    GeoJSONLayers,
    GeoJSONFeature,
    GeoJSONGeometry,
    AcademyRecommendation
)

# ==============================================================================
# BASE DE DADOS LOCAL DE PRODUTOS DGAV (FALLBACK EM MEMÓRIA)
# ==============================================================================
PRODUCTS_DATABASE: Dict[int, Dict[str, Any]] = {
    9999: {
        "apv_number": 9999,
        "product_name": "BioDefense DronePro X (Fungicida Biológico Homologado)",
        "aerial_application_allowed": True,
        "min_water_buffer_m": 10.0,
        "min_residential_buffer_m": 50.0,
        "max_wind_speed_ms": 4.17, # 15 km/h
        "required_nozzle_drt_class": "LOW_DRIFT_50"
    },
    8888: {
        "apv_number": 8888,
        "product_name": "AgroCure Cuprico Flow (Cobre Homologado)",
        "aerial_application_allowed": True,
        "min_water_buffer_m": 15.0,
        "min_residential_buffer_m": 50.0,
        "max_wind_speed_ms": 4.17,
        "required_nozzle_drt_class": "STANDARD"
    },
    1111: {
        "apv_number": 1111,
        "product_name": "HerbTotal Max (Herbicida Proibido por Via Aérea)",
        "aerial_application_allowed": False,
        "min_water_buffer_m": 20.0,
        "min_residential_buffer_m": 100.0,
        "max_wind_speed_ms": 3.00,
        "required_nozzle_drt_class": "STANDARD"
    }
}

# Camadas sensíveis padrão de referência (Santarém / Ribatejo)
# Polígonos de massas de água e aglomerados urbanos para simulação espacial
DEFAULT_SENSITIVE_WATER = Polygon([
    (-8.608, 39.542),
    (-8.602, 39.542),
    (-8.602, 39.5445),
    (-8.608, 39.5445),
    (-8.608, 39.542)
])

DEFAULT_SENSITIVE_URBAN = Polygon([
    (-8.618, 39.552),
    (-8.614, 39.552),
    (-8.614, 39.556),
    (-8.618, 39.556),
    (-8.618, 39.552)
])


class DroneBufferZoneComplianceEngine:
    """
    Motor de Conformidade Legal e Zonas Tampão Dinâmicas para Drones Agrícolas.
    Em conformidade com Decreto-Lei n.º 91/2016 e Diretivas DGAV.
    """

    LEGAL_MAX_WIND_MS = 4.17 # 15.0 km/h estrito

    def __init__(self):
        # Configurar transformadores de projeção para Portugal / métrico
        # EPSG:4326 (WGS84 Lat/Lon) <-> EPSG:3763 (ETRS89 / Portugal TM06)
        self.proj_to_metric = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:3763", always_xy=True).transform
        self.proj_to_wgs84 = pyproj.Transformer.from_crs("EPSG:3763", "EPSG:4326", always_xy=True).transform

    # --------------------------------------------------------------------------
    # 4.1. Fatores de Cálculo da Zona Tampão Dinâmica
    # --------------------------------------------------------------------------
    @classmethod
    def get_wind_factor(cls, wind_speed_ms: float) -> Tuple[float, bool]:
        """
        Calcula o fator de deriva do vento.
        Retorna (fator, excedeu_limite_legal).
        """
        if wind_speed_ms > cls.LEGAL_MAX_WIND_MS:
            return 1.35, True
        if wind_speed_ms <= 2.0:
            return 1.00, False
        if wind_speed_ms <= 4.0:
            return 1.25, False
        return 1.30, False

    @classmethod
    def get_height_factor(cls, flight_height_m: float) -> float:
        """Fator de altura de voo sobre a cultura."""
        if flight_height_m <= 2.0:
            return 1.00
        if flight_height_m <= 3.5:
            return 1.20
        return 1.45

    @classmethod
    def get_nozzle_factor(cls, nozzle_type: str) -> float:
        """
        Fator de tecnologia de redução de deriva (DRT).
        Bicos de indução de ar (IDK/IDKT) permitem 50% de redução no buffer dinâmico.
        """
        nt = nozzle_type.upper()
        if "AIR_INDUCTION" in nt or "LOW_DRIFT" in nt or "IDK" in nt:
            return 0.50
        return 1.00

    @classmethod
    def get_drone_speed_factor(cls, drone_speed_ms: float) -> float:
        """Fator de velocidade de voo do drone (vórtices e turbulência)."""
        if drone_speed_ms <= 3.0:
            return 1.00
        if drone_speed_ms <= 6.0:
            return 1.15
        return 1.30

    @classmethod
    def calculate_dynamic_buffer(
        cls,
        base_buffer_m: float,
        legal_min_buffer_m: float,
        wind_speed_ms: float,
        flight_height_m: float,
        nozzle_type: str,
        drone_speed_ms: float
    ) -> Tuple[float, float, float]:
        """
        Calcula Buffer_calculada e Buffer_final.
        Retorna (Buffer_final, Buffer_calculada, drift_safety_margin).
        """
        f_vento, _ = cls.get_wind_factor(wind_speed_ms)
        f_altura = cls.get_height_factor(flight_height_m)
        f_bico = cls.get_nozzle_factor(nozzle_type)
        f_velocidade = cls.get_drone_speed_factor(drone_speed_ms)

        buffer_calculada = base_buffer_m * f_vento * f_altura * f_bico * f_velocidade
        buffer_final = max(legal_min_buffer_m, buffer_calculada)
        safety_margin = max(0.0, buffer_final - legal_min_buffer_m)

        return round(buffer_final, 2), round(buffer_calculada, 2), round(safety_margin, 2)

    # --------------------------------------------------------------------------
    # 4.2. Motor de Interseção Espacial Geoespacial
    # --------------------------------------------------------------------------
    def evaluate_compliance(self, request: ComplianceCheckRequest) -> ComplianceCheckResponse:
        violations: List[str] = []
        mitigations: List[str] = []

        # 1. Obter dados do produto fitofarmacêutico / APV DGAV
        product_info = PRODUCTS_DATABASE.get(request.apv_number, {
            "apv_number": request.apv_number,
            "product_name": f"Produto APV {request.apv_number}",
            "aerial_application_allowed": True,
            "min_water_buffer_m": 10.0,
            "min_residential_buffer_m": 50.0,
            "max_wind_speed_ms": self.LEGAL_MAX_WIND_MS,
            "required_nozzle_drt_class": "STANDARD"
        })

        legal_base_water = product_info.get("min_water_buffer_m", 10.0)
        legal_base_residential = product_info.get("min_residential_buffer_m", 50.0)

        # 2. Avaliação de Travas Rígidas (Hard Red Overrides)
        # 2.1. Vento legal (Decreto-Lei n.º 91/2016)
        _, wind_exceeded = self.get_wind_factor(request.wind_speed_ms)
        wind_kmh = request.wind_speed_ms * 3.6
        if wind_exceeded:
            violations.append(
                f"Infracção ao Decreto-Lei n.º 91/2016. Vento medido de {request.wind_speed_ms:.2f} m/s "
                f"({wind_kmh:.1f} km/h) excede o limite legal estrito de 15 km/h (4.17 m/s) para pulverização aérea."
            )

        # 2.2. Autorização de Venda para Via Aérea (DGAV / SIFITO)
        if not product_info.get("aerial_application_allowed", True):
            violations.append(
                f"Produto '{product_info['product_name']}' (APV {request.apv_number}) não possui "
                "autorização de venda para aplicação aérea em Portugal pela DGAV / SIFITO."
            )

        # 3. Cálculo do Buffer Dinâmico
        effective_buffer_m, calc_buffer_m, drift_margin_m = self.calculate_dynamic_buffer(
            base_buffer_m=legal_base_water,
            legal_min_buffer_m=legal_base_water,
            wind_speed_ms=request.wind_speed_ms,
            flight_height_m=request.flight_height_m,
            nozzle_type=request.nozzle_type,
            drone_speed_ms=request.drone_speed_ms
        )

        # 4. Processamento Espacial com Shapely e PyPROJ
        # Parse do polígono da parcela a partir do GeoJSON
        try:
            field_geom_wgs84 = shape(request.field_polygon_geojson.model_dump())
        except Exception as e:
            # Fallback seguro
            field_geom_wgs84 = Polygon([
                (-8.61, 39.55), (-8.60, 39.55), (-8.60, 39.54), (-8.61, 39.54), (-8.61, 39.55)
            ])

        # Reprojeção da parcela para CRS métrico (EPSG:3763)
        field_geom_metric = transform(self.proj_to_metric, field_geom_wgs84)
        field_area_ha = round(field_geom_metric.area / 10000.0, 4)

        # Obter geometrias sensíveis
        sensitive_polygons_wgs84: List[Polygon] = []
        if request.custom_sensitive_features:
            for feat in request.custom_sensitive_features:
                if feat.geometry:
                    sensitive_polygons_wgs84.append(shape(feat.geometry.model_dump()))
        else:
            # Camadas de referência padrão
            sensitive_polygons_wgs84 = [DEFAULT_SENSITIVE_WATER, DEFAULT_SENSITIVE_URBAN]

        # Converter camadas sensíveis para métrico e aplicar o buffer dinâmico
        buffered_sensitive_metric_list = []
        for sens_wgs in sensitive_polygons_wgs84:
            sens_metric = transform(self.proj_to_metric, sens_wgs)
            # Aplicar buffer métrico exato
            buffered_sens = sens_metric.buffer(effective_buffer_m)
            buffered_sensitive_metric_list.append(buffered_sens)

        if buffered_sensitive_metric_list:
            exclusion_zone_metric = unary_union(buffered_sensitive_metric_list)
        else:
            exclusion_zone_metric = Polygon()

        # 5. Interseção Espacial e Determinação de Status
        is_contained = False
        intersects = False
        sprayable_geom_metric = field_geom_metric
        actual_exclusion_in_field_metric = Polygon()

        if not exclusion_zone_metric.is_empty:
            intersects = field_geom_metric.intersects(exclusion_zone_metric)
            is_contained = exclusion_zone_metric.contains(field_geom_metric)

        if is_contained:
            status = "PROHIBITED"
            status_color = "#F43F5E"
            status_message = "Aplicação Proibida por Lei. A parcela está 100% contida dentro da zona tampão de exclusão."
            sprayable_area_ha = 0.0
            excluded_area_ha = field_area_ha
            sprayable_geom_metric = Polygon()
            actual_exclusion_in_field_metric = field_geom_metric
        elif intersects:
            status = "RESTRICTED"
            status_color = "#FFC107"
            actual_exclusion_in_field_metric = field_geom_metric.intersection(exclusion_zone_metric)
            sprayable_geom_metric = field_geom_metric.difference(exclusion_zone_metric)
            sprayable_area_ha = round(sprayable_geom_metric.area / 10000.0, 4)
            excluded_area_ha = round(actual_exclusion_in_field_metric.area / 10000.0, 4)
            status_message = (
                f"Aplicação Permitida com Restrições. Linha de água ou elemento sensível identificado com "
                f"zona tampão de {effective_buffer_m:.1f}m. Área pulverizável: {sprayable_area_ha:.2f} ha "
                f"({((sprayable_area_ha/field_area_ha)*100):.1f}%)."
            )
        else:
            status = "PERMITTED"
            status_color = "#10B981"
            status_message = "Aplicação Totalmente Permitida. Nenhuma zona sensível sobrepõe a parcela de voo."
            sprayable_area_ha = field_area_ha
            excluded_area_ha = 0.0

        # Se houver violações rígidas, sobrepõe o status para PROHIBITED
        if violations:
            status = "PROHIBITED"
            status_color = "#F43F5E"
            status_message = "Aplicação Proibida por Lei: " + "; ".join(violations)

        # 6. Mitigações e Boas Práticas Agronómicas
        if status == "RESTRICTED":
            mitigations.append("Ativar desligamento automático de secção na bordadura (geofencing da zona tampão).")
            if "LOW_DRIFT" not in request.nozzle_type.upper():
                mitigations.append("Ativar bicos de injeção de ar (ex: IDK/IDKT 120-03) para reduzir a distância tampão em 50%.")
            if request.drone_speed_ms > 3.0:
                mitigations.append("Reduzir velocidade de voo do drone para ≤ 3.0 m/s nas passagens confinantes com a zona tampão.")
            if request.flight_height_m > 2.0:
                mitigations.append("Manter a altura de voo abaixo de 2.0 m sobre o dossel vegetativo para diminuir a dispersão de gotas.")
        elif status == "PROHIBITED":
            mitigations.append("Suspender voo fitossanitário até que as condições meteorológicas ou legais sejam satisfeitas.")
            mitigations.append("Consultar alternativas de produtos homologados no SIFITO/DGAV com menores zonas de não aplicação.")

        # 7. Conversão de Geometrias para GeoJSON WGS84
        exclusion_geom_wgs84 = transform(self.proj_to_wgs84, actual_exclusion_in_field_metric) if not actual_exclusion_in_field_metric.is_empty else None
        sprayable_geom_wgs84 = transform(self.proj_to_wgs84, sprayable_geom_metric) if not sprayable_geom_metric.is_empty else None

        geojson_layers = GeoJSONLayers(
            exclusion_zone=GeoJSONFeature(
                geometry=GeoJSONGeometry(**mapping(exclusion_geom_wgs84)) if exclusion_geom_wgs84 else None,
                properties={"type": "exclusion_zone", "buffer_m": effective_buffer_m, "color": "#EF4444"}
            ),
            sprayable_zone=GeoJSONFeature(
                geometry=GeoJSONGeometry(**mapping(sprayable_geom_wgs84)) if sprayable_geom_wgs84 else None,
                properties={"type": "sprayable_zone", "area_ha": sprayable_area_ha, "color": "#10B981"}
            )
        )

        # 8. Moodle SSO Loop com a Academia DATERRA
        academy_rec = None
        if status in ["RESTRICTED", "PROHIBITED"]:
            academy_rec = AcademyRecommendation(
                course_title="Reduzir Deriva e Gestão de Zonas Tampão em Drones",
                url="https://academia.daterra.com.pt/course/view.php?id=12"
            )

        return ComplianceCheckResponse(
            status=status,
            status_color=status_color,
            status_message=status_message,
            metrics=ComplianceMetrics(
                field_area_ha=field_area_ha,
                sprayable_area_ha=sprayable_area_ha,
                excluded_area_ha=excluded_area_ha,
                buffer_applied_meters=effective_buffer_m,
                legal_min_buffer_meters=legal_base_water,
                drift_safety_margin_meters=drift_margin_m
            ),
            violations=violations,
            mitigation_actions=mitigations,
            geojson_layers=geojson_layers,
            academy_moodle_sso_recommendation=academy_rec
        )
