import React, { useEffect, useState } from 'react';
import { continueRender, delayRender, getInputProps, useCurrentFrame, useVideoConfig } from 'remotion';
import { LEGIBILITY, SAFE_AREA, type FormatName } from '../config';

/**
 * PEMERIKSA TATA LETAK OTOMATIS — hanya aktif bila input props `qc: true`
 * (dipakai `npm run pratinjau`). Tidak menggambar apa pun dan tidak mengubah frame.
 *
 * Setelah frame tersusun, setiap teks yang terlihat diukur lalu dilaporkan lewat
 * console.log('QC|{json}') (ditangkap skrip):
 *   ✗ tepi      teks keluar dari frame
 *   ✗ wadah     teks terpotong oleh wadah ber-overflow hidden
 *   ✗ tumpuk    dua teks berbeda saling menimpa
 *   ! aman      teks konten di zona UI platform (SAFE_AREA; lapisan HUD/watermark dikecualikan)
 *   ! kecil     ukuran huruf < LEGIBILITY.minFontQc (px basis 1080)
 * Elemen yang sedang memudar (opasitas < 0,6) dilewati: pilih frame saat isi sudah tampil penuh.
 *
 * Juga dilaporkan `texts`: teks konten terbesar (ukuran baris px basis 1080 + opasitas efektif, termasuk yang
 * belum tampil) — dipakai `pratinjau` untuk memeriksa apakah elemen utama hook sudah tampil penuh pada 0,6 dtk.
 */
export interface QcIssue {
  kind: 'tepi' | 'wadah' | 'tumpuk' | 'aman' | 'kecil';
  text: string;
  detail: string;
}

const MIN_OPACITY = 0.6;
const TOL = 2;

const snippet = (t: string) => {
  const s = t.replace(/\s+/g, ' ').trim();
  return s.length > 40 ? `${s.slice(0, 38)}…` : s;
};

function effectiveOpacity(el: Element, root: Element): number {
  let o = 1;
  for (let e: Element | null = el; e && e !== root.parentElement; e = e.parentElement) {
    const cs = getComputedStyle(e);
    if (cs.visibility === 'hidden' || cs.display === 'none') return 0;
    o *= Number(cs.opacity || 1);
  }
  return o;
}

interface TextBox {
  el: HTMLElement;
  text: string;
  rect: { left: number; top: number; right: number; bottom: number };
  overlay: boolean;
}

function collect(root: HTMLElement): TextBox[] {
  const out: TextBox[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const byEl = new Map<HTMLElement, TextBox>();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent ?? '';
    if (!text.trim()) continue;
    const el = n.parentElement;
    if (!el || el.closest('svg') || effectiveOpacity(el, root) < MIN_OPACITY) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0 && r.height > 0);
    if (!rects.length) continue;
    const r = {
      left: Math.min(...rects.map((x) => x.left)),
      top: Math.min(...rects.map((x) => x.top)),
      right: Math.max(...rects.map((x) => x.right)),
      bottom: Math.max(...rects.map((x) => x.bottom)),
    };
    const prev = byEl.get(el);
    if (prev) {
      prev.text += text;
      prev.rect = {
        left: Math.min(prev.rect.left, r.left),
        top: Math.min(prev.rect.top, r.top),
        right: Math.max(prev.rect.right, r.right),
        bottom: Math.max(prev.rect.bottom, r.bottom),
      };
      continue;
    }
    const box = { el, text, rect: r, overlay: Boolean(el.closest('[data-qc="overlay"]')) };
    byEl.set(el, box);
    out.push(box);
  }
  return out;
}

/** Teks konten (bukan HUD/subtitle/watermark) + ukuran baris (px basis 1080) + opasitas efektif. */
export interface QcText {
  t: string;
  s: number;
  o: number;
}

/** Teks konten terbesar di frame, termasuk yang masih transparan (maks `limit`). */
export function scanTexts(root: HTMLElement, width: number, height: number, limit = 16): QcText[] {
  const k = Math.min(width, height) / 1080;
  const byEl = new Map<Element, QcText>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent ?? '';
    const el = n.parentElement;
    if (!el || !/[\p{L}\p{N}]/u.test(text) || el.closest('[data-qc="overlay"]')) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0 && r.height > 0);
    if (!rects.length) continue;
    const size = Math.max(...rects.map((r) => r.height)) / k;
    const prev = byEl.get(el);
    if (prev) {
      prev.t += text;
      prev.s = Math.max(prev.s, size);
      continue;
    }
    byEl.set(el, { t: text, s: size, o: effectiveOpacity(el, root) });
  }
  return [...byEl.values()]
    .map((x) => ({ t: snippet(x.t), s: Math.round(x.s), o: Math.round(x.o * 100) / 100 }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit);
}

export function scanLayout(root: HTMLElement, width: number, height: number, format: FormatName): QcIssue[] {
  const issues: QcIssue[] = [];
  const base = root.getBoundingClientRect();
  const k = Math.min(width, height) / 1080;
  const safe = SAFE_AREA[format];
  const boxes = collect(root).map((b) => ({
    ...b,
    rect: { left: b.rect.left - base.left, top: b.rect.top - base.top, right: b.rect.right - base.left, bottom: b.rect.bottom - base.top },
  }));
  const seen = new Set<string>();
  const add = (i: QcIssue) => {
    const key = `${i.kind}|${i.text}`;
    if (!seen.has(key)) {
      seen.add(key);
      issues.push(i);
    }
  };

  for (const b of boxes) {
    const t = snippet(b.text);
    const { left, top, right, bottom } = b.rect;
    if (left < -TOL || top < -TOL || right > width + TOL || bottom > height + TOL) {
      add({ kind: 'tepi', text: t, detail: `kotak teks ${Math.round(left)},${Math.round(top)}–${Math.round(right)},${Math.round(bottom)}` });
    }
    // Terpotong wadah: leluhur dengan overflow selain visible yang lebih sempit dari teksnya.
    for (let e = b.el.parentElement; e && e !== root; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.overflow === 'visible' && cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      const r = e.getBoundingClientRect();
      const box = { left: r.left - base.left, top: r.top - base.top, right: r.right - base.left, bottom: r.bottom - base.top };
      if (left < box.left - TOL || right > box.right + TOL || top < box.top - TOL || bottom > box.bottom + TOL) {
        add({ kind: 'wadah', text: t, detail: 'terpotong wadah (overflow hidden)' });
        break;
      }
    }
    if (!b.overlay) {
      const sx = safe.x * k;
      if (left < sx - TOL || right > width - sx + TOL || top < safe.top * k - TOL || bottom > height - safe.bottom * k + TOL) {
        add({ kind: 'aman', text: t, detail: 'di luar area aman (tertutup UI Reels/TikTok/Shorts?)' });
      }
    }
    const fs = parseFloat(getComputedStyle(b.el).fontSize) / k;
    // Emoji/ikon tanpa huruf/angka tidak perlu dibaca; pil brand HUD/watermark memang kecil.
    if (!b.overlay && /[\p{L}\p{N}]/u.test(b.text) && fs < LEGIBILITY.minFontQc - 0.5) add({ kind: 'kecil', text: t, detail: `${Math.round(fs)} px (basis 1080; min ${LEGIBILITY.minFontQc})` });
  }

  // Tumpuk: dua teks (berhuruf) yang bukan leluhur/keturunan satu sama lain, irisan > 25% kotak terkecil,
  // dan tidak satu pun tertutup lapisan buram (mis. notifikasi di atas layar ponsel = disengaja).
  const readable = boxes.filter((b) => /[\p{L}\p{N}]/u.test(b.text));
  for (let i = 0; i < readable.length; i++) {
    for (let j = i + 1; j < readable.length; j++) {
      const a = readable[i];
      const b = readable[j];
      if (a.el.contains(b.el) || b.el.contains(a.el) || a.text.trim() === b.text.trim()) continue;
      const w = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left);
      const h = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top);
      if (w <= 0 || h <= 0) continue;
      const area = (r: TextBox['rect']) => (r.right - r.left) * (r.bottom - r.top);
      if ((w * h) / Math.min(area(a.rect), area(b.rect)) <= 0.25) continue;
      const cx = base.left + Math.max(a.rect.left, b.rect.left) + w / 2;
      const cy = base.top + Math.max(a.rect.top, b.rect.top) + h / 2;
      if (occluded(document.elementFromPoint(cx, cy), a.el, b.el)) continue;
      add({ kind: 'tumpuk', text: `${snippet(a.text)} ⟷ ${snippet(b.text)}`, detail: 'teks saling menimpa' });
    }
  }
  return issues;
}

/** Elemen teratas di titik irisan berada di dalam lapisan buram (bg ≥ 85%) di atas salah satu teks? */
function occluded(top: Element | null, a: Element, b: Element): boolean {
  if (!top) return false;
  let common: Element | null = a.parentElement;
  while (common && !common.contains(b)) common = common.parentElement;
  for (let e: Element | null = top; e && e !== common; e = e.parentElement) {
    const cs = getComputedStyle(e);
    const m = /rgba?\(([^)]+)\)/.exec(cs.backgroundColor);
    const alpha = m ? Number(m[1].split(',')[3] ?? 1) : 0;
    if (alpha >= 0.85 || (cs.backgroundImage && cs.backgroundImage !== 'none')) {
      // Lapisan buram itu hanya menutupi bila ia bukan wadah dari kedua teks sekaligus.
      if (!(e.contains(a) && e.contains(b))) return true;
    }
  }
  return false;
}

/** Pasang di dalam MotionVideo. Diam (render null) kecuali input props `qc: true`. */
export const QualityCheck: React.FC<{ format: FormatName }> = ({ format }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const enabled = Boolean((getInputProps() as { qc?: boolean }).qc);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!enabled || !ref) return;
    const handle = delayRender('QC tata letak');
    let raf = 0;
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        continueRender(handle);
      }
    };
    document.fonts.ready.then(() => {
      if (done) return;
      // Dua frame animasi: pastikan tata letak & font sudah final.
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          const root = ref.parentElement as HTMLElement;
          // elementFromPoint melewati elemen ber-pointer-events: none (lapisan overlay) → aktifkan sementara.
          const style = document.createElement('style');
          style.textContent = '*{pointer-events:auto!important}';
          document.head.appendChild(style);
          try {
            console.log(`QC|${JSON.stringify({ frame, issues: scanLayout(root, width, height, format), texts: scanTexts(root, width, height) })}`);
          } finally {
            style.remove();
            finish();
          }
        });
      });
    });
    return () => {
      cancelAnimationFrame(raf);
      finish();
    };
  }, [enabled, ref, frame, width, height, format]);
  return enabled ? <div ref={setRef} style={{ display: 'none' }} /> : null;
};
