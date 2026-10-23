import type { SatelliteParcel } from '../types';

/**
 * Utilitário de Importação e Exportação SIG de Parcelas
 * Compatível com formatos do Google Earth (KML), GeoJSON e monitores de máquinas agrícolas.
 */

/**
 * Converte uma parcela DATERRA para formato KML padrão OGC
 */
export function exportParcelToKml(parcel: SatelliteParcel): string {
  const coordString = parcel.coordinates
    .map(([lat, lon]) => `${lon},${lat},0`)
    .join(' ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${parcel.name}</name>
    <description>Exportado de DATERRA Smart - Parcela Agrícola ${parcel.cropType}</description>
    <Style id="daterraPoly">
      <LineStyle>
        <color>ff4ca63c</color>
        <width>3</width>
      </LineStyle>
      <PolyStyle>
        <color>7f114037</color>
      </PolyStyle>
    </Style>
    <Placemark>
      <name>${parcel.name}</name>
      <styleUrl>#daterraPoly</styleUrl>
      <ExtendedData>
        <Data name="area_ha"><value>${parcel.areaHa}</value></Data>
        <Data name="ndvi"><value>${parcel.ndvi}</value></Data>
        <Data name="cultura"><value>${parcel.cropType}</value></Data>
      </ExtendedData>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${coordString}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>`;
}

/**
 * Gera um mapa de prescrição em GeoJSON com taxa variável de calda
 */
export function exportPrescriptionGeoJson(parcel: SatelliteParcel, modulatedVolumeLha: number): string {
  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          parcel_name: parcel.name,
          crop: parcel.cropType,
          area_ha: parcel.areaHa,
          ndvi_mean: parcel.ndvi,
          target_spray_volume_l_ha: modulatedVolumeLha,
          base_spray_volume_l_ha: parcel.baseVolumeLha,
          created_by: 'DATERRA Smart Suite',
          timestamp: new Date().toISOString()
        },
        geometry: {
          type: 'Polygon',
          coordinates: [parcel.coordinates.map(([lat, lon]) => [lon, lat])]
        }
      }
    ]
  };

  return JSON.stringify(geojson, null, 2);
}

/**
 * Descarrega ficheiro de texto (KML/GeoJSON) no navegador do agricultor
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
