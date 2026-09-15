/*
 * Extract the text of a Shesha-generated PDF letter, for suite 14T content verification.
 *
 * Why: the 14T templates put almost nothing in the email body — the prescribed fields
 * (change type, submission date, deadlines, appeal rights) live in the attached PDF.
 * Judging a template on its email body alone produces a FALSE FAIL; that cost 3 wrong
 * verdicts on 2026-08-24.
 *
 * Getting the input, from the browser with an authenticated session:
 *   1. find the attachment:
 *      GET /api/dynamic/Shesha/NotificationMessageAttachment/Crud/GetAll
 *            ?filter={"and":[{"==":[{"var":"message.Id"},"<notificationId>"]}]}
 *      -> file.id is the StoredFile id
 *   2. download it and save the base64 (browser_evaluate with `filename:`, or any fetch):
 *      GET /api/StoredFile/Download?id=<fileId>
 *
 * Usage:
 *   node scripts/extract-pdf-text.js <saved-b64-file> [<out.pdf>]
 *
 * Accepts either the raw base64 or the JSON blob a browser_evaluate result is saved as
 * (it looks for a "b64" field first). Most streams are FlateDecode-compressed.
 */
const fs = require('fs'), zlib = require('zlib');

const raw = fs.readFileSync(process.argv[2], 'utf8');
// the evaluation result is JSON-ish; grab the b64 field
let b64 = null;
const m = raw.match(/"b64"\s*:\s*"([A-Za-z0-9+/=\s]+)"/);
if (m) b64 = m[1].replace(/\s+/g, '');
else b64 = raw.replace(/[^A-Za-z0-9+/=]/g, '');
const buf = Buffer.from(b64, 'base64');
console.log('pdf bytes:', buf.length, ' header:', buf.slice(0, 8).toString('latin1'));

const outDir = process.argv[3];
if (outDir) fs.writeFileSync(outDir, buf);

const bin = buf.toString('latin1');
const chunks = [];

// raw (uncompressed) streams + inflated ones
const re = /stream\r?\n?([\s\S]*?)endstream/g;
let mm, n = 0, inflated = 0;
while ((mm = re.exec(bin)) !== null) {
  n++;
  const data = Buffer.from(mm[1], 'latin1');
  let text = null;
  for (const fn of [zlib.inflateSync, zlib.inflateRawSync]) {
    try { text = fn(data).toString('latin1'); inflated++; break; } catch (e) {}
  }
  if (!text) text = data.toString('latin1');
  chunks.push(text);
}
console.log('streams:', n, ' inflated:', inflated);

const all = chunks.join('\n');

// Tj / TJ operands
const out = [];
const tj = /\(((?:\\.|[^()\\])*)\)\s*Tj/g;
const TJ = /\[((?:[^\[\]]|\\.)*)\]\s*TJ/g;
let k;
while ((k = tj.exec(all)) !== null) out.push(unesc(k[1]));
while ((k = TJ.exec(all)) !== null) {
  const parts = [];
  const inner = /\(((?:\\.|[^()\\])*)\)/g;
  let p;
  while ((p = inner.exec(k[1])) !== null) parts.push(unesc(p[1]));
  out.push(parts.join(''));
}

function unesc(s) {
  return s.replace(/\\([nrtbf()\\])/g, (_, c) => ({ n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' }[c] || c))
          .replace(/\\([0-7]{1,3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)));
}

console.log('--- extracted text operands:', out.length, '---');
console.log(out.join('\n'));
