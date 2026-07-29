# BAS Report Import — text / "Notepad" format (RP0111BS)

The BAS Report Import step has a **setting for Excel vs Notepad**. As of **2026-07-28 the setting on
TEST is *Notepad***, so the importer expects this fixed-width `.txt` layout instead of the `.xlsx`
one documented in the QA notes.

- **Known-good template:** [`dha-bas-text-report-template-known-good.txt`](dha-bas-text-report-template-known-good.txt)
  (source: `REG JULY 26.txt`, supplied by the test lead — a real DHA production-shaped export,
  authorisation dates 01/07/2026–20/07/2026, generated 20/07/2026 10:05:23)
- **Generator:** [`../scripts/make-bas-text-report.js`](../scripts/make-bas-text-report.js)

## Report identity

| | |
|---|---|
| Report code | **RP0111BS** — "REGISTER OF PAYMENTS" (the `.xlsx` variant was a "BAS Payment Register") |
| Installation / Location | NAT: HOME AFFAIRS |
| User ID | 18699456 |
| Encoding | ASCII, **CRLF** line endings |
| Size | 4 074 lines, 93 pages, **1 102 payment records** |
| Trailer | grand total `1,373,562,041.63`, then `* = REROUTED CREDIT TRANSFERS`, then `**** END OF REPORT RP0111BS ****` |

## Structure

Page 1 is a **report introductory page** (selection criteria). Pages 2+ each hold **12 payment
records** in 44 lines: 3 title lines, 2 blank, 3 column-header lines (labels ×2 + dashed ruler),
then 36 record lines.

Each payment record is **3 consecutive lines**:

```
 05433786 0000000000 000015559 18576401     18576401     18/03/2026 KT9394                           PRINTD EBT    AE SOFTWARE SOLUTIONS      <- FUNC line
"  CSDSUP  MAAA0005786          14/07/2026   14/07/2026   10/03/2026 INV                              1810313001                                    N             12,178.50"   <- DETAIL line
  BANK: STANDARD BANK OF SOUTH AFRICA    BRANCH: MAFIKENG                         ACCNO: 031947492       ACCOUNT TPE: CURRENT ACCOUNT          <- BANK line
```

## ⚠️ The CSV-quote rule

**A line is wrapped in double quotes if and only if it contains a comma.** Verified across the whole
template: 947 quoted lines, 947 of them contain a comma, 0 quoted lines without one, 0 unquoted lines
with one. In practice this means **any record whose amount ≥ 1 000 is quoted** (thousands separator).

Because the leading `"` shifts every column by +1, **always edit the unquoted body and re-apply the
quoting afterwards**, based on whether the finished body contains a comma. Getting this wrong
silently misaligns every field on that line.

## Column geometry (0-based, after stripping any leading quote)

### FUNC line

| Field | Cols | Width | Notes |
|---|---|---|---|
| **FUNC NO** | 1–8 | 8 | → becomes the ITS **Payment Number** (zero-padded, e.g. `00002952`) |
| MICR NO | 10–19 | 10 | `0000000000` in every observed row |
| DISB NO | 21–29 | 9 | |
| CAPTURE ID | 31–42 | 12 | user id or surname |
| AUTHORISE ID | 44–55 | 12 | |
| INV RECDTE | 57–66 | 10 | `dd/mm/yyyy` |
| **SOURCE DOC NUMBER** | 68–99 | 32 | → matched against the ITS **Invoice No** |
| PAYSTA | 101–106 | 6 | PAID 837 / PRINTD 253 / AUTH 9 / TOREJ 2 / CANCEL 1 |
| PAYMTD | 108–113 | 6 | `EBT`; a trailing `*` marks a rerouted credit transfer |
| PAYEE NAME | 115–147 | 33 | |
| INITLS | 149+ | | usually blank |

### DETAIL line — always exactly **170** chars

| Field | Cols | Width | Notes |
|---|---|---|---|
| ENT TYPE | 2–9 | 8 | CSDSUP 874 / SUNDRY 173 / LOGSUP 44 / IDNO 8 / PERSAL 3 |
| **ENT NUMBER** | 10–30 | 21 | → matched against the ITS **Supplier No**. CSD suppliers are `MAAA…` (11 chars); LOGIS suppliers are short codes like `A1960` — the same shape as our TEST supplier **KL772** |
| CAPTURE DATE | 31–40 | 10 | |
| AUTH DATE | 44–53 | 10 | |
| INV DATE | 57–66 | 10 | |
| **SOURCE DOC TYPE** | 68–100 | 33 | **`SUNDRY` for BAS** (272 rows), **`INV` for LOGIS** (830 rows) |
| REGION | 101–146 | 46 | e.g. `HEAD OFFICE`, or a functional-area code for INV rows |
| DUP. IND. | 147 | 1 | `Y` / `N` / blank |
| **AMOUNT** | 149–169 | 21 | **right-aligned, always ends at column 169**; thousands separators + 2dp |

> The ruler on the header line shows 10 dashes under ENT NUMBER and 6 under REGION, but those
> line-2 fields are genuinely wider — the line-1 columns above them (DISB NO, PAYMTD) are blank on
> the detail line. Don't derive line-2 widths from the ruler; use the table above.

## Match key

Same as the `.xlsx` flow: the importer matches a pending payment on **Invoice No + Supplier No +
Amount**, and stamps **FUNC NO** onto the invoice as its Payment Number. `SOURCE DOC TYPE` must be
`SUNDRY` for a BAS request and `INV` for a LOGIS one.

## Generating an import file

Edit the template **in place** so pagination, region codes, bank lines and the trailer stay
byte-identical — only the target record's two lines change:

```bash
node scripts/make-bas-text-report.js \
  --payment 2952 --invoice DHA-INV-2952 --supplier KL772 --amount 24500 \
  --type SUNDRY --invdate 27/07/2026 --capdate 28/07/2026 --authdate 28/07/2026 \
  --out test-data/bas-text-report-PAY2952.txt
```

The script enforces the invariants (170-char detail body, amount ending at col 169, quote rule,
unchanged line lengths) and aborts rather than emitting a misaligned file. It prints a before/after
diff of the edited record.

The report trailer total is deliberately **not** recalculated — as with the `.xlsx` flow the importer
does not validate it. If a future import fails validation, that's the first thing to revisit.

## Still to confirm live (blocked by the Register & Upload 500)

1. That the importer accepts this file and reports `Is Success = Yes` / `Payments Authorised = 1`.
2. Whether **ENT TYPE** must agree with the supplier's type (e.g. `LOGSUP` for a `KL772`-style code
   vs the template's `SUNDRY`) or is ignored in favour of ENT NUMBER. The generator keeps the
   template's value unless `--enttype` is passed.
3. Whether the Notepad/Excel setting is per-environment or global, and where it is configured.
4. Whether the **Payment Stub** import (RP007BS) is affected by the same setting — it was already a
   fixed-width `.txt`, so probably not.
