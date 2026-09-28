from typing import List
from fastapi import APIRouter, Response, HTTPException, status
from fastapi.responses import JSONResponse

from app.models.schemas import (
    ComplianceCheckRequest,
    ComplianceCheckResponse,
    AuditDossierRequest,
    ProductRestriction
)
from app.services.compliance_engine import (
    DroneBufferZoneComplianceEngine,
    PRODUCTS_DATABASE
)
from app.services.pdf_generator import generate_compliance_pdf

router = APIRouter(prefix="/compliance", tags=["Compliance & Buffer Zones"])
engine = DroneBufferZoneComplianceEngine()

@router.post(
    "/check",
    response_model=ComplianceCheckResponse,
    summary="Avaliar conformidade e calcular buffer dinâmico de drone",
    description="Avalia em tempo real as restrições do Decreto-Lei n.º 91/2016 e interseção espacial com camadas sensíveis."
)
async def check_compliance(request: ComplianceCheckRequest) -> ComplianceCheckResponse:
    try:
        response = engine.evaluate_compliance(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro no processamento geoespacial da conformidade: {str(e)}"
        )

@router.post(
    "/audit-dossier",
    summary="Gerar Dossiê Pericial em PDF (GlobalGAP / DGAV)",
    description="Gera um relatório pericial formal em PDF com mapa, distâncias de segurança e bloco de assinatura."
)
async def generate_dossier(request: AuditDossierRequest):
    try:
        compliance_result = engine.evaluate_compliance(request)
        pdf_bytes = generate_compliance_pdf(request, compliance_result)
        
        filename = f"dossie_conformidade_uav_apv{request.apv_number}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar o dossiê pericial em PDF: {str(e)}"
        )

@router.get(
    "/products",
    response_model=List[ProductRestriction],
    summary="Listar produtos homologados DGAV para via aérea"
)
async def list_products() -> List[ProductRestriction]:
    return [ProductRestriction(**p) for p in PRODUCTS_DATABASE.values()]
