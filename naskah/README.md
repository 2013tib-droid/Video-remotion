# Naskah — konsep, alur & narasi

Tempat merancang video **sebelum** ditulis jadi config. Satu video = satu file `naskah/<brand>/<video>.md`
(konsep + alur + narasi digabung, enak ditempel ke ChatGPT/Gemini/Claude.ai). Folder ini tidak dibaca oleh build/render.

## Alur kerja
1. Salin `_template/video.md` → `naskah/<brand>/<video>.md` (nama `<brand>` sama dengan folder di `src/projects/`).
2. Isi konsep + data & sumber dulu, baru alur & narasi. Boleh dikerjakan di chat AI lain
   (prompt: `docs/PROMPT-STORYBOARD.md`; tempel file ini sebagai BRIEF).
3. Ubah `status:` → `final`, lalu ke Claude Code: *"Buat video dari `naskah/<brand>/<video>.md`."*
4. Setelah config dibuat: `status: dibuat` + isi `file:`. **Mulai saat itu narasi direvisi di file `.ts`**
   (sumber suara & subtitle) — naskah ini tinggal catatan konsep.
5. Ide yang ditunda/ditolak → `_arsip/`.

| status | artinya |
|---|---|
| `ide` | baru konsep, alur belum lengkap |
| `draf` | alur & narasi ada, masih direvisi |
| `final` | siap dijadikan config |
| `dibuat` | config sudah ada di `file:` |

Contoh terisi: `harian/tips-gaji.md` (→ `src/projects/harian/tips-gaji.ts`).
