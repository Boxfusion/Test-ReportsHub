# POPIA sweep of the evidence screenshots — 2026-08-21

**Type:** Non-run audit · **QA:** Nomfanelo Nhleko

## Why this sweep happened
On 2026-08-20 we established that the registration form's ID lookup is a **live Home Affairs integration**, not a
stub: any Luhn-valid 13-digit SA ID typed into the Office Bearer form returns a **real person's** name, date of
birth and gender, and the on-screen masking is cosmetic — the unmasked name reaches the saved grid
(`bugs/2026-08-20-id-number-lookup-returns-real-identities-masking-is-cosmetic.md`).

Evidence screenshots captured **before** that was understood therefore risked carrying real personal data. Because
GitHub Pages serves this repo from `Boxfusion:main`, anything merged becomes **publicly reachable**. Every candidate
image was reviewed before the 08-17 → 08-21 work was pushed.

## Method
All 66 new evidence images were listed and filtered to the 15 that could plausibly show identity data — office-bearer
grids, the Add/Edit Office Bearer modal, admin OB-compliance views, and the password-reset disclosure screens. Each of
those 14 reachable candidates was opened and read directly.

## Result — 5 images removed
| File | What it exposed |
|---|---|
| `2026-08-17/evidence/v14-ob-grid-no-edit-or-delete.png` | full name + full 13-digit SA ID + DOB + gender + address |
| `2026-08-17/evidence/v16-ob-identity-wiped-after-edit.png` | same identity, same fields |
| `2026-08-18/evidence/v1-office-bearer-survives-tab2-resave.png` | same identity, same fields |
| `2026-08-20/evidence/ob-save-disabled-duplicate-mobile.png` | a second full SA ID, plus an unmasked name in the grid behind the modal |
| `2026-08-20/evidence/tc04-001-step2-ob-tab.png` | full name + full SA ID + DOB + gender + address |

Two distinct real identities recur across these five. **No identity values are transcribed here**, per
`never-record-real-personal-identifiers`.

The findings those five images supported are all still fully described in the body of their run reports, so nothing
substantive is lost — only the pictures.

## Confirmed safe and retained
The other nine candidates were kept after review:
- **08-17 checksum suite** (`v9`, `v10`, `v11`, `v12`, `v15`) — this suite deliberately used **checksum-invalid** IDs,
  so the DHA lookup never resolved. The names on screen are synthetic (`Test Checksum`, `Nomatch Tester`) and the
  identity fields are blank. Note how close the call is: `…9086` is the invalid ID and `…9087` is the one that
  resolves to a real person.
- `08-17/a7`, `08-17/v13` — organisation and financial screens, our own QA data only.
- `08-18/v11` and `v12` (password reset) — masked to `qa.te*******@****ple.org` and `(***)-***-0598`, which is our own
  QA number. No third-party data.
- `08-18/v16`, `08-20/tc07-006` — admin views where the office-bearer list was empty or not open.

## Residual risk and the standing rule
The 51 non-candidate images are wizard, admin, accessibility and security screens; one (`08-17/v13`) was sampled as a
control and was clean. They were filtered by filename rather than opened individually, so a small residual risk
remains. A full pass would need OCR rather than eyes.

🔑 **Going forward:** capture office-bearer evidence via the **passport** route, which does not trigger the identity
lookup, or scroll the grid so the name and ID columns are out of frame — `08-20/tc04-001-step9` is safe for exactly
that reason. Where an SA-ID path must be shown, crop or redact before the file is written.
