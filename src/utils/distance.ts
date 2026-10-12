/**
 * Cálculo de distancia Haversine y estimación de tiempo de traslado en Mérida
 */

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Estima tiempo de traslado en auto en Mérida considerando tráfico moderado (~28 km/h)
 */
export function estimateDurationMinutes(distanceKm: number): number {
  if (distanceKm <= 0.3) return 2;
  const avgSpeedKmH = 28;
  const hours = distanceKm / avgSpeedKmH;
  const minutes = Math.round(hours * 60) + 2; // +2 min de arranque/estacionamiento
  return Math.max(3, minutes);
}

/**
 * Formatea la distancia amigablemente ("850 m" o "3.2 km")
 */
export function formatDistance(distanceKm?: number): string {
  if (distanceKm === undefined || distanceKm === null) return '';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Enlace directo oficial de Google Maps para cómo llegar
 */
export function getDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
