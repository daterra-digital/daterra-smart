import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)

from app.models.schemas import AuditDossierRequest, ComplianceCheckResponse

def generate_compliance_pdf(
    request: AuditDossierRequest,
    compliance_result: ComplianceCheckResponse
) -> bytes:
    """
    Gera um relatório pericial em PDF para conformidade DGAV, DL 91/2016 e auditoria GlobalGAP.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Estilos customizados
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#114037')
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1D734B')
    )
    
    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#114037'),
        spaceBefore=10,
        spaceAfter=4
    )
    
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B')
    )

    elements = []

    # 1. Cabeçalho Institucional
    elements.append(Paragraph("DATERRA Smart 2.0 • SprayOps", subtitle_style))
    elements.append(Paragraph("Dossiê Pericial de Conformidade de Voo Agrícola (UAV)", title_style))
    elements.append(Paragraph("Aferição de Zonas Tampão, Risco de Deriva e Cumprimento do Decreto-Lei n.º 91/2016", subtitle_style))
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#3CA64C'), spaceAfter=12))

    # 2. Resumo da Decisão Legal (Status Banner)
    status = compliance_result.status
    bg_color = colors.HexColor('#10B981') if status == "PERMITTED" else (
        colors.HexColor('#F59E0B') if status == "RESTRICTED" else colors.HexColor('#EF4444')
    )
    
    status_label = "AUTORIZADO (PERMITTED)" if status == "PERMITTED" else (
        "CONDICIONADO COM RESTRIÇÕES (RESTRICTED)" if status == "RESTRICTED" else "PROIBIDO POR LEI (PROHIBITED)"
    )

    status_table = Table(
        [[Paragraph(f"<b>PARECER JURÍDICO-AGRONÓMICO: {status_label}</b>", ParagraphStyle('W', parent=styles['Normal'], textColor=colors.white, fontName='Helvetica-Bold', fontSize=11)),
          Paragraph(f"Data: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", ParagraphStyle('WR', parent=styles['Normal'], textColor=colors.white, alignment=2, fontSize=9))]],
        colWidths=[380, 140]
    )
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_color),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(status_table)
    elements.append(Spacer(1, 10))

    # 3. Informações da Operação & Operador
    elements.append(Paragraph("1. Dados da Exploração, Equipamento e Operador", section_title))
    op_data = [
        ["Exploração Agrícola:", request.organization_name, "Operador UAV:", request.operator_name],
        ["Parcela Cadastral:", request.parcel_name, "N.º Licença / Certificado:", request.operator_license_number],
        ["Modelo de Drone:", request.drone_model, "Tipo de Bicos (DRT):", request.nozzle_type],
        ["Altura de Voo:", f"{request.flight_height_m:.1f} m", "Velocidade de Trabalho:", f"{request.drone_speed_ms:.1f} m/s ({request.drone_speed_ms * 3.6:.1f} km/h)"],
        ["Produto (APV DGAV):", f"APV n.º {request.apv_number}", "Vento Medido no Campo:", f"{request.wind_speed_ms:.2f} m/s ({request.wind_speed_ms * 3.6:.1f} km/h)"]
    ]
    t_op = Table(op_data, colWidths=[120, 140, 120, 140])
    t_op.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#1E293B')),
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (2,0), (2,-1), colors.HexColor('#F1F5F9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_op)
    elements.append(Spacer(1, 10))

    # 4. Métricas Geográficas e Zonas Tampão Dinâmicas
    elements.append(Paragraph("2. Aferição Espacial e Zonas Tampão (PostGIS)", section_title))
    m = compliance_result.metrics
    metrics_data = [
        ["Métrica de Segurança", "Valor Calculado", "Base Legal / Referência"],
        ["Área Total da Parcela:", f"{m.field_area_ha:.2f} ha (100%)", "Delimitação Vetorial GeoJSON"],
        ["Área Efetiva Pulverizável:", f"{m.sprayable_area_ha:.2f} ha ({(m.sprayable_area_ha / max(0.0001, m.field_area_ha) * 100):.1f}%)", "Polígono Seguro Resultante"],
        ["Área Excluída (Buffer Tampão):", f"{m.excluded_area_ha:.2f} ha ({(m.excluded_area_ha / max(0.0001, m.field_area_ha) * 100):.1f}%)", "Faixa de Não Aplicação"],
        ["Zona Tampão Aplicada:", f"{m.buffer_applied_meters:.1f} metros", "Buffer Dinâmico com Fatores de Voo"],
        ["Buffer Mínimo Legal Base:", f"{m.legal_min_buffer_meters:.1f} metros", "Rótulo DGAV / Massas de Água"],
        ["Margem Adicional por Deriva:", f"{m.drift_safety_margin_meters:.1f} metros", "Ajuste por Vento, Altura e Velocidade"]
    ]
    t_metrics = Table(metrics_data, colWidths=[180, 160, 180])
    t_metrics.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#114037')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_metrics)
    elements.append(Spacer(1, 10))

    # 5. Violações e Ações de Mitigação Obrigatórias
    if compliance_result.violations:
        elements.append(Paragraph("3. Violações Normativas Detetadas", section_title))
        for v in compliance_result.violations:
            elements.append(Paragraph(f"• <b>[NÃO-CONFORMIDADE CRÍTICA]</b> {v}", ParagraphStyle('Viol', parent=body_style, textColor=colors.HexColor('#B91C1C'))))
        elements.append(Spacer(1, 6))

    elements.append(Paragraph("4. Prescrições Técnicas e Ações de Mitigação (GlobalGAP)", section_title))
    if compliance_result.mitigation_actions:
        for act in compliance_result.mitigation_actions:
            elements.append(Paragraph(f"• {act}", body_style))
    else:
        elements.append(Paragraph("• Operação sem restrições ativas. Manter parâmetros de voo registados no plano de trabalho.", body_style))
    elements.append(Spacer(1, 14))

    # 6. Bloco de Assinatura e Responsabilidade Técnica
    elements.append(Paragraph("5. Termo de Responsabilidade Técnica e Rastreabilidade", section_title))
    sig_data = [
        ["Assinatura do Piloto / Operador Certificado:", "Validação do Responsável Técnico / Engenheiro Agrónomo:"],
        ["\n\n____________________________________________\n" + request.operator_name,
         "\n\n____________________________________________\nDATERRA Smart 2.0 Automated Audit Verification"]
    ]
    t_sig = Table(sig_data, colWidths=[260, 260])
    t_sig.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#475569')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_sig)

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
