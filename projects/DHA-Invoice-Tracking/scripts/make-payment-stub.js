#!/usr/bin/env node
/**
 * make-payment-stub.js — build an RP007BS "PAYMENT STUB" .txt for the ITS
 * Payment Stub Import by editing the known-good template in place.
 *
 * The stub is a 102-line fixed-width report. Only the single detail line
 * (line 21) identifies the payment, so that is the only line we touch — every
 * other byte of the template is preserved exactly (CRLF included).
 *
 * Detail line geometry (line is always 128 chars):
 *   cols   3- 36  INVOICE NO      left-aligned
 *   cols  37- 70  PURCHASE ORDER NUMBER  left-aligned — "NOT APPLIC" for BAS,
 *                                 the order no (OR-xxxxxx) for LOGIS
 *   cols  71- 81  PAYMENT NUMBER  left-aligned  (must equal the Payment Number
 *                                 on the invoice: for BAS the value the BAS
 *                                 report import stamped, e.g. 00003035 with its
 *                                 leading zeros; for LOGIS the value captured
 *                                 by hand at Capture & Link, e.g. 3055)
 *   cols  82- 83  "CL"            fixed
 *   cols  94-101  54166624        fixed (account no)
 *   cols 120-128  AMOUNT          right-aligned, thousands-separated, 2 dp
 *
 * BAS matches the stub on the PAYMENT NUMBER; LOGIS matches on the PURCHASE
 * ORDER NUMBER — so a LOGIS stub must pass --po.
 *
 * Usage (BAS):
 *   node scripts/make-payment-stub.js --payment 00003035 --invoice DHA-INV-3035 \
 *     --amount 24500 --out test-data/payment-stub-PAY3035.txt
 *
 * Usage (LOGIS):
 *   node scripts/make-payment-stub.js --payment 3055 --invoice DHA-LOG-3055 \
 *     --po OR-125489 --amount 92 --out test-data/payment-stub-PAY3055-LOGIS.txt
 */

const fs = require('fs');
const path = require('path');

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i].replace(/^--/, '');
  args[k] = process.argv[i + 1];
}

const { payment, invoice, amount, out } = args;
if (!payment || !invoice || !amount || !out) {
  console.error('Missing required option. Need: --payment --invoice --amount --out');
  process.exit(1);
}

// PURCHASE ORDER NUMBER: BAS matches on the payment number and leaves this as
// "NOT APPLIC"; LOGIS matches on the PO, so pass --po OR-xxxxxx for LOGIS.
const po = args.po || 'NOT APPLIC';
if (po.length > 34) {
  console.error(`--po ${po} does not fit the PURCHASE ORDER NUMBER field (34 chars)`);
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const templatePath = args.template
  ? path.resolve(args.template)
  : path.join(root, 'test-data', 'dha-payment-stub-template-known-good.txt');

// latin1 so byte length == string length for the fixed-width maths
const raw = fs.readFileSync(templatePath, 'latin1');
const lines = raw.split(/\r?\n/);
const DETAIL = 20; // 0-based -> line 21
const original = lines[DETAIL];

if (!/NOT APPLIC/.test(original) || original.length !== 128) {
  console.error(`Unexpected template detail line (len ${original.length}):\n${original}`);
  process.exit(1);
}

const put = (line, startCol, value) => {
  const i = startCol - 1;
  return line.slice(0, i) + value + line.slice(i + value.length);
};
const putRight = (line, endCol, value) => {
  const i = endCol - value.length;
  return line.slice(0, i) + value + line.slice(endCol);
};

const money = Number(amount).toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// blank the variable fields, then write them
let line = original;
line = put(line, 3, ' '.repeat(34));    // invoice no field
line = put(line, 37, ' '.repeat(34));   // purchase order number field
line = put(line, 71, ' '.repeat(11));   // payment number field
line = putRight(line, 128, ' '.repeat(9)); // amount field

line = put(line, 3, invoice);
line = put(line, 37, po);               // "NOT APPLIC" for BAS, the order no for LOGIS
line = put(line, 71, payment);
line = putRight(line, 128, money);

if (line.length !== 128) {
  console.error(`Built line is ${line.length} chars, expected 128:\n${line}`);
  process.exit(1);
}

// splice back preserving the original bytes everywhere else
const result = raw.replace(original, line);
if (result === raw) {
  console.error('Detail line replacement did not apply.');
  process.exit(1);
}

const outPath = path.isAbsolute(out) ? out : path.join(root, out);
fs.writeFileSync(outPath, result, 'latin1');

console.log(`template : ${templatePath}`);
console.log('\n--- before ---');
console.log(original);
console.log('\n--- after ----');
console.log(line);
console.log('');
console.log(`Payment Number : ${payment}`);
console.log(`Invoice No     : ${invoice}`);
console.log(`Purchase Order : ${po}`);
console.log(`Amount         : ${money}`);
console.log(`\nwritten  : ${out}  (${result.length} bytes, template ${raw.length})`);
