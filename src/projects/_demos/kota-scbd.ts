import { defineVideo } from '../../core';
import { kotaDariPeta, type PetaKota } from '../../worlds';
import peta from '../../worlds/peta/scbd.json';

/**
 * Demo KOTA DARI PETA ASLI (gaya R3): kawasan SCBD dari OpenStreetMap, gaya tinta.
 * Data: `npm run peta -- scbd -6.2251 106.8085 450` → `src/worlds/peta/scbd.json`.
 */
const kota = kotaDariPeta(peta as PetaKota, { radius: 420 });

export default defineVideo({
  id: 'Demo-KotaSCBD',
  brand: { name: 'Motion Studio' },
  theme: 'ModernSaaS',
  sfx: true,
  scenes: [
    {
      type: 'world',
      duration: 5,
      style: 'ink',
      chapter: { label: 'Peta asli', title: 'SCBD dari OpenStreetMap', highlight: 'OpenStreetMap' },
      objects: kota.objects,
      views: kota.views,
      shots: [{ view: 'kota' }, { view: 'dekat', at: 2, duration: 2 }],
      labels: [
        { target: kota.idGedung['Equity Tower'], text: 'Equity Tower', at: 0.8, color: '#fff3c4' },
        { target: kota.idGedung['Pacific Place Mall'], text: 'Pacific Place', at: 1.2, color: '#fff3c4' },
      ],
      ground: kota.ground,
      sky: kota.sky,
      note: kota.kredit,
    },
  ],
});
