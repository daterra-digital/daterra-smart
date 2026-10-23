/**
 * Funções matemáticas puras para geometria de talhões agrícolas (WGS84).
 * Sem dependências de DOM/window para permitir execução em Node.js e no navegador.
 */

/**
 * Calcula a área de um polígono em hectares a partir de coordenadas geográficas [lat, lon]
 * Utiliza a fórmula esférica de Gauss (WGS84) para áreas agrícolas.
 */
export function calculateGeoPolygonAreaHa(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  const radius = 6378137; // Raio equatorial da Terra em metros
  let total = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const lat1 = (coords[i][0] * Math.PI) / 180;
    const lat2 = (coords[j][0] * Math.PI) / 180;
    const lon1 = (coords[i][1] * Math.PI) / 180;
    const lon2 = (coords[j][1] * Math.PI) / 180;
    total += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  const areaM2 = Math.abs((total * radius * radius) / 2.0);
  return Number((areaM2 / 10000).toFixed(2));
}

/**
 * Calcula o centro geográfico médio (centróide) de uma lista de coordenadas
 */
export function calculateCoordsCenter(coords: [number, number][]): [number, number] {
  if (coords.length === 0) return [39.545, -8.605];
  const centerLat = coords.reduce((acc, c) => acc + c[0], 0) / coords.length;
  const centerLon = coords.reduce((acc, c) => acc + c[1], 0) / coords.length;
  return [Number(centerLat.toFixed(5)), Number(centerLon.toFixed(5))];
}
