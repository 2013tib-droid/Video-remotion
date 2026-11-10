/**
 * REGISTRY VIDEO — setiap video yang terdaftar di sini muncul di Remotion Studio
 * dan bisa dirender dengan ID-nya.
 *
 * Menambah video baru = buat file config di folder proyek, lalu tambahkan di bawah.
 */
import type { VideoConfig } from '../core';
import { demoVideos } from './_demos';
import bpsEkonomiQ32026 from './bps/ekonomi-q3-2026';
import petualanganPintarPromo from './petualangan-pintar/promo';
import priceAtlasPromo from './price-atlas/promo';
import priceAtlasReel from './price-atlas/reel';
import soalSkdReel from './soal-skd/reel';
import wadahQrisPromo from './wadah-qris/promo';

export const PROJECTS: Record<string, VideoConfig[]> = {
  BPS: [bpsEkonomiQ32026],
  PriceAtlas: [priceAtlasPromo, priceAtlasReel],
  PetualanganPintar: [petualanganPintarPromo],
  SoalSKD: [soalSkdReel],
  WadahQRIS: [wadahQrisPromo],
  TemplateDemos: demoVideos,
};
