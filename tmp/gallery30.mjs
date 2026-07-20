import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC = 'images/Galerie';
const OUT = 'public/images';

// gleiche Sortierung wie contact.mjs -> Indizes stabil
const files = fs.readdirSync(SRC).filter(f => /\.(jpe?g|png)$/i.test(f)).sort();
if (files.length !== 30) throw new Error('erwarte 30, habe ' + files.length);

// Reihenfolge per Index (siehe Kontaktbogen):
// Laden zuerst (Fassade, Eingang, Vinothek, Pizzaiolo, Gastraum), dann Essen durchmischt
const order = [
  29, 1, 0, 2, 3,
  28, 6, 13, 4, 17,
  12, 9, 22, 15, 11,
  7, 26, 20, 14, 18,
  23, 8, 25, 5, 27,
  21, 10, 16, 19, 24,
];
if (order.length !== 30 || new Set(order).size !== 30) throw new Error('order fehlerhaft');

// Sonderfaelle: bestimmte Hochformat-Fotos ins Querformat schneiden (4:3, vertikaler Offset 0..1)
const cropLandscape = { 19: 0.28 };

for (let i = 0; i < order.length; i++) {
  const slot = i + 1;
  const pad = String(slot).padStart(2, '0');
  const src = path.join(SRC, files[order[i]]);
  let pipe = sharp(src).rotate();
  if (cropLandscape[slot] !== undefined) {
    const m = await sharp(src).rotate().metadata();
    const h = Math.round(m.width * 3 / 4);
    const top = Math.round((m.height - h) * cropLandscape[slot]);
    pipe = sharp(src).rotate().extract({ left: 0, top, width: m.width, height: h });
  }
  await pipe
    .resize(1080, 1080, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(`${OUT}/galerie-${pad}.webp`);
  console.log(pad, '<-', files[order[i]]);
}
console.log('DONE 30 Galeriebilder');
