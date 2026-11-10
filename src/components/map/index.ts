export { GEO_COUNTRIES, type GeoCountry } from './geo-data';
export { MAP_PLACES, MAP_REGIONS, findPlace } from './places';

/** Proyeksi Mercator (satuan derajat) — sama dengan data geo-data.ts. */
export function project(lon: number, lat: number): [number, number] {
  const l = Math.max(-80, Math.min(84, lat));
  return [lon, (-Math.log(Math.tan(Math.PI / 4 + (l * Math.PI) / 360)) * 180) / Math.PI];
}
