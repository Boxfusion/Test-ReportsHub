#!/usr/bin/env node
/**
 * make-bas-text-report.js — build a BAS Report Import file in the **text / "Notepad"** format
 * (RP0111BS "REGISTER OF PAYMENTS"), for the DHA Invoice Tracking BAS Report Import step.
 *
 * The BAS Report Import has a setting for Excel vs Notepad; when it is set to **Notepad** the
 * importer expects this fixed-width .txt layout instead of the .xlsx one.
 *
 * Strategy — edit an existing known-good report IN PLACE (same rule as the .xlsx flow):
 * take a real record from the template and surgically overwrite only the matched fields, so
 * page headers, pagination, region codes, bank lines and the trailer stay byte-identical.
 * Everything is length-preserving: the detail body is always exactly 170 chars and the AMOUNT
 * stays right-aligned ending at column 169.
 *
 * Usage:
 *   node make-bas-text-report.js --payment 2952 --invoice DHA-INV-2952 --supplier KL772 \
 *        --amount 24500 --type SUNDRY --out ../test-data/bas-text-report-PAY2952.txt
 *
 * Options:
 *   --payment   FUNC NO      → becomes the ITS Payment Number (zero-padded to 8)
 *   --invoice   SOURCE DOC NUMBER → matched against the ITS Invoice No   (max 32)
 *   --supplier  ENT NUMBER   → matched against the ITS Supplier No       (max 21)
 *   --amount    invoice amount, plain number (formatted with thousands separators + 2dp)
 *   --type      SOURCE DOC TYPE: SUNDRY for BAS, INV for LOGIS           (default SUNDRY)
 *   --enttype   ENT TYPE: SUNDRY | CSDSUP | LOGSUP | PERSAL | IDNO       (default: keep template's)
 *   --invdate / --capdate / --authdate   dd/mm/yyyy                      (default: keep template's)
 *   --record    which matching record in the template to overwrite, 0-based (default 0)
 *   --template  source report (default: ../test-data/dha-bas-text-report-template-known-good.txt)
 *   --out       output path (required)
 *   --keep-others   leave every other record untouched (default). Use --only to blank the rest.
 *
 * Field geometry (0-based columns, after stripping any leading CSV quote):
 *   FUNC line   : FUNC NO 1-8 | MICR 10-19 | DISB 21-29 | CAPTURE ID 31-42 | AUTHORISE ID 44-55
 *                 | INV RECDTE 57-66 | SOURCE DOC NUMBER 68-99 | PAYSTA 101-106 | PAYMTD 108-113
 *                 | PAYEE NAME 115-147 | INITLS 149+
 *   DETAIL line : ENT TYPE 2-9 | ENT NUMBER 10-30 | CAPTURE DATE 31-40 | AUTH DATE 44-53
 *                 | INV DATE 57-66 | SOURCE DOC TYPE 68-100 | REGION 101-146 | DUP. IND. 147
 *                 | AMOUNT right-aligned, ends at 169
 *
 * CSV-quote rule (must be preserved): a line is wrapped in double quotes **iff** it contains a
 * comma. Verified 947/947 lines in the template, zero exceptions in either direction. Since the
 * quote shifts every column by +1, all editing is done on the unquoted body and re-wrapped after.
 */

const fs = require('fs');
const path = require('path');

// ---------- args ----------
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) {
    const k = a.slice(2);
    const v = (process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) ? process.argv[++i] : true;
    args[k] = v;
  }
}

const DEFAULT_TEMPLATE = path.join(__dirname, '..', 'test-data', 'dha-bas-text-report-template-known-good.txt');
const templatePath = args.template || DEFAULT_TEMPLATE;
const outPath = args.out;

if (!outPath || !args.invoice || !args.supplier || args.amount === undefined || !args.payment) {
  console.error('Missing required option. Need at least: --payment --invoice --supplier --amount --out');
  console.error('Run with no args to see the header comment for full usage.');
  process.exit(1);
}

const srcDocType = String(args.type || 'SUNDRY').toUpperCase();
const recordIndex = parseInt(args.record || '0', 10);

// ---------- helpers ----------
const EOL = '\r\n';

/** strip the CSV quoting, returning the raw fixed-width body */
function unquote(line) {
  return line.startsWith('"') && line.endsWith('"') ? line.slice(1, -1) : line;
}
/** re-apply the template's rule: quote iff the body contains a comma */
function requote(body) {
  return body.includes(',') ? '"' + body + '"' : body;
}
/** overwrite body[start..end] with value, left-aligned, space-padded; length preserved */
function put(body, start, end, value) {
  const width = end - start + 1;
  const v = String(value);
  if (v.length > width) {
    throw new Error(`value ${JSON.stringify(v)} (${v.length}) exceeds field width ${width} at col ${start}`);
  }
  return body.slice(0, start) + v.padEnd(width, ' ') + body.slice(end + 1);
}
/** overwrite body[start..end] with value, right-aligned */
function putRight(body, start, end, value) {
  const width = end - start + 1;
  const v = String(value);
  if (v.length > width) {
    throw new Error(`value ${JSON.stringify(v)} (${v.length}) exceeds field width ${width} at col ${start}`);
  }
  return body.slice(0, start) + v.padStart(width, ' ') + body.slice(end + 1);
}
/** 24500 -> "24,500.00" ; "1234.5" -> "1,234.50" */
function formatAmount(n) {
  const num = Number(String(n).replace(/[, ]/g, ''));
  if (!isFinite(num)) throw new Error(`--amount ${JSON.stringify(n)} is not a number`);
  const [int, dec] = num.toFixed(2).split('.');
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + dec;
}

const COL = {
  func:      [1, 8],
  srcDocNo:  [68, 99],
  entType:   [2, 9],
  entNo:     [10, 30],
  capDate:   [31, 40],
  authDate:  [44, 53],
  invDate:   [57, 66],
  srcDocType:[68, 100],
  amount:    [149, 169],
};

const isFuncLine   = b => /^ \d{8} /.test(b);
const isDetailLine = b => /^  (SUNDRY|CSDSUP|LOGSUP|PERSAL|IDNO)\s/.test(b);

// ---------- load ----------
const raw = fs.readFileSync(templatePath, 'latin1');
const lines = raw.split(EOL);

// ---------- locate candidate records ----------
const records = [];
for (let i = 0; i < lines.length - 1; i++) {
  const b1 = unquote(lines[i]);
  const b2 = unquote(lines[i + 1] || '');
  if (isFuncLine(b1) && isDetailLine(b2)) {
    records.push({ funcIdx: i, detailIdx: i + 1, type: b2.slice(COL.srcDocType[0], COL.srcDocType[1] + 1).trim() });
  }
}
if (!records.length) {
  console.error('No payment records found in template — is it the RP0111BS text report?');
  process.exit(1);
}

const matching = records.filter(r => r.type === srcDocType);
if (!matching.length) {
  console.error(`Template has no record with SOURCE DOC TYPE = ${srcDocType}. Available: ${[...new Set(records.map(r => r.type))].join(', ')}`);
  process.exit(1);
}
const target = matching[recordIndex];
if (!target) {
  console.error(`--record ${recordIndex} out of range; only ${matching.length} ${srcDocType} records.`);
  process.exit(1);
}

// ---------- rewrite the target record ----------
let f = unquote(lines[target.funcIdx]);
let d = unquote(lines[target.detailIdx]);

const beforeF = f, beforeD = d;

const paymentNo = String(args.payment).replace(/\D/g, '').padStart(8, '0');
if (paymentNo.length > 8) throw new Error(`--payment ${args.payment} does not fit FUNC NO (8 digits)`);

f = put(f, ...COL.func, paymentNo);
f = put(f, ...COL.srcDocNo, args.invoice);

d = put(d, ...COL.entNo, args.supplier);
d = put(d, ...COL.srcDocType, srcDocType);
d = putRight(d, ...COL.amount, formatAmount(args.amount));
if (args.enttype)  d = put(d, ...COL.entType,  String(args.enttype).toUpperCase());
if (args.invdate)  d = put(d, ...COL.invDate,  args.invdate);
if (args.capdate)  d = put(d, ...COL.capDate,  args.capdate);
if (args.authdate) d = put(d, ...COL.authDate, args.authdate);

// hard invariants — the importer is column-sensitive
if (f.length !== beforeF.length) throw new Error(`FUNC line length changed ${beforeF.length} -> ${f.length}`);
if (d.length !== beforeD.length) throw new Error(`DETAIL line length changed ${beforeD.length} -> ${d.length}`);
if (d.replace(/\s+$/, '').length - 1 !== 169) {
  throw new Error(`AMOUNT no longer ends at col 169 (ends at ${d.replace(/\s+$/, '').length - 1})`);
}

lines[target.funcIdx]   = requote(f);
lines[target.detailIdx] = requote(d);

fs.writeFileSync(outPath, lines.join(EOL), 'latin1');

// ---------- report ----------
console.log(`template : ${templatePath}`);
console.log(`records  : ${records.length} total, ${matching.length} of type ${srcDocType}`);
console.log(`edited   : record #${recordIndex} of type ${srcDocType} at lines ${target.funcIdx + 1}/${target.detailIdx + 1}`);
console.log(`\n--- before ---\n${requote(beforeF)}\n${requote(beforeD)}`);
console.log(`\n--- after ----\n${requote(f)}\n${requote(d)}`);
console.log(`\nPayment No (FUNC NO)   : ${paymentNo}`);
console.log(`Invoice No (SOURCE DOC): ${args.invoice}`);
console.log(`Supplier No (ENT NUMBER): ${args.supplier}`);
console.log(`Amount                 : ${formatAmount(args.amount)}`);
console.log(`Source Doc Type        : ${srcDocType}`);
console.log(`\nwritten  : ${outPath}`);
console.log(`\nNote: the report trailer total is left untouched (the importer does not validate it).`);
