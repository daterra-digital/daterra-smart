import pytest
from app.models.schemas import AuditDossierRequest, GeoJSONGeometry
from app.services.compliance_engine import DroneBufferZoneComplianceEngine
from app.services.pdf_generator import generate_compliance_pdf

def test_pdf_generation():
    engine = DroneBufferZoneComplianceEngine()
    field = GeoJSONGeometry(
        type="Polygon",
        coordinates=[[
            [-8.606, 39.543],
            [-8.598, 39.543],
            [-8.598, 39.540],
            [-8.606, 39.540],
            [-8.606, 39.543]
        ]]
    )
    request = AuditDossierRequest(
        field_polygon_geojson=field,
        apv_number=9999,
        wind_speed_ms=2.5,
        flight_height_m=2.5,
        drone_speed_ms=4.0,
        nozzle_type="AIR_INDUCTION_LOW_DRIFT",
        operator_name="Eng. Pedro Nunes",
        operator_license_number="DGAV-PILOT-2026-99",
        organization_name="Quinta da Terra Smart",
        parcel_name="Parcela A1 - Vinha Touriga Nacional"
    )

    result = engine.evaluate_compliance(request)
    pdf_bytes = generate_compliance_pdf(request, result)

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 2000 # PDF não vazio
    assert pdf_bytes.startswith(b"%PDF")
