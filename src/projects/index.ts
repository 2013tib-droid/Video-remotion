/**
 * REGISTRY VIDEO — setiap video yang terdaftar di sini muncul di Remotion Studio
 * dan bisa dirender dengan ID-nya.
 *
 * Menambah video baru = buat file config di folder proyek, lalu tambahkan di bawah.
 */
import type { VideoConfig } from '../core';
import { demoVideos } from './_demos';
import petualanganPintarPromo from './petualangan-pintar/promo';
import priceAtlasPromo from './price-atlas/promo';
import priceAtlasReel from './price-atlas/reel';
import soalSkdBedahAnalogi from './soal-skd/bedah-analogi';
import soalSkdReel from './soal-skd/reel';
import wadahQrisPromo from './wadah-qris/promo';

export const PROJECTS: Record<string, VideoConfig[]> = {
  PriceAtlas: [priceAtlasPromo, priceAtlasReel],
  PetualanganPintar: [petualanganPintarPromo],
  SoalSKD: [soalSkdReel, soalSkdBedahAnalogi],
  WadahQRIS: [wadahQrisPromo],
  TemplateDemos: demoVideos,
};
